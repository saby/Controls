/**
 * Библиотека, которая предоставляет операции с записью коллекции.
 * @library Controls/itemActions
 * @public
 * @author Аверкиев П.А.
 */

/*
 * Library that provides collection item actions
 * @library Controls/itemActions
 * @public
 * @author Аверкиев П.А.
 */

export {
    TItemActionVisibilityCallback,
    TEditArrowVisibilityCallback,
    TItemActionShowType,
    TItemActionsPosition,
    TActionCaptionPosition,
    TActionDisplayMode,
    TIconStyle,
    IItemAction
} from './_itemActions/interface/IItemAction';
export {IShownItemAction, IItemActionsContainer} from './_itemActions/interface/IItemActionsContainer';
export {IContextMenuConfig} from './_itemActions/interface/IContextMenuConfig';
export {IItemActionsItem} from './_itemActions/interface/IItemActionsItem';
export {IItemActionsCollection} from './_itemActions/interface/IItemActionsCollection';
export {IItemActionsTemplateConfig} from './_itemActions/interface/IItemActionsTemplateConfig';
export {IItemActionsOptions} from './_itemActions/interface/IItemActionsOptions';
export {Controller} from './_itemActions/Controller';
export {Utils} from './_itemActions/Utils';

import * as ItemActionsForTemplate from 'wml!Controls/_itemActions/resources/templates/ItemActionsFor';
import * as ItemActionsTemplate from 'wml!Controls/_itemActions/resources/templates/ItemActionsTemplate';
import * as SwipeActionTemplate from 'wml!Controls/_itemActions/resources/templates/SwipeAction';
import * as SwipeActionsTemplate from 'wml!Controls/_itemActions/resources/templates/SwipeTemplate';

export {
    ItemActionsForTemplate,
    ItemActionsTemplate,
    SwipeActionTemplate,
    SwipeActionsTemplate
};
