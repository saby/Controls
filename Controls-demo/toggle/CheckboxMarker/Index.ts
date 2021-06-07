import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/toggle/CheckboxMarker/CheckboxMarker');

class CheckboxMarker extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _value1: boolean = null;
    protected _value2: boolean = true;
    protected _value3: boolean = false;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default CheckboxMarker;
