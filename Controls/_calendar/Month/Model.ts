import MonthViewModel from './../MonthView/MonthViewModel';
import DateUtil = require('Controls/Utils/Date');

/**
 * Модель для представления месяца с поддержкой выделения.
 * @class Controls/_calendar/Month/Model
 * @author Красильников А.С.
 */

var ModuleClass = MonthViewModel.extend({

    _normalizeState: function (state) {
        var nState = ModuleClass.superclass._normalizeState.apply(this, arguments);
        nState.selectionProcessing = state.selectionProcessing;
        nState.selectionType = state.selectionType;
        nState.hoveredEndValue = state.hoveredEndValue;
        nState.hoveredStartValue = state.hoveredStartValue;
        nState.startValue = DateUtil.normalizeDate(state.startValue);
        nState.endValue = DateUtil.normalizeDate(state.endValue);
        return nState;
    },

    _isStateChanged: function (state) {
        let isChanged = ModuleClass.superclass._isStateChanged.apply(this, arguments),
            currentMonthStart = DateUtil.getStartOfMonth(this._state.month),
            currentMonthEnd = DateUtil.getEndOfMonth(this._state.month);

        const hoveredRangeChanged = state.hoveredStartValue !== this._state.hoveredStartValue ||
            state.hoveredStartValue !== this._state.hoveredStartValue;

        const hoveredRangeOverlaps = DateUtil.isRangesOverlaps(currentMonthStart, currentMonthEnd, state.hoveredStartValue, state.hoveredEndValue);
        // Нужно обновить месяц, если старое значение хавера пересекается с этим месяцем.
        const lastHoveredRangeOverlaps = DateUtil.isRangesOverlaps(currentMonthStart, currentMonthEnd, this._state.hoveredStartValue, this._state.hoveredEndValue);

        // Обновляем, если навели или убрали курсор с ячейки дня.
         if (!this._singleDayHover && hoveredRangeChanged && (hoveredRangeOverlaps || lastHoveredRangeOverlaps)) {
            return true;
        }

        return isChanged ||
            state.selectionProcessing !== this._state.selectionProcessing ||

            // обновляем только если старый выбранный или новый период пересекаются с отображаемым месяцем
            (DateUtil.isRangesOverlaps(currentMonthStart, currentMonthEnd, this._state.startValue, this._state.endValue) ||
            DateUtil.isRangesOverlaps(currentMonthStart, currentMonthEnd, state.startValue, state.endValue)) &&

            // не обновляем если отображаемый месяц полностью входит в старый и новый периоды
            !(this._state.startValue < currentMonthStart && state.startValue < currentMonthStart && this._state.endValue > currentMonthEnd && state.endValue > currentMonthEnd);
    },

    _getDayObject: function (date, state) {
        state = state || this._state;

        var obj = ModuleClass.superclass._getDayObject.apply(this, arguments),
            startDate = state.startValue,
            endDate = state.endValue;

        obj.selectionProcessing = state.selectionProcessing;

        obj.selected = (startDate && endDate && date >= startDate && date <= endDate) ||
            (startDate && DateUtil.isDatesEqual(date, startDate) && !endDate) ||
            (!startDate && endDate && DateUtil.isDatesEqual(date, endDate));

        obj.selectedStart = DateUtil.isDatesEqual(date, startDate || endDate);
        obj.selectedEnd = DateUtil.isDatesEqual(date, endDate);

        obj.selectedInner = (date && startDate && endDate && date.getTime() > startDate.getTime() && date.getTime() < endDate.getTime());

        return obj;
    }

});

export default ModuleClass;
