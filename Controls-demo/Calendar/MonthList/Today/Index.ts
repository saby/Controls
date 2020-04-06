import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {date as formatDate} from 'Types/formatter';
import template = require('wml!Controls-demo/Calendar/MonthList/Today/Template');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Calendar/MonthList/resources/MonthListDemo';

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _position: Date = new Date(2019, 0, 1);
    protected _date: Date = new Date(2019, 0, 5);

    protected _formatMonth(date: Date): string {
        return date ? formatDate(date, formatDate.FULL_MONTH) : '';
    }

    static _theme: string[] = ['Controls/Classes'];
}
export default DemoControl;
