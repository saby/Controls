import BaseControl = require('Core/Control');
import {date as formatDate} from 'Types/formatter';
import dateUtils = require('Controls/Utils/Date');
import 'css!theme?Controls/_dateLitePopup/DateLitePopup';
import itemMonthsTmpl = require('wml!Controls/_dateLitePopup/ItemMonths');
import MonthCaption = require('wml!Controls/_dateLitePopup/MonthCaption');
import itemFullTmpl = require('wml!Controls/_dateLitePopup/ItemFull');
import itemQuartersTmpl = require('wml!Controls/_dateLitePopup/ItemQuarters');
import {Date as WSDate} from "Types/entity";

const Component = BaseControl.extend({
    _template: itemMonthsTmpl,
    monthCaptionTemplate: MonthCaption,

    _position: null,
    _currentYear: null,
    _yearModel: null,

    _halfyearHovered: null,
    _quarterHovered: null,

    _formatDate: formatDate,

    _beforeMount: function (options) {
        this._position = options._position;
        this._template = this._getItemTmplByType(options);
        this._currentYear =  options.currentYear;
        this._yearModel = this._getYearModel(this._currentYear, options.dateConstructor);
    },

    _getItemTmplByType: function (options) {
        if (options.chooseHalfyears && options.chooseQuarters && options.chooseMonths) {
            return itemFullTmpl;
        } else if (options.chooseMonths) {
            return itemMonthsTmpl;
        } else if (options.chooseQuarters) {
            return itemQuartersTmpl;
        }
    },

    _getYearModel: function (year, dateConstructor) {
        const numerals = ['I', 'II', 'III', 'IV'];
        const halfYearsList = [];

        for (let halfYear = 0; halfYear < 2; halfYear++) {
            const quartersList = [];
            for (let i = 0; i < 2; i++) {
                const monthsList = [];
                const quarter = halfYear * 2 + i;
                const quarterMonth = quarter * 3;
                for (let j = 0; j < 3; j++) {
                    const month = quarterMonth + j;
                    monthsList.push({
                            name: new dateConstructor(year, month, 1),
                            tooltip: formatDate(new Date(year, month, 1), formatDate.FULL_MONTH)
                        });
                }
                quartersList.push({
                        name: numerals[quarter],
                        number: quarter,
                        fullName: formatDate(new Date(year, quarterMonth, 1), 'QQQQr'),
                        tooltip: formatDate(new Date(year, quarterMonth, 1), formatDate.FULL_QUATER),
                        months: monthsList
                    });
            }
            halfYearsList.push({
                    name: numerals[halfYear],
                    number: halfYear,
                    tooltip: formatDate(new Date(year, halfYear * 6, 1), formatDate.FULL_HALF_YEAR),
                    quarters: quartersList
                });
        }
        return halfYearsList;
    },

    _onQuarterMouseEnter: function (event, quarter) {
        this._quarterHovered = quarter;
        this._forceUpdate();
    },

    _onQuarterMouseLeave: function () {
        this._quarterHovered = null;
        this._forceUpdate();
    },

    _onHalfYearMouseEnter: function (event, halfyear) {
        this._halfyearHovered = halfyear;
        this._forceUpdate();
    },

    _onHalfYearMouseLeave: function () {
        this._halfyearHovered = null;
        this._forceUpdate();
    },

    _onYearMouseEnter: function (event, year) {
        this._yearHovered = year;
    },

    _onYearMouseLeave: function () {
        this._yearHovered = null;
    },

    _onHeaderClick: function () {
        this._notify('close', [], {bubbling: true});
    },

    _onYearClick: function (event, year) {
        if (this._options.chooseYears) {
            this._notify(
                'sendResult',
                [new this._options.dateConstructor(year, 0, 1), new WSDate(year, 11, 31)],
                {bubbling: true});
        }
    },

    _onHalfYearClick: function (event, halfYear, year) {
        let start = new this._options.dateConstructor(year, halfYear * 6, 1),
            end = new this._options.dateConstructor(year, (halfYear + 1) * 6, 0);
        this._notify('sendResult', [start, end], {bubbling: true});
    },

    _onQuarterClick: function (event, quarter, year) {
        let start = new this._options.dateConstructor(year, quarter * 3, 1),
            end = new this._options.dateConstructor(year, (quarter + 1) * 3, 0);
        this._notify('sendResult', [start, end], {bubbling: true});
    },

    _onMonthClick: function (event, month) {
        this._notify('sendResult', [month, dateUtils.getEndOfMonth(month)], {bubbling: true});
    }
});

Component.getDefaultOptions = function () {
    return {
        dateConstructor: WSDate
    };
};

export = Component;
