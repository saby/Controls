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
    draggableItem?: T;
    targetIndex: number;
}

interface ISortOptions<T extends CollectionItem> {
    targetIndex: number;
    startIndex: number;
    filterMap: boolean[];
    avatarItem: T;
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
    // Массив, который содержит индексы всех скрытых записей
    private _hiddenIndexes: number[] = [];

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

    getDraggedItemsCount(): number {
        return this._options.draggedItemsKeys.length;
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
        this.invalidate();
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
        const displayIndex = this.source.getDisplayIndex(index);
        return this._correctIndexByHiddenItems(displayIndex);
    }

    getCollectionIndex(index: number): number {
        return this.source.getCollectionIndex(index);
    }

    splice(start: number, deleteCount: number, added: S[] = []): T[] {
        this._itemsOrder = null;

        /*
            Нужно сбрасывать список элементов, чтобы потом из source взять свежие данные, иначе возникает рассинхрон
            Например, дерево - порядок элементов и проставление родитель-ребенок соответствий выполняет AdjacencyList
            и только он должен это делать. То есть когда добавляются элементы, данную логику должен выполнить
            AdjacencyList, а мы у него взять готовые элементы, над которыми сделаем уже свои манипуляции
         */
        this._items = null;

        return this.source.splice(
            start,
            deleteCount,
            added
        );
    }

    reset(): void {
        // не нужно дестроить avatarItem, т.к. он попадает в Tree::onCollectionChange, а там все узлы
        // проверяются на изменения, чтобы эти изменения занотифаить. Задестроенный элемент нельзя проверить.

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
            startIndex: this._startIndex,
            avatarItem: this._avatarItem
        });
    }

    protected _createItems(): T[] {
        this._hiddenIndexes = [];
        const filteredItems = this.source.items.filter((item, index) => {
            if (!item.DraggableItem) {
                return true;
            }
            const key = item.getContents().getKey();
            const filtered = !this._options.draggedItemsKeys.includes(key);
            const draggableItem = this._options.draggableItem;
            // запоминаем индексы всех скрытых элементов
            if (!filtered && (!draggableItem || draggableItem.getContents().getKey() !== key)) {
                this._hiddenIndexes.push(index);
            }
            return filtered;
        });
        // Если не передали перетаскиваемый элемент, то не нужно создавать "призрачный" элемент
        if (!this._avatarItem && this._options.draggableItem) {
            this._avatarItem = this._createAvatarItem();
        }
        if (this._avatarItem) {
            this._startIndex = this._correctIndexByHiddenItems(this._startIndex);
            filteredItems.splice(this._startIndex, 0, this._avatarItem);
        }
        this._options.targetIndex = this._correctIndexByHiddenItems(this._options.targetIndex);
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

    // Корректирует индекс исходя из скрытых элементов.
    // Например, если начали днд нескольких первых записей, то нужно скорректировать startIndex
    private _correctIndexByHiddenItems(index: number): number {
        const hiddenIndexesLessIndex = this._hiddenIndexes.filter((it) => it < index);
        return index - hiddenIndexesLessIndex.length;
    }

    static sortItems<S extends Model = Model, T extends CollectionItem<S> = CollectionItem<S>>(
        items: T[],
        options: ISortOptions<T>
    ): number[] {
        const itemsCount = items.length;
        if (!itemsCount) {
            return [];
        }
        if (itemsCount === 1) {
            // Если элемент остается один, то есть только единственный вариант itemsOrder
            return [0];
        }

        const itemsOrder = new Array(itemsCount);
        for (let i = 0; i < itemsCount; i++) {
            itemsOrder[i] = i;
        }

        if (options.avatarItem) {
            // targetIndex и startIndex не могут быть больше itemsCount.
            // Это может произойти, например, если выделили несколько записей в конце списка и потащили за последнюю,
            // тогда перетаскиваемые записи скроются, но индексы были посчитаны до скрытия и будут указывать за пределы.
            let targetIndex = options.targetIndex < itemsCount
                ? this.getIndexGivenFilter(options.targetIndex, options.filterMap)
                : itemsCount - 1;
            const startIndex = options.startIndex < itemsCount ? options.startIndex : itemsCount - 1;

            itemsOrder.splice(startIndex, 1);
            itemsOrder.splice(targetIndex, 0, startIndex);
        }

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

        while (countVisibleItem < sourceIndex && projectionIndex < filterMap.length) {
            projectionIndex++;
            if (filterMap[projectionIndex]) {
                countVisibleItem++;
            }
        }

        return projectionIndex;
    }
}
