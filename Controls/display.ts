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
export {IOptions as ITreeCollectionOptions} from './_display/Tree';
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
import {default as GridMixin} from './_display/grid/mixins/Grid';
export {GridMixin};
import {default as GridCollection} from './_display/grid/Collection';
export {GridCollection};
import {default as GridRowMixin} from './_display/grid/mixins/Row';
export {GridRowMixin};

import GridRow, {IOptions as IGridRowOptions} from './_display/grid/Row';
export {GridRow, IGridRowOptions};
import GridCell, {IOptions as IGridCellOptions} from './_display/grid/Cell';
export {GridCell, IGridCellOptions};

import GridHeader, {IOptions as IGridHeaderOptions} from './_display/grid/Header';
export {GridHeader, IGridHeaderOptions};
import GridHeaderRow, {IOptions as IGridHeaderRowOptions} from './_display/grid/HeaderRow';
export {GridHeaderRow, IGridHeaderRowOptions};
import GridHeaderCell, {IOptions as IGridHeaderCellOptions} from './_display/grid/HeaderCell';
export {GridHeaderCell, IGridHeaderCellOptions};
import GridEmptyRow, {IOptions as IGridEmptyRowOptions} from './_display/grid/EmptyRow';
export {GridEmptyRow, IGridEmptyRowOptions};
import GridEmptyCell, {IOptions as IGridEmptyCellOptions} from './_display/grid/EmptyCell';
export {GridEmptyCell, IGridEmptyCellOptions};
import GridTableHeader from './_display/grid/TableHeader';
export {GridTableHeader};
import GridTableHeaderRow from './_display/grid/TableHeaderRow';
export {GridTableHeaderRow};
export { TColspanCallbackResult, TColspanCallback, TResultsColspanCallback, IEmptyTemplateColumn } from './_display/grid/mixins/Grid';

export {IOptions as IGridCollectionOptions} from './_display/grid/Collection';
import GridDataRow, {IOptions as IGridDataRowOptions} from './_display/grid/DataRow';
export {GridDataRow, IGridDataRowOptions};
import GridDataCell, {IOptions as IGridDataCellOptions} from './_display/grid/DataCell';
export {GridDataCell, IGridDataCellOptions};

import GridResultsCell, {IOptions as IGridResultsCellOptions} from './_display/grid/ResultsCell';
export {GridResultsCell, IGridResultsCellOptions};
import GridFooterCell, {IOptions as IGridFooterCellOptions} from './_display/grid/FooterCell';
export {GridFooterCell, IGridFooterCellOptions};
import GridFooterRow, {IOptions as IGridFooterRowOptions} from './_display/grid/FooterRow';
export {GridFooterRow, IGridFooterRowOptions};
import GridGroupItem from './_display/grid/GroupItem';
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
export {MultiSelectAccessibility} from './_display/Collection';

export { IItemPadding } from 'Controls/_display/Collection';
export { IItemTemplateParams } from 'Controls/_display/grid/mixins/Row';

import IItemsStrategy, {IOptions as IItemsStrategyOptions} from 'Controls/_display/IItemsStrategy';
export {IItemsStrategy, IItemsStrategyOptions};

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

register('Controls/display:GridEmptyRow', GridEmptyRow, {instantiate: false});
register('Controls/display:GridEmptyCell', GridEmptyCell, {instantiate: false});

register('Controls/display:GridDataRow', GridDataRow, {instantiate: false});
register('Controls/display:GridDataCell', GridDataCell, {instantiate: false});

register('Controls/display:GridFooterCell', GridFooterCell, {instantiate: false});
register('Controls/display:GridResultsCell', GridResultsCell, {instantiate: false});

register('Controls/display:GroupItem', GroupItem, {instantiate: false});
register('Controls/display:TileCollection', TileCollection, {instantiate: false});
register('Controls/display:TileCollectionItem', TileCollectionItem, {instantiate: false});
register('Controls/display:Tree', Tree, {instantiate: false});
register('Controls/display:TreeChildren', TreeChildren, {instantiate: false});
register('Controls/display:TreeItem', TreeItem, {instantiate: false});
