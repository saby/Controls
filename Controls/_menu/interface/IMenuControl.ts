import {IControlOptions, TemplateFunction} from 'UI/Base';
import {ISourceOptions, INavigation, IFilterOptions, IHierarchy, IIconSizeOptions} from 'Controls/interface';
import {IGroupedOptions} from 'Controls/dropdown';

export type TKeys = string[]|number[];

interface IItemPadding {
    left: string;
    right: string;
}

export interface IMenuControlOptions extends IControlOptions, ISourceOptions, INavigation, IFilterOptions, IHierarchy, IIconSizeOptions, IGroupedOptions {
    displayProperty: string;
    itemTemplate?: TemplateFunction;
    emptyText?: string;
    emptyKey?: string|number;
    historyConfig: IHistoryConfig;
    itemPadding: IItemPadding;
    multiSelect?: boolean;
    nodeFooterTemplate: TemplateFunction;
    root?: string|number|null;
    selectedKeys?: TKeys;
    selectorTemplate?: object;
    selectorOpener?: object;
    selectorDialogResult?: Function;
    isCompoundTemplate?: boolean;
    groupingKeyCallback?: Function;
    itemActions: any[];
}

export interface IHistoryConfig {
    historyId: string;
    pinned: TKeys|boolean;
    recent: boolean;
    frequent: boolean;
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
 * @cfg {Ыекштп} Имя свойства, содержащего информацию о родительском элементе.
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
