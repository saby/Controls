import {IFilterOptions, ISourceOptions, TKey} from 'Controls/interface';
import {error as dataSourceError, NewSourceController as SourceController} from 'Controls/dataSource';
import {RecordSet, List} from 'Types/collection';
import {Model} from 'Types/entity';
import {Logger} from 'UI/Utils';
import {ToSourceModel} from 'Controls/_lookup/resources/ToSourceModel';
import {isEqual} from 'Types/object';
import {object} from 'Types/util';
import { constants } from 'Env/Constants';

type Key = string|number|null;
export type SelectedItems = RecordSet|List<Model>|List<void>;

export interface ILookupBaseControllerOptions extends IFilterOptions, ISourceOptions {
    selectedKeys: Key[];
    dataLoadCallback?: Function;
    dataLoadErrback?: Function;
    multiSelect: boolean;
    displayProperty: string;
    historyId: string;
    items?: RecordSet;
}

const clone = object.clone;

export default class LookupBaseControllerClass {
    private _options: ILookupBaseControllerOptions;
    private _selectedKeys: Key[];
    private _sourceController: SourceController;
    private _items: SelectedItems;
    private _historyServiceLoad: Promise<unknown>;

    constructor(options: ILookupBaseControllerOptions) {
        this._options = options;
        this._setSelectedKeys(options.selectedKeys ? options.selectedKeys.slice() : []);
    }

    update(newOptions: ILookupBaseControllerOptions): Promise<RecordSet>|boolean {
        const hasSelectedKeysInOptions = newOptions.selectedKeys !== undefined;
        const itemsChanged = this._options.items !== newOptions.items && this._items !== newOptions.items;
        let keysChanged;

        if (hasSelectedKeysInOptions) {
            keysChanged = !isEqual(newOptions.selectedKeys, this._options.selectedKeys) ||
                          !isEqual(newOptions.selectedKeys, this.getSelectedKeys());
        }

        const sourceIsChanged = newOptions.source !== this._options.source;
        const isKeyPropertyChanged = newOptions.keyProperty !== this._options.keyProperty;
        let updateResult;

        this._options = newOptions;

        if (sourceIsChanged && this._sourceController) {
            this._sourceController.destroy();
            this._sourceController = null;
        }

        if (itemsChanged) {
            this._setItems(newOptions.items);
            updateResult = true;
        }

        if (keysChanged || sourceIsChanged && hasSelectedKeysInOptions) {
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
                if (this._needLoadItems() || sourceIsChanged) {
                    updateResult = this.loadItems();
                }
            } else if (keysChanged && this.getItems().getCount()) {
                this._clearItems();
                updateResult = true;
            }
        }

        return updateResult;
    }

    loadItems(): Promise<SelectedItems|Error> {
        const options = this._options;
        const filter = {...options.filter};
        const keyProperty = options.keyProperty;

        filter[keyProperty] = this._selectedKeys;

        const sourceController = this._getSourceController();
        sourceController.setFilter(filter);
        return sourceController.load().then(
            (items) => {
                if (!constants.isProduction) {
                    this._checkLoadedItems(items as RecordSet, this._selectedKeys, keyProperty);
                }

                if (options.dataLoadCallback) {
                    options.dataLoadCallback(items);
                }

                return items;
            },
            (error) => {
                dataSourceError.process({error});
                return new List();
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
        if (keys.length > 1 && !this._options.multiSelect) {
            Logger.error('Controls/lookup: передано несколько ключей в опции selectedKeys для поля с единичным выбором (опция multiSelect: false)');
        }
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

    private _getSourceController(): SourceController {
        if (!this._sourceController) {
            this._sourceController =  new SourceController({
                source: this._options.source,
                keyProperty: this._options.keyProperty
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

    private _needLoadItems(): boolean {
        const items = this._getItems();
        const selectedKeys = this.getSelectedKeys();

        return (items.getCount() !== selectedKeys.length) || this.getSelectedKeys().some((key) => {
            return items.getIndexByValue(this._options.keyProperty, key) === -1;
        });
    }

    private _checkLoadedItems(
        items: RecordSet,
        selectedKeys: Key[],
        keyProperty: string
    ): void {
        const processError = (message: string) => {
            if (this._options.dataLoadErrback) {
                const error = new Error(message);
                error.name = 'lookupKeyError';
                this._options.dataLoadErrback(error);
            } else {
                Logger.error(message);
            }
        };
        items.each((item) => {
            const key = item.get(keyProperty);
            if (selectedKeys.indexOf(key) === -1) {
                processError(`Controls/lookup: ошибка при загрузке записи с ключом ${key}.
                              Необходимо проверить, что метод корректно вернул данные.`);
            }
        });
        selectedKeys.forEach((key) => {
            if (items.getIndexByValue(keyProperty, key) === -1) {
                processError(`Controls/lookup: ошибка при загрузке записи с ключом ${key}.
                              Необходимо проверить, что метод корректно вернул данные.`);
            }
        });
    }
}
