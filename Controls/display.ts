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
import {
    default as Collection,
    IOptions as ICollectionOptions,
    IEditingConfig,
    IItemActionsTemplateConfig,
    ISwipeConfig,
    ItemsFactory,
    IViewIterator
} from './_display/Collection';
export {
    Collection, ICollectionOptions, IEditingConfig,
    IItemActionsTemplateConfig, ISwipeConfig, ItemsFactory, IViewIterator
};
export {default as CollectionItem, IOptions as ICollectionItemOptions} from './_display/CollectionItem';
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

import ExpandableMixin, {IOptions as IExpandableMixinOptions} from 'Controls/_display/ExpandableMixin';
export {ExpandableMixin, IExpandableMixinOptions};

export {default as IMarkable, TMarkerClassName} from './_display/interface/IMarkable';
export {default as ISelectableItem} from './_display/interface/ISelectableItem';

export {default as IGroupNode} from './_display/interface/IGroupNode';

import {default as CollectionItem} from 'Controls/_display/CollectionItem';
import BreadcrumbsItem from './_display/BreadcrumbsItem';
export {BreadcrumbsItem};

export {ANIMATION_STATE, IItemPadding} from './_display/interface/ICollection';
export {IEditableCollection} from './_display/interface/IEditableCollection';
export {IEditableCollectionItem} from './_display/interface/IEditableCollectionItem';
export {ICollectionItem} from './_display/interface/ICollectionItem';
export {IBaseCollection, TItemKey} from './_display/interface';

import {default as TileCollection} from './_display/TileCollection';
export {TileCollection};
import {default as TileCollectionItem} from './_display/TileCollectionItem';
export {TileCollectionItem};

import * as GridLadderUtil from './_display/utils/GridLadderUtil';
export {GridLadderUtil};
export {ILadderObject, IStickyColumn, ILadderConfig, IStickyLadderConfig, TLadderElement} from './_display/utils/GridLadderUtil';
export {default as isFullGridSupport} from './_display/utils/GridSupportUtil';
export {default as GridLayoutUtil} from './_display/utils/GridLayoutUtil';

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

import IItemsStrategy, {IOptions as IItemsStrategyOptions} from 'Controls/_display/IItemsStrategy';
import TreeItemDecorator from 'Controls/_display/TreeItemDecorator';
export {IItemsStrategy, IItemsStrategyOptions};

register('Controls/display:Collection', Collection, {instantiate: false});
register('Controls/display:CollectionItem', CollectionItem, {instantiate: false});
register('Controls/display:Enum', Enum, {instantiate: false});
register('Controls/display:Flags', Flags, {instantiate: false});
register('Controls/display:FlagsItem', FlagsItem, {instantiate: false});

register('Controls/display:GroupItem', GroupItem, {instantiate: false});
register('Controls/display:TileCollection', TileCollection, {instantiate: false});
register('Controls/display:TileCollectionItem', TileCollectionItem, {instantiate: false});
register('Controls/display:Tree', Tree, {instantiate: false});
register('Controls/display:TreeChildren', TreeChildren, {instantiate: false});
register('Controls/display:TreeItem', TreeItem, {instantiate: false});
register('Controls/display:TreeItemDecorator', TreeItemDecorator, {instantiate: false});
