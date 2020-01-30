import BaseControl = require('Core/Control');
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import { SyntheticEvent } from 'Vdom/Vdom';
import EventProxy from './Mixin/EventProxy';
import {DateRangeModel, Utils as DateControlsUtils, dateRangeQuantum as quantumUtils} from 'Controls/dateRange';
import proxyModelEvents from 'Controls/Utils/proxyModelEvents';
import {MonthModel} from 'Controls/calendar';
import dateUtils = require('Controls/Utils/Date');
import datePopupUtils from './Utils';
import componentTmpl = require('wml!Controls/_datePopup/DateRange');
import 'wml!Controls/_datePopup/DateRangeItem';
import 'css!theme?Controls/datePopup';

/**
 * Component that allows you to select periods of multiple days.
 *
 * @class Controls/_datePopup/DateRange
 * @extends Core/Control
 * @control
 * @author Красильников А.С.
 * @private
 */

const _private = {
    updateView: function (self, options, dontUpdateScroll) {
        self._rangeModel.update(options);
        self._monthSelectionEnabled = !options.readOnly && (options.selectionType === 'range' ||
            (options.selectionType === 'quantum' && quantumUtils.monthSelectionEnabled(options.quantum) &&
                options.quantum.months[0] === 1));
        self._position = options.position;
    },

    notifyPositionChanged: function(self, date) {
        self._notify('positionChanged', [date]);
    },

    changeYear: function(self, position, direction) {
        let year: number = null;

        switch (direction) {
            case 'top':
                year = position.getFullYear() + 1;
                break;
            case 'bottom':
                year = position.getFullYear() - 1;
                break;
            default:
                break;
        }

        if (year !== null) {
            const yearDate = new Date(year, 0, 1);
            _private.notifyPositionChanged(self, yearDate);
            self._position = yearDate;
        }
    }
};

var Component = BaseControl.extend([EventProxy], {
    _template: componentTmpl,

    _monthViewModel: MonthModel,

    _weekdaysCaptions: DateControlsUtils.getWeekdaysCaptions(),
    _formatDate: formatDate,

    _isStickySupport: datePopupUtils.isStickySupport(),

    _monthSelectionEnabled: true,
    _selectionProcessing: false,

    // We store the position locally in the component, and don't use the value from options
    // to be able to quickly switch it on the mouse wheel.
    _position: Date,

    constructor: function (options) {
        Component.superclass.constructor.apply(this, arguments);
        this._rangeModel = new DateRangeModel({ dateConstructor: options.dateConstructor });
        proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged']);
    },

    _beforeMount: function (options) {
        _private.updateView(this, options);
    },

    _beforeUpdate: function (options) {
        _private.updateView(this, options);
    },

    _beforeUnmount: function () {
        this._rangeModel.destroy();
    },

    _monthCaptionClick: function(e: SyntheticEvent, yearDate: Date, month: number): void {
        let date;
        if (this._monthSelectionEnabled) {
            date = new this._options.dateConstructor(yearDate.getFullYear(), month);
            this._notify('fixedPeriodClick', [date, dateUtils.getEndOfMonth(date)]);
        }
    },

    /**
     * [текст, условие, если true, если false]
     * @param prefix
     * @param style
     * @param cfgArr
     * @private
     */
    _prepareCssClass: function (prefix, style, cfgArr) {
        var cssClass = prefix;
        if (style) {
            cssClass += '-' + style;
        }
        return cfgArr.reduce(function (previousValue, currentValue, index) {
            var valueToAdd = currentValue[0] ? currentValue[1] : currentValue[2];
            if (valueToAdd) {
                return previousValue + '-' + valueToAdd;
            }
            return previousValue;
        }, cssClass);
    },

    _onItemClick: function (e) {
        e.stopPropagation();
    },

    _wheelHandler: function(event) {
        const direction = event.nativeEvent.deltaY > 0 ? 'top' : 'bottom';
        _private.changeYear(this, this._position, direction);
        event.preventDefault();
    },

    _swipeHandler: function(event) {
        _private.changeYear(this, this._position, event.nativeEvent.direction);
        event.preventDefault();
    },

    _dateToString: function(date) {
        return datePopupUtils.dateToDataString(date);
    },

    _scrollToMonth: function(e, year, month) {
        _private.notifyPositionChanged(this, new this._options.dateConstructor(year, month));
    },

    _formatMonth: function(month) {
        return formatDate(new Date(2000, month), 'MMMM');
    },

    _getMonth: function(year, month) {
        return new this._options.dateConstructor(year, month, 1);
    },

    _onPositionChanged: function(e: Event, position: Date) {
        _private.notifyPositionChanged(this, position);
    },

    _getSeparatorCssClass: function(): string {
        return this._isStickySupport ?
            'controls-PeriodDialog-DateRangeItem__separator controls-PeriodDialog-DateRangeItem__separator-sticky-support' :
            'controls-PeriodDialog-DateRangeItem__separator controls-PeriodDialog-DateRangeItem__separator-not-sticky-support';
    }

});

Component._private = _private;

// Component.EMPTY_CAPTIONS = IPeriodSimpleDialog.EMPTY_CAPTIONS;

Component.getDefaultOptions = function() {
   return {
       dateConstructor: WSDate
   };
};

// Component.getOptionTypes = function() {
//    return coreMerge({}, IPeriodSimpleDialog.getOptionTypes());
// };

export = Component;
