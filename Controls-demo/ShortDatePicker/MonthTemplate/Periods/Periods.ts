import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/ShortDatePicker/Periods/Periods");
import 'css!Controls-demo/Controls-demo';

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    private _periods: [Date[]] = [
        [new Date(2017, 0), new Date(2021, 0)]
    ];
}

export default DemoControl;
