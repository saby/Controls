import {Control, IControlOptions} from 'UI/Base';
import {RecordSet, List} from 'Types/collection';
import {default as LookupController, ILookupBaseControllerOptions, SelectedItems} from './BaseControllerClass';
import {SyntheticEvent} from 'Vdom/Vdom';
import {descriptor, Model} from 'Types/entity';
import {IStackPopupOptions} from 'Controls/_popup/interface/IStack';
import {TKey} from 'Controls/interface';
// @ts-ignore
import * as isEmpty from 'Core/helpers/Object/isEmpty';
import * as ArrayUtil from 'Controls/Utils/ArraySimpleValuesUtil';

type LookupReceivedState = SelectedItems|null;

export interface ILookupOptions extends ILookupBaseControllerOptions, IControlOptions {
    maxVisibleItems?: number;
    items?: RecordSet;
}

export default abstract class
    BaseLookup<T extends ILookupOptions> extends Control<T, LookupReceivedState> {
    protected _lookupController: LookupController;
    protected _items: SelectedItems;

    protected _beforeMount(
        options: ILookupOptions,
        context: object,
        receivedState: LookupReceivedState
    ): Promise<LookupReceivedState> | void {
        this._lookupController = new LookupController(options);

        if (receivedState && !isEmpty(receivedState)) {
            this._setItems(receivedState);
            this._inheritorBeforeMount(options);
        } else if (options.items) {
            this._setItems(options.items);
            this._inheritorBeforeMount(options);
        } else if (options.selectedKeys && options.selectedKeys.length && options.source) {
            return this._lookupController.loadItems().then((items) => {
                this._setItems(items);
                this._inheritorBeforeMount(options);
                return items;
            });
        } else {
            this._items = this._lookupController.getItems();
            this._inheritorBeforeMount(options);
        }
    }

    protected _beforeUpdate(newOptions: ILookupOptions): Promise<SelectedItems>|void|boolean {
        const updateResult = this._lookupController.update(newOptions);
        const updateResultCallback = () => {
            this._afterItemsChanged();
        };

        if (updateResult instanceof Promise) {
            updateResult.then((items) => {
                // Проверка items.getCount() удалена в 21.1000 https://online.sbis.ru/opendoc.html?guid=c193438b-54d5-4e13-83d3-5edde27abe84
                if (items.getCount() || newOptions.task1180631048) {
                    this._lookupController.setItems(items);
                    updateResultCallback();
                }
            });
        } else if (updateResult) {
            updateResultCallback();
        }
        this._inheritorBeforeUpdate(newOptions);
        return updateResult;
    }

    protected _updateItems(items: RecordSet|List<Model>): void {
        this._lookupController.setItems(items);
        this._afterItemsChanged();
    }

    protected _addItem(item: Model): void {
        if (this._lookupController.addItem(item)) {
            this._afterItemsChanged();
        }
    }

    protected _removeItem(item: Model): void {
        if (this._lookupController.removeItem(item)) {
            this._afterItemsChanged();
        }
    }

    protected _showSelector(event: SyntheticEvent, popupOptions?: IStackPopupOptions): void|boolean {
        if (this._notify('showSelector') !== false) {
            return this.showSelector(popupOptions);
        }

        return false;
    }

    protected _closeHandler(): void {
        this.activate();
    }

    protected _selectCallback(event: SyntheticEvent, result: SelectedItems): void {
        const selectResult =
            this._notify('selectorCallback', [this._lookupController.getItems(), result]) ||
            result;
        if (this._options.value) {
            this._notify('valueChanged', ['']);
        }
        this._lookupController.setItemsAndSaveToHistory(selectResult as SelectedItems);
        this._afterItemsChanged();
    }

    protected _getSelectedKeys(options: ILookupOptions): TKey[] {
        let selectedKeys;

        if (options.selectedKeys !== undefined) {
            selectedKeys = options.selectedKeys;
        } else {
            selectedKeys = this._lookupController.getSelectedKeys();
        }

        return selectedKeys;
    }

    private _afterItemsChanged(): void {
        this._itemsChanged(this._items = this._lookupController.getItems());
        this._notifyChanges();
    }

    private _setItems(items: SelectedItems): void {
        this._items = items;
        this._lookupController.setItems(items);
    }

    private _notifyChanges(): void {
        const controller = this._lookupController;
        const newSelectedkeys = controller.getSelectedKeys();
        const selectedKeysDiff = ArrayUtil.getArrayDifference(this._getSelectedKeys(this._options), newSelectedkeys);
        this._notify('selectedKeysChanged', [newSelectedkeys, selectedKeysDiff.added, selectedKeysDiff.removed]);
        this._notify('itemsChanged', [controller.getItems()]);
        this._notify('textValueChanged', [controller.getTextValue()]);
    }

    abstract showSelector(popupOptions?: IStackPopupOptions): void;

    protected abstract _inheritorBeforeMount(options: ILookupOptions): void;

    protected abstract _inheritorBeforeUpdate(options: ILookupOptions): void;

    protected abstract _itemsChanged(items: SelectedItems): void;

    static _theme: string[] = ['Controls/lookup', 'Controls/Classes'];

    static getDefaultOptions(): object {
        return {
            multiSelect: false,
            horizontalPadding: 'xs'
        };
    }

    static getOptionTypes(): object {
        return {
            multiSelect: descriptor(Boolean),
            selectedKeys: descriptor(Array)
        };
    }
}
