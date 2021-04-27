import {COUNT_INVISIBLE_ITEMS, InvisibleStrategy as TileInvisibleStrategy } from 'Controls/tile';
import {Model} from 'Types/entity';
import TreeTileCollectionItem from '../TreeTileCollectionItem';
import TreeTileCollection from '../TreeTileCollection';
import InvisibleTreeTileItem from '../InvisibleTreeTileItem';
import {TileCollectionItem} from 'Controls/tile';

interface ISortOptions<S extends Model = Model, T extends TreeTileCollectionItem<S>> {
    display: TreeTileCollection<S, T>;
    invisibleItems: InvisibleTreeTileItem[];
}

export default class InvisibleStrategy<
    S extends Model = Model,
    T extends TreeTileCollectionItem<S> = TreeTileCollectionItem<S>
> extends TileInvisibleStrategy<S, T> {

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
            const item = items[i];
            const prevItem = items[i - 1];
            if (item['[Controls/_display/GroupItem]'] && i > 0 || prevItem && prevItem.isNode && prevItem.isNode() !== null && item.isNode() === null && item.getParent() !== prevItem) {
                const invisibleIsNode = prevItem && prevItem.isNode();
                const parent = prevItem && prevItem.getParent();
                newInvisibleItems.push(super._createInvisibleItems(options.display, prevItem,{isNodeItems: invisibleIsNode, parent}));
                insertIndexForNewInvisibleItems.push(i);
            }
        }

        // Вставляем невидимые элементы в конец списка
        if (items.length && options.display.getTileMode() === 'static') {
            const lastItem = items[items.length - 1];
            const invisibleIsNode = lastItem.isNode();
            const parent = lastItem.getParent();
            newInvisibleItems.push(super._createInvisibleItems(options.display, lastItem, {isNodeItems: invisibleIsNode, parent}));
            insertIndexForNewInvisibleItems.push(items.length);
        }

        const itemsOrder = items.map((it, index) => index + newInvisibleItems.length * COUNT_INVISIBLE_ITEMS);

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

    protected static _getInvisibleItemParams(display: TreeTileCollection, prevItem: TileCollectionItem, options: object): object {
        const params = super._getInvisibleItemParams(display, prevItem, options);
        params.itemModule = 'Controls/treeTile:InvisibleTreeTileItem';
        params.node = options.isNodeItems;
        params.parent = options.parent;
        params.folderWidth = display.getFolderWidth();
        return params;
    }
}
