import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {date as formatDate} from 'Types/formatter';
import Source from 'Controls-demo/Calendar/MonthList/resources/Source';
import template = require('wml!Controls-demo/Calendar/MonthList/Source/Source');
import dayTemplate = require('wml!Controls-demo/Calendar/MonthList/resources/DayTemplate');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Calendar/MonthList/resources/MonthListDemo';

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _position: Date = new Date(2018, 11, 1);
    protected _source: Source = new Source();
    protected _dayTemplate: TemplateFunction = dayTemplate;

    protected _getHeader(date: Date): string {
        return date ? formatDate(date, formatDate.FULL_MONTH) : '';
    }

    protected _updateYear(): void {
         this._source.changeData();
         this._children.monthList.invalidatePeriod(
             new Date(2019, 0, 1),
             new Date(2019, 11, 1)
         );
    }

    static _theme: string[] = ['Controls/Classes'];
}
export default DemoControl;
