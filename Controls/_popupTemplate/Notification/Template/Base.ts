import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Notification/Template/Base/Base';
import {INotificationBase} from 'Controls/_popupTemplate/interface/INotification';
import 'css!Controls/popupTemplate';

export interface INotificationBaseOptions extends INotificationBase, IControlOptions {
    bodyContentTemplate?: Control<IControlOptions, void> | TemplateFunction;
}

/**
 * Базовый шаблон {@link /doc/platform/developmentapl/interface-development/controls/openers/notification/#template окна уведомления}.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/notification/#template руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popupTemplate/Notification/Base
 * @extends UI/Base:Control
 * @mixes Controls/popupTemplate:INotification
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/NotificationDemo/NotificationTemplate
 */

class Notification extends Control<INotificationBaseOptions> {
    protected _template: TemplateFunction = template;
    protected _borderStyle: String;

    protected _beforeMount(options: INotificationBaseOptions): void {
        this._borderStyle = Notification._prepareBorderStyle(options);
    }

    protected _beforeUpdate(options: INotificationBaseOptions): void {
        this._borderStyle = Notification._prepareBorderStyle(options);
    }

    protected _closeClick(ev: Event): void {
        // Клик по крестику закрытия не должен всплывать выше и обрабатываться событием click на контейнере
        ev.stopPropagation();
        this._notify('close', []);
    }

    private static _prepareBorderStyle(popupOptions: INotificationBaseOptions): String {
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

    static getDefaultOptions(): INotificationBaseOptions {
        return {
            style: 'secondary',
            closeButtonVisibility: true
        };
    }
}

Object.defineProperty(Notification, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Notification.getDefaultOptions();
    }
});

/**
 * @name Controls/_popupTemplate/Notification/Base#bodyContentTemplate
 * @cfg {Function|String} Определяет основной контент окна уведомления.
 */
export default Notification;
