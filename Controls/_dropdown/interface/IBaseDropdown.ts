import {IControlOptions} from 'UI/Base';
import {ITooltipOptions, ISearchOptions} from 'Controls/interface';
import { IStickyPopupOptions } from 'Controls/_popup/interface/ISticky';
import {IMenuPopupOptions} from 'Controls/_menu/interface/IMenuPopup';
import {IDropdownSourceOptions} from './IDropdownSource';
export type TKey = string|number|null;

export interface IBaseDropdownOptions extends IControlOptions, IDropdownSourceOptions,
    IMenuPopupOptions, IStickyPopupOptions, ITooltipOptions, ISearchOptions {
    dropdownClassName?: string;
    historyId?: string;
    popupClassName?: string;
    keyProperty: string;
    emptyText?: string;
    displayProperty: string;
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
 * Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/controls/dropdown-menu/item-config/#history">здесь</a>.
 * @demo Controls-demo/dropdown_new/Button/HistoryId/Index
 * @example
 * <pre>
 *    <Controls.dropdown:Input historyId="myHistoryId"/>
 * </pre>
 */

/**
 * @name Controls/_dropdown/interface/IBaseDropdown#dropdownClassName
 * @cfg {String} Класс, который навешивается на выпадающий список.
 * @demo Controls-demo/dropdown_new/Button/DropdownClassName/Index
 * @example
 * Меню со скроллом.
 * TMPL:
 * <pre>
 *    <Controls.dropdown:Button
 *        keyProperty="id"
 *        icon="icon-Check"
 *        iconSize="s"
 *        dropdownClassName="demo_menu"
 *        source="{{_source}}"/>
 * </pre>
 * CSS:
 * <pre>
 *    .demo_menu {
 *       max-height: 250px;
 *    }
 * </pre>
 * JS:
 * <pre>
 *    this._source = new Memory({
 *       data: [
 *           { id: 1, title: 'Task in development' },
 *           { id: 2, title: 'Error in development' },
 *           { id: 3, title: 'Application' },
 *           { id: 4, title: 'Assignment' },
 *           { id: 5, title: 'Approval' },
 *           { id: 6, title: 'Working out' },
 *           { id: 7, title: 'Assignment for accounting' },
 *           { id: 8, title: 'Assignment for delivery' },
 *           { id: 9, title: 'Assignment for logisticians' }
 *       ],
 *       keyProperty: 'id'
 *    });
 * </pre>
 */

/**
 * @name Controls/_dropdown/interface/IBaseDropdown#popupClassName
 * @cfg {String} Класс, который навешивается на всплывающее окно.
 * @example
 * Для всплывающего окна задается сдвиг вверх на 5px.
 * TMPL:
 * <pre>
 *    <Controls.dropdown:Button
 *        popupClassName="MyMenu_popupClassName"
 *        ...
 *        />
 * </pre>
 * CSS:
 * <pre>
 *    .MyMenu_popupClassName {
 *       margin-top: -5px;
 *    }
 * </pre>
 */

/**
 * @name Controls/_dropdown/interface/IBaseDropdown#menuPopupOptions
 * @cfg {Controls/popup:IStickyPopupOptions} Опции для окна выпадающего списка
 * @example
 * Открываем окно выпадающего списка влево. По умолчанию окно открывается вправо.
 * WML:
 * <pre>
 *    <Controls.dropdown:Button source="{{_source}}" displayProperty="title" keyProperty="id"
 *       menuPopupOptions="{{_menuPopupOptions}}"/>
 * </pre>
 *
 * JS:
 * <pre>
 *     import sourceLib from "Types/source"
 *
 *     _beforeMount() {
 *         this._source = new sourceLib.Memory({
 *             keyProperty: 'id',
 *             data: [
 *                {id: 1, title: 'Name'},
 *                {id: 2, title: 'Date of change'}
 *             ]
 *         });
 *         this._menuPopupOptions = {
 *            direction: {
 *               horizontal: 'left',
 *               vertical: 'bottom'
 *            }
 *         }
 *     }
 * </pre>
 * @example
 * Добавляем крестик закрытия для окна.
 * WML:
 * <pre>
 *    <Controls.dropdown:Button source="{{_source}}" displayProperty="title" keyProperty="id"
 *       menuPopupOptions="{{_menuPopupOptions}}"/>
 * </pre>
 *
 * JS:
 * <pre>
 *     import sourceLib from "Types/source"
 *
 *     _beforeMount() {
 *         this._source = new sourceLib.Memory({
 *             keyProperty: 'id',
 *             data: [
 *                {id: 1, title: 'Name'},
 *                {id: 2, title: 'Date of change'}
 *             ]
 *         });
 *         this._menuPopupOptions = {
 *            templateOptions: {
 *               closeButtonVisibility: true
 *            }
 *         }
 *     }
 * </pre>
 */

/**
 * @event Происходит при открытии выпадающего списка.
 * @name Controls/_dropdown/interface/IBaseDropdown#dropDownOpen
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @example
 * WML:
 * <pre>
 *    <Controls.dropdown:Button on:dropDownOpen="_dropDownOpen()" on:dropDownClose="_dropDownClose()"/>
 *    <div>dropDownOpened: {{_dropDownOpened}}</div>
 * </pre>
 *
 * JS:
 * <pre>
 *    _dropDownOpen() {
 *       this._dropDownOpened = true;
 *    },
 *    _dropDownClose() {
 *       this._dropDownOpened = false;
 *    }
 * </pre>
 */

/**
 * @event Происходит при закрытии выпадающего списка.
 * @name Controls/_dropdown/interface/IBaseDropdown#dropDownClose
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @example
 * WML:
 * <pre>
 *    <Controls.dropdown:Button on:dropDownOpen="_dropDownOpen()" on:dropDownClose="_dropDownClose()"/>
 *    <div>dropDownOpened: {{_dropDownOpened}}</div>
 * </pre>
 *
 * JS:
 * <pre>
 *    _dropDownOpen() {
 *       this._dropDownOpened = true;
 *    },
 *    _dropDownClose() {
 *       this._dropDownOpened = false;
 *    }
 * </pre>
 */

/**
 * Открывает выпадающий список.
 * @function Controls/_dropdown/interface/IBaseDropdown#openMenu
 * @param {Object} popupOptions Конфигурация прилипающего блока {@link /docs/js/Controls/popup/IStickyPopupOptions/ popupOptions}
 * @example
 * WML:
 * <pre>
 *    <AnyControl on:showMenu="_showMenu()">
 *       ...
 *    </AnyControl>
 *    <Controls.dropDown:Button name="dropDownButton">
 *       ...
 *    </Controls.dropDown:Button>
 * </pre>
 *
 * ts:
 * <pre>
 *    _showMenu(): void {
 *       this._children.dropDownButton.openMenu();
 *    }
 * </pre>
 */

/**
 * Закрывает выпадающий список.
 * @function Controls/_dropdown/interface/IBaseDropdown#closeMenu
 * @example
 * WML:
 * <pre>
 *    <AnyControl on:closeMenu="_closeMenu()">
 *       ...
 *    </AnyControl>
 *    <Controls.dropDown:Button name="dropDownButton">
 *       ...
 *    </Controls.dropDown:Button>
 * </pre>
 *
 * ts:
 * <pre>
 *    _closeMenu(): void {
 *       this._children.dropDownButton.closeMenu();
 *    }
 * </pre>
 */

/**
 * Перезагружает данные выпадающего списка.
 * @function Controls/_dropdown/interface/IBaseDropdown#reload
 * @example
 * WML:
 * <pre>
 *    <AnyControl on:itemsChanged="_reload()">
 *       ...
 *    </AnyControl>
 *    <Controls.dropDown:Button name="dropDownButton">
 *       ...
 *    </Controls.dropDown:Button>
 * </pre>
 *
 * ts:
 * <pre>
 *    _reload(): void {
 *       this._children.dropDownButton.reload();
 *    }
 * </pre>
 */