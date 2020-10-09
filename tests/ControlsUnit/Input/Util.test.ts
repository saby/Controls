import {assert} from 'chai';
import {IText} from 'Controls/decorator';
import {__Util, ISelection, ISplitValue} from 'Controls/input';

describe('Controls/input:__Util', () => {
    describe('textBySplitValue', () => {
        const defaultSV: ISplitValue = {
            before: 'test',
            insert: '',
            after: ' value',
            delete: ''
        };
        const defaultInsert: string = ' test';
        it(`Значение "${defaultSV.before}${defaultSV.after}" без вставки`, () => {
            const actual: IText = __Util.textBySplitValue({...defaultSV});
            const expected: IText = {
                value: 'test value',
                carriagePosition: 4
            };
            assert.deepEqual<IText>(actual, expected);
        });
        it(`Значение "${defaultSV.before}${defaultSV.after}" со вставкой "${defaultInsert}"`, () => {
            const actual = __Util.textBySplitValue({...defaultSV, insert: defaultInsert});
            const expected: IText = {
                value: 'test test value',
                carriagePosition: 9
            };
            assert.deepEqual<IText>(actual, expected);
        });
    });
    describe('splitValueForPasting', () => {
        const carriagePosition: ISelection = {
            start: 2,
            end: 2
        };
        const selection: ISelection = {
            start: 2,
            end: 4
        };
        it('Вставка пустого значения', () => {
            const actual: ISplitValue = __Util.splitValueForPasting('test value', carriagePosition, '');
            const expected: ISplitValue = {
                before: 'te',
                insert: '',
                delete: '',
                after: 'st value'
            };
            assert.deepEqual<ISplitValue>(actual, expected);
        });
        it('Вставка "test"', () => {
            const actual: ISplitValue = __Util.splitValueForPasting('test value', carriagePosition, 'test');
            const expected: ISplitValue = {
                before: 'te',
                insert: 'test',
                delete: '',
                after: 'st value'
            };
            assert.deepEqual<ISplitValue>(actual, expected);
        });
        it('Вставка пустого значения вместо выделенного текста', () => {
            const actual: ISplitValue = __Util.splitValueForPasting('test value', selection, '');
            const expected: ISplitValue = {
                before: 'te',
                insert: '',
                delete: 'st',
                after: ' value'
            };
            assert.deepEqual<ISplitValue>(actual, expected);
        });
        it('Вставка "test" вместо выделенного текста', () => {
            const actual: ISplitValue = __Util.splitValueForPasting('test value', selection, 'test');
            const expected: ISplitValue = {
                before: 'te',
                insert: 'test',
                delete: 'st',
                after: ' value'
            };
            assert.deepEqual<ISplitValue>(actual, expected);
        });
    });
    describe('hasSelectionChanged', () => {
        const carriagePosition: number = 10;
        it('Изначально есть выделение', () => {
            const actual: boolean = __Util.hasSelectionChanged({
                start: 0,
                end: 5
            }, carriagePosition);
            assert.isTrue<boolean>(actual);
        });
        it('Позиция начала и конца выделение совпадают, но не равна позиции каретки.', () => {
            const actual: boolean = __Util.hasSelectionChanged({
                start: 0,
                end: 5
            }, carriagePosition);
            assert.isTrue<boolean>(actual);
        });
    });
});
