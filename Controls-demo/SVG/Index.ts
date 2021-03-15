import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/SVG/SVG';

export default class extends Control {
    protected _template: TemplateFunction = template;
}
