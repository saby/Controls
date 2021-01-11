import {Control as BaseControl} from 'UI/Base';
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import { SyntheticEvent } from 'Vdom/Vdom';
import EventProxy from './Mixin/EventProxy';
import {DateRangeModel, Utils as DateControlsUtils, dateRangeQuantum as quantumUtils} from 'Controls/dateRange';
import {EventUtils} from 'UI/Events';
import {MonthModel} from 'Controls/calendar';
import {Base as dateUtils} from 'Controls/dateUtils';
import datePopupUtils from './Utils';
import componentTmpl = require('wml!Controls/_datePopup/DateRange');
import 'wml!Controls/_datePopup/DateRangeItem';

const _private = {
    updateView: function (self, options, dontUpdateScroll) {
        self._rangeModel.update(options);
        self._monthSelectionEnabled = !options.readOnly && (options.selectionType === 'range' ||
            (options.selectionType === 'quantum' && quantumUtils.monthSelectionEnabled(options.ranges) &&
                options.ranges.months[0] === 1));
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
/**
 * Component that allows you to select periods of multiple days.
 *
 * @class Controls/_datePopup/DateRange
 * @extends UI/Base:Control
 *
 * @author Красильников А.С.
 * @private
 */
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
        EventUtils.proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged']);
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
            let startValue = date;
            let endValue = dateUtils.getEndOfMonth(date);
            if (this._options.rangeSelectedCallback) {
                const ranges = this._options.rangeSelectedCallback(startValue, endValue);
                startValue = ranges[0];
                endValue = ranges[1];
            }
            this._notify('fixedPeriodClick', [startValue, endValue]);
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
        if (position.getFullYear() !== this._position.getFullYear()) {
            _private.notifyPositionChanged(this, position);
        }
    },

    _getSeparatorCssClass: function(): string {
        return this._isStickySupport ?
            'controls-PeriodDialog-DateRangeItem__separator-sticky-support' :
            'controls-PeriodDialog-DateRangeItem__separator-not-sticky-support';
    },

    _preventEvent(event: Event): void {
        // Отключаем скролл ленты с месяцами, если свайпнули по колонке с месяцами
        // Для тач-устройств нельзя остановить событие скрола, которое стреляет с ScrollContainer,
        // внутри которого лежит 2 контейнера для которых требуется разное поведение на тач устройствах
        event.preventDefault();
        event.stopPropagation();
    }

});

Component._private = _private;
Component._theme = ['Controls/datePopup'];
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
