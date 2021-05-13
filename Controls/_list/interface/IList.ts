import { TemplateFunction } from 'UI/Base';
import { IItemActionsOptions } from 'Controls/itemActions';
import { IMarkerListOptions } from 'Controls/marker';
import { IItemPadding } from 'Controls/display';
import {Direction, IFontColorStyle, IItemTemplateOptions} from 'Controls/interface';
import {IMovableOptions} from './IMovableList';
import {RecordSet} from 'Types/collection';

type TMultiSelectVisibility = 'visible'|'onhover'|'hidden';

type TListStyle = 'master'|'default';

/**
 * Интерфейс для {@link /doc/platform/developmentapl/interface-development/controls/list/ списков}.
 * @public
 * @author Авраменко А.С.
 */

/*ENG
 * Interface for lists.
 *
 * @interface Controls/_list/interface/IList
 * @public
 * @author Авраменко А.С.
 */

export interface IList extends IItemActionsOptions, IMarkerListOptions, IMovableOptions, IItemTemplateOptions {
    attachLoadTopTriggerToNull?: boolean;
    emptyTemplate?: TemplateFunction | string;
    footerTemplate?: TemplateFunction | string;
    pagingLeftTemplate?: TemplateFunction|string;
    pagingRightTemplate?: TemplateFunction|string;
    multiSelectVisibility?: TMultiSelectVisibility;
    stickyMarkedItem?: boolean;
    uniqueKeys?: boolean;
    itemsReadyCallback?: (items: RecordSet) => void;
    dataLoadCallback?: (items: RecordSet, direction?: Direction) => void;
    dataLoadErrback?: (error: unknown) => void;
    style?: TListStyle;
    backgroundStyle?: string;
    hoverBackgroundStyle?: string;
    itemPadding?: IItemPadding;
    nodeConfig?: INodeConfig;

    pagingContentTemplate?: TemplateFunction | string;
    moreFontColorStyle?: IFontColorStyle;
    stickyHeader?: boolean;
}

/**
 * @name Controls/_list/interface/IList#stickyHeader
 * @cfg {Boolean} Прилипание {@link /doc/platform/developmentapl/interface-development/controls/list/grid/header/ шапки} при прокрутке таблицы.
 * @demo Controls-demo/list_new/Grouped/NoSticky/Index В демо-примере опция stickyHeader установлена в значение false.
 * @demo Controls-demo/list_new/Grouped/Sticky/Index В демо-примере опция stickyHeader установлена в значение true.
 * @default true
 */

/**
 * @name Controls/_list/interface/IList#moreFontColorStyle
 * @cfg {Controls/_interface/IFontColorStyle/TFontColorStyle.typedef} Опция управляет стилем цвета текста для {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/button-more/ кнопки "Ещё"}.
 * @default listMore
 * @see IFontColorStyle
 */

/**
 * @name Controls/_list/interface/IList#pagingContentTemplate
 * @cfg {String|TemplateFunction} Шаблон отображения слева от кнопки навигации. Используется для отображения {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/infinite-scrolling/#button-number счетчика непрочитанных сообщений}.
 * @demo Controls-demo/list_new/Navigation/Paging/End/ContentTemplate/Index
 * @see pagingMode
 */

/**
 * @name Controls/_list/interface/IList#attachLoadTopTriggerToNull
 * @cfg {Boolean} При изначальной загрузке списка прижимать верхний триггер загрузки к нулевой позиции.
 * @remark
 * Позволяет при двусторонней навигации избегать повторной загрузки данных сразу после инициализации списка.
 * @default true
 */

/**
 * @name Controls/_list/interface/IList#loadingIndicatorTemplate
 * @cfg {String|TemplateFunction} Определяет шаблон индикатора загрузки данных. В данный момент этот шаблон работает только для индикатора, который отображается при подгрузке по скролу.
 * @default Controls/list:LoadingIndicatorTemplate
 */

/**
 * @name Controls/_list/interface/IList#continueSearchTemplate
 * @cfg {String|TemplateFunction} Шаблон отображения блока, который отображается при прерывании {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/portion-loading/#batch-filtration-search итеративного поиска}.
 * @default Controls/list:ContinueSearchTemplate
 * @demo Controls-demo/list_new/Searching/PortionedSearch/Index
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.list:View>
 *     <ws:loadingIndicatorTemplate>
 *         <ws:partial template="Controls/list:ContinueSearchTemplate"
 *                     scope="{{loadingIndicatorTemplate}}">
 *             <ws:footerTemplate>
 *                 <div>Дополнительная информация при итеративном поиске</div>
 *             </ws:footerTemplate>
 *         </ws:partial>
 *     </ws:loadingIndicatorTemplate>
 * </Controls.list:View>
 * </pre>
 */

/**
 * @name Controls/_list/interface/IList#emptyTemplate
 * @cfg {TemplateFunction|String} Пользовательский шаблон отображения {@link /doc/platform/developmentapl/interface-development/controls/list/list/empty/ пустого списка}.
 * @demo Controls-demo/list_new/EmptyList/Default/Index
 * @default undefined
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.list:View>
 *     <ws:emptyTemplate>
 *         <ws:partial template="Controls/list:EmptyTemplate" topSpacing="xl" bottomSpacing="l">
 *             <ws:contentTemplate>Нет данных</ws:contentTemplate>
 *         </ws:partial>
 *     </ws:emptyTemplate>
 * </Controls.list:View>
 * </pre>
 * @remark
 * Пользовательский шаблон получается путем конфигурации базового шаблона {@link Controls/list:EmptyTemplate}.
 */

/*ENG
 * @name Controls/_list/interface/IList#emptyTemplate
 * @cfg {TemplateFunction|String} Template for the empty list.
 * @remark
 * We recommend to use default template for emptyTemplate: Controls/list:EmptyTemplate
 * The template accepts the following options:
 * - contentTemplate content of emptyTemplate
 * - topSpacing Spacing between top border and content of emptyTemplate
 * - bottomSpacing Spacing between bottom border and content of emptyTemplate
 * @demo Controls-demo/list_new/EmptyList/Default/Index
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
 * @cfg {TemplateFunction|String} Пользовательский шаблон отображения {@link /doc/platform/developmentapl/interface-development/controls/list/list/footer/ подвала списка}.
 * @demo Controls-demo/list_new/FooterTemplate/Index
 */

/*ENG
 * @name Controls/_list/interface/IList#footerTemplate
 * @cfg {TemplateFunction|String} Template that will be rendered below the list.
 * @demo Controls-demo/list_new/FooterTemplate/Index
 */

/**
 * @name Controls/_list/interface/IList#pagingLeftTemplate
 * @cfg {TemplateFunction|String} Пользовательский шаблон для отображения слева от {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/data-pagination/ постраничной навигации}.
 * @demo Controls-demo/list_new/Navigation/Paging/LeftTemplate/Index
 * @see pagingRightTemplate
 */

/*ENG
 * @name Controls/_list/interface/IList#pagingLeftTemplate
 * @cfg {TemplateFunction|String} Template to display to the left of page navigation.
 */

/**
 * @name Controls/_list/interface/IList#pagingRightTemplate
 * @cfg {TemplateFunction|String} Пользовательский шаблон для отображения справа от {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/data-pagination/ постраничной навигации}.
 * @demo Controls-demo/list_new/Navigation/Paging/Position/RightTemplate/Index
 * @see pagingLeftTemplate
 */

/*ENG
 * @name Controls/_list/interface/IList#pagingRightTemplate
 * @cfg {TemplateFunction|String} Template to display to the right of page navigation.
 */

/**
 * @typedef {String} MultiSelectVisibility
 * @description Допустимые значения для опции {@link multiSelectVisibility}.
 * @variant visible Показать.
 * @variant hidden Скрыть.
 * @variant onhover Показывать при наведении.
 */

/**
 * @name Controls/_list/interface/IList#multiSelectVisibility
 * @cfg {MultiSelectVisibility} Видимость {@link /doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/ чекбоксов}.
 * @demo Controls-demo/list_new/MultiSelect/MultiSelectVisibility/OnHover/Index
 * @default hidden
 * @see multiSelectAccessibilityProperty
 * @see multiSelectPosition
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
 * @demo Controls-demo/list_new/MultiSelect/MultiSelectVisibility/OnHover/Index
 * @default hidden
 */

/**
 * @typedef {String} MultiSelectPosition
 * @description Допустимые значения для опции {@link multiSelectPosition}.
 * @variant custom Позиционирование чекбокса в произвольном месте пользовательского шаблона. Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/position/ здесь}.
 * @variant default Стандартная позиция чекбоксов множественного выбора в начале строки.
 */

/**
 * @name Controls/_list/interface/IList#multiSelectPosition
 * @cfg {MultiSelectPosition} Позиционирование {@link /doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/ чекбокса}.
 * @demo Controls-demo/list_new/MultiSelect/CustomPosition/Index
 * @default default
 * @see multiSelectAccessibilityProperty
 * @see multiSelectVisibility
 */

/*ENG
 * @typedef {String} MultiSelectPosition
 * @variant custom A custom position for the multiple selection checkboxes. With this option value, the multiple selection template is passed to the item template and can be displayed anywhere in it
 * @variant default The standard position of the multiple selection checkboxes (at the beginning of the line)
 */

/*ENG
 * @name Controls/_list/interface/IList#multiSelectPosition
 * @cfg {MultiSelectPosition} Position of multiple selection checkboxes
 * @demo Controls-demo/list_new/MultiSelect/CustomPosition/Index
 * @default default
 */

/**
 * @name Controls/_list/interface/IList#multiSelectAccessibilityProperty
 * @cfg {Controls/display:MultiSelectAccessibility} Имя поля записи, в котором хранится состояние видимости {@link /doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/ чекбокса}.
 * @remark Подробная настройка функционала описана {@link /doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/read-only/ здесь}.
 * @demo Controls-demo/list_new/ItemTemplate/MultiSelectAccessibilityProperty/Index
 * @see multiSelectVisibility
 * @see multiSelectPosition
 */

/**
 * @event Происходит в момент, когда курсор оказывается над элементом списка.
 * @name Controls/_list/interface/IList#itemMouseEnter
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр записи, на которую был наведен курсор.
 * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Дескриптор события мыши.
 */

/*ENG
 * @event Occurs when the cursor is over the list item.
 * @name Controls/_list/interface/IList#itemMouseEnter
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the item that the cursor was over.
 * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Descriptor of the mouse event
 */

/**
 * @event Происходит в момент, когда курсор уходит за пределы элемента списка.
 * @name Controls/_list/interface/IList#itemMouseLeave
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр записи, за пределы которой ушел курсор.
 * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Дескриптор события мыши.
 */

/*ENG
 * @event Occurs when the cursor leaves the list item.
 * @name Controls/_list/interface/IList#itemMouseLeave
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the item that the cursor was over.
 * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Descriptor of the mouse event
 */

/**
 * @event Происходит в момент, когда курсор двигается по элементам списка.
 * @name Controls/_list/interface/IList#itemMouseMove
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр записи, по которой двигается курсор.
 * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Дескриптор события мыши.
 */

/*ENG
 * @event Occurs when the cursor moves over list items.
 * @name Controls/_list/interface/IList#itemMouseMove
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the item that the cursor is moving along.
 * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Descriptor of the mouse event
 */

/**
 * @name Controls/_list/interface/IList#stickyMarkedItem
 * @cfg {Boolean} Позволяет включать/отключать прилипание выбранного элемента.
 * @remark
 * Опция актуальна только для стиля "Мастер".
 * @see style
 * @default true
 */

/**
 * @name Controls/_list/interface/IList#itemsReadyCallback
 * @cfg {Function} Функция, которая вызывается, когда экземпляр данных получен из источника и подготовлен к дальнейшей обработке контролом.
 * Функция вызывается единожды в рамках {@link /doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases жизненного цикла} на этапе mount.
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
 * @see dataLoadErrback
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
 * @see dataLoadErrback
 */

/**
 * @name Controls/_list/interface/IList#dataLoadErrback
 * @cfg {Function} Функция обратного вызова для определения сбоя загрузки данных из источника.
 * @see itemsReadyCallback
 * @see dataLoadCallback
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
 * Загружает модель из {@link /doc/platform/developmentapl/interface-development/controls/list/source/ источника данных}, объединяет изменения в текущих данные и отображает элемент.
 * @function Controls/_list/interface/IList#reloadItem
 * @param {String} key Идентификатор элемента коллекции, который должен быть перезагружен из источника.
 * @param {Object} readMeta Метаинформация, которая будет передана методу запроса/чтения.
 * @param {Boolean} replaceItem Определяет, как загруженный элемент будет применяться к коллекции.
 * Если параметр имеет значение true, элемент коллекции будет заменен загруженным элементом.
 * Если параметр имеет значение false (по умолчанию), загруженные элементы будут объединены в элемент коллекции.
 * @param {ReloadType} [reloadType=read] Определяет, как будет загружен элемент.
 * @return {Promise<RecordSet>} В случае успешной загрузки, Promise вернет список отображаемых дочерних элементов для загруженного узла.
 * @example
 * <pre class="brush: js">
 * _itemUpdated: function(id) {
 *    var list = this._children.myList;
 *    list.reloadItem(id);
 * }
 * </pre>
 */

/**
 * Возвращает рекордсет, на основании которого в данный момент строится список.
 * @function Controls/_list/interface/IList#getItems
 * @return {RecordSet} Список элементов.
 * @example
 * <pre class="brush: js">
 * _getItems(): RecordSet {
 *    var list = this._children.myList;
 *    return list.getItems();
 * }
 * </pre>
 */

/**
 * Прокручивает список к указанному элементу.
 * @function Controls/_list/interface/IList#scrollToItem
 * @param {String|Number} key Идентификатор элемента коллекции, к которому происходит прокручивание.
 * @param {Boolean} [toBottom=false] Видимость нижнего края элемента. Для значения true нижний край отображается, а для false — скрыт.
 * @param {Boolean} [force=false] Прокрутить список к нижнему краю элемента.
 * Для значения true прокручивание работает, а для false — отключено.
 * **Примечание:** параметр можно использовать, когда toBottom установлен в значение true.
 * @demo Controls-demo/list_new/VirtualScroll/ConstantHeights/ScrollToItem/Index В следующем примере под списком находится кнопка, при клике по которой вызывается обработчик и метод scrollToItem().
 * @example
 * <pre class="brush: js">
 * protected _scrollToItem(event: SyntheticEvent, id: number): void {
 *     this._children.list.scrollToItem(id, false, true);
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
 * @event Происходит в момент нажатия на кнопку мыши над элементом списка.
 * @name Controls/_list/interface/IList#itemMouseDown
 * @param {Vdom/Vdom:SyntheticEvent} event Дескриптор события.
 * @param {Types/entity:Record} item Элемент, над которым произошло нажатие на кнопку мыши.
 * @param {Object} nativeEvent Объект нативного события браузера.
 * @remark
 * От события {@link Controls/_list/interface/IClickableView#itemClick itemClick} данное событие отличается следующим:
 *
 * 1. Происходит при нажатии на любую кнопку мыши (левую, правую, среднюю);
 * 2. Происходит в момент нажатия кнопки (itemClick срабатывает уже после её отпускания).
 */

/**
 * @event Происходит при {@link /doc/platform/developmentapl/interface-development/controls/list/actions/swipe/ свайпе} на элементе списка.
 * @name Controls/_list/interface/IList#itemSwipe
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр элемента списка, по которому производим свайп.
 * @param {Object} nativeEvent Объект нативного события браузера.
 * @remark
 * Событие стреляет всегда, вне зависимости от того, обработано оно платформой или нет.
 */

/*ENG
 * @event Occurs when list item is swiped.
 * @name Controls/_list/interface/IList#itemSwipe
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the swiped item.
 * @param {Object} nativeEvent Descriptor of the original event. It is useful if you want to get direction or target.
 * @remark
 * This event fires anyway, despite on handling in list.
 */

/**
 * @event Происходит при наведении курсора мыши на элемент списка.
 * @name Controls/_list/interface/IList#hoveredItemChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр элемента, на который наводим курсор.
 * @param {HTMLElement} itemContainer Контейнер элемента.
 */

/**
 * @event Происходит при смене активного элемента в процессе скроллирования.
 * @name Controls/_list/interface/IList#activeElementChanged
 * @param {Vdom/Vdom:SyntheticEvent<Event>} event Дескриптор события.
 * @param {String} key Ключ активного элемента.
 * @remark Активным элементом считается последний элемент, который находится выше середины вьюпорта.
 * Для высчитывания активного элемента в списочном контроле должен быть включен виртуальный скроллинг.
 * @see shouldCheckActiveElement
 */

/*ENG
 * @event The event fires when the user hovers over a list item with a cursor.
 * @name Controls/_list/interface/IList#hoveredItemChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the item whose action was clicked.
 * @param {HTMLElement} itemContainer Container of the item.
 */

/**
 * @event Происходит при отрисовке очередного набора данных.
 * @name Controls/_list/interface/IList#drawItems
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */

/*ENG
 * @event Occurs when the next batch of data is drawn.
 * @name Controls/_list/interface/IList#drawItems
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 */

/**
 * @event Происходит при активации элемента.
 * @name Controls/_list/interface/IList#itemActivate
 * @param {Vdom/Vdom:SyntheticEvent} event Дескриптор события.
 * @param {Types/entity:Record} item Элемент, по которому кликнули.
 * @param {Object} nativeEvent Объект нативного события браузера.
 * @param {Number} columnIndex Индекс колонки, по которой кликнули. Параметр актуален только для {@link Controls/grid:View} и {@link Controls/treeGrid:View}.
 * @remark
 * Активация происходит при клике по элементу.
 * Событие не происходит, если:
 *
 * * элемент нельзя отметить {@link /doc/platform/developmentapl/interface-development/controls/list/actions/marker/ маркером}.
 * * при клике начинается {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование по месту}.
 */

/**
 * @typedef {String} VerticalItemPaddingEnum
 * @description Допустимые значения для свойств {@link Controls/list:IList.ItemPadding ItemPadding}.
 * @variant null Нулевой отступ.
 * @variant s Маленький отступ.
 * @variant l Большой отступ.
 */

/*ENG
 * @typedef {String} VerticalItemPaddingEnum
 * @variant null Without padding.
 * @variant s Small padding.
 * @variant l Large padding.
 */

/**
 * @typedef {String} HorizontalItemPaddingEnum
 * @description Допустимые значения для свойств {@link Controls/list:IList.ItemPadding ItemPadding}.
 * @variant null Нулевой отступ.
 * @variant xs Минимальный отступ.
 * @variant s Маленький отступ.
 * @variant m Средний отступ.
 * @variant l Большой отступ.
 * @variant xl Очень большой оступ.
 * @variant xxl Максимальный отступ.
 */

/*ENG
 * @typedef {Object} HorizontalItemPaddingEnum
 * @variant null Without padding.
 * @variant xs Extra small padding.
 * @variant s Small padding.
 * @variant m Medium padding.
 * @variant l Large padding.
 * @variant xl Extra large padding.
 * @variant xxl Extra extra large padding.
 */

/**
 * @typedef {Object} ItemPadding
 * @description Свойства для конфигурации опции {@link Controls/list:IList#itemPadding itemPadding}.
 * @property {VerticalItemPaddingEnum} [top=s] Отступ от содержимого до верхней границы элемента. Если свойство принимает значение null, то отступ отсутствует.
 * @property {VerticalItemPaddingEnum} [bottom=s] Отступ от содержимого до нижней границы элемента. Если свойство принимает значение null, то отступ отсутствует.
 * @property {HorizontalItemPaddingEnum} [left=m] Отступ от содержимого до левой границы элемента. Если свойство принимает значение null, то отступ отсутствует.
 * @property {HorizontalItemPaddingEnum} [right=m] Отступ от содержимого до правой границы элемента. Если свойство принимает значение null, то отступ отсутствует.
 */

/*ENG
 * @typedef {Object} ItemPadding
 * @property {VerticalItemPaddingEnum} [top=s] Padding from item content to top item border.
 * @property {VerticalItemPaddingEnum} [bottom=s] Padding from item content to bottom item border.
 * @property {HorizontalItemPaddingEnum} [left=m] Padding from item content to left item border.
 * @property {HorizontalItemPaddingEnum} [right=m] Padding from item content to right item border.
 */

/**
 * @cfg {ItemPadding} Конфигурация отступов внутри элементов списка.
 * @name Controls/_list/interface/IList#itemPadding
 */

/*ENG
 * @cfg {ItemPadding} Configuration inner paddings in the item.
 * @name Controls/_list/interface/IList#itemPadding
 */


/**
 * @typedef {String} BackgroundStyle
 * @description Допустимые значения для опции {@link Controls/list:IList#backgroundStyle backgroundStyle}.
 * @variant master Предназначен для настройки фона masterDetail (Берётся из свойства style)
 * @variant infoBox Предназначен для настройки фона infoBox.
 * @variant stack Предназначен для настройки фона стековой панели.
 * @variant detailContrast
 * @variant listItem
 * @variant stackHeader
 * @variant default фон списка по умолчанию
 * @default default
 */

/**
 * @name Controls/_list/interface/IList#backgroundStyle
 * @cfg {BackgroundStyle} {@link /doc/platform/developmentapl/interface-development/controls/list/list/background/ Префикс стиля для настройки фона} внутренних компонентов списочного контрола с фиксированным или абсолютным позиционированием.
 * @default default
 * @remark
 * Согласно <a href="/doc/platform/developmentapl/interface-development/controls/list/list/background/">документации</a> поддерживаются любые произвольные значения опции.
 */

/*ENG
 * @name Controls/_list/interface/IList#backgroundStyle
 * @cfg {String} Style prefix to configure background for inner list control components with static or absolute positioning.
 * @default default (theme background)
 */
/**
 * @typedef {String} RowSeparatorSize
 * @description Допустимые значения для опции {@link Controls/list:IList#rowSeparatorSize rowSeparatorSize}.
 * @variant s Размер тонкой линии-разделителя.
 * @variant l Размер толстой линии-разделителя.
 * @variant null Без линии-разделителя.
 */

/**
 * @name Controls/_list/interface/IList#rowSeparatorSize
 * @cfg {RowSeparatorSize} Высота {@link /doc/platform/developmentapl/interface-development/controls/list/grid/line-separator/#row линии-разделителя строк}.
 * @default s
 */

/*
 * @name Controls/_list/interface/IList#rowSeparatorSize
 * @cfg {RowSeparatorSize} set row separator height.
 * @variant s Thin row separator line.
 * @variant l Wide row separator line.
 * @variant null Without row separator line
 * @default null
 */

/**
 * @name Controls/_list/interface/IList#hoverBackgroundStyle
 * @cfg {String} {@link /doc/platform/developmentapl/interface-development/controls/list/list/background/#hover Стиль подсветки строки} при наведении курсора мыши.
 * @default default
 * @remark
 * По умолчанию подсветка соответствует @background-color. Поддерживаются любые произвольные значения опции.
 * @example
 * <pre class="brush: html; highlight: [5]">
 * <!-- WML -->
 * <Controls.list:View
 *    keyProperty="id"
 *    source="{{_viewSource}}"
 *    hoverBackgroundStyle="primary" />
 * </pre>
 */

/**
 * @typedef {String} Controls/_list/interface/IList/TRoundBorderSize
 * @variant null Без скругления.
 * @variant XS Минимальный радиус скругления.
 * @variant S Малый радиус скругления.
 * @variant M Средний радиус скругления.
 * @variant L Большой радиус скругления.
 * @variant XL Максимальный радиус скругления.
 */

/**
 * @typedef {Object} Controls/_list/interface/IList/TRoundBorder
 * @property {Controls/_list/interface/IList/TRoundBorderSize.typedef} tr Правый верхний угол.
 * @property {Controls/_list/interface/IList/TRoundBorderSize.typedef} tl Левый верхний угол.
 * @property {Controls/_list/interface/IList/TRoundBorderSize.typedef} br Правый нижний угол.
 * @property {Controls/_list/interface/IList/TRoundBorderSize.typedef} bl Левый нижний угол.
 */

/**
 * @name Controls/_list/interface/IList#roundBorder
 * @cfg {Controls/_list/interface/IList/TRoundBorder.typedef} Cкругление углов элемента списка.
 * В настоящий момент поддерживается для плоского списка поддерживается только для шаблона Controls/listTemplates:ListItemTemplate
 */

/**
 * @typedef {String} Controls/_list/interface/IList/ButtonName
 * @description Допустимые значения для аргумента события {@link Controls/list:IList#pagingArrowClick pagingArrowClick}.
 * @variant Begin Кнопка "В начало".
 * @variant End Кнопка "В конец".
 */

/**
 * @event Происходит при клике по кнопкам перехода к первой и последней странице.
 * @name Controls/_list/interface/IList#pagingArrowClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Controls/_list/interface/IList/ButtonName.typedef} buttonName Кнопка, по которой кликнули.
 */
