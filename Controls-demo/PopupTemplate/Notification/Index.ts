import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/PopupTemplate/Notification/Index';
import 'css!Controls-demo/PopupTemplate/Notification/Index';

export default class NotificationDemo extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
}
