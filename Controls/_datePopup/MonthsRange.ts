import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import {DateRangeModel, IDateRangeSelectableOptions,
    IRangeSelectableOptions, IDateRangeOptions} from 'Controls/dateRange';
import {EventUtils} from 'UI/Events';
import {Base as dateUtils} from 'Controls/dateUtils';
import MonthsRangeItem from './MonthsRangeItem';
import * as componentTmpl from 'wml!Controls/_datePopup/MonthsRange';
import 'css!Controls/datePopup';
import {IDateConstructorOptions} from 'Controls/_interface/IDateConstructor';

interface IMonthsRangeOptions extends IControlOptions, IDateConstructorOptions,
    IRangeSelectableOptions, IDateRangeSelectableOptions, IDateRangeOptions {
    position: Date;
}

/**
 * Component that allows you to select a period of multiple months.
 *
 * @class Controls/_datePopup/MonthsRange
 * @extends UI/Base:Control
 *
 * @author Красильников А.С.
 * @private
 */

class Component extends Control<IMonthsRangeOptions> {
    protected _template: TemplateFunction = componentTmpl;

    _proxyEvent: Function = EventUtils.tmplNotify;

    _position: Date;
    _rangeModel: DateRangeModel;

    _formatDate: Function = formatDate;

    _selectionViewType: string;

    constructor(options: IMonthsRangeOptions, context?: object) {
        super(options, context);
        this._rangeModel = new DateRangeModel({ dateConstructor: options.dateConstructor });
        EventUtils.proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged']);
    }

    protected _beforeMount(options: IMonthsRangeOptions): void {
        this._position = dateUtils.getStartOfYear(options.position || new options.dateConstructor());
        this._rangeModel.update(options);
        this._updateSelectionType(options);
    }

    protected _beforeUpdate(options: IMonthsRangeOptions): void {
        this._rangeModel.update(options);
        if (options.position.getFullYear() !== this._position.getFullYear()) {
            this._position = dateUtils.getStartOfYear(options.position);
        }
        // If the user selects the period using this control,
        // then we have already set the selection type and do not need to update it.
        if (!options.selectionProcessing) {
            this._updateSelectionType(options);
        }
    }

    protected _beforeUnmount(): void {
        this._rangeModel.destroy();
    }

    protected _onItemClick(event: Event): void {
        event.stopPropagation();
    }

    protected _onPositionChanged(e: Event, position: Date): void {
        this._notify('positionChanged', [position]);
    }

    private _updateSelectionType(options: IMonthsRangeOptions): void {
        if (dateUtils.isStartOfMonth(options.startValue) && dateUtils.isEndOfMonth(options.endValue)) {
            this._selectionViewType = MonthsRangeItem.SELECTION_VIEW_TYPES.months;
        } else {
            this._selectionViewType = MonthsRangeItem.SELECTION_VIEW_TYPES.days;
        }
    }
}
Component.SELECTION_VIEW_TYPES = MonthsRangeItem.SELECTION_VIEW_TYPES;

Component.getDefaultOptions = (): {} => {
    return {
        selectionViewType: MonthsRangeItem.SELECTION_VIEW_TYPES.days,
        dateConstructor: WSDate
    };
};

Object.defineProperty(Component, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Component.getDefaultOptions();
   }
});

// Component.getOptionTypes = function() {
//    return coreMerge({}, IPeriodSimpleDialog.getOptionTypes());
// };

export default Component;
