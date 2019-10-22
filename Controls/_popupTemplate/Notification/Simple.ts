import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/Notification/Simple/Simple');
import {default as INotification, INotificationOptions} from './interface/INotification';

export interface INotificationSimpleOptions extends IControlOptions, INotificationOptions {
    icon?: String;
    text?: String;
}

/**
 * Базовый шаблон <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/notification/'>простого окна уведомления</a>.
 *
 * @class Controls/_popupTemplate/Notification/Simple
 * @extends Core/Control
 * @control
 * @public
 * @category popup
 * @demo Controls-demo/NotificationDemo/NotificationTemplate
 * @author Красильников А.С.
 */

/**
 * @name Controls/_popupTemplate/Notification/Simple#icon
 * @cfg {Object} Устанавливает значок сообщения окна уведомления.
 */

/**
 * @name Controls/_popupTemplate/Notification/Simple#text
 * @cfg {String} Устанавливает текст уведомления.
 */


class NotificationSimple extends Control<INotificationSimpleOptions> implements INotification {
    protected _template: TemplateFunction = template;
    private _iconStyle: String;

    private _prepareIconStyle(popupOptions: INotificationSimpleOptions): String {
        switch (popupOptions.style) {
            case 'warning':
                return 'warning';
            case 'success' :
                return 'success';
            case 'danger':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    protected _beforeMount(options: INotificationSimpleOptions): void {
        this._iconStyle = this._prepareIconStyle(options);
    }

    protected _beforeUpdate(options: INotificationSimpleOptions): void {
        this._iconStyle = this._prepareIconStyle(options);
    }

    static getDefaultOptions(): INotificationSimpleOptions {
        return {
            style: 'secondary',
            autoClose: true,
            closeButtonVisibility: true
        };
    }

    static _theme: string[] = ['Controls/popupTemplate'];
}

export default NotificationSimple;
