import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/dateRange/LiteSelector/LiteSelector");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _startValue: Date = new Date(2020, 0);
    protected _endValue: Date = new Date(2021, 0);

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/dateRange/LiteSelector/LiteSelector'];
}

export default DemoControl;
