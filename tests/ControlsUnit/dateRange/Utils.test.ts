import Utils from 'Controls/_dateRange/Utils';
import {assert} from 'chai';

describe('Controls/_dateRange/Utils', () => {

    describe('getWeekdaysCaptions', () => {
        it('should return default locale', () => {
            const resp = Utils.getWeekdaysCaptions();
            const captions = [
                {
                    'caption': 'пн',
                    'weekend': false,
                    'day': 0
                },
                {
                    'caption': 'вт',
                    'weekend': false,
                    'day': 1
                },
                {
                    'caption': 'ср',
                    'weekend': false,
                    'day': 2
                },
                {
                    'caption': 'чт',
                    'weekend': false,
                    'day': 3
                },
                {
                    'caption': 'пт',
                    'weekend': false,
                    'day': 4
                },
                {
                    'caption': 'сб',
                    'weekend': true,
                    'day': 5
                },
                {
                    'caption': 'вс',
                    'weekend': true,
                    'day': 6
                }
            ];
            assert.deepEqual(resp, captions);
        });

    });

});
