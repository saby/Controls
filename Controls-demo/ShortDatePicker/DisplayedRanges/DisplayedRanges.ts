import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/ShortDatePicker/DisplayedRanges/DisplayedRanges");
import 'css!Controls-demo/Controls-demo';

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    private _startValue: Date = new Date(2020, 1);
    private _displayedRanges: Date[][] = [
        [new Date(2018, 1), new Date(2020, 1)],
        [new Date(2022, 0), null]
    ];
}

export default DemoControl;
