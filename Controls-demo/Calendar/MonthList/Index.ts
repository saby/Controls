import {Control, TemplateFunction} from "UI/Base";
import controlTemplate = require('wml!Controls-demo/Calendar/MonthList/Index');

export default class extends Control {
   protected _template: TemplateFunction = controlTemplate;

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
