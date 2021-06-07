import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {date as formatDate} from 'Types/formatter';
import Source from 'Controls-demo/Calendar/MonthList/Source/Array/Source';
import template = require('wml!Controls-demo/Calendar/MonthList/Source/Array/Array');
import dayTemplate = require('wml!Controls-demo/Calendar/MonthList/resources/DayTemplate');

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _position: Date = new Date(2020, 0, 1);
    protected _source: Source = new Source();
    protected _dayTemplate: TemplateFunction = dayTemplate;

    protected _getHeader(date: Date): string {
        return date ? formatDate(date, formatDate.FULL_MONTH) : '';
    }

    protected _updateYear(): void {
         this._source.changeData();
         this._children.monthList.invalidatePeriod(
             new Date(2020, 0, 1),
             new Date(2020, 11, 1)
         );
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Calendar/MonthList/resources/MonthListDemo'];
}
export default DemoControl;
