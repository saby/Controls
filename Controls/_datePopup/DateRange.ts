import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_datePopup/DateRange';
import * as monthHeaderTmpl from 'wml!Controls/_datePopup/DateRangeMonthHeaderTemplate';
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import { SyntheticEvent } from 'UICommon/Events';
import {DateRangeModel, Utils as DateControlsUtils, dateRangeQuantum as quantumUtils, IDateRangeOptions} from 'Controls/dateRange';
import {EventUtils} from 'UI/Events';
import {MonthModel} from 'Controls/calendar';
import {Base as dateUtils} from 'Controls/dateUtils';
import {detection} from 'Env/Env';
import {IRangeSelectableOptions, IDateRangeSelectableOptions} from 'Controls/dateRange';
import {IDateConstructorOptions} from 'Controls/interface';
import 'css!Controls/datePopup';

interface IDatePopupDateRangeOptions extends IControlOptions, IDateConstructorOptions,
    IRangeSelectableOptions, IDateRangeSelectableOptions, IDateRangeOptions {
    position: Date;
}

/**
 * Component that allows you to select periods of multiple days.
 *
 * @class Controls/_datePopup/DateRange
 * @extends UI/Base:Control
 *
 * @author Красильников А.С.
 * @private
 */

export default class DateRange extends Control<IDatePopupDateRangeOptions> {
    protected _template: TemplateFunction = template;
    protected _monthHeaderTmpl: TemplateFunction = monthHeaderTmpl;
    protected _monthViewModel: MonthModel = MonthModel;
    protected _weekdaysCaptions: string = DateControlsUtils.getWeekdaysCaptions();
    protected _monthSelectionEnabled: boolean = true;
    protected _markedKey: string;

    private _rangeModel: typeof DateRangeModel;
    private _position: Date;
    private _monthsPosition: Date;

    private _singleDayHover: boolean = true;
    private _shouldUpdateMonthsPosition: boolean = true;

    constructor(options: IDatePopupDateRangeOptions) {
        super(options);
        this._rangeModel = new DateRangeModel({ dateConstructor: options.dateConstructor });
        EventUtils.proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged']);
        // Нет необходимости передавать опцию hoveredStartValue и hoveredEndValue, если ховер работает только по одному
        // итему, а не по нескольким, как в квантах.
        const isQuantumSelection = options.selectionType === 'quantum' && options.ranges;
        if (isQuantumSelection) {
            const isSingleDayQuantum = 'days' in options.ranges && options.ranges.days.indexOf(1) !== -1;
            this._singleDayHover = isSingleDayQuantum;
        }
    }

    protected _beforeMount(options: IDatePopupDateRangeOptions): void {
        if (options.position) {
            this._monthsPosition = new Date(options.position.getFullYear(), 0);
            const markedKeyDate = new Date(options.position.getFullYear(), options.position.getMonth());
            this._markedKey = this._dateToId(markedKeyDate);
        }
        this._updateView(options);
    }

    protected _beforeUpdate(options: IDatePopupDateRangeOptions): void {
        this._updateView(options);
    }

    protected _beforeUnmount(): void {
        this._rangeModel.destroy();
    }

    protected _monthObserverHandler(event: Event, entry: IntersectionObserverEntry): void {
        // Меняем маркер выбранного месяца если месяц стал полностью видимым.
        // На Android значение intersectionRatio никогда не равно 1. Нам подойдет любое значение больше или равное 0.9.
        const androidIntersectionRatio = 0.9;
        const fullItemIntersectionRatio = detection.isMobileAndroid ? androidIntersectionRatio : 1;
        if (entry.nativeEntry.intersectionRatio >= fullItemIntersectionRatio) {
            if (entry.data.getFullYear() !== this._monthsPosition.getFullYear()) {
                if (this._shouldUpdateMonthsPosition ) {
                    this._monthsPosition = new Date(entry.data.getFullYear(), 0);
                } else {
                    this._shouldUpdateMonthsPosition = true;
                }
            }
            this._markedKey = this._dateToId(entry.data);
        }
    }

    protected _monthCaptionClick(e: SyntheticEvent, yearDate: Date, month: number): void {
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
    }

    private _dateToId(date: Date): string {
        return formatDate(date, 'YYYY-MM-DD');
    }

    /**
     * [текст, условие, если true, если false]
     * @param prefix
     * @param style
     * @param cfgArr
     * @private
     */
    protected _prepareCssClass(prefix: string, style: string, cfgArr: []): string {
        let cssClass = prefix;
        if (style) {
            cssClass += '-' + style;
        }
        return cfgArr.reduce((previousValue: string, currentValue: string) => {
            const valueToAdd = currentValue[0] ? currentValue[1] : currentValue[2];
            if (valueToAdd) {
                return previousValue + '-' + valueToAdd;
            }
            return previousValue;
        }, cssClass);
    }

    protected _onItemClick(event: Event): void {
        event.stopPropagation();
    }

    protected _itemKeyDownHandler(event: Event, item, keyCode: number): void {
        this._notify('itemKeyDown', [item, keyCode]);
    }

    protected _scrollToMonth(event: Event, year: number, month: number): void {
        const newDate = new this._options.dateConstructor(year, month);
        this._notifyPositionChanged(newDate);
        if (newDate.getFullYear() !== this._monthsPosition.getFullYear()) {
            this._monthsPosition = new this._options.dateConstructor(newDate.getFullYear(), 0);
        }
        this._markedKey = this._dateToId(newDate);
        event.stopPropagation();
    }

    protected _formatMonth(month: number): string {
        // Берем любой год, т.к. нам важен только месяц для форматирования.
        const year = 2000;
        return formatDate(new Date(year, month), 'MMMM');
    }

   protected _onPositionChanged(e: Event, position: Date): void {
        this._position = position;
        this._notifyPositionChanged(position);
    }

    protected _onMonthsPositionChanged(e: Event, position: Date): void {
        let positionChanged;
        let newPosition;
        // При скролле колонки с месяцами нужно менять позицию календаря только тогда,
        // когда мы увидим следующий год полностью.
        // Позицией у MonthList считается самый верхний видимый год.

        // При скролле вверх будем считать год поностью видимым тогда, когда над ним хотя бы немного виден
        // следующий год. В таком случае позиция MonthList будет установлена на год выше нужного.
        const needChangeToPrevYear = position.getFullYear() + 2 === this._position.getFullYear();
        // При скролле вниз, год станет полностью видимым одновременно с тем, как поменяется позиция. Меняем год сразу.
        const needChangeToNextYear = position.getFullYear() - 1 === this._position.getFullYear();

        if (needChangeToPrevYear) {
            // При смене позиции выстрелит monthsObserver и т.к. при скролле вверх позиция маркера не будет совпадать
            // с позицией MonthList, мы прискроллимся к году, на котором находится маркер, что будет выглядеть как
            // прыжок. Не будем обновлять позицию при первом вызове обсервера
            this._shouldUpdateMonthsPosition = false;
            newPosition = new Date(position.getFullYear() + 1, 0);
            positionChanged = true;
        }

        if (needChangeToNextYear) {
            newPosition = new Date(position.getFullYear(), 0);
            positionChanged = true;
        }
        if (positionChanged) {
            this._markedKey = this._dateToId(newPosition);
            this._notifyPositionChanged(newPosition);
        }
    }

    protected _preventEvent(event: Event): void {
        // Отключаем скролл ленты с месяцами, если свайпнули по колонке с месяцами
        // Для тач-устройств нельзя остановить событие скрола, которое стреляет с ScrollContainer,
        // внутри которого лежит 2 контейнера для которых требуется разное поведение на тач устройствах
        event.preventDefault();
        event.stopPropagation();
    }

    protected _proxyEvent(event: Event): void {
        this._notify(event.type, Array.prototype.slice.call(arguments, 1));
    }

    private _updateView(options: IDatePopupDateRangeOptions): void {
        this._rangeModel.update(options);
        this._monthSelectionEnabled = !options.readOnly && (options.selectionType === 'range' ||
            (options.selectionType === 'quantum' && quantumUtils.monthSelectionEnabled(options.ranges) &&
                options.ranges.months[0] === 1));
        if (this._position !== options.position) {
            this._position = options.position;
            if (this._shouldUpdateMonthsPosition) {
                this._monthsPosition = new Date(this._position.getFullYear(), 0);
            }
            this._markedKey = this._dateToId(this._position);
        }
        if (!this._singleDayHover) {
            this._hoveredStartValue = options.hoveredStartValue;
            this._hoveredEndValue = options.hoveredEndValue;
        }
    }

    private _notifyPositionChanged(position: Date): void {
        this._notify('positionChanged', [position]);
    }

    static getDefaultOptions(): object {
        return {
            dateConstructor: WSDate
        };
    }
}

Object.defineProperty(DateRange, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return DateRange.getDefaultOptions();
   }
});
