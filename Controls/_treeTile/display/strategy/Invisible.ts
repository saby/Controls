import {COUNT_INVISIBLE_ITEMS, InvisibleStrategy as TileInvisibleStrategy, TileCollectionItem } from 'Controls/tile';
import {Model} from 'Types/entity';
import TreeTileCollectionItem, {ITreeTileCollectionItemOptions} from '../TreeTileCollectionItem';
import TreeTileCollection from '../TreeTileCollection';
import InvisibleTreeTileItem from '../InvisibleTreeTileItem';

interface ISortOptions<
    S extends Model = Model,
    T extends TreeTileCollectionItem<S> = TreeTileCollectionItem<S>
> {
    display: TreeTileCollection<S, T>;
    invisibleItems: InvisibleTreeTileItem[];
}

export default class InvisibleStrategy<
    S extends Model = Model,
    T extends TreeTileCollectionItem<S> = TreeTileCollectionItem<S>
> extends TileInvisibleStrategy<S, T> {

    protected _invisibleItems: InvisibleTreeTileItem[];

    protected _createItemsOrder(): number[] {
        return InvisibleStrategy.sortItems<S, T>(this.source.items, {
            display: this.options.display,
            invisibleItems: this._invisibleItems
        });
    }

    static sortItems<
        S extends Model = Model,
        T extends TreeTileCollectionItem<S> = TreeTileCollectionItem<S>
    >(items: T[], options: ISortOptions<S, T>): number[] {
        const newInvisibleItems = [];
        const insertIndexForNewInvisibleItems = [];

        for (let i = 0; i < items.length; i++) {
            const itemIndex = i;
            const item = items[i];
            const itemIsGroup = item['[Controls/_display/GroupItem]'];
            const itemIsNode = !itemIsGroup && item.isNode() !== null;

            let nextItem = items[i + 1];
            let hasNextItem = !!nextItem;
            let nextItemIsGroup = hasNextItem && nextItem['[Controls/_display/GroupItem]'];
            // в качестве nextItem может использоваться только элемент из корня
            while (hasNextItem && !nextItemIsGroup && nextItem.getParent() !== options.display.getRoot()) {
                i++;
                nextItem = items[i + 1];
                hasNextItem = !!nextItem;
                nextItemIsGroup = hasNextItem && nextItem['[Controls/_display/GroupItem]'];
            }
            const nextItemIsLeaf = hasNextItem && !nextItemIsGroup && nextItem.isNode() === null;

            if (nextItemIsGroup) {
                newInvisibleItems.push(super._createInvisibleItems(options.display, item,{
                    isNodeItems: itemIsNode
                }));
                // invisible-элементы нужно добавлять ПЕРЕД группой
                insertIndexForNewInvisibleItems.push(itemIndex + 1);
            } else {
                if (itemIsNode && (!hasNextItem || nextItemIsLeaf)) {
                    newInvisibleItems.push(super._createInvisibleItems(options.display, item,{
                        isNodeItems: true
                    }));
                    // invisible-элементы нужно добавлять ПОСЛЕ узла
                    insertIndexForNewInvisibleItems.push(itemIndex + 1);
                }
            }
        }

        // invisible-элементы после всех элементов нужно добавлять только в режиме static
        if (options.display.getTileMode() === 'static') {
            const lastItem = items[items.length - 1];
            const hasLastItem = !!lastItem;
            const lastItemIsGroup = hasLastItem && lastItem['[Controls/_display/GroupItem]'];
            const lastItemIsLeaf = hasLastItem && !lastItemIsGroup && lastItem.isNode() === null;
            if (lastItemIsLeaf) {
                newInvisibleItems.push(super._createInvisibleItems(options.display, lastItem, {
                    isNodeItems: false
                }));
                // invisible-элементы нужно добавлять в самый конец
                insertIndexForNewInvisibleItems.push(items.length);
            }
        }

        const itemsOrder = items.map(
            (it, index) => index + newInvisibleItems.length * COUNT_INVISIBLE_ITEMS
        );

        for (let i = 0; i < newInvisibleItems.length; i++) {
            const items = newInvisibleItems[i];
            options.invisibleItems.push(...items);
            const insertIndex = insertIndexForNewInvisibleItems[i];
            for (let j = 0; j < items.length; j++) {
                const invisibleItemIndex = (COUNT_INVISIBLE_ITEMS * i + j);
                itemsOrder.splice(insertIndex + invisibleItemIndex, 0, invisibleItemIndex);
            }
        }

        return itemsOrder;
    }

    protected static _getInvisibleItemParams(
        display: TreeTileCollection, prevItem: TileCollectionItem, options: Partial<ITreeTileCollectionItemOptions>
    ): Partial<ITreeTileCollectionItemOptions> {
        const params = super._getInvisibleItemParams(display, prevItem, options);
        params.itemModule = 'Controls/treeTile:InvisibleTreeTileItem';
        params.node = options.isNodeItems;
        params.parent = display.getRoot();
        params.folderWidth = display.getFolderWidth();
        return params;
    }
}
