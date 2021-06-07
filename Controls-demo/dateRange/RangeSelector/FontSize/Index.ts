import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dateRange/RangeSelector/FontSize/Template');

export default class RangeSelector extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _startValue: Date = new Date(2018, 0, 1);
    protected _endValue: Date = new Date(2018, 5, 30);

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}