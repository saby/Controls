import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import {detection} from 'Env/Env';
import {Date as WSDate, descriptor} from 'Types/entity';
import {default as IPeriodSimpleDialog, IDateLitePopupOptions} from './IDateLitePopup';
import {Base as dateUtils} from 'Controls/dateUtils';
import componentTmpl = require('wml!Controls/_shortDatePicker/DateLitePopup');
import listTmpl = require('wml!Controls/_shortDatePicker/List');
import ItemWrapper = require('wml!Controls/_shortDatePicker/ItemWrapper');
import {date as formatDate} from 'Types/formatter';
import monthTmpl = require('wml!Controls/_shortDatePicker/monthTemplate');
import {Logger} from 'UI/Utils';
import {Utils as dateControlsUtils} from 'Controls/dateRange';

const enum POSITION {
    RIGHT = 'right',
    LEFT = 'left'
}

// Минимальный отступ справа до края экрана. Если попап ближе чем это значение, то крестик нужно показать слева
// Когда в контролах будут доступны переменные темы, значение должно браться с алиаса ширины крестика
const MIN_RIGHT_OFFSET = 30;
const MAX_VISIBLE_YEARS = 14;

/**
 * Контрол выбора даты или периода.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_shortDatePicker.less переменные тем оформления}
 *
 * @class Controls/shortDatePicker
 * @extends UI/Base:Control
 * @mixes Controls/shortDatePicker/IDateLitePopup
 * @mixes Controls/_interface/IDisplayedRanges
 * @mixes Controls/_dateRange/interfaces/ICaptionFormatter
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/ShortDatePicker/Index
 * @demo Controls-demo/ShortDatePicker/Source/Index
 * @demo Controls-demo/ShortDatePicker/DisplayedRanges/Index
 * @demo Controls-demo/ShortDatePicker/MonthTemplate/ContentTemplate/Index
 * @demo Controls-demo/ShortDatePicker/MonthTemplate/IconTemplate/Index
 */

class View extends Control<IDateLitePopupOptions> {
    protected _template: TemplateFunction = componentTmpl;
    protected _defaultListTemplate: TemplateFunction = listTmpl;
    protected _position: Date;
    protected _yearHovered: Date;
    protected _range: Date[];
    protected _isFullPicker: boolean = false;
    protected _limit: number = 15;
    protected _isExpandedPopup: boolean = false;
    protected _isExpandButtonVisible: boolean = true;
    protected _closeBtnPosition: POSITION = POSITION.RIGHT;
    protected _emptyCaption: string = '';
    protected _caption: string = '';
    protected _displayedRanges: Date[];
    protected _prevArrowButtonReadOnly: boolean = false;
    protected _nextArrowButtonReadOnly: boolean = false;

    protected _beforeMount(options: IDateLitePopupOptions): void {
        this._isFullPicker = options.chooseMonths && options.chooseQuarters && options.chooseHalfyears;
        if (!options.emptyCaption) {
            if (options.chooseMonths && (options.chooseQuarters || options.chooseHalfyears)) {
                this._emptyCaption = rk('Период не указан');
            } else {
                this._emptyCaption = rk('Не указан');
            }
        }
        this._caption = options.captionFormatter(options.startValue, options.endValue, options.emptyCaption);

        if (!(options.chooseQuarters && options.chooseMonths) && options.chooseHalfyears) {
            Logger.error(
                'shortDatePicker: Для корректного отображения контрола, при включенной опции отображения полугодий' +
                '(chooseHalfyears) необходимо также включить опции для отображения кварталов (chooseQuarters) ' +
                'и месяцев (chooseMonths)',
                this);
        }

        if (options.chooseQuarters || options.chooseMonths || options.chooseHalfyears) {
            this._position = options.year || options.startValue || (new options.dateConstructor());
        } else {
            this._position = this._getYearListPosition(options, options.dateConstructor);
        }
        if (options.range) {
            Logger.error('shortDatePicker: ' +
                rk('You should use displayedRanges option instead of range option.'), this);
        }
        this._displayedRanges = options.displayedRanges || options.range;

        this._position = this._getFirstPositionInMonthList(this._position, options.dateConstructor);
        this._isExpandButtonVisible = this._getExpandButtonVisibility(options);

        if (options.displayedRanges) {
            this._updateArrowButtonsState();
        }
    }

    protected _beforeUpdate(options: IDateLitePopupOptions): void {
        this._isExpandButtonVisible = this._getExpandButtonVisibility(options);
        this._updateCloseBtnPosition(options);
        if (options.displayedRanges) {
            this._updateArrowButtonsState();
        }
    }

    /**
     * Sets the current year
     * @param year
     */
    setYear(year: number): void {
        this._position = new this._options.dateConstructor(year, 0, 1);
        this._notify('yearChanged', [year]);
    }

    protected _getFirstPositionInMonthList(srcPosition: Date, dateConstructor: Function): Date {
        if (!this._displayedRanges) {
            return srcPosition;
        }

        const calcDisplayedPositionByDelta = (delta) => {
            let tempPosition;
            while (countDisplayedRanges < this._limit) {
                checkingPosition = this._shiftRange(checkingPosition, delta, dateConstructor);
                if (!this._isDisplayed(checkingPosition)) {
                    const period = this._getHiddenPeriod(checkingPosition, dateConstructor);
                    tempPosition = delta > 0 ? period[1] : period[0];
                    if (!tempPosition) {
                        break;
                    }
                } else {
                    lastDisplayedPosition = new Date(checkingPosition.getTime());
                    countDisplayedRanges++;
                }
            }
        };

        let countDisplayedRanges = 1;
        let lastDisplayedPosition = new Date(srcPosition.getTime());
        let checkingPosition = new Date(srcPosition.getTime());

        // Вначале от изначальной даты идём вниз (напр. от 2020 к 2019, 2018 и тд)
        calcDisplayedPositionByDelta(-1);
        // Восстаналиваем начальную позицию и идем от даты вверх (напр. от 2020 к 2021, 2022 и тд)
        checkingPosition = new Date(srcPosition.getTime());
        calcDisplayedPositionByDelta(1);

        return lastDisplayedPosition;
    }

    protected _shiftRange(date: Date, delta: number, dateConstructor: Function): Date {
        return new dateConstructor(date.getFullYear() + delta, 0);
    }

    // Получить неотображаемый период в который попадает переданная дата
    protected _getHiddenPeriod(date: Date, dateConstructor: Function): Date[] {
        let range: Date[] = [];
        for (let i = 0; i < this._displayedRanges.length; i++) {
            range = this._displayedRanges[i];
            if (date < range[0]) {
                const startHiddenPeriod = i === 0 ? null :
                    this._shiftRange(this._displayedRanges[i - 1][1], 1, dateConstructor);
                const endHiddenPeriod = this._shiftRange(range[0], -1, dateConstructor);
                return [startHiddenPeriod, endHiddenPeriod];
            }
        }
        return [range[1] ? this._shiftRange(range[1], 1, dateConstructor) : date, null];
    }

    protected _isDisplayed(date: Date): boolean {
        if (!this._displayedRanges || !this._displayedRanges.length) {
            return true;
        }

        for (let i = 0; i < this._displayedRanges.length; i++) {
            if (this._hitsDisplayedRange(date.getFullYear(), i)) {
                return true;
            }
        }
        return false;
    }

    protected _getExpandButtonVisibility(options: IDateLitePopupOptions): boolean {
        // options.stickyPosition может не быть, если shortDatePicker:View используется отдельно
        // от dateRange:RangeShortSelector
        if (detection.isMobilePlatform) {
            return false;
        }

        if (options.stickyPosition) {
            const openerTop = options.stickyPosition.targetPosition?.top;
            const popupTop = options.stickyPosition.position?.top + Math.abs(options.stickyPosition.margins?.top);
            return openerTop === popupTop;
        }
    }

    protected _updateCloseBtnPosition(options: IDateLitePopupOptions): void {
        if (options.stickyPosition) {
            // если вызывающий элемент находится в левой части экрана, то крестик всегда позиционируем справа
            if (options.stickyPosition.targetPosition.left <  this.getWindowInnerWidth() / 2) {
                this._closeBtnPosition =  POSITION.RIGHT;
            } else {
                const openerLeft = options.stickyPosition.targetPosition.left;
                const popupLeft = options.stickyPosition.position.left;
                // Вычисляем смещения попапа влево, т.к окно выравнивается по центру открывающего элемента
                const popupOffset = (options.stickyPosition.sizes.width -
                    options.stickyPosition.targetPosition.width) / 2;
                const isReverted = (popupLeft + popupOffset) !== openerLeft;
                const isOutside = popupLeft + options.stickyPosition.sizes.width >
                    window?.innerWidth - MIN_RIGHT_OFFSET;
                this._closeBtnPosition = isReverted || isOutside ? POSITION.LEFT : POSITION.RIGHT;
            }
        }
    }

    protected _dateToDataString(date: Date): string {
        return formatDate(date, 'YYYY-MM-DD');
    }

    protected _onYearMouseEnter(event: Event, year: Date): void {
        if (this._options.chooseYears) {
            this._yearHovered = year;
        }
    }

    protected _hitsDisplayedRange(year: number, index: number): boolean {
        const date = new Date(year, 0);
        // Проверяем второй элемент массива на null. Если задан null в опции displayedRanges
        // то лента будет отображаться бесконечно.
        return this._displayedRanges[index][0] <= date &&
            (this._displayedRanges[index][1] === null || this._displayedRanges[index][1] >= date);
    }

    protected _getNextDisplayedYear(year: number, delta: number): number {
        if (!this._displayedRanges) {
            return year + delta;
        }
        let index;
        // Ищем массив в котором находится year.
        for (let i = 0; i < this._displayedRanges.length; i++) {
            if (this._hitsDisplayedRange(year, i)) {
                index = i;
                break;
            }
        }
        // Если мы попали за границы displayedRanges, берем за основу вычислений ближайший элемент снизу.
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
        // Проверяем год, на который переходим. Если оне не попадает в тот же массив что и year - ищем ближайших год на
        // который можно перейти в следующем массиве
        if (this._hitsDisplayedRange(year + delta, index)) {
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
    }

    protected _changeYear(event: Event, delta: number): void {
        const year = this._position.getFullYear();
        let newYear;
        if (this._options.displayedRanges) {
            const amountOfFollowingItems = this._getAmountOfFollowingItems(delta);
            // Ищем последний видимый элемент
            // В случае, если мы лисаем 'Вверх', мы просто устаналиваем ближайший доступный год
            if (this._canChangeYear(year, delta, amountOfFollowingItems) || !amountOfFollowingItems) {
                newYear = this._getNextDisplayedYear(year, delta);
            }
        } else {
            newYear = year + delta;
        }
        if (newYear && newYear !== year) {
            this.setYear(newYear);
        }
    }

    private _canChangeYear(year: number, delta: number, amountOfFollowingItems: number): boolean {
        let changedYear = year;
        const yearsNotEqual = () => {
            return changedYear !== this._getNextDisplayedYear(changedYear, delta);
        };

        let index = 0;
        while (yearsNotEqual() && index < amountOfFollowingItems) {
            changedYear = this._getNextDisplayedYear(changedYear, delta);
            index++;
        }
        return yearsNotEqual();
    }

    // Количество элементов, которые нахоятся ниже текущего года, но так же видны
    private _getAmountOfFollowingItems(delta: number): number {
        let amountOfFollowingItems = 0;
        // В режиме 'Только года' элементы строются снизу вверх по возрастанию, а во всех остальных типах - сверху вниз,
        // отсюда и разница в дельтах
        if (delta === 1) {
            if (!this._options.chooseHalfyears && this._options.chooseQuarters) {
                // Помимо текущего года, в режиме 'Только кварталы' отображаются еще 2 года снизу.
                amountOfFollowingItems = 2;
            } else if (this._options.chooseMonths) {
                // Помимо текущего года, в режиме 'Только месяцы' и 'Месяцы, кварталы и полугодия'
                // отображается еще 1 год снизу.
                amountOfFollowingItems = 1;
            }
        } else {
            if (!this._options.chooseMonths && !this._options.chooseHalfyears && !this._options.chooseQuarters) {
                // Помимо текущего года, в режиме 'Только года' отображаются еще 14 лет снизу.
                amountOfFollowingItems = MAX_VISIBLE_YEARS;
            }
        }
        return amountOfFollowingItems;
    }

    _updateArrowButtonsState(): void {
        const buttons = {
            arrowDown: {
                delta: 1,
                name: '_nextArrowButtonReadOnly'
            },
            arrowUp: {
                delta: -1,
                name: '_prevArrowButtonReadOnly'
            }
        };
        for (const i in buttons) {
            if (buttons.hasOwnProperty(i)) {
                const amountOfFollowingItems = this._getAmountOfFollowingItems(buttons[i].delta);
                this[buttons[i].name] = !this._canChangeYear(
                    this._position.getFullYear(),
                    buttons[i].delta,
                    amountOfFollowingItems
                );
            }
        }
    }

    protected _onYearMouseLeave(): void {
        this._yearHovered = null;
    }

    protected _expandPopup(): void {

        let fittingMode;
        if (!this._isExpandButtonVisible || !this._options.stickyPosition) {
            return;
        }

        this._isExpandedPopup = !this._isExpandedPopup;

        if (this._isExpandedPopup) {
            fittingMode = 'fixed';
        } else {
            fittingMode = 'overflow';
        }
        this._notify('sendResult', [fittingMode]);
    }

    protected _onHeaderClick(): void {
        this._notify('close', [], {bubbling: true});
    }

    protected _onYearClick(event: Event, year: Date): void {
        const lastMonth: number = 11;
        const lastDay: number = 31;
        if (this._options.chooseYears) {
            this._notify('sendResult',
                [new this._options.dateConstructor(year, 0, 1),
                    new this._options.dateConstructor(year, lastMonth, lastDay)], {bubbling: true});
        }
    }

    protected _getSizeCssClass(data: string): string {
        if (this._options.chooseHalfyears) {
            return 'controls-PeriodLiteDialog__' + data + '-big_theme-' + this._options.theme;
        }
        if (this._options.chooseQuarters || this._options.chooseMonths) {
            return 'controls-PeriodLiteDialog__' + data + '-medium_theme-' + this._options.theme;
        }
        return 'controls-PeriodLiteDialog__' + data + '-small_theme-' + this._options.theme;
    }

    protected _getListCssClasses(): string {
        if (this._options.chooseHalfyears) {
            return 'controls-PeriodLiteDialog-item controls-PeriodLiteDialog__fullYear-list_theme-' +
                this._options.theme;
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
    }

    protected _getYearWrapperCssClasses(): string {
        if (this._options.chooseHalfyears) {
            return 'controls-PeriodLiteDialog__yearWrapper__fullYear';
        }
        if (this._options.chooseQuarters || this._options.chooseMonths) {
            return 'controls-PeriodLiteDialog__yearWrapper__quarters-months';
        }
        return '';
    }

    protected _getYearCssClasses(): string {
        const css: string[] = [];
        if (this._options.chooseYears) {
            css.push('controls-PeriodLiteDialog__year-clickable');
        }
        if (this._options.chooseMonths && this._options.chooseQuarters && this._options.chooseHalfyears) {
            css.push('controls-PeriodLiteDialog__year-medium_theme-' + this._options.theme);
        } else if (this._options.chooseMonths) {
            css.push('controls-PeriodLiteDialog__year-center-lite');
        }
        return css.join(' ');
    }

    protected _getYearItemCssClasses(year: number): string {
        const css: string[] = [];
        const date = this._options.startValue;
        if (!dateUtils.isValidDate(date) || (year !== date.getFullYear())) {
            css.push('controls-PeriodLiteDialog__vLayoutItem-clickable_theme-' + this._options.theme);
        }
        if (dateUtils.isValidDate(date) && (year === date.getFullYear())) {
            css.push('controls-PeriodLiteDialog__selectedYear');
            css.push('controls-PeriodLiteDialog__selectedYear_theme-' + this._options.theme);
        }
        return css.join(' ');
    }

    protected _getYearListPosition(options: IDateLitePopupOptions, dateConstructor: Function): Date {

        const start = options.startValue;
        const currentDate = new dateConstructor();
        const startValueYear = start ? start.getFullYear() : null;
        // максимально допустимая разница между текущим и отображаемым годом
        const maxYearsOffset = 5;

        if (!startValueYear) {
            return currentDate;
        }

        if (startValueYear >= currentDate.getFullYear()) {
            return start;
        } else if (currentDate.getFullYear() - startValueYear >= maxYearsOffset) {
            return new dateConstructor(startValueYear + maxYearsOffset - 1, 0);
        } else {
            return currentDate;
        }
    }

    private getWindowInnerWidth(): number {
        return window?.innerWidth;
    }

    static _theme: string[] = ['Controls/shortDatePicker'];

    static getDefaultOptions(): IDateLitePopupOptions {
        const PeriodDialogOptions: IDateLitePopupOptions = IPeriodSimpleDialog.getDefaultOptions();
        PeriodDialogOptions.captionFormatter = dateControlsUtils.formatDateRangeCaption;
        PeriodDialogOptions.itemTemplate = ItemWrapper;
        PeriodDialogOptions.monthTemplate = monthTmpl;
        PeriodDialogOptions.dateConstructor = WSDate;
        return PeriodDialogOptions;
    }

    static getOptionTypes(): IDateLitePopupOptions {
        const PeriodDialogTypes: IDateLitePopupOptions = IPeriodSimpleDialog.getOptionTypes();
        PeriodDialogTypes.captionFormatter = descriptor(Function);
        return PeriodDialogTypes;
    }
}

View.EMPTY_CAPTIONS = IPeriodSimpleDialog.EMPTY_CAPTIONS;

export default View;
