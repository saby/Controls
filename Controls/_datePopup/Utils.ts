import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import isEmpty = require('Core/helpers/Object/isEmpty');
import {IDateRangeSelectable} from 'Controls/dateRange';

export default {
    /**
     * Returns whether the mode of the year can be displayed
     * @returns {Boolean}
     */
    isYearStateEnabled: (options: object): boolean => {
        const quantum = options.ranges;
        const enabledByQuantum = (options.selectionType === IDateRangeSelectable.SELECTION_TYPES.single
            && options.minRange === IDateRangeSelectable.minRange.month) ||
            (options.selectionType !== IDateRangeSelectable.SELECTION_TYPES.single && (!quantum ||
                (isEmpty(quantum) || 'months' in quantum || 'quarters' in quantum ||
                    'halfyears' in quantum || 'years' in quantum)));
        return enabledByQuantum && options.selectionType !== 'workdays';
    },

    /**
     * Returns whether the month view can be displayed
     * @returns {Boolean}
     */
    isMonthStateEnabled: (options: object): boolean => {
        const quantum = options.ranges;
        return (quantum && ('days' in quantum || 'weeks' in quantum)) ||
            ((!quantum || isEmpty(quantum)) && options.minRange === 'day');
    },

    /**
     * Returns whether the month and year mode switch button can be displayed
     * @returns {Boolean}
     */
    isStateButtonDisplayed: (options: {}): boolean => {
        return this.isYearStateEnabled(options) && this.isMonthStateEnabled(options);
    },

    dateToDataString: (date: Date): string => {
        return formatDate(date, 'YYYY.M');
    },
    dataStringToDate: (str: string): WSDate => {
        const d = str.split('.');
        return new WSDate(d[0], parseInt(d[1], 10) - 1);
    }
};
