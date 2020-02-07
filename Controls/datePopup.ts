import rk = require('i18n!Controls');
import {SyntheticEvent} from 'Vdom/Vdom';
import BaseControl = require('Core/Control');
import coreMerge = require('Core/core-merge');
import {descriptor, Date as WSDate} from 'Types/entity';
import {dateMaskConstants} from 'Controls/interface';
import {IRangeSelectable} from 'Controls/dateRange';
import {DateRangeModel, IDateRangeSelectable} from 'Controls/dateRange';
import EventProxyMixin from './_datePopup/Mixin/EventProxy';
import periodDialogUtils from './_datePopup/Utils';
import dateUtils = require('Controls/Utils/Date');
import dateRangeUtil = require('Controls/Utils/DateRangeUtil');
import componentTmpl = require('wml!Controls/_datePopup/DatePopup');
import headerTmpl = require('wml!Controls/_datePopup/header');
import dayTmpl = require('wml!Controls/_datePopup/day');
import {MonthViewDayTemplate} from 'Controls/calendar';
import 'css!theme?Controls/datePopup';
import {Controller as ManagerController} from 'Controls/popup';
import {_scrollContext as ScrollData, IntersectionObserverSyntheticEntry} from "./scroll";

/**
 * Диалоговое окно, которое позволяет выбрать даты и периоды произвольной длительности.
 *
 * @class Controls/datePopup
 * @extends Core/Control
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 * @mixes Controls/interface/IDateMask
 * @mixes Controls/_datePopup/interfaces/IDatePopup
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/datePopup/datePopup
 *
 * @css @background-color_PeriodDialog Background color of dialog.
 * @css @width_PeriodDialog Dialog width.
 * @css @height_PeriodDialog Dialog height.
 * @css @border-width_PeriodDialog Borders width.
 * @css @border-color_PeriodDialog Borders color.
 * @css @background-color__PeriodDialog-header Background color of dialog header.
 * @css @spacing_PeriodDialog-header-between-borderLeft-content Spacing between left border and header content.
 * @css @height_PeriodDialog-header Height of dialog header.
 * @css @spacing_PeriodDialog-header-between-stateButton-date Spacing between state button and date in header.
 * @css @width_PeriodDialog-header-dash Width of the dash between start and end input fields.
 * @css @spacing_PeriodDialog-header-between-dash-date Spacing between dash and input fields.
 * @css @spacing_PeriodDialog-header-between-applyButton-otherElements Spacing between apply button and other header elements.
 * @css @height_PeriodDialog-years Height of the years panel.
 * @css @width_PeriodDialog-years-leftRight Width of the left and right regions in year mode.
 * @css @height_PeriodDialog-years-rangeButton Height of the years range button.
 * @css @color_PeriodDialog-years-rangeButton Color of the years range button.
 * @css @font-size_PeriodDialog-years-rangeButton Font size of the years range button.
 * @css @color_PeriodDialog-years-current-year Color of the text on button with current year.
 * @css @color_PeriodDialog-years-displayed-year Color of the text on button with displayed year.
 * @css @font-size_PeriodDialog-years-displayed-year Font size of the text on button with displayed year.
 * @css @border-width_PeriodDialog-monthRange: Default border width in years mode. For example between months.
 * @css @border-width_PeriodDialog-monthRange-additional: Border width between year end year title, half years or quarters and months in years mode.
 * @css @border-color_PeriodDialog-monthRange Color of borders in month range.
 * @css @height_PeriodDialog-monthRange-header Height of the month range year header.
 * @css @color_PeriodDialog-monthRange-header Color of the month range year header.
 * @css @font-size_PeriodDialog-monthRange-header Font size of the month range year header.
 * @css @color_PeriodDialog-monthRange-halfyearsAndQuarters Color of the text in halfyears and quarters buttons.
 * @css @border-color_PeriodDialog-monthRange-halfyearsAndQuarters_selected Border color of the borders selected halfyears and quarters regions.
 * @css @font-size_PeriodDialog-monthRange-halfYears Font size of the text in halfyears buttons.
 * @css @border-width_PeriodDialog-monthRange-halfYears Border width of the half years block in month range.
 * @css @font-size_PeriodDialog-monthRange-quarters Font size of the text in halfyears buttons.
 * @css @spacing_PeriodDialog-monthRange-monthWrapper-between-content-leftRightBorder Spacing between content and left and right border in month.
 * @css @height_PeriodDialog-monthRange-monthWrapper Height of the months in month range.
 * @css @width_PeriodDialog-monthRange-monthWrapper Width of the months in month range.
 * @css @border-color_PeriodDialog-monthRange-month Color of the border on hovered month in month range.
 * @css @color_PeriodDialog-monthRange-month-title Color of the title in month range.
 * @css @font-size_PeriodDialog-monthRange-month-title Font size of the title in month range.
 * @css @height_PeriodDialog-monthRange-month-title Height of the title in month range.
 * @css @height_PeriodDialog-monthRange-month-date Height of the month body in month range.
 * @css @font-size_PeriodDialog-monthRange-month-date Font size of the month body in month range.
 * @css @width_PeriodDialog-monthRange-month-selectionEdge Width of the edge line in first and end selected month.
 * @css @height_PeriodDialog-dateRange-header Height of date range header.
 * @css @font-size_PeriodDialog-dateRange-header Font size of date range header.
 * @css @width_PeriodDialog-dateRange-monthPanel Width of month panel in date range mode.
 * @css @spacing_PeriodDialog-dateRange-monthPanel-between-content-leftRightBorder Spacing between left border of month button and text in date range mode.
 * @css @color_PeriodDialog-dateRange-header-year Color of year in header in date range mode.
 * @css @font-weight_PeriodDialog-dateRange-header-year Font weight of year in header in date range mode.
 * @css @color_PeriodDialog-dateRange-header-workday Color of the workday in header in date range mode.
 * @css @color_PeriodDialog-dateRange-header-weekend Color of the weekend in header in date range mode.
 * @css @height_PeriodDialog-dateRange-months-button Height of the month button in date range mode.
 * @css @border-color_PeriodDialog-dateRange-months Border color of the month button in date range mode.
 * @css @color_PeriodDialog-dateRange-months-button Color of the month button in date range mode.
 * @css @font-size_PeriodDialog-dateRange-months-button Font size of the month button in date range mode.
 * @css @background-color_PeriodDialog-dateRange-months-button Background color of the month button in date range mode.
 * @css @border-color_PeriodDialog-dateRange-months-button_hover Border color of the hovered month button in date range mode.
 * @css @background-color_PeriodDialog-dateRange-months-button_hover Background color of the hovered month button in date range mode.
 * @css @color_PeriodDialog-dateRange-months-nextYearButton Color of the next year button in date range mode.
 * @css @font-size_PeriodDialog-dateRange-months-nextYearButton Font size of the next year button in date range mode.
 * @css @border-color_PeriodDialog-dateRange-months Border color of the next year button in date range mode.
 * @css @background-color_PeriodDialog-dateRange-months-nextYearButton Background color of the next year button in date range mode.
 * @css @border-color_PeriodDialog-dateRange-months-nextYearButton Border color of the next year button in date range mode.
 * @css @background-color_PeriodDialog-dateRange-months-nextYearButton_hover Background color of the next year hovered button in date range mode.
 * @css @height_PeriodDialog-dateRange-monthsWithDates-title Height of the month title in date range mode.
 * @css @font-size_PeriodDialog-dateRange-monthsWithDates-title Font size of the month title in date range mode.
 * @css @color_PeriodDialog-dateRange-monthsWithDates-title Color of the month title in date range mode.
 * @css @background-color_PeriodDialog-dateRange-monthsWithDates-title Background color of the month title in date range mode.
 * @css @border-color_PeriodDialog-dateRange-monthsWithDates-title_hover Border color of the hovered month title in date range mode.
 * @css @background-color_PeriodDialog-dateRange-monthsWithDates-title_hover Background color of the hovered month title in date range mode.
 *
 */

/*
 * A dialog that allows you to choose dates and periods of arbitrary duration.
 *
 * @class Controls/datePopup
 * @extends Core/Control
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 * @mixes Controls/interface/IDateMask
 * @mixes Controls/datePopup/interfaces/IDatePopup
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/datePopup/datePopup
 *
 * @css @background-color_PeriodDialog Background color of dialog.
 * @css @width_PeriodDialog Dialog width.
 * @css @height_PeriodDialog Dialog height.
 * @css @border-width_PeriodDialog Borders width.
 * @css @border-color_PeriodDialog Borders color.
 * @css @background-color__PeriodDialog-header Background color of dialog header.
 * @css @spacing_PeriodDialog-header-between-borderLeft-content Spacing between left border and header content.
 * @css @height_PeriodDialog-header Height of dialog header.
 * @css @spacing_PeriodDialog-header-between-stateButton-date Spacing between state button and date in header.
 * @css @color_PeriodDialog-header-dash Color of dash between start and end input fields.
 * @css @thickness_PeriodDialog-header-dash Thickness of dash between start and end input fields.
 * @css @width_PeriodDialog-header-dash Width of the dash between start and end input fields.
 * @css @spacing_PeriodDialog-header-between-dash-date Spacing between dash and input fields.
 * @css @spacing_PeriodDialog-header-between-applyButton-otherElements Spacing between apply button and other header elements.
 * @css @height_PeriodDialog-years Height of the years panel.
 * @css @width_PeriodDialog-years-leftRight Width of the left and right regions in year mode.
 * @css @height_PeriodDialog-years-rangeButton Height of the years range button.
 * @css @color_PeriodDialog-years-rangeButton Color of the years range button.
 * @css @font-size_PeriodDialog-years-rangeButton Font size of the years range button.
 * @css @color_PeriodDialog-years-current-year Color of the text on button with current year.
 * @css @color_PeriodDialog-years-displayed-year Color of the text on button with displayed year.
 * @css @font-size_PeriodDialog-years-displayed-year Font size of the text on button with displayed year.
 * @css @border-width_PeriodDialog-monthRange: Default border width in years mode. For example between months.
 * @css @border-width_PeriodDialog-monthRange-additional: Border width between year end year title, half years or quarters and months in years mode.
 * @css @border-color_PeriodDialog-monthRange Color of borders in month range.
 * @css @height_PeriodDialog-monthRange-header Height of the month range year header.
 * @css @color_PeriodDialog-monthRange-header Color of the month range year header.
 * @css @font-size_PeriodDialog-monthRange-header Font size of the month range year header.
 * @css @color_PeriodDialog-monthRange-halfyearsAndQuarters Color of the text in halfyears and quarters buttons.
 * @css @border-color_PeriodDialog-monthRange-halfyearsAndQuarters_selected Border color of the borders selected halfyears and quarters regions.
 * @css @font-size_PeriodDialog-monthRange-halfYears Font size of the text in halfyears buttons.
 * @css @border-width_PeriodDialog-monthRange-halfYears Border width of the half years block in month range.
 * @css @font-size_PeriodDialog-monthRange-quarters Font size of the text in halfyears buttons.
 * @css @spacing_PeriodDialog-monthRange-monthWrapper-between-content-leftRightBorder Spacing between content and left and right border in month.
 * @css @height_PeriodDialog-monthRange-monthWrapper Height of the months in month range.
 * @css @width_PeriodDialog-monthRange-monthWrapper Width of the months in month range.
 * @css @border-color_PeriodDialog-monthRange-month Color of the border on hovered month in month range.
 * @css @color_PeriodDialog-monthRange-month-title Color of the title in month range.
 * @css @font-size_PeriodDialog-monthRange-month-title Font size of the title in month range.
 * @css @height_PeriodDialog-monthRange-month-title Height of the title in month range.
 * @css @height_PeriodDialog-monthRange-month-date Height of the month body in month range.
 * @css @font-size_PeriodDialog-monthRange-month-date Font size of the month body in month range.
 * @css @width_PeriodDialog-monthRange-month-selectionEdge Width of the edge line in first and end selected month.
 * @css @height_PeriodDialog-dateRange-header Height of date range header.
 * @css @font-size_PeriodDialog-dateRange-header Font size of date range header.
 * @css @width_PeriodDialog-dateRange-monthPanel Width of month panel in date range mode.
 * @css @spacing_PeriodDialog-dateRange-monthPanel-between-content-leftRightBorder Spacing between left border of month button and text in date range mode.
 * @css @color_PeriodDialog-dateRange-header-year Color of year in header in date range mode.
 * @css @font-weight_PeriodDialog-dateRange-header-year Font weight of year in header in date range mode.
 * @css @color_PeriodDialog-dateRange-header-workday Color of the workday in header in date range mode.
 * @css @color_PeriodDialog-dateRange-header-weekend Color of the weekend in header in date range mode.
 * @css @height_PeriodDialog-dateRange-months-button Height of the month button in date range mode.
 * @css @border-color_PeriodDialog-dateRange-months Border color of the month button in date range mode.
 * @css @color_PeriodDialog-dateRange-months-button Color of the month button in date range mode.
 * @css @font-size_PeriodDialog-dateRange-months-button Font size of the month button in date range mode.
 * @css @background-color_PeriodDialog-dateRange-months-button Background color of the month button in date range mode.
 * @css @border-color_PeriodDialog-dateRange-months-button_hover Border color of the hovered month button in date range mode.
 * @css @background-color_PeriodDialog-dateRange-months-button_hover Background color of the hovered month button in date range mode.
 * @css @color_PeriodDialog-dateRange-months-nextYearButton Color of the next year button in date range mode.
 * @css @font-size_PeriodDialog-dateRange-months-nextYearButton Font size of the next year button in date range mode.
 * @css @border-color_PeriodDialog-dateRange-months Border color of the next year button in date range mode.
 * @css @background-color_PeriodDialog-dateRange-months-nextYearButton Background color of the next year button in date range mode.
 * @css @border-color_PeriodDialog-dateRange-months-nextYearButton Border color of the next year button in date range mode.
 * @css @background-color_PeriodDialog-dateRange-months-nextYearButton_hover Background color of the next year hovered button in date range mode.
 * @css @height_PeriodDialog-dateRange-monthsWithDates-title Height of the month title in date range mode.
 * @css @font-size_PeriodDialog-dateRange-monthsWithDates-title Font size of the month title in date range mode.
 * @css @color_PeriodDialog-dateRange-monthsWithDates-title Color of the month title in date range mode.
 * @css @background-color_PeriodDialog-dateRange-monthsWithDates-title Background color of the month title in date range mode.
 * @css @border-color_PeriodDialog-dateRange-monthsWithDates-title_hover Border color of the hovered month title in date range mode.
 * @css @background-color_PeriodDialog-dateRange-monthsWithDates-title_hover Background color of the hovered month title in date range mode.
 *
 */

var _private = {
        fixedPeriodClick: function (self, start, end) {
            _private.rangeChanged(self, start, end);
            self._monthRangeSelectionProcessing = false;
            _private.sendResult(self, start, end);
        },
        selectionChanged: function (self, start, end) {
            self._headerRangeModel.startValue = start;
            self._headerRangeModel.endValue = end;
        },
        rangeChanged: function (self, start, end) {
            self._rangeModel.startValue = start;
            self._rangeModel.endValue = end;
            self._headerRangeModel.startValue = start;
            self._headerRangeModel.endValue = end;
            _private.updateYearsRangeModel(self, start, end);
        },
        updateYearsRangeModel: function(self, start: Date, end: Date): void {
            if (dateUtils.isStartOfYear(start) && dateUtils.isEndOfYear(end)) {
                self._yearRangeModel.startValue = start;
                self._yearRangeModel.endValue = end;
            } else {
                self._yearRangeModel.startValue = null;
                self._yearRangeModel.endValue = null;
            }
        },
        sendResult: function (self, start, end) {
            self._notify(
                'sendResult',
                [start || self._rangeModel.startValue, end || self._rangeModel.endValue],
                {bubbling: true}
            );
        },
        getViewState: function(options, monthStateEnabled, yearStateEnabled) {
            if (monthStateEnabled) {
                if (yearStateEnabled) {
                    if (((dateUtils.isValidDate(options.startValue) && dateUtils.isValidDate(options.endValue)) &&
                        (!dateUtils.isStartOfMonth(options.startValue) || !dateUtils.isEndOfMonth(options.endValue)) &&
                        dateRangeUtil.gePeriodLengthInDays(options.startValue, options.endValue) <= MONTH_STATE_SELECTION_DAYS)) {
                        return STATES.month;
                    }
                } else {
                    return STATES.month;
                }
            }
            return STATES.year;
        },

        toggleState: function(self, date?: Date): void {
            self._displayedDate = date || self._options.startValue || self._options.endValue || new Date();
            self._state = self._state === STATES.year ? STATES.month : STATES.year;
        },

        isMaskWithDays: function(mask: string) {
            return mask.indexOf('D') !== -1;
        },

        isInputsValid: function(self): Promise<boolean> {
            return self._children.formController.submit().then((results: object) => {
                return !Object.keys(results).find((key) => Array.isArray(results[key]));
            });
        }
    },
    HEADER_TYPES = {
        link: 'link',
        input: 'input'
    },
    STATES = {
        year: 'year',
        month: 'month'
    },
    MONTH_STATE_SELECTION_DAYS = 30,
    popupMask = coreMerge({auto: 'auto'}, dateMaskConstants);

var Component = BaseControl.extend([EventProxyMixin], {
    _template: componentTmpl,
    _headerTmpl: headerTmpl,
    _dayTmpl: dayTmpl,
    _defaultDayTemplate: MonthViewDayTemplate,

    _rangeModel: null,
    _headerRangeModel: null,
    _yearRangeModel: null,

    _displayedDate: null,

    _HEADER_TYPES: HEADER_TYPES,
    _headerType: HEADER_TYPES.link,
    _activateInputField: false,

    _homeButtonVisible: true,

    _STATES: STATES,
    _state: STATES.year,

    _monthRangeSelectionProcessing: false,

    _dateRangeSelectionProcessing: false,

    _yearStateEnabled: true,
    _monthStateEnabled: true,

    _yearRangeSelectionType: null,

    _mask: null,

    _beforeMount: function (options) {
        this._displayedDate = dateUtils.getStartOfMonth(
            dateUtils.isValidDate(options.startValue) ? options.startValue : new Date());

        this._rangeModel = new DateRangeModel({ dateConstructor: options.dateConstructor });
        this._rangeModel.update(options);
        this._prepareTheme();
        this._headerRangeModel = new DateRangeModel({ dateConstructor: options.dateConstructor });
        this._headerRangeModel.update(options);

        this._yearRangeModel = new DateRangeModel({ dateConstructor: options.dateConstructor });
        _private.updateYearsRangeModel(this, options.startValue, options.endValue);

        this._monthStateEnabled = periodDialogUtils.isMonthStateEnabled(options);
        this._yearStateEnabled = periodDialogUtils.isYearStateEnabled(options);

        this._state = _private.getViewState(options, this._monthStateEnabled, this._yearStateEnabled);
        if (this._state === STATES.year) {
            this._displayedDate = dateUtils.getStartOfYear(this._displayedDate);
        }

        this._yearRangeSelectionType = options.selectionType;
        this._yearRangeQuantum = {};
        this._monthRangeSelectionType = options.selectionType;
        this._monthRangeQuantum = {};

        if (options.mask === popupMask.auto) {
            this._mask = options.minRange === IDateRangeSelectable.minRange.month ? popupMask.MM_YYYY : popupMask.DD_MM_YY;
        } else {
            this._mask = options.mask;
        }

        if (options.selectionType === 'quantum') {
            if ('years' in options.quantum) {
                this._yearRangeSelectionType = options.selectionType;
                this._yearRangeQuantum = {'years': options.quantum.years};
            } else {
                this._yearRangeSelectionType = IDateRangeSelectable.SELECTION_TYPES.disable;
            }
            if ('months' in options.quantum) {
                this._monthRangeSelectionType = options.selectionType;
                this._monthRangeQuantum = {'months': options.quantum.months};
            } else {
                this._monthRangeSelectionType = IDateRangeSelectable.SELECTION_TYPES.disable;
            }
        }

        if (!this._yearStateEnabled) {
            this._yearRangeSelectionType = IDateRangeSelectable.SELECTION_TYPES.disable;
            this._monthRangeSelectionType = IDateRangeSelectable.SELECTION_TYPES.disable;
        }

        if (options.readOnly) {
            this._yearRangeSelectionType = IDateRangeSelectable.SELECTION_TYPES.disable;
        }

        this._headerType = options.headerType;
    },

    _afterUpdate: function(): void {
        if (this._activateInputField) {
            this.activate();
            this._activateInputField = false;
        }
    },

    _beforeUnmount: function () {
        this._rangeModel.destroy();
        this._headerRangeModel.destroy();
        this._yearRangeModel.destroy();
    },
    _prepareTheme(): void {
        this._headerTheme = ManagerController.getPopupHeaderTheme();
    },

    _toggleStateClick: function(): void {
        _private.toggleState(this);
    },

    _homeButtonClick: function () {
        this._displayedDate = dateUtils.getStartOfMonth(new Date());
    },

    _currentDayIntersectHandler: function(event: SyntheticEvent, entries: IntersectionObserverSyntheticEntry[]): void {
        this._homeButtonVisible = !entries[entries.length - 1].nativeEntry.intersectionRatio;
    },

    _yearsRangeChanged: function (e, start, end) {
        _private.rangeChanged(this, start, end ? dateUtils.getEndOfYear(end) : null);
    },

    _headerLinkClick: function (e) {
        if (this._headerType === this._HEADER_TYPES.link) {
            this._headerType = this._HEADER_TYPES.input;
            this._activateInputField = true;
        } else {
            this._headerType = this._HEADER_TYPES.link;
        }
    },

    _onHeaderLinkRangeChanged: function(e, startValue, endValue) {
        _private.rangeChanged(this, startValue, endValue);
    },

    _startValuePickerChanged: function (e, value) {
        _private.rangeChanged(
            this,
            value,
            this._options.selectionType === IRangeSelectable.SELECTION_TYPES.single ? value : this._rangeModel.endValue
        );
    },

    _endValuePickerChanged: function (e, value) {
        let startValue = this._rangeModel.startValue,
            endValue = value;
        if (this._options.selectionType === IRangeSelectable.SELECTION_TYPES.single) {
            startValue = value;
        } else if (dateUtils.isValidDate(value) && !_private.isMaskWithDays(this._mask)) {
            endValue = dateUtils.getEndOfMonth(value);
        }
        _private.rangeChanged(this, startValue, endValue);
    },

    _yearsSelectionChanged: function (e, start, end, selectionDirection) {
        const endYear = end ? dateUtils.getEndOfYear(end) : null;
        _private.selectionChanged(this, start, endYear);
        this._rangeModel.startValue = start;
        this._rangeModel.endValue = endYear;
    },

    _onYearsSelectionHoveredValueChanged: function(e, value) {
        // We update the displayed date only during the selection process.
        if (value) {
            this._displayedDate = value;
        }
    },

    _yearsSelectionStarted: function (e, start, end) {
        this._monthRangeSelectionProcessing = false;
    },

    _yearsRangeSelectionEnded: function (e, start, end) {
        _private.sendResult(this, start, dateUtils.getEndOfYear(end));
    },

    _onYearsItemClick: function(e: SyntheticEvent, item: Date): void {
        this._displayedDate = item;
    },

    _monthsRangeChanged: function (e, start, end) {
        _private.rangeChanged(this, start, end ? dateUtils.getEndOfMonth(end) : null);
    },

    _monthsSelectionChanged: function (e, start, end) {
        _private.selectionChanged(this, start, end ? dateUtils.getEndOfMonth(end) : null);
    },

    _monthsRangeSelectionEnded: function (e, start, end) {
        _private.sendResult(this, start, dateUtils.getEndOfMonth(end));
    },

    _monthRangeMonthClick: function (e, date) {
        _private.toggleState(this, date);
    },

    _monthRangeFixedPeriodClick: function (e, start, end) {
        _private.fixedPeriodClick(this, start, end);
    },

    _dateRangeChanged: function (e, start, end) {
        _private.rangeChanged(this, start, end);
        this._monthRangeSelectionProcessing = false;
    },

    _dateRangeSelectionChanged: function (e, start, end) {
        _private.selectionChanged(this, start, end);
    },

    _dateRangeSelectionEnded: function (e, start, end) {
        _private.sendResult(this, start, end);
    },

    _dateRangeFixedPeriodClick: function (e, start, end) {
        _private.fixedPeriodClick(this, start, end);
    },

    _applyClick: function (e) {
        return _private.isInputsValid(this).then((valid: boolean) => {
            if (valid) {
                _private.sendResult(this);
            }
        });
    },

    _closeClick: function () {
        this._notify('close');
    },
    _getChildContext: function() {
        return {
            ScrollData: new ScrollData({pagingVisible: false})
        };
    },

    // TODO Переделать по готовности задачи по доработке InputRender
    //  https://online.sbis.ru/opendoc.html?guid=d4bdb7cc-c324-4b4b-bda5-db6f8a46bc60
    _startValueFieldKeyUpHandler: function(event) {
        if (!this._children.endValueField) {
            return;
        }
        // Move the focus only if the digit was pressed. Without this check, we see a bug in the following scenario.
        // The cursor is in a different input field. Click tab. By pressing the focus goes to this input field.
        // Release tab. Switches the focus in the field at the end of the period.
        const key = parseInt(event.nativeEvent.key, 10);
        if (!isNaN(key)) {
             const startField = this._children.startValueField._container.querySelector('input');
             const endField = this._children.endValueField._container.querySelector('input');
             if (startField.selectionStart === this._mask.length) {
                this._children.endValueField.activate();
                endField.setSelectionRange(0, 0);
             }
        }
    },

    _inputFocusOutHandler: function(event): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this._children.inputs.contains(event.nativeEvent.relatedTarget)) {
                return _private.isInputsValid(this).then((valid: boolean) => {
                    if (valid) {
                        this._headerType = this._options.headerType;
                    }
                    resolve(valid);
                });
            }
            resolve(false);
        });
    }
});

Component._private = _private;

Component.SELECTION_TYPES = IRangeSelectable.SELECTION_TYPES;
Component.HEADER_TYPES = HEADER_TYPES;

Component.getDefaultOptions = function () {
    return coreMerge({

        /**
         * @name Controls/datePopup#emptyCaption
         * @cfg {String} Отображаемый текст, когда в контроле не выбран период.
         */

        /*
         * @name Controls/datePopup#emptyCaption
         * @cfg {String} Text that is used if the period is not selected
         */
        emptyCaption: rk('Не указан'),

        /**
         * @name Controls/datePopup#headerType
         * @cfg {String} Тип заголовка.
         * @variant link Заголовок отображает выбранный период. При клике по заголовку он преобразуется в поле ввода периода.
         * @variant input Заголовок по умолчанию отображается в виде поля ввода периода.
         */

        /*
         * @name Controls/datePopup#headerType
         * @cfg {String} Type of the header.
         * @variant link
         * @variant input
         */
        headerType: HEADER_TYPES.link,

        minRange: IDateRangeSelectable.minRange.day,
        mask: popupMask.auto,

        dateConstructor: WSDate,

        dayTemplate: MonthViewDayTemplate

    }, IRangeSelectable.getDefaultOptions());
};

Component.getOptionTypes = function () {
    return coreMerge({
        headerType: descriptor(String).oneOf([
            HEADER_TYPES.link,
            HEADER_TYPES.input
        ]),
    }, IDateRangeSelectable.getOptionTypes());
};

export = Component;
