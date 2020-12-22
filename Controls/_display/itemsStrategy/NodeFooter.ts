import IItemsStrategy from 'Controls/_display/IItemsStrategy';
import TreeItem from '../TreeItem';
import Tree from '../Tree';

interface IOptions<S, T extends TreeItem<S>> {
    source: IItemsStrategy<S, T>;
    display: Tree<S, T>;
    nodeFooterConstructor: (options: any) => any;
    footerVisibilityCallback?: (nodeItem: S) => boolean;
}

interface ISortOptions<S, T extends TreeItem<S>> {
    display: Tree<S, T>;
    nodeFooters: Array<T>;
    nodeFooterConstructor: (options: any) => any;
    footerVisibilityCallback?: (nodeItem: S) => boolean;
}

export default class NodeFooter<S, T extends TreeItem<S> = TreeItem<S>> implements IItemsStrategy<S, T> {
    readonly '[Controls/_display/IItemsStrategy]': boolean;

    protected _count: number;
    protected _items: T[];
    protected _options: IOptions<S, T>;
    protected _source: IItemsStrategy<S, T>;

    /**
     * Группы
     */
    protected _nodeFooters: T[] = [];

    /**
     * Индекс в стратегии -> оригинальный индекс
     */
    protected _itemsOrder: number[];

    constructor(options: IOptions<S, T>) {
        this._options = options;
    }

    get options(): IOptions<S, T> {
        return this._options;
    }

    get source(): IItemsStrategy<S, T> {
        return this.options.source;
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

    getCollectionIndex(index: number): number {
        const itemsOrder = this._getItemsOrder();
        const overallIndex = itemsOrder[index];
        let sourceIndex = overallIndex - this._nodeFooters.length;

        sourceIndex = sourceIndex >= 0 ? this.source.getCollectionIndex(sourceIndex) : -1;

        return sourceIndex;
    }

    getDisplayIndex(index: number): number {
        const itemsOrder = this._getItemsOrder();
        const sourceIndex = this.source.getDisplayIndex(index);
        const overallIndex = sourceIndex + this._nodeFooters.length;
        const itemIndex = itemsOrder.indexOf(overallIndex);

        return itemIndex === -1 ? itemsOrder.length : itemIndex;
    }

    invalidate(): void {
        this._itemsOrder = null;
        this._nodeFooters = [];
        return this.source.invalidate();
    }

    reset(): void {
        this._itemsOrder = null;
        this._nodeFooters = [];
        return this.source.reset();
    }

    splice(start: number, deleteCount: number, added?: S[]): T[] {
        this._itemsOrder = null;
        this._nodeFooters = [];
        return this.source.splice(
            start,
            deleteCount,
            added
        );
    }

    /**
     * Возвращает подвалы узлов + элементы оригинальной стратегии
     * @protected
     */
    protected _getItems(): T[] {
        return (this._nodeFooters as any[] as T[]).concat(this.source.items);
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
        return NodeFooter.sortItems<S, T>(this.source.items, {
            display: this.options.display,
            nodeFooters: this._nodeFooters,
            nodeFooterConstructor: this.options.nodeFooterConstructor,
            footerVisibilityCallback: this.options.footerVisibilityCallback
        });
    }

    /**
     * Создает индекс сортировки в порядке группировки
     * @param items Элементы проекции.
     * @param options Опции
     */
    static sortItems<S, T extends TreeItem<S> = TreeItem<S>>(
        items: T[],
        options: ISortOptions<S, T>
    ): number[] {
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            const item = items[itemIndex];

            // TODO нужно добавить проверку, чтобы не создавать лишние футеры.
            //  Нужно определить, что если в узле нет данных и для него не определен content, тофутер не нужно создавать
            //  Сейчас в этой ситуации, он создастся и не отобразится и это наверное сломает виртуальный скролл
            // Футер нужен только для развернутых узлов, для которых прикладник их разрешил
            if (!item['[Controls/_display/TreeItem]'] || item.isNode() === null || !item.isExpanded()
               || options.footerVisibilityCallback instanceof Function && !options.footerVisibilityCallback(item.getContents())) {
                continue;
            }

            const nodeFooter = new options.nodeFooterConstructor({
                owner: options.display,
                contents: 'nodeFooter_' + item.getContents().getKey(),
                parent: item,
                columns: options.display.getColumnsConfig(),
                multiSelectVisibility: options.display.getMultiSelectVisibility()
            });

            options.nodeFooters.push(nodeFooter);
        }

        const getItemsCount = (node) => {
            const oneOfParentsIsEqualNode = (item) => {
                if (!item || !item.getParent) {
                    return false;
                }

                if (item.getParent() === node) {
                    return true;
                } else {
                    return oneOfParentsIsEqualNode(item.getParent());
                }
            };

            let count = 0;
            items.forEach((item) => {
                if (item.getLevel() > node.getLevel() && oneOfParentsIsEqualNode(item)) {
                    count++;
                }
            });
            return count;
        };

        const countNodeFooters = options.nodeFooters.length;
        const itemsOrder = items.map((it, index) => index + countNodeFooters);
        options.nodeFooters.forEach((footer) => {
            const node = footer.getNode();
            const sourceNodeIndex = items.indexOf(node);
            // По мере добавления футеров индекс изменяется
            const currentNodeIndex = itemsOrder.indexOf(sourceNodeIndex + countNodeFooters);
            const footerIndex = options.nodeFooters.indexOf(footer);

            // TODO здесь должен быть вызов TreeItem::getChildren,
            //  но он вызывает все стратегии и происходит зацикливание
            const countChildren = getItemsCount(node);
            // вставляем индекс футера в конец узла
            itemsOrder.splice(currentNodeIndex + countChildren + 1, 0, footerIndex);
        });

        return itemsOrder;
    }
}

Object.assign(NodeFooter.prototype, {
    '[Controls/_display/IItemsStrategy]': true,
    '[Controls/_display/itemsStrategy/NodeFooter]': true,
    _moduleName: 'Controls/display:itemsStrategy.NodeFooter',
    _groups: null,
    _itemsOrder: null
});
