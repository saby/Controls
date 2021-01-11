import {Control as BaseControl} from 'UI/Base';
import coreMerge = require('Core/core-merge');
import monthTmpl = require('wml!Controls/_calendar/Month/Month');
import IMonth from 'Controls/_calendar/interfaces/IMonth';
import MonthViewModel from 'Controls/_calendar/Month/Model';

/**
 * Календарь, отображающий 1 месяц.
 * Предназначен для задания даты или диапазона дат в рамках одного месяца путём выбора периода с помощью мыши.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_calendar.less переменные тем оформления}
 *
 * @class Controls/_calendar/Month
 * @extends UI/Base:Control
 * @mixes Controls/_calendar/interfaces/IMonth
 * @mixes Controls/_interface/IDayTemplate
 * @mixes Controls/_dateRange/interfaces/IRangeSelectable
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Date/Month
 *
 */

var Component = BaseControl.extend({
    _template: monthTmpl,
    _monthViewModel: MonthViewModel,

    _onRangeChangedHandler: function (event, startValue, endValue) {
        this._notify('startValueChanged', [startValue]);
        this._notify('endValueChanged', [endValue]);
    },

    _itemClickHandler(event, item) {
        this._notify('itemClick', [item]);
    }

});

Component.getDefaultOptions = function () {
    return coreMerge({}, IMonth.getDefaultOptions());
};

Component.getOptionTypes = function () {
    return coreMerge({}, IMonth.getOptionTypes());
};

export default Component;
