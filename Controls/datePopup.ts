import rk = require('i18n!Controls');
import {SyntheticEvent} from 'Vdom/Vdom';
import BaseControl = require('Core/Control');
import coreMerge = require('Core/core-merge');
import {descriptor, Date as WSDate} from 'Types/entity';
import {dateMaskConstants} from 'Controls/Utils/DateControlsUtils';
import {IRangeSelectable} from 'Controls/dateRange';
import {DateRangeModel, IDateRangeSelectable} from 'Controls/dateRange';
import {getRangeValueValidators} from 'Controls/Utils/DateControlsUtils';
import EventProxyMixin from './_datePopup/Mixin/EventProxy';
import periodDialogUtils from './_datePopup/Utils';
import dateUtils = require('Controls/Utils/Date');
import dateRangeUtil = require('Controls/Utils/DateRangeUtil');
import componentTmpl = require('wml!Controls/_datePopup/DatePopup');
import headerTmpl = require('wml!Controls/_datePopup/header');
import dayTmpl = require('wml!Controls/_datePopup/day');
import {MonthViewDayTemplate} from 'Controls/calendar';
import {Controller as ManagerController} from 'Controls/popup';
import {_scrollContext as ScrollData, IntersectionObserverSyntheticEntry} from "./scroll";

/**
 * Диалоговое окно, которое позволяет выбрать даты и периоды произвольной длительности.
 *
 * @class Controls/datePopup
 * @extends Core/Control
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 * @mixes Controls/_interface/IDayTemplate
 * @mixes Controls/interface/IDateMask
 * @mixes Controls/_datePopup/interfaces/IDatePopup
 * @mixes Controls/_interface/IDateRangeValidators
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/datePopup/datePopup
 *
 */

/*
 * A dialog that allows you to choose dates and periods of arbitrary duration.
 *
 * @class Controls/datePopup
 * @extends Core/Control
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 * @mixes Controls/_interface/IDayTemplate
 * @mixes Controls/interface/IDateMask
 * @mixes Controls/datePopup/interfaces/IDatePopup
 * @mixes Controls/_interface/IDateRangeValidators
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/datePopup/datePopup
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
        updateYearsRangeModel: function (self, start: Date, end: Date): void {
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
        getViewState: function (options, monthStateEnabled, yearStateEnabled) {
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

        toggleState: function (self, date?: Date): void {
            self._state = self._state === STATES.year ? STATES.month : STATES.year;

            const displayedDate = date || self._options.startValue || self._options.endValue || new Date();
            self._displayedDate = self._state === STATES.year ?
                dateUtils.getStartOfYear(displayedDate) : dateUtils.getStartOfMonth(displayedDate);
        },

        isMaskWithDays: function (mask: string) {
            return mask.indexOf('D') !== -1;
        },

        isInputsValid: function (self): Promise<boolean> {
            return self._children.formController.submit().then((results: object) => {
                return !Object.keys(results).find((key) => Array.isArray(results[key]));
            });
        },

        updateValidators: function (self, options?): void {
            _private.updateStartValueValidators(self, options?.startValueValidators);
            _private.updateEndValueValidators(self, options?.endValueValidators);
        },

        updateStartValueValidators(self, validators?: Function[]): void {
            const startValueValidators: Function[] = validators || self._options.startValueValidators;
            self._startValueValidators = getRangeValueValidators(startValueValidators, self._rangeModel, self._rangeModel.startValue);
            ;
        },

        updateEndValueValidators(self, validators?: Function[]): void {
            const endValueValidators: Function[] = validators || self._options.endValueValidators;
            self._endValueValidators = getRangeValueValidators(endValueValidators, self._rangeModel, self._rangeModel.endValue);
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
    _yearsRangeSelectionProcessing: false,

    _dateRangeSelectionProcessing: false,

    _yearStateEnabled: true,
    _monthStateEnabled: true,

    _yearRangeSelectionType: null,

    _mask: null,

    _startValueValidators: null,
    _endValueValidators: null,

    _beforeMount: function (options) {
        /* Опция _displayDate используется только(!) в тестах, чтобы иметь возможность перемотать
         календарь в нужный период, если startValue endValue не заданы. */
        this._displayedDate = dateUtils.getStartOfMonth(options._displayDate ?
            options._displayDate :
            (dateUtils.isValidDate(options.startValue) ?
                options.startValue :
                new Date()));

        this._rangeModel = new DateRangeModel({dateConstructor: options.dateConstructor});
        this._rangeModel.update(options);

        this._startValueValidators = [];
        this._endValueValidators = [];
        _private.updateValidators(this, options);
        this._rangeModel.subscribe('rangeChanged', () => {
            _private.updateValidators(this);
        });

        this._prepareTheme();
        this._headerRangeModel = new DateRangeModel({dateConstructor: options.dateConstructor});
        this._headerRangeModel.update(options);

        this._yearRangeModel = new DateRangeModel({dateConstructor: options.dateConstructor});
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

        this._updateHomeButtonVisible();

        this._headerType = options.headerType;
    },

    _afterUpdate: function (): void {
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

    _toggleStateClick: function (): void {
        _private.toggleState(this);
        this._updateHomeButtonVisible();
    },

    _homeButtonClick: function () {
        this._displayedDate = dateUtils.getStartOfMonth(new Date());
    },

    _updateHomeButtonVisible(): void {
        if ((this._state === STATES.year && this._displayedDate.getFullYear() === new Date().getFullYear()) ||
            (this._state === STATES.month && this._displayedDate.getMonth() === new Date().getMonth() &&
                this._displayedDate.getFullYear() === new Date().getFullYear())) {
            this._homeButtonVisible = false;
        } else {
            this._homeButtonVisible = true;
        }
    },

    _currentDayIntersectHandler: function (event: SyntheticEvent, entry: IntersectionObserverSyntheticEntry): void {
        this._homeButtonVisible = !entry.nativeEntry.isIntersecting;
    },

    _unregisterCurrentDayIntersectHandler: function () {
        // Если в IntersectionObserverContainer, который сделит за сегодняшним днём, происходит событие unregister -
        // значит текущий день точно не отображается. Делаем "Домик" видимым.
        this._homeButtonVisible = true;
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

    _onHeaderLinkRangeChanged: function (e, startValue, endValue) {
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

    _onYearsSelectionHoveredValueChanged: function (e, value) {
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

    _onYearsItemClick: function (e: SyntheticEvent, item: Date): void {
        this._displayedDate = item;
    },

    _monthsRangeChanged: function (e, start, end) {
        _private.rangeChanged(this, start, end ? dateUtils.getEndOfMonth(end) : null);
    },

    _monthsRangeSelectionStarted: function (e, start, end) {
        this._yearsRangeSelectionProcessing = false;
    },

    _monthsSelectionChanged: function (e, start, end) {
        _private.selectionChanged(this, start, end ? dateUtils.getEndOfMonth(end) : null);
    },

    _monthsRangeSelectionEnded: function (e: SyntheticEvent<Event>, start: Date, end: Date): void {
        const endOfMonth: Date = dateUtils.getEndOfMonth(end);
        _private.rangeChanged(this, start, endOfMonth);
        _private.sendResult(this, start, endOfMonth);
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
    _getChildContext: function () {
        return {
            ScrollData: new ScrollData({pagingVisible: false})
        };
    },

    _inputControlHandler: function (event, value, displayValue, selection) {
        if (selection.end === displayValue.length && this._options.selectionType !== IRangeSelectable.SELECTION_TYPES.single) {
            this._children.endValueField.activate({enableScreenKeyboard: true});
        }
    },

    _inputFocusOutHandler: function (event): Promise<boolean> {
        if (this._headerType === this._options.headerType) {
            return;
        }
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
Component._theme = ['Controls/datePopup'];

Component.SELECTION_TYPES = IRangeSelectable.SELECTION_TYPES;
Component.HEADER_TYPES = HEADER_TYPES;
Component._STATES = STATES;

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

        dayTemplate: MonthViewDayTemplate,

        startValueValidators: [],
        endValueValidators: [],

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

export default Component;
