import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as coreMerge from 'Core/core-merge';
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import IMonth from './interfaces/IMonth';
import Slider from './MonthSlider/Slider';
import {Utils as calendarUtils} from 'Controls/dateRange';
import {Base as DateUtil} from 'Controls/dateUtils';
import monthTmpl = require('wml!Controls/_calendar/MonthSlider/MonthSlider');
import 'css!Controls/calendar';

/**
 * Календарь, который отображает 1 месяц и позволяет переключаться на следующий и предыдущий месяцы с помощью кнопок.
 * Предназначен для выбора даты или периода в пределах нескольких месяцев или лет.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/6156a9009ee88d96bf73c8b1200e197f9db1c3c8/Controls-default-theme/variables/_calendar.less переменные тем оформления}
 *
 * @class Controls/_calendar/MonthSlider
 * @extends UI/Base:Control
 * @mixes Controls/calendar:IMonth
 * @mixes Controls/dateRange:IRangeSelectable
 * @mixes Controls/dateRange:IDateRangeSelectable
 * @mixes Controls/dateRange:IDayTemplate
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Calendar/MonthSlider/SelectionType/Index
 * @demo Controls-demo/Calendar/MonthSlider/ReadOnly/Index
 *
 */
export {default as Base} from './MonthSlider/Slider';

export default class MonthSlider extends Control<IControlOptions> {
    _template: TemplateFunction = monthTmpl;
    _month: Date | string;
    _animation: object = Slider.ANIMATIONS.slideLeft;
    _isHomeVisible: boolean = true;
    _days: object[] = [];
    _formatDate: Date = formatDate;

    protected _beforeMount(options) {
        this._days = calendarUtils.getWeekdaysCaptions();
        this._setMonth(options.month, true, options.dateConstructor);
    }

    protected _beforeUpdate(options) {
        this._days = calendarUtils.getWeekdaysCaptions();
        this._setMonth(options.month, true, options.dateConstructor);
    }

    protected _wheelHandler(event) {
        event.preventDefault();
        if (event.nativeEvent.deltaY < 0) {
            this._slideMonth(null, 1);
        } else if (event.nativeEvent.deltaY > 0) {
            this._slideMonth(null, -1);
        }
    }

    protected _itemClickHandler(event, item): void {
        this._notify('itemClick', [item]);
    }

    protected _onStartValueChanged(event, value): void {
        this._notify('startValueChanged', [value]);
    }

    protected _onEndValueChanged(event, value): void {
        this._notify('endValueChanged', [value]);
    }

    private _slideMonth(event, delta): void {
        this._setMonth(new this._options.dateConstructor(this._month.getFullYear(),
                this._month.getMonth() + delta, 1), false, this._options.dateConstructor);
    }

    protected _setCurrentMonth(): void {
        this._setMonth(DateUtil.normalizeDate(new this._options.dateConstructor()),
            false, this._options.dateConstructor);
    }

    private _setMonth(month, silent, dateConstructor): void {
        if (DateUtil.isDatesEqual(month, this._month)) {
            return;
        }
        this._animation = month < this._month ? Slider.ANIMATIONS.slideRight : Slider.ANIMATIONS.slideLeft;
        this._month = month;
        this._isHomeVisible = !DateUtil.isMonthsEqual(month, new dateConstructor());
        if (!silent) {
            this._notify('monthChanged', [month]);
        }
    }

    static getOptionTypes(): object {
        return coreMerge(IMonth.getOptionTypes());
    }

    static getDefaultOptions(): object {
        return {
            ...IMonth.getDefaultOptions(),
            dateConstructor: WSDate
        };
    }
}
Object.defineProperty(MonthSlider, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return MonthSlider.getDefaultOptions();
   }
});
