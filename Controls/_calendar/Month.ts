import BaseControl = require('Core/Control');
import coreMerge = require('Core/core-merge');
import monthTmpl = require('wml!Controls/_calendar/Month/Month');
import IMonth from 'Controls/_calendar/interfaces/IMonth';
import MonthViewModel from 'Controls/_calendar/Month/Model';

/**
 * Календарь, отображающий 1 месяц.
 * Предназначен для задания даты или диапазона дат в рамках одного месяца путём выбора периода с помощью мыши.
 *
 * @class Controls/_calendar/Month
 * @extends Core/Control
 * @mixes Controls/_calendar/interfaces/IMonth
 * @mixes Controls/_dateRange/interfaces/IRangeSelectable
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Date/Month
 *
 */

var Component = BaseControl.extend({
    _template: monthTmpl,
    _monthViewModel: MonthViewModel,

    // constructor: function() {
    //    this._dayFormatter = this._dayFormatter.bind(this);
    //    Component.superclass.constructor.apply(this, arguments);
    // },

    // _beforeMount: function(options) {
    //    this._view = options.view || 'Controls/Date/MonthView';
    // },

    _onRangeChangedHandler: function (event, startValue, endValue) {
        this._notify('startValueChanged', [startValue]);
        this._notify('endValueChanged', [endValue]);
    }

    // _startValueChangedHandler: function(event, value) {
    //    this._notify('startValueChanged', [value]);
    // },
    //
    // _endValueChangedHandler: function(event, value) {
    //    this._notify('endValueChanged', [value]);
    // }

});

Component.getDefaultOptions = function () {
    return coreMerge({}, IMonth.getDefaultOptions());
};

Component.getOptionTypes = function () {
    return coreMerge({}, IMonth.getOptionTypes());
};

export default Component;
