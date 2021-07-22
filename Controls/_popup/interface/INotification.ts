import { IOpener, IBasePopupOptions } from 'Controls/_popup/interface/IBaseOpener';
import {IControlOptions} from 'UI/Base';

export interface INotificationPopupOptions extends IBasePopupOptions, IControlOptions {
}

/**
 * Интерфейс для опций {@link /doc/platform/developmentapl/interface-development/controls/openers/notification/ окон уведомления}.
 * @public
 * @author Красильников А.С.
 */
export interface INotificationOpener extends IOpener {
    readonly '[Controls/_popup/interface/INotificationOpener]': boolean;
}

/**
 * @name Controls/_popup/interface/INotificationOpener#autoClose
 * @default true
 */

/**
 * @typedef {Object} Controls/_popup/interface/INotificationOpener/PopupOptions
 * @description Конфигурация окна уведомления.
 * @property {Boolean} autofocus Установится ли фокус на шаблон попапа после его открытия.
 * @property {String} className Имена классов, которые будут применены к корневой ноде окна уведомления.
 * @property {String|TemplateFunction} template Шаблон окна уведомления.
 * @property {Object} templateOptions Опции для контрола, который добавлен в шаблон {@link template}.
 */

/**
 * Метод открытия окна уведомления.
 * Повторный вызов этого метода вызовет переририсовку контрола.
 * @function
 * @name Controls/_popup/interface/INotificationOpener#open
 * @param {Controls/_popup/interface/INotificationOpener/PopupOptions.typedef} popupOptions Конфигурация окна.
 * @remark
 * Чтобы открыть окно без создания в верстке {@link Controls/popup:Notification}, используйте статический метод {@link Controls/popup:Notification#openPopup openPopup}.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.popup:Notification name="notificationOpener">
 *    <ws:popupOptions template="wml!Controls/Template/NotificationTemplate" />
 * </Controls.popup:Notification>
 * <Controls.buttons:Button name="openNotificationButton" caption="open notification" on:click="_open()"/>
 * </pre>
 * <pre class="brush: js">
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
 * <pre class="brush: js">
 * // TypeScript
 * import {NotificationOpener} from 'Controls/popup';
 *
 * this._notification = new NotificationOpener();
 *
 * openNotification() {
 *     this._notification.open({
 *         template: 'Example/MyNotificationTemplate',
 *         opener: this
 *     });
 * }
 * </pre>
 * @see close
 * @see closePopup
 */

/**
 * Статический метод для закрытия окна уведомления по идентификатору.
 * @function
 * @name Controls/_popup/interface/INotificationOpener#closePopup
 * @param {String} popupId Идентификатор окна.
 * Такой идентификатор можно получить при открытии окна методом {@link Controls/popup:Notification#openPopup openPopup}.
 * @static
 * @remark
 * Дополнительный пример работы со статическим методом доступен {@link /doc/platform/developmentapl/interface-development/controls/openers/notification/#open-popup здесь}.
 * @example
 * <pre class="brush: js">
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
 * @see opener
 * @see close
 */

/**
 * Метод для закрытия окна уведомления.
 * @name Controls/_popup/interface/INotificationOpener#close
 * @function
 * @example
 * <pre class="brush: js">
 * // TypeScript
 * import {NotificationOpener} from 'Controls/popup';
 *
 * this._notification = new NotificationOpener();
 *
 * closeNotification() {
 *    this._notification.close();
 * }
 * </pre>
 * @see open
 * @see destroy
 * @see isOpened
 */

/**
 * Разрушает экземпляр класса.
 * @name Controls/_popup/interface/INotificationOpener#destroy
 * @function
 * @example
 * <pre class="brush: js">
 * // TypeScript
 * import {NotificationOpener} from 'Controls/popup';
 *
 * this._notification = new NotificationOpener();
 *
 * _beforeUnmount() {
 *     this._notification.destroy();
 *     this._notification = null;
 * }
 * </pre>
 * @see open
 * @see close
 * @see isOpened
 */

/**
 * @name Controls/_popup/interface/INotificationOpener#isOpened
 * @description Возвращает информацию о том, открыто ли окно уведомлений.
 * @function
 * @see open
 * @see close
 * @see destroy
 */
