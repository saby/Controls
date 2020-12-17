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
 * @includes LoadingIndicatorTemplate Controls/_list/interface/LoadingIndicatorTemplate
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
 * @includes LoadingIndicatorTemplate Controls/_list/interface/LoadingIndicatorTemplate
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
export {IBaseGroupTemplateOptions} from 'Controls/_list/interface/BaseGroupTemplate';
export {IContentTemplateOptions} from 'Controls/_list/interface/IContentTemplate';
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
 * Набор констант, используемых при работе с {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактированием по месту}.
 * @public
 */ 
const editing = {
    /**
     * С помощью этой константы можно отменить запуск {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования по месту}.
     * Для этого константу следует вернуть из обработчика события {@link Controls/interface/IEditableList#beforeBeginEdit beforeBeginEdit}.
     */
    /*
     * Constant that can be returned in {@link Controls/interface/IEditableList#beforeBeginEdit beforeBeginEdit} to cancel editing
     */
    CANCEL: 'Cancel'
};

import {groupConstants} from './display';
import {CursorDirection} from './interface';

export {CursorDirection, groupConstants, editing};
