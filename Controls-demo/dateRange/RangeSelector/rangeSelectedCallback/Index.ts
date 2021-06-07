import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dateRange/RangeSelector/rangeSelectedCallback/Template');

export default class RangeSelectedCallback extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];
    private _startValue: Date = new Date(2018, 0, 1);
    private _endValue: Date = new Date(2018, 0, 4);
    private _startValue1: Date = new Date(2018, 0, 2);
    private _endValue1: Date = new Date(2018, 0, 11);

    rangeSelectedCallback(startValue: Date, endValue: Date): Date[] {
        return [new Date(startValue.getFullYear(), startValue.getMonth(), startValue.getDate() - 2),
            new Date(endValue.getFullYear(), endValue.getMonth(), endValue.getDate() + 1)];
    }

    rangeSelectedCallback1(startValue: Date, endValue: Date): Date[] {
        return [new Date(startValue.getFullYear(), startValue.getMonth(), startValue.getDate() + 1),
            new Date(endValue.getFullYear(), endValue.getMonth(), endValue.getDate() + 4)];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
