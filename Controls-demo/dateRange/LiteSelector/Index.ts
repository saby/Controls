import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/dateRange/LiteSelector/LiteSelector");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/dateRange/LiteSelector/LiteSelector'];
}

export default DemoControl;
