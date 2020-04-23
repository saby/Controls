import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/Calendar/MonthList/DisplayedRanges/DisplayedRanges");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    protected _displayedRanges  = [[new Date(2017, 0), new Date(2019, 0)]];

    protected _position: Date = new Date(2018, 0);
}

export default DemoControl;
