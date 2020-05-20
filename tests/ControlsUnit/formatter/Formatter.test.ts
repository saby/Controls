import {assert} from 'chai';
import {
    FormatBuilder as MaskFormatBuilder,
    Formatter as MaskFormatter,
    getDefaultMaskOptions
} from 'Controls/decorator';

describe('Controls.formatter:MaskFormatter', () => {
    const formatMaskChars = getDefaultMaskOptions().formatMaskChars;
    const dateFormat = MaskFormatBuilder.getFormat('dd.dd', formatMaskChars, ' ');
    const formatWithQuantifiers = MaskFormatBuilder.getFormat('(d\\*l\\{0,3})(d\\{0,3}l\\*)', formatMaskChars, '');
    const mobileFormatWithReplacer = MaskFormatBuilder.getFormat('+7(ddd)ddd-dd-dd', formatMaskChars, ' ');
    const mobileFormatWithoutReplacer = MaskFormatBuilder.getFormat('+7(ddd)ddd-dd-dd', formatMaskChars, '');
    const nestedFormatWithReplacer = MaskFormatBuilder.getFormat('(ddd(ddd)ddd)', formatMaskChars, ' ');
    const nestedFormatWithoutReplacer = MaskFormatBuilder.getFormat('(ddd(ddd)ddd)', formatMaskChars, '');

    describe('splitValue', () => {
        it('Date format.', () => {
            const actual = MaskFormatter.splitValue(dateFormat, '1 .3 ');
            assert.deepEqual(actual, ['1 ', '.', '3 ']);
        });
        it('Mobile format without replacer.', () => {
            const actual = MaskFormatter.splitValue(mobileFormatWithoutReplacer, '+7(915)972-11-61');
            assert.deepEqual(actual, ['+', '7', '(', '915', ')', '972', '-', '11', '-', '61']);
        });
        it('Mobile format with replacer.', () => {
            const actual = MaskFormatter.splitValue(mobileFormatWithReplacer, '+7(   )972-  -61');
            assert.deepEqual(actual, ['+', '7', '(', '   ', ')', '972', '-', '  ', '-', '61']);
        });
        it('Format without the replacer with nested delimiters.', () => {
            const actual = MaskFormatter.splitValue(nestedFormatWithoutReplacer, '(123(456)789)');
            assert.deepEqual(actual, ['(', '123', '(', '456', ')', '789', ')']);
        });
        it('Format with the replacer and nested delimiters.', () => {
            const actual = MaskFormatter.splitValue(nestedFormatWithReplacer, '(123(   )789)');
            assert.deepEqual(actual, ['(', '123', '(', '   ', ')', '789', ')']);
        });
        it('Format with quantifiers.', () => {
            const actual = MaskFormatter.splitValue(formatWithQuantifiers, '(1234qwe)(567rtyu)');
            assert.deepEqual(actual, ['(', '1234qwe', ')', '(', '567rtyu', ')']);
        });
        it('Error', () => {
            const actual = MaskFormatter.splitValue.bind(MaskFormatter, dateFormat, 'qw.er');
            assert.throws(actual, Error, 'Значение не соответствует формату маски.');
        });
    });

    describe('clearData', () => {
        it('Date format.', () => {
            const actual = MaskFormatter.clearData(dateFormat, '1 .3 ');
            assert.deepEqual(actual, {
                value: '1 3 ',
                positions: [0, 1, 2, 2, 3]
            });
        });
        it('Mobile format without replacer.', () => {
            const actual = MaskFormatter.clearData(mobileFormatWithoutReplacer, '+7(915)972-11-61');
            assert.deepEqual(actual, {
                value: '9159721161',
                positions: [0, 0, 0, 0, 1, 2, 3, 3, 4, 5, 6, 6, 7, 8, 8, 9]
            });
        });
        it('Mobile format with replacer.', () => {
            const actual = MaskFormatter.clearData(mobileFormatWithReplacer, '+7(   )972-  -61');
            assert.deepEqual(actual, {
                value: '   972  61',
                positions: [0, 0, 0, 0, 1, 2, 3, 3, 4, 5, 6, 6, 7, 8, 8, 9]
            });
        });
        it('Format without the replacer with nested delimiters.', () => {
            const actual = MaskFormatter.clearData(nestedFormatWithoutReplacer, '(123(456)789)');
            assert.deepEqual(actual, {
                value: '123456789',
                positions: [0, 0, 1, 2, 3, 3, 4, 5, 6, 6, 7, 8, 9]
            });
        });
        it('Format with the replacer and nested delimiters.', () => {
            const actual = MaskFormatter.clearData(nestedFormatWithReplacer, '(123(   )789)');
            assert.deepEqual(actual, {
                value: '123   789',
                positions: [0, 0, 1, 2, 3, 3, 4, 5, 6, 6, 7, 8, 9]
            });
        });
        it('Format with quantifiers.', () => {
            const actual = MaskFormatter.clearData(formatWithQuantifiers, '(1234qwe)(567rtyu)');
            assert.deepEqual(actual, {
                value: '1234qwe567rtyu',
                positions: [0, 0, 1, 2, 3, 4, 5, 6, 7, 7, 7, 8, 9, 10, 11, 12, 13, 14]
            });
        });
    });

    describe('formatData', () => {
        it('Date format.', () => {
            const actual = MaskFormatter.formatData(dateFormat, {
                value: '1 3 ',
                carriagePosition: 3
            });
            assert.deepEqual(actual, {
                value: '1 .3 ',
                carriagePosition: 4
            });
        });
        it('Mobile format without replacer.', () => {
            const actual = MaskFormatter.formatData(mobileFormatWithoutReplacer, {
                value: '915972',
                carriagePosition: 5
            });
            assert.deepEqual(actual, {
                value: '+7(915)972',
                carriagePosition: 9
            });
        });
        it('Mobile format with replacer.', () => {
            const actual = MaskFormatter.formatData(mobileFormatWithReplacer, {
                value: '   972  61',
                carriagePosition: 5
            });
            assert.deepEqual(actual, {
                value: '+7(   )972-  -61',
                carriagePosition: 9
            });
        });
        it('Format without the replacer with nested delimiters.', () => {
            const actual = MaskFormatter.formatData(nestedFormatWithoutReplacer, {
                value: '123456789',
                carriagePosition: 9
            });
            assert.deepEqual(actual, {
                value: '(123(456)789)',
                carriagePosition: 12
            });
        });
        it('Format with the replacer and nested delimiters.', () => {
            const actual = MaskFormatter.formatData(nestedFormatWithReplacer, {
                value: '123   789',
                carriagePosition: 4
            });
            assert.deepEqual(actual, {
                value: '(123(   )789)',
                carriagePosition: 6
            });
        });
        it('Format with quantifiers.', () => {
            const actual = MaskFormatter.formatData(formatWithQuantifiers, {
                value: '1234qwe567rtyu',
                carriagePosition: 9
            });
            assert.deepEqual(actual, {
                value: '(1234qwe)(567rtyu)',
                carriagePosition: 12
            });
        });
        it('Mobile format without replacer. The cursor at the beginning of the front delimiter.', () => {
            const actual = MaskFormatter.formatData(mobileFormatWithoutReplacer, {
                value: '1234567890',
                carriagePosition: 0
            });
            assert.deepEqual(actual, {
                value: '+7(123)456-78-90',
                carriagePosition: 3
            });
        });
    });
});
