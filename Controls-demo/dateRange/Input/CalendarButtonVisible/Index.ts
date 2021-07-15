import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/dateRange/Input/CalendarButtonVisible/Index';
import 'css!Controls-demo/Controls-demo';

export default class CalendarButtonVisible extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _startDate: Date = new Date(2017, 0, 1, 12, 15, 30, 123);
    protected _endDate: Date = new Date(2017, 0, 2, 12, 15, 30, 123);
}
