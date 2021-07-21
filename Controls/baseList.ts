/**
 * Библиотека, содержащая базовые модули, необходимые для работы всех видов списков.
 * Должна в прямую импортироваться только списковыми контролами, все остальные контролы должны тянуть библиотеку
 * конкретного вида списка (таблица, плитка, дерево и т.п.).
 *
 * @library
 * @private
 * @author Уфимцев Д.Ю.
 */

//region interfaces
export {IList} from './_baseList/interface/IList';
export * from './_baseList/interface/IEditableList';
export * from 'Controls/_baseList/interface/IMovableList';
export {IVirtualScrollConfig} from './_baseList/interface/IVirtualScroll';
export {IRemovableList} from 'Controls/_baseList/interface/IRemovableList';
export {default as IListNavigation} from './_baseList/interface/IListNavigation';
export {IBaseGroupTemplate} from 'Controls/_baseList/interface/BaseGroupTemplate';
export {TCursor, TBackgroundColorStyle} from './_baseList/interface/BaseItemTemplate';
export {ISiblingStrategy, ISiblingStrategyOptions} from 'Controls/_baseList/interface/ISiblingStrategy';
export {IListViewOptions} from 'Controls/_baseList/ListView';
//endregion

//region templates
import ForTemplate = require('wml!Controls/_baseList/Render/For');
import ItemTemplate = require('wml!Controls/_baseList/ItemTemplate');
import GroupTemplate = require('wml!Controls/_baseList/GroupTemplate');
import FooterTemplate = require('wml!Controls/_baseList/ListView/Footer');
import MultiSelectTemplate = require('wml!Controls/_baseList/Render/multiSelect');
import EditingTemplate = require('wml!Controls/_baseList/EditInPlace/EditingTemplate');
import MoneyEditingTemplate = require('wml!Controls/_baseList/EditInPlace/decorated/Money');
import NumberEditingTemplate = require('wml!Controls/_baseList/EditInPlace/decorated/Number');

export {
    ForTemplate,
    ItemTemplate,
    GroupTemplate,
    FooterTemplate,
    EditingTemplate,
    // TODO: Удалить по https://online.sbis.ru/opendoc.html?guid=d63d6b23-e271-4d0b-a015-1ad37408b76b
    EditingTemplate as BaseEditingTemplate,
    MultiSelectTemplate,
    MoneyEditingTemplate,
    NumberEditingTemplate
};
//endregion

//region controls
import ListView = require('Controls/_baseList/ListView');
import ScrollEmitter = require('Controls/_baseList/BaseControl/Scroll/Emitter');

export {
    ListView,
    ScrollEmitter
};

export {default as View} from 'Controls/_baseList/List';
export {default as DataContainer, IDataOptions} from 'Controls/_baseList/Data';
export {default as ItemsView, IItemsViewOptions} from 'Controls/_baseList/ItemsView';
export {
    IBaseControlOptions,
    default as ListControl,
    default as BaseControl,
    LIST_EDITING_CONSTANTS as editing
} from 'Controls/_baseList/BaseControl';
//endregion

//region utils
export {getItemsBySelection} from './_baseList/resources/utils/getItemsBySelection';
export {default as InertialScrolling} from './_baseList/resources/utils/InertialScrolling';
export {CssClassList, createClassListCollection} from './_baseList/resources/utils/CssClassList';
//endregion

//region controllers
export * from './_baseList/Controllers/Grouping';
export {default as ScrollController} from './_baseList/ScrollController';
export {RemoveController} from 'Controls/_baseList/Controllers/RemoveController';
export {default as VirtualScroll} from './_baseList/ScrollContainer/VirtualScroll';
export {MoveController, IMoveControllerOptions}  from 'Controls/_baseList/Controllers/MoveController';
//endregion

// region Indicators
export * as IndicatorTemplate from 'wml!Controls/_baseList/indicators/IndicatorTemplate';
export * as LoadingIndicatorItemTemplate from 'wml!Controls/_baseList/indicators/LoadingIndicatorTemplate';
export * as LoadingTriggerItemTemplate from 'wml!Controls/_baseList/indicators/LoadingTriggerTemplate';
export * as LoadingIndicatorTemplate from 'wml!Controls/_baseList/indicators/PortionedSearchTemplate';
export * as ContinueSearchTemplate from 'wml!Controls/_baseList/indicators/ContinueSearchTemplate';
// endregion Indicators

export {groupConstants, IHiddenGroupPosition, IItemPadding, MultiSelectAccessibility, TRoundBorder} from './display';
