import MonthViewModel from './../MonthView/MonthViewModel';
import {Base as DateUtil} from 'Controls/dateUtils';

/**
 * Модель для представления месяца с поддержкой выделения.
 * @class Controls/_calendar/Month/Model
 * @author Красильников А.С.
 * @public
 */

export default class MonthModel extends MonthViewModel {
    protected _normalizeState(state): object {
        const nState = super._normalizeState(state);
        nState.selectionProcessing = state.selectionProcessing;
        nState.selectionType = state.selectionType;
        nState.hoveredEndValue = state.hoveredEndValue;
        nState.hoveredStartValue = state.hoveredStartValue;
        nState.startValue = DateUtil.normalizeDate(state.startValue);
        nState.endValue = DateUtil.normalizeDate(state.endValue);
        return nState;
    }

    protected _isStateChanged(state): boolean {
        const isChanged = super._isStateChanged(state);
        const currentMonthStart = DateUtil.getStartOfMonth(this._state.month);
        const currentMonthEnd = DateUtil.getEndOfMonth(this._state.month);

        const hoveredRangeChanged = state.hoveredStartValue !== this._state.hoveredStartValue ||
            state.hoveredStartValue !== this._state.hoveredStartValue;

        const hoveredRangeOverlaps = DateUtil.isRangesOverlaps(currentMonthStart, currentMonthEnd,
            state.hoveredStartValue, state.hoveredEndValue);
        // Нужно обновить месяц, если старое значение хавера пересекается с этим месяцем.
        const lastHoveredRangeOverlaps = DateUtil.isRangesOverlaps(currentMonthStart, currentMonthEnd,
            this._state.hoveredStartValue, this._state.hoveredEndValue);

        // Обновляем, если навели или убрали курсор с ячейки дня.
        if (!this._singleDayHover && hoveredRangeChanged && (hoveredRangeOverlaps || lastHoveredRangeOverlaps)) {
            return true;
        }

        return isChanged ||
            state.selectionProcessing !== this._state.selectionProcessing ||

            // обновляем только если старый выбранный или новый период пересекаются с отображаемым месяцем
            (DateUtil.isRangesOverlaps(currentMonthStart, currentMonthEnd,
                this._state.startValue, this._state.endValue) ||
                DateUtil.isRangesOverlaps(currentMonthStart, currentMonthEnd,
                    state.startValue, state.endValue)) &&

            // не обновляем если отображаемый месяц полностью входит в старый и новый периоды
            !(this._state.startValue < currentMonthStart && state.startValue < currentMonthStart &&
                this._state.endValue > currentMonthEnd && state.endValue > currentMonthEnd);
    }

    protected _getDayObject(date, state): object {
        state = state || this._state;

        const obj = super._getDayObject(date, state);
        const startDate = state.startValue;
        const endDate = state.endValue;

        obj.selectionProcessing = state.selectionProcessing;

        obj.selected = (startDate && endDate && date >= startDate && date <= endDate) ||
            (startDate && DateUtil.isDatesEqual(date, startDate) && !endDate) ||
            (!startDate && endDate && DateUtil.isDatesEqual(date, endDate)) ||
            (startDate === null && endDate === null) ||
            (startDate === null && date <= endDate) ||
            (date >= startDate && endDate === null);

        obj.selectedStart = DateUtil.isDatesEqual(date, startDate);
        obj.selectedEnd = DateUtil.isDatesEqual(date, endDate);

        obj.selectedInner = (date && startDate && endDate &&
            date.getTime() > startDate.getTime() && date.getTime() < endDate.getTime());

        return obj;
    }
}
