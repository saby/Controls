import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/Calendar/MonthSlider/SelectionType/SelectionType");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    private _month: Date = new Date(2017, 0, 1);
    private _month2: Date = this._month;
    private _month3: Date = this._month;
    private _month4: Date = this._month;
    static _theme: string[] = ['Controls/Classes'];
}

export default DemoControl;
