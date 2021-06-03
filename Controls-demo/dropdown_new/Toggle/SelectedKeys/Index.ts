import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/dropdown_new/Toggle/SelectedKeys/Index';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _selectedKeys: boolean[] = [true];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
