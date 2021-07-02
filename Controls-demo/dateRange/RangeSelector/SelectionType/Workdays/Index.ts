import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dateRange/RangeSelector/SelectionType/Workdays/Workdays');

export default class Workdays extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _startValue: Date = new Date(2021, 0, 4);
    protected _endValue: Date = new Date(2021, 0, 8);
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
