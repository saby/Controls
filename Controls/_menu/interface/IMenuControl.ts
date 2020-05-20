import {TemplateFunction} from 'UI/Base';
import {IMenuBaseOptions} from './IMenuBase';
import {ISourceOptions, INavigationOptions, IFilterOptions, ISelectorDialogOptions} from 'Controls/interface';
import {Stack} from 'Controls/popup/Stack';
import {IItemAction} from 'Controls/itemActions';

export type TKey = string|number|null;

export interface IMenuControlOptions extends IMenuBaseOptions, ISourceOptions, INavigationOptions,
        IFilterOptions, ISelectorDialogOptions {
    nodeFooterTemplate?: TemplateFunction;
    root?: TKey;
    selectorOpener?: Stack;
    itemActions?: IItemAction[];
    dataLoadCallback: Function;
}

/**
 * Интерфейс контрола меню
 * @interface Controls/_menu/interface/IMenuControl
 * @public
 * @author Золотова Э.Е.
 */

/*
 * @interface Controls/_menu/interface/IMenuControl
 * @public
 * @author Золотова Э.Е.
 */
export default interface IMenuControl {
    readonly '[Controls/_menu/interface/IMenuControl]': boolean;
}

/**
 * @name Controls/_menu/interface/IMenuControl#displayProperty
 * @cfg {String} Устанавливает имя поля элемента, значение которого будет отображено.
 */

/**
 * @name Controls/_menu/interface/IMenuControl#emptyText
 * @cfg {String} Добавляет пустой элемент в список с заданным текстом.
 * Ключ пустого элемента по умолчанию null, для изменения значения ключа используйте {@link emptyKey}.
 * @demo Controls-demo/Menu/Control/EmptyText/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#emptyKey
 * @cfg {String} Первичный ключ для пункта выпадающего списка, который создаётся при установке опции emptyText.
 * @demo Controls-demo/Menu/Control/EmptyText/EmptyKey/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#multiSelect
 * @cfg {Boolean} Определяет, установлен ли множественный выбор.
 * @default false
 * @demo Controls-demo/Menu/Control/MultiSelect/Index
 * @example
 * Множественный выбор установлен.
 * WML:
 * <pre>
 * <Controls.menu:Control
 *       selectedKeys="{{_selectedKeys}}"
 *       keyProperty="id"
 *       displayProperty="title"
 *       source="{{_source}}"
 *       multiSelect="{{true}}">
 * </Controls.menu:Control>
 * </pre>
 * JS:
 * <pre>
 * this._source = new Memory({
 *    keyProperty: 'id',
 *    data: [
 *       {id: 1, title: 'Yaroslavl'},
 *       {id: 2, title: 'Moscow'},
 *       {id: 3, title: 'St-Petersburg'}
 *    ]
 * });
 * this._selectedKeys = [1, 3];
 * </pre>
 */

/**
 * @name Controls/_menu/interface/IMenuControl#nodeFooterTemplate
 * @cfg {Function | String} Шаблон подвала, отображающийся для всех подменю.
 * В шаблон передается объект itemData со следующими полями:
 *    key - ключ родительского элемента;
 *    item - родительский элемент.
 * @example
 * TMPL:
 * <pre>
 *    <Controls.menu:Control
 *          keyProperty="id"
 *          icon="icon-Save icon-small"
 *          parentProperty="parent"
 *          nodeProperty="@parent"
 *          source="{{_source}}">
 *       <ws:nodeFooterTemplate>
 *          <div class="ControlsDemo-InputDropdown-footerTpl">
 *             <Controls.buttons:Button caption="+ New template" size="l" viewMode="link" on:click="_clickHandler(itemData.key)"/>
 *          </div>
 *       </ws:nodeFooterTemplate>
 *    </Controls.menu:Control>
 * </pre>
 * JS:
 * <pre>
 *    _clickHandler: function(rootKey) {
 *       this._children.stack.open({
 *          opener: this._children.button
 *       });
 *    }
 * </pre>
 * @demo Controls-demo/Menu/Control/NodeFooterTemplate/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#groupProperty
 * @cfg {String} Имя свойства, содержащего идентификатор группы элемента списка.
 * @demo Controls-demo/Menu/Control/GroupProperty/Index
 * @see groupTemplate
 */

/**
 * @name Controls/_menu/interface/IMenuControl#groupTemplate
 * @cfg {String|Function} Устанавливает шаблон отображения заголовка группы.
 * @demo Controls-demo/Menu/Control/GroupProperty/GroupTemplate/Index
 * @see groupProperty
 */

/**
 * @name Controls/_menu/interface/IMenuControl#root
 * @cfg {Number|String|null} Идентификатор корневого узла.
 * @demo Controls-demo/Menu/Control/Root/Index
 */

/**
 * @typedef {Object} ItemAction
 * @property {String} id Идентификатор опции записи.
 * @property {String} title Название опции записи.
 * @property {String} icon Имя иконки для опции записи.
 * @property {Number} [showType=0] Местоположение опции записи.
 * * 0 — в контекстном меню.
 * * 1 — в строке и в контекстном меню.
 * * 2 — в строке.
 * @property {String} style Значение свойства преобразуется в CSS-класс вида "controls-itemActionsV__action_style_<значение_свойства>".
 * Он будет установлен для html-контейнера самой опции записи, и свойства класса будут применены как к тексту (см. title), так и к иконке (см. icon).
 * @property {String} iconStyle Стиль иконки {@link Controls/_interface/IIconStyle}.
 * Каждому значению свойства соответствует стиль, который определяется {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/themes/ темой оформления} приложения.
 * @property {Function} handler Обработчик опции записи.
 * См. {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/handler-click/ пример обработчика}.
 */

/**
 * @name Controls/_menu/interface/IMenuControl#itemActions
 * @cfg {Array.<ItemAction>} Конфигурация опций записи.
 * @demo Controls-demo/Menu/Control/ItemActions/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#parentProperty
 * @cfg {String} Имя свойства, содержащего информацию о родительском элементе.
 * @demo Controls-demo/Menu/Control/ParentProperty/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#nodeProperty
 * @cfg {String} Имя свойства, содержащего информацию о типе элемента (лист, узел).
 * @demo Controls-demo/Menu/Control/ParentProperty/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#navigation
 * @cfg {Controls/_interface/INavigation} Конфигурация навигации по списку.
 * @demo Controls-demo/Menu/Control/Navigation/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#selectedKeys
 * @cfg {Array.<Number|String>} Массив ключей выбранных элементов.
 * @demo Controls-demo/Menu/Control/SelectedKeys/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#itemTemplate
 * @cfg {Function} Устанавливает шаблон отображения элемента в выпадающем списке. Подробнее про найстройку шаблона {@link Controls/menu:ItemTemplate здесь}.
 * Для контролов из библиотеки dropdown используйте в качестве шаблона Controls/dropdown:ItemTemplate для ленивой загрузки библиотеки menu.
 * @default Controls/menu:ItemTemplate
 * @see itemTemplateProperty
 */

/**
 * @name Controls/_menu/interface/IMenuControl#itemTemplateProperty
 * @cfg {String} Устанавливает имя поля, которое содержит имя шаблона отображения элемента. Подробнее про найстройку шаблона {@link Controls/menu:ItemTemplate здесь}.
 * Для контролов из библиотеки dropdown используйте в качестве шаблона Controls/dropdown:ItemTemplate для ленивой загрузки библиотеки menu.
 * @example
 *  <pre class="brush: html">
 *    <Controls.menu:Control
 *          keyProperty="id"
 *          displayProperty="title"
 *          source="{{_source)}}"
 *          itemTemplateProperty="myTemplate"/>
 * </pre>
 * myItemTemplate.wml
 * <pre class="brush: html">
 *    <ws:partial template="Controls/menu:ItemTemplate"
 *                scope="{{_options}}">
 *       <ws:contentTemplate>
 *          <div class="demo-item">
 *             <div class="demo-title">{{itemTemplate.itemData.item.get('title')}}</div>
 *             <div class="demo-comment">{{itemTemplate.itemData.item.get('comment')}}</div>
 *          </div>
 *       </ws:contentTemplate>
 *    </ws:partial>
 * </pre>
 * <pre class="brush: js">
 *    this._source = new Memory ({
 *       data: [
 *           { id: 1,
 *             title: 'Discussion' },
 *           { id: 2,
 *             title: 'Idea/suggestion',
 *             comment: 'Offer your idea, which others can not only discuss, but also evaluate.
 *             The best ideas will not go unnoticed and will be realized',
 *            myItemTemplate='myItemTemplate.wml' },
 *           { id: 3,
 *             title: 'Problem' }
 *       ],
 *       keyProperty: 'id'
 *    });
 * </pre>
 * @see itemTemplate
 */

/**
 * @name Controls/_menu/interface/IMenuControl#dataLoadCallback
 * @cfg {Function}  Функция обратного вызова, которая будет вызываться, когда данные загружены источником.
 * @example
 * WML:
 * <pre>
 * <Controls.menu:Control
 *          keyProperty="id"
 *          displayProperty="title"
 *          dataLoadCallback="{{_callbackHandler}}"
 *          source="{{_source)}}" />
 * </pre>
 * JS:
 * <pre>
 * this._source = new Memory({
 *    keyProperty: 'id',
 *    data: [
 *       {id: 1, title: 'Yaroslavl'},
 *       {id: 2, title: 'Moscow'},
 *       {id: 3, title: 'St-Petersburg'}
 *    ]
 * });
 * this._callbackHandler = function(items) {
 *   // do something
 * };
 * </pre>
 */

/**
 * @event Controls/_menu/interface/IMenuControl#itemClick Происходит при выборе элемента
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Выбранный элемент.
 * @remark Из обработчика события можно возвращать результат обработки. Если результат будет равен false, подменю не закроется.
 * По умолчанию, когда выбран пункт с иерархией, подменю закрывается.
 * @example
 * В следующем примере показано, как незакрывать подменю, если кликнули на пункт с иерархией.
 * <pre>
 *    <Controls.menu:Control
 *          displayProperty="title"
 *          keyProperty="key"
 *          source="{{_source}}"
 *          on:itemClick="_itemClickHandler()" />
 * </pre>
 * TS:
 * <pre>
 *    protected _itemClickHandler(e, item): boolean {
 *       if (item.get(nodeProperty)) {
 *          return false;
 *       }
 *    }
 * </pre>
 */
