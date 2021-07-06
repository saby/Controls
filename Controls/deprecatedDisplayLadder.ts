import { Collection, CollectionItem } from 'Controls/display';
import {
    DestroyableMixin,
    SerializableMixin,
    ISerializableState as IDefaultSerializableState
} from 'Types/entity';
import {IObservable} from 'Types/collection';
import {mixin, object} from 'Types/util';
import {Set, Map} from 'Types/shim';
import {Object as EventObject} from 'Env/Event';

type Converter = (val: any, item?: any) => string;

/**
 * Возвращает уникальный идентификатор объекта
 */
function getObjectId(item: any): string {
    if (item.getInstanceId instanceof Function) {
        return item.getInstanceId();
    } else if (item.getId instanceof Function) {
        return item.getId();
    } else if (item.get instanceof Function) {
        return item.get('id');
    }
    return item && item.id;
}

/**
 * Возвращает уникальный содержимого элемента коллекции
 */
function getCollectionItemId<T>(item: CollectionItem<T>): string | number {
    return getObjectId(item.getContents());
}

interface ISerializableState extends IDefaultSerializableState {
    _offset: number;
    _columnNames: string[];
}

/**
 * Лесенка - позволяет отслеживать повторяющиеся значения в колонках таблицы.
 * @class Controls/_display/Ladder
 * @mixes Types/_entity/DestroyableMixin
 * @mixes Types/_entity/SerializableMixin
 * @public
 * @author Мальцев А.А.
 */
export default class Ladder<S, T extends CollectionItem<S> = CollectionItem<S>> extends mixin<
    DestroyableMixin,
    SerializableMixin
>(
    DestroyableMixin,
    SerializableMixin
) {
    /**
     * Проекция, по которой строится лесенка
     */
    protected _collection: Collection<S, T> = null;

    /**
     * Элементы проекции
     */
    protected _collectionItems: T[] = null;

    /**
     * Позиция в коллекции, с которой начинает строиться лесенка
     */
    protected _offset: number = 0;

    /**
     * Конвертеры значений
     */
    protected _converters: object = null;

    /**
     * Названия колонок, входящих в лесенку
     */
    protected _columnNames: string[] = [];

    /**
     * Лесенка по ключу элементов для каждого поля
     */
    protected _column2primaryId: Map<string, Map<string, boolean>> = null;

    /**
     * Обработчик события изменения проекции
     */
    protected _onCollectionChangeHandler: Function = null;

    /**
     * Обработчик события после изменения проекции
     */
    protected _onAfterCollectionChangeHandler: Function = null;

    /**
     * Обработчик события изменения режима генерации событий
     */
    protected _onEventRaisingChangeHandler: Function = null;

    /**
     * Конструктор лесенки.
     * @param collection Коллекция, по которой строится лесенка.
     */
    constructor(collection?: Collection<S, T>) {
        super();
        SerializableMixin.call(this);

        this._onCollectionChangeHandler = this._onCollectionChange.bind(this);
        this._onAfterCollectionChangeHandler = this._onAfterCollectionChange.bind(this);
        this._onEventRaisingChangeHandler = this._onEventRaisingChange.bind(this);

        if (collection) {
            this.setCollection(collection);
        } else {
            this.reset();
        }
    }

    destroy(): void {
        this.setCollection(null);
        super.destroy();
    }

    // endregion

    // region Public methods

    /**
     * Возвращает проекцию коллекции, по которой строится лесенка.
     */
    getCollection(): Collection<S, T> {
        return this._collection;
    }

    /**
     * Устанавливает проекцию коллекции, по которой строится лесенка.
     * collection Проекция, по которой строится лесенка.
     */
    setCollection(collection: Collection<S, T>): void {
        if (collection !== null && !(collection instanceof Collection)) {
            throw new TypeError('Argument "collection" should be an instance of Controls/_display/Collection');
        }

        // Reset for  the new collection
        const reset = collection !== this._collection;

        // For the same collection just move event handler to the end (unsubscribe and then subscribe)
        if (this._collection && !this._collection.destroyed) {
            this._collection.unsubscribe('onCollectionChange', this._onCollectionChangeHandler);
            this._collection.unsubscribe('onAfterCollectionChange', this._onAfterCollectionChangeHandler);
            this._collection.unsubscribe('onEventRaisingChange', this._onEventRaisingChangeHandler);
        }
        if (collection && !collection.destroyed) {
            collection.subscribe('onCollectionChange', this._onCollectionChangeHandler);
            collection.subscribe('onAfterCollectionChange', this._onAfterCollectionChangeHandler);
            collection.subscribe('onEventRaisingChange', this._onEventRaisingChangeHandler);
        }

        this._collection = collection;

        if (reset) {
            this._applyCollection();
            this._columnNames = [];
            this.reset();
        }
    }

    /**
     * Устанавливает позицию в коллекции, с которой начинает строиться лесенка
     * @param offset Позиция.
     */
    setOffset(offset: number | string): void {
        offset = parseInt(offset as string, 10);

        const prev = this._offset;
        this._offset = offset;
        let result = this._checkRange(this._offset, 2);
        this._notifyPrimaryChanges(result);

        if (Math.abs(prev - offset) > 1) {
            result = this._checkRange(prev, 1);
            this._notifyPrimaryChanges(result);
        }
    }

    reset(): void {
        this._column2primaryId = new Map();
    }

    /**
     * Устанавливает конвертер значения поля
     * @param columnName Название поля
     * @param converter Конвертер значения поля
     */
    setConverter(columnName: string, converter: Converter): void {
        this._converters = this._converters || {};
        this._converters[columnName] = converter;
    }

    /**
     * Возвращает значение поля с учетом лесенки
     * @param item Элемент коллекции, для котрой построена проекция
     * @param columnName Название поля
     */
    get(item: any, columnName: string): string {
        return this.isPrimary(item, columnName)
            ? object.getPropertyValue(item, columnName)
            : '';
    }

    /**
     * Возвращает признак, что значение является основным (отображается)
     * @param item Элемент коллекции, для котрой построена проекция
     * @param columnName Название поля
     */
    isPrimary(item: any, columnName: string): boolean {
        if (!this._collection) {
            return true;
        }

        this._applyColumn(columnName);

        const id = getObjectId(item);
        const columnData = this._getColumnData(columnName);
        let hasData = columnData.has(id);
        let data = hasData ? columnData.get(id) : undefined;
        const idx = this._collection.getIndexBySourceItem(item);
        if (!hasData || data[1] !== idx) {
            this._checkRange(idx, 1, true);
            hasData = columnData.has(id);
            data = hasData ? columnData.get(id) : undefined;
        }

        return hasData ? !!data[0] : true;
    }

    /**
     * Проверяет, что колонка входит в лесенку
     * @param columnName Название поля
     */
    isLadderColumn(columnName: string): boolean {
        return this._column2primaryId.has(columnName);
    }

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): ISerializableState {
        const resultState = SerializableMixin.prototype._getSerializableState.call(this, state) as ISerializableState;

        if (this._collection) {
            resultState.$options = this._collection;
        } else {
            delete resultState.$options;
        }
        if (this._offset) {
            resultState._offset = this._offset;
        }
        if (this._columnNames.length) {
            resultState._columnNames = this._columnNames;
        }

        // FIXME: what about _converters?

        return resultState;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        return function(): void {
            fromSerializableMixin.call(this);

            if (state._offset) {
                this._offset = state._offset;
            }

            if (state._columnNames) {
                this._columnNames = state._columnNames;

                // Restore _column2primaryId on wake up
                if (this._collection) {
                    this._checkRange(0, this._collectionItems.length);
                }
            }
        };
    }

    // endregion

    // region Protected methods

    protected _applyCollection(): void {
        if (!this._collection) {
            this._collectionItems = null;
            return;
        }

        const items = this._collectionItems = [];
        this._collection.each((item) => {
            items.push(item);
        });
    }

    protected _spliceCollection(
        at: number,
        deleteCount: number,
        added: T[]
    ): T[] {
        if (!this._collectionItems) {
            return;
        }
        this._collectionItems.splice(at, deleteCount, ...added);
    }

    protected _applyColumn(columnName: string): void {
        const columnNames = this._columnNames;
        if (columnNames.indexOf(columnName) > -1) {
            return;
        }
        columnNames.push(columnName);
    }

    protected _getColumnData(columnName: string): Map<string, any> {
        const map = this._column2primaryId;
        if (map.has(columnName)) {
            return map.get(columnName);
        }

        const data = new Map();
        map.set(columnName, data);
        return data;
    }

    protected _onCollectionChange(
        event: EventObject,
        action: string,
        newItems: T[],
        newItemsIndex: number,
        oldItems: T[],
        oldItemsIndex: number
    ): void {
        const push = Array.prototype.push;
        let result = [];

        const removeData = (oldItems, newItems) => {
            if (oldItems.length) {
                const columnNames = this._columnNames;
                const newItemsId = new Set();
                let columnIndex;
                let columnData;
                let delta;
                let itemId;

                newItems.forEach((item) => {
                    newItemsId.add(
                        getCollectionItemId(item)
                    );
                });

                for (columnIndex = 0; columnIndex < columnNames.length; columnIndex++) {
                    columnData = this._getColumnData(columnNames[columnIndex]);
                    for (delta = 0; delta < oldItems.length; ++delta) {
                        itemId = getCollectionItemId(oldItems[delta]);
                        if (!newItemsId.has(itemId)) {
                            columnData.delete(itemId);
                        }
                    }
                }
            }

        };

        const checkItems = (items, count, startIdx) => {
            return count > 0 ? this._checkRange(startIdx - 1, items.length + 2) : [];
        };

        switch (action) {
            case IObservable.ACTION_ADD:
                this._spliceCollection(newItemsIndex, 0, newItems);
                push.apply(result, checkItems(newItems, newItems.length, newItemsIndex));
                break;
            case IObservable.ACTION_REMOVE:
                this._spliceCollection(oldItemsIndex, oldItems.length, []);
                removeData(oldItems, newItems);
                push.apply(result, checkItems([], oldItems.length, oldItemsIndex));
                break;
            case IObservable.ACTION_CHANGE:
                result = this._checkRange(newItemsIndex - 1, 3);
                break;
            case IObservable.ACTION_MOVE:
                this._spliceCollection(oldItemsIndex, oldItems.length, []);
                this._spliceCollection(newItemsIndex, 0, newItems);

                // если запись перемещают наверх, то индекс сдвинется
                const startIndex = newItemsIndex > oldItemsIndex ? oldItemsIndex : oldItemsIndex + newItems.length;
                push.apply(result, checkItems([], oldItems.length, startIndex));
                push.apply(result, checkItems(newItems, newItems.length, newItemsIndex));
                break;
            default:
                // Translate collection items to the _collectionItems
                this._applyCollection();

                // FIXME: Check for desynchronization. It's possible if someone affects this._collection during event
                // handler called before this handler
                if (
                    action === IObservable.ACTION_RESET &&
                    this._collectionItems &&
                    this._collectionItems.length !== newItems.length
                ) {
                    newItems = this._collectionItems;
                }

                // Remove rejected ladder data
                removeData(oldItems, newItems);

                // Check updated ladder data in newItems
                push.apply(result, checkItems(newItems, newItems.length, newItemsIndex));
        }

        this._notifyPrimaryChanges(result);
    }

    protected _onEventRaisingChange(event: EventObject, enabled: boolean, analyze: boolean): void {
        if (enabled && !analyze) {
            this._applyCollection();
        }
    }

    protected _onAfterCollectionChange(): void {
        if (this._collectionItems && this._collection.getCount() !== this._collectionItems.length) {
            this._applyCollection();
        }
    }

    protected _notifyPrimaryChanges(changesArray: any[]): void {
        const collection = this._collection;
        const collectionItems = this._collectionItems;
        let idx;
        let columnName;
        let item;

        const optimized = changesArray.reduce((prev, curr) => {
            if (curr !== null) {
                idx = curr[0];
                columnName = curr[1];
                item = collectionItems[idx];

                prev[idx] = prev[idx] || {};
                prev[idx][columnName] = this.get(item.getContents(), columnName);
            }

            return prev;
        }, {});

        for (idx in optimized) {
            if (optimized.hasOwnProperty(idx)) {
                collection.notifyItemChange(
                    collectionItems[idx],
                    {contents: optimized[idx]}
                );
            }
        }
    }

    protected _checkRange(startIdx: number, length: number, byOriginal?: boolean): any[] {
        const result = [];
        const collection = this._collection;
        const collectionItems = this._collectionItems;
        const columnNames = this._columnNames;
        let columnIndex;
        let idx;
        let adjusted;

        const finishIdx = Math.min(startIdx + length, byOriginal ? collection.getCount() : collectionItems.length);
        startIdx = Math.max(0, startIdx);

        for (columnIndex = 0; columnIndex < columnNames.length; columnIndex++) {
            for (idx = startIdx; idx < finishIdx; ++idx) {
                adjusted = this._adjustPrimary(
                    idx,
                    byOriginal ? collection.at(idx) : collectionItems[idx],
                    columnNames[columnIndex],
                    byOriginal
                );
                if (adjusted !== null) {
                    result.push(adjusted);
                }
            }
        }

        return result;
    }

    protected _adjustPrimary(
        idx: number,
        item: T,
        columnName: string,
        byOriginal?: boolean
    ): any[] {
        if (!item) {
            return null;
        }

        const id = getCollectionItemId(item);
        let data;
        let nowIsPrimary;
        let thenIsPrimary;

        if (id !== undefined) {
            data = this._getColumnData(columnName);
            nowIsPrimary = this._isPrimaryIndex(idx, columnName, byOriginal);
            thenIsPrimary = data.get(id);
            thenIsPrimary = thenIsPrimary ? thenIsPrimary[0] : thenIsPrimary;
            if (nowIsPrimary !== thenIsPrimary) {
                data.set(id, [nowIsPrimary, idx]);
                return [idx, columnName];
            }
        }

        return null;
    }

    protected _isPrimaryIndex(idx: number, columnName: string, byOriginal?: boolean): boolean {
        if (idx === 0 || idx === this._offset) {
            return true;
        }

        const collection = this._collection;
        const collectionItems = this._collectionItems;
        const prev = (byOriginal ? collection.at(idx - 1) : collectionItems[idx - 1]).getContents();
        const curr = (byOriginal ? collection.at(idx) : collectionItems[idx]).getContents();
        let prevVal = object.getPropertyValue(prev, columnName);
        let currVal = object.getPropertyValue(curr, columnName);

        if (this._converters && this._converters.hasOwnProperty(columnName)) {
            prevVal = this._converters[columnName](prevVal, prev);
            currVal = this._converters[columnName](currVal, curr);
        }

        if ((prevVal instanceof Object) && (currVal instanceof Object)) {
            prevVal = prevVal.valueOf();
            currVal = currVal.valueOf();
        }

        return prevVal !== currVal;
    }
}

Object.assign(Ladder.prototype, {
    '[Controls/_display/Ladder]': true,
    _moduleName: 'Controls/display:Ladder'
});
