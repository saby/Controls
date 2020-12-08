import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import Collection from '../Collection';
import CollectionItem from '../CollectionItem';
import GroupItem from '../GroupItem';
import {
    DestroyableMixin,
    SerializableMixin,
    ISerializableState as IDefaultSerializableState
} from 'Types/entity';
import {mixin} from 'Types/util';

type IGroup = string | number;
type IGroups = IGroup[];

type GroupHandler<S, T> = (data: S, index: number, item: T) => string | number;

interface IOptions<S, T extends CollectionItem<S>> {
    source: IItemsStrategy<S, T>;
    display?: Collection<S, T>;
    handler?: GroupHandler<S, T>;
    collapsedGroups?: IGroups;
    groupConstructor: new(options: unknown) => GroupItem<T>;
}

interface ISortOptions<S, T extends CollectionItem<S>> {
    display: Collection<S, T>;
    handler: GroupHandler<S, T>;
    groups: Array<GroupItem<IGroup>>;
    collapsedGroups?: IGroups;
    groupConstructor: new(options: unknown) => GroupItem<T>;
}

interface ISerializableState extends IDefaultSerializableState {
    _groups: Array<GroupItem<IGroup>>;
    _itemsOrder: number[];
}

/**
 * Стратегия-декоратор для формирования групп элементов
 * @class Controls/_display/ItemsStrategy/Group
 * @mixes Types/_entity/DestroyableMixin
 * @mixes Types/_entity/SerializableMixin
 * @implements Controls/_display/IItemsStrategy
 * @author Мальцев А.А.
 * @private
 */
export default class Group<S, T extends CollectionItem<S> = CollectionItem<S>> extends mixin<
    DestroyableMixin,
    SerializableMixin
>(
    DestroyableMixin,
    SerializableMixin
) implements IItemsStrategy<S, T> {
    /**
     * @typedef {Object} Options
     * @property {Controls/_display/ItemsStrategy/Abstract} source Декорирумая стратегия
     * @property {Function(Types/_collection/Item, Number, *)} handler Метод, возвращающий группу элемента
     */

    /**
     * Опции конструктора
     */
    protected _options: IOptions<S, T>;

    /**
     * Группы
     */
    protected _groups: Array<GroupItem<IGroup>> = [];

    /**
     * Индекс в в стратегии -> оригинальный индекс
     */
    protected _itemsOrder: number[];

    constructor(options: IOptions<S, T>) {
        super();
        this._options = options;
    }

    /**
     * Sets the function which returns the group id for every element
     */
    set handler(value: GroupHandler<S, T>) {
        this._options.handler = value;
    }

    set collapsedGroups(value: IGroups) {
        this._options.collapsedGroups = value;
        // reset created groups
        this._groups = [];
        this._itemsOrder = null;
    }

    get groups(): Array<GroupItem<IGroup>> {
        return this.items.filter((item) => item['[Controls/_display/GroupItem]']) as Array<GroupItem<IGroup>>;
    }

    // region IItemsStrategy

    readonly '[Controls/_display/IItemsStrategy]': boolean = true;

    get options(): IItemsStrategyOptions<S, T> {
        return this.source.options;
    }

    get source(): IItemsStrategy<S, T> {
        return this._options.source;
    }

    get count(): number {
        return this._getItemsOrder().length;
    }

    get items(): T[] {
        const itemsOrder = this._getItemsOrder();
        const items = this._getItems();

        return itemsOrder.map((index) => items[index]);
    }

    at(index: number): T {
        const itemsOrder = this._getItemsOrder();
        const itemIndex = itemsOrder[index];

        if (itemIndex === undefined) {
            throw new ReferenceError(`Index ${index} is out of bounds.`);
        }

        return this._getItems()[itemIndex];
    }

    splice(start: number, deleteCount: number, added?: S[]): T[] {
        this._itemsOrder = null;
        return this.source.splice(
            start,
            deleteCount,
            added
        );
    }

    reset(): void {
        this._groups = [];
        this._itemsOrder = null;
        return this.source.reset();
    }

    invalidate(): void {
        this._itemsOrder = null;
        return this.source.invalidate();
    }

    getDisplayIndex(index: number): number {
        const itemsOrder = this._getItemsOrder();
        const sourceIndex = this.source.getDisplayIndex(index);
        const overallIndex = sourceIndex + this._groups.length;
        const itemIndex = itemsOrder.indexOf(overallIndex);

        return itemIndex === -1 ? itemsOrder.length : itemIndex;
    }

    getCollectionIndex(index: number): number {
        const itemsOrder = this._getItemsOrder();
        const overallIndex = itemsOrder[index];
        let sourceIndex = overallIndex - this._groups.length;

        sourceIndex = sourceIndex >= 0 ? this.source.getCollectionIndex(sourceIndex) : -1;

        return sourceIndex;
    }

    // endregion

    // region SerializableMixin

     _getSerializableState(state: IDefaultSerializableState): ISerializableState {
        const resultState: ISerializableState = SerializableMixin.prototype._getSerializableState.call(this, state);

        resultState.$options = this._options;
        resultState._groups = this._groups;
        resultState._itemsOrder = this._itemsOrder;

        // If handler is defined force calc order because handler can be lost during serialization
        if (!resultState._itemsOrder && this._options.handler) {
            resultState._itemsOrder = this._getItemsOrder();
        }

        return resultState;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        return function(): void {
            this._groups = state._groups;
            this._itemsOrder = state._itemsOrder;
            fromSerializableMixin.call(this);
        };
    }

    // endregion

    // region Protected

    /**
     * Возвращает группы + элементы оригинальной стратегии
     * @protected
     */
    protected _getItems(): T[] {
        return (this._groups as any as T[]).concat(this.source.items);
    }

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
     * Создает соответствие индексов в стратегии оригинальным оригинальный индексам
     * @protected
     */
    protected _createItemsOrder(): number[] {
        return Group.sortItems<S, T>(this.source.items, {
            display: this.options.display as Collection<S, T>,
            handler: this._options.handler,
            collapsedGroups: this._options.collapsedGroups,
            groups: this._groups,
            groupConstructor: this._options.groupConstructor
        });
    }

    /**
     * Возвращает число групп, в которых есть элементы
     * @protected
     */
    protected _getActiveGroupsCount(itemsOrder: number[]): number {
        return itemsOrder.length - this.source.items.length;
    }

    // endregion

    // region Statics

    /**
     * Создает индекс сортировки в порядке группировки
     * @param items Элементы проекции.
     * @param options Опции
     */
    static sortItems<S, T extends CollectionItem<S> = CollectionItem<S>>(
        items: T[],
        options: ISortOptions<S, T>
    ): number[] {
        const groups = options.groups;
        const display = options.display;
        const handler = options.handler;

        // No grouping - reset groups and return current order
        if (!handler) {
            groups.length = 0;
            return items.map((item, index) => index);
        }

        let groupsId; // {Array}: Group index -> group ID
        // Fill groupsId by groups
        groupsId = groups.map((item) => item.getContents());

        const groupsOrder = []; // {Array.<Number>}: Group position -> Group index
        const groupsItems = []; // {Array.<Number>}: Group index -> Item index
        // Check group ID and group instance for every item and join them all together
        for (let position = 0; position < items.length; position++) {
            const item = items[position];
            const groupId = handler
                ? handler((item as any as CollectionItem<S>).getContents(), position, item)
                : undefined;
            let groupIndex = groupsId.indexOf(groupId);

            // Create group with this groupId if necessary
            if (groupsId.indexOf(groupId) === -1) {
                const isCollapsed = options.collapsedGroups && options.collapsedGroups.indexOf(groupId) !== -1;
                const group = new options.groupConstructor({
                    owner: display as any,
                    contents: groupId,
                    expanded: !isCollapsed,
                    multiSelectVisibility: display?.getMultiSelectVisibility()
                }) as GroupItem<IGroup>;

                groupIndex = groups.length;

                // Insert data into groups and groupsId
                groups.push(group);
                groupsId.push(groupId);
            }

            // Remember group order
            if (groupsOrder.indexOf(groupIndex) === -1) {
                groupsOrder.push(groupIndex);
            }

            // Items of each group
            if (!groupsItems[groupIndex]) {
                groupsItems[groupIndex] = [];
            }
            groupsItems[groupIndex].push(position);
        }

        const arrayMove = (arr, from, to) => {
            arr.splice(to, 0, arr.splice(from, 1)[0]);
        };

        // Перемещаем элементы без группы в начало
        const hiddenGroupIndex = groupsId.indexOf('CONTROLS_HIDDEN_GROUP');
        if (hiddenGroupIndex !== -1) {
            arrayMove(groupsOrder, hiddenGroupIndex, 0);
        }

        // Fill result by groups
        const result = [];
        const groupsCount = groups.length;
        groupsOrder.forEach((groupIndex) => {
            result.push(groupIndex);
            groupsItems[groupIndex].forEach((item) => {
                result.push(item + groupsCount);
            });
        });

        return result;
    }

    // endregion
}

Object.assign(Group.prototype, {
    '[Controls/_display/itemsStrategy/Group]': true,
    _moduleName: 'Controls/display:itemsStrategy.Group',
    _groups: null,
    _itemsOrder: null
});
