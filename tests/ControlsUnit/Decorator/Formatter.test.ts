import {assert} from 'chai';
import {abbreviateNumber} from 'Controls/_decorator/resources/Formatter';

describe('Controls/decorator:__Formatter', () => {
    describe.skip('.abbreviateNumber()', () => {
        const cases = [
            {testName: 'Значение null', value: null, abbreviationType: 'long', expected: '0'},
            {testName: 'Длинная аббревиатура', value: 1240450, abbreviationType: 'long', expected: '1,2 млн'},
            {testName: 'Короткая аббревиатура', value: 1240450, abbreviationType: 'short', expected: '1,2М'},
            {testName: 'Длинная аббревиатура с отрицательным числом', value: -1240450, abbreviationType: 'long', expected: '-1,2 млн'},
            {testName: 'Короткая аббревиатура с отрицательным числом', value: -1240450, abbreviationType: 'short', expected: '-1,2М'},
            {testName: 'Длинная аббревиатура с дробной частью', value: 1240450.45, abbreviationType: 'long', expected: '1,2 млн'},
            {testName: 'Короткая аббревиатура с дробной частью', value: 1240450.45, abbreviationType: 'short', expected: '1,2М'},
            {testName: 'Длинная аббревиатура с числом, неподходящим для аббревиатуры', value: 500, abbreviationType: 'long', expected: '500'},
            {testName: 'Короткая аббревиатура с числом, неподходящим для аббревиатуры', value: 500, abbreviationType: 'short', expected: '500'},
            {testName: 'Длинная аббревиатура числа с дробной частью, неподходящим для аббревиатуры', value: 500.23, abbreviationType: 'long', expected: '500'},
            {testName: 'Короткая аббревиатура числа с дробной частью, неподходящим для аббревиатуры', value: 500.23, abbreviationType: 'short', expected: '500'},
            {testName: 'Длинная аббревиатура с отрицательным числом, неподходящим для аббревиатуры', value: -500, abbreviationType: 'long', expected: '-500'},
            {testName: 'Короткая аббревиатура с отрицательным числом, неподходящим для аббревиатуры', value: -500, abbreviationType: 'short', expected: '-500'}
        ];

        cases.forEach((item) => {
            it(item.testName, () => {
                assert.equal(abbreviateNumber(item.value, item.abbreviationType), item.expected);
            });
        });
    });
});
