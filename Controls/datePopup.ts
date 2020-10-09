import rk = require('i18n!Controls');
import {SyntheticEvent} from 'Vdom/Vdom';
import BaseControl = require('Core/Control');
import coreMerge = require('Core/core-merge');
import {descriptor, Date as WSDate} from 'Types/entity';
import {IRangeSelectable} from 'Controls/dateRange';
import {DateRangeModel, IDateRangeSelectable} from 'Controls/dateRange';
import {Range, Base as dateUtils} from 'Controls/dateUtils';
import EventProxyMixin from './_datePopup/Mixin/EventProxy';
import periodDialogUtils from './_datePopup/Utils';
import componentTmpl = require('wml!Controls/_datePopup/DatePopup');
import headerTmpl = require('wml!Controls/_datePopup/header');
import dayTmpl = require('wml!Controls/_datePopup/day');
import {MonthViewDayTemplate} from 'Controls/calendar';
import {Controller as ManagerController} from 'Controls/popup';
import {_scrollContext as ScrollData, IntersectionObserverSyntheticEntry} from './scroll';
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {IFontColorStyle} from './interface';
import {ILinkViewControlOptions} from './_dateRange/LinkView';

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

const HEADER_TYPES = {
        link: 'link',
        input: 'input'
};

const STATES = {
        year: 'year',
        month: 'month'
};

const MONTH_STATE_SELECTION_DAYS = 30;
const popupMask = coreMerge({auto: 'auto'}, Range.dateMaskConstants);

export default class DatePopup extends Control implements EventProxyMixin {
    _template: TemplateFunction = componentTmpl;
    _headerTmpl: TemplateFunction = headerTmpl;
    _dayTmpl: TemplateFunction = dayTmpl;
    _defaultDayTemplate: TemplateFunction = MonthViewDayTemplate;

    _rangeModel: object = null;
    _headerRangeModel: object = null;
    _yearRangeModel: object = null;

    _displayedDate: Date = null;

    _HEADER_TYPES: object = HEADER_TYPES;
    _headerType: string = HEADER_TYPES.link;
    _activateInputField: boolean = false;

    _homeButtonVisible: boolean = true;

    _STATES: object = STATES;
    _state: string = STATES.year;

    _monthRangeSelectionProcessing: boolean = false;
    _yearsRangeSelectionProcessing: boolean = false;

    _dateRangeSelectionProcessing: boolean = false;

    _yearStateEnabled: boolean = true;
    _monthStateEnabled: boolean = true;

    _yearRangeSelectionType: object = null;

    _mask = null;

    _startValueValidators = null;
    _endValueValidators = null;

    _beforeMount(options: IControlOptions): void {
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
        this.updateValidators(options);
        this._rangeModel.subscribe('rangeChanged', () => {
            this.updateValidators();
        });

        this._prepareTheme();
        this._headerRangeModel = new DateRangeModel({dateConstructor: options.dateConstructor});
        this._headerRangeModel.update(options);

        this._yearRangeModel = new DateRangeModel({dateConstructor: options.dateConstructor});
        this.updateYearsRangeModel(options.startValue, options.endValue);

        this._monthStateEnabled = periodDialogUtils.isMonthStateEnabled(options);
        this._yearStateEnabled = periodDialogUtils.isYearStateEnabled(options);

        this._state = this.getViewState(options, this._monthStateEnabled, this._yearStateEnabled);
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
    }

    _afterUpdate(): void {
        if (this._activateInputField) {
            this.activate();
            this._activateInputField = false;
        }
    }

    _beforeUnmount(): void {
        this._rangeModel.destroy();
        this._headerRangeModel.destroy();
        this._yearRangeModel.destroy();
    }

    _prepareTheme(): void {
        this._headerTheme = ManagerController.getPopupHeaderTheme();
    }

    _toggleStateClick(): void {
        this.toggleState();
        this._updateHomeButtonVisible();
    }

    _homeButtonClick(): void {
        this._displayedDate = dateUtils.getStartOfMonth(new Date());
    }

    _updateHomeButtonVisible(): void {
        if ((this._state === STATES.year && this._displayedDate.getFullYear() === new Date().getFullYear()) ||
            (this._state === STATES.month && this._displayedDate.getMonth() === new Date().getMonth() &&
                this._displayedDate.getFullYear() === new Date().getFullYear())) {
            this._homeButtonVisible = false;
        } else {
            this._homeButtonVisible = true;
        }
    }

    _currentDayIntersectHandler(event: SyntheticEvent, entry: IntersectionObserverSyntheticEntry): void {
        this._homeButtonVisible = !entry.nativeEntry.isIntersecting;
    }

    _unregisterCurrentDayIntersectHandler(): void {
        // Если в IntersectionObserverContainer, который сделит за сегодняшним днём, происходит событие unregister -
        // значит текущий день точно не отображается. Обновляем состояние домика.
        this._updateHomeButtonVisible();
    }

    _yearsRangeChanged(e: SyntheticEvent, start: Date, end: Date): void {
        this.rangeChanged(start, end ? dateUtils.getEndOfYear(end) : null);
    }

    _headerLinkClick(e: SyntheticEvent): void {
        if (this._headerType === this._HEADER_TYPES.link) {
            this._headerType = this._HEADER_TYPES.input;
            this._activateInputField = true;
        } else {
            this._headerType = this._HEADER_TYPES.link;
        }
    }

    _onHeaderLinkRangeChanged(e: SyntheticEvent, startValue: Date, endValue: Date): void {
        this.rangeChanged(startValue, endValue);
    }

    _startValuePickerChanged(e: SyntheticEvent, value: Date): void {
        this.rangeChanged(
            value,
            this._options.selectionType === IRangeSelectable.SELECTION_TYPES.single ? value : this._rangeModel.endValue
        );
    }

    _endValuePickerChanged(e: SyntheticEvent, value: Date): void {
        let startValue = this._rangeModel.startValue,
            endValue = value;
        if (this._options.selectionType === IRangeSelectable.SELECTION_TYPES.single) {
            startValue = value;
        } else if (dateUtils.isValidDate(value) && !this.isMaskWithDays(this._mask)) {
            endValue = dateUtils.getEndOfMonth(value);
        }
        this.rangeChanged(startValue, endValue);
    }

    _yearsSelectionChanged(e: SyntheticEvent, start: Date, end: Date): void {
        const endYear = end ? dateUtils.getEndOfYear(end) : null;
        this.selectionChanged(start, endYear);
        this._rangeModel.startValue = start;
        this._rangeModel.endValue = endYear;
    }

    _onYearsSelectionHoveredValueChanged(e: SyntheticEvent, value: Date): void {
        // We update the displayed date only during the selection process.
        if (value) {
            this._displayedDate = value;
        }
    }

    _yearsSelectionStarted(e: SyntheticEvent, start: Date, end: Date): void {
        this._monthRangeSelectionProcessing = false;
    }

    _yearsRangeSelectionEnded(e: SyntheticEvent, start: Date, end: Date): void {
        this.sendResult(start, dateUtils.getEndOfYear(end));
    }

    _onYearsItemClick(e: SyntheticEvent, item: Date): void {
        this._displayedDate = item;
    }

    _monthsRangeChanged(e: SyntheticEvent, start: Date, end: Date): void {
        this.rangeChanged(start, end ? dateUtils.getEndOfMonth(end) : null);
    }

    _monthsRangeSelectionStarted(e: SyntheticEvent, start: Date, end: Date): void {
        this._yearsRangeSelectionProcessing = false;
    }

    _monthsSelectionChanged(e: SyntheticEvent, start: Date, end: Date): void {
        this.selectionChanged(start, end ? dateUtils.getEndOfMonth(end) : null);
    }

    _monthsRangeSelectionEnded(e: SyntheticEvent<Event>, start: Date, end: Date): void {
        const endOfMonth: Date = dateUtils.getEndOfMonth(end);
        this.rangeChanged(start, endOfMonth);
        this.sendResult(start, endOfMonth);
    }

    _monthRangeMonthClick(e: SyntheticEvent, date: Date): void {
        this.toggleState(date);
    }

    _monthRangeFixedPeriodClick(e: SyntheticEvent, start: Date, end: Date): void {
        this.fixedPeriodClick(start, end);
    }

    _dateRangeChanged(e: SyntheticEvent, start: Date, end: Date): void {
        this.rangeChanged(start, end);
        this._monthRangeSelectionProcessing = false;
    }

    _dateRangeSelectionChanged(e: SyntheticEvent, start: Date, end: Date): void {
        this.selectionChanged(start, end);
    }

    _dateRangeSelectionEnded(e: SyntheticEvent, start: Date, end: Date): void {
        this.sendResult(start, end);
    }

    _dateRangeFixedPeriodClick(e: SyntheticEvent, start: Date, end: Date): void {
        this.fixedPeriodClick(start, end);
    }

    _applyClick(e: SyntheticEvent): Promise<void> {
        return this.isInputsValid().then((valid: boolean) => {
            if (valid) {
                this.sendResult();
            }
        });
    }

    _closeClick(): void {
        this._notify('close');
    }

    _getChildContext(): object {
        return {
            ScrollData: new ScrollData({pagingVisible: false})
        };
    }

    _inputControlHandler(event: SyntheticEvent, value: Date, displayValue: Date, selection: any): void {
        if (selection.end === displayValue.length &&
            this._options.selectionType !== IRangeSelectable.SELECTION_TYPES.single) {
            this._children.endValueField.activate({enableScreenKeyboard: true});
        }
    }

    _inputFocusOutHandler(event: SyntheticEvent): Promise<boolean> {
        if (this._headerType === this._options.headerType) {
            return;
        }
        return new Promise((resolve) => {
            if (!this._children.inputs.contains(event.nativeEvent.relatedTarget)) {
                return this.isInputsValid().then((valid: boolean) => {
                    if (valid) {
                        this._headerType = this._options.headerType;
                    }
                    resolve(valid);
                });
            }
            resolve(false);
        });
    }

    fixedPeriodClick(start: Date, end: Date): void {
        this.rangeChanged(start, end);
        this._monthRangeSelectionProcessing = false;
        this.sendResult(start, end);
    }

    selectionChanged(start: Date, end: Date): void {
        this._headerRangeModel.startValue = start;
        this._headerRangeModel.endValue = end;
    }

    rangeChanged(start: Date, end: Date): void {
        this._rangeModel.startValue = start;
        this._rangeModel.endValue = end;
        this._headerRangeModel.startValue = start;
        this._headerRangeModel.endValue = end;
        this.updateYearsRangeModel(start, end);
    }

    updateYearsRangeModel(start: Date, end: Date): void {
        if (dateUtils.isStartOfYear(start) && dateUtils.isEndOfYear(end)) {
            this._yearRangeModel.startValue = start;
            this._yearRangeModel.endValue = end;
        } else {
            this._yearRangeModel.startValue = null;
            this._yearRangeModel.endValue = null;
        }
    }

    sendResult(start: Date, end: Date): void {
        this._notify(
            'sendResult',
            [start || this._rangeModel.startValue, end || this._rangeModel.endValue],
            {bubbling: true}
        );
    }

    getViewState(options: IControlOptions, monthStateEnabled: boolean, yearStateEnabled: boolean): string {
        if (monthStateEnabled) {
            if (yearStateEnabled) {
                if (((dateUtils.isValidDate(options.startValue) && dateUtils.isValidDate(options.endValue)) &&
                    (!dateUtils.isStartOfMonth(options.startValue) || !dateUtils.isEndOfMonth(options.endValue)) &&
                    Range.getPeriodLengthInDays(options.startValue, options.endValue) <= MONTH_STATE_SELECTION_DAYS)) {
                    return STATES.month;
                }
            } else {
                return STATES.month;
            }
        }
        return STATES.year;
    }

    toggleState(date?: Date): void {
        this._state = this._state === STATES.year ? STATES.month : STATES.year;

        const displayedDate = date || this._options.startValue || this._options.endValue || new Date();
        this._displayedDate = this._state === STATES.year ?
            dateUtils.getStartOfYear(displayedDate) : dateUtils.getStartOfMonth(displayedDate);
    }

    isMaskWithDays(mask: string): boolean {
        return mask.indexOf('D') !== -1;
    }

    isInputsValid(): Promise<boolean> {
        return this._children.formController.submit().then((results: object) => {
            return !Object.keys(results).find((key) => Array.isArray(results[key]));
        });
    }

    updateValidators(options?: IControlOptions): void {
        this.updateStartValueValidators(options?.startValueValidators);
        this.updateEndValueValidators(options?.endValueValidators);
    }

    updateStartValueValidators(validators?: Function[]): void {
        const startValueValidators: Function[] = validators || this._options.startValueValidators;
        this._startValueValidators = Range.getRangeValueValidators(startValueValidators, this._rangeModel, this._rangeModel.startValue);
    }

    updateEndValueValidators(validators?: Function[]): void {
        const endValueValidators: Function[] = validators || this._options.endValueValidators;
        this._endValueValidators = Range.getRangeValueValidators(endValueValidators, this._rangeModel, this._rangeModel.endValue);
    }

    static _theme: string[] = ['Controls/datePopup'];

    static getDefaultOptions(): object {
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
            endValueValidators: []
        }, IRangeSelectable.getDefaultOptions());
    }

    static getOptionTypes(): object {
        return coreMerge({
            headerType: descriptor(String).oneOf([
                HEADER_TYPES.link,
                HEADER_TYPES.input
            ])
        }, IDateRangeSelectable.getOptionTypes());
    }
}
