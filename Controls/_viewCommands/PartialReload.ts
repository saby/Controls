import {IOptions} from './IViewAction';
import RemoveStrategy from './Remove/HierarchyRemoveStrategy';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {ISelectionObject, TKeySelection} from 'Controls/interface';
import {ICrudPlus, QueryOrderSelector} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';

interface IReloadOptions extends IOptions {
    selection?: ISelectionObject;
    source?: ICrudPlus;
    items: RecordSet;
    sorting?: QueryOrderSelector;
    beforeLoadCallback?: Function; //TODO должна быть строка
}

const SORT_DESC = 'DESC';

/**
 * Экшен для точечной перезагрузки списка.
 * @public
 * @author Золотова Э.Е.
 */
export default class Reload {
    protected _options: IReloadOptions;

    constructor(options: IReloadOptions) {
        this._options = options;
    }

    execute(meta: Partial<IReloadOptions>): Promise<void> {
        const config = {...this._options, ...meta};

        const executePromise = config.command ? config.command.execute(config) : Promise.resolve();
        return executePromise.then(() => {
            this._reloadItems(config);
        });
    }

    private _reloadItems(options: IReloadOptions): Promise<void> {
        let selectedKeys = options.selection.selected;
        if (options.beforeLoadCallback) {
            selectedKeys = options.beforeLoadCallback(selectedKeys, options.items);
        }

        const filter = {};
        filter[options.keyProperty] = selectedKeys;
        if (!options.items) {
            options.items = options.sourceController.getItems();
        }

        return this._getSourceController(options, filter).load(null, null, filter).then((items) => {
           return this._processSelectedItems(options, items as RecordSet);
        });
    }

    private _getSourceController(options: IReloadOptions, filter): SourceController {
        return new SourceController({
            filter,
            source: options.source,
            keyProperty: this._options.keyProperty
        });
    }

    private _processSelectedItems(options: IReloadOptions, selectedItems: RecordSet<Model>): void {
        const oldItems = options.items;
        let oldItem;
        let newItem;
        oldItems.setEventRaising(false, true);
        options.selection.selected.forEach((key) => {
           oldItem = oldItems.getRecordById(key);
           newItem = selectedItems.getRecordById(key);
           if (oldItem && newItem) {
               // oldItem.merge(newItem) не работает https://online.sbis.ru/opendoc.html?guid=3ab98669-85b6-484c-b0de-1df6a83b4d02
               this._merge(oldItems, oldItem, newItem, options);
           } else if (oldItem) {
                this._removeItem(options, key);
           } else if (newItem) {
               this._addItem(options, newItem)
           }
        });
        oldItems.setEventRaising(true, true);
    }

    private  _merge(oldItems: RecordSet, oldItem: Model, newItem: Model, options: IReloadOptions): void {
        const oldParentId = oldItem.get(options.parentProperty);
        const newParentId = newItem.get(options.parentProperty);

        if (oldParentId !== newParentId) {
            // Удаляем старую запись при перемещении всегда
            oldItems.remove(oldItem);
            if (options.sourceController.hasLoaded(newParentId)) {
                // Добавляем новую только если узел уже был загружен
                oldItems.add(newItem);
                const entryPath = oldItems.getMetaData()?.ENTRY_PATH;
                // После перемещения записи восстановим позицию в entryPath для selection'a
                if (entryPath) {
                    const currentPosition = entryPath.find((item) => item.id == newItem.getKey());
                    currentPosition.parent = newParentId;
                }
            }
        } else {
            oldItem.merge(newItem);
        }
    }

    private _removeItem(options: IReloadOptions, key: TKeySelection): void {
        const removeStrategy = new RemoveStrategy();
        removeStrategy.remove(options.items, {
            selection: {
                selected: [key],
                excluded: []
            },
            keyProperty: options.keyProperty,
            parentProperty: options.parentProperty,
            nodeProperty: options.nodeProperty,
            silent: true
        });
    }

    private _addItem(options: IReloadOptions, newItem: Model): void {
        const oldItems = options.items;
        const sorting = options.sorting;
        if (sorting) {
            let index = this._sortItems(oldItems, sorting, newItem);
            oldItems.add(newItem, index);
        } else {
            oldItems.add(newItem, 0);
        }
    }

    private _sortItems(items, sorting, newItem): void {
        let orderMap = this._getOrderMap(sorting);
        let dataMap = this._getDataMap(items, orderMap);
        let resultIndex = -1;

        const order = dataMap.find((a) => {
            let result = 0;
            for (let index = 0; index < orderMap.length; index++) {
                result = Reload._compare(
                    a.values[index],
                    newItem.get(orderMap[index].field)
                );
                resultIndex = orderMap[index].order * result;
                if (resultIndex === 1) {
                    return true;
                }
            }
        });
        if (order === undefined) {
            return items.getCount();
        }
        return order.index;
    }

    private _getOrderMap(sorting) {
        let orderMap = [];
        let field;
        sorting.forEach((sortingConfig) => {
            field = Object.keys(sortingConfig)[0];
            orderMap.push({
                field,
                order: sortingConfig[field].toUpperCase() === SORT_DESC ? -1 : 1
            })
        });
        return orderMap;
    }

    private _getDataMap(items, orderMap) {
        const dataMap = [];
        items.forEach((item, index) => {
            let value;
            const values = [];
            for (let i = 0; i < orderMap.length; i++) {
                value = item.get(orderMap[i].field);

                // undefined значения не передаются в compareFunction Array.prototype.sort, и в результате сортируются
                // непредсказуемо. Поэтому заменим их на null.
                values.push(value === undefined ? null : value);
            }
            dataMap.push({
                index,
                values
            });
        });
        return dataMap;
    }

    private static _compare(a, b): number {
        if (a === null && b !== null) {
            // Считаем null меньше любого не-null
            return -1;
        }
        if (a !== null && b === null) {
            // Считаем любое не-null больше null
            return 1;
        }
        if (a == b) {
            return 0;
        }
        return a > b ? 1 : -1;
    }
}
