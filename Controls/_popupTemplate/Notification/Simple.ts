import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/Notification/Simple/Simple');
import {default as INotification, INotificationOptions} from './interface/INotification';

export interface INotificationSimpleOptions extends IControlOptions, INotificationOptions {
    icon?: String;
    text?: String;
}

/**
 * Базовый шаблон {@link /doc/platform/developmentapl/interface-development/controls/openers/notification/ простого окна уведомления}.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/notification/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_popupTemplate.less переменные тем оформления}
 * 
 * @class Controls/_popupTemplate/Notification/Simple
 * @extends Core/Control
 * @mixes Controls/_popupTemplate/Notification/interface/INotification
 * 
 * @public
 * @demo Controls-demo/NotificationDemo/NotificationTemplate
 * @author Красильников А.С.
 */
class NotificationSimple extends Control<INotificationSimpleOptions> implements INotification {
    protected _template: TemplateFunction = template;
    protected _iconStyle: String;

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

    static _theme: string[] = ['Controls/popupTemplate', 'Controls/Classes'];
}
/**
 * @name Controls/_popupTemplate/Notification/Simple#icon
 * @cfg {String} Устанавливает значок сообщения окна уведомления.
 */

/**
 * @name Controls/_popupTemplate/Notification/Simple#text
 * @cfg {String} Устанавливает текст уведомления.
 */
export default NotificationSimple;
