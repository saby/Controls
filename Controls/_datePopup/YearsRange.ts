import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_datePopup/YearsRange';
import {Date as WSDate} from 'Types/entity';
import {DateRangeModel, rangeSelection as rangeSelectionUtils, IDateRangeOptions} from 'Controls/dateRange';
import {Base as dateUtils} from 'Controls/dateUtils';
import {constants} from 'Env/Env';
import 'css!Controls/datePopup';
import {IDateConstructorOptions} from 'Controls/_interface/IDateConstructor';

const BUTTONS_COUNT: number = 6;

interface IYearsRangeOptions extends IControlOptions, IDateRangeOptions, IDateConstructorOptions {
    year: Date;
}
/**
 * Component that allows you to select periods that are multiples of years.
 *
 * @class Controls/_datePopup/YearsRange
 * @extends UI/Base:Control
 *
 * @author Красильников А.С.
 * @private
 */

export default class YearsRange extends Control<IYearsRangeOptions> {
    protected _template: TemplateFunction = template;
    _year: number;
    _rangeModel: DateRangeModel;
    _model: object[];
    _lastYear: number;

    protected _beforeMount(options: IYearsRangeOptions): void {
        this._year = options.year ? options.year.getFullYear() : (new Date()).getFullYear();
        if (dateUtils.isValidDate(options.endValue) && dateUtils.isValidDate(options.startValue) &&
            options.startValue.getFullYear() === options.endValue.getFullYear()) {
            this._lastYear = Math.max(this._year, options.endValue.getFullYear()) + 1;
        } else if (dateUtils.isValidDate(options.endValue)) {
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
    }

    protected _beforeUpdate(options: IYearsRangeOptions): void {
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
    }

    protected _beforeUnmount(): void {
        this._rangeModel.destroy();
    }

    protected _onPrevNextButtonClick(event: Event, delta: number): void {
        this._changeYear(delta);
    }

    protected _prevNextBtnKeyDownHandler(event: Event, delta: number): void {
        if (event.nativeEvent.keyCode === constants.key.enter) {
            this._changeYear(delta);
        }
    }

    protected _onItemClick(event: Event, date: Date): void {
        this._notify('itemClick', [date]);
    }

    protected _onItemKeyDown(event: Event, date: Date): void {
        if (event.nativeEvent.keyCode === constants.key.enter) {
            this._notify('itemClick', [date]);
        }
    }

    protected _onItemMouseEnter(event: Event, date: Date): void {
        this._notify('itemMouseEnter', [date]);
    }

    protected _onItemMouseLeave(event: Date, date: Date): void {
        this._notify('itemMouseLeave', [date]);
    }

    protected _prepareItemClass(itemValue: number): string {
        const css = [];
        const itemDate = new Date(itemValue, 0);

        css.push(rangeSelectionUtils.prepareSelectionClass(
            itemDate,
            this._rangeModel.startValue,
            this._rangeModel.endValue,
            this._options.selectionProcessing,
            this._options.selectionBaseValue,
            this._options.selectionHoveredValue,
            this._options.hoveredStartValue,
            this._options.hoveredEndValue,
            { periodQuantum: rangeSelectionUtils.PERIOD_TYPE.year }
        ));

        if (itemValue === this._year) {
            css.push('controls-PeriodDialog-Years__item-displayed');
            css.push('controls-PeriodDialog-Years__item-displayed');
        } else if (itemValue === (new Date()).getFullYear()) {
            css.push('controls-PeriodDialog-Years__item-current');
            css.push('controls-PeriodDialog-Years__item-current');
        } else {
            css.push('controls-PeriodDialog-Years__rangeBtn-regular');
        }
        return css.join(' ');
    }

    private _changeYear(delta: number): void {
        this._lastYear = this._lastYear + delta;
        this._updateModel();
    }

    private _updateModel(options?: IYearsRangeOptions): void {
        // Ограничиваем период с 1400 года по (текущий год + 1000)
        const minRange = dateUtils.MIN_YEAR_VALUE + BUTTONS_COUNT - 1;
        const maxRange = dateUtils.MAX_YEAR_VALUE;
        if (this._lastYear < minRange) {
            this._lastYear = minRange;
        }
        if (this._lastYear > maxRange) {
            this._lastYear = maxRange;
        }

        const items = [];
        const currentYear = (new Date()).getFullYear();
        const ots = options || this._options;
        let item;
        let year;

        for (let i = 0; i < BUTTONS_COUNT; i++) {
            year = this._lastYear - BUTTONS_COUNT + 1 + i;
            item = {
                caption: year,
                isDisplayed: year === this._year,
                isCurrent: year === currentYear,
                date: new ots.dateConstructor(year, 0),
                year
            };

            items.push(item);
        }
        this._model = items;
    }

    static getDefaultOptions(): object {
        return {
            dateConstructor: WSDate
        };
    }
}

Object.defineProperty(YearsRange, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return YearsRange.getDefaultOptions();
   }
});
