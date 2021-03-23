import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_datePopup/MonthsRangeItem';
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import {MonthModel as modelViewModel} from 'Controls/calendar';
import {
    IDateRangeSelectable,
    rangeSelection as rangeSelectionUtils,
    keyboardPeriodController
} from 'Controls/dateRange';
import {Base as dateUtils} from 'Controls/dateUtils';
import {constants} from 'Env/Env';
import * as coreMerge from 'Core/core-merge';
import * as isEmpty from 'Core/helpers/Object/isEmpty';

/**
 * Item for the period selection component of multiple months.
 *
 * @class Controls/_datePopup/MonthsRangeItem
 * @extends UI/Base:Control
 *
 * @author Красильников А.С.
 * @private
 */

const SELECTION_VIEW_TYPES = {
    days: 'days',
    months: 'months'
};

const MONTHS_RANGE_CSS_CLASS_PREFIX: string = 'controls-PeriodDialog-MonthsRange__';

export default class MonthsRangeItem extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _monthViewModel: modelViewModel = modelViewModel;
    protected _SELECTION_VIEW_TYPES: string = SELECTION_VIEW_TYPES;
    protected _FULL_HALF_YEAR: string = formatDate.FULL_HALF_YEAR;
    protected  _FULL_QUATER: string =  formatDate.FULL_QUATER;
    protected _quarterHovered: boolean;
    protected _halfYearHovered: boolean;
    protected _selectionViewType: string;
    protected _months: number[];
    protected _yearStructure: object[] = [{
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
    }];
    protected _formatDate: Function = formatDate;
    protected _quarterSelectionEnabled: boolean = true;
    protected _monthsSelectionEnabled: boolean = true;
    private _halfyearSelectionEnabled: boolean = true;
    private _yearSelectionEnabled: boolean = true;
    private _hoveredItem: WSDate;
    private _baseHoveredItem: WSDate;

    protected _beforeMount(options): void {
        const year = options.date.getFullYear();
        this._selectionViewType = options.selectionViewType;
        if (options.readOnly || options.selectionType === IDateRangeSelectable.SELECTION_TYPES.single ||
            options.selectionType === IDateRangeSelectable.SELECTION_TYPES.disable) {
            this._monthsSelectionEnabled = false;
            this._quarterSelectionEnabled = false;
            this._halfyearSelectionEnabled = false;
            this._yearSelectionEnabled = false;
        } else if (options.ranges && !isEmpty(options.ranges)) {
            this._monthsSelectionEnabled = 'months' in options.ranges;
            this._quarterSelectionEnabled = 'quarters' in options.ranges;
            this._halfyearSelectionEnabled = 'halfyears' in options.ranges;
            this._yearSelectionEnabled = 'years' in options.ranges;
        }
        this._months = [];
        for (let i = 0; i < 12; i++) {
            this._months.push(new WSDate(year, i, 1));
        }
    }

    protected _beforeUpdate(options): void {
        if (this._options.selectionViewType !== options.selectionViewType) {
            this._selectionViewType = options.selectionViewType;
        }
    }

    protected _proxyEvent(event): void {
        this._notify(event.type, Array.prototype.slice.call(arguments, 1));
    }

    protected _onQuarterClick(e, date): void {
        if (this._quarterSelectionEnabled) {
            this._selectionViewType = SELECTION_VIEW_TYPES.months;
            this._notify('selectionViewTypeChanged', [this._selectionViewType]);
            const ranges = this._calculateRangeSelectedCallback(date, dateUtils.getEndOfQuarter(date));
            this._notify('fixedPeriodClick', ranges);
        }
    }

    protected _onQuarterMouseEnter(e, index): void {
        if (this._quarterSelectionEnabled) {
            this._quarterHovered = index;
        }
    }

    protected _onQuarterMouseLeave(): void {
        if (this._quarterSelectionEnabled) {
            this._quarterHovered = null;
        }
    }

    protected _onHalfYearClick(e, date): void {
        if (this._halfyearSelectionEnabled) {
            this._selectionViewType = SELECTION_VIEW_TYPES.months;
            this._notify('selectionViewTypeChanged', [this._selectionViewType]);
            const ranges = this._calculateRangeSelectedCallback(date, dateUtils.getEndOfHalfyear(date));
            this._notify('fixedPeriodClick', ranges);
        }
    }

    protected _onHalfYearMouseEnter(e, index): void {
        if (this._halfyearSelectionEnabled) {
            this._halfYearHovered = index;
        }
    }

    protected _onHalfYearMouseLeave(): void {
        if (this._halfyearSelectionEnabled) {
            this._halfYearHovered = null;
        }
    }

    protected _onMonthTitleClick(e, date): void {
        if (this._monthsSelectionEnabled && !this._options.selectionProcessing && this._options.monthClickable) {
            this._selectionViewType = SELECTION_VIEW_TYPES.months;
            this._notify('selectionViewTypeChanged', [this._selectionViewType]);

            this._notify('itemClick', [date]);
        }
    }

    protected _onMonthTitleMouseEnter(e, date): void {
        if (!this._options.selectionProcessing) {
            this._notify('itemMouseEnter', [date]);
        }
    }

    protected _onMonthTitleMouseLeave(e, date): void {
        if (!this._options.selectionProcessing && this._options.monthClickable) {
            this._notify('itemMouseLeave', [date]);
        }
    }

    protected _onMonthBodyClick(e, date): void {
        if (!this._options.selectionProcessing && this._options.monthClickable) {
            this._notify('monthClick', [date]);
        }
    }

    protected _onMonthClick(e, date): void{
        this._baseHoveredItem = date;
        this._hoveredItem = this._baseHoveredItem;
        this._chooseMonth(date);
    }

    protected _onMonthMouseEnter(e, date): void {
        if (this._options.selectionProcessing || !this._options.monthClickable) {
            this._hoveredItem = date;
            this._notify('itemMouseEnter', [date]);
        }
    }

    protected _onMonthMouseLeave(e, date): void {
        if (this._options.selectionProcessing || !this._options.monthClickable) {
            this._hoveredItem = this._baseHoveredItem;
            this._notify('itemMouseLeave', [date]);
        }
    }

    protected _onMonthKeyDown(event: Event, item: Date): void {
        const hoveredItem = this._hoveredItem || item;
        const keyCode = event.nativeEvent.keyCode;
        if (this._options.selectionProcessing || !this._options.monthClickable) {
            if (event.nativeEvent.keyCode === constants.key.enter) {
                this._chooseMonth(hoveredItem);
            }
            if (hoveredItem && this._options.selectionType !== 'quantum') {
                const newHoveredItem = keyboardPeriodController(keyCode, hoveredItem, 'months');
                if (newHoveredItem) {
                    const elementToFocus = document.querySelector(
                        `.controls-PeriodDialog-MonthsRange__item[data-date="${this._dateToDataString(newHoveredItem)}"]`
                    );
                    elementToFocus?.focus();
                    this._hoveredItem = newHoveredItem;
                    this._notify('itemMouseEnter', [newHoveredItem]);
                    event.preventDefault();
                }
            }
        }
    }

    protected _dateToDataString(date: Date): string {
        return formatDate(date, 'YYYY-MM-DD');
    }

    protected  _prepareItemClass(itemValue): string {
        const css = [];
        const startValue = this._options.startValue;
        const endValue = this._options.endValue;
        if (rangeSelectionUtils.isSelected(itemValue, startValue, endValue, this._options.selectionProcessing,
            this._options.selectionBaseValue, this._options.selectionHoveredValue) &&
            this._selectionViewType === SELECTION_VIEW_TYPES.months) {
            css.push('controls-PeriodDialog-MonthsRange__item-selected');
            css.push('controls-PeriodDialog-MonthsRange__item-selected_theme-' + this._options.theme);
        } else {
            css.push('controls-PeriodDialog-MonthsRange__item-unselected');
            css.push('controls-PeriodDialog-MonthsRange__item-unselected_theme-' + this._options.theme);
        }

        if (this._selectionViewType === SELECTION_VIEW_TYPES.months) {
            css.push(rangeSelectionUtils.prepareSelectionClass(
                itemValue,
                startValue,
                endValue,
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
    }

    private _calculateRangeSelectedCallback(startValue, endValue): Date[] {
        if (this._options.rangeSelectedCallback) {
            const ranges = this._options.rangeSelectedCallback(startValue, endValue);
            startValue = ranges[0];
            endValue = ranges[1];
        }
        return [startValue, endValue];
    }
    private _chooseMonth(date: Date): void {
        if (this._options.selectionProcessing || !this._options.monthClickable) {
            this._selectionViewType = SELECTION_VIEW_TYPES.months;
            this._notify('selectionViewTypeChanged', [this._selectionViewType]);
            this._notify('itemClick', [date]);
        }
    }

    static SELECTION_VIEW_TYPES: object = SELECTION_VIEW_TYPES;

    static getDefaultOptions(): object {
        return coreMerge({
            selectionViewType: SELECTION_VIEW_TYPES.days
        }, {} /*IPeriodSimpleDialog.getDefaultOptions()*/);
    }
}

Object.defineProperty(MonthsRangeItem, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return MonthsRangeItem.getDefaultOptions();
    }
});
