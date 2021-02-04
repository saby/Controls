import {Control as BaseControl} from 'UI/Base';
import coreMerge = require('Core/core-merge');
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import IMonth from './interfaces/IMonth';
import Slider from './MonthSlider/Slider';
import {Utils as calendarUtils} from 'Controls/dateRange';
import {Base as DateUtil} from 'Controls/dateUtils';
import monthTmpl = require('wml!Controls/_calendar/MonthSlider/MonthSlider');

var _private = {
    _setMonth: function (self, month, silent, dateConstructor) {
        if (DateUtil.isDatesEqual(month, self._month)) {
            return;
        }
        self._animation = month < self._month ? Slider.ANIMATIONS.slideRight : Slider.ANIMATIONS.slideLeft;
        self._month = month;
        self._isHomeVisible = !DateUtil.isMonthsEqual(month, new dateConstructor());
        if (!silent) {
            self._notify('monthChanged', [month]);
        }
    }
};

/**
 * Календарь, который отображает 1 месяц и позволяет переключаться на следующий и предыдущий месяцы с помощью кнопок.
 * Предназначен для выбора даты или периода в пределах нескольких месяцев или лет.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_calendar.less переменные тем оформления}
 *
 * @class Controls/_calendar/MonthSlider
 * @extends UI/Base:Control
 * @mixes Controls/_calendar/interfaces/IMonth
 * @mixes Controls/_dateRange/interfaces/IRangeSelectable
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 * @mixes Controls/_interface/IDayTemplate
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Calendar/MonthSlider/SelectionType/Index
 * @demo Controls-demo/Calendar/MonthSlider/ReadOnly/Index
 *
 */

/*
 * A calendar that displays 1 month and allows you to switch to the next and previous months using the buttons.
 * Designed to select a date or period within a few months or years.
 *
 * @class Controls/_calendar/MonthSlider
 * @extends UI/Base:Control
 * @mixes Controls/_calendar/interface/IMonth
 * @mixes Controls/_dateRange/interfaces/IRangeSelectable
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Calendar/MonthSlider
 *
 */

var Component = BaseControl.extend({
    _template: monthTmpl,
    _month: null,
    _animation: Slider.ANIMATIONS.slideLeft,
    _isHomeVisible: true,
    _days: [],
    _formatDate: formatDate,

    _beforeMount: function (options) {
        this._days = calendarUtils.getWeekdaysCaptions();
        _private._setMonth(this, options.month, true, options.dateConstructor);
    },

    _beforeUpdate: function (options) {
        this._days = calendarUtils.getWeekdaysCaptions();
        _private._setMonth(this, options.month, true, options.dateConstructor);
    },

    _wheelHandler(event) {
        event.preventDefault();
        if (event.nativeEvent.deltaY < 0) {
            this._slideMonth(null, 1);
        }
        else if (event.nativeEvent.deltaY > 0) {
            this._slideMonth(null, -1);
        }
    },

    _slideMonth: function (event, delta) {
        _private._setMonth(this,
            new this._options.dateConstructor(this._month.getFullYear(), this._month.getMonth() + delta, 1), false, this._options.dateConstructor);
    },

    _setCurrentMonth: function () {
        _private._setMonth(this, DateUtil.normalizeDate(new this._options.dateConstructor()), false, this._options.dateConstructor);
    },

    _itemClickHandler: function (event, item) {
        this._notify('itemClick', [item]);
    },

    _onStartValueChanged: function (event, value) {
        this._notify('startValueChanged', [value]);
    },

    _onEndValueChanged: function (event, value) {
        this._notify('endValueChanged', [value]);
    }
});

Component.getDefaultOptions = function () {
    return {
        ...IMonth.getDefaultOptions(),
        dateConstructor: WSDate
    };
};

Object.defineProperty(Component, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Component.getDefaultOptions();
   }
});

Component.getOptionTypes = function () {
    return coreMerge({}, IMonth.getOptionTypes());
};

Component._theme = ['Controls/calendar'];

Component._private = _private;

export default Component;
export {default as Base} from './MonthSlider/Slider';
