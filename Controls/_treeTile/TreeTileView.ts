import {TileView} from 'Controls/tile';
import TreeTileCollectionItem from 'Controls/_treeTile/display/TreeTileCollectionItem';
import { SyntheticEvent } from 'UICommon/Events';

export default class TreeTileView extends TileView {
    protected _needUpdateActions(item: TreeTileCollectionItem, event: SyntheticEvent): boolean {
        return super._needUpdateActions(item, event) && !item.isNode();
    }
}
