import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/ShortDatePicker/DisplayedRanges/DisplayedRanges");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    private _startValue: Date = new Date(2020, 1);
    private _displayedRanges: Date[][] = [
        [new Date(2018, 1), new Date(2020, 1)],
        [new Date(2022, 0), null]
    ];

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default DemoControl;
