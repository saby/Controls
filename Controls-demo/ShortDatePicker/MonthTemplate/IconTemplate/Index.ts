import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/ShortDatePicker/MonthTemplate/IconTemplate/IconTemplate");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _startValue: Date = new Date(2020, 0);
    protected _endValue: Date = new Date(2020, 11, 31);
    protected _periods: [Date[]] = [
        [new Date(2017, 0), new Date(2021, 0)]
    ];

    protected _getState = (value: Date): boolean => {
        return value.getMonth() % 2 === 0;
    }
}

export default DemoControl;
