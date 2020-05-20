import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {date as formatDate} from 'Types/formatter';
import template = require('wml!Controls-demo/Calendar/MonthList/Position/ViewModeMonth/ViewModeMonth');

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _position: Date = new Date(2018, 11, 1);

    protected _getHeader(date: Date): string {
        return date ? formatDate(date, formatDate.FULL_MONTH) : '';
    }

    protected _scrollToDate(event: SyntheticEvent<MouseEvent>, year: number, month: number, date: number): void {
        this._position = new Date(year, month, date);
    }

    protected _formatMonth(date: Date): string {
        return date ? formatDate(date, formatDate.FULL_MONTH) : '';
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Calendar/MonthList/resources/MonthListDemo'];
}
export default DemoControl;
