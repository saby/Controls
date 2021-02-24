import {assert} from 'chai';
import {abbreviateNumber} from 'Controls/_decorator/resources/Formatter';

describe('Controls/decorator:__Formatter', () => {
    describe('.abbreviateNumber()', () => {
        const cases = [
            {testName: 'Значение null', value: null, abbreviationType: 'long', expected: '1,2 млн'},
            {testName: 'Длинная аббревиатура', value: 1240450, abbreviationType: 'long', expected: '1,2 млн'},
            {testName: 'Короткая аббревиатура', value: 1240450, abbreviationType: 'short', expected: '1,2М'},
            {testName: 'Длинная аббревиатура с отрицательным числом', value: -1240450, abbreviationType: 'long', expected: '-1,2 млн'},
            {testName: 'Короткая аббревиатура с отрицательным числом', value: -1240450, abbreviationType: 'short', expected: '-1,2М'},
            {testName: 'Длинная аббревиатура с дробной частью', value: 1240450.45, abbreviationType: 'long', expected: '1,2 млн'},
            {testName: 'Короткая аббревиатура с дробной частью', value: 1240450.45, abbreviationType: 'short', expected: '1,2М'}
        ];

        cases.forEach((item) => {
            it(item.testName, () => {
                // @ts-ignore
                assert.equal(abbreviateNumber(item.value, item.abbreviationType), item.expected);
            });
        });
    });
});
