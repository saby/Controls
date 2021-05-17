import { IOpener, IBasePopupOptions } from 'Controls/_popup/interface/IBaseOpener';

export interface IDialogPopupOptions extends IBasePopupOptions {
    minWidth?: number;
    width?: number;
    maxWidth?: number;
    minHeight?: number;
    height?: number;
    maxHeight?: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    resizeDirection?: IResizeDirection;
    maximize?: boolean;
    restrictiveContainer?: string;
}

/**
 * Интерфейс для опций {@link /doc/platform/developmentapl/interface-development/controls/openers/dialog/ диалоговых окон}.
 * @public
 * @author Красильников А.С.
 */
export interface IDialogOpener extends IOpener {
    readonly '[Controls/_popup/interface/IDialogOpener]': boolean;
}

/**
 * @typedef {Object} IResizeDirection
 * @property {String} vertical
 * @property {String} horizontal
 */
export interface IResizeDirection {
    vertical?: 'top' | 'bottom';
    horizontal?: 'left' | 'right';
}

/**
 * @name Controls/_popup/interface/IDialogOpener#height
 * @cfg {Number} Текущая высота диалогового окна.
 * @see maxHeight
 * @see minHeight
 */

/**
 * @name Controls/_popup/interface/IDialogOpener#width
 * @cfg {Number} Текущая ширина диалогового окна.
 * @see maxWidth
 * @see minWidth
 */

/**
 * @name Controls/_popup/interface/IDialogOpener#maxHeight
 * @cfg {Number} Максимально допустимая высота диалогового окна.
 * @see height
 * @see minHeight
 */
/**
 * @name Controls/_popup/interface/IDialogOpener#minHeight
 * @cfg {Number} Минимально допустимая высота диалогового окна.
 * @see height
 * @see maxHeight
 */
/**
 * @name Controls/_popup/interface/IDialogOpener#maxWidth
 * @cfg {Number} Максимально допустимая ширина диалогового окна.
 * @see width
 * @see minWidth
 */
/**
 * @name Controls/_popup/interface/IDialogOpener#minWidth
 * @cfg {Number} Минимально допустимая ширина диалогового окна.
 * @see width
 * @see maxWidth
 */
/**
 * @name Controls/_popup/interface/IDialogOpener#resizeDirection
 * @cfg {IResizeDirection} Направление, в котором попап будет увеличиваться при динамическом изменении размеров контента.
 * В этом случае противоположная сторона будет зафиксирована и не изменит свою позицию относительно окна браузера.
 * @demo Controls-demo/Popup/Dialog/ResizeDirection/Index
 */
/*
 * @name Controls/_popup/interface/IDialogOpener#top
 * @cfg {Number} Distance from the window to the top of the screen.
 * @see left
 */
/**
 * @name Controls/_popup/interface/IDialogOpener#top
 * @cfg {Number} Расстояние от диалогового окна до верхнего края экрана.
 * @see left
 */
/*
 * @name Controls/_popup/interface/IDialogOpener#left
 * @cfg {Number} Distance from the window to the left border of the screen.
 * @see top
 */
/**
 * @name Controls/_popup/interface/IDialogOpener#left
 * @cfg {Number} Расстояние от диалогового окна до левого края экрана.
 * @see top
 */

/**
 * @name Controls/_popup/interface/IDialogOpener#maximize
 * @cfg {Boolean} Определяет, должно ли диалоговое окно открываться на весь экран.
 */

/**
 * @name Controls/_popup/interface/IDialogOpener#restrictiveContainer
 * @cfg {String} Опция задает контейнер (через селектор), внутри которого будет позиционироваться окно. Окно не может спозиционироваться за пределами restrictiveContainer.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <div class='myRestrictiveContainer'>Контейнер со своими размерами</div>
 * <Controls.buttons:Button caption="open dialog" on:click="_openDialog()"/>
 * </pre>
 *
 * <pre class="brush: js">
 * // TypeScript
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
 * @typedef {Object} Controls/_popup/interface/IDialogOpener/PopupOptions
 * @description Конфигурация диалогового окна.
 * @property {Boolean} autofocus Установится ли фокус на шаблон попапа после его открытия.
 * @property {Boolean} modal Будет ли открываемое окно блокировать работу пользователя с родительским приложением.
 * @property {String} className Имена классов, которые будут применены к корневой ноде диалогового окна.
 * @property {Boolean} closeOnOutsideClick Определяет возможность закрытия диалогового окна по клику вне.
 * @property {function|String} template Шаблон диалогового окна.
 * @property {function|String} templateOptions Опции для контрола, переданного в {@link template}.
 * @property {Number} width Текущая ширина диалогового окна.
 * @property {Number} height Текущая высота диалогового окна.
 * @property {Number} maxHeight Максимально допустимая высота диалогового окна.
 * @property {Number} minHeight Минимально допустимая высота диалогового окна.
 * @property {Number} maxWidth Максимально допустимая ширина диалогового окна.
 * @property {Number} minWidth Минимально допустимая ширина диалогового окна.
 * @property {Number} top Расстояние от диалогового окна до верхнего края экрана.
 * @property {Number} left Расстояние от диалогового окна до левого края экрана.
 * @property {Node} opener Логический инициатор открытия диалогового окна (см. {@link /doc/platform/developmentapl/interface-development/ui-library/focus/activate-control/#control-opener Определение понятия "опенер контрола"}).
 * @property {Controls/_popup/interface/IBaseOpener.typedef} eventHandlers Функции обратного вызова на события диалогового окна.
 */

/**
 * @name Controls/_popup/interface/IDialogOpener#close
 * @function
 * @description Метод закрытия диалогового окна.
 * @returns {Undefined}
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.popup:Dialog name="dialog" template="Controls-demo/Popup/TestDialog" modal="{{true}}">
 *    <ws:templateOptions key="111"/>
 * </Controls.popup:Dialog>
 *
 * <Controls.buttons:Button name="openDialogButton" caption="open dialog" on:click="_openDialog()"/>
 * <Controls.buttons:Button name="closeDialogButton" caption="close dialog" on:click="_closeDialog()"/>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * class MyControl extends Control<IControlOptions>{
 *    ...
 *
 *    _openDialog() {
 *       var popupOptions = {
 *          autofocus: true
 *       }
 *       this._children.dialog.open(popupOptions)
 *    }
 *
 *    _closeDialog() {
 *       this._children.dialog.close()
 *    }
 *    ...
 * }
 * </pre>
 * 
 * <pre class="brush: js">
 * // TypeScript
 * import {DialogOpener} from 'Controls/popup';
 *
 * this._dialog = new DialogOpener();
 *
 * closeDialog() {
 *     this._dialog.close();
 * }
 * </pre>
 * @see open
 * @see destroy
 * @see isOpened
 */

/**
 * Метод открытия диалогового окна.
 * @function Controls/_popup/interface/IDialogOpener#open
 * @param {Controls/_popup/interface/IDialogOpener/PopupOptions.typedef} popupOptions Конфигурация диалогового окна.
 * @return Promise<void>
 * @remark
 * Если требуется открыть окно без создания {@link Controls/popup:Dialog} в верстке, следует использовать статический метод {@link Controls/interface:IOpenPopup#openPopup openPopup}.
 * Повторный вызов этого метода инициирует перерисовку окна с новыми опциями.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.popup:Dialog name="dialog" template="Controls-demo/Popup/TestDialog" modal="{{true}}">
 *    <ws:templateOptions key="111"/>
 * </Controls.popup:Dialog>
 *
 * <Controls.buttons:Button name="openDialogButton" caption="open dialog" on:click="_openDialog()"/>
 * <Controls.buttons:Button name="closeDialogButton" caption="close dialog" on:click="_closeDialog()"/>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * class MyControl extends Control<IControlOptions> {
 *    ...
 *    _openDialog() {
 *       var popupOptions = {
 *          autofocus: true
 *       }
 *       this._children.dialog.open(popupOptions)
 *    }
 *
 *    _closeDialog() {
 *       this._children.dialog.close()
 *    }
 *    ...
 * };
 * </pre>
 * 
 * <pre class="brush: js">
 * // TypeScript
 * import {DialogOpener} from 'Controls/popup';
 *
 * this._dialog = new DialogOpener();
 *
 * openDialog() {
 *     this._dialog.open({
 *         template: 'Example/MyDialogTemplate',
 *         opener: this._children.myButton
 *     });
 * }
 * </pre>
 * @see close
 * @see destroy
 * @see isOpened
 */


/**
 * Разрушает экземпляр класса.
 * @function Controls/_popup/interface/IDialogOpener#destroy
 * @example
 * <pre class="brush: js">
 * // TypeScript
 * import {DialogOpener} from 'Controls/popup';
 *
 * this._dialog = new DialogOpener();
 *
 * _beforeUnmount() {
 *     this._dialog.destroy();
 *     this._dialog = null;
 * }
 * </pre>
 * @see open
 * @see close
 * @see isOpened
 */

/**
 * @name Controls/_popup/interface/IDialogOpener#isOpened
 * @description Возвращает информацию о том, открыто ли диалоговое окно.
 * @function
 * @see open
 * @see close
 * @see destroy
 */