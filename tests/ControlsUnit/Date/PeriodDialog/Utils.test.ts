import datePopupUtils from 'Controls/_datePopup/Utils';
import dateUtils = require('Controls/dateUtils');
import {IDateRangeSelectable} from 'Controls/dateRange';

describe('Controls/_datePopup/Utils', function() {
    describe('dataStringToDate', function() {
        [{
            str: '2019.1',
            date: new Date(2019, 0, 1)
        }, {
            str: '2019.12',
            date: new Date(2019, 11, 1)
        }].forEach(function(test) {
            it('should create the correct models when empty range passed.', function() {
                assert(dateUtils.Base.isDatesEqual(datePopupUtils.dataStringToDate(test.str), test.date));
            });
        });
    });

    describe('isMonthStateEnabled', () => {
        [{
            options: { minRange: 'day' },
            isEnabled: true
        }, {
            options: { quantum: {}, minRange: 'day' },
            isEnabled: true
        }, {
            options: { quantum: { days: [1] } },
            isEnabled: true
        }, {
            options: { quantum: { weeks: [1] } },
            isEnabled: true
        }, {
            options: { minRange: 'month' },
            isEnabled: false
        }].forEach((test) => {
            it(`should return ${test.isEnabled} if ${test.options} passed.`, () => {
                assert.equal(datePopupUtils.isMonthStateEnabled(test.options), test.isEnabled);
            });
        });
    });

    describe('isYearStateEnabled', () => {
        [{
            options: {
                selectionType: IDateRangeSelectable.SELECTION_TYPES.single,
                minRange: IDateRangeSelectable.minRange.month
            },
            isEnabled: true
        }, {
            options: { selectionType: IDateRangeSelectable.SELECTION_TYPES.range },
            isEnabled: true
        }, {
            options: {
                selectionType: IDateRangeSelectable.SELECTION_TYPES.range,
                quantum: {}
            },
            isEnabled: true
        }, {
            options: {
                selectionType: IDateRangeSelectable.SELECTION_TYPES.range,
                quantum: { months: [1] }
            },
            isEnabled: true
        }].forEach((test) => {
            it(`should return ${test.isEnabled} if ${test.options} passed.`, () => {
                assert.equal(datePopupUtils.isYearStateEnabled(test.options), test.isEnabled);
            });
        });
    });
});
