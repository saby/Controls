import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as coreMerge from 'Core/core-merge';
import { default as MonthData, IMonthOptions} from 'Controls/_calendar/interfaces/IMonth';
import MonthViewModel from 'Controls/_calendar/Month/Model';
import monthTmpl = require('wml!Controls/_calendar/Month/Month');
import { SyntheticEvent } from 'Vdom/Vdom';

/**
 * Календарь, отображающий 1 месяц.
 * Предназначен для задания даты или диапазона дат в рамках одного месяца путём выбора периода с помощью мыши.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/6156a9009ee88d96bf73c8b1200e197f9db1c3c8/Controls-default-theme/variables/_calendar.less переменные тем оформления}
 *
 * @class Controls/_calendar/Month
 * @extends UI/Base:Control
 * @mixes Controls/calendar:IMonth
 * @mixes Controls/dateRange:IDayTemplate
 * @mixes Controls/dateRange:IRangeSelectable
 * @mixes Controls/dateRange:IDateRangeSelectable
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Date/Month
 *
 */

export interface IMonthControlOptions extends IControlOptions, IMonthOptions{
}

export default class Month extends Control<IMonthControlOptions> {
    _template: TemplateFunction = monthTmpl;
    _monthViewModel: MonthViewModel = MonthViewModel;

    protected _onRangeChangedHandler(event: SyntheticEvent<Event>, startValue: Date, endValue: Date): void {
        this._notify('startValueChanged', [startValue]);
        this._notify('endValueChanged', [endValue]);
    }

    protected _itemClickHandler(event: SyntheticEvent<Event>, item): void {
        this._notify('itemClick', [item]);
    }

    static getOptionTypes(): object {
        return coreMerge({}, MonthData.getOptionTypes());
    }

    static getDefaultOptions(): IControlOptions {
        return coreMerge({}, MonthData.getDefaultOptions());
    }
}

Object.defineProperty(Month, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Month.getDefaultOptions();
   }
});
