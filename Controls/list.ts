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
import {TCursor, TBackgroundColorStyle} from './_list/interface/BaseItemTemplate';

// region @deprecated

import Remover = require('Controls/_list/Remover');
import Mover from 'Controls/_list/WrappedMover';
export {IMoveItemsParams, IMover, IRemover, BEFORE_ITEMS_MOVE_RESULT} from 'Controls/_list/interface/IMoverAndRemover';

// endregion @deprecated
import * as MultiSelectTemplate from 'wml!Controls/_list/Render/multiSelect';
export { MultiSelectTemplate };

import * as EditingTemplate from 'wml!Controls/_list/EditInPlace/EditingTemplate';

export * from 'Controls/baseList';
export {
    EmptyTemplate,
    BaseAction,
    Mover,
    Remover,
    CharacteristicsTemplate,

    EditingTemplate,
    // TODO: Удалить по https://online.sbis.ru/opendoc.html?guid=d63d6b23-e271-4d0b-a015-1ad37408b76b
    EditingTemplate as BaseEditingTemplate,
    ItemActionsHelpers,
    GroupContentResultsTemplate,
    LoadingIndicatorTemplate,
    HotKeysContainer
};
export {default as AddButton} from 'Controls/_list/AddButton';
export {default as Container} from 'Controls/_list/WrappedContainer';
