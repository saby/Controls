import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/Notification/Base/Base');
import {default as INotification, INotificationOptions} from './interface/INotification';
import {INotificationSimpleOptions} from "./Simple";

export interface INotificationBaseOptions extends IControlOptions, INotificationOptions{
    bodyContentTemplate?: String | Function;

}

/**
* Базовый шаблон {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/notification/#template окна уведомления}.
*
* @class Controls/_popupTemplate/Notification/Base
* @extends Core/Control
* @mixes Controls/_popupTemplate/Notification/interface/INotification
* @control
* @public
* @category popup
* @author Красильников А.С.
* @demo Controls-demo/NotificationDemo/NotificationTemplate
*/

/**
 * @name Controls/_popupTemplate/Notification/Base#bodyContentTemplate
 * @cfg {Function|String} Определяет основной контент окна уведомления.
 */



class Notification extends Control<INotificationBaseOptions> implements INotification{
    protected _template: TemplateFunction = template;
    protected _borderStyle: String;
    private _prepareBorderStyle(popupOptions: INotificationBaseOptions): String {
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
        this._borderStyle = this._prepareBorderStyle(options);
    }

    protected _beforeUpdate(options: INotificationSimpleOptions): void {
        this._borderStyle = this._prepareBorderStyle(options);
    }

    protected _closeClick(ev: Event): void {
        // Клик по крестику закрытия не должен всплывать выше и обрабатываться событием click на контейнере
        ev.stopPropagation();
        this._notify('close', []);
    }

    static getDefaultOptions(): INotificationOptions {
        return {
            style: 'secondary',
            autoClose: true,
            closeButtonVisibility: true
        };
    }
    static _theme: string[] = ['Controls/popupTemplate'];
}

export default Notification;
