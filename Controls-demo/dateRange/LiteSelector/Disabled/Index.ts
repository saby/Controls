import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/dateRange/LiteSelector/Disabled/Disabled");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    private _startValue: Date = new Date(2019, 1);
    private _endValue: Date = new Date(2019, 2, 0);

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Contorls-demo/dateRange/LiteSelector/LiteSelector'];
}

export default DemoControl;
