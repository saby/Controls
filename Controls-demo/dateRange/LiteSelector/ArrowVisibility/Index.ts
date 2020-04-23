import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/dateRange/LiteSelector/ArrowVisibility/ArrowVisibility");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Contorls-demo/dateRange/LiteSelector/LiteSelector'];

    private _startValue: Date = new Date(2019, 1);
    private _endValue: Date = new Date(2019, 2, 0);
}

export default DemoControl;
