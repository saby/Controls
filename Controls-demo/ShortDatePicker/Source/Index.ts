import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import DateLitePopupSource from "./DateLitePopupSource";
import template = require("wml!Controls-demo/ShortDatePicker/Source/Source");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _startValue: Date = new Date(2020, 0);
    protected _endValue: Date = new Date(2020, 11, 31);

    private _source: DateLitePopupSource = new DateLitePopupSource();

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default DemoControl;
