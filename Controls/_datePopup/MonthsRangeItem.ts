import BaseControl = require('Core/Control');
import coreMerge = require('Core/core-merge');
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import isEmpty = require('Core/helpers/Object/isEmpty');
import EventProxyMixin from './Mixin/EventProxy';
import {MonthModel as modelViewModel} from 'Controls/calendar';
import {IDateRangeSelectable, rangeSelection as rangeSelectionUtils} from 'Controls/dateRange';
import dateUtils = require('Controls/Utils/Date');
import componentTmpl = require('wml!Controls/_datePopup/MonthsRangeItem');

/**
 * Item for the period selection component of multiple months.
 *
 * @class Controls/_datePopup/MonthsRangeItem
 * @extends Core/Control
 * @control
 * @author Красильников А.С.
 * @private
 */

var _private = {},
    SELECTION_VEIW_TYPES = {
        days: 'days',
        months: 'months'
    };

const MONTHS_RANGE_CSS_CLASS_PREFIX = 'controls-PeriodDialog-MonthsRange__';

var Component = BaseControl.extend([EventProxyMixin], {
    _template: componentTmpl,
    _monthViewModel: modelViewModel,

    _SELECTION_VEIW_TYPES: SELECTION_VEIW_TYPES,

    _FULL_HALF_YEAR: formatDate.FULL_HALF_YEAR,
    _FULL_QUATER: formatDate.FULL_QUATER,

    _yearStructure: [{
        name: 'I',
        startMonth: 0,
        quarters: [{
            name: 'I', startMonth: 0
        }, {
            name: 'II', startMonth: 3
        }]
    }, {
        name: 'II',
        startMonth: 6,
        quarters: [{
            name: 'III', startMonth: 6
        }, {
            name: 'IV', startMonth: 9
        }]
    }],

    _formatDate: formatDate,

    _quarterSelectionEnabled: true,
    _monthsSelectionEnabled: true,
    _halfyearSelectionEnabled: true,
    _yearSelectionEnabled: true,

    _quarterHovered: null,
    _halfYearHovered: null,

    _selectionViewType: null,

    _monthClickable: true,

    _months: null,

    // constructor: function() {
    //    this._dayFormatter = this._dayFormatter.bind(this);
    //    Component.superclass.constructor.apply(this, arguments);
    // },

    _beforeMount: function (options) {
        const year = options.date.getFullYear();
        this._selectionViewType = options.selectionViewType;
        if (options.readOnly || options.selectionType === IDateRangeSelectable.SELECTION_TYPES.single ||
                options.selectionType === IDateRangeSelectable.SELECTION_TYPES.disable) {
            this._monthsSelectionEnabled = false;
            this._quarterSelectionEnabled = false;
            this._halfyearSelectionEnabled = false;
            this._yearSelectionEnabled = false;
        } else if (options.quantum && !isEmpty(options.quantum)) {
            this._monthsSelectionEnabled = 'months' in options.quantum;
            this._quarterSelectionEnabled = 'quarters' in options.quantum;
            this._halfyearSelectionEnabled = 'halfyears' in options.quantum;
            this._yearSelectionEnabled = 'years' in options.quantum;
        }
        this._months = [];
        for (let i = 0; i < 12; i++) {
            this._months.push(new WSDate(year, i, 1));
        }
    },

    _beforeUpdate: function (options) {
        if (this._options.selectionViewType !== options.selectionViewType) {
            this._selectionViewType = options.selectionViewType;
        }
    },

    _onQuarterClick: function (e, date) {
        if (this._quarterSelectionEnabled) {
            this._selectionViewType = SELECTION_VEIW_TYPES.months;
            this._notify('selectionViewTypeChanged', [this._selectionViewType]);
            this._notify('fixedPeriodClick', [date, dateUtils.getEndOfQuarter(date)]);
        }
    },

    _onQuarterMouseEnter: function (e, index) {
        if (this._quarterSelectionEnabled) {
            this._quarterHovered = index;
        }
    },

    _onQuarterMouseLeave: function () {
        if (this._quarterSelectionEnabled) {
            this._quarterHovered = null;
        }
    },

    _onHalfYearClick: function (e, date) {
        if (this._halfyearSelectionEnabled) {
            this._selectionViewType = SELECTION_VEIW_TYPES.months;
            this._notify('selectionViewTypeChanged', [this._selectionViewType]);
            this._notify('fixedPeriodClick', [date, dateUtils.getEndOfHalfyear(date)]);
        }
    },

    _onHalfYearMouseEnter: function (e, index) {
        if (this._halfyearSelectionEnabled) {
            this._halfYearHovered = index;
        }
    },

    _onHalfYearMouseLeave: function () {
        if (this._halfyearSelectionEnabled) {
            this._halfYearHovered = null;
        }
    },

    _onMonthTitleClick: function (e, date) {
        if (this._monthsSelectionEnabled && !this._options.selectionProcessing && this._options.monthClickable) {
            this._selectionViewType = SELECTION_VEIW_TYPES.months;
            this._notify('selectionViewTypeChanged', [this._selectionViewType]);

            this._notify('itemClick', [date]);
        }
    },

    _onMonthTitleMouseEnter: function (e, date) {
        if (!this._options.selectionProcessing) {
            this._notify('itemMouseEnter', [date]);
        }
    },

    _onMonthTitleMouseLeave: function (e, date) {
        if (!this._options.selectionProcessing && this._options.monthClickable) {
            this._notify('itemMouseLeave', [date]);
        }
    },

    _onMonthBodyClick: function (e, date) {
        if (!this._options.selectionProcessing && this._options.monthClickable) {
            this._notify('monthClick', [date]);
        }
    },

    _onMonthClick: function (e, date) {
        if (this._options.selectionProcessing || !this._options.monthClickable) {
            this._selectionViewType = SELECTION_VEIW_TYPES.months;
            this._notify('selectionViewTypeChanged', [this._selectionViewType]);
            this._notify('itemClick', [date]);
        }
    },

    _onMonthMouseEnter: function (e, date) {
        if (this._options.selectionProcessing || !this._options.monthClickable) {
            this._notify('itemMouseEnter', [date]);
        }
    },

    _onMonthMouseLeave: function (e, date) {
        if (this._options.selectionProcessing || !this._options.monthClickable) {
            this._notify('itemMouseLeave', [date]);
        }
    },

    _prepareItemClass: function (itemValue) {
        var css = [],
            start = this._options.startValue,
            end = this._options.endValue;

        if (rangeSelectionUtils.isSelected(itemValue, start, end, this._options.selectionProcessing,
                this._options.selectionBaseValue, this._options.selectionHoveredValue) &&
            this._selectionViewType === SELECTION_VEIW_TYPES.months) {
            css.push('controls-PeriodDialog-MonthsRange__item-selected');
            css.push('controls-PeriodDialog-MonthsRange__item-selected_theme-' + this._options.theme);
        } else {
            css.push('controls-PeriodDialog-MonthsRange__item');
            css.push('controls-PeriodDialog-MonthsRange__item_theme-' + this._options.theme);
        }

        if (this._selectionViewType === SELECTION_VEIW_TYPES.months) {
            css.push(rangeSelectionUtils.prepareSelectionClass(
                itemValue,
                start,
                end,
                this._options.selectionProcessing,
                this._options.selectionBaseValue,
                this._options.selectionHoveredValue,
                this._options.hoveredStartValue,
                this._options.hoveredEndValue,
                {periodQuantum: rangeSelectionUtils.PERIOD_TYPE.month, theme: this._options.theme}
            ));
        } else if (this._options.selectionType !== IDateRangeSelectable.SELECTION_TYPES.disable) {
            const hoveredClass: string = rangeSelectionUtils.prepareHoveredClass(
                itemValue,
                this._options.hoveredStartValue,
                this._options.hoveredEndValue,
                {cssPrefix: MONTHS_RANGE_CSS_CLASS_PREFIX, theme: this._options.theme}
            );
            css.push(hoveredClass);
        }

        return css.join(' ');
    },

});

Component._private = _private;

Component.SELECTION_VEIW_TYPES = SELECTION_VEIW_TYPES;

Component.getDefaultOptions = function () {
    return coreMerge({
        selectionViewType: SELECTION_VEIW_TYPES.days
    }, {} /*IPeriodSimpleDialog.getDefaultOptions()*/);
};

// Component.getOptionTypes = function() {
//    return coreMerge({}, IPeriodSimpleDialog.getOptionTypes());
// };

export default Component;
