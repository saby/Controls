import {assert} from 'chai';
import {IText} from 'Controls/decorator';
import {__Util, ISelection, ISplitValue} from 'Controls/input';
import {transliterateInput} from 'Controls/_input/resources/Util';
import {controller as i18Controller} from 'I18n/i18n';

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
    describe('.transliterateSelectedText()', () => {
        const cases = [
            {testName: 'Без выделения текста', revertedText: 'Hello', value: 'Руддщ', expected: 'Hello'},
            {testName: 'С выделением текста', revertedText: 'уд', value: 'Hello', selection: {start: 1, end: 3}, expected: 'Hудlo'},
            {testName: 'С выделением всего текста', revertedText: 'Руддщ', value: 'Hello', selection: {start: 0, end: 5}, expected: 'Руддщ'}
        ];
        const transliterateSelectedText = __Util.transliterateSelectedText;

        cases.forEach((item) => {
            it(item.testName, () => {
                assert.equal(transliterateSelectedText(item.revertedText, item.value, item.selection),
                    item.expected);
            });
        });
    });
    describe('.transliterateInput()', () => {
        const cases = [
            {testName: 'Курсор в конце строки (текст не совпадает с транслитерацией)', value: 'Hello', selection: {start: 5, end: 5}, locale: 'ru-Ru', expected: 'Руддщ'},
            {testName: 'Курсор в конце строки (текст совпадает с транслитерацией)', value: 'Hello', selection: {start: 5, end: 5}, locale: 'en-En', expected: 'Руддщ'},
            {testName: 'Выделен текст (текст не совпадает с транслитерацией)', value: 'Hello', selection: {start: 1, end: 3}, locale: 'ru-RU', expected: 'Hудlo'},
            {testName: 'Выделен текст (текст совпадает с транслитерацией)', value: 'Hello', selection: {start: 1, end: 3}, locale: 'en-En', expected: 'Hудlo'},
            {testName: 'Выделен весь текст (текст не совпадает с транслитерацией)', value: 'Hello', selection: {start: 0, end: 5}, locale: 'ru-RU', expected: 'Руддщ'},
            {testName: 'Выделен весь текст (текст совпадает с транслитерацией)', value: 'Hello', selection: {start: 0, end: 5}, locale: 'en-En', expected: 'Руддщ'}
        ];
        cases.forEach((item) => {
            const i18 = sinon.createSandbox();
            it(item.testName, (done) => {
                i18.replaceGetter(i18Controller, 'currentLocale', () => item.locale);
                transliterateInput(item.value, item.selection).then((value) => {
                    assert.equal(value, item.expected);
                    i18.restore();
                    done();
                });
            });
        });
    });
});
