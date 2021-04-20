import { DestroyableMixin, SerializableMixin, ISerializableState, Model } from 'Types/entity';
import {mixin, object} from 'Types/util';
import {Map} from 'Types/shim';
import { create } from 'Types/di';
import SearchSeparator from '../SearchSeparator';
import BreadcrumbsItem from '../BreadcrumbsItem';
import Search from '../Search';
import TreeItemDecorator from '../TreeItemDecorator';
import TreeItem from '../TreeItem';
import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';

const FORGET_TIMEOUT = 1000;
let lastTimeForget = 0;

interface IOptions<S, T> {
    /**
     * Имя свойства элемента хлебных крошек, хранящее признак того, что этот элемент и путь до него должны быть
     * выделены в обособленную цепочку
     */
    dedicatedItemProperty?: string;

    source: IItemsStrategy<S, T>;

    searchSeparatorModule: string;
    breadcrumbsItemModule: string;
    treeItemDecoratorModule: string;
}

interface ISortOptions<S extends Model, T extends TreeItem<S>> {
    treeItemToDecorator: Map<T, TreeItemDecorator<S>>;
    treeItemToBreadcrumbs: Map<T, BreadcrumbsItem<S> | SearchSeparator<S>>;
    dedicatedItemProperty: string;
    display: Search<S, T>;

    searchSeparatorModule: string;
    breadcrumbsItemModule: string;
    treeItemDecoratorModule: string;
}

interface IBreadCrumbsReference<S extends Model, T extends TreeItem<S>> {
    breadCrumbs: BreadcrumbsItem<S> | SearchSeparator<S>;
    last: T;
    itsNew: boolean;
}

/**
 * Returns nearest parent node for given tree item. It could be item itself.
 * @param item Started node or leaf to go from
 */
function getNearestNode<S extends Model, T extends TreeItem<S>>(item: T): T {
    if (!item || !item.isNode) {
        return item;
    }

    if (item.isNode()) {
        return item;
    }

    const parent = item.getParent() as T;
    if (!parent) {
        return item;
    }

    return getNearestNode(parent);
}

/**
 * Returns breadcrumbs reference for given tree item
 * @param item Item to detect breadcrumbs reference to
 * @param treeItemToBreadcrumbs Tree item to breadcrumbs map
 * @param breadcrumbsToData Breadcrumbs to data map
 * @param display Related display
 */
function getBreadCrumbsReference<S extends Model, T extends TreeItem<S>>(
    item: T,
    treeItemToBreadcrumbs: Map<T, BreadcrumbsItem<S> | SearchSeparator<S>>,
    breadcrumbsToData: Map<BreadcrumbsItem<S> | SearchSeparator<S>, T[]>,
    display: Search<S, T>
): IBreadCrumbsReference<S, T> {
    let breadCrumbs;
    const last = getNearestNode(item);
    const root = display && display.getRoot();
    if (last && last !== root) {
        breadCrumbs = treeItemToBreadcrumbs.get(last);
        if (!breadCrumbs) {
            // TODO удалить првоерку, когда полностью перейдем на новую модель https://online.sbis.ru/opendoc.html?guid=378971cd-b6a3-44ad-a264-745bd5a7f443
            if (display?.createBreadcrumbsItem) {
                breadCrumbs = display?.createBreadcrumbsItem({
                    contents: null,
                    last,
                    multiSelectVisibility: display?.getMultiSelectVisibility(),
                    multiSelectAccessibilityProperty: display?.getMultiSelectAccessibilityProperty()
                });
            } else {
                breadCrumbs = new BreadcrumbsItem<S>({
                    contents: null,
                    last,
                    owner: display,
                    multiSelectVisibility: display?.getMultiSelectVisibility(),
                    multiSelectAccessibilityProperty: display?.getMultiSelectAccessibilityProperty()
                });
            }

            treeItemToBreadcrumbs.set(last, breadCrumbs);
        }
    } else if (last === root && breadcrumbsToData.size > 0) {
        breadCrumbs = treeItemToBreadcrumbs.get(last);

        if (!breadCrumbs) {
            // TODO удалить првоерку, когда полностью перейдем на новую модель https://online.sbis.ru/opendoc.html?guid=378971cd-b6a3-44ad-a264-745bd5a7f443
            if (display?.createSearchSeparator) {
                breadCrumbs = display.createSearchSeparator({});
            } else {
                breadCrumbs = new SearchSeparator({owner: display, source: item});
            }
            treeItemToBreadcrumbs.set(item, breadCrumbs);
        }
    }

    const itsNew = !breadcrumbsToData.has(breadCrumbs);

    return {breadCrumbs, last, itsNew};
}

/**
 * Strategy-decorator which supposed to join expanded nodes into one element.
 * @class Controls/_display/ItemsStrategy/Search
 * @mixes Types/_entity/DestroyableMixin
 * 
 * @mixes Types/_entity/SerializableMixin
 * @author Мальцев А.А.
 * @private
 */
export default class SearchStrategy<S extends Model, T extends TreeItem<S> = TreeItem<S>> extends mixin<
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
     * Map from leaf to its decorator: TreeItem -> TreeItemDecorator
     */
    protected _treeItemToDecorator: Map<T, TreeItemDecorator<S>> = new Map<T, TreeItemDecorator<S>>();

    /**
     * Map from node to its breadcrumbs: TreeItem -> BreadcrumbsItem
     */
    protected _treeItemToBreadcrumbs: Map<T, BreadcrumbsItem<S>> = new Map<T, BreadcrumbsItem<S>>();

    constructor(options: IOptions<S, T>) {
        super();
        this._options = options;
    }

    destroy(): void {
        super.destroy();
        this._treeItemToDecorator = null;
        this._treeItemToBreadcrumbs = null;
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
        return this._getItems().length;
    }

    get items(): T[] {
        return this._getItems() as T[];
    }

    at(index: number): T {
        return this._getItems()[index] as T;
    }

    splice(start: number, deleteCount: number, added?: S[]): T[] {
        return this.source.splice(start, deleteCount, added);
    }

    reset(): void {
        return this.source.reset();
    }

    invalidate(): void {
        return this.source.invalidate();
    }

    getDisplayIndex(index: number): number {
        const sourceIndex = this.source.getDisplayIndex(index);
        const sourceItem = this.source.items[sourceIndex];
        const mappedItem = this._treeItemToDecorator.get(sourceItem)
           || this._treeItemToBreadcrumbs.get(sourceItem)
           || sourceItem;
        const items = this._getItems();
        const itemIndex = items.indexOf(mappedItem as T);

        return itemIndex === -1 ? items.length : itemIndex;
    }

    getCollectionIndex(index: number): number {
        const items = this._getItems();
        const mappedItem = items[index];
        const item = mappedItem['[Controls/_display/TreeItemDecorator]'] ? mappedItem.getSource() : mappedItem;
        const sourceIndex = this.source.items.indexOf(item as T);

        return sourceIndex >= 0 ? this.source.getCollectionIndex(sourceIndex) : -1;
    }

    // endregion

    // region SerializableMixin

    _getSerializableState(state: ISerializableState): ISerializableState {
        const resultState = SerializableMixin.prototype._getSerializableState.call(this, state);
        resultState.$options = this._options;
        return resultState;
    }

    // endregion

    // region Protected

    /**
     * Returns elements of display
     * @protected
     */
    protected _getItems(): Array<T | BreadcrumbsItem<S>> {
        return SearchStrategy.sortItems<S, T>(this.source.items, {
            dedicatedItemProperty: this._options.dedicatedItemProperty || '',
            treeItemToDecorator: this._treeItemToDecorator,
            treeItemToBreadcrumbs: this._treeItemToBreadcrumbs,
            display: this.options.display as Search<S, T>,
            searchSeparatorModule: this._options.searchSeparatorModule,
            breadcrumbsItemModule: this._options.breadcrumbsItemModule,
            treeItemDecoratorModule: this._options.treeItemDecoratorModule
        });
    }

    // endregion

    // region Statics

    /**
     * Returns items in sorted order and by the way joins nodes into breadcrumbs.
     * @param items Display items
     * @param options Options
     */
    static sortItems<S extends Model, T extends TreeItem<S> = TreeItem<S>>(
        items: T[],
        options: ISortOptions<S, T>
    ): Array<T | BreadcrumbsItem<S> | SearchSeparator<S>> {
        const {
            dedicatedItemProperty,
            display,
            treeItemToDecorator,
            treeItemToBreadcrumbs
        }: ISortOptions<S, T> = options;
        const breadcrumbsToData = new Map<BreadcrumbsItem<S> | SearchSeparator<S>, T[]>();
        const sortedItems = [];

        /**
         * Adds found breadcrumbs to the result list
         * @param reference Breadcrumbs reference
         */
        function addBreadCrumbsItself(reference: IBreadCrumbsReference<S, T>): void {
            breadcrumbsToData.set(reference.breadCrumbs, []);
            sortedItems.push(reference.breadCrumbs);
        }

        /**
         * Adds a member to the found breadcrumbs
         * @param reference Breadcrumbs reference
         * @param item The member to add
         */
        function addBreadCrumbsMember(reference: IBreadCrumbsReference<S, T>, item: T): void {
            const data = breadcrumbsToData.get(reference.breadCrumbs);
            if (data) {
                data.push(item);
            } else {
                sortedItems.push(item);
            }
        }

        let prevBreadCrumbs;
        items.forEach((item, index) => {
            let resultItem = item;

            if (item && item['[Controls/_display/TreeItem]']) {
                if (item.isNode()) {
                    // Check if there is a special item within the breadcrumbs
                    if (
                        dedicatedItemProperty &&
                        object.getPropertyValue(item.getContents(), dedicatedItemProperty)
                    ) {
                        // Add completed breadcrumbs for dedicated items
                        const dedicatedBreadcrumbsReference = getBreadCrumbsReference(
                            item,
                            treeItemToBreadcrumbs,
                            breadcrumbsToData,
                            display
                        );
                        prevBreadCrumbs = dedicatedBreadcrumbsReference.breadCrumbs;
                        addBreadCrumbsItself(dedicatedBreadcrumbsReference);

                        // Finish here for dedicated items
                        return;
                    }

                    // Look at the next item after current node
                    const next = items[index + 1];
                    const nextIsTreeItem = next && next['[Controls/_display/TreeItem]'];

                    // Check that the next tree item is a node with bigger level.
                    // If it's not that means we've reached the end of current breadcrumbs.
                    const isLastBreadcrumb = nextIsTreeItem && next.isNode() ?
                        item.getLevel() >= next.getLevel() :
                        true;

                    // Add completed breadcrumbs to show even empty
                    if (isLastBreadcrumb) {
                        const lastNodeBreadcrumbsReference = getBreadCrumbsReference(
                            item,
                            treeItemToBreadcrumbs,
                            breadcrumbsToData,
                            display
                        );
                        prevBreadCrumbs = lastNodeBreadcrumbsReference.breadCrumbs;
                        addBreadCrumbsItself(lastNodeBreadcrumbsReference);
                    }

                    // Finish here for any node
                    return;
                }

                // Get breadcrumbs by leaf's parent
                let breadcrumbsReference: IBreadCrumbsReference<S, T>;
                const parent = item.getParent() as T;
                breadcrumbsReference = getBreadCrumbsReference(
                    parent,
                    treeItemToBreadcrumbs,
                    breadcrumbsToData,
                    display
                );

                const currentBreadcrumbs = breadcrumbsReference.breadCrumbs;
                if (currentBreadcrumbs) {
                    // Add actual breadcrumbs if it has been changed and it's not a repeat
                    if (currentBreadcrumbs !== prevBreadCrumbs && breadcrumbsReference.itsNew) {
                        addBreadCrumbsItself(breadcrumbsReference);
                    }

                    // This is a leaf outside breadcrumbs so set the current breadcrumbs as its parent.
                    // All leaves outside breadcrumbs should be at the next level after breadcrumbs itself.
                    let decoratedItem = treeItemToDecorator.get(item);
                    if (!decoratedItem) {
                        // Descendants of leaves should keep their level so that check the parent match and keep
                        // the level by set the origin as parent if necessary
                        const itsDescendant = item.getParent() !== breadcrumbsReference.last;

                        let parent;
                        if (itsDescendant) {
                            parent = item.getParent();
                        } else {
                            parent = currentBreadcrumbs['[Controls/_display/SearchSeparator]'] ? display?.getRoot() : currentBreadcrumbs;
                        }

                        decoratedItem = create(options.treeItemDecoratorModule, {
                            source: item,
                            parent,
                            multiSelectVisibility: display?.getMultiSelectVisibility(),
                            multiSelectAccessibilityProperty: display?.getMultiSelectAccessibilityProperty()
                        });
                        treeItemToDecorator.set(item, decoratedItem);
                    }
                    resultItem = decoratedItem as unknown as T;

                    // Treat only resolved breadcrumbs as previous
                    prevBreadCrumbs = currentBreadcrumbs;

                    addBreadCrumbsMember(breadcrumbsReference, resultItem);

                    // Finish here if breadcrumbs found
                    return;
                }
            }

            // Just map an item not referred to any breadcrumbs
            sortedItems.push(resultItem);
        });

        // Clean unused instances up from time to time
        if (Date.now() - lastTimeForget > FORGET_TIMEOUT) {
            lastTimeForget = Date.now();

            // Forget unused leaf decorators
            const decoratorsToDelete = [];
            treeItemToDecorator.forEach((value, key) => {
                if (items.indexOf(key) === -1) {
                    decoratorsToDelete.push(key);
                }
            });
            decoratorsToDelete.forEach((key) => treeItemToDecorator.delete(key));

            // Forget unused breadcrumbs
            const breadcrumbsToDelete = [];
            treeItemToBreadcrumbs.forEach((value, key) => {
                if (items.indexOf(key) === -1 && !(value['[Controls/_display/SearchSeparator]'])) {
                    breadcrumbsToDelete.push(key);
                }
            });
            breadcrumbsToDelete.forEach((key) => treeItemToBreadcrumbs.delete(key));
        }

        // Expand breadcrumbs into flat array
        const resultItems: Array<T | BreadcrumbsItem<S> | SearchSeparator<S>> = [];
        sortedItems.forEach((item) => {
            if (item['[Controls/_display/BreadcrumbsItem]'] || item['[Controls/_display/SearchSeparator]']) {
                resultItems.push(item);
                const data = breadcrumbsToData.get(item);
                if (data) {
                    resultItems.push(...data);
                }
            } else {
                resultItems.push(item);
            }
        });

        return resultItems;
    }

    // endregion
}

Object.assign(SearchStrategy.prototype, {
    '[Controls/_display/itemsStrategy/Search]': true,
    _moduleName: 'Controls/display:itemsStrategy.Search',
    _treeItemToDecorator: null,
    _treeItemToBreadcrumbs: null
});
