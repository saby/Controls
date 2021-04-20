import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import CollectionItem from '../CollectionItem';
import TreeItem from '../TreeItem';
import GroupItem from '../GroupItem';
import Tree from '../Tree';
import {DestroyableMixin, SerializableMixin, ISerializableState as IDefaultSerializableState} from 'Types/entity';
import {mixin, protect, object, logger} from 'Types/util';
import {Map} from 'Types/shim';
import {throttle} from 'Types/function';

interface IOptions<S, T> {
    keyProperty?: string;
    parentProperty?: string;
    source: IItemsStrategy<S, T>;
}

interface ISourceOptions<S, T extends TreeItem<S>> extends IItemsStrategyOptions<S, T> {
    display: Tree<S, T>;
}

interface ISerializableState<T> extends IDefaultSerializableState {
    _items: T[];
    _itemsOrder: number[];
    _parentsMap: number[];
}

interface ISplicedArray {
    hasBeenRemoved?: boolean;
}

/**
 * A symbol to maintain elements lisy inintialization flag
 * @const {Symbol}
 */
const $initialized = protect('initialized');

/**
 * Shows warings with limited frequency
 */
const WARNING_DELAY = 300;
const warning = throttle(logger.info, WARNING_DELAY);

/**
 * Normalizes identifier value type
 */
function normalizeId(id: number | string): string {
    if (typeof id === 'number') {
        return String(id);
    }
    return id;
}

/**
 * Creates a map which defines "parent -> children" relationship.
 * @param sourceItems Strategy elements to analyze
 * @param parentProperty Property name with reference to the parent element id
 * @return A map with "parent id -> children inidces" scheme
 */
function buildChildrenMap<T>(sourceItems: T[], parentProperty: string): Map<number, number[]> {
    const parentToChildren = new Map();
    const count = sourceItems.length;
    let item;
    let itemContents;
    let children;
    let parentId;

    for (let position = 0; position < count; position++) {
        item = sourceItems[position];
        itemContents = item.getContents();

        // Skip groups
        if (item['[Controls/_display/GroupItem]']) {
            continue;
        }

        // TODO: work with parentId with type Object or Array
        parentId = normalizeId(object.getPropertyValue(itemContents, parentProperty));

        if (parentToChildren.has(parentId)) {
            children = parentToChildren.get(parentId);
        } else {
            children = [];
        }

        children.push(position);
        parentToChildren.set(parentId, children);
    }

    return parentToChildren;
}

/**
 * Creates a map which defines "element -> group" relationship.
 * @param sourceItems Strategy elements to analyze
 * @return A map with "element -> group index" scheme
 */
function buildGroupsMap<T>(sourceItems: T[]): Map<T, number> {
    const itemToGroup = new Map();
    let currentGroup;

    sourceItems.forEach((item, index) => {
        if (item['[Controls/_display/GroupItem]']) {
            currentGroup = index;
        } else {
            itemToGroup.set(item, currentGroup);
        }
    });

    return itemToGroup;
}

interface ITreeIndexOptions<T> {
    keyProperty: string;
    sourceItems: T[];
    childrenMap: Map<number | string, number[]>;
    groupsMap: Map<T, number>;
    parentsMap: number[];
    path: Array<number | string>;
    lastGroup?: number;
}

/**
 * Creates an index which shows the order of elements according to the tree structure.
 * @param options Options
 * @param options.sourceItems Source strategy elements to analyze
 * @param options.childrenMap A map with "parent id -> children inidces" scheme
 * @param options.groupsMap A map with "element -> group index" scheme
 * @param options.parentsMap Anindex with "Child -> parent" scheme (fills on the fly)
 * @param options.path Path to the current node from the top of the tree (fills on the fly)
 * @param options.keyProperty Property name with element id
 * @param [parentIndex] Current parent element index
 * @return An array with "tree index -> source element index" scheme
 */
function buildTreeIndex<T>(options: ITreeIndexOptions<T>, parentIndex?: number): number[] {
    const result = [];
    const sourceItems = options.sourceItems;
    const childrenMap = options.childrenMap;
    const parentsMap = options.parentsMap;
    const groupsMap = options.groupsMap;
    let lastGroup = options.lastGroup;
    const path = options.path;
    const keyProperty = options.keyProperty;
    const parentId = path[path.length - 1];

    // Check if that parentId is not behind
    if (path.indexOf(parentId) > -1 && path.indexOf(parentId) < path.length - 1) {
        logger.error(
            'Controls/display:itemsStrategy.AdjacencyList',
            `Wrong data hierarchy relation: recursive traversal detected: parent with id "${parentId}" ` +
            `is already in progress. Path: ${path.join(' -> ')}.`
        );
        return result;
    }

    const children = childrenMap.has(parentId) ? childrenMap.get(parentId) : [];
    const childrenCount = children.length;
    let child;
    let childIndex;
    let childContents;
    let childGroup;
    let groupReverted;
    for (let i = 0; i < childrenCount; i++) {
        childIndex = children[i];
        child = sourceItems[childIndex];
        childContents = child.getContents();
        childGroup = groupsMap.get(child);

        // Add group if it has been changed
        if (childGroup !== lastGroup) {
            // Reject reverted group. Otherwise we'll have empty reverted group.
            if (groupReverted) {
                result.pop();
                parentsMap.pop();
            }

            result.push(childGroup);
            parentsMap.push(parentIndex);
            lastGroup = options.lastGroup = childGroup;
        }

        result.push(childIndex);
        parentsMap.push(parentIndex);

        if (groupReverted) {
            // Reset revert flag if group has any members
            groupReverted = false;
        }

        if (childContents && keyProperty) {
            const childId = normalizeId(object.getPropertyValue(childContents, keyProperty));
            path.push(childId);

            // Lookup for children. Adding item can't have children.
            // TODO: Try to remove knoledge about adding from this strategy
            //  https://online.sbis.ru/opendoc.html?guid=f7235d5b-011b-467e-a36b-2c4f713366e3
            if (!child.isAdd) {
                const itemsToPush = buildTreeIndex(options, parentsMap.length - 1);
                result.push(...itemsToPush);
            }

            // Revert parent's group if any child joins another group if there is not the last member in the root
            if (childGroup !== options.lastGroup && (parentIndex !== undefined || i < childrenCount - 1)) {
                result.push(childGroup);
                parentsMap.push(parentIndex);
                lastGroup = options.lastGroup = childGroup;
                groupReverted = true;
            }

            path.pop();
        }
    }

    return result;
}

/**
 * A decorating strategy which orders elements by adjacency list algorithm.
 * @class Controls/_display/ItemsStrategy/AdjacencyList
 * @mixes Types/_entity/DestroyableMixin
 * @mixes Types/_entity/SerializableMixin
 * 
 * @author Мальцев А.А.
 * @private
 */
export default class AdjacencyList<S, T extends TreeItem<S>> extends mixin<
    DestroyableMixin,
    SerializableMixin
>(
    DestroyableMixin,
    SerializableMixin
) implements IItemsStrategy<S, T> {
    /**
     * Constructor options
     */
    protected _options: IOptions<S, T>;

    /**
     * Result elements
     */
    protected _items: T[];

    /**
     * Source elements
     */
    protected _sourceItems: T[];

    /**
     * An array with "Result index -> source index" scheme.
     */
    protected _itemsOrder: number[];

    /**
     * An array with "Child index -> parent index" scheme.
     */
    protected _parentsMap: number[];

    constructor(options: IOptions<S, T>) {
        super();
        this._options = options;

        if (!options.keyProperty) {
            warning(`${this._moduleName}::constructor(): option "keyProperty" is not defined. ` +
            'Only root elements will be presented');
        }
    }

    // region IItemsStrategy

    readonly '[Controls/_display/IItemsStrategy]': boolean = true;

    /**
     * Устанавливает название свойства элемента коллекции, содержащего его уникальный идентификатор
     */
    set keyProperty(value: string): void {
        this._options.keyProperty = value;
    }

    get options(): ISourceOptions<S, T> {
        return this.source.options as ISourceOptions<S, T>;
    }

    get source(): IItemsStrategy<S, T> {
        return this._options.source;
    }

    get count(): number {
        const itemsOrder = this._getItemsOrder();
        return itemsOrder.length;
    }

    get items(): T[] {
        // Force create every item
        const items = this._getItems();
        if (!items[$initialized]) {
            const count = items.length;
            for (let i = 0; i < count; i++) {
                if (items[i] === undefined) {
                    this.at(i);
                }
            }
            items[$initialized] = true;
        }
        return items;
    }

    at(index: number): T {
        const items = this._getItems();
        if (items[index]) {
            return items[index];
        }

        const itemsOrder = this._getItemsOrder();
        const collectionIndex = itemsOrder[index];
        const sourceItem = this._getSourceItems()[collectionIndex];

        if (sourceItem === undefined) {
            throw new ReferenceError(`Collection index ${index} is out of bounds.`);
        }

        let item;
        if (sourceItem['[Controls/_display/GroupItem]']) {
            item = sourceItem;
        } else if (sourceItem instanceof TreeItem) {
            if (items.indexOf(sourceItem) === -1) {
                sourceItem.setParent(this._getParent(index));
                item = sourceItem;
            } else {
                item = this.options.display.createItem({
                    contents: sourceItem.getContents(),
                    parent: this._getParent(index)
                });
            }
        } else if (sourceItem instanceof CollectionItem) {
            item = sourceItem;
        } else {
            throw new TypeError('Unexpected item type');
        }

        return items[index] = item;
    }

    splice(start: number, deleteCount: number, added?: S[]): T[] {
        added = added || [];

        const shiftTail = (start, offset) => (value) => value >= start ? value + offset : value;

        const source = this.source;
        // Deleted indices in this.source.items
        const deletedInSource = [];
        for (let i = start; i < start + deleteCount; i++) {
            deletedInSource.push(source.getDisplayIndex(i));
        }

        // Get state before source.splice() so that keep original TreeItem instances.
        // When instance is deserialized that means _sourceItems is gone and should be recalculated.
        const items = this._getItems();
        let itemsOrder = this._getItemsOrder();
        const sourceItems = this._getSourceItems();

        source.splice(start, deleteCount, added);

        // There is the one and only case to move items with two in turn splices
        if ((<ISplicedArray> added).hasBeenRemoved) {
            added.forEach((item, index) => {
                // Actual index of added items in source
                const startInSource = source.getDisplayIndex(start + index - deleteCount);
                // Actual index of added items in itemsOrder
                let startInInner = itemsOrder.indexOf(startInSource);

                // If no actual index in itemsOrder bring it to the end
                if (startInInner === -1) {
                    startInInner = itemsOrder.length;
                }

                // insert in sourceItems
                // @ts-ignore why S inserts into T[]?
                sourceItems.splice(startInSource, 0, item);
                // shift itemsOrder values by +1 from startInSource
                itemsOrder = itemsOrder.map(shiftTail(startInSource, 1));
                // insert in itemsOrder
                itemsOrder.splice(startInInner, 0, startInSource);
                // insert in items
                // @ts-ignore why S inserts into T[]?
                items.splice(startInInner, 0, item);
            });
        }

        const removed = [];
        if (deleteCount > 0) {
            // Remove deleted in _itemsOrder, _items and _sourceItems
            let deletedCount = 0;
            const removeDeleted = (deleted) => (outer, inner) => {
                // 'inner' is always ordered by ascending
                const isRemoved = deleted.indexOf(outer) > -1;
                if (isRemoved) {
                    // Splice in 'items' should mind the shift of the index by previously deleted elements count
                    removed.push(
                        items.splice(inner - deletedCount, 1)[0]
                    );
                    sourceItems.splice(outer, 1);
                    deletedCount++;
                }
                return !isRemoved;
            };

            // Remove deleted from itemsOrder
            itemsOrder = itemsOrder.filter(removeDeleted(deletedInSource));

            // Shift indices from deleted in itemsOrder from higher to lower
            deletedInSource.sort().reverse().forEach((outer) => {
                itemsOrder = itemsOrder.map(shiftTail(outer, -1));
            });

            // Set removed flag to use in possible move operation
            (<ISplicedArray> removed).hasBeenRemoved = true;
        }

        this._itemsOrder = itemsOrder;

        this._syncItemsOrder();

        return removed;
    }

    reset(): void {
        this._items = null;
        this._sourceItems = null;
        this._itemsOrder = null;
        this.source.reset();
    }

    invalidate(): void {
        this.source.invalidate();
        this._syncItemsOrder();
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
        const collectionIndex = itemsOrder[sourceIndex];

        return collectionIndex === undefined ? -1 : collectionIndex;
    }

    // endregion

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): ISerializableState<T> {
        const resultState: ISerializableState<T> = super._getSerializableState.call(this, state);

        resultState.$options = this._options;
        resultState._items = this._items;
        resultState._itemsOrder = this._itemsOrder;
        resultState._parentsMap = this._parentsMap;

        return resultState;
    }

    _setSerializableState(state: ISerializableState<T>): Function {
        const fromSerializableMixin = super._setSerializableState(state);
        return function(): void {
            fromSerializableMixin.call(this);

            this._items = state._items;
            this._itemsOrder = state._itemsOrder;
            this._parentsMap = state._parentsMap;
        };
    }

    // endregion

    // region Protected

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
     * Инициализирует элементы проекции
     * @protected
     */
    protected _initItems(): void {
        this._items = [];
        this._items.length = this._getItemsOrder().length;
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

    protected _syncItemsOrder(): void {
        if (!this._itemsOrder) {
            return;
        }

        const oldOrder = this._itemsOrder;
        const oldItems = this._getItems();
        const oldSourceItems = this._getSourceItems();
        const newOrder = this._createItemsOrder();
        const newSourceItems = this._sourceItems;
        const sourceToInner = new Map();

        oldOrder.forEach((sourceIndex, innerIndex) => {
            sourceToInner.set(oldSourceItems[sourceIndex], oldItems[innerIndex]);
        });

        const newItems = new Array(newOrder.length);
        let innerItem;
        let sourceItem;
        let sourceIndex;
        for (let newIndex = 0; newIndex < newOrder.length; newIndex++) {
            sourceIndex = newOrder[newIndex];
            sourceItem = newSourceItems[sourceIndex];
            innerItem = sourceToInner.get(sourceItem);
            if (innerItem && innerItem.getContents() === sourceItem.getContents()) {
                newItems[newIndex] = innerItem;
                sourceToInner.delete(sourceItem); // To skip duplicates
            }
        }

        this._itemsOrder = newOrder;
        this._items = newItems;

        // Every item leaved the tree should lost their parent
        oldItems.forEach((item) => {
            if (item.setParent && !newItems.includes(item)) {
                item.setParent(undefined);
            }
        });

        // Every item stayed in the tree should renew their parent
        newItems.forEach((item, index) => {
            if (item.setParent) {
                item.setParent(this._getParent(index));
            }
        });
    }

    protected _getSourceItems(): T[] {
        if (!this._sourceItems) {
            this._sourceItems = this.source.items;
        }
        return this._sourceItems;
    }

    protected _createItemsOrder(): number[] {
        this._sourceItems = null;
        this._parentsMap = [];

        const options = this._options;
        const sourceItems = this._getSourceItems();

        const root: T = this.options.display.getRoot();
        let rootId: unknown = root && root.getContents ? root.getContents() : root;
        if (rootId && rootId instanceof Object) {
            rootId = rootId.valueOf();
        }
        if (rootId && typeof rootId === 'object') {
            rootId = object.getPropertyValue(rootId, options.keyProperty);
        }
        rootId = normalizeId(rootId as number | string);

        const childrenMap = buildChildrenMap(sourceItems, options.parentProperty);
        const groupsMap = buildGroupsMap(sourceItems);

        // FIXME: compatibility with controls logic when 1st level items may not have parentProperty
        if (rootId === null && !childrenMap.has(rootId) && childrenMap.has(undefined)) {
            rootId = undefined;
        }

        return buildTreeIndex({
            keyProperty: options.keyProperty,
            sourceItems,
            childrenMap,
            groupsMap,
            parentsMap: this._parentsMap,
            path: [rootId as number | string]
        });
    }

    /**
     * Returns the parent element for given element index.
     * @param index Element index to find parent for
     */
    protected _getParent(index: number): T {
        const parentsMap = this._parentsMap;
        const parentIndex = parentsMap[index];
        if (parentIndex === -1) {
            return undefined;
        }
        return parentIndex === undefined ? this.options.display.getRoot() : this.at(parentIndex);
    }

    // endregion
}

Object.assign(AdjacencyList.prototype, {
    '[Controls/_display/itemsStrategy/AdjacencyList]': true,
    _moduleName: 'Controls/display:itemsStrategy.AdjacencyList',
    _options: null,
    _items: null,
    _sourceItems: null,
    _itemsOrder: null,
    _parentsMap: null
});
