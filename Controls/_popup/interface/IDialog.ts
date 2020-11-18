import { IOpener, IBasePopupOptions } from 'Controls/_popup/interface/IBaseOpener';

/**
 * Интерфейс для опций диалоговых окон.
 *
 * @interface Controls/_popup/interface/IDialogPopupOptions
 * @public
 * @author Красильников А.С.
 */

export interface IDialogPopupOptions extends IBasePopupOptions {
    minWidth?: number;
    width?: number;
    maxWidth?: number;
    minHeight?: number;
    height?: number;
    maxHeight?: number;
    top?: number;
    left?: number;
    maximize?: boolean;
    restrictiveContainer?: string;
}

export interface IDialogOpener extends IOpener {
    readonly '[Controls/_popup/interface/IDialogOpener]': boolean;
}

/**
 * @name Controls/_popup/interface/IDialogPopupOptions#height
 * @cfg {Number} Текущая высота диалогового окна.
 */

/**
 * @name Controls/_popup/interface/IDialogPopupOptions#width
 * @cfg {Number} Текущая ширина диалогового окна.
 */

/**
 * @name Controls/_popup/interface/IDialogPopupOptions#maxHeight
 * @cfg {Number} Максимально допустимая высота диалогового окна.
 */
/**
 * @name Controls/_popup/interface/IDialogPopupOptions#minHeight
 * @cfg {Number} Минимально допустимая высота диалогового окна.
 */
/**
 * @name Controls/_popup/interface/IDialogPopupOptions#maxWidth
 * @cfg {Number} Максимально допустимая ширина диалогового окна.
 */
/**
 * @name Controls/_popup/interface/IDialogPopupOptions#minWidth
 * @cfg {Number} Минимально допустимая ширина диалогового окна.
 */
/*
 * @name Controls/_popup/interface/IDialogPopupOptions#top
 * @cfg {Number} Distance from the window to the top of the screen.
 */
/**
 * @name Controls/_popup/interface/IDialogPopupOptions#top
 * @cfg {Number} Расстояние от диалогового окна до верхнего края экрана.
 */
/*
 * @name Controls/_popup/interface/IDialogPopupOptions#left
 * @cfg {Number} Distance from the window to the left border of the screen.
 */
/**
 * @name Controls/_popup/interface/IDialogPopupOptions#left
 * @cfg {Number} Расстояние от диалогового окна до левого края экрана.
 */

/**
 * @name Controls/_popup/interface/IDialogPopupOptions#maximize
 * @cfg {Boolean} Определяет, должно ли всплывающее окно открываться на весь экран.
 */

/**
 * @name Controls/_popup/interface/IDialogPopupOptions#restrictiveContainer
 * @cfg {String} Опция задает контейнер (через <b>селектор</b>), внутри которого будет позиционироваться окно. Окно не может спозиционироваться за пределами restrictiveContainer.
 * @remark
 * Алгоритм поиска контейнера, внутри которого будут строиться окна:
 * <ol>
 *     <li>Если задана опция restrictiveContainer, то ищем глобальным поиском класс по селектору, заданному в опции.
 *     Если ничего не нашли или опция не задана см. следующий шаг</li>
 *     <li>Если опция не задана, то ищем глобальным селектором класс <b>controls-Popup__dialog-target-container</b></li>
 *     <li>Если ничего не нашли, позиционируемся по body
 * </ol>
 *
 * Класс controls-Popup__dialog-target-container является зарезервированным и должен быть объявлен на странице только 1 раз.
 * Классом должен быть добавлен на контейнер, по которому позиционируются стековые окна по умолчанию.
 * @example
 * wml
 * <pre>
 *     <div class='myRestrictiveContainer'>Контейнер со своими размерами</div>
 *     <Controls.buttons:Button caption="open dialog" on:click="_openDialog()"/>
 * </pre>
 *
 * <pre class="brush: js">
 * import {DialogOpener} from 'Controls/popup';
 * _beforeMount(): void{
 *    this._dialogOpener = new DialogOpener();
 * }
 * _openStack(): void {
 *     const config = {
 *          template: 'Controls-demo/Popup/TestDialog',
 *          closeOnOutsideClick: true,
 *          autofocus: true,
 *          opener: null,
 *          restrictiveContainer: '.myRestrictiveContainer'
 *     };
 *     this._dialogOpener.open(config);
 * }
 * </pre>
 * @demo Controls-demo/Popup/Dialog/RestrictiveContainer/Index
 */

/**
 * @typedef {Object} PopupOptions
 * @description Конфигурация диалогового окна.
 * @property {Boolean} autofocus Определяет, установится ли фокус на шаблон попапа после его открытия.
 * @property {Boolean} modal Определяет, будет ли открываемое окно блокировать работу пользователя с родительским приложением.
 * @property {String} className Имена классов, которые будут применены к корневой ноде диалогового окна.
 * @property {Boolean} closeOnOutsideClick Определяет возможность закрытия диалогового окна по клику вне.
 * @property {function|String} template Шаблон диалогового окна.
 * @property {function|String} templateOptions  Опции для контрола, переданного в {@link template}.
 * @property {Number} width Текущая ширина диалогового окна.
 * @property {Number} height Текущая высота диалогового окна.
 * @property {Number} maxHeight Максимально допустимая высота диалогового окна.
 * @property {Number} minHeight Минимально допустимая высота диалогового окна.
 * @property {Number} maxWidth Максимально допустимая ширина диалогового окна.
 * @property {Number} minWidth Минимально допустимая ширина диалогового окна.
 * @property {Number} top Расстояние от диалогового окна до верхнего края экрана.
 * @property {Number} left Расстояние от диалогового окна до левого края экрана.
 * @property {Node} opener Логический инициатор открытия диалогового окна. Читайте подробнее {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/focus/index/#control-opener здесь}.
 * @property {Controls/_popup/interface/IBaseOpener.typedef} eventHandlers Функции обратного вызова на события всплывающего окна.
 */

/**
 * @name Controls/_popup/interface/IDialogPopupOptions#close
 * @function
 * @description Метод закрытия диалогового окна.
 * @returns {Undefined}
 * @example
 * wml
 * <pre>
 *    <Controls.popup:Dialog name="dialog" template="Controls-demo/Popup/TestDialog" modal="{{true}}">
 *          <ws:templateOptions key="111"/>
 *    </Controls.popup:Dialog>
 *
 *    <Controls.buttons:Button name="openDialogButton" caption="open dialog" on:click="_openDialog()"/>
 *    <Controls.buttons:Button name="closeDialogButton" caption="close dialog" on:click="_closeDialog()"/>
 * </pre>
 * js
 * <pre>
 *   Control.extend({
 *      ...
 *
 *       _openDialog() {
 *          var popupOptions = {
 *              autofocus: true
 *          }
 *          this._children.dialog.open(popupOptions)
 *       }
 *
 *       _closeDialog() {
 *          this._children.dialog.close()
 *       }
 *       ...
 *   });
 * </pre>
 * @see open
 */

/**
 * Метод открытия диалогового окна.
 * Повторный вызов этого метода инициирует перерисовку окна с новыми опциями.
 * @function Controls/_popup/interface/IDialogPopupOptions#open
 * @param {PopupOptions} popupOptions Конфигурация диалогового окна.
 * @remark
 * Если требуется открыть окно, без создания popup:Dialog в верстке, следует использовать статический метод {@link openPopup}.
 * @example
 * wml
 * <pre>
 *    <Controls.popup:Dialog name="dialog" template="Controls-demo/Popup/TestDialog" modal="{{true}}">
 *          <ws:templateOptions key="111"/>
 *    </Controls.popup:Dialog>
 *
 *    <Controls.buttons:Button name="openDialogButton" caption="open dialog" on:click="_openDialog()"/>
 *    <Controls.buttons:Button name="closeDialogButton" caption="close dialog" on:click="_closeDialog()"/>
 * </pre>
 * js
 * <pre>
 *   Control.extend({
 *      ...
 *
 *       _openDialog() {
 *          var popupOptions = {
 *              autofocus: true
 *          }
 *          this._children.dialog.open(popupOptions)
 *       }
 *
 *       _closeDialog() {
 *          this._children.dialog.close()
 *       }
 *       ...
 *   });
 * </pre>
 * @see close
 */
