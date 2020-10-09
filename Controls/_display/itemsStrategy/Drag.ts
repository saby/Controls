import CollectionItem from '../CollectionItem';
import GroupItem from '../GroupItem';
import Collection from '../Collection';
import { mixin } from 'Types/util';
import { DestroyableMixin, Model } from 'Types/entity';
import IItemsStrategy, { IOptions as IItemsStrategyOptions } from '../IItemsStrategy';

type TKey = string|number;

interface IOptions<S extends Model, T extends CollectionItem<S>> extends IItemsStrategyOptions<S, T> {
    source: IItemsStrategy<S, T>;
    display: Collection<S, T>;

    draggedItemsKeys: TKey[];
    avatarItemKey: TKey;
    avatarIndex: number;
}

interface ISortOptions {
    avatarIndex: number;
}

export default class Drag<S extends Model, T extends CollectionItem<S> = CollectionItem<S>> extends mixin<
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

    constructor(options: IOptions<S, T>) {
        super();
        this._options = options;
    }

    get options(): IItemsStrategyOptions<S, T> {
        return this._options;
    }

    setAvatarPosition(avatarIndex: number, position: string): void {
        // TODO dnd нужно переписать сортировку, чтобы она работала аналогично Mover::move
        if (this._options.avatarIndex === avatarIndex) {
            const offset = position === 'before' ? -1 : 1;
            if (avatarIndex > 0) {
                avatarIndex += offset;
            } else {
                avatarIndex++;
            }
        }

        this._options.avatarIndex = avatarIndex;
        this.invalidate();
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

    splice(start: number, deleteCount: number, added?: S[]): T[] {
        // TODO Make sure this works correctly
        this._itemsOrder = null;
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
        return Drag.sortItems<S, T>(items, {
            avatarIndex: this._options.avatarIndex
        });
    }

    protected _createItems(): T[] {
        const filteredItems = this.source.items.filter((item) => {
            if (item instanceof GroupItem) {
                return true;
            }
            const key = item.getContents().getKey();
            return !this._options.draggedItemsKeys.includes(key);
        });

        this.source.items.filter((item) => {
            const key = item.getContents().getKey();
            return this._options.draggedItemsKeys.includes(key);
        }).forEach((it) => it.setMarked(false, true));

        if (!this._avatarItem) {
            this._avatarItem = this._createAvatarItem();
        }
        return [this._avatarItem].concat(filteredItems);
    }

    protected _getProtoItem(): T {
        return this.source.items.find((item) =>
            !(item instanceof GroupItem) && item.getContents().getKey() === this._options.avatarItemKey
        );
    }

    protected _createAvatarItem(): T {
        const protoItem = this._getProtoItem();
        return this._createItem(protoItem);
    }

    protected _createItem(protoItem: T): T {
        const item = this.options.display.createItem({
            contents: protoItem?.getContents()
        });
        item.setDragged(true, true);
        item.setMarked(protoItem.isMarked(), true);
        item.setSelected(protoItem.isSelected(), true);
        return item;
    }

    static sortItems<S, T extends CollectionItem<S> = CollectionItem<S>>(
        items: T[],
        options: ISortOptions
    ): number[] {
        const itemsCount = items.length;

        const itemsOrder = new Array(itemsCount - 1);
        for (let i = 1; i < itemsCount; i++) {
            itemsOrder[i - 1] = i;
        }

        itemsOrder.splice(options.avatarIndex, 0, 0);

        return itemsOrder;
    }
}
