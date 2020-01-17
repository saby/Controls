define([
   'Controls/_input/Mask/FormatterValue'
],
function(FormatterValue) {
   'use strict';

   describe('Controls/_input/Mask/FormatterValue', function() {
      const defaultFormatMaskChars = {
         'L': '[А-ЯA-ZЁ]',
         'l': '[а-яa-zё]',
         'd': '[0-9]',
         'x': '[А-ЯA-Zа-яa-z0-9ёЁ]'
      };
      describe('formattedValueToValue', function() {
         const formattedValueToValue = FormatterValue.formattedValueToValue;
         it('Test1', function() {
            const value = formattedValueToValue('874-998-877546', {
               replacer: ' ',
               mask: 'ddd-ddd-dddddd',
               formatMaskChars: defaultFormatMaskChars
            });

            assert.equal(value, '874998877546');
         });
         it('Test2', function() {
            const value = formattedValueToValue('8 4-9 8-   546', {
               replacer: ' ',
               mask: 'ddd-ddd-dddddd',
               formatMaskChars: defaultFormatMaskChars
            });

            assert.equal(value, '8 49 8   546');
         });
         it('Test3', function() {
            const value = formattedValueToValue('123456', {
               replacer: '',
               mask: 'ddd-ddd-dddddd',
               formatMaskChars: defaultFormatMaskChars
            });

            assert.equal(value, '123456');
         });
         it('Test4', function() {
            const value = formattedValueToValue('123456 123456', {
               replacer: '',
               mask: 'ddd-ddd-dddddd',
               formatMaskChars: defaultFormatMaskChars
            });

            assert.equal(value, '');
         });
         it('Test5', function() {
            const value = formattedValueToValue('123456 123456', {
               replacer: ' ',
               mask: 'ddd-ddd-dddddd',
               formatMaskChars: defaultFormatMaskChars
            });

            assert.equal(value, '   -   -      ');
         });
      });
   });
});
