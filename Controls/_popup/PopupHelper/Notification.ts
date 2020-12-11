import Base from './Base';
import Notification from '../Opener/Notification';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {INotificationPopupOptions} from '../interface/INotification';

/**
 * Хелпер для открытия нотификационных окон
 * @class Controls/_popup/PopupHelper/Notification
 * 
 * @author Красильников А.С.
 * @public
 */
export default class NotificationOpener extends Base {
    _opener = Notification;

    /**
     * Метод для открытия нотификационных окон
     * @function Controls/_popup/PopupHelper/Notification#open
     * @param {INotificationPopupOptions} popupOptions Конфигурация нотификационного окна
     * @example
     * <pre class="brush: js">
     * import {NotificationOpener} from 'Controls/popup';
     * ...
     * this._notification = new NotificationOpener();
     * openNotification() {
     *     this._notification.open({
     *         template: 'Example/MyNotificationTemplate',
     *         opener: this
     *     });
     * }
     * </pre>
     * @see close
     * @see destroy
     */
    open(popupOptions: INotificationPopupOptions) {
        super.open(popupOptions);
    }

    protected _openPopup(config, popupController): void {
        // На старых страницах нотификационные окна открываются через PopupMixin
        // Нужно учитывать, чтобы работал метод close
        if (!isNewEnvironment()) {
            this._opener.openPopup(config, popupController).then((popupInstance) => {
                this._popupId = popupInstance;
            });
        } else {
            super._openPopup.apply(this, arguments);
        }
    }
}
/**
 * Метод для закрытия нотификационного окна
 * @name Controls/_popup/PopupHelper/Notification#close
 * @function
 * @example
 * <pre class="brush: js">
 * import {NotificationOpener} from 'Controls/popup';
 * ...
 * this._notification = new NotificationOpener();
 *
 * closeNotification() {
 *    this._notification.close();
 * }
 * </pre>
 * @see open
 * @see destroy
 */

/**
 * Разрушает экземпляр класса
 * @name Controls/_popup/PopupHelper/Notification#destroy
 * @function
 * @example
 * <pre class="brush: js">
 *    import {NotificationOpener} from 'Controls/popup';
 *    ...
 *    this._notification = new NotificationOpener();
 *
 *    _beforeUnmount() {
 *        this._notification.destroy();
 *        this._notification = null;
 *    }
 * </pre>
 * @see open
 * @see close
 */
