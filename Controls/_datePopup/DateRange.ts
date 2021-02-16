import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_datePopup/DateRange';
import * as monthHeaderTmpl from 'wml!Controls/_datePopup/DateRangeMonthHeaderTemplate';
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import { SyntheticEvent } from 'Vdom/Vdom';
import {DateRangeModel, Utils as DateControlsUtils, dateRangeQuantum as quantumUtils} from 'Controls/dateRange';
import {EventUtils} from 'UI/Events';
import {MonthModel} from 'Controls/calendar';
import {Base as dateUtils} from 'Controls/dateUtils';

/**
 * Component that allows you to select periods of multiple days.
 *
 * @class Controls/_datePopup/DateRange
 * @extends UI/Base:Control
 *
 * @author Красильников А.С.
 * @private
 */

export default class DateRange extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _monthHeaderTmpl: TemplateFunction = monthHeaderTmpl;
    protected _monthViewModel: MonthModel = MonthModel;
    protected _weekdaysCaptions: string = DateControlsUtils.getWeekdaysCaptions();
    protected _monthSelectionEnabled: boolean = true;
    protected _markedKey: string;

    private _rangeModel: typeof DateRangeModel;
    private _position: Date;
    private _monthsPosition: any;

    private _singleDayHover: boolean = true;

    constructor(options) {
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

    protected _beforeMount(options): void {
        this._updateView(options);
    }

    protected _afterMount(options): void {
        this._markedKey = this._dateToId(this._position);
    }

    protected _beforeUpdate(options): void {
        this._updateView(options);
    }

    protected _beforeUnmount(): void {
        this._rangeModel.destroy();
    }

    protected _monthObserverHandler(event, entries): void {
        // Меняем маркер выбранного месяца если месяц стал полностью видимым.
        if (entries.nativeEntry.intersectionRatio === 1) {
            this._markedKey = this._dateToId(entries.data);
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
    protected _prepareCssClass(prefix, style, cfgArr): string {
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
    }

    protected _onItemClick(e): void {
        e.stopPropagation();
    }

    protected _scrollToMonth(e, year, month): void {
        this._notifyPositionChanged(new this._options.dateConstructor(year, month));
        e.stopPropagation();
    }

    protected _formatMonth(month): Date {
        return formatDate(new Date(2000, month), 'MMMM');
    }

   protected _onPositionChanged(e: Event, position: Date): void {
        this._position = position;
        this._notifyPositionChanged(position);
        if (position.getFullYear() !== this._monthsPosition.getFullYear()) {
            this._monthsPosition = new Date(position.getFullYear(), 0);
        }
    }

    protected _onMonthsPositionChanged(e: Event, position: Date): void {
        if (position.getFullYear() !== this._monthsPosition.getFullYear()) {
            this._notifyPositionChanged(position);
        }
    }

    protected _preventEvent(event: Event): void {
        // Отключаем скролл ленты с месяцами, если свайпнули по колонке с месяцами
        // Для тач-устройств нельзя остановить событие скрола, которое стреляет с ScrollContainer,
        // внутри которого лежит 2 контейнера для которых требуется разное поведение на тач устройствах
        event.preventDefault();
        event.stopPropagation();
    }

    protected _proxyEvent(event): void {
        this._notify(event.type, Array.prototype.slice.call(arguments, 1));
    }

    private _updateView(options): void {
        this._rangeModel.update(options);
        this._monthSelectionEnabled = !options.readOnly && (options.selectionType === 'range' ||
            (options.selectionType === 'quantum' && quantumUtils.monthSelectionEnabled(options.ranges) &&
                options.ranges.months[0] === 1));
        if (this._position !== options.position) {
            this._position = options.position;
            if (!this._monthsPosition || this._position.getFullYear() !== this._monthsPosition.getFullYear()) {
                this._monthsPosition = new Date(this._position.getFullYear(), 0);
            }
            this._markedKey = this._dateToId(this._position);
        }
        if (this._position?.getFullYear() !== this._monthsPosition?.getFullYear()) {
            const newPosition = new Date(this._monthsPosition.getFullYear(), 0);
            this._notifyPositionChanged(newPosition);
        }
        if (!self._singleDayHover) {
            this._hoveredStartValue = options.hoveredStartValue;
            this._hoveredEndValue = options.hoveredEndValue;
        }
    }

    private _notifyPositionChanged(position): void {
        this._notify('positionChanged', [position]);
    }

    static _theme: string[] = ['Controls/datePopup'];

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
