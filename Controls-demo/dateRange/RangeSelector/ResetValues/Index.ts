import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dateRange/RangeSelector/ResetValues/ResetValues');

export default class RangeSelectedCallback extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _startValue: Date = new Date(2018, 0, 1);
    protected _endValue: Date = new Date(2018, 5, 30);
    protected _resetStartValue: Date = new Date(2017, 0, 1);
    protected _resetEndValue: Date = new Date(2017, 2, 16);

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
