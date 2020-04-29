import {Control, TemplateFunction} from "UI/Base";
import * as controlTemplate from 'wml!Controls-demo/ReportDialog/FooterContentTemplate/FooterContentTemplate';

export default class extends Control {
   protected _template: TemplateFunction = controlTemplate;

   static _styles: string[] = ['Controls-demo/ReportDialog/Index', 'Controls-demo/Controls-demo'];
}