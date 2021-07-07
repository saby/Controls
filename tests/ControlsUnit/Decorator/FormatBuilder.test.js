define(
   [
      'Controls/decorator'
   ],
   function(decorator) {
      'use strict';

      describe('Controls.decorator:MaskFormatBuilder', function() {
         const MaskFormatBuilder = decorator.FormatBuilder;

         it('PAIR_DELIMITERS', function() {
            assert.equal(MaskFormatBuilder.PAIR_DELIMITERS, '(){}[]⟨⟩<>\'\'""«»„“‘’””');
         });

         it('getMaskParsing', function() {
            const actual = MaskFormatBuilder.getMaskParsing('Lldx');
            assert.deepEqual(actual, /([Lldx])(?:\\({.*?}|.))?|([\(\)\{\}\[\]⟨⟩<>''""«»„“‘’””])|(.)/g);
         });

         describe('getMaskKeys', function() {
            it('Empty object', function() {
               const actual = MaskFormatBuilder.getMaskKeys({});
               assert.equal(actual, '');
            });
            it('Fill object', function() {
               const actual = MaskFormatBuilder.getMaskKeys({
                  'd': '[0-9]',
                  'l': '[a-z]'
               });
               assert.equal(actual, 'dl');
            });
         });

         describe('delimiterSubtype', function() {
            it('Open', function() {
               const actual = MaskFormatBuilder.delimiterSubtype('(');
               assert.equal(actual, 'open');
            });
            it('Close', function() {
               const actual = MaskFormatBuilder.delimiterSubtype(')');
               assert.equal(actual, 'close');
            });
            it('Error', function() {
               const actual = MaskFormatBuilder.delimiterSubtype.bind(MaskFormatBuilder, '-');
               assert.throws(actual, Error, 'Неверно указан разделитель. Он должен быть парным.');
            });
         });
         describe('pairOfDelimiter', function() {
            it('Open', function() {
               const actual = MaskFormatBuilder.pairOfDelimiter('(', 'open');
               assert.equal(actual, ')');
            });
            it('Close', function() {
               const actual = MaskFormatBuilder.pairOfDelimiter(')', 'close');
               assert.equal(actual, '(');
            });
            it('Error subtype open', function() {
               const actual = MaskFormatBuilder.pairOfDelimiter.bind(MaskFormatBuilder, ')', 'open');
               assert.throws(actual, Error, 'Неверно указан разделитель или его подтип.');
            });
            it('Error subtype close', function() {
               const actual = MaskFormatBuilder.pairOfDelimiter.bind(MaskFormatBuilder, '(', 'close');
               assert.throws(actual, Error, 'Неверно указан разделитель или его подтип.');
            });
         });

         describe('getCharData', function() {
            it('Key', function() {
               const actual = MaskFormatBuilder.getCharData(['d', 'd', undefined, undefined, undefined]);
               assert.deepEqual(actual, {
                  type: 'key',
                  value: 'd',
                  quantifier: ''
               });
            });
            it('Key and quantifier', function() {
               const actual = MaskFormatBuilder.getCharData(['d\\{2}', 'd', '{2}', undefined, undefined]);
               assert.deepEqual(actual, {
                  type: 'key',
                  value: 'd',
                  quantifier: '{2}'
               });
            });
            it('Open pair delimiter', function() {
               const actual = MaskFormatBuilder.getCharData(['(', undefined, undefined, '(', undefined]);
               assert.deepEqual(actual, {
                  type: 'pairDelimiter',
                  value: '(',
                  pair: ')',
                  subtype: 'open'
               });
            });
            it('Close pair delimiter', function() {
               const actual = MaskFormatBuilder.getCharData([')', undefined, undefined, ')', undefined]);
               assert.deepEqual(actual, {
                  type: 'pairDelimiter',
                  value: ')',
                  pair: '(',
                  subtype: 'close'
               });
            });
            it('Single delimiter', function() {
               const actual = MaskFormatBuilder.getCharData(['-', undefined, undefined, undefined, '-']);
               assert.deepEqual(actual, {
                  type: 'singleDelimiter',
                  value: '-'
               });
            });
            it('Error', function() {
               const actual = MaskFormatBuilder.getCharData.bind(MaskFormatBuilder, ['', undefined, undefined, undefined, undefined]);
               assert.throws(actual, Error, 'Неверный массив результатов после разбора символа маски.');
            });
         });

         describe('getReplacingKeyAsValue', function() {
            const formatMaskChars = {
               'd': '[0-9]'
            };
            it('Key', function() {
               const actual = MaskFormatBuilder.getReplacingKeyAsValue(formatMaskChars, 'd', '');
               assert.equal(actual, '[0-9]');
            });
            it('Key and quantifier', function() {
               const actual = MaskFormatBuilder.getReplacingKeyAsValue(formatMaskChars, 'd', '{2}');
               assert.equal(actual, '[0-9]{2}');
            });
         });

         describe('getReplacingKeyAsValueOrReplacer', function() {
            const formatMaskChars = {
               'd': '[0-9]'
            };
            it('Key', function() {
               const actual = MaskFormatBuilder.getReplacingKeyAsValueOrReplacer(formatMaskChars, '_', 'd', '');
               assert.equal(actual, '(?:[0-9]|_)');
            });
            it('Key and quantifier', function() {
               const actual = MaskFormatBuilder.getReplacingKeyAsValueOrReplacer(formatMaskChars, '_', 'd', '{2}');
               assert.equal(actual, '(?:[0-9]|_){2}');
            });
         });

         describe('getReplacingKeyFn', function() {
            const formatMaskChars = {
               'd': '[0-9]'
            };
            it('Empty replacer', function() {
               const actual = MaskFormatBuilder.getReplacingKeyFn(formatMaskChars, '');
               assert.equal(actual.name, 'bound getReplacingKeyAsValue');
            });
            it('Not empty replacer', function() {
               const actual = MaskFormatBuilder.getReplacingKeyFn(formatMaskChars, '_');
               assert.equal(actual.name, 'bound getReplacingKeyAsValueOrReplacer');
            });
         });
         describe('getFormat', function() {
            const formatMaskChars = {
               'd': '[0-9]',
               'l': '[а-яa-zё]'
            };
            it('dl.ld without replacer', function() {
               const actual = MaskFormatBuilder.getFormat('dl.ld', formatMaskChars, '');
               assert.equal(actual.searchingGroups, '^(?:([0-9][а-яa-zё])(\\.?)([а-яa-zё][0-9])|([0-9][а-яa-zё])(\\.?)([а-яa-zё])|([0-9][а-яa-zё])(\\.?)|([0-9])|)$');
               assert.deepEqual(actual.delimiterGroups, {
                  1: {
                     value: '.',
                     type: 'singleDelimiter'
                  }
               });
            });
            it('dl.ld with replacer', function() {
               const actual = MaskFormatBuilder.getFormat('dl.ld', formatMaskChars, '_');
               assert.equal(actual.searchingGroups, '^(?:((?:[0-9]|_)(?:[а-яa-zё]|_))(\\.?)((?:[а-яa-zё]|_)(?:[0-9]|_)))$');
               assert.deepEqual(actual.delimiterGroups, {
                  1: {
                     value: '.',
                     type: 'singleDelimiter'
                  }
               });
            });
            it('(dd)-[ll] without replacer', function() {
               const actual = MaskFormatBuilder.getFormat('(dd)-[ll]', formatMaskChars, '');
               assert.equal(actual.searchingGroups, '^(?:(\\(?)([0-9][0-9])(\\)?)(-?)(\\[?)([а-яa-zё][а-яa-zё])(\\]?)|(\\(?)([0-9][0-9])(\\)?)(-?)(\\[?)([а-яa-zё])|(\\(?)([0-9][0-9])(\\)?)(-?)(\\[?)|(\\(?)([0-9])|(\\(?))$');
               assert.deepEqual(actual.delimiterGroups, {
                  0: {
                     value: '(',
                     type: 'pairDelimiter',
                     subtype: 'open',
                     pair: ')'
                  },
                  2: {
                     value: ')',
                     type: 'pairDelimiter',
                     subtype: 'close',
                     pair: '('
                  },
                  3: {
                     value: '-',
                     type: 'singleDelimiter'
                  },
                  4: {
                     value: '[',
                     type: 'pairDelimiter',
                     subtype: 'open',
                     pair: ']'
                  },
                  6: {
                     value: ']',
                     type: 'pairDelimiter',
                     subtype: 'close',
                     pair: '['
                  }
               });
            });
            it('(dd)-[ll] with replacer', function() {
               const actual = MaskFormatBuilder.getFormat('(dd)-[ll]', formatMaskChars, '_');
               assert.equal(actual.searchingGroups, '^(?:(\\(?)((?:[0-9]|_)(?:[0-9]|_))(\\)?)(-?)(\\[?)((?:[а-яa-zё]|_)(?:[а-яa-zё]|_))(\\]?))$');
               assert.deepEqual(actual.delimiterGroups, {
                  0: {
                     value: '(',
                     type: 'pairDelimiter',
                     subtype: 'open',
                     pair: ')'
                  },
                  2: {
                     value: ')',
                     type: 'pairDelimiter',
                     subtype: 'close',
                     pair: '('
                  },
                  3: {
                     value: '-',
                     type: 'singleDelimiter'
                  },
                  4: {
                     value: '[',
                     type: 'pairDelimiter',
                     subtype: 'open',
                     pair: ']'
                  },
                  6: {
                     value: ']',
                     type: 'pairDelimiter',
                     subtype: 'close',
                     pair: '['
                  }
               });
            });
            it('Error', function() {
               const actual = MaskFormatBuilder.getFormat.bind(MaskFormatBuilder, '(d[d)]', formatMaskChars, '');
               assert.throws(actual, Error, 'Неверный формат парных разделителей. Открытые и закрытые не соответствуют друг другу.');
            });
         });
      });
   }
);
