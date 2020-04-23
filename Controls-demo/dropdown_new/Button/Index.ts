import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/dropdown_new/Button/Button';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
