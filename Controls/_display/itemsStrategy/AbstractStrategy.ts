import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import Collection from '../Collection';
import {ISourceCollection} from '../interface/ICollection';
import CollectionItem from '../CollectionItem';
import {DestroyableMixin, SerializableMixin, ISerializableState as IDefaultSerializableState} from 'Types/entity';
import {IEnumerator} from 'Types/collection';
import {mixin} from 'Types/util';

export interface IOptions<S, T extends CollectionItem<S>> extends IItemsStrategyOptions<S, T> {
    display: Collection<S, T>;
    localize?: boolean;
}

export interface ISerializableState<T> extends IDefaultSerializableState {
    _items: T[];
}

/**
 * Абстрактная стратегия получения элементов проекции
 * @class Controls/_display/ItemsStrategy/Abstract
 * 
 * @mixes Types/_entity/DestroyableMixin
 * @mixes Types/_entity/SerializableMixin
 * @author Мальцев А.А.
 * @private
 */
export default abstract class Abstract<S, T extends CollectionItem<S> = CollectionItem<S>> extends mixin<
    DestroyableMixin,
    SerializableMixin
>(
    DestroyableMixin,
    SerializableMixin
) implements IItemsStrategy<S, T> {
    /**
     * @typedef {Object} Options
     * @property {Boolean} localize Алиас зависимости или конструктора элементов проекции
     * @property {Controls/_display/Collection} display Проекция
     */

    /**
     * Элементы проекции
     */
    protected _items: T[];

    /**
     * Кэш элементов исходной коллекции
     */
    protected _sourceItems: T[];

    /**
     * Опции
     */
    protected _options: IOptions<S, T>;

    constructor(options: IOptions<S, T>) {
        super();
        this._options = options;
    }

    // region IItemsStrategy

    readonly '[Controls/_display/IItemsStrategy]': boolean = true;

    get options(): IOptions<S, T> {
        return {...this._options};
    }

    get source(): IItemsStrategy<S, T> {
        return null;
    }

    get count(): number {
        throw new Error('Property must be implemented');
    }

    get items(): T[] {
        return this._getItems();
    }

    at(index: number): T {
        throw new Error('Method must be implemented');
    }

    splice(start: number, deleteCount: number, added?: S[]): T[] {
        throw new Error('Method must be implemented');
    }

    reset(): void {
        this._items = null;
        this._sourceItems = null;
    }

    invalidate(): void {
        // Could be redefined
    }

    getDisplayIndex(index: number): number {
        return index;
    }

    getCollectionIndex(index: number): number {
        return index;
    }

    // endregion

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): ISerializableState<T> {
        const resultState: ISerializableState<T> = super._getSerializableState.call(this, state);

        resultState.$options = this._options;
        resultState._items = this._items;

        return resultState;
    }

    _setSerializableState(state: ISerializableState<T>): Function {
        const fromSerializableMixin = super._setSerializableState(state);

        return function(): void {
            fromSerializableMixin.call(this);
            this._items = state._items;
        };
    }

    // endregion

    // region Protected members

    /**
     * Возвращает исходную коллекцию
     * @protected
     */
    protected _getCollection(): ISourceCollection<S> {
        return this._options.display.getCollection();
    }

    /**
     * Возвращает энумератор коллекции
     * @protected
     */
    protected _getCollectionEnumerator(): IEnumerator<S> {
        return this._getCollection().getEnumerator(this._options.localize);
    }

    /**
     * Возвращает элементы проекции
     * @protected
     */
    protected _getItems(): T[] {
        if (!this._items) {
            this._initItems();
        }
        return this._items;
    }

    /**
     * Инициализирует элементы
     * @protected
     */
    protected _initItems(): void {
        this._items = this._items || [];
        this._items.length = this._options.display.getCollectionCount();
    }

    /**
     * Возвращает элементы исходной коллекции
     * @protected
     */
    protected _getSourceItems(): any[] {
        if (this._sourceItems) {
            return this._sourceItems;
        }

        const enumerator = this._getCollectionEnumerator();
        const items = [];
        enumerator.reset();
        while (enumerator.moveNext()) {
            items.push(enumerator.getCurrent());
        }

        return this._sourceItems = items;
    }

    /**
     * Создает элемент проекции
     * @protected
     */
    protected _createItem(contents: S): T {
        return this.options.display.createItem({
            contents
        }) as any as T;
    }

    // endregion
}

Object.assign(Abstract.prototype, {
    '[Controls/_display/itemsStrategy/DestroyableMixin]': true,
    _moduleName: 'Controls/display:itemsStrategy.DestroyableMixin',
    _items: null,
    _sourceItems: null
});
