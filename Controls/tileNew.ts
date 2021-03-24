/**
 * Библиотека контролов, которые реализуют список, отображающийся в виде плитки.
 * @library Controls/tileNew
 * @includes ItemTemplate Controls/_tileNew/interface/ItemTemplate
 * @includes ITile Controls/_tileNew/interface/ITile
 * @includes SmallItemTemplate Controls/_tileNew/interface/ISmallTemplate
 * @includes PreviewTemplate Controls/_tileNew/interface/IPreviewTemplate
 * @includes RichTemplate Controls/_tileNew/interface/IRichTemplate
 * @public
 * @author Панихин К.А.
 */

import {register} from 'Types/di';

import {default as View} from 'Controls/_tileNew/View';
import * as ItemTemplate from 'wml!Controls/_tileNew/render/items/Default';
import * as SmallItemTemplate from 'wml!Controls/_tileNew/render/items/Small';
import * as MediumTemplate from 'wml!Controls/_tileNew/render/items/Medium';
import * as PreviewTemplate from 'wml!Controls/_tileNew/render/items/Preview';
import * as RichTemplate from 'wml!Controls/_tileNew/render/items/Rich';
import {default as ActionsMenu} from 'Controls/_tileNew/itemActions/Menu';
import {getImageUrl, getImageSize, getImageClasses, getImageRestrictions, getItemSize} from 'Controls/_tileNew/utils/imageUtil';

import TileCollection from 'Controls/_tileNew/display/TileCollection';
import TileCollectionItem from 'Controls/_tileNew/display/TileCollectionItem';
import InvisibleTileItem from 'Controls/_tileNew/display/InvisibleTileItem';
import Tile from 'Controls/_tileNew/display/mixins/Tile';
import TileItem from 'Controls/_tileNew/display/mixins/TileItem';
import InvisibleStrategy, { COUNT_INVISIBLE_ITEMS } from 'Controls/_tileNew/display/strategies/Invisible';
import TileView from 'Controls/_tileNew/TileView';

export {
    View,
    TileView,
    ItemTemplate,
    SmallItemTemplate,
    MediumTemplate,
    PreviewTemplate,
    RichTemplate,
    ActionsMenu,
    TileCollection,
    TileCollectionItem,
    Tile as TileMixin,
    TileItem as TileItemMixin,
    InvisibleTileItem,
    InvisibleStrategy,
    COUNT_INVISIBLE_ITEMS,
    getImageUrl,
    getImageSize,
    getImageClasses,
    getImageRestrictions,
    getItemSize
};

register('Controls/tileNew:TileCollection', TileCollection, {instantiate: false});
register('Controls/tileNew:TileCollectionItem', TileCollectionItem, {instantiate: false});
register('Controls/tileNew:InvisibleTileItem', InvisibleTileItem, {instantiate: false});
