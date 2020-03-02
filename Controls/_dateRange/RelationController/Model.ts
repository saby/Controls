import dateUtils = require('Controls/Utils/Date');
import getPeriodType = require('Core/helpers/Date/getPeriodType');
import getPeriodLengthInMonthByType = require('Core/helpers/Date/getPeriodLengthInMonthByType');
import periodTypes = require('Core/helpers/Date/periodTypes');
import dateRangeUtil = require('Controls/Utils/DateRangeUtil');

class ModuleClass {
    public ranges: Array<Array<Date>>;
    private _steps: Array<number>;
    private _relationMode: String;

    constructor(options) {
        this.update(options);
    }

    /**
     * Updates model fields.
     * @param options
     */
    update(options) {
        this.ranges = this._getRangesFromOptions(options);
        this._updateSteps(this.ranges);
        this._relationMode = options.bindType;
    }

    updateRanges(start, end, changedRangeIndex, relationMode) {
        let
            oldRelationMode,
            newRanges;

        if (relationMode) {
            oldRelationMode = relationMode;
            this._relationMode = relationMode;
        } else {
            oldRelationMode = this._relationMode;
            this._autoRelation(this.ranges,[start, end], changedRangeIndex);
        }
        newRanges = this._getUpdatedRanges(
            this.ranges,
            changedRangeIndex,
            [start, end],
            oldRelationMode,
            this._steps
        );
        this.ranges = newRanges;
        if (oldRelationMode !== this._relationMode && oldRelationMode === 'normal') {
            this._updateSteps(this.ranges);
        }
    }

    get bindType() {
        return this._relationMode;
    }

    set bindType(value) {
        this._relationMode = value;
    }

    get relationMode() {
        return this._relationMode;
    }

    set relationMode(value) {
        this._relationMode = value;
    }
    shiftForward() {
        this._shift(1);
    }

    shiftBackward() {
        this._shift(-1);
    }

    private _shift(delta) {
        this.ranges = this.ranges.map(function (range) {
            return dateRangeUtil.shiftPeriod(range[0], range[1], delta);
        });
    }

    private _autoRelation(ranges, updatedRange, changedRangeIndex) {
        var periodType;

        periodType = getPeriodType(updatedRange[0], updatedRange[1]);

        if (this._periodTypeIsDay(periodType)) {
            this._relationMode = 'byCapacity';
        }

         if (ranges.length > 2 || this._relationMode === 'normal') {
            return;
         }

        var updatedStartValue = updatedRange[0],
            updatedEndValue = updatedRange[1],
            updatedPeriodType = getPeriodType(updatedStartValue, updatedEndValue),
            capacityChanged = updatedPeriodType !== getPeriodType(ranges[changedRangeIndex][0], ranges[changedRangeIndex][1]);

         if (changedRangeIndex < ranges.length - 1) {
            this._updateRelation(updatedPeriodType, updatedStartValue, ranges[changedRangeIndex + 1][0], capacityChanged);
         }
         if (/**this._options.onlyByCapacity &&**/ changedRangeIndex > 0) {
            this._updateRelation(updatedPeriodType, updatedStartValue, ranges[changedRangeIndex - 1][0], capacityChanged);
         }
    }

    private _updateRelation(updatedPeriodType, updatedStartValue, startValue, capacityChanged) {
        var step;

        // The linking is turned on only if we switch to year mode and this means that the offset between periods
        // is a multiple of years in any case, or if the bit width has not changed and the step between periods
        // is a multiple of years.
        if (updatedPeriodType === periodTypes.year || updatedPeriodType === periodTypes.years ||
              (!capacityChanged &&
               updatedStartValue.getFullYear() !== startValue.getFullYear() &&
               updatedStartValue.getMonth() === startValue.getMonth() &&
               updatedStartValue.getDate() === startValue.getDate())) {
           this._relationMode = 'normal';

           // We update steps for calculation of the periods in other controls.
           // If the digit capacity has changed, then adjacent periods are included and the step must be equal to this period.
           if (capacityChanged) {
              step = getPeriodLengthInMonthByType(updatedPeriodType);
           } else {
              step = Math.abs(updatedStartValue.getFullYear() - startValue.getFullYear()) * 12;
           }
           this._resetSteps(step);
        }
    }

    private _updateSteps(dateRanges) {
        this._steps = [];
        for (var i = 0; i < dateRanges.length - 1; i++) {
            this._steps[i] = this._getMonthCount(dateRanges[i][0], dateRanges[i + 1][0]);
        }
    }

    private _resetSteps(step) {
        this._steps = [];
        for (var i = 0; i < this.ranges.length - 1; i++) {
            this._steps.push(step);
        }
    }

    private _getMonthCount(start, end) {
        return end.getFullYear() * 12 + end.getMonth() - start.getFullYear() * 12 - start.getMonth();
    }

    protected _getChangedIndex(ranges: Array<Date>): number {
        for (var i in this.ranges) {
            if (!dateUtils.isDatesEqual(this.ranges[i][0], ranges[i][0]) || !dateUtils.isDatesEqual(this.ranges[i][1], ranges[i][1])) {
                return parseInt(i, 10);
            }
        }
        return -1;
    }

    private _getRangesFromOptions(options) {
        var ranges = [],
            i, j;
        for (var field in options) {
            i = null;
            if (field.indexOf('startValue') === 0) {
                i = parseInt(field.slice(10), 10);
                j = 0;
            } else if (field.indexOf('endValue') === 0) {
                i = parseInt(field.slice(8), 10);
                j = 1;
            }
            if (i !== null) {
                if (!ranges[i]) {
                    ranges[i] = [];
                }
                ranges[i][j] = options[field];
            }
        }
        return ranges;
    }

    private _periodTypeIsDay(periodType) {
        return (periodType === periodTypes.day || periodType === periodTypes.days);
    }

    private _getUpdatedRanges(ranges, rangeIndex, newRange, relationMode, steps) {
        let selectionType = 'months',
            start = newRange[0],
            end = newRange[1],
            oldStart = ranges[rangeIndex][0],
            oldEnd = ranges[rangeIndex][1],
            respRanges = [],
            periodType, periodLength, oldPeriodType, oldPeriodLength,
            step, capacityChanged, control, lastDate, i;

        let getStep = function (number) {
            let s;
            if (selectionType === 'days') {
                return periodLength;
            }
            // In the capacity mode we move the periods as adjacent.
            // In the normal mode, if the capacity has changed and the step is not a multiple of the year
            // and the month of the periods differ or step is not aligned to the new capacity,
            // then we also set adjacent periods.
            if (relationMode === 'byCapacity' ||
                    (capacityChanged && steps[number] % 12 !== 0 && periodLength > oldPeriodLength &&
                        (start.getMonth() !== oldStart.getMonth() || steps[number] % periodLength !== 0))) {
                s = periodLength;
            } else {
                s = steps[number] || periodLength;
            }

            if (s < periodLength) {
                s = periodLength;
            }
            return s;
        };

        if (!start || !end) {
            return;
        }

        periodType = getPeriodType(start, end);
        oldPeriodType = (oldStart && oldEnd) ? getPeriodType(oldStart, oldEnd) : null;

        if (this._periodTypeIsDay(oldPeriodType)) {
            oldPeriodLength = dateRangeUtil.gePeriodLengthInDays(oldStart, oldEnd);
        } else {
            oldPeriodLength = oldPeriodType ? dateRangeUtil.getPeriodLengthInMonths(oldStart, oldEnd) : null;
        }

        if (this._periodTypeIsDay(periodType)) {
            selectionType = 'days';
            periodLength = dateRangeUtil.gePeriodLengthInDays(start, end);
        } else {
            periodLength = periodType ? dateRangeUtil.getPeriodLengthInMonths(start, end) : null;
        }

        if (this._periodTypeIsDay(periodType) && this._periodTypeIsDay(oldPeriodType)) {
            capacityChanged = periodLength !== dateRangeUtil.gePeriodLengthInDays(oldStart, oldEnd);
        } else {
            capacityChanged = periodType !== oldPeriodType;
        }

        // iterate dates in the controls from the current to the first.
        lastDate = start;
        step = 0;
        for (i = 1; i <= rangeIndex; i++) {
            step += getStep(rangeIndex - i);
            control = ranges[rangeIndex - i];
            if (relationMode === 'byCapacity' && !capacityChanged && lastDate > control[1]) {
                respRanges[rangeIndex - i] = ranges[rangeIndex - i];
            } else {
                respRanges[rangeIndex - i] = [
                    //In variable control there is old start and end values,
                    // we send them to check if year has been changed
                    this._slideStartDate(control[0], start, -step, selectionType),
                    this._slideEndDate(control[1], start, -step + periodLength - 1, selectionType, periodLength)
                ];
            }
            lastDate = control[0];
        }

        respRanges[rangeIndex] = newRange;

        // iterate dates in the controls from the first to the current.
        lastDate = end;
        step = 0;
        for (i = 1; i < ranges.length - rangeIndex; i++) {
            step += getStep(rangeIndex + i - 1);
            control = ranges[rangeIndex + i];
            if (relationMode === 'byCapacity' && !capacityChanged && lastDate < control[0]) {
                respRanges[rangeIndex + i] = ranges[rangeIndex + i];
            } else {
                respRanges[rangeIndex + i] = [
                    //In variable control there is old start and end values,
                    // we send them to check if year has been changed
                    this._slideStartDate(control[0], start, step, selectionType),
                    this._slideEndDate(control[1], start, step + periodLength - 1, selectionType, periodLength)
                ];
            }
            lastDate = control[1];
        }
        return respRanges;
    }

    private _slideStartDate(lastDate, date, delta, selectionType) {
        if (selectionType === 'days') {
            //if year has been changed, returns equal dates with different years
            //example: (13.11.2018 - 15.11.2018) - (13.11.2019 - 15.11.2019)
            //else, returns same closest period
            //example: (10.11.2019 - 12.11.2019) - (13.11.2019 - 15.11.2019)
            if (lastDate.getFullYear() !== date.getFullYear()) {
                return new Date(lastDate.getFullYear(), date.getMonth(), date.getDate());
            } else {
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
            }
        }
        return new Date(date.getFullYear(), date.getMonth() + delta, 1);
    }

    private _slideEndDate(lastDate, date, delta, selectionType, periodLength) {
        if (selectionType === 'days') {
            if (lastDate.getFullYear() !== date.getFullYear()) {
                return new Date(lastDate.getFullYear(), date.getMonth(), date.getDate() + periodLength - 1);
            } else {
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
            }
        }
        return new Date(date.getFullYear(), date.getMonth() + delta + 1, 0);
    }
}

export default ModuleClass;
