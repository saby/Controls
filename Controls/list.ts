/**
 * Библиотека контролов, которые реализуют плоский список. Список может строиться по данным, полученным из источника. Также можно организовать удаление и перемещение данных.
 * @library Controls/list
 * @includes BaseItemTemplate Controls/_list/interface/BaseItemTemplate
 * @includes IContentTemplate Controls/_list/interface/IContentTemplate
 * @includes ItemTemplate Controls/_list/interface/ItemTemplate
 * @includes EmptyTemplate Controls/_list/interface/EmptyTemplate
 * @includes BaseGroupTemplate Controls/_list/interface/BaseGroupTemplate
 * @includes GroupTemplate Controls/_list/interface/GroupTemplate
 * @includes EditingTemplate Controls/_list/interface/EditingTemplate
 * @includes BaseEditingTemplate Controls/_list/interface/BaseEditingTemplate
 * @includes NumberEditingTemplate Controls/_list/interface/NumberEditingTemplate
 * @includes MoneyEditingTemplate Controls/_list/interface/MoneyEditingTemplate
 * @public
 * @author Крайнов Д.О.
 */

/*
 * List library
 * @library Controls/list
 * @includes BaseItemTemplate Controls/_list/interface/BaseItemTemplate
 * @includes IContentTemplate Controls/_list/interface/IContentTemplate
 * @includes ItemTemplate Controls/_list/interface/ItemTemplate
 * @includes EmptyTemplate Controls/_list/interface/EmptyTemplate
 * @includes BaseGroupTemplate Controls/_list/interface/BaseGroupTemplate
 * @includes GroupTemplate Controls/_list/interface/GroupTemplate
 * @includes EditingTemplate Controls/_list/interface/EditingTemplate
 * @includes BaseEditingTemplate Controls/_list/interface/BaseEditingTemplate
 * @includes NumberEditingTemplate Controls/_list/interface/NumberEditingTemplate
 * @includes MoneyEditingTemplate Controls/_list/interface/MoneyEditingTemplate
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
import {IList} from './_list/interface/IList';
import IListNavigation from './_list/interface/IListNavigation';
import { CssClassList, createClassListCollection} from 'Controls/_list/resources/utils/CssClassList';
import {getItemsBySelection} from 'Controls/_list/resources/utils/getItemsBySelection';

import ItemActionsHelpers = require('Controls/_list/ItemActions/Helpers');

// region @deprecated

import _itemActionsForTemplate = require('wml!Controls/_list/ItemActions/resources/ItemActionsFor');
import ItemActionsTemplate = require('wml!Controls/_list/ItemActions/resources/ItemActionsTemplate');
import _swipeActionTemplate = require('wml!Controls/_list/ItemActions/resources/SwipeAction');
import SwipeTemplate = require('wml!Controls/_list/ItemActions/resources/SwipeTemplate');
import Remover = require('Controls/_list/Remover');
import * as Mover from 'Controls/_list/Mover';
export {IMoveItemsParams, IMover, IRemover, BEFORE_ITEMS_MOVE_RESULT} from 'Controls/_list/interface/IMoverAndRemover';
export {
    _itemActionsForTemplate,
    ItemActionsTemplate,
    _swipeActionTemplate,
    SwipeTemplate
}

// endregion @deprecated

export {MoveController, IMoveControllerOptions}  from 'Controls/_list/Controllers/MoveController';
export {IMovableList} from 'Controls/_list/interface/IMovableList';

export {RemoveController, IRemoveControllerOptions} from 'Controls/_list/Controllers/RemoveController';
export {IRemovableList} from 'Controls/_list/interface/IRemovableList';
export {IClickableView} from 'Controls/_list/interface/IClickableView';
export {ISorting} from 'Controls/_interface/ISorting';
export {IHierarchy} from 'Controls/_interface/IHierarchy';


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
    IList,
    VirtualScroll,
    ScrollController,
    IListNavigation
};
