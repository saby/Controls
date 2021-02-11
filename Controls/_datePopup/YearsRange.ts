import {Control as BaseControl} from 'UI/Base';
import {Date as WSDate} from 'Types/entity';
import {DateRangeModel, rangeSelection as rangeSelectionUtils} from 'Controls/dateRange';
import {Base as dateUtils} from 'Controls/dateUtils';
import componentTmpl = require('wml!Controls/_datePopup/YearsRange');
import {constants} from 'Env/Env';

const BUTTONS_COUNT = 6;
/**
 * Component that allows you to select periods that are multiples of years.
 *
 * @class Controls/_datePopup/YearsRange
 * @extends UI/Base:Control
 *
 * @author Красильников А.С.
 * @private
 */
var Component = BaseControl.extend({
    _template: componentTmpl,

    _year: null,
    _rangeModel: null,
    _model: null,
    _lastYear: null,

    // constructor: function() {
    //    this._dayFormatter = this._dayFormatter.bind(this);
    //    Component.superclass.constructor.apply(this, arguments);
    // },

    _beforeMount: function (options) {
        this._year = options.year ? options.year.getFullYear() : (new Date()).getFullYear();

        if (dateUtils.isValidDate(options.endValue)) {
            this._lastYear = Math.max(this._year, options.endValue.getFullYear());
            if (this._lastYear - this._year >= BUTTONS_COUNT) {
                this._lastYear = this._year + BUTTONS_COUNT - 1;
            }
        } else if (dateUtils.isValidDate(options.startValue)) {
            this._lastYear = options.startValue.getFullYear();
        } else {
            // Если период не выбран или выбран в пределах одног года, мы показываем его предпоследним
            this._lastYear = this._year + 1;
        }

        this._rangeModel = new DateRangeModel({ dateConstructor: options.dateConstructor });
        this._rangeModel.update(options);
        this._updateModel(options);
    },

    _beforeUpdate: function (options) {
        if (!dateUtils.isYearsEqual(options.year, this._options.year)) {
            this._year = options.year.getFullYear();
            if (this._year > this._lastYear) {
                this._lastYear = this._year;
            } else if (this._year <= this._lastYear - BUTTONS_COUNT) {
                this._lastYear = this._year + BUTTONS_COUNT - 1;
            }
        }
        this._rangeModel.update(options);
        this._updateModel();
    },

    _beforeUnmount: function () {
        this._rangeModel.destroy();
    },

    _changeYear: function(delta: number): void {
        this._lastYear = this._lastYear + delta;
        this._updateModel();
    },

    _onPrevNextButtonClick: function(event: Event, delta: number): void {
        this._changeYear(delta);
    },

    _prevNextBtnKeyDownHandler: function(event: Event, delta: number): void {
        if (event.nativeEvent.keyCode === constants.key.enter) {
            this._changeYear(delta);
        }
    },

    _onItemClick: function(event: Event, date: Date): void {
        this._notify('itemClick', [date]);
    },

    _onItemKeyDown: function(event: Event, date: Date): void {
        if (event.nativeEvent.keyCode === constants.key.enter) {
            this._notify('itemClick', [date]);
        }
    },

    _onItemMouseEnter: function (e, date) {
        this._notify('itemMouseEnter', [date]);
    },

    _onItemMouseLeave: function (e, date) {
        this._notify('itemMouseLeave', [date]);
    },

    _updateModel: function (options) {
        var items = [],
            currentYear = (new Date()).getFullYear(),
            ots = options || this._options,
            item, year;

        for (var i = 0; i < BUTTONS_COUNT; i++) {
            year = this._lastYear - BUTTONS_COUNT + 1 + i;
            item = {
                caption: year,
                isDisplayed: year === this._year,
                isCurrent: year === currentYear,
                date: new ots.dateConstructor(year, 0),
                year: year
            };

            items.push(item);
        }
        this._model = items;
    },

    _prepareItemClass: function (itemValue) {
        let
            css = [],
            itemDate = new Date(itemValue, 0);

        css.push(rangeSelectionUtils.prepareSelectionClass(
            itemDate,
            this._rangeModel.startValue,
            this._rangeModel.endValue,
            this._options.selectionProcessing,
            this._options.selectionBaseValue,
            this._options.selectionHoveredValue,
            this._options.hoveredStartValue,
            this._options.hoveredEndValue,
            { periodQuantum: rangeSelectionUtils.PERIOD_TYPE.year, theme: this._options.theme }
        ));

        if (itemValue === this._year) {
            css.push('controls-PeriodDialog-Years__item-displayed');
            css.push('controls-PeriodDialog-Years__item-displayed_theme-' + this._options.theme);
        } else if (itemValue === (new Date()).getFullYear()) {
            css.push('controls-PeriodDialog-Years__item-current');
        } else {
            css.push('controls-PeriodDialog-Years__rangeBtn-regular_theme-' + this._options.theme);
        }
        return css.join(' ');
    }

});

// Component.EMPTY_CAPTIONS = IPeriodSimpleDialog.EMPTY_CAPTIONS;

Component.getDefaultOptions = function() {
   return {
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

Component._theme = ['Controls/datePopup'];

// Component.getOptionTypes = function() {
//    return coreMerge({}, IPeriodSimpleDialog.getOptionTypes());
// };

export = Component;
