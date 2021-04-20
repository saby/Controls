import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import {SortFunction} from '../Collection';
import CollectionItem from '../CollectionItem';
import GroupItem from '../GroupItem';
import {DestroyableMixin, SerializableMixin, ISerializableState as IDefaultSerializableState} from 'Types/entity';
import {CompareFunction} from 'Types/_declarations';
import {mixin} from 'Types/util';

interface IOptions<S, T extends CollectionItem<S>> {
    handlers: Array<SortFunction<S, T>>;
    source: IItemsStrategy<S, T>;
}

interface ISerializableState extends IDefaultSerializableState {
    _itemsOrder: number[];
}

/**
 * Стратегия-декоратор для пользовательского порядка элементов
 * @class Controls/_display/ItemsStrategy/User
 * @mixes Types/_entity/DestroyableMixin
 * @mixes Types/_entity/SerializableMixin
 * 
 * @author Мальцев А.А.
 * @private
 */
export default class User<S, T extends CollectionItem<S> = CollectionItem<S>> extends mixin<
    DestroyableMixin,
    SerializableMixin
>(
    DestroyableMixin,
    SerializableMixin
) implements IItemsStrategy<S, T> {
    /**
     * @typedef {Object} Options
     * @property {Controls/_display/ItemsStrategy/Abstract} source Декорирумая стратегия
     * @property {Array.<Function>} handlers Пользовательские методы сортировки
     */

    /**
     * Опции конструктора
     */
    protected _options: IOptions<S, T>;

    /**
     * Индекс в в стратегии -> оригинальный индекс
     */
    protected _itemsOrder: number[];

    constructor(options: IOptions<S, T>) {
        super();
        if (!options || !(options.handlers instanceof Array)) {
            throw new TypeError('Option "handlers" should be an instance of Array');
        }
        this._options = {...options};
    }

    // region Public members

    /**
     * Декорирумая стратегия
     */
    get source(): IItemsStrategy<S, T> {
        return this._options.source;
    }

    /**
     * Пользовательские методы сортировки
     */
    set handlers(value: Array<SortFunction<S, T>>) {
        if (!(value instanceof Array)) {
            throw new TypeError('Option "handlers" should be an instance of Array');
        }
        this._options.handlers = value;
    }

    // endregion

    // region IItemsStrategy

    readonly '[Controls/_display/IItemsStrategy]': boolean = true;

    get options(): IItemsStrategyOptions<S, T> {
        return this.source.options;
    }

    get count(): number {
        return this.source.count;
    }

    get items(): T[] {
        const items = this.source.items;
        const itemsOrder = this._getItemsOrder();

        return itemsOrder.map((index) => items[index]);
    }

    at(index: number): T {
        const itemsOrder = this._getItemsOrder();
        const sourceIndex = itemsOrder[index];

        return this.source.at(sourceIndex);
    }

    splice(start: number, deleteCount: number, added?: S[]): T[] {
        this._itemsOrder = null;
        return this.source.splice(start, deleteCount, added);
    }

    reset(): void {
        this._itemsOrder = null;
        return this.source.reset();
    }

    invalidate(): void {
        this._itemsOrder = null;
        return this.source.invalidate();
    }

    getDisplayIndex(index: number): number {
        const sourceIndex = this.source.getDisplayIndex(index);
        const itemsOrder = this._getItemsOrder();
        const itemIndex = itemsOrder.indexOf(sourceIndex);

        return itemIndex === -1 ? itemsOrder.length : itemIndex;
    }

    getCollectionIndex(index: number): number {
        const sourceIndex = this.source.getCollectionIndex(index);
        const itemsOrder = this._getItemsOrder();

        return sourceIndex === -1 ? sourceIndex : itemsOrder[sourceIndex];
    }

    // endregion

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): ISerializableState {
        const resultState: ISerializableState = SerializableMixin.prototype._getSerializableState.call(this, state);

        resultState.$options = this._options;
        resultState._itemsOrder = this._itemsOrder;

        //If some handlers are defined force calc order because handlers can be lost during serialization
        if (!resultState._itemsOrder && this._options.handlers.length) {
            resultState._itemsOrder = this._getItemsOrder();
        }

        return resultState;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        return function(): void {
            this._itemsOrder = state._itemsOrder;
            fromSerializableMixin.call(this);
        };
    }

    // endregion

    // region Protected

    /**
     * Возвращает соответствие индексов в стратегии оригинальным индексам
     * @protected
     */
    protected _getItemsOrder(): number[] {
        if (!this._itemsOrder) {
            this._itemsOrder = this._createItemsOrder();
        }

        return this._itemsOrder;
    }

    /**
     * Создает соответствие индексов в стратегии оригинальным индексам
     * @protected
     */
    protected _createItemsOrder(): number[] {
        const items = this.source.items;
        const current = items.map((item, index) => index);

        return User.sortItems<T>(
            items,
            current,
            this._options && this._options.handlers || []
        );
    }

    // endregion

    // region Statics

    /**
     * Создает индекс сортировки в порядке, определенном набором пользовательских обработчиков
     * @param items Элементы проекции.
     * @param current Текущий индекс сортировки
     * @param handlers Пользовательские обработчики для Array.prototype.sort
     */
    static sortItems<T>(items: T[], current: number[], handlers: Function[]): number[] {
        if (!handlers || handlers.length === 0) {
            return current;
        }

        const map = [];
        const sorted = [];
        let index;
        let item;

        // Make utilitary array
        for (let i = 0, count = current.length; i < count; i++) {
            index = current[i];
            item = items[index];
            if (item['[Controls/_display/GroupItem]']) {
                // Don't sort groups
                map.push(index);
            } else {
                sorted.push({
                    item,
                    collectionItem: item.getContents(),
                    index,
                    collectionIndex: index
                });
            }
        }

        // Sort utilitary array
        for (let i = handlers.length - 1; i >= 0; i--) {
            sorted.sort(handlers[i] as CompareFunction);
        }

        // Create map from utilitary array
        for (let index = 0, count = sorted.length; index < count; index++) {
            map.push(sorted[index].collectionIndex);
        }

        return map;
    }

    // endregion
}

Object.assign(User.prototype, {
    '[Controls/_display/itemsStrategy/User]': true,
    _moduleName: 'Controls/display:itemsStrategy.User',
    _itemsOrder: null
});
