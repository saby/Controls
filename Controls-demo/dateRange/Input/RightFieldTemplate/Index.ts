import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/dateRange/Input/RightFieldTemplate/RightFieldTemplate');

class Range extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _startDate: Date = new Date(2021, 1, 1);
    protected _endDate: Date = new Date(2021, 1, 29);

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Range;
