import { TemplateFunction } from 'UI/Base';
import { IItemAction, IContextMenuConfig } from 'Controls/itemActions';

/**
 * Интерфейс для списков.
 *
 * @interface Controls/_list/interface/IList
 * @public
 * @author Авраменко А.С.
 */

type TMultiSelectVisibility = 'visible'|'onhover'|'hidden';
/**
 * @typedef {String} TIconStyle
 * @variant secondary
 * @variant warning
 * @variant danger
 * @variant success
 */
type TIconStyle = 'secondary'|'warning'|'danger'|'success';
/**
 * @typedef {String} TItemActionsPosition
 * @variant inside Внутри элемента.
 * @variant outside Под элементом.
 * @variant custom Произвольная позиция отображения. Задаётся через шаблон {@link Controls/interface/IItemTemplate itemTemplate}.
 */
type TItemActionsPosition = 'inside'|'outside'|'custom';
/**
 * @typedef {String} TActionAlignment
 * @variant horizontal По горизонтали.
 * @variant vertical По вертикали.
 */
type TActionAlignment = 'horizontal'|'vertical';
/**
 * @typedef {String} TActionCaptionPosition
 * @variant right Справа от иконки опции записи.
 * @variant bottom Под иконкой опции записи.
 * @variant none Не будет отображаться.
 */
type TActionCaptionPosition = 'right'|'bottom'|'none';
/**
 * @typedef {String} TActionDisplayMode
 * @variant title Показывать только заголовок.
 * @variant icon Показывать только иконку.
 * @variant both Показывать иконку и заголовок.
 * @variant auto Если есть иконка, то показывать иконку, иначе заголовок.
 */
type TActionDisplayMode = 'title'|'icon'|'both'|'auto';
type TMarkerVisibility = 'visible'|'onactivated'|'hidden';
type TListStyle = 'master'|'default';
type TVerticalItemPadding = 'S'|null;
type THorizontalItemPadding = 'XS'|'S'|'M'|'L'|'XL'|'XXL'|null;

interface IItemPadding {
    top?: TVerticalItemPadding;
    bottom?: TVerticalItemPadding;
    left?: THorizontalItemPadding;
    right?: THorizontalItemPadding;
}

export interface IList {
    contextMenuVisibility?: boolean;
    contextMenuConfig?: IContextMenuConfig;
    emptyTemplate?: TemplateFunction|string;
    footerTemplate?: TemplateFunction|string;
    multiSelectVisibility?: TMultiSelectVisibility;
    itemActions?: IItemAction[];
    itemActionsPosition?: TItemActionsPosition;
    actionAlignment?: TActionAlignment;
    actionCaptionPosition?: TActionCaptionPosition;
    itemActionVisibilityCallback?: (action: IItemAction, item) => boolean;
    itemActionsProperty?: string;
    markedKey?: string|number;
    markerVisibility?: TMarkerVisibility;
    uniqueKeys?: boolean;
    itemsReadyCallback?: (items) => void;
    dataLoadCallback?: (items) => void;
    dataLoadErrback?: () => void;
    style?: TListStyle;
    backgroundStyle?: string;
    itemPadding?: IItemPadding;
    nodeConfig?: INodeConfig;
}

/*ENG
 * Interface for lists.
 *
 * @interface Controls/_list/interface/IList
 * @public
 * @author Авраменко А.С.
 */

/**
 * @name Controls/_list/interface/IList#contextMenuVisibility
 * @cfg {Boolean} Определяет доступность контекстного меню строки при нажатии на правую кнопку мыши.
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FItemActionsPG">демо-пример</a>
 * @default true
 */

/**
 * @name Controls/_list/interface/IList#loadingIndicatorTemplate
 * @cfg {string|Function} Определяет шаблон индикатора загрузки данных.
 * @default Controls/list:LoadingIndicatorTemplate
 */

/*ENG
 * @name Controls/_list/interface/IList#contextMenuVisibility
 * @cfg {Boolean} Determines whether context menu should be shown on right-click.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FItemActionsPG">Example</a>.
 * @default true
 */

/**
 * @name Controls/_list/interface/IList#contextMenuConfig
 * @cfg {Controls/menu:IMenuControlOptions} Конфигурация для меню опции записи.
 * @remark
 * Набор опций передается объектом. Заданный объект мержится с минимальным объектом опций, отдаваемых в меню по-умолчанию.
 * В качестве ключей можно использовать следующие свойства:
 * * items — для смены набора элементов.
 * * groupProperty, groupTemplate для установки группировки.
 * * itemTemplate — шаблон элемента меню.
 * * footerTemplate — шаблон футера.
 * * headerTemplate — шаблон шапки.
 * * iconSize — размер иконок в выпадающем меню.
 */

/*ENG
 * @name Controls/_list/interface/IList#contextMenuConfig
 * @cfg {Object} Determines whether context menu should be shown on right-click.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FItemActionsPG">Example</a>.
 * @default true
 */

/**
 * @name Controls/_list/interface/IList#emptyTemplate
 * @cfg {Function} Шаблон отображения контрола без элементов.
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">демо-пример</a>.
 * @default Controls/list:EmptyTemplate
 * @example
 * <pre class="brush: html">
 *    <Controls.list:View>
 *       <ws:emptyTemplate>
 *          <ws:partial template="Controls/list:EmptyTemplate" topSpacing="xl" bottomSpacing="l">
 *             <ws:contentTemplate>Нет данных</ws:contentTemplate>
 *          </ws:partial>
 *       </ws:emptyTemplate>
 *    </Controls.list:View>
 * </pre>
 */

/*ENG
 * @name Controls/_list/interface/IList#emptyTemplate
 * @cfg {Function} Template for the empty list.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">Example</a>.
 * @remark
 * We recommend to use default template for emptyTemplate: Controls/list:EmptyTemplate
 * The template accepts the following options:
 * - contentTemplate content of emptyTemplate
 * - topSpacing Spacing between top border and content of emptyTemplate
 * - bottomSpacing Spacing between bottom border and content of emptyTemplate
 * @example
 * <pre>
 *    <Controls.list:View>
 *       <ws:emptyTemplate>
 *          <ws:partial template="Controls/list:EmptyTemplate" topSpacing="xl" bottomSpacing="l">
 *             <ws:contentTemplate>Нет данных</ws:contentTemplate>
 *          </ws:partial>
 *       </ws:emptyTemplate>
 *    </Controls.list:View>
 * </pre>
 */

/**
 * @name Controls/_list/interface/IList#footerTemplate
 * @cfg {Function} Шаблон подвала списка.
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">демо-пример</a>
 */

/*ENG
 * @name Controls/_list/interface/IList#footerTemplate
 * @cfg {Function} Template that will be rendered below the list.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">Example</a>.
 */

/**
 * @typedef {String} MultiSelectVisibility
 * @variant visible Показать.
 * @variant hidden Скрыть.
 * @variant onhover Показывать при наведении.
 */

/**
 * @name Controls/_list/interface/IList#multiSelectVisibility
 * @cfg {MultiSelectVisibility} Режим отображения флагов множественного выбора.
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FMultiselectPG">демо-пример</a>
 * @default hidden
 * @remark
 * Чтобы включить в списочном контроле режим "Множественный выбор элементов", обратитесь к <a href="/doc/platform/developmentapl/service-development/service-contract/logic/list/list-iterator/">руководству разработчика</a>.
 */

/*ENG
 * @typedef {String} MultiSelectVisibility
 * @variant visible Show.
 * @variant hidden Do not show.
 * @variant onhover Show on hover.
 */

/*ENG
 * @name Controls/_list/interface/IList#multiSelectVisibility
 * @cfg {MultiSelectVisibility} Whether multiple selection is enabled.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FMultiselectPG">Example</a>.
 * @default hidden
 */

/**
 * @typedef {Object} ItemAction
 * @property {String} id Идентификатор опции записи.
 * @property {String} title Название опции записи.
 * @property {String} tooltip Текст подсказки при наведении мыши.
 * @property {String} icon Имя иконки для опции записи.
 * @property {TActionDisplayMode} displayMode Режим отображения опции записи.
 * @property {Enum} [item.showType] Определяет, где будет отображаться элемент. Значение берется из утилиты {@link Controls/Utils/Toolbar}.
 * Доступные значения:
 * * showType.MENU — элемент отображается только в меню.
 * * showType.MENU_TOOLBAR — элемент отображается в меню и в тулбаре.
 * * showType.TOOLBAR — элемент отображается только в тулбаре.
 * @property {String} style Значение свойства преобразуется в CSS-класс вида "controls-itemActionsV__action_style_<значение_свойства>".
 * Он будет установлен для html-контейнера самой опции записи, и свойства класса будут применены как к тексту (см. title), так и к иконке (см. icon).
 * @property {TIconStyle} [iconStyle=secondary] Стиль иконки.
 * Каждому значению свойства соответствует стиль, который определяется {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/themes/ темой оформления} приложения.
 * @property {Function} handler Обработчик опции записи.
 * См. {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/handler-click/ пример обработчика}.
 * @property {String} parent Идентификатор родительской опции записи.
 * Используется для создания {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/hierarchy/ многоуровневого контекстного меню}.
 * @property {Boolean|null} parent@ Поле, описывающее тип узла (список, узел, скрытый узел).
 * Подробнее о различиях между типами узлов можно прочитать {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy здесь}.
 */

/*ENG
 * @typedef {Object} ItemAction
 * @property {String} id Identifier of operation.
 * @property {String} title Operation name.
 * @property {String} icon Operation icon.
 * @property {Enum} [item.showType] Determines where item is displayed. The value is taken from the util 'Controls/Utils/Toolbar'. {@link Controls/Utils/Toolbar Details}
 * Values:
 * showType.MENU - item is displayed only in the menu
 * showType.MENU_TOOLBAR - item is displayed in the menu and toolbar
 * showType.TOOLBAR - item is displayed only in the toolbar
 * @property {String} style Operation style. (secondary | warning | danger | success).
 * @property {String} iconStyle Style of the action's icon. (secondary | warning | danger | success).
 * @property {Function} handler Operation handler.
 * @property {String} parent Key of the action's parent.
 * @property {boolean|null} parent@ Field that describes the type of the node (list, node, hidden node).
 */

/**
 * @name Controls/_list/interface/IList#itemActions
 * @cfg {Array.<ItemAction>} Конфигурация опций записи.
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FItemActionsPG">демо-пример</a>.
 * Для корректной работы опций записи для контрола нужно задать значение в опции {@link Controls/list:View keyProperty}.
 * Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
 * @see itemActionsPosition
 * @see itemActionVisibilityCallback
 * @see itemActionsProperty
 * @see actionClick
 * @see actionAlignment
 * @see actionCaptionPosition
 */

/*ENG
 * @name Controls/_list/interface/IList#itemActions
 * @cfg {Array.<ItemAction>} Array of configuration objects for buttons which will be shown when the user hovers over an item.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FItemActionsPG">Example</a>.
 */

/**
 * @name Controls/_list/interface/IList#itemActionsPosition
 * @cfg {TItemActionsPosition} Позиционирование панели с опциями записи.
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FItemActionsPG">демо-пример</a>.
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FItemActionsCustom">демо-пример</a>.
 * Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
 * @example
 * Размещаем опции записи в шаблоне с использованием itemActionsTemplate:
 * <pre class="brush: html">
 * <Controls.list:View itemActionsPosition="custom" itemActions="{{_itemActions}}">
 *    <ws:itemTemplate>
 *      <ws:partial template="Controls/list:ItemTemplate">
 *        <ws:contentTemplate>
 *          <ws:partial template="wml!customTemplateName" scope="{{contentTemplate}}" />
 *        </ws:contentTemplate>
 *      </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.list:View>
 * </pre>
 *
 * <pre class="brush: html">
 * <!-- customTemplateName.wml -->
 * <div>{{itemData.item.title}}</div>
 *    <ws:if data="{{!itemData.isSwiped()}}">
 *       <ws:partial template="{{itemActionsTemplate}}"
 *                  attr:class="some-custom-class-for-itemActions"
 *                  itemData="{{itemData}}"
 *                  scope="{{_options}}"/>
 *    </ws:if>
 * <div>{{itemData.item.description}}</div>
 * </pre>
 * @see itemActions
 * @see itemActionVisibilityCallback
 * @see itemActionsProperty
 * @see actionClick
 * @see actionAlignment
 * @see actionCaptionPosition
 */

/*ENG
 * @name Controls/_list/interface/IList#itemActionsPosition
 * @cfg {String} Position of item actions.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FItemActionsPG">Example</a>.
 * @variant inside Item actions will be positioned inside the item's row.
 * @variant outside Item actions will be positioned under the item's row.
 * @variant custom Item actions must be positioned in the itemTemplate.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FItemActionsCustom">Example</a>.
 * @example
 * Placing Item Actions in custom item template using itemActionsTemplate
 *<pre>
 * <Controls.list:View
 *    itemActionsPosition="custom"
 *    itemActions="{{_itemActions}}">
 *    <ws:itemTemplate>
 *      <ws:partial template="Controls/list:ItemTemplate">
 *        <ws:contentTemplate>
 *          <ws:partial template="wml!customTemplateName" scope="{{contentTemplate}}" />
 *        </ws:contentTemplate>
 *      </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.list:View>
 *</pre>
 *
 * customTemplateName.wml:
 * <pre>
 *  <div>{{itemData.item.title}}</div>
 *    <ws:if data="{{!itemData.isSwiped()}}">
 *      <ws:partial template="{{itemActionsTemplate}}"
 *                  attr:class="some-custom-class-for-itemActions"
 *                  itemData="{{itemData}}"
 *                  scope="{{_options}}"/>
 *    </ws:if>
 *  <div>{{itemData.item.description}}</div>
 * </pre>
 *
 */

/**
 * @event Controls/_list/interface/IList#itemMouseEnter Происходит в момент, когда курсор оказывается над элементом списка.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр записи, на которую был наведен курсор.
 * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Дескриптор события мыши.
 */

/*ENG
 * @event Controls/_list/interface/IList#itemMouseEnter Occurs when the cursor is over the list item.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the item that the cursor was over.
 * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Descriptor of the mouse event
 */

/**
 * @event Controls/_list/interface/IList#itemMouseLeave Происходит в момент, когда курсор уходит за пределы элемента списка.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр записи, за пределы которой ушел курсор.
 * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Дескриптор события мыши.
 */

/*ENG
 * @event Controls/_list/interface/IList#itemMouseLeave Occurs when the cursor leaves the list item.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the item that the cursor was over.
 * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Descriptor of the mouse event
 */

/**
 * @event Controls/_list/interface/IList#itemMouseMove Происходит в момент, когда курсор двигается по элементам списка.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр записи, по которой двигается курсор.
 * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Дескриптор события мыши.
 */

/*ENG
 * @event Controls/_list/interface/IList#itemMouseMove Occurs when the cursor moves over list items.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the item that the cursor is moving along.
 * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Descriptor of the mouse event
 */

/**
 * @event Controls/_list/interface/IList#actionClick Происходит при клике по {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/index/ опции записи}.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {ItemAction} action Объект с конфигурацией опции записи, по которой выполнили клик.
 * @param {Types/entity:Model} item Экземпляр записи, для которой была отображена опция записи.
 * @param {HTMLElement} itemContainer Контейнер записи, по которой был выполнен клик.
 * @remark Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
 * @see itemActions
 * @see itemActionsPosition
 * @see itemActionVisibilityCallback
 * @see itemActionsProperty
 * @see actionAlignment
 * @see actionCaptionPosition
 */

/*ENG
 * @event Controls/_list/interface/IList#actionClick Occurs when itemAction button is clicked.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {ItemAction} action Object with configuration of the clicked action.
 * @param {Types/entity:Model} item Instance of the item whose action was clicked.
 * @param {HTMLElement} itemContainer Container of the item whose action was clicked.
 */

/**
 * @name Controls/_list/interface/IList#actionAlignment
 * @cfg {TActionAlignment} Выравнивание опций записи, когда они отображаются в режиме swipe.
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FSwipe%2FScenarios">демо-пример</a>.
 * Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
 * @see itemActions
 * @see itemActionsPosition
 * @see itemActionVisibilityCallback
 * @see itemActionsProperty
 * @see actionClick
 * @see actionCaptionPosition
 */

/*ENG
 * @name Controls/_list/interface/IList#actionAlignment
 * @cfg {String} Determines how item actions will be aligned on swipe.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FSwipe%2FScenarios">Example</a>.
 * @variant horizontal Actions will be displayed in a line.
 * @variant vertical Actions will be displayed in a line.
 */

/**
 * @name Controls/_list/interface/IList#actionCaptionPosition
 * @cfg {TActionCaptionPosition} Позиция заголовка для опций записи, когда они отображаются в режиме swipe.
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FSwipe%2FScenarios">демо-пример</a>.
 * Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
 * @see itemActions
 * @see itemActionsPosition
 * @see itemActionVisibilityCallback
 * @see itemActionsProperty
 * @see actionClick
 * @see actionAlignment
 */

/*ENG
 * @name Controls/_list/interface/IList#actionCaptionPosition
 * @cfg {String} Determines where the caption of an item action will be displayed on swipe.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FSwipe%2FScenarios">Example</a>.
 * @variant right Title will be displayed to the right of the action's icon.
 * @variant bottom Title will be displayed under the action's icon.
 * @variant none Title will not be displayed.
 */

/**
 * @name Controls/_list/interface/IList#itemActionVisibilityCallback
 * @cfg {Function} Функция обратного вызова для определения видимости опций записи.
 * @remark
 * Функция принимает два аргумента:
 *
 * * action — объект с конфигурацией опции записи.
 * * item — модель (см. {@link Types/entity:Model}), содержащая данные записи.
 *
 * Чтобы опция записи отображалась, из функции следует вернуть true.
 * Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
 * @example
 * Режим "Чтение" недоступен, если запись имеет свойство isNew === false.
 * 
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.list:View
 *     attr:class="demo-News"
 *     itemActions="{{_itemActions}}"
 *     source="{{_source}}"
 *     actionAlignment="vertical"
 *     actionCaptionPosition="bottom"
 *     markerVisibility="hidden"
 *     itemActionVisibilityCallback="{{_visibilityCallback}}"
 *     ...
 * </Controls.list:View>
 * </pre>
 * 
 * <pre class="brush: js">
 * // TypeScript
 *  ...
 *  private _visibilityCallback(action: IItemAction, item: Model): boolean {
 *   if (action.title === 'Read') {
 *     return item.get('isNew');
 *   }
 *   return true;
 *  }
 *  ...
 * </pre>
 * @see itemActions
 * @see itemActionsPosition
 * @see actionCaptionPosition
 * @see itemActionsProperty
 * @see actionClick
 * @see actionAlignment
 */

/*ENG
 * @name Controls/_list/interface/IList#itemActionVisibilityCallback
 * @cfg {Function} item operation visibility filter function
 * @param {ItemAction} action Object with configuration of an action.
 * @param {Types/entity:Model} item Instance of the item whose action is being processed.
 * @returns {Boolean} Determines whether the action should be rendered.
 * @example
 * Item action Read don't display if item has property isNew === false
 * <pre>
 *    <Controls.list:View attr:class="demo-News"
 *                        itemActions="{{_itemActions}}"
 *                        source="{{_source}}"
 *                        actionAlignment="vertical"
 *                        actionCaptionPosition="bottom"
 *                        markerVisibility="hidden"
 *                        itemActionVisibilityCallback="{{_visibilityCallback}}"
 *                        ...
 *   </Controls.list:View>
 * </pre>
 * <pre>
 *  ...
 *  private _visibilityCallback(action: IItemAction, item: Model): boolean {
 *   if (action.title === 'Read') {
 *     return item.get('isNew');
 *   }
 *   return true;
 *  }
 *  ...
 * </pre>
 */

/**
 * @name Controls/_list/interface/IList#itemActionsProperty
 * @cfg {String} Имя свойства, которое содержит конфигурацию для панели с опциями записи.
 * @remark
 * Функционал используют в тех случаях, когда опции записи привязаны к отображаемым данным.
 * Настройка для опций записи извлекается из данных самого элемента.
 * Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
 * @example
 * <pre class="brush: js">
 * _beforeMount: function(newOptions) {
 *    this._viewSource = new source.Memory({
 *       keyProperty: 'id',
 *       data: [
 *          {
 *             id: 0,
 *             title: 'The agencies’ average client makes about $32,000 a year.',
 *             itemActions: [
 *                {
 *                   id: 1,
 *                   title: 'Прочитано',
 *                   showType: showType.TOOLBAR,
 *                },
 *                {
 *                   id: 2,
 *                   icon: 'icon-PhoneNull',
 *                   title: 'Позвонить',
 *                   showType: showType.MENU_TOOLBAR,
 *                },
 *                {
 *                   id: 3,
 *                   icon: 'icon-EmptyMessage',
 *                   title: 'Написать',
 *                   showType: showType.TOOLBAR,
 *                }
 *             ]
 *          },
 *          ...
 *       ]
 *    });
 * }
 * </pre>
 * @see itemActions
 * @see itemActionsPosition
 * @see actionCaptionPosition
 * @see itemActionVisibilityCallback
 * @see actionClick
 * @see actionAlignment
 */

/*ENG
 * @name Controls/_list/interface/IList#itemActionsProperty
 * @cfg {String} Name of the item's property that contains item actions.
 */

/**
 * @name Controls/_list/interface/IList#markedKey
 * @cfg {Number} Идентификатор выделенной маркером строки.
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">демо-пример</a>.
 */

/*ENG
 * @name Controls/_list/interface/IList#markedKey
 * @cfg {Number} Identifier of the marked collection item.
 * @remark
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">Example</a>.
 */

/**
 * @typedef {String} MarkerVisibility
 * @variant visible Маркер отображается всегда, даже если ключевая запись не указана.
 * @variant hidden Маркер всегда скрыт.
 * @variant onactivated Маркер отображается при активации списка. Например, когда пользователь отмечает запись.
 */

/**
 * @name Controls/_list/interface/IList#markerVisibility
 * @cfg {MarkerVisibility} Режим отображения маркера строки.
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">демо-пример</a>.
 * @default onactivated
 */

/*ENG
 * @name Controls/_list/interface/IList#markerVisibility
 * @cfg {String} Determines when marker is visible.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">Example</a>.
 * @variant visible The marker is always displayed, even if the marked key entry is not specified.
 * @variant hidden The marker is always hidden.
 * @variant onactivated - The marker is displayed on List activating. For example, when user mark a record.
 * @default onactivated
 */

/**
 * @name Controls/_list/interface/IList#itemsReadyCallback
 * @cfg {Function} Функция, которая вызывается, когда экземпляр данных получен из источника и подготовлен к дальнейшей обработке контролом.
 * Функция вызывается единожды в рамках {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases жизненного цикла} на этапе mount.
 * @remark
 * Единственный аргумент функции — **items** с типом данных {@link Types/collection:RecordSet}, где содержатся загруженные данные.
 * @example
 * В качестве примера используем функцию для того, чтобы сохранить ссылку на items, чтобы иметь возможноcть изменять items далее.
 * <pre class="brush:html">
 * <Controls.list:View itemsReadyCallback="{{_myItemsReadyCallback}}" />
 * </pre>
 * <pre class="brush:js">
 * _myItemsReadyCallback = function(items) {
 *    this._myItems = items;
 * }
 * </pre>
 * <pre class="brush:js">
 * deleteButtonClickHandler: function{
 *    this._myItems.removeAt(0);
 * }
 * </pre>
 * @see dataLoadCallback
 */

/**
 * @name Controls/_list/interface/IList#dataLoadCallback
 * @cfg {Function} Функция, которая вызывается каждый раз непосредственно после загрузки данных из источника контрола.
 * Функцию можно использовать для изменения данных еще до того, как они будут отображены в контроле.
 * @remark
 * Единственный аргумент функции — **items** с типом данных {@link Types/collection:RecordSet}, где содержатся загруженные данные.
 * @example
 * <pre class="brush:html">
 * <Controls.list:View dataLoadCallback="{{_myDataLoadCallback}}" />
 * </pre>
 * <pre class="brush:js">
 * _myDataLoadCallback = function(items) {
 *    items.each(function(item) {
 *       item.set(field, value);
 *    });
 * }
 * </pre>
 * @see itemsReadyCallback
 */

/**
 * @name Controls/_list/interface/IList#dataLoadErrback
 * @cfg {Function} Функция обратного вызова для определения сбоя загрузки данных из источника.
 */

/*ENG
 * @name Controls/_list/interface/IList#dataLoadErrback
 * @cfg {Function} Callback function that will be called when data loading fail
 */

/**
 * @typedef {String} Style
 * @variant master Двухколоночный реестр.
 * @variant default Плоский список.
 */

/**
 * @name Controls/_list/interface/IList#style
 * @cfg {Style} Режим отображения списка.
 * @default default
 */

/*ENG
 * @typedef {String} Style
 * @variant master Stylizes control as MasterDetail
 * @variant default Simple list
 */

/*ENG
 * @name Controls/_list/interface/IList#style
 * @cfg {String} Control styling
 * @default default
 */

/**
 * @typedef {String} ReloadType
 * @variant query Элемент будет перезагружен с помощью метода "Поисковый запрос".
 * @variant read Элемент будет перезагружен с помощью метода "Прочитать".
 */

/*ENG
 * @typedef {String} ReloadType
 * @variant query Item will be reloaded with query method
 * @variant read Item will be reloaded with read method
 */

/**
 * Загружает модель из источника данных, объединяет изменения в текущих данные и отображает элемент.
 * @function Controls/_list/interface/IList#reloadItem
 * @param {String} key Идентификатор элемента коллекции, который должен быть перезагружен из источника.
 * @param {Object} readMeta Метаинформация, которая будет передана методу запроса/чтения.
 * @param {Boolean} replaceItem Определяет, как загруженный элемент будет применяться к коллекции.
 * Если параметр имеет значение true, элемент коллекции будет заменен загруженным элементом.
 * Если параметр имеет значение false (по умолчанию), загруженные элементы будут объединены в элемент коллекции.
 * @param {ReloadType} [reloadType=read] Определяет, как будет загружен элемент.
 * @example
 * <pre class="brush: js">
 * _itemUpdated: function(id) {
 *    var list = this._children.myList;
 *    list.reloadItem(id);
 * }
 * </pre>
 */

/**
 * Прокручивает список к указанному элементу.
 * @function Controls/_list/interface/IList#scrollToItem
 * @param {String|Number} key Идентификатор элемента коллекции, к которому осуществляется прокручивание.
 * @param {Boolean} toBottom Определяет, будет ли виден нижний край элемента. По умолчанию нижний край элемента виден.
 * @param {Boolean} force Определяет, нужно ли подскролливать к границе элемента, если он виден
 * @example
 * <pre class="brush: js">
 * _buttonClick: function() {
 *    var list = this._children.myList;
 *    list.scrollToItem(this._firstItemKey);
 * }
 * </pre>
 */

/*ENG
 * Loads model from data source, merges changes into the current data and renders the item.
 * @function Controls/_list/interface/IList#reloadItem
 * @param {String} key Identifier of the collection item, that should be reloaded from source.
 * @param {Object} readMeta Meta information, that which will be passed to the query/read method.
 * @param {Boolean} replaceItem Determine, how the loaded item will be applied to collection.
 * If the parameter is set to true, item from collection will replaced with loaded item.
 * if the parameter is set to false (by default), loaded item will merged to item from collection.
 * @param {reloadType} Determine how the item will be reloaded.
 * @example
 * <pre class="brush: js">
 * _buttonClick: function() {
 *    var list = this._children.myList;
 *    list.scrollToItem(this._firstItemKey);
 * }
 * </pre>
 */

/**
 * @event Controls/_list/interface/IList#itemMouseDown Происходит в момент нажатия на кнопку мыши над элементом списка.
 * @param {Vdom/Vdom:SyntheticEvent} event Объект события.
 * @param {Types/entity:Record} item Элемент, над которым произошло нажатие на кнопку мыши.
 * @param {Object} nativeEvent Объект нативного события браузера.
 * @remark
 * От события {@link Controls/_list/interface/IClickableView#itemClick itemClick} данное событие отличается следующим:
 * 1. Срабатывает при нажатии на любую кнопку мыши (левую, правую, среднюю);
 * 2. Срабатывает в момент нажатия кнопки (itemClick срабатывает уже после её отпускания).
 */

/**
 * @event Controls/_list/interface/IList#itemSwipe Происходит при жесте "swipe" на элементе списка.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр элемента списка, по которому производим swipe.
 * @param {Object} nativeEvent Объект нативного события браузера.
 * @remark
 * Событие срабатывает, только если со списком ничего не происходит при жесте "swipe" (например, если список поддерживает выбор, он будет только устанавливать флаг). Это поведение схоже с {@link Controls/_list/interface/IClickableView#itemClick itemClick}.
 */

/*ENG
 * @event Controls/_list/interface/IList#itemSwipe Occurs when list item is swiped.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the swiped item.
 * @param {Object} nativeEvent Descriptor of the original event. It is useful if you want to get direction or target.
 * @remark
 * This event fires only if the list doesn't do anything on swipe (e.g., if the list supports selection - it will toggle checkbox and that's it). This behavior is in line with the {@link Controls/_list/interface/IClickableView#itemClick itemClick}.
 */

/**
 * @event Controls/_list/interface/IList#hoveredItemChanged Происходит при наведении курсора мыши на элемент списка.
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">демо-пример</a>.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр элемента, на который наводим курсор.
 * @param {HTMLElement} itemContainer Контейнер элемента.
 */

/**
 * @event Controls/_list/interface/IList#activeElementChanged Происходит при смене активного элемента в процессе скроллирования
 * @param {Vdom/Vdom:SyntheticEvent<Event>} event Дескриптор события
 * @param {String} key Ключ активного элемента
 * @remark Активным элементом считается последний элемент, который находится выше середины вьюпорта.
 * Для высчитывания активного элемента в списочном контроле должен быть включен виртуальный скроллинг.
 * @see shouldCheckActiveElement
 */

/*ENG
 * @event Controls/_list/interface/IList#hoveredItemChanged The event fires when the user hovers over a list item with a cursor.
 * @remark
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">Example</a>.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the item whose action was clicked.
 * @param {HTMLElement} itemContainer Container of the item.
 */

/**
 * @event Controls/_list/interface/IList#markedKeyChanged Происходит при выделении пользователем элемента списка.
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">демо-примеры</a>.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Number} key Ключ выбранного элемента.
 */

/*ENG
 * @event Controls/_list/interface/IList#markedKeyChanged Occurs when list item was selected (marked).
 * @remark
 * See also <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">Example</a>.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {Number} key Key of the selected item.
 */

/**
 * @event Controls/_list/interface/IList#drawItems Происходит при отрисовке очередного набора данных.
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">демо-примеры</a>.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */

/*ENG
 * @event Controls/_list/interface/IList#drawItems Occurs when the next batch of data is drawn.
 * @remark
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">Example</a>.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 */

/**
 * @typedef {String} VerticalItemPaddingEnum
 * @variant s Маленький отступ.
 * @variant l Большой отступ.
 */

/*ENG
 * @typedef {String} VerticalItemPaddingEnum
 * @variant s Small padding.
 * @variant l Large padding.
 */

/**
 * @typedef {String} HorizontalItemPaddingEnum
 * @variant xs Минимальный отступ.
 * @variant s Маленький отступ.
 * @variant m Средний отступ.
 * @variant l Большой отступ.
 * @variant xl Очень большой оступ.
 * @variant xxl Максимальный отступ.
 */

/*ENG
 * @typedef {Object} HorizontalItemPaddingEnum
 * @variant xs Extra small padding.
 * @variant s Small padding.
 * @variant m Medium padding.
 * @variant l Large padding.
 * @variant xl Extra large padding.
 * @variant xxl Extra extra large padding.
 */

/**
 * @typedef {Object} ItemPadding
 * @property {VerticalItemPaddingEnum} [top=s] Отступ от содержимого элемента до верхней границы элемента. Если свойство принимает значение null, то отступы отсутствуют.
 * @property {VerticalItemPaddingEnum} [bottom=s] Отступ от содержимого элемента до нижней границы элемента. Если свойство принимает значение null, то отступы отсутствуют.
 * @property {HorizontalItemPaddingEnum} [left=m] Отступ от содержимого элемента до левой границы элемента. Если свойство принимает значение null, то отступы отсутствуют.
 * @property {HorizontalItemPaddingEnum} [right=m] Отступ от содержимого элемента до правой границы элемента. Если свойство принимает значение null, то отступы отсутствуют.
 */

/*ENG
 * @typedef {Object} ItemPadding
 * @property {VerticalItemPaddingEnum} [top=s] Padding from item content to top item border.
 * @property {VerticalItemPaddingEnum} [bottom=s] Padding from item content to bottom item border.
 * @property {HorizontalItemPaddingEnum} [left=m] Padding from item content to left item border.
 * @property {HorizontalItemPaddingEnum} [right=m] Padding from item content to right item border.
 */

/**
 * @cfg {ItemPadding} Конфигурация внутренних отступов строки.
 * @name Controls/_list/interface/IList#itemPadding
 */

/*ENG
 * @cfg {ItemPadding} Configuration inner paddings in the item.
 * @name Controls/_list/interface/IList#itemPadding
 */

/**
 * @name Controls/_list/interface/IList#backgroundStyle
 * @cfg {String} Префикс стиля для настройки фона внутренних компонентов списочного контрола с фиксированным или абсолютным позиционированием.
 * @remark
 * @default default
 */

/*ENG
 * @name Controls/_list/interface/IList#backgroundStyle
 * @cfg {String} Style prefix to configure background for inner list control components with static or absolute positioning.
 * @default default (theme background)
 */
