import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/dateRange/LiteSelector/DisplayedRanges/DisplayedRanges");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _displayedRanges = [[new Date(2018, 0), new Date(2022, 0)], [new Date(2025, 0), new Date(2030, 0)]];
    protected _displayedRanges1 = [[new Date(2020, 0), new Date(2021, 1)]];
    protected _startValue1: Date = new Date(2019, 1);
    protected _endValue1: Date = new Date(2019, 2, 0);
    protected _startValue2: Date = new Date(2020, 0);
    protected _endValue2: Date = new Date(2021, 0, 0);

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/dateRange/LiteSelector/LiteSelector'];
}

export default DemoControl;
