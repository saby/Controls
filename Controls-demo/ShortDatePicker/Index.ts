import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/ShortDatePicker/ShortDatePicker");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default DemoControl;
