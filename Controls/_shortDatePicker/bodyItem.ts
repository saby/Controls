import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {date as formatDate} from 'Types/formatter';
import {Base as dateUtils} from 'Controls/dateUtils';
import itemMonthsTmpl = require('wml!Controls/_shortDatePicker/ItemMonths');
import MonthCaption = require('wml!Controls/_shortDatePicker/MonthCaption');
import itemFullTmpl = require('wml!Controls/_shortDatePicker/ItemFull');
import itemQuartersTmpl = require('wml!Controls/_shortDatePicker/ItemQuarters');
import {Date as WSDate} from 'Types/entity';
import {IDateConstructor, IDateConstructorOptions} from 'Controls/interface';

interface IShortDatePickerOptions extends IControlOptions, IDateConstructorOptions {
    currentYear?: number;
}

const MONTHS_IN_HALFYEAR = 6;
const MONTHS_IN_QUARTER = 3;

/**
 * Контрол, отвечающий за отображение центральной части в окне Быстрого выбора периода.
 * Отображение определяется значениями опций chooseHalfyears, chooseQuarters, chooseMonths, chooseYears.
 * @private
 * @author Красильников А.С.
 */

class BodyItem extends Control<IShortDatePickerOptions> implements IDateConstructor {
    readonly '[Controls/_interface/IDateConstructor]': boolean = true;
    protected _template: TemplateFunction = itemMonthsTmpl;
    protected monthCaptionTemplate: TemplateFunction = MonthCaption;

    protected _yearModel: object[];

    protected _halfYearHovered: number;
    protected _quarterHovered: number;

    protected _formatDate: Function = formatDate;

    protected _beforeMount(options: IShortDatePickerOptions): void {
        this._template = this._getItemTmplByType(options);
        this._yearModel = this._getYearModel(options.currentYear, options.dateConstructor);
    }

    protected _beforeUpdate(newOptions: IShortDatePickerOptions): void {
        this._yearModel = this._getYearModel(newOptions.currentYear, newOptions.dateConstructor);
    }

    protected _getItemTmplByType(options: IShortDatePickerOptions): TemplateFunction {
        if (options.chooseHalfyears && options.chooseQuarters && options.chooseMonths) {
            return itemFullTmpl;
        } else if (options.chooseMonths) {
            return itemMonthsTmpl;
        } else if (options.chooseQuarters) {
            return itemQuartersTmpl;
        }
    }

    protected _getYearModel(year: number, dateConstructor: IDateConstructor): object[] {
        const numerals = ['I', 'II', 'III', 'IV'];
        const halfYearsList = [];

        for (let halfYear = 0; halfYear < 2; halfYear++) {
            const quartersList = [];
            for (let i = 0; i < 2; i++) {
                const monthsList = [];
                const quarter = halfYear * 2 + i;
                const quarterMonth = quarter * MONTHS_IN_QUARTER;
                for (let j = 0; j < MONTHS_IN_QUARTER; j++) {
                    const month = quarterMonth + j;
                    monthsList.push({
                        date: new dateConstructor(year, month, 1),
                        tooltip: formatDate(new Date(year, month, 1), formatDate.FULL_MONTH)
                    });
                }
                quartersList.push({
                    name: numerals[quarter],
                    number: quarter,
                    fullName: formatDate(new Date(year, quarterMonth, 1), 'QQQQr'),
                    tooltip: formatDate(new Date(year, quarterMonth, 1), formatDate.FULL_QUATER),
                    months: monthsList
                });
            }
            halfYearsList.push({
                name: numerals[halfYear],
                number: halfYear,
                tooltip: formatDate(new Date(year, halfYear * MONTHS_IN_HALFYEAR, 1), formatDate.FULL_HALF_YEAR),
                quarters: quartersList
            });
        }
        return halfYearsList;
    }

    protected _onQuarterMouseEnter(event: Event, quarter: number): void {
        this._quarterHovered = quarter;
    }

    protected _onQuarterMouseLeave(): void {
        this._quarterHovered = null;
    }

    protected _onHalfYearMouseEnter(event: Event, halfYear: number): void {
        this._halfYearHovered = halfYear;
    }

    protected _onHalfYearMouseLeave(): void {
        this._halfYearHovered = null;
    }

    protected _onHeaderClick(): void {
        this._notify('close', [], {bubbling: true});
    }

    protected _onYearClick(event: Event, year: number): void {
        const lastMonth: number = 11;
        const lastDay: number = 31;
        if (this._options.chooseYears) {
            this._notify(
                'sendResult',
                [new this._options.dateConstructor(year, 0, 1), new WSDate(year, lastMonth, lastDay )],
                {bubbling: true});
        }
    }

    protected _onHalfYearClick(event: Event, halfYear: number, year: number): void {
        const start = new this._options.dateConstructor(year, halfYear * MONTHS_IN_HALFYEAR, 1);
        const end = new this._options.dateConstructor(year, (halfYear + 1) * MONTHS_IN_HALFYEAR, 0);
        this._notify('sendResult', [start, end], {bubbling: true});
    }

    protected _onQuarterClick(event: Event, quarter: number, year: number): void {
        const start = new this._options.dateConstructor(year, quarter * MONTHS_IN_QUARTER, 1);
        const end = new this._options.dateConstructor(year, (quarter + 1) * MONTHS_IN_QUARTER, 0);
        this._notify('sendResult', [start, end], {bubbling: true});
    }

    protected _onMonthClick(event: Event, month: Date): void {
        this._notify('sendResult', [month, dateUtils.getEndOfMonth(month)], {bubbling: true});
    }

    static _theme: string[] = ['Controls/shortDatePicker'];

    static getDefaultOptions(): IShortDatePickerOptions {
        return {
            dateConstructor: WSDate
        };
    }
}

export default BodyItem;
