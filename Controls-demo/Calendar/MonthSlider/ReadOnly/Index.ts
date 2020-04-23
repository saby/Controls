import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/Calendar/MonthSlider/ReadOnly/ReadOnly");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    private _month: Date = new Date(2017, 0, 1);
    static _theme: string[] = ['Controls/Classes'];
}

export default DemoControl;
