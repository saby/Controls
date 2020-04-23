import {Control, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/ReportDialog/Title/Title';

export default class extends Control {
   protected _template: TemplateFunction = controlTemplate;
   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
