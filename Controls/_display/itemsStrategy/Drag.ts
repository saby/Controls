import CollectionItem from '../CollectionItem';
import Collection from '../Collection';
import { mixin } from 'Types/util';
import { DestroyableMixin, Model } from 'Types/entity';
import IItemsStrategy, { IOptions as IItemsStrategyOptions } from '../IItemsStrategy';
import { IDragPosition } from 'Controls/_display/interface/IDragPosition';

type TKey = string|number;

interface IOptions<S extends Model, T extends CollectionItem<S>> extends IItemsStrategyOptions<S, T> {
    source: IItemsStrategy<S, T>;
    display: Collection<S, T>;

    draggedItemsKeys: TKey[];
    draggableItem: T;
    targetIndex: number;
}

interface ISortOptions {
    targetIndex: number;
    startIndex: number;
    filterMap: boolean[];
}

export default class Drag<S extends Model = Model, T extends CollectionItem<S> = CollectionItem<S>> extends mixin<
    DestroyableMixin
>(
    DestroyableMixin
) implements IItemsStrategy<S, T> {
    readonly '[Controls/_display/IItemsStrategy]': boolean = true;

    protected _options: IOptions<S, T>;

    // "Призрачная" запись, отображается во время перетаскивания
    // вместо самих перетаскиваемых записей
    protected _avatarItem: T;

    // Индекс в стратегии -> индекс который должен быть в результате
    protected _itemsOrder: number[];

    // Список элементов, из которого отфильтрованы перетаскиваемые
    // записи, и в который добавлена призрачная запись
    protected _items: T[];

    private _startIndex: number;
    private _currentPosition: IDragPosition<T>;

    constructor(options: IOptions<S, T>) {
        super();
        this._options = options;
        this._startIndex = options.targetIndex;
    }

    get options(): IItemsStrategyOptions<S, T> {
        return this._options;
    }

    get source(): IItemsStrategy<S, T> {
        return this._options.source;
    }

    get count(): number {
        return this._getItems().length;
    }

    get items(): T[] {
        const itemsOrder = this._getItemsOrder();
        const items = this._getItems();

        return itemsOrder.map((index) => items[index]);
    }

    get avatarItem(): T {
        return this._avatarItem;
    }

    setPosition(newPosition: IDragPosition<T>): void {
        let newIndex: number;

        // Приводим пару параметров index и position к одному - index
        if (this._options.targetIndex < newPosition.index && newPosition.position === 'before') {
            newIndex = newPosition.index - 1;
        } else if (this._options.targetIndex > newPosition.index && newPosition.position === 'after') {
            newIndex = newPosition.index + 1;
        } else {
            newIndex = newPosition.index;
        }

        this._options.targetIndex = newIndex;
        this._currentPosition = newPosition;
        this.invalidate();
    }

    getCurrentPosition(): IDragPosition<T> {
        return this._currentPosition;
    }

    at(index: number): T {
        const itemsOrder = this._getItemsOrder();
        const itemIndex = itemsOrder[index];

        if (itemIndex === undefined) {
            throw new ReferenceError(`Index ${index} is out of bounds.`);
        }

        return this._getItems()[itemIndex];
    }

    getDisplayIndex(index: number): number {
        return this.source.getDisplayIndex(index);
    }

    getCollectionIndex(index: number): number {
        return this.source.getCollectionIndex(index);
    }

    splice(start: number, deleteCount: number, added: S[] = []): T[] {
        this._itemsOrder = null;

        // Drag содержит свой список перетаскиваемых элементов, т.к. перетаскиваемая запись - это "призрачная запись"
        const reallyAdded: T[] = added.map(
           (contents) => contents instanceof CollectionItem ? contents as any as T : this._createItem(contents)
        );
        if (this._items) {
            this._items.splice(start, deleteCount, ...reallyAdded);
        }
        return this.source.splice(
            start,
            deleteCount,
            added
        );
    }

    reset(): void {
        if (this._avatarItem && !this._avatarItem.destroyed) {
            this._avatarItem.destroy();
        }
        this._avatarItem = null;
        this._items = null;
        this._itemsOrder = null;
        return this.source.reset();
    }

    invalidate(): void {
        this._itemsOrder = null;
        return this.source.invalidate();
    }

    protected _getItemsOrder(): number[] {
        if (!this._itemsOrder) {
            this._itemsOrder = this._createItemsOrder();
        }
        return this._itemsOrder;
    }

    protected _getItems(): T[] {
        if (!this._items) {
            this._items = this._createItems();
        }
        return this._items;
    }

    protected _createItemsOrder(): number[] {
        const items = this._getItems();
        // filterMap нельзя передавать один раз через опции, т.к. во время перетаскивания он может измениться.
        // Например, развернули узел. Через метод getFilterMap мы всегда получим актуальный filterMap
        return Drag.sortItems<S, T>(items, {
            targetIndex: this._options.targetIndex,
            filterMap: this._options.display.getFilterMap(),
            startIndex: this._startIndex
        });
    }

    protected _createItems(): T[] {
        const filteredItems = this.source.items.filter((item) => {
            if (!item.DraggableItem) {
                return true;
            }
            const key = item.getContents().getKey();
            return !this._options.draggedItemsKeys.includes(key);
        });
        if (!this._avatarItem) {
            this._avatarItem = this._createAvatarItem();
        }
        filteredItems.splice(this._startIndex, 0, this._avatarItem);
        return filteredItems;
    }

    protected _getProtoItem(): T {
        return this._options.draggableItem;
    }

    protected _createAvatarItem(): T {
        const protoItem = this._getProtoItem();
        return this._createItem(protoItem);
    }

    protected _createItem(protoItem: T): T {
        const item = this.options.display.createItem({
            contents: protoItem?.getContents()
        });
        if (item && protoItem) {
            item.setDragged(true, true);
            item.setMarked(protoItem.isMarked(), true);
            item.setSelected(protoItem.isSelected(), true);
        }
        return item;
    }

    static sortItems<S extends Model = Model, T extends CollectionItem<S> = CollectionItem<S>>(
        items: T[],
        options: ISortOptions
    ): number[] {
        const itemsCount = items.length;

        const itemsOrder = new Array(itemsCount - 1);
        for (let i = 0; i < itemsCount; i++) {
            itemsOrder[i] = i;
        }

        const targetIndex = this.getIndexGivenFilter(options.targetIndex, options.filterMap);
        itemsOrder.splice(options.startIndex, 1);
        itemsOrder.splice(targetIndex, 0, options.startIndex);

        return itemsOrder;
    }

    /**
     * Возвращает индекс перетаскиваемой записи, учитывая скрытые записи
     * @param sourceIndex
     * @param filterMap
     * @private
     */
    private static getIndexGivenFilter(sourceIndex: number, filterMap: boolean[]): number {
        let countVisibleItem = 0;
        let projectionIndex = 0;

        while (countVisibleItem < sourceIndex) {
            projectionIndex++;
            if (filterMap[projectionIndex]) {
                countVisibleItem++;
            }
        }

        return projectionIndex;
    }
}
