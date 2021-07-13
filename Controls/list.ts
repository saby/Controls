/**
 * Библиотека контролов, которые реализуют плоский список. Список может строиться по данным, полученным из источника. Также можно организовать удаление и перемещение данных.
 * @library
 * @includes ItemTemplate Controls/_list/interface/ItemTemplate
 * @includes IClickableView Controls/_list/interface/IClickableView
 * @includes IBaseItemTemplate Controls/_list/interface/IBaseItemTemplate
 * @includes IContentTemplate Controls/_list/interface/IContentTemplate
 * @includes EmptyTemplate Controls/_list/interface/EmptyTemplate
 * @includes GroupTemplate Controls/_list/interface/GroupTemplate
 * @includes EditingTemplate Controls/_list/interface/EditingTemplate
 * @includes NumberEditingTemplate Controls/_list/interface/NumberEditingTemplate
 * @includes MoneyEditingTemplate Controls/_list/interface/MoneyEditingTemplate
 * @includes LoadingIndicatorTemplate Controls/_list/interface/LoadingIndicatorTemplate
 * @includes IReloadableList Controls/_list/interface/IReloadableList
 * @includes IEditableList Controls/_list/interface/IEditableList
 * @includes IItemsView Controls/_list/IItemsView
 * @includes DataContainer Controls/_list/Data
 * @includes editing Controls/list:editing
 * @includes groupConstants Controls/list:groupConstants
 * @includes IBaseGroupTemplate Controls/_list/interface/IBaseGroupTemplate
 * @includes IItemPadding Controls/_display/interface/ICollection/IItemPadding
 * @includes IList Controls/_list/interface/IList
 * @includes IListNavigation Controls/_list/interface/IListNavigation
 * @includes IMovableList Controls/_baseList/interface/IMovableList:IMovableList
 * @includes IMoveDialogTemplate Controls/_baseList/interface/IMovableList:IMoveDialogTemplate
 * @includes IRemovableList Controls/_list/interface/IRemovableList
 * @includes ItemsView Controls/list:ItemsView
 * @includes IVirtualScrollConfig Controls/_list/interface/IVirtualScrollConfig
 * @includes MoveController Controls/_list/Controllers/MoveController
 * @includes MultiSelectAccessibility Controls/_display/Collection:MultiSelectAccessibility
 * @includes RemoveController Controls/_baseList/Controllers/RemoveController:RemoveController
 * @includes View Controls/_list/List
 * @includes IEditingConfig Controls/_list/interface/IEditableList/IEditingConfig
 * @includes IItemAddOptions Controls/_list/interface/IEditableList/IItemAddOptions
 * @includes IItemEditOptions Controls/_list/interface/IEditableList/IItemEditOptions
 * @public
 * @author Крайнов Д.О.
 */

/*
 * List library
 * @library
 * @includes ItemTemplate Controls/_list/interface/ItemTemplate
 * @includes IClickableView Controls/_list/interface/IClickableView
 * @includes IBaseItemTemplate Controls/_list/interface/IBaseItemTemplate
 * @includes IContentTemplate Controls/_list/interface/IContentTemplate
 * @includes EmptyTemplate Controls/_list/interface/EmptyTemplate
 * @includes GroupTemplate Controls/_list/interface/GroupTemplate
 * @includes EditingTemplate Controls/_list/interface/EditingTemplate
 * @includes NumberEditingTemplate Controls/_list/interface/NumberEditingTemplate
 * @includes MoneyEditingTemplate Controls/_list/interface/MoneyEditingTemplate
 * @includes LoadingIndicatorTemplate Controls/_list/interface/LoadingIndicatorTemplate
 * @includes IReloadableList Controls/_list/interface/IReloadableList
 * @includes IEditableList Controls/_list/interface/IEditableList
 * @includes IItemsView Controls/_list/IItemsView
 * @includes DataContainer Controls/_list/Data
 * @includes editing Controls/list:editing
 * @includes groupConstants Controls/list:groupConstants
 * @includes IBaseGroupTemplate Controls/_list/interface/IBaseGroupTemplate
 * @includes IItemPadding Controls/_display/interface/ICollection/IItemPadding
 * @includes IList Controls/_list/interface/IList
 * @includes IListNavigation Controls/_list/interface/IListNavigation
 * @includes IMovableList Controls/_baseList/interface/IMovableList:IMovableList
 * @includes IMoveDialogTemplate Controls/_baseList/interface/IMovableList:IMoveDialogTemplate
 * @includes IRemovableList Controls/_list/interface/IRemovableList
 * @includes ItemsView Controls/list:ItemsView
 * @includes IVirtualScrollConfig Controls/_list/interface/IVirtualScrollConfig
 * @includes MoveController Controls/_list/Controllers/MoveController
 * @includes MultiSelectAccessibility Controls/_display/Collection:MultiSelectAccessibility
 * @includes RemoveController Controls/_baseList/Controllers/RemoveController:RemoveController
 * @includes View Controls/_list/List
 * @public
 * @author Крайнов Д.О.
 */

import EmptyTemplate = require('wml!Controls/_list/emptyTemplate');
import LoadingIndicatorTemplate = require('wml!Controls/_list/PortionedSearchTemplate');
import GroupContentResultsTemplate = require('wml!Controls/_list/GroupContentResultsTemplate');
import * as CharacteristicsTemplate from 'wml!Controls/_list/CharacteristicsTemplate/CharacteristicsTemplate';
import BaseAction from 'Controls/_list/BaseAction';
import HotKeysContainer from 'Controls/_list/HotKeysContainer';
import ItemActionsHelpers = require('Controls/_list/ItemActions/Helpers');

// region @deprecated

import Remover = require('Controls/_list/Remover');
import Mover from 'Controls/_list/WrappedMover';
export {IMoveItemsParams, IMover, IRemover, BEFORE_ITEMS_MOVE_RESULT} from 'Controls/_list/interface/IMoverAndRemover';

// endregion @deprecated

export * from 'Controls/baseList';
export {
    EmptyTemplate,
    BaseAction,
    Mover,
    Remover,
    CharacteristicsTemplate,

    ItemActionsHelpers,
    GroupContentResultsTemplate,
    LoadingIndicatorTemplate,
    HotKeysContainer
};
export {default as AddButton} from 'Controls/_list/AddButton';
export {default as Container} from 'Controls/_list/WrappedContainer';
