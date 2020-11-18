/**
 * Библиотека, которая предоставляет различные виды коллекций.
 * @library Controls/display
 * @public
 * @author Мальцев А.А.
 */

/*
 * Library that provides various views over collections
 * @library Controls/display
 * @public
 * @author Мальцев А.А.
 */
import {register} from 'Types/di';
export {default as IBind} from './_display/IBind';
import {default as TreeChildren} from './_display/TreeChildren';
export {TreeChildren};
export {default as Abstract} from './_display/Abstract';
import {default as Collection, IEditingConfig, IItemActionsTemplateConfig, ISwipeConfig} from './_display/Collection';
export {Collection, IEditingConfig, IItemActionsTemplateConfig, ISwipeConfig};
import {default as CollectionItem} from './_display/CollectionItem';
export {CollectionItem};
import {default as Enum} from './_display/Enum';
export {Enum};
import {default as Flags} from './_display/Flags';
export {Flags};
import {default as FlagsItem} from './_display/FlagsItem';
export {FlagsItem};
import {default as GroupItem} from './_display/GroupItem';
export {GroupItem};
import * as itemsStrategy from './_display/itemsStrategy';
export {itemsStrategy};
export {default as Ladder} from './_display/Ladder';
import {default as Search} from './_display/Search';
export {Search};
import {default as Tree} from './_display/Tree';
export {Tree};
import {default as TreeItem} from './_display/TreeItem';
export {TreeItem};

export {ANIMATION_STATE} from './_display/interface/ICollection';
export {IEditableCollection} from './_display/interface/IEditableCollection';
export {IEditableCollectionItem} from './_display/interface/IEditableCollectionItem';
export {ICollectionItem} from './_display/interface/ICollectionItem';
export {IBaseCollection, TItemKey} from './_display/interface';

import {default as TileCollection} from './_display/TileCollection';
export {TileCollection};
import {default as TileCollectionItem} from './_display/TileCollectionItem';
export {TileCollectionItem};

import {default as ColumnsCollection} from './_display/ColumnsCollection';
export {ColumnsCollection};
import {default as ColumnsCollectionItem} from './_display/ColumnsCollectionItem';
export {ColumnsCollectionItem};

import * as GridLadderUtil from './_display/utils/GridLadderUtil';
export {GridLadderUtil};
import isFullGridSupport from './_display/utils/GridSupportUtil';
export {isFullGridSupport};
import GridLayoutUtil from './_display/utils/GridLayoutUtil';
export {GridLayoutUtil};
import {default as GridCollection} from './_display/GridCollection';
export {GridCollection};
import {default as GridCollectionItem} from './_display/GridCollectionItem';
export {GridCollectionItem};
import {default as GridColumn} from './_display/GridColumn';
export {GridColumn};

import * as EditInPlaceController from './_display/controllers/EditInPlace';
export { EditInPlaceController };

import * as VirtualScrollController from './_display/controllers/VirtualScroll';
export { VirtualScrollController };

import * as VirtualScrollHideController from './_display/controllers/VirtualScrollHide';
export { VirtualScrollHideController };

import {IDragPosition} from './_display/interface/IDragPosition';
export {IDragPosition};

register('Controls/display:Collection', Collection, {instantiate: false});
register('Controls/display:CollectionItem', CollectionItem, {instantiate: false});
register('Controls/display:ColumnsCollection', ColumnsCollection, {instantiate: false});
register('Controls/display:ColumnsCollectionItem', ColumnsCollectionItem, {instantiate: false});
register('Controls/display:Enum', Enum, {instantiate: false});
register('Controls/display:Flags', Flags, {instantiate: false});
register('Controls/display:FlagsItem', FlagsItem, {instantiate: false});
register('Controls/display:GridCollection', GridCollection, {instantiate: false});
register('Controls/display:GridCollectionItem', GridCollectionItem, {instantiate: false});
register('Controls/display:GridColumn', GridColumn, {instantiate: false});
register('Controls/display:GroupItem', GroupItem, {instantiate: false});
register('Controls/display:Search', Search, {instantiate: false});
register('Controls/display:TileCollection', TileCollection, {instantiate: false});
register('Controls/display:TileCollectionItem', TileCollectionItem, {instantiate: false});
register('Controls/display:Tree', Tree, {instantiate: false});
register('Controls/display:TreeChildren', TreeChildren, {instantiate: false});
register('Controls/display:TreeItem', TreeItem, {instantiate: false});
