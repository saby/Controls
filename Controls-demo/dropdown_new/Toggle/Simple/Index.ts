import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/dropdown_new/Toggle/Simple/Index';

export default class extends Control {
    protected _template: TemplateFunction = template;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
