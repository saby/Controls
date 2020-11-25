/**
 * Библиотека контролов, которые реализуют плоский список. Список может строиться по данным, полученным из источника. Также можно организовать удаление и перемещение данных.
 * @library Controls/list
 * @includes AddButton Controls/_list/AddButton
 * @includes Container Controls/_list/Container
 * @includes BaseItemTemplate Controls/_list/interface/BaseItemTemplate
 * @includes IContentTemplate Controls/_list/interface/IContentTemplate
 * @includes ItemTemplate Controls/_list/interface/ItemTemplate
 * @includes EmptyTemplate Controls/_list/interface/EmptyTemplate
 * @includes BaseGroupTemplate Controls/_list/interface/BaseGroupTemplate
 * @includes GroupTemplate Controls/_list/interface/GroupTemplate
 * @includes EditingTemplate Controls/_list/interface/EditingTemplate
 * @includes View Controls/_list/List
 * @includes BaseAction Controls/_list/BaseAction
 * @includes Mover Controls/_list/Mover
 * @includes Remover Controls/_list/Remover
 * @includes IRemovableList Controls/_list/interface/IRemovableList
 * @includes DataContainer Controls/_list/Data
 * @includes IHierarchy Controls/_interface/IHierarchy
 * @includes IList Controls/_list/interface/IList
 * @includes IList Controls/_list/interface/IList/IItemPadding
 * @includes ISorting Controls/_interface/ISorting
 * @includes ItemActionsHelper Controls/_list/ItemActions/Helpers
 * @includes HotKeysContainer Controls/_list/HotKeysContainer
 * @includes IVirtualScrollConfig Controls/_list/interface/IVirtualScrollConfig
 * @includes BaseEditingTemplate Controls/_list/interface/BaseEditingTemplate
 * @includes NumberEditingTemplate Controls/_list/interface/NumberEditingTemplate
 * @includes MoneyEditingTemplate Controls/_list/interface/MoneyEditingTemplate
 * @includes MoveController Controls/_list/Controllers/MoveController
 * @includes IMoveControllerOptions Controls/_list/Controllers/MoveController/IMoveControllerOptions
 * @includes IRemoveControllerOptions Controls/_list/Controllers/RemoveController/IRemoveControllerOptions
 * @includes RemoveController Controls/_list/Controllers/RemoveController
 * @includes IClickableView Controls/_list/interface/IClickableView
 * @includes IListNavigation Controls/_list/interface/IListNavigation
 * @includes IReloadableList Controls/_list/interface/IReloadableList
 * @includes IMovableList Controls/_list/interface/IMovableList
 * @includes IMoveDialogTemplate Controls/_list/interface/IMovableList/IMoveDialogTemplate
 * @includes IMovableOptions Controls/_list/interface/IMovableList/IMovableOptions
 * @includes IMarkerListOptions Controls/_marker/interface/IMarkerListOptions
 * @public
 * @author Крайнов Д.О.
 */

/*
 * List library
 * @library Controls/list
 * @includes AddButton Controls/_list/AddButton
 * @includes Container Controls/_list/Container
 * @includes BaseItemTemplate Controls/_list/interface/BaseItemTemplate
 * @includes IContentTemplate Controls/_list/interface/IContentTemplate
 * @includes ItemTemplate Controls/_list/interface/ItemTemplate
 * @includes EmptyTemplate Controls/_list/interface/EmptyTemplate
 * @includes BaseGroupTemplate Controls/_list/interface/BaseGroupTemplate
 * @includes GroupTemplate Controls/_list/interface/GroupTemplate
 * @includes EditingTemplate Controls/_list/interface/EditingTemplate
 * @includes View Controls/_list/List
 * @includes BaseAction Controls/_list/BaseAction
 * @includes Mover Controls/_list/Mover
 * @includes Remover Controls/_list/Remover
 * @includes IRemovableList Controls/_list/interface/IRemovableList
 * @includes DataContainer Controls/_list/Data
 * @includes IHierarchy Controls/_interface/IHierarchy
 * @includes IList Controls/_list/interface/IList
 * @includes IList Controls/_list/interface/IList/IItemPadding
 * @includes ItemActionsHelper Controls/_list/ItemActions/Helpers
 * @includes HotKeysContainer Controls/_list/HotKeysContainer
 * @includes IVirtualScrollConfig Controls/_list/interface/IVirtualScrollConfig
 * @includes BaseEditingTemplate Controls/_list/interface/BaseEditingTemplate
 * @includes NumberEditingTemplate Controls/_list/interface/NumberEditingTemplate
 * @includes MoneyEditingTemplate Controls/_list/interface/MoneyEditingTemplate
 * @includes MoveController Controls/_list/Controllers/MoveController
 * @includes IMoveControllerOptions Controls/_list/Controllers/MoveController/IMoveControllerOptions
 * @includes RemoveController Controls/_list/Controllers/RemoveController
 * @includes IClickableView Controls/_list/interface/IClickableView
 * @includes IListNavigation Controls/_list/interface/IListNavigation
 * @includes IMovableList Controls/_list/interface/IMovableList
 * @includes IMoveDialogTemplate Controls/_list/interface/IMovableList/IMoveDialogTemplate
 * @includes IMovableOptions Controls/_list/interface/IMovableList/IMovableOptions
 * @public
 * @author Крайнов Д.О.
 */
import AddButton = require('Controls/_list/AddButton');
import {default as Container} from 'Controls/_list/Container';
import EmptyTemplate = require('wml!Controls/_list/emptyTemplate');
import GroupTemplate = require('wml!Controls/_list/GroupTemplate');
import ItemTemplate = require('wml!Controls/_list/ItemTemplateChooser');
import {default as View} from 'Controls/_list/List';
import BaseAction from 'Controls/_list/BaseAction';
import LoadingIndicatorTemplate = require('wml!Controls/_list/LoadingIndicatorTemplate');
import ContinueSearchTemplate = require('wml!Controls/_list/resources/ContinueSearchTemplate');
import {default as DataContainer} from 'Controls/_list/Data';
import _forTemplate = require('wml!Controls/_list/resources/For');
import EditingTemplate = require('wml!Controls/_list/EditingTemplateChooser');
import BaseEditingTemplate = require('wml!Controls/_list/EditInPlace/baseEditingTemplate');
import MoneyEditingTemplate = require('wml!Controls/_list/EditInPlace/decorated/MoneyChooser');
import NumberEditingTemplate = require('wml!Controls/_list/EditInPlace/decorated/NumberChooser');

import BaseViewModel = require('Controls/_list/BaseViewModel');
import ListViewModel = require('Controls/_list/ListViewModel');
import {default as ListControl} from 'Controls/_list/ListControl';
import ListView = require('Controls/_list/ListView');
import GroupContentResultsTemplate = require('wml!Controls/_list/GroupContentResultsTemplate');
import ItemsUtil = require('Controls/_list/resources/utils/ItemsUtil');
import TreeItemsUtil = require('Controls/_list/resources/utils/TreeItemsUtil');
import BaseControl = require('Controls/_list/BaseControl');
import ScrollEmitter = require('Controls/_list/BaseControl/Scroll/Emitter');
import SearchItemsUtil = require('Controls/_list/resources/utils/SearchItemsUtil');
import ItemsView = require('Controls/_list/ItemsView');
import ItemsViewModel = require('Controls/_list/ItemsViewModel');
import HotKeysContainer from 'Controls/_list/HotKeysContainer';
import InertialScrolling from 'Controls/_list/resources/utils/InertialScrolling';
import {IVirtualScrollConfig} from './_list/interface/IVirtualScroll';
import {VirtualScroll} from './_list/ScrollContainer/VirtualScroll';
import {default as ScrollController} from './_list/ScrollController';
import {IList, IItemPadding} from './_list/interface/IList';
import IListNavigation from './_list/interface/IListNavigation';
import { CssClassList, createClassListCollection} from 'Controls/_list/resources/utils/CssClassList';
import {getItemsBySelection} from 'Controls/_list/resources/utils/getItemsBySelection';

import ItemActionsHelpers = require('Controls/_list/ItemActions/Helpers');

// region @deprecated

import Remover = require('Controls/_list/Remover');
import * as Mover from 'Controls/_list/Mover';
export {IMoveItemsParams, IMover, IRemover, BEFORE_ITEMS_MOVE_RESULT} from 'Controls/_list/interface/IMoverAndRemover';

// endregion @deprecated

export {MoveController, IMoveControllerOptions}  from 'Controls/_list/Controllers/MoveController';
export {IMovableList, IMoveDialogTemplate, IMovableOptions} from 'Controls/_list/interface/IMovableList';

export {RemoveController} from 'Controls/_list/Controllers/RemoveController';
export {IRemovableList} from 'Controls/_list/interface/IRemovableList';
export {BaseGroupTemplate} from 'Controls/_list/interface/BaseGroupTemplate';
export {IContentTemplate} from 'Controls/_list/interface/IContentTemplate';
export {IBaseItemTemplateOptions} from 'Controls/_list/interface/BaseItemTemplate';

export {
    AddButton,
    Container,
    EmptyTemplate,
    GroupTemplate,
    ItemTemplate,
    View,
    BaseAction,
    Mover,
    Remover,
    DataContainer,
    _forTemplate,

    EditingTemplate,
    BaseEditingTemplate,
    MoneyEditingTemplate,
    NumberEditingTemplate,
    ItemActionsHelpers,
    BaseViewModel,
    ListViewModel,
    ListControl,
    ListView,
    GroupContentResultsTemplate,
    ItemsUtil,
    TreeItemsUtil,
    BaseControl,
    ScrollEmitter,
    SearchItemsUtil,
    CssClassList,
    createClassListCollection,
    getItemsBySelection,
    ItemsView,
    ItemsViewModel,
    LoadingIndicatorTemplate,
    ContinueSearchTemplate,
    HotKeysContainer,
    InertialScrolling,
    IVirtualScrollConfig,
    IItemPadding,
    IList,
    VirtualScroll,
    ScrollController,
    IListNavigation
};

/**
 * Константы:
 * - groupConstants.hiddenGroup — константа для определения элемента hiddenGroup в {@link Controls/interface/IGroupedList#groupProperty groupProperty};
 * - editing.CANCEL — константа, которую можно вернуть в {@link Controls/interface/IEditableList#beforeBeginEdit beforeBeginEdit} для отмены редактирования.
 * - CursorDirection - enum, направление выборки при навигации по курсору.
 *
 * @public
 */

/*
 * Constants
 * <ul>
 *    <li>
 *       groupConstants.hiddenGroup - Constant for determining item in the hiddenGroup in the {@link Controls/interface/IGroupedList#groupProperty groupProperty}
 *    </li>
 *    <li>
 *       editing.CANCEL - Constant that can be returned in {@link Controls/interface/IEditableList#beforeBeginEdit beforeBeginEdit} to cancel editing
 *    </li>
 *    <li>
 *       CursorDirection - enum, navigation direction variants for cursor navigation
 *    </li>
 * </ul>
 *
 * @class Controls/list
 * @public
 */

const editing = {
    CANCEL: 'Cancel'
};

import {groupConstants} from './_list/Controllers/Grouping';
import {CursorDirection} from './_interface/INavigation';

export {CursorDirection, groupConstants, editing};
