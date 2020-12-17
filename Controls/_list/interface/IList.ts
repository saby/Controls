import { TemplateFunction } from 'UI/Base';
import { IItemActionsOptions } from 'Controls/itemActions';
import { IMarkerListOptions } from 'Controls/marker';
import {IFontColorStyle} from 'Controls/interface';
import {IMovableOptions} from './IMovableList';

type TMultiSelectVisibility = 'visible'|'onhover'|'hidden';

type TListStyle = 'master'|'default';

/**
 * @typedef {String} TVerticalItemPadding
 * @variant S
 * @variant nyll
 */
export type TVerticalItemPadding = 'S'|'null';

/**
 * @typedef {String} THorizontalItemPadding
 * @variant XS
 * @variant S
 * @variant M
 * @variant L
 * @variant XL
 * @variant XXL
 * @variant null
 */
export type THorizontalItemPadding = 'XS'|'S'|'M'|'L'|'XL'|'XXL'|'null';

/**
 * Интерфейс настройки отступов записи
 * @Interface Controls/_list/interface/IList/IItemPadding
 * @public
 * @author Авраменко А.С.
 */
/*ENG
 * Item padding settings interface
 * @interface Controls/_list/interface/IList/IItemPadding
 * @public
 * @author Авраменко А.С.
 */
export interface IItemPadding {
    /**
     * @name Controls/_list/interface/IList/IItemPadding#top
     * @cfg {TVerticalItemPadding} Отступ записи сверху
     */
    top?: TVerticalItemPadding;
    /**
     * @name Controls/_list/interface/IList/IItemPadding#bottom
     * @cfg {TVerticalItemPadding} Отступ записи снизу
     */
    bottom?: TVerticalItemPadding;
    /**
     * @name Controls/_list/interface/IList/IItemPadding#left
     * @cfg {THorizontalItemPadding} Отступ записи слева
     */
    left?: THorizontalItemPadding;
    /**
     * @name Controls/_list/interface/IList/IItemPadding#right
     * @cfg {THorizontalItemPadding} Отступ записи справа
     */
    right?: THorizontalItemPadding;
}

/**
 * Интерфейс для списков.
 *
 * @interface Controls/_list/interface/IList
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

export interface IList extends IItemActionsOptions, IMarkerListOptions, IMovableOptions {
    attachLoadTopTriggerToNull?: boolean;
    emptyTemplate?: TemplateFunction | string;
    footerTemplate?: TemplateFunction | string;
    pagingLeftTemplate?: TemplateFunction|string;
    pagingRightTemplate?: TemplateFunction|string;
    multiSelectVisibility?: TMultiSelectVisibility;
    stickyMarkedItem?: boolean;
    uniqueKeys?: boolean;
    itemsReadyCallback?: (items) => void;
    dataLoadCallback?: (items) => void;
    dataLoadErrback?: () => void;
    style?: TListStyle;
    backgroundStyle?: string;
    hoverBackgroundStyle?: string;
    itemPadding?: IItemPadding;
    nodeConfig?: INodeConfig;

    pagingContentTemplate?: TemplateFunction | string;
    moreFontColorStyle?: IFontColorStyle;
}

/**
 * @name Controls/_list/interface/IList#moreFontColorStyle
 * @cfg {IFontColorStyle} Опция управляет стилем цвета текста для кнопки ещё.
 * @default listMore
 * @see IFontColorStyle
 */

/**
 * @name Controls/_list/interface/IList#pagingContentTemplate
 * @cfg {Function} Опция управляет отображением счетчика непрочитанных сообщений
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
 * @cfg {string|Function} Определяет шаблон индикатора загрузки данных. В данный момент этот шаблон работает только для индикатора, который отображается при подгрузке по скролу.
 * @default Controls/list:LoadingIndicatorTemplate
 */

/**
 * @name Controls/_list/interface/IList#continueSearchTemplate
 * @cfg {string|Function} Шаблон отображения блока, который отображается при прерывании итеративного поиска.
 * @default Controls/list:ContinueSearchTemplate
 * @demo Controls-demo/list_new/Searching/PortionedSearch/Index
 * @example
 * <pre class="brush: html">
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
 * @cfg {Function} Пользовательский шаблон отображения пустого списка.
 * @demo Controls-demo/list_new/EmptyList/Default/Index
 * @default undefined
 * @example
 * <pre class="brush: html">
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
 * См. {@link /doc/platform/developmentapl/interface-development/controls/list/list/empty-list/ руководство разработчика}.
 */

/*ENG
 * @name Controls/_list/interface/IList#emptyTemplate
 * @cfg {Function} Template for the empty list.
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
 * @cfg {Function} Шаблон отображения подвала списка.
 * @remark
 * См. {@link /doc/platform/developmentapl/interface-development/controls/list/list/footer/ руководство разработчика}.
 * @demo Controls-demo/list_new/FooterTemplate/Index
 */

/*ENG
 * @name Controls/_list/interface/IList#footerTemplate
 * @cfg {Function} Template that will be rendered below the list.
 * @demo Controls-demo/list_new/FooterTemplate/Index
 */

/**
 * @name Controls/_list/interface/IList#pagingLeftTemplate
 * @cfg {Function} Шаблон для отображения слева от постраничной навигации.
 * @demo Controls-demo/list_new/Navigation/Paging/LeftTemplate/Index
 */

/*ENG
 * @name Controls/_list/interface/IList#pagingLeftTemplate
 * @cfg {Function} Template to display to the left of page navigation.
 * <a href="/materials/Controls-demo/app/Controls-demo%2Flist_new%2FNavigation%2FPaging%2FLeftTemplate%2FIndex">Example</a>.
 */

/**
 * @name Controls/_list/interface/IList#pagingRightTemplate
 * @cfg {Function} Шаблон для отображения справа от постраничной навигации.
 * @demo Controls-demo/list_new/Navigation/Paging/Position/RightTemplate/Index
 */

/*ENG
 * @name Controls/_list/interface/IList#pagingRightTemplate
 * @cfg {Function} Template to display to the right of page navigation.
 * <a href="/materials/Controls-demo/app/Controls-demo%2Flist_new%2FNavigation%2FPaging%2FPosition%2FRightTemplate%2FIndex">Example</a>.
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
 * @demo Controls-demo/list_new/MultiSelect/MultiSelectVisibility/OnHover/Index
 * @default hidden
 * @remark
 * Чтобы включить в списочном контроле режим "Множественный выбор элементов", обратитесь к <a href="/doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/">руководству разработчика</a>.
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
 * @variant custom Нестандартная позиця расположени чекбоксов множественного выбора. При данном значении опции, шаблон чекбоксов передается в прикладной шаблон и может быть выведен в любом месте записи.
 * @variant default Стандартная позиция чекбоксов множественного выбора в начале строки.
 */

/**
 * @name Controls/_list/interface/IList#multiSelectPosition
 * @cfg {MultiSelectPosition} Позиция чекбоксов множественного выбора.
 * @demo Controls-demo/list_new/MultiSelect/CustomPosition/Index
 * @default default
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
 * @event Происходит при свайпе на элементе списка.
 * @name Controls/_list/interface/IList#itemSwipe
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр элемента списка, по которому производим свайп.
 * @param {Object} nativeEvent Объект нативного события браузера.
 * @remark
 * Событие происходит, только если со списком ничего не происходит при свайпе (например, если список поддерживает выбор, он будет только устанавливать флаг). Это поведение схоже с {@link Controls/_list/interface/IClickableView#itemClick itemClick}.
 */

/*ENG
 * @event Occurs when list item is swiped.
 * @name Controls/_list/interface/IList#itemSwipe
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the swiped item.
 * @param {Object} nativeEvent Descriptor of the original event. It is useful if you want to get direction or target.
 * @remark
 * This event fires only if the list doesn't do anything on swipe (e.g., if the list supports selection - it will toggle checkbox and that's it). This behavior is in line with the {@link Controls/_list/interface/IClickableView#itemClick itemClick}.
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
 * @event Происходит при выделении пользователем элемента списка.
 * @name Controls/_list/interface/IList#markedKeyChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Number} key Ключ выбранного элемента.
 */

/*ENG
 * @event Occurs when list item was selected (marked).
 * @name Controls/_list/interface/IList#markedKeyChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {Number} key Key of the selected item.
 */

/**
 * @event Происходит до изменения ключа маркера.
 * @name Controls/_list/interface/IList#beforeMarkedKeyChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Number} key Новый ключ маркера.
 * @remark
 * Из обработчика события нужно вернуть полученный ключ или новый ключ.
 * Либо можно вернуть промис с нужным ключом.
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
 * * элемент нельзя отметить маркером.
 * * при клике начинается <a href="/doc/platform/developmentapl/interface-development/controls/list/actions/edit/">редактирование по месту</a>.
 */

/**
 * @typedef {String} VerticalItemPaddingEnum
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
 * @demo Controls-demo/list_new/ItemPadding/DifferentPadding/Index В примере заданы горизонтальные отступы.
 * @demo Controls-demo/list_new/ItemPadding/NoPadding/Index В примере отступы отсутствуют.
 * @remark
 * См. {@link /doc/platform/developmentapl/interface-development/controls/list/list/paddings/ руководство разработчика}.
 */

/*ENG
 * @cfg {ItemPadding} Configuration inner paddings in the item.
 * @name Controls/_list/interface/IList#itemPadding
 */


/**
 * @typedef {String} BackgroundStyle
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
 * @cfg {BackgroundStyle} Префикс стиля для настройки фона внутренних компонентов списочного контрола с фиксированным или абсолютным позиционированием.
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
 * @variant s Размер тонкой линии-разделителя.
 * @variant l Размер толстой линии-разделителя.
 * @variant null Без линии-разделителя.
 */

/**
 * @name Controls/_list/interface/IList#rowSeparatorSize
 * @cfg {RowSeparatorSize} Высота линии-разделителя строк.
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
 * @cfg {String} Стиль подсветки строки при наведении курсора мыши.
 * @default default
 * @remark
 * По умолчанию подсветка соответствует @background-color. Поддерживаются любые произвольные значения опции.
 * Подробнее в <a href="/doc/platform/developmentapl/interface-development/controls/list/list/background/#hover">статье</a>.
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
 * @typedef {String} ButtonName
 * @variant Begin Кнопка "В начало".
 * @variant End Кнопка "В конец".
 */

/**
 * @event Происходит при клике по кнопкам перехода к первой и последней странице.
 * @name Controls/_list/interface/IList#pagingArrowClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {ButtonName} buttonName.
 */
