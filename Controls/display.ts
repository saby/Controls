/**
 * Библиотека, которая предоставляет различные виды коллекций.
 * @library Controls/display
 * @includes Abstract Controls/_display/Abstract
 * @includes Collection Controls/_display/Collection
 * @includes Enum Controls/_display/Enum
 * @includes Flags Controls/_display/Flags
 * @includes Ladder Controls/_display/Ladder
 * @includes Search Controls/_display/Search
 * @includes Tree Controls/_display/Tree
 * @includes GroupItem Controls/_display/GroupItem
 * @includes CollectionItem Controls/_display/CollectionItem
 * @includes IBind Controls/_display/IBind
 * @includes TreeChildren Controls/_display/TreeChildren
 * @includes TreeItem Controls/_display/TreeItem
 * @public
 * @author Мальцев А.А.
 */

/*
 * Library that provides various views over collections
 * @library Controls/display
 * @includes Abstract Controls/_display/Abstract
 * @includes Collection Controls/_display/Collection
 * @includes Enum Controls/_display/Enum
 * @includes Flags Controls/_display/Flags
 * @includes Ladder Controls/_display/Ladder
 * @includes Search Controls/_display/Search
 * @includes Tree Controls/_display/Tree
 * @includes GroupItem Controls/_display/GroupItem
 * @includes CollectionItem Controls/_display/CollectionItem
 * @includes IBind Controls/_display/IBind
 * @includes TreeChildren Controls/_display/TreeChildren
 * @includes TreeItem Controls/_display/TreeItem
 * @public
 * @author Мальцев А.А.
 */
import {register} from 'Types/di';
export {default as IBind} from './_display/IBind';
import {default as TreeChildren} from './_display/TreeChildren';
export {TreeChildren};
export {default as Abstract} from './_display/Abstract';
import {default as Collection, IEditingConfig, IItemActionsTemplateConfig, ISwipeConfig, ItemsFactory} from './_display/Collection';
export {Collection, IEditingConfig, IItemActionsTemplateConfig, ISwipeConfig, ItemsFactory};
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
import {IOptions as ITreeItemOptions} from './_display/TreeItem';
export {ITreeItemOptions};

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
import {default as GridMixin} from './_display/GridMixin';
export {GridMixin};
import {default as GridCollection} from './_display/GridCollection';
export {GridCollection};
import {default as GridRowMixin} from './_display/GridRowMixin';
export {GridRowMixin};
import {default as GridRow} from './_display/GridRow';
export {GridRow};
import {IOptions as IGridRowOptions} from './_display/GridRow';
export {IGridRowOptions};
import {default as GridDataRow} from './_display/GridDataRow';
export {GridDataRow};
import {default as GridCell} from './_display/GridCell';
export {GridCell};
import {default as GridHeaderRow} from './_display/GridHeaderRow';
export {GridHeaderRow};
import {default as GridTableHeaderRow} from './_display/GridTableHeaderRow';
export {GridTableHeaderRow};
import {default as GridHeader} from './_display/GridHeader';
export {GridHeader};
import {default as GridTableHeader} from './_display/GridTableHeader';
export {GridTableHeader};
import {default as GridHeaderCell} from './_display/GridHeaderCell';
export {GridHeaderCell};
import {default as GridDataCell} from './_display/GridDataCell';
export {GridDataCell};
import {default as GridFooterCell} from './_display/GridFooterCell';
export {GridFooterCell};
import {default as GridSpaceAfterBodyCell} from './_display/GridSpaceAfterBodyCell';
export {GridSpaceAfterBodyCell};
import {default as GridResultsCell} from './_display/GridResultsCell';
export {GridResultsCell};
import {default as GridGroupItem} from './_display/GridGroupItem';
export {GridGroupItem};

import * as EditInPlaceController from './_display/controllers/EditInPlace';

export { EditInPlaceController };
import * as VirtualScrollController from './_display/controllers/VirtualScroll';

export { VirtualScrollController };
import * as VirtualScrollHideController from './_display/controllers/VirtualScrollHide';

export { VirtualScrollHideController };
import {IDragPosition} from './_display/interface/IDragPosition';
export {IDragPosition};
export {groupConstants} from './_display/itemsStrategy/Group';

register('Controls/display:Collection', Collection, {instantiate: false});
register('Controls/display:CollectionItem', CollectionItem, {instantiate: false});
register('Controls/display:ColumnsCollection', ColumnsCollection, {instantiate: false});
register('Controls/display:ColumnsCollectionItem', ColumnsCollectionItem, {instantiate: false});
register('Controls/display:Enum', Enum, {instantiate: false});
register('Controls/display:Flags', Flags, {instantiate: false});
register('Controls/display:FlagsItem', FlagsItem, {instantiate: false});

register('Controls/display:GridCollection', GridCollection, {instantiate: false});
register('Controls/display:GridRow', GridRow, {instantiate: false});
register('Controls/display:GridCell', GridCell, {instantiate: false});

register('Controls/display:GridHeader', GridHeader, {instantiate: false});
register('Controls/display:GridTableHeader', GridTableHeader, {instantiate: false});
register('Controls/display:GridHeaderRow', GridHeaderRow, {instantiate: false});
register('Controls/display:GridTableHeaderRow', GridTableHeaderRow, {instantiate: false});
register('Controls/display:GridHeaderCell', GridHeaderCell, {instantiate: false});

register('Controls/display:GridDataRow', GridDataRow, {instantiate: false});
register('Controls/display:GridDataCell', GridDataCell, {instantiate: false});

register('Controls/display:GridFooterCell', GridFooterCell, {instantiate: false});
register('Controls/display:GridResultsCell', GridResultsCell, {instantiate: false});
register('Controls/display:GridSpaceAfterBodyCell', GridSpaceAfterBodyCell, {instantiate: false});

register('Controls/display:GroupItem', GroupItem, {instantiate: false});
register('Controls/display:Search', Search, {instantiate: false});
register('Controls/display:TileCollection', TileCollection, {instantiate: false});
register('Controls/display:TileCollectionItem', TileCollectionItem, {instantiate: false});
register('Controls/display:Tree', Tree, {instantiate: false});
register('Controls/display:TreeChildren', TreeChildren, {instantiate: false});
register('Controls/display:TreeItem', TreeItem, {instantiate: false});
