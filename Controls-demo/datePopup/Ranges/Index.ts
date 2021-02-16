import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/datePopup/Ranges/Ranges';

export default class extends Control {
    protected _template: TemplateFunction = template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
