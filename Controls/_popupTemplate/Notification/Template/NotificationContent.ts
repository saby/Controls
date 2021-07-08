import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Notification/Template/NotificationContent/NotificationContent';

export default class NotificationContent extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
}
