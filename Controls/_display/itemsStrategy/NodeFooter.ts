import IItemsStrategy from 'Controls/_display/IItemsStrategy';
import TreeItem from '../TreeItem';
import Tree, { TNodeFooterVisibilityCallback } from '../Tree';
import {Model} from 'Types/entity';
import {TemplateFunction} from "UI/Base";

interface IOptions<S, T extends TreeItem<S>> {
    source: IItemsStrategy<S, T>;
    display: Tree<S, T>;
    itemModule?: string;
    nodeFooterVisibilityCallback?: (nodeItem: S) => boolean;
}

interface ISortOptions<S, T extends TreeItem<S>> {
    display: Tree<S, T>;
    itemModule?: string;
    nodeFooters: Array<T>;
    nodeFooterVisibilityCallback?: (nodeItem: S) => boolean;
}

export default class NodeFooter<S extends Model = Model, T extends TreeItem<S> = TreeItem<S>> implements IItemsStrategy<S, T> {
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
        return this.source.invalidate();
    }

    reset(): void {
        this._itemsOrder = null;
        this._nodeFooters = [];
        return this.source.reset();
    }

    splice(start: number, deleteCount: number, added?: S[]): T[] {
        this._itemsOrder = null;
        const removedItems = this.source.splice(
            start,
            deleteCount,
            added
        );

        this._removeNodeFooters(removedItems);

        return removedItems;
    }

    private _removeNodeFooters(removedItems: T[]): void {
        removedItems.forEach((item) => {
            const index = this._nodeFooters.findIndex((footer: T) => footer.getNode() === item);
            if (index !== -1) {
                this._nodeFooters.splice(index, 1);
                item.setNodeFooter(null);
            }
        });
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
            itemModule: this.options.itemModule,
            nodeFooters: this._nodeFooters,
            nodeFooterVisibilityCallback: this.options.nodeFooterVisibilityCallback
        });
    }

    /**
     * Создает индекс сортировки в порядке группировки
     * @param items Элементы проекции.
     * @param options Опции
     */
    static sortItems<S extends Model = Model, T extends TreeItem<S> = TreeItem<S>>(
        items: T[],
        options: ISortOptions<S, T>
    ): number[] {
        const nodeFooterContents = options.nodeFooters.map((it) => it.getContents());

        // считаем новый список футеров
        const nodesWithFooters = NodeFooter._countNodesWithFooters(
            items, options.nodeFooterVisibilityCallback, options.display.getNodeFooterTemplate()
        );
        const newNodeFooterContents = nodesWithFooters.map((it) => NodeFooter._getNodeFooterContent(it));

        // удаляем из текущего списка футеров уже не нужные футеры
        nodeFooterContents.forEach((nodeFooterContent, index) => {
            if (newNodeFooterContents.indexOf(nodeFooterContent) === -1) {
                const removedNodeFooter = options.nodeFooters.splice(index, 1)[0];
                const node = removedNodeFooter.getNode();
                node.setNodeFooter(null);
            }
        });

        // добавляем в текущий список футеров новые футеры
        newNodeFooterContents.forEach((nodeFooterContent, index) => {
            if (nodeFooterContents.indexOf(nodeFooterContent) === -1) {
                const item = nodesWithFooters[index];
                const nodeFooter = options.display.createItem({
                    itemModule: options.itemModule || 'Controls/treeGrid:TreeGridNodeFooterRow',
                    contents: nodeFooterContent,
                    parent: item,
                    hasMore: item.hasMoreStorage(),
                    moreFontColorStyle: options.display.getMoreFontColorStyle()
                });
                options.nodeFooters.splice(index, 0, nodeFooter);
                item.setNodeFooter(nodeFooter);
            }
        });

        // обновляем ссылки в футерах и в узлах, т.к. элементы могут пересоздаться.
        NodeFooter._updateNodesInNodeFooters(items, options.nodeFooters);

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
                // TODO: Убрать в константу или определить getLevel для группы дерева
                //  https://online.sbis.ru/opendoc.html?guid=ca34d365-26db-453d-b05a-eb6c708c59ee
                if ((item['[Controls/_display/GroupItem]'] ? 1 : item.getLevel()) > node.getLevel() && oneOfParentsIsEqualNode(item)) {
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

    private static _getNodeFooterContent(item: TreeItem): string {
        return 'node-footer-' + item.getContents().getKey();
    }

    private static _countNodesWithFooters(
        items: TreeItem[], nodeFooterVisibilityCallback: TNodeFooterVisibilityCallback, nodeFooterTemplate: TemplateFunction
    ): TreeItem[] {
        const nodesWithFooter = [];

        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            const item = items[itemIndex];

            // Проверяем, что запись это узел и он развернут
            if (
                !item['[Controls/_display/TreeItem]'] || item['[Controls/treeGrid:TreeGridNodeFooterRow]']
                || item.isNode() === null || !item.isExpanded()
            ) {
                continue;
            }

            // Проверяем что в узле есть еще записи или определен футер темплейт и прикладники разрешили его показывать
            // nodeFooterVisibilityCallback вызываем только когда будем отображать прикладной темплейт,
            // если отображаем Еще, то всегда показываем nodeFooter
            if (!item.hasMoreStorage() && (!nodeFooterTemplate || nodeFooterVisibilityCallback instanceof Function && !nodeFooterVisibilityCallback(item.getContents()))
            ) {
                continue;
            }

            nodesWithFooter.push(item);
        }

        return nodesWithFooter;
    }

    private static _updateNodesInNodeFooters(items: TreeItem[], nodeFooters: TreeItem[]): void {
        nodeFooters.forEach((footer) => {
            const nodeKey = footer.getNode().getContents().getKey();
            const newNode = items.find((it) => it.key === nodeKey);
            if (newNode) {
                footer.setParent(newNode);
                newNode.setNodeFooter(footer);
            }
        });
    }
}

Object.assign(NodeFooter.prototype, {
    '[Controls/_display/IItemsStrategy]': true,
    '[Controls/_display/itemsStrategy/NodeFooter]': true,
    _moduleName: 'Controls/display:itemsStrategy.NodeFooter',
    _groups: null,
    _itemsOrder: null
});
