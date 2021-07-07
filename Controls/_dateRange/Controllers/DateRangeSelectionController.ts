import * as coreMerge from 'Core/core-merge';
import RangeSelectionController from './RangeSelectionController';
import IDateRangeSelectable = require('Controls/_dateRange/interfaces/IDateRangeSelectable');
import CalendarUtils from './../Utils';
import {Base as DateUtil} from 'Controls/dateUtils';

/**
 * Контроллер, реализующий выделение элементов от одного до другого. В качестве элементов используются даты.
 * Поддерживает выделение квантами кратными дням, неделям, месяцам.
 *
 * @remark
 * Компонент, которым управляет контроллер, должен поддерживать опции startValue и endValue.
 * Это значения элементов, от которого и до которого в данный момент выделен диапазон.
 * Так же компонент должен поддерживать события itemClick и itemMouseEnter.
 * Эти события должны передавать в качестве параметра значения элементов, с которыми в данный момент происходит взаимодействие.
 *
 * @class Controls/_dateRange/Controllers/DateRangeSelectionController
 * @extends Controls/_dateRange/Controllers/RangeSelectionController
 * @author Красильников А.С.
 * @public
 */

export default class DateRangeSelectionController extends RangeSelectionController {
    private _quantum: {};
    private _isSingleQuant: boolean;

    protected _beforeMount(options): void {
        const quantum = options.quantum || {};
        this._quantum = quantum;

        const isSingleQuant = () => {
            // Проверяем, есть ли в каком-нибудь из видов кванта больше чем одно значение (например days: [1, 3]). В таком
            // случае квант не единственный.
            for (const i in quantum) {
                if (quantum[i].length > 1) {
                    return false;
                }
            }
            // Проверяем, передали ли в quantum два или больше типа квантов
            // (days, weeks, months, quarters, halfyears и years). Например {days: [3], weeks: [5]}, В таком случае квант
            // не единственный.
            return options.selectionType === DateRangeSelectionController.SELECTION_TYPES.quantum &&
                Object.keys(quantum).length === 1;
        };

        this._isSingleQuant = isSingleQuant();

        super._beforeMount(options);
    }

    // _beforeUpdate: function(options) {
    // },

    protected _prepareState(state): void {
        if (state.hasOwnProperty('startValue')) {
            state.startValue = DateUtil.normalizeDate(state.startValue);
        }
        if (state.hasOwnProperty('endValue')) {
            state.endValue = DateUtil.normalizeDate(state.endValue);
        }
        if (state.hasOwnProperty('selectionBaseValue')) {
            state.selectionBaseValue = DateUtil.normalizeDate(state.selectionBaseValue);
        }
        if (state.hasOwnProperty('selectionHoveredValue')) {
            state.selectionHoveredValue = DateUtil.normalizeDate(state.selectionHoveredValue);
        }

        super._prepareState(state);
    }

    protected _isExternalChanged(valueName: string, options): boolean {
        return options.hasOwnProperty(valueName) &&
            !DateUtil.isDatesEqual(options[valueName], this['_' + valueName]);
    }

    protected _itemClickHandler(event, item): void {
        if (this._state.selectionType === DateRangeSelectionController.SELECTION_TYPES.workdays) {
            this._processSingleSelection(item);
        }
        if (this._state.selectionType === DateRangeSelectionController.SELECTION_TYPES.quantum) {
            // this._processRangeSelection(item);
            if (this._isSingleQuant) {
                this._processSingleSelection(item);
            } else {
                this._processRangeSelection(item);
            }
        } else {
            super._itemClickHandler(event, item);
        }
    }

    protected _getDisplayedRangeEdges(item): [] {
        let range;
        if (this._selectionType === DateRangeSelectionController.SELECTION_TYPES.quantum) {
            range = CalendarUtils.updateRangeByQuantum(this.getSelectionBaseValue() || item, item, this._quantum);
        } else if (this._selectionType === DateRangeSelectionController.SELECTION_TYPES.workdays) {
            range = CalendarUtils.updateRangeByWorkdays(item);
        } else {
            range = super._getDisplayedRangeEdges(item);
        }
        if (this._rangeSelectedCallback) {
            range = this._rangeSelectedCallback(range[0], range[1]);
        }
        return range;
    }

    static SELECTION_TYPES: object = IDateRangeSelectable.SELECTION_TYPES;

    static getOptionTypes(): object {
        return coreMerge({}, IDateRangeSelectable.getOptionTypes());
    }

    static getDefaultOptions(): object {
        return coreMerge({}, IDateRangeSelectable.getDefaultOptions());
    }
}

Object.defineProperty(DateRangeSelectionController, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return DateRangeSelectionController.getDefaultOptions();
    }
});
