import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {date as formatDate} from 'Types/formatter';
import template = require('wml!Controls-demo/Calendar/MonthList/Today/Template');

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _position: Date = new Date(2019, 0, 1);
    protected _date: Date = new Date(2019, 0, 5);

    protected _formatMonth(date: Date): string {
        return date ? formatDate(date, formatDate.FULL_MONTH) : '';
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Calendar/MonthList/resources/MonthListDemo'];
}
export default DemoControl;
