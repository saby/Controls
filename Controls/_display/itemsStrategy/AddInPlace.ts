import CollectionItem from '../CollectionItem';
import Collection from '../Collection';
import { mixin } from 'Types/util';
import { DestroyableMixin } from 'Types/entity';
import IItemsStrategy, { IOptions as IItemsStrategyOptions } from '../IItemsStrategy';

interface IOptions<S, T extends CollectionItem<S>> extends IItemsStrategyOptions<S, T> {
    source: IItemsStrategy<S, T>;
    display: Collection<S, T>;

    contents: S;
    addIndex?: number;
}

interface ISortOptions {
    addIndex: number;
}

export default class AddInPlace<S, T extends CollectionItem<S> = CollectionItem<S>> extends mixin<
    DestroyableMixin
>(
    DestroyableMixin
) implements IItemsStrategy<S, T> {
    readonly '[Controls/_display/IItemsStrategy]': boolean = true;

    protected _options: IOptions<S, T>;

    // Временно созданная для добавления по месту запись. Существует
    // только в display, но не в рекордсете
    protected _addedItem: T;

    // Индекс в стратегии -> индекс который должен быть в результате
    protected _itemsOrder: number[];

    constructor(options: IOptions<S, T>) {
        super();
        this._options = options;
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

    at(index: number): T {
        const itemsOrder = this._getItemsOrder();
        const itemIndex = itemsOrder[index];

        if (typeof itemIndex === 'undefined') {
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
        if (this._addedItem && !this._addedItem.destroyed) {
            this._addedItem.destroy();
        }
        this._addedItem = null;
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
        const overallIndex = sourceIndex + 1;
        const itemIndex = itemsOrder.indexOf(overallIndex);

        return itemIndex === -1 ? itemsOrder.length : itemIndex;
    }

    getCollectionIndex(index: number): number {
        const itemsOrder = this._getItemsOrder();
        const itemIndex = itemsOrder[index];

        let sourceIndex = itemIndex - 1;
        if (sourceIndex >= 0) {
            sourceIndex = this.source.getCollectionIndex(sourceIndex);
        }

        return sourceIndex;
    }

    protected _getItemsOrder(): number[] {
        if (!this._itemsOrder) {
            this._itemsOrder = this._createItemsOrder();
        }
        return this._itemsOrder;
    }

    protected _getItems(): T[] {
        if (!this._addedItem) {
            this._addedItem = this._createItem(this._options.contents);
        }

        // Добавляем _addedItem в 0 позицию, в нужный индекс он будет поставлен
        // за счет sortItems
        return [this._addedItem].concat(this.source.items);
    }

    protected _createItemsOrder(): number[] {
        const items = this.source.items;
        return AddInPlace.sortItems<S, T>(items, {
            addIndex: this._options.addIndex ?? items.length
        });
    }

    protected _createItem(contents: S): T {
        const item = this.options.display.createItem({
            contents
        }) as unknown as T;
        item.setEditing(true, contents, true);
        return item;
    }

    static sortItems<S, T extends CollectionItem<S> = CollectionItem<S>>(
        items: T[],
        options: ISortOptions
    ): number[] {
        const originalItemsCount = items.length;

        // Все исходные элементы оставляем в том же порядке, в котором
        // они были
        const itemsOrder = new Array(originalItemsCount);
        for (let i = 1; i <= originalItemsCount; i++) {
            itemsOrder[i - 1] = i;
        }

        // Указываем, что _addedItem должен быть в позиции addIndex
        itemsOrder.splice(options.addIndex, 0, 0);

        return itemsOrder;
    }
}
