import {IFilterOptions, ISourceOptions} from 'Controls/interface';
import {error as dataSourceError} from 'Controls/dataSource';
import {Controller as SourceController} from 'Controls/source';
import {RecordSet, List} from 'Types/collection';
import {Model} from 'Types/entity';
import {Logger} from 'UI/Utils';
import ToSourceModel = require('Controls/Utils/ToSourceModel');
import {isEqual} from 'Types/object';
import {object} from 'Types/util';

type Key = string|number|null;
export type SelectedItems = RecordSet|List<Model>;

export interface ILookupBaseControllerOptions extends IFilterOptions, ISourceOptions {
    selectedKeys: Key[];
    dataLoadCallback?: Function;
    multiSelect: boolean;
    displayProperty: string;
    historyId: string;
}

const clone = object.clone;

export default class LookupBaseControllerClass {
    private _options: ILookupBaseControllerOptions;
    private _selectedKeys: Key[];
    private _sourceController: typeof SourceController;
    private _items: RecordSet|List<Model>;
    private _historyServiceLoad: Promise<unknown>;

    constructor(options: ILookupBaseControllerOptions) {
        this._options = options;
        this._selectedKeys = options.selectedKeys.slice();
    }

    update(newOptions: ILookupBaseControllerOptions): Promise<RecordSet>|boolean {
        const keysChanged = newOptions.selectedKeys !== this._options.selectedKeys &&
                            !isEqual(newOptions.selectedKeys, this.getSelectedKeys());
        const sourceIsChanged = newOptions.source !== this._options.source;
        const isKeyPropertyChanged = newOptions.keyProperty !== this._options.keyProperty;
        let updateResult;

        this._options = newOptions;

        if (sourceIsChanged) {
            this._sourceController = null;
        }

        if (keysChanged || sourceIsChanged) {
            this._setSelectedKeys(newOptions.selectedKeys.slice());
        } else if (isKeyPropertyChanged) {
            const selectedKeys = [];
            this._getItems().each((item) => {
                selectedKeys.push(item.get(newOptions.keyProperty));
            });
            this._setSelectedKeys(selectedKeys);
        }

        if (!newOptions.multiSelect && this._selectedKeys.length > 1) {
            this._clearItems();
            updateResult = true;
        } else if (sourceIsChanged || keysChanged) {
            if (this._selectedKeys.length) {
                updateResult = this.loadItems();
            } else if (keysChanged) {
                this._clearItems();
                updateResult = true;
            }
        }

        return updateResult;
    }

    loadItems(): Promise<RecordSet | null>{
        const options = this._options;
        const filter = {...options.filter};
        const keyProperty = options.keyProperty;

        filter[keyProperty] = this._selectedKeys;

        return this._getSourceController().load(filter).then(
            (items) => {
                LookupBaseControllerClass.checkLoadedItems(items, this._selectedKeys, keyProperty);

                if (options.dataLoadCallback) {
                    options.dataLoadCallback(items);
                }

                return items;
            },
            (error) => {
                dataSourceError.process({error});
                return null;
            }
        );
    }

    setItems(items: SelectedItems): void {
        const selectedKeys = [];

        items.each((item) => {
            selectedKeys.push(item.get(this._options.keyProperty));
        });

        this._setItems(items);
        this._setSelectedKeys(selectedKeys);
    }

    getItems(): SelectedItems {
        return this._getItems();
    }

    setItemsAndSaveToHistory(items: SelectedItems): void|Promise<unknown> {
        this.setItems(this._prepareItems(items));
        if (items && items.getCount() && this._options.historyId) {
            return this._getHistoryService().then((historyService) => {
                // @ts-ignore
                historyService.update({ids: this._selectedKeys}, {$_history: true});
                return historyService;
            });
        }
    }

    addItem(item: Model): boolean {
        const key = item.get(this._options.keyProperty);
        const newItems = [item];
        let isChanged = false;

        if (!this.getSelectedKeys().includes(key)) {
            const items = clone(this._getItems());
            let selectedKeys = this.getSelectedKeys().slice();

            isChanged = true;

            if (this._options.multiSelect) {
                selectedKeys.push(key);
                items.append(newItems);
            } else {
                selectedKeys = [key];
                items.assign(newItems);
            }

            this._setItems(this._prepareItems(items));
            this._setSelectedKeys(selectedKeys);
        }

        return isChanged;
    }

    removeItem(item: Model): boolean {
        const keyProperty = this._options.keyProperty;
        const key = item.get(keyProperty);
        let isChanged = false;
        let selectedKeys = this.getSelectedKeys();

        if (selectedKeys.includes(key)) {
            const selectedItems = clone(this._getItems());

            isChanged = true;
            selectedKeys = selectedKeys.slice();
            selectedKeys.splice(selectedKeys.indexOf(key), 1);
            selectedItems.removeAt(selectedItems.getIndexByValue(keyProperty, key));

            this._setSelectedKeys(selectedKeys);
            this._setItems(selectedItems);
        }

        return isChanged;
    }

    getSelectedKeys(): Key[] {
        return this._selectedKeys;
    }

    getTextValue(): string {
        const stringValues = [];
        this._getItems().each((item) => {
            stringValues.push(item.get(this._options.displayProperty));
        });
        return stringValues.join(', ');
    }

    private _setSelectedKeys(keys: Key[]): void {
        this._selectedKeys = keys;
    }

    private _setItems(items: SelectedItems): void {
        this._items = items;
    }

    private _clearItems(): void {
        this._setItems(new List());
    }

    private _getItems(): SelectedItems {
        if (!this._items) {
            this._items = new List();
        }
        return this._items;
    }

    private _prepareItems(items: SelectedItems): SelectedItems {
        return ToSourceModel(items, this._options.source, this._options.keyProperty);
    }

    private _getSourceController(): typeof SourceController {
        if (!this._sourceController) {
            this._sourceController =  new SourceController({
                source: this._options.source
            });
        }
        return this._sourceController;
    }

    private _getHistoryService(): Promise<unknown> {
        if (!this._historyServiceLoad) {
            this._historyServiceLoad =  import('Controls/suggestPopup').then(({LoadService}) => {
                return LoadService({historyId: this._options.historyId});
            });
        }
        return this._historyServiceLoad;
    }

    private static checkLoadedItems(
        items: RecordSet,
        selectedKeys: Key[],
        keyProperty: string
    ): void {
        items.each((item) => {
            if (selectedKeys.indexOf(item.get(keyProperty)) === -1) {
                Logger.error(`Controls/lookup: ошибка при загрузке записи с ключом ${item.get(keyProperty)}`);
            }
        });
    }
}
