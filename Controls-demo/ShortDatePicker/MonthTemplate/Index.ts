import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/ShortDatePicker/MonthTemplate/MonthTemplate");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _startValue: Date = new Date(2020, 0);
    protected _endValue: Date = new Date(2020, 11, 31);
}

export default DemoControl;
