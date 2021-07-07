import rk = require('i18n!Controls');
import BaseControl = require('Core/Control');
import {Date as WSDate, descriptor} from 'Types/entity';
import getCurrentPeriod = require('Core/helpers/Date/getCurrentPeriod');
import IPeriodSimpleDialog from './IDateLitePopup';
import {Base as dateUtils} from 'Controls/dateUtils';
import componentTmpl = require('wml!Controls/_shortDatePicker/DateLitePopup');
import listTmpl = require('wml!Controls/_shortDatePicker/List');
import ItemWrapper = require('wml!Controls/_shortDatePicker/ItemWrapper');
import {date as formatDate} from 'Types/formatter';
import monthTmpl = require('wml!Controls/_shortDatePicker/monthTemplate');
import {Logger} from 'UI/Utils';
import {Utils as dateControlsUtils} from 'Controls/dateRange';

/**
 * Контрол выбора даты или периода.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_shortDatePicker.less">переменные тем оформления</a>
 *
 * @class Controls/shortDatePicker
 * @extends Core/Control
 * @mixes Controls/shortDatePicker/IDateLitePopup
 * @mixes Controls/_interface/IDisplayedRanges
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/ShortDatePicker/Index
 * @demo Controls-demo/ShortDatePicker/Source/Index
 * @demo Controls-demo/ShortDatePicker/DisplayedRanges/Index
 * @demo Controls-demo/ShortDatePicker/MonthTemplate/ContentTemplate/Index
 * @demo Controls-demo/ShortDatePicker/MonthTemplate/IconTemplate/Index
 */

/*
 * Control for date or period selection.
 *
 * @class Controls/shortDatePicker
 * @extends Core/Control
 * @mixes Controls/shortDatePicker/IDateLitePopup
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/ShortDatePicker/Index
 * @demo Controls-demo/ShortDatePicker/Source/Index
 * @demo Controls-demo/ShortDatePicker/DisplayedRanges/Index
 * @demo Controls-demo/ShortDatePicker/MonthTemplate/ContentTemplate/Index
 * @demo Controls-demo/ShortDatePicker/MonthTemplate/IconTemplate/Index
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
//В режиме 'Только года' одновременно отобржается 15 элементов.
//Таким образом последний отображаемый элемент имеет индекс 14.
const ONLY_YEARS_LAST_ELEMENT_VISIBLE_INDEX = 14;

var Component = BaseControl.extend({
    _template: componentTmpl,
    _defaultListTemplate: listTmpl,
    monthTemplate: null,

    _position: null,

    _yearHovered: null,

    _range: null,

    _isFullPicker: null,

    _limit: 15,
    _isExpandedPopup: false,
    _popupHeightStyle: '',
    _isExpandButtonVisible: true,

// constructor: function() {
    //    this._dayFormatter = this._dayFormatter.bind(this);
    //    Component.superclass.constructor.apply(this, arguments);
    // },

    _beforeMount: function (options) {
        this._options = options;
        this._isFullPicker = options.chooseMonths && options.chooseQuarters && options.chooseHalfyears;
        this._emptyCaption = options.emptyCaption;
        if (!this._emptyCaption) {
            if (options.chooseMonths && (options.chooseQuarters || options.chooseHalfyears)) {
                this._emptyCaption = rk('Период не указан');
            } else {
                this._emptyCaption = rk('Не указан');
            }
        }

        this._caption = options.captionFormatter(options.startValue, options.endValue, options.emptyCaption);

        if (!(options.chooseQuarters && options.chooseMonths) && options.chooseHalfyears) {
            Logger.error(
                'shortDatePicker: Unsupported combination of chooseQuarters, chooseMonths and chooseHalfyears options',
                this);
        }

        if (options.chooseQuarters || options.chooseMonths || options.chooseHalfyears) {
            this._position = options.year || options.startValue || (new options.dateConstructor());
        } else {
            this._position = _private._getYearListPosition(options, options.dateConstructor);
        }
        if (options.range) {
            Logger.error('shortDatePicker: ' + rk('You should use displayedRanges option instead of range option.'), this);
        }
        this._displayedRanges = options.displayedRanges || options.range;

        this._position = this._getFirstPositionInMonthList(this._position);

        this.monthTemplate = options.monthTemplate || monthTmpl;
    },

    _beforeUpdate: function (options) {
        // this._caption = _private._getCaption(options);
        this._updateIsExpandButtonVisible(options);
    },

    /**
     * Sets the current year
     * @param year
     */
    setYear: function (year) {
        this._position = new this._options.dateConstructor(year, 0, 1);
        this._notify('yearChanged', [year]);
    },

    _getFirstPositionInMonthList(srcPosition: Date): Date {
        if (!this._displayedRanges) {
            return srcPosition;
        }

        const calcDisplayedPositionByDelta = (delta) => {
            let tempPosition;
            while (countDisplayedRanges < this._limit) {
                checkingPosition = this._shiftRange(checkingPosition, delta);
                if (!this._isDisplayed(checkingPosition)) {
                    const period = this._getHiddenPeriod(checkingPosition);
                    tempPosition = delta > 0 ? period[1] : period[0];
                    if (!tempPosition) {
                        break;
                    }
                } else {
                    lastDisplayedPosition = new Date(checkingPosition.getTime());
                    countDisplayedRanges++;
                }
            }
        }

        let countDisplayedRanges = 1;
        let lastDisplayedPosition = new Date(srcPosition.getTime());
        let checkingPosition = new Date(srcPosition.getTime());

        // Вначале от изначальной даты идём вниз (напр. от 2020 к 2019, 2018 и тд)
        calcDisplayedPositionByDelta(-1);
        // Восстаналиваем начальную позицию и идем от даты вверх (напр. от 2020 к 2021, 2022 и тд)
        checkingPosition = new Date(srcPosition.getTime());
        calcDisplayedPositionByDelta(1);

        return lastDisplayedPosition;
    },

    _shiftRange(date: Date, delta: number): Date {
        return new this._options.dateConstructor(date.getFullYear() + delta, 0);
    },

    // Получить неотображаемый период в который попадает переданная дата
    _getHiddenPeriod(date: Date): Date[] {
        let range: Date[] = [];
        for (let i = 0; i < this._options.displayedRanges.length; i++) {
            range = this._options.displayedRanges[i];
            if (date < range[0]) {
                const startHiddenPeriod = i === 0 ? null : this._shiftRange(this._options.displayedRanges[i - 1][1], 1);
                const endHiddenPeriod = this._shiftRange(range[0], -1);
                return [startHiddenPeriod, endHiddenPeriod];
            }
        }
        return [range[1] ? this._shiftRange(range[1], 1) : date, null];
    },

    _isDisplayed(date: Date): boolean {
        if (!this._options.displayedRanges || !this._options.displayedRanges.length) {
            return true;
        }

        for (let i = 0; i < this._displayedRanges.length; i++) {
            if (this._hitsDiplayedRange(date.getFullYear(), i)) {
                return true;
            }
        }
        return false;
    },

    _updateIsExpandButtonVisible(options): void {
        const openerTop = options.stickyPosition.targetPosition.top;
        const popupTop = options.stickyPosition.position.top + Math.abs(options.stickyPosition.margins.top);
        this._isExpandButtonVisible = openerTop === popupTop;
    },

    _dateToDataString(date) {
        return formatDate(date, 'YYYY-MM-DD');
    },

    _onYearMouseEnter: function (event, year) {
        if (this._options.chooseYears) {
            this._yearHovered = year;
        }
    },

    _hitsDiplayedRange: function (year, index) {
        const date = new Date(year, 0);
        //Проверяем второй элемент массива на null. Если задан null в опции displayedRanges
        //то лента будет отображаться бесконечно.
        return this._displayedRanges[index][0] <= date &&
            (this._displayedRanges[index][1] === null || this._displayedRanges[index][1] >= date);
    },

    _getDisplayedYear: function (year, delta) {
        if (!this._displayedRanges) {
            return year + delta;
        }
        let index;
        //Ищем массив в котором находится year.
        for (let i = 0; i < this._displayedRanges.length; i++) {
            if (this._hitsDiplayedRange(year, i)) {
                index = i;
                break;
            }
        }
        // При нажатии кнопки 'Вниз' у типа 'Только года', мы отнимаем ONLY_YEARS_LAST_ELEMENT_VISIBLE_INDEX,
        // если мы попали за границы displayedRanges, берем за основу вычислений ближайший элемент снизу.
        if (index === undefined) {
            for (let i = this._displayedRanges.length - 1; i >= 0; i--) {
                if (this._displayedRanges[i][1] < new Date(year, 0) && this._displayedRanges[i][1] !== null) {
                    index = i;
                    break;
                }
            }
            if (index === undefined) {
                return year;
            }
        }
        //Проверяем год, на который переходим. Если оне не попадает в тот же массив что и year - ищем ближайших год на
        //который можно перейти в следующем массиве
        if (this._hitsDiplayedRange(year + delta, index)) {
            return year + delta;
        } else {
            if (this._displayedRanges[index + delta]) {
                if (delta === 1) {
                    return this._displayedRanges[index + delta][0].getFullYear();
                } else {
                    return this._displayedRanges[index + delta][1].getFullYear();
                }
            }
        }
        return year;
    },

    _changeYear : function(event, delta) {
        let year = this._position.getFullYear();
        //_position определяется первым отображаемым годом в списке. Всего у нас отображается
        //5 записей. Для перехода на предыдущий элемент, нужно проверить, возможно ли это.
        //Для этого проверям самый нижний элемент списка.
        if (delta === -1 && !this._options.chooseMonths &&
            !this._options.chooseHalfyears && !this._options.chooseQuarters) {
            //Нижний отображаемый год в списке из 15 элементов.
            const yearToCheck = year - ONLY_YEARS_LAST_ELEMENT_VISIBLE_INDEX;
            //_getDisplayedYear вернет нижний отображаемый год. Нам нужен первый отображаемый год в списке,
            //для того чтобы установить _position
            let yearToSet = this._getDisplayedYear(yearToCheck, delta) + ONLY_YEARS_LAST_ELEMENT_VISIBLE_INDEX;
            // Скорректируем _position, если задана опция _displayedRanges
            yearToSet = this._getFirstPositionInMonthList(new Date(yearToSet, 0));
            this.setYear(yearToSet.getFullYear());
        } else {
            this.setYear(this._getDisplayedYear(year, delta));
        }
    },

    _onYearMouseLeave: function () {
        this._yearHovered = null;
    },

    _expandPopup(): void {
        this._isExpandedPopup = !this._isExpandedPopup;
        let fittingMode;

        if (this._isExpandedPopup) {
            // const maxHeightPopup = this._options.stickyPosition.position.maxHeight;
            // const topPopup = this._options.stickyPosition.position.top;
            this._popupHeightStyle = 'height: 100%';
            fittingMode = 'fixed';
        } else {
            this._popupHeightStyle = '';
            fittingMode = 'overflow';
        }
        this._notify('sendResult', [fittingMode]);
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
            return 'controls-PeriodLiteDialog__width-big_theme-' + this._options.theme;
        }
        if (this._options.chooseQuarters || this._options.chooseMonths) {
            return 'controls-PeriodLiteDialog__width-medium_theme-' + this._options.theme;
        }
        return 'controls-PeriodLiteDialog__width-small_theme-' + this._options.theme;
    },

    _getListCssClasses: function () {
        if (this._options.chooseHalfyears) {
            return 'controls-PeriodLiteDialog-item controls-PeriodLiteDialog__fullYear-list_theme-' + this._options.theme;
        }
        if (this._options.chooseMonths) {
            return 'controls-PeriodLiteDialog__vLayout_theme-' + this._options.theme +
                ' controls-PeriodLiteDialog__month-list_theme-' + this._options.theme;
        }
        if (this._options.chooseQuarters) {
            return 'controls-PeriodLiteDialog__vLayout_theme-' + this._options.theme +
                ' controls-PeriodLiteDialog__quarter-list_theme-' + this._options.theme;
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
            css.push('controls-PeriodLiteDialog__year-medium_theme-' + this._options.theme);
        } else if (this._options.chooseMonths) {
            css.push('controls-PeriodLiteDialog__year-center-lite');
        }
        return css.join(' ');
    },

    _getYearItemCssClasses: function (year) {
        var css = [],
            date = this._options.startValue;
        if (!dateUtils.isValidDate(date) || (year !== date.getFullYear())) {
            css.push('controls-PeriodLiteDialog__vLayoutItem-clickable_theme-' + this._options.theme);
        }
        if (dateUtils.isValidDate(date) && (year === date.getFullYear())) {
            css.push('controls-PeriodLiteDialog__selectedYear');
            css.push('controls-PeriodLiteDialog__selectedYear_theme-' + this._options.theme);
        }
        return css.join(' ');
    }

});

Component._private = _private;

Component.EMPTY_CAPTIONS = IPeriodSimpleDialog.EMPTY_CAPTIONS;

Component.getDefaultOptions = function () {
    return {
        ...IPeriodSimpleDialog.getDefaultOptions(),
        captionFormatter: dateControlsUtils.formatDateRangeCaption,
        itemTemplate: ItemWrapper,
        dateConstructor: WSDate
    };
};
Component._theme = ['Controls/shortDatePicker'];

Component.getOptionTypes = function () {
    return {
        ...IPeriodSimpleDialog.getOptionTypes(),
        captionFormatter: descriptor(Function)
    };
};

export default Component;
