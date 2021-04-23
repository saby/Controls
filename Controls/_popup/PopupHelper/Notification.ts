import Base from './Base';
import Notification from '../Opener/Notification';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {INotificationPopupOptions} from '../interface/INotification';

/**
 * Хелпер для открытия нотификационных окон.
 * @class Controls/_popup/PopupHelper/Notification
 * @implements Controls/popup:INotificationOpener
 *
 * @author Красильников А.С.
 * @public
 */
export default class NotificationOpener extends Base {
    protected _opener = Notification;
    private _compatiblePopupInstance: unknown;

    /**
     * Метод для открытия нотификационных окон.
     * @function Controls/_popup/PopupHelper/Notification#open
     * @param {INotificationPopupOptions} popupOptions Конфигурация нотификационного окна.
     * @example
     * <pre class="brush: js">
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
     * @see destroy
     * @see isOpened
     */
    open(popupOptions: INotificationPopupOptions) {
        super.open(popupOptions);
    }

    close(): void {
        if (isNewEnvironment()) {
            return super.close();
        }
        this._compatiblePopupInstance.close();
        this._compatiblePopupInstance = null;
    }

    isOpened(): boolean {
        if (isNewEnvironment()) {
            return super.isOpened();
        }
        if (this._compatiblePopupInstance) {
            // @ts-ignore На старой странице для идентификатора используется инстанс PopupMixin'a
            return this._compatiblePopupInstance.isDestroyed() === false;
        }
        return false;
    }

    protected _openPopup(config, popupController): void {
        // На старых страницах нотификационные окна открываются через PopupMixin
        // Нужно учитывать, чтобы работал метод close
        if (!isNewEnvironment()) {
            this._opener.openPopup(config, popupController).then((popupInstance) => {
                this._compatiblePopupInstance = popupInstance;
            });
        } else {
            super._openPopup.apply(this, arguments);
        }
    }
}
/**
 * Метод для закрытия нотификационного окна.
 * @name Controls/_popup/PopupHelper/Notification#close
 * @function
 * @example
 * <pre class="brush: js">
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
 * @name Controls/_popup/PopupHelper/Notification#destroy
 * @function
 * @example
 * <pre class="brush: js">
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
 * @name Controls/_popup/PopupHelper/Notification#isOpened
 * @description Возвращает информацию о том, открыто ли нотификационное окно.
 * @function
 * @see open
 * @see close
 * @see destroy
 */
