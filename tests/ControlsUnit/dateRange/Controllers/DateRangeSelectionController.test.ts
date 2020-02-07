import DateRangeSelectionController from 'Controls/_dateRange/Controllers/DateRangeSelectionController';
import calendarTestUtils = require('ControlsUnit/Calendar/Utils');

describe('Controls/_dateRange/Controllers/DateRangeSelectionController', () => {
    describe('_beforeUpdate', () => {
        [{
            initialOptions: {
                startValue: new Date(2020, 0, 1),
                endValue: new Date(2020, 0, 1)
            },
            newOptions: {
                startValue: new Date(2020, 0, 1),
                endValue: new Date(2020, 0, 31)
            },
            state: {
                startValue: new Date(2020, 0, 1),
                endValue: new Date(2020, 0, 31),
                displayedStartValue: new Date(2020, 0, 1),
                displayedEndValue: new Date(2020, 0, 31)
            }
        }].forEach((test, i) => {
            it(`should set proper state for options ${JSON.stringify(test.initialOptions)} -> ${JSON.stringify(test.newOptions)}.`, () => {
                const
                    component: DateRangeSelectionController =
                        calendarTestUtils.createComponent(DateRangeSelectionController, test.initialOptions);

                component._beforeUpdate(test.newOptions);

                for (const field in test.state) {
                    assert.strictEqual(+component['_' + field], +test.state[field], `${field} field error, not equals ${component['_' + field]} and ${test.state[field]}`);
                }
            });
        });
    });
});
