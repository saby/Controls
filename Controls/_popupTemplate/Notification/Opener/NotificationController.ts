import Deferred = require('Core/Deferred');
import collection = require('Types/collection');
import {default as BaseController} from 'Controls/_popupTemplate/BaseController';
import {IPopupItem, IPopupOptions} from 'Controls/popup';
import NotificationStrategy = require('Controls/_popupTemplate/Notification/Opener/NotificationStrategy');
import NotificationContent = require('Controls/_popupTemplate/Notification/Opener/NotificationContent');

const timeAutoClose = 5000;

interface INotificationItem extends IPopupItem {
    height: number;
    closeId: number;
    popupOptions: INotificationOptions;
}

interface INotificationOptions extends IPopupOptions {
    autoClose: boolean;
    maximize: boolean;
}

/**
 * Notification Popup Controller
 * @class Controls/_popupTemplate/Notification/Opener/NotificationController
 * @control
 * @private
 * @category Popup
 * @extends Controls/_popupTemplate/BaseController
 */
class NotificationController extends BaseController {
    TYPE: string = 'Notification';
    _stack: collection.List<INotificationItem> = new collection.List();

    elementCreated(item: INotificationItem, container: HTMLDivElement): boolean {
        item.height = container.offsetHeight;
        this._setNotificationContent(item);
        this._stack.add(item, 0);
        this._updatePositions();
        if (item.popupOptions.autoClose) {
            this._closeByTimeout(item);
        }
        return true;
    }

    elementUpdated(item: INotificationItem, container: HTMLDivElement): boolean {
        this._setNotificationContent(item);
        item.height = container.offsetHeight;
        this._updatePositions();
        return true;
    }

    elementDestroyed(item: INotificationItem): Promise<null> {
        this._stack.remove(item);
        this._updatePositions();

        super.elementDestroyed.call(item);
        return new Deferred().callback();
    }

    popupMouseEnter(item: INotificationItem): void {
        if (item.popupOptions.autoClose) {
            clearTimeout(item.closeId);
        }
    }

    popupMouseLeave(item: INotificationItem): void {
        if (item.popupOptions.autoClose) {
            this._closeByTimeout(item);
        }
    }

    getDefaultConfig(item: INotificationItem): void {
        super.getDefaultConfig.apply(this, arguments);
        this._setNotificationContent(item);
    }

    private _closeByTimeout(item: INotificationItem): void  {
        item.closeId = setTimeout(() => {
            require('Controls/popup').Controller.remove(item.id);
        }, timeAutoClose);
    }

    private _updatePositions(): void {
        let height: number = 0;

        /**
         * In item.height is the height of the popup.
         * It takes into account the indentation between the notification popups,
         * specified in the template via css. This is done to support theming.
         */
        this._stack.each((item: INotificationItem) => {
            item.position = NotificationStrategy.getPosition(height);
            height += item.height;
        });
    }

    private _setNotificationContent(item: INotificationItem): void {
        item.popupOptions.content = NotificationContent;
    }
}
export = new NotificationController();
