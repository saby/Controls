import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/dateRange/ReadOnly/Template");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _startValue1: Date = new Date(2020, 0);
    protected _endValue1: Date = new Date(2021, 0, 0);

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default DemoControl;
