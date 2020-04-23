import {Control, TemplateFunction} from "UI/Base";
import controlTemplate = require('wml!Controls-demo/Suggest_new/Input/Index');

export default class extends Control{
   protected _template: TemplateFunction = controlTemplate;
   static _styles: string[] = ['Controls-demo/Controls-demo'];
}