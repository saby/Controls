import Base from './Base';
import Notification from '../Opener/Notification';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {INotificationPopupOptions} from '../interface/INotification';

/**
 * Хелпер для открытия {@link /doc/platform/developmentapl/interface-development/controls/openers/notification/ окон уведомления}.
 * @class Controls/_popup/PopupHelper/Notification
 * @implements Controls/popup:INotificationOpener
 *
 * @author Красильников А.С.
 * @public
 */
export default class NotificationOpener extends Base {
    protected _opener = Notification;
    private _compatiblePopupInstance: unknown;

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
