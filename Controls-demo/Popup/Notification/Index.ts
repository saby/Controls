import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Popup/Notification/Index';
import {NotificationOpener} from 'Controls/popup';
import 'wml!Controls-demo/Popup/Notification/Custom';

export default class NotificationDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    private _count: number = 10;
    private _openers: NotificationOpener[] = [];

    protected _afterMount(): void {
        const half = this._count / 2;
        for (let i = 0; i < this._count; i++) {
            const opener = new NotificationOpener({
                template: 'Controls/popupTemplate:NotificationSimple',
                autoClose: i > half,
                templateOptions: {
                    style: 'success',
                    text: `Hello world from the ${i} opener!!!`,
                    icon: 'icon-Admin'
                }
            });
            this._openers.push(opener);
        }
        const customOpener = new NotificationOpener({
            template: 'wml!Controls-demo/Popup/Opener/resources/CustomNotification',
            templateOptions: {
                value: 'It is custom template'
            }
        });
        this._openers.push(customOpener);
    }

    protected _openNotification(e: Event, index: number): void {
        this._openers[index].open({});
    }

    protected_closeNotification(e: Event, index: number): void {
        this._openers[index].close();
    }
}
