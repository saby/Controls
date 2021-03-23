import View from 'Controls/_treeTile/View';
import TreeTileView from 'Controls/_treeTile/TreeTileView';
import TreeTileCollection from 'Controls/_treeTile/display/TreeTileCollection';
import TreeTileCollectionItem from 'Controls/_treeTile/display/TreeTileCollectionItem';
import InvisibleTreeTileItem from 'Controls/_treeTile/display/InvisibleTreeTileItem';
import {register} from 'Types/di';
import * as FolderTemplate from 'wml!Controls/_treeTile/render/Folder';

export {
    View,
    TreeTileView,
    FolderTemplate
};

register('Controls/treeTile:TreeTileCollection', TreeTileCollection, {instantiate: false});
register('Controls/treeTile:TreeTileCollectionItem', TreeTileCollectionItem, {instantiate: false});
register('Controls/treeTile:InvisibleTreeTileItem', InvisibleTreeTileItem, {instantiate: false});
