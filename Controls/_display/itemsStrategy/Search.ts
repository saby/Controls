import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import Tree from '../Tree';
import TreeItem from '../TreeItem';
import TreeItemDecorator from '../TreeItemDecorator';
import BreadcrumbsItem from '../BreadcrumbsItem';
import {DestroyableMixin, SerializableMixin, ISerializableState} from 'Types/entity';
import {mixin} from 'Types/util';
import {Map} from 'Types/shim';

const FORGET_TIMEOUT = 1000;
let lastTimeForget = 0;

interface IOptions<S, T> {
    source: IItemsStrategy<S, T>;
}

interface ISortOptions<S, T extends TreeItem<S>> {
    treeItemToDecorator: Map<T, TreeItemDecorator<S>>;
    treeItemToBreadcrumbs: Map<T, BreadcrumbsItem<S>>;
    display: Tree<S, T>;
}

/**
 * Strategy-decorator which supposed to join expanded nodes into one element.
 * @class Controls/_display/ItemsStrategy/Search
 * @mixes Types/_entity/DestroyableMixin
 * @implements Controls/_display/IItemsStrategy
 * @mixes Types/_entity/SerializableMixin
 * @author Мальцев А.А.
 * @private
 */
export default class Search<S, T extends TreeItem<S> = TreeItem<S>> extends mixin<
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
        const mappedItem = this._treeItemToDecorator.get(sourceItem) || sourceItem;
        const items = this._getItems();
        const itemIndex = items.indexOf(mappedItem as T);

        return itemIndex === -1 ? items.length : itemIndex;
    }

    getCollectionIndex(index: number): number {
        const items = this._getItems();
        const mappedItem = items[index];
        const item = mappedItem instanceof TreeItemDecorator ? mappedItem.getSource() : mappedItem;
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
        return Search.sortItems<S, T>(this.source.items, {
            treeItemToDecorator: this._treeItemToDecorator,
            treeItemToBreadcrumbs: this._treeItemToBreadcrumbs,
            display: this.options.display as Tree<S, T>
        });
    }

    // endregion

    // region Statics

    /**
     * Returns items in sorted order and by the way joins nodes into breadcrumbs.
     * @param items Display items
     * @param options Options
     */
    static sortItems<S, T extends TreeItem<S> = TreeItem<S>>(
        items: T[],
        options: ISortOptions<S, T>
    ): Array<T | BreadcrumbsItem<S>> {
        const {display, treeItemToDecorator, treeItemToBreadcrumbs}: ISortOptions<S, T> = options;
        const breadcrumbsToData = new Map<BreadcrumbsItem<S>, T[]>();
        const root = display && display.getRoot();
        const sortedItems = [];

        interface IBreadCrumbsReference {
            breadCrumbs: BreadcrumbsItem<S>;
            last: T;
            itsNew: boolean;
        }

        function getNearestNode(item: T): T {
            if (!item || !item.isNode) {
                return;
            }

            if (item.isNode()) {
                return item;
            }

            return getNearestNode(item.getParent() as T);
        }

        function getBreadCrumbsReference(item: T): IBreadCrumbsReference {
            let breadCrumbs;
            const last = getNearestNode(item);
            if (last && last !== root) {
                breadCrumbs = treeItemToBreadcrumbs.get(last);
                if (!breadCrumbs) {
                    breadCrumbs = new BreadcrumbsItem<S>({
                        contents: null,
                        last,
                        owner: display
                    });
                    treeItemToBreadcrumbs.set(last, breadCrumbs);
                }
            }

            const itsNew = !breadcrumbsToData.has(breadCrumbs);

            return {breadCrumbs, last, itsNew};
        }

        function addBreadCrumbsItself(reference: IBreadCrumbsReference): void {
            breadcrumbsToData.set(reference.breadCrumbs, []);
            sortedItems.push(reference.breadCrumbs);
        }

        function addBreadCrumbsMember(reference: IBreadCrumbsReference, item: T): void {
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

            if (item instanceof TreeItem) {
                if (item.isNode()) {
                    // Look at the next item after current node
                    const next = items[index + 1];
                    const nextIsTreeItem = next instanceof TreeItem;

                    // Check that the next tree item is a node with bigger level.
                    // If it's not that means we've reached the end of current breadcrumbs.
                    const isLastBreadcrumb = nextIsTreeItem && next.isNode() ?
                        item.getLevel() >= next.getLevel() :
                        true;

                    // Add completed breadcrumbs to show even empty
                    if (isLastBreadcrumb) {
                        const breadcrumbsReference = getBreadCrumbsReference(item);
                        prevBreadCrumbs = breadcrumbsReference.breadCrumbs;
                        addBreadCrumbsItself(breadcrumbsReference);
                    }

                    // Finish here for any node
                    return;
                }

                // Get breadcrumbs by leaf's parent
                const breadcrumbsReference = getBreadCrumbsReference(item.getParent() as T);
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
                        decoratedItem = new TreeItemDecorator({
                            source: item,
                            parent: itsDescendant ? item.getParent() : currentBreadcrumbs
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
                if (items.indexOf(key) === -1) {
                    breadcrumbsToDelete.push(key);
                }
            });
            breadcrumbsToDelete.forEach((key) => treeItemToBreadcrumbs.delete(key));
        }

        // Expand breadcrumbs into flat array
        const resultItems: Array<T | BreadcrumbsItem<S>> = [];
        sortedItems.forEach((item) => {
            if (item instanceof BreadcrumbsItem) {
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

Object.assign(Search.prototype, {
    '[Controls/_display/itemsStrategy/Search]': true,
    _moduleName: 'Controls/display:itemsStrategy.Search',
    _treeItemToDecorator: null,
    _treeItemToBreadcrumbs: null
});
