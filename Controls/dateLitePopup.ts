import rk = require('i18n!Controls');
import BaseControl = require('Core/Control');
import coreMerge = require('Core/core-merge');
import {Date as WSDate} from 'Types/entity';
import getCurrentPeriod = require('Core/helpers/Date/getCurrentPeriod');
import IPeriodSimpleDialog from './_dateLitePopup/IDateLitePopup';
import dateUtils = require('Controls/Utils/Date');
import componentTmpl = require('wml!Controls/_dateLitePopup/DateLitePopup');
import listTmpl = require('wml!Controls/_dateLitePopup/List');
import ItemWrapper = require('wml!Controls/_dateLitePopup/ItemWrapper');
import 'css!theme?Controls/_dateLitePopup/DateLitePopup';
import {date as formatDate} from 'Types/formatter';
import {Logger} from 'UI/Utils';

/**
 * Контрол выбора даты или периода.
 *
 * @class Controls/dateLitePopup
 * @extends Core/Control
 * @mixes Controls/dateLitePopup/IDateLitePopup
 * @mixes Controls/_interface/IDisplayedRanges
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Date/PeriodLiteDialog
 *
 */

/*
 * Control for date or period selection.
 *
 * @class Controls/dateLitePopup
 * @extends Core/Control
 * @mixes Controls/dateLitePopup/IDateLitePopup
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Date/PeriodLiteDialog
 *
 */

var _private = {

    _getYearListPosition: function (options, dateConstructor) {

        let start = options.startValue,
            currentDate = new dateConstructor(),
            startValueYear = start ? start.getFullYear() : null;

        if (!startValueYear) {
            return currentDate;
        }

        if (startValueYear >= currentDate.getFullYear()) {
            return start;
        } else if (currentDate.getFullYear() - startValueYear >= 5) {
            return new dateConstructor(startValueYear + 4, 0);
        } else {
            return currentDate;
        }
    }
};

var Component = BaseControl.extend({
    _template: componentTmpl,
    _defaultListTemplate: listTmpl,

    _position: null,

    iconsChecked: null,

    _yearHovered: null,

    _range: null,

    // constructor: function() {
    //    this._dayFormatter = this._dayFormatter.bind(this);
    //    Component.superclass.constructor.apply(this, arguments);
    // },

    _beforeMount: function (options) {

        this._emptyCaption = options.emptyCaption;
        if (!this._emptyCaption) {
            if (options.chooseMonths && (options.chooseQuarters || options.chooseHalfyears)) {
                this._emptyCaption = rk('Период не указан');
            } else {
                this._emptyCaption = rk('Не указан');
            }
        }

        this._caption = options.captionFormatter(options.startValue, options.endValue, options.emptyCaption);

        if (options.chooseQuarters || options.chooseMonths || options.chooseHalfyears) {
            this._position = options.year || options.startValue || (new options.dateConstructor());
        } else {
            this._position = _private._getYearListPosition(options, options.dateConstructor);
        }
        if (options.range) {
            Logger.error('dateLitePopup: ' + rk('You should use displayedRanges option instead of range option.'), this);
        }
        this._displayedRanges = options.displayedRanges || options.range;

        this.iconsChecked = options.checkedStart || options.checkedEnd;
    },

    _beforeUpdate: function (options) {
        // this._caption = _private._getCaption(options);
    },

    /**
     * Sets the current year
     * @param year
     */
    setYear: function (year) {
        this._position = new this._options.dateConstructor(year, 0, 1);
        this._notify('yearChanged', [year]);
    },

    _dateToDataString(date) {
        return formatDate(date, 'YYYY-MM-DD');
    },

    _onYearMouseEnter: function (event, year) {
        if (this._options.chooseYears) {
            this._yearHovered = year;
        }
    },

    _onYearMouseLeave: function () {
        this._yearHovered = null;
    },

    _onPrevYearBtnClick: function () {
        var year = this._position.getFullYear() - 1;
        this.setYear(year);
    },

    _onNextYearBtnClick: function () {
        var year = this._position.getFullYear() + 1;
        this.setYear(year);
    },

    _onHomeClick: function () {
        var periodType = 'year', period;
        if (this._options.chooseMonths) {
            periodType = 'month';
        } else if (this._options.chooseQuarters) {
            periodType = 'quarter';
        } else if (this._options.chooseHalfyears) {
            periodType = 'halfyear';
        }
        period = getCurrentPeriod(periodType);
        this.setYear((new Date()).getFullYear());
        this._notify(
            'sendResult',
            [new this._options.dateConstructor(period[0]), new this._options.dateConstructor(period[1])],
            {bubbling: true});
    },

    _onHeaderClick: function () {
        this._notify('close', [], {bubbling: true});
    },

    _onYearClick: function (event, year) {
        if (this._options.chooseYears) {
            this._notify(
                'sendResult',
                [new this._options.dateConstructor(year, 0, 1), new this._options.dateConstructor(year, 11, 31)],
                {bubbling: true});
        }
    },

    _getWidthCssClass: function () {
        if (this._options.chooseHalfyears) {
            return 'controls-PeriodLiteDialog__width-big';
        }
        if (this._options.chooseQuarters || this._options.chooseMonths) {
            return 'controls-PeriodLiteDialog__width-medium';
        }
        return '';
    },

    _getListCssClasses: function () {
        if (this._options.chooseHalfyears) {
            return 'controls-PeriodLiteDialog-item controls-PeriodLiteDialog__fullYear-list';
        }
        if (this._options.chooseMonths) {
            return 'controls-PeriodLiteDialog__vLayout controls-PeriodLiteDialog__text-align-center ' +
                'controls-PeriodLiteDialog__month-list';
        }
        if (this._options.chooseQuarters) {
            return 'controls-PeriodLiteDialog__vLayout controls-PeriodLiteDialog__text-align-center ' +
                ' controls-PeriodLiteDialog__quarter-list';
        }
        return '';
    },

    _getYearWrapperCssClasses: function () {
        if (this._options.chooseHalfyears) {
            return 'controls-PeriodLiteDialog__yearWrapper__fullYear';
        }
        if (this._options.chooseQuarters || this._options.chooseMonths) {
            return 'controls-PeriodLiteDialog__yearWrapper__quarters-months';
        }
        return '';
    },

    _getYearCssClasses: function () {
        var css = [];
        if (this._options.chooseYears) {
            css.push('controls-PeriodLiteDialog__year-clickable');
        }
        if (this._options.chooseMonths && this._options.chooseQuarters && this._options.chooseHalfyears) {
            css.push('controls-PeriodLiteDialog__year-medium');
        } else if (this._options.chooseMonths) {
            css.push('controls-PeriodLiteDialog__year-center-lite');
        }
        return css.join(' ');
    },

    _getYearItemCssClasses: function (year) {
        var css = [],
            date = this._options.startValue;
        if (!dateUtils.isValidDate(date) || (year !== date.getFullYear())) {
            css.push('controls-PeriodLiteDialog__vLayoutItem-clickable');
        }
        if (dateUtils.isValidDate(date) && (year === date.getFullYear())) {
            css.push('controls-PeriodLiteDialog__selectedYear');
        }
        return css.join(' ');
    }

});

Component._private = _private;

Component.EMPTY_CAPTIONS = IPeriodSimpleDialog.EMPTY_CAPTIONS;

Component.getDefaultOptions = function () {
    return {
        ...IPeriodSimpleDialog.getDefaultOptions(),
        itemTemplate: ItemWrapper,
        dateConstructor: WSDate
    };
};

Component.getOptionTypes = function () {
    return coreMerge({}, IPeriodSimpleDialog.getOptionTypes());
};

export = Component;
