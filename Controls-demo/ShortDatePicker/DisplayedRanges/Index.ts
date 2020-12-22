import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/ShortDatePicker/DisplayedRanges/DisplayedRanges");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _startValue: Date = new Date(2020, 0);
    protected _endValue: Date = new Date(2020, 11, 31);

    protected _displayedRanges: Date[][] = [
        [new Date(2018, 1), new Date(2020, 1)],
        [new Date(2022, 0), null]
    ];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default DemoControl;
