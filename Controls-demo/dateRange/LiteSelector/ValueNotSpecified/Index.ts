import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/dateRange/LiteSelector/ValueNotSpecified/ValueNotSpecified");
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/dateRange/LiteSelector/LiteSelector';

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    private _startValue: Date = new Date(2019, 1);
    private _endValue: Date = new Date(2019, 2, 0);
}

export default DemoControl;
