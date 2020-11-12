define(
   [
      'Controls/decorator'
   ],
   function(RegExpUtil) {

      'use strict';
      describe('Controls/_decorator/inputUtils/RegExp', function() {
         var result;

         describe('escapeSpecialChars', function() {
            it('Test_01', function() {
               result = RegExpUtil.escapeSpecialChars('');
               assert.equal(result, '');
            });
            it('Test_02', function() {
               result = RegExpUtil.escapeSpecialChars('123456789');
               assert.equal(result, '123456789');
            });
            it('Test_03', function() {
               result = RegExpUtil.escapeSpecialChars('\\1(2)3{4}5+6.7*8[9]|0$^1');
               assert.equal(result, '\\\\1\\(2\\)3\\{4\\}5\\+6\\.7\\*8\\[9\\]\\|0\\$\\^1');
            });
         });
         describe('partOfNumber', function() {
            var calculate = function(value) {
               return value.match(RegExpUtil.partOfNumber).slice(0, 5);
            };

            it('Empty value.', function() {
               assert.deepEqual(calculate(''), ['', '', '', '', '']);
            });
            it('Non-negative integer value.', function() {
               assert.deepEqual(calculate('100'), ['100', '', '100', '', '']);
            });
            it('Negative integer value.', function() {
               assert.deepEqual(calculate('-100'), ['-100', '-', '100', '', '']);
            });
            it('Non-negative float value.', function() {
               assert.deepEqual(calculate('100.100'), ['100.100', '', '100', '.', '100']);
            });
            it('Negative float value.', function() {
               assert.deepEqual(calculate('-100.100'), ['-100.100', '-', '100', '.', '100']);
            });
            it('Non-negative float value separated by comma.', function() {
               assert.deepEqual(calculate('100,100'), ['100,100', '', '100', ',', '100']);
            });
            it('Negative float value separated by comma.', function() {
               assert.deepEqual(calculate('-100,100'), ['-100,100', '-', '100', ',', '100']);
            });
         });
      });
   }
);
