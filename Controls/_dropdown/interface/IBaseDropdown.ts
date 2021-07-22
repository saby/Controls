import {IControlOptions} from 'UI/Base';
import {ISourceOptions, ITooltipOptions, ISearchOptions, IItemsOptions} from 'Controls/interface';
import { IStickyPopupOptions } from 'Controls/popup';
import {IMenuPopupOptions} from 'Controls/menu';
import {ICrudPlus} from 'Types/source';
import {Record} from 'Types/entity';
export type TKey = string|number|null;

export interface IDropdownSourceOptions {
    source?: ICrudPlus
}

export interface IBaseDropdownOptions extends IControlOptions, ISourceOptions,
    IMenuPopupOptions, IStickyPopupOptions, ITooltipOptions, ISearchOptions, IItemsOptions<Record> {
    dropdownClassName?: string;
    historyId?: string;
    popupClassName?: string;
    keyProperty: string;
    emptyText?: string;
    displayProperty: string;
    closeMenuOnOutsideClick: boolean;
}

/**
 * Базовый интерфейс для выпадающих списков.
 *
 * @interface Controls/_dropdown/interface/IBaseDropdown
 * @public
 * @author Золотова Э.Е.
 */
export default interface IBaseDropdown {
    readonly '[Controls/_dropdown/interface/IBaseDropdown]': boolean;
    openMenu(popupOptions?: IStickyPopupOptions): void;
    closeMenu(): void;
    reload(): void;
}

/**
 * @name Controls/_dropdown/interface/IBaseDropdown#historyId
 * @cfg {String} Уникальный идентификатор для сохранения истории выбора записей.
 * Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/input-elements/dropdown-menu/item-config/#history здесь}.
 * @demo Controls-demo/dropdown_new/Button/HistoryId/Index
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Selector historyId="myHistoryId"/>
 * </pre>
 */

/**
 * @name Controls/_dropdown/interface/IBaseDropdown#dropdownClassName
 * @cfg {String} Класс, который навешивается на выпадающий список.
 * @demo Controls-demo/dropdown_new/Button/DropdownClassName/Index
 * @example
 * Меню со скроллом.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Button
 *    keyProperty="id"
 *    icon="icon-Check"
 *    iconSize="s"
 *    dropdownClassName="demo_menu"
 *    source="{{_source}}" />
 * </pre>
 * CSS:
 * <pre class="brush: css">
 * .demo_menu {
 *    max-height: 250px;
 * }
 * </pre>
 * <pre class="brush: js">
 * // TypeScript
 * this._source = new Memory({
 *     data: [
 *         { id: 1, title: 'Task in development' },
 *         { id: 2, title: 'Error in development' },
 *         { id: 3, title: 'Application' },
 *         { id: 4, title: 'Assignment' },
 *         { id: 5, title: 'Approval' },
 *         { id: 6, title: 'Working out' },
 *         { id: 7, title: 'Assignment for accounting' },
 *         { id: 8, title: 'Assignment for delivery' },
 *         { id: 9, title: 'Assignment for logisticians' }
 *     ],
 *     keyProperty: 'id'
 * });
 * </pre>
 */

/**
 * @name Controls/_dropdown/interface/IBaseDropdown#popupClassName
 * @cfg {String} Класс, который навешивается на всплывающее окно.
 * @example
 * Для всплывающего окна задается сдвиг вверх на 5px.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Button popupClassName="MyMenu_popupClassName" />
 * </pre>
 * <pre class="brush: css">
 * .MyMenu_popupClassName {
 *    margin-top: -5px;
 * }
 * </pre>
 */

/**
 * @name Controls/_dropdown/interface/IBaseDropdown#menuPopupOptions
 * @cfg {Controls/popup:IStickyOpener} Опции для окна выпадающего списка
 * @example
 * Открываем окно выпадающего списка влево. По умолчанию окно открывается вправо.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Button
 *    source="{{_source}}"
 *    displayProperty="title"
 *    keyProperty="id"
 *    menuPopupOptions="{{_menuPopupOptions}}"/>
 * </pre>
 *
 * <pre class="brush: js">
 * // TypeScript
 * import sourceLib from "Types/source"
 *
 * _beforeMount() {
 *     this._source = new sourceLib.Memory({
 *         keyProperty: 'id',
 *         data: [
 *             {id: 1, title: 'Name'},
 *             {id: 2, title: 'Date of change'}
 *         ]
 *     });
 *     this._menuPopupOptions = {
 *         direction: {
 *             horizontal: 'left',
 *             vertical: 'bottom'
 *         }
 *     }
 * }
 * </pre>
 * @example
 * Добавляем крестик закрытия для окна.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Button
 *    source="{{_source}}"
 *    displayProperty="title"
 *    keyProperty="id"
 *    menuPopupOptions="{{_menuPopupOptions}}"/>
 * </pre>
 *
 * <pre class="brush: js">
 * // TypeScript
 * import sourceLib from "Types/source"
 *
 * _beforeMount() {
 *     this._source = new sourceLib.Memory({
 *         keyProperty: 'id',
 *         data: [
 *             {id: 1, title: 'Name'},
 *             {id: 2, title: 'Date of change'}
 *         ]
 *     });
 *     this._menuPopupOptions = {
 *         templateOptions: {
 *             closeButtonVisibility: true
 *         }
 *     }
 * }
 * </pre>
 */

/**
 * @name Controls/_dropdown/interface/IBaseDropdown#closeMenuOnOutsideClick
 * @cfg {Boolean} Определяет возможность закрытия меню по клику вне.
 * @default true
 */

/**
 * @event Происходит при открытии выпадающего списка.
 * @name Controls/_dropdown/interface/IBaseDropdown#dropDownOpen
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Button on:dropDownOpen="_dropDownOpen()" on:dropDownClose="_dropDownClose()"/>
 * <div>dropDownOpened: {{_dropDownOpened}}</div>
 * </pre>
 *
 * <pre class="brush: js">
 * // TypeScript
 * _dropDownOpen() {
 *    this._dropDownOpened = true;
 * },
 * _dropDownClose() {
 *    this._dropDownOpened = false;
 * }
 * </pre>
 */

/**
 * @event Происходит при закрытии выпадающего списка.
 * @name Controls/_dropdown/interface/IBaseDropdown#dropDownClose
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Button on:dropDownOpen="_dropDownOpen()" on:dropDownClose="_dropDownClose()"/>
 * <div>dropDownOpened: {{_dropDownOpened}}</div>
 * </pre>
 * <pre class="brush: js">
 * // TypeScript
 * _dropDownOpen() {
 *    this._dropDownOpened = true;
 * },
 * _dropDownClose() {
 *    this._dropDownOpened = false;
 * }
 * </pre>
 */

/**
 * Открывает выпадающий список.
 * @function Controls/_dropdown/interface/IBaseDropdown#openMenu
 * @param {Object} popupOptions Конфигурация прилипающего блока {@link /docs/js/Controls/popup/IStickyPopupOptions/ popupOptions}
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <AnyControl on:showMenu="_showMenu()">
 *    ...
 * </AnyControl>
 * <Controls.dropDown:Button name="dropDownButton">
 *    ...
 * </Controls.dropDown:Button>
 * </pre>
 * <pre class="brush: js">
 * // TypeScript
 * _showMenu(): void {
 *    this._children.dropDownButton.openMenu();
 * }
 * </pre>
 */

/**
 * Закрывает выпадающий список.
 * @function Controls/_dropdown/interface/IBaseDropdown#closeMenu
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <AnyControl on:closeMenu="_closeMenu()">
 *    ...
 * </AnyControl>
 * <Controls.dropDown:Button name="dropDownButton">
 *    ...
 * </Controls.dropDown:Button>
 * </pre>
 * <pre class="brush: js">
 * // TypeScript
 *    _closeMenu(): void {
 *       this._children.dropDownButton.closeMenu();
 *    }
 * </pre>
 */

/**
 * Перезагружает данные выпадающего списка.
 * @function Controls/_dropdown/interface/IBaseDropdown#reload
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <AnyControl on:itemsChanged="_reload()">
 *    ...
 * </AnyControl>
 * <Controls.dropDown:Button name="dropDownButton">
 *    ...
 * </Controls.dropDown:Button>
 * </pre>
 * <pre class="brush: js">
 * // TypeScript
 * _reload(): void {
 *    this._children.dropDownButton.reload();
 * }
 * </pre>
 */

/**
 * @typedef {Object} Controls/_dropdown/interface/IBaseDropdown/Item
 * @property {Object} [itemTemplateOptions] Опции, которые будут переданы в шаблон пункта.
 * @property {Boolean} [readOnly] Определяет, может ли пользователь изменить значение контрола. {@link UICore/Base:Control#readOnly См. подробнее}
 * @property {String} [iconStyle] Определяет цвет иконки элемента.{@link Controls/interface:IIconStyle#iconStyle См. подробнее}
 * @property {String} [icon] Определяет иконку элемента. {@link Controls/interface:IIcon#icon См. подробнее}
 * @property {String} [title] Определяет текст элемента.
 * @property {String} [tooltip] Определяет текст всплывающей подсказки, появляющейся при наведении на элемент, если он отличается от title.
 * @property {String} [pinned] Определяет является ли пункт закрепленным.
 * @property {Boolean} [doNotSaveToHistory] Используется для меню с историей, определяет можно ли пункт запинить или добавить в историю.
 * Пункт будет отображен на той же позиции, на которой он находится в загруженном рекордсете. В меню с множественным выбором клик по такому пункту сбрасывает выделение.
 *
 */

/**
 * @typedef {Object} Controls/_dropdown/interface/IBaseDropdown/SourceCfg
 * @property {Controls/_dropdown/interface/IBaseDropdown/Item.typedef} [item] Формат исходной записи.
 */

/*
 * @typedef {Object} Controls/_dropdown/interface/IBaseDropdown/SourceCfg
 * @property {Controls/_dropdown/interface/IBaseDropdown/Item.typedef} [item] Format of source record.
 */