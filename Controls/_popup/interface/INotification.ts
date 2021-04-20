import { IOpener, IBasePopupOptions } from 'Controls/_popup/interface/IBaseOpener';


export interface INotificationPopupOptions extends IBasePopupOptions {
    autoClose?: boolean;
}

/**
 * Интерфейс для опций нотификационных окон.
 * @public
 * @author Красильников А.С.
 */
export interface INotificationOpener extends IOpener {
    readonly '[Controls/_popup/interface/INotificationOpener]': boolean;
}

/**
 * @name Controls/_popup/interface/INotificationOpener#autoClose
 * @cfg {Boolean} Автоматически закрывать окно через 5 секунд после открытия.
 * @default true
 */

/**
 * @typedef {Object} Controls/_popup/interface/INotificationOpener/PopupOptions
 * @description Sets the popup configuration.
 * @property {Boolean} autofocus Определяет, установится ли фокус на шаблон попапа после его открытия.
 * @property {String} className Имена классов, которые будут применены к корневой ноде всплывающего окна.
 * @property {String|TemplateFunction} template Шаблон всплывающего окна.
 * @property {Object} templateOptions Опции для контрола, который добавлен в шаблон {@link template}.
 */

/**
 * Метод открытия нотификационного окна.
 * Повторный вызов этого метода вызовет переририсовку контрола.
 * @function
 * @name Controls/_popup/interface/INotificationOpener#open
 * @param {Controls/_popup/interface/INotificationOpener/PopupOptions.typedef} popupOptions Конфигурация окна.
 * @remark
 * Чтобы открыть окно без создания в верстке {@link Controls/popup:Notification}, используйте статический метод {@link openPopup}.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.popup:Notification name="notificationOpener">
 *    <ws:popupOptions template="wml!Controls/Template/NotificationTemplate" />
 * </Controls.popup:Notification>
 * <Controls.buttons:Button name="openNotificationButton" caption="open notification" on:click="_open()"/>
 * </pre>
 * <pre>
 * // JavaScript
 * class MyControl extends Control<IControlOptions>{
 *    ...
 *    _open() {
 *       var popupOptions = {
 *          templateOptions: {
 *             style: "done",
 *             text: "Message was send",
 *             icon: "Admin"
 *          }
 *       }
 *       this._children.notificationOpener.open(popupOptions)
 *    }
 *    ...
 * }
 * </pre>
 * @see close
 * @see openPopup
 * @see closePopup
 */

/**
 * Статический метод для открытия нотификационного окна. При использовании метода не требуется создавать popup:Notification в верстке.
 * @function 
 * @name Controls/_popup/interface/INotificationOpener#openPopup
 * @param {Controls/_popup/interface/INotificationOpener/PopupOptions.typedef} config Конфигурация окна.
 * @returns {Promise<string>} Возвращает Promise, который в качестве результата вернет идентификатор окна.
 * Такой идентификатор используют в методе {@link closePopup} для закрытия окна.
 * @static
 * @remark
 * Дополнительный пример работы со статическим методом доступен {@link /doc/platform/developmentapl/interface-development/controls/openers/notification/#open-popup здесь}.
 * @example
 * <pre>
 * // TypeScript
 * import {Notification} from 'Controls/popup';
 * ...
 * openNotification() {
 *    Notification.openPopup({
 *       template: 'Example/MyStackTemplate',
 *       autoClose: true
 *    }).then((popupId) => {
 *       this._notificationId = popupId;
 *    });
 * },
 * closeNotification() {
 *    Notification.closePopup(this._notificationId);
 * }
 * </pre>
 * @see closePopup
 * @see close
 * @see open
 */

/**
 * Статический метод для закрытия нотификационного окна по идентификатору.
 * @function
 * @name Controls/_popup/interface/INotificationOpener#closePopup
 * @param {String} popupId Идентификатор окна. 
 * Такой идентификатор можно получить при открытии окна методом {@link openPopup}.
 * @static
 * @remark
 * Дополнительный пример работы со статическим методом доступен {@link /doc/platform/developmentapl/interface-development/controls/openers/notification/#open-popup здесь}.
 * @example
 * <pre>
 * // TypeScript
 * import {Notification} from 'Controls/popup';
 * ...
 * openNotification() {
 *    Notification.openPopup({
 *       template: 'Example/MyStackTemplate',
 *       autoClose: true
 *    }).then((popupId) => {
 *       this._notificationId = popupId;
 *    });
 * },
 * closeNotification() {
 *    Notification.closePopup(this._notificationId);
 * }
 * </pre>
 * @see openPopup
 * @see opener
 * @see close
 */
