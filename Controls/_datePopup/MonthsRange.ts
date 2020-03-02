import Control = require('Core/Control');
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import tmplNotify = require('Controls/Utils/tmplNotify');
import {DateRangeModel} from 'Controls/dateRange';
import proxyModelEvents from 'Controls/Utils/proxyModelEvents';
import dateUtils = require('Controls/Utils/Date');
import MonthsRangeItem from './MonthsRangeItem';
import componentTmpl = require('wml!Controls/_datePopup/MonthsRange');
import 'css!theme?Controls/datePopup';

/**
 * Component that allows you to select a period of multiple months.
 *
 * @class Controls/_datePopup/MonthsRange
 * @extends Core/Control
 * @control
 * @author Красильников А.С.
 * @private
 */

class Component extends Control {
    protected _template: Function = componentTmpl;

    _proxyEvent: Function = tmplNotify;

    _position: Date;
    _rangeModel: DateRangeModel;

    _formatDate: Function = formatDate;

    _selectionViewType: string;

    constructor(options) {
        super();
        this._rangeModel = new DateRangeModel({ dateConstructor: options.dateConstructor });
        proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged']);
    }

    _beforeMount(options) {
        this._position = dateUtils.getStartOfYear(options.position || new options.dateConstructor());
        this._rangeModel.update(options);
        this._updateSelectionType(options);
    }

    _beforeUpdate(options) {
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

    _beforeUnmount() {
        this._rangeModel.destroy();
    }

    _onItemClick(e) {
        e.stopPropagation();
    }

    _onPositionChanged(e: Event, position: Date) {
        this._notify('positionChanged', [position]);
    }

    private _updateSelectionType(options): void {
        if (dateUtils.isStartOfMonth(options.startValue) && dateUtils.isEndOfMonth(options.endValue)) {
            this._selectionViewType = MonthsRangeItem.SELECTION_VEIW_TYPES.months;
        } else {
            this._selectionViewType = MonthsRangeItem.SELECTION_VEIW_TYPES.days;
        }
    }
}

Component.SELECTION_VEIW_TYPES = MonthsRangeItem.SELECTION_VEIW_TYPES;

Component.getDefaultOptions = function() {
    return {
        selectionViewType: MonthsRangeItem.SELECTION_VEIW_TYPES.days,
        dateConstructor: WSDate
    };
};

// Component.getOptionTypes = function() {
//    return coreMerge({}, IPeriodSimpleDialog.getOptionTypes());
// };

export default Component;
