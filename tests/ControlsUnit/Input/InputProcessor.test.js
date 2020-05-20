define(
   [
      'Controls/decorator',
      'Controls/input'
   ],
   function(formatter, inputMod) {

      'use strict';

      describe('Controls/_input/Mask/InputProcessor', function() {
         var
            Formatter = formatter.Formatter,
            replacer = ' ',
            format = inputMod.MaskFormatBuilder.getFormat('dd.dd', {
               d: '[0-9]'
            }, replacer),
            telepfoneFormat = inputMod.MaskFormatBuilder.getFormat('+7 (ddd)ddd-dd-dd', {
               d: '[0-9]'
            }, ''),
            clearData = Formatter.getClearData(format, '1 . 4'),
            result;

         describe('getClearSplitValue', function() {
            it('Test_01', function() {
               result = inputMod.MaskInputProcessor.getClearSplitValue({
                  before: '1',
                  after: '. 4',
                  delete: ' ',
                  insert: '2'
               }, clearData);
               assert.deepEqual(result, {
                  before: '1',
                  after: ' 4',
                  delete: ' ',
                  insert: '2'
               });
            });
         });
         describe('input', function() {
            describe('insert', function() {
               it('Test_01', function() {
                  result = inputMod.MaskInputProcessor.input({
                     before: '1',
                     after: '.3 ',
                     delete: ' ',
                     insert: '2'
                  }, 'insert', replacer, format, format);
                  assert.deepEqual(result, {
                     value: '12. 3',
                     position: 3,
                     format: format
                  });
               });
               it('Test_02', function() {
                  result = inputMod.MaskInputProcessor.input({
                     before: '1 . ',
                     after: '4',
                     delete: '',
                     insert: 'g2'
                  }, 'insert', replacer, format, format);
                  assert.deepEqual(result, {
                     value: '1 . 2',
                     position: 5,
                     format: format
                  });
               });
               it('Test_03', function() {
                  var format = inputMod.MaskFormatBuilder.getFormat('dd.dd', {
                     d: '[0-9]'
                  }, '');
                  result = inputMod.MaskInputProcessor.input({
                     before: '1',
                     after: '3',
                     delete: '',
                     insert: '2'
                  }, 'insert', '', format, format);
                  assert.deepEqual(result, {
                     value: '12.3',
                     position: 3,
                     format: format
                  });
               });
               it('Test_04', function() {
                  var newFormat = inputMod.MaskFormatBuilder.getFormat('dd-dd', {
                     d: '[0-9]'
                  }, '');
                  var oldFormat = inputMod.MaskFormatBuilder.getFormat('dd-dd-dd', {
                     d: '[0-9]'
                  }, '');
                  result = inputMod.MaskInputProcessor.input({
                     before: '',
                     after: '',
                     delete: '12-34-56',
                     insert: '4'
                  }, 'insert', '', oldFormat, newFormat);
                  assert.deepEqual(result, {
                     value: '4',
                     position: 1,
                     format: newFormat
                  });
               });
               it('Test_05', function() {
                  var newFormat = inputMod.MaskFormatBuilder.getFormat('dd-dd', {
                     d: '[0-9]'
                  }, '');
                  var oldFormat = inputMod.MaskFormatBuilder.getFormat('dd-dd-dd', {
                     d: '[0-9]'
                  }, '');
                  result = inputMod.MaskInputProcessor.input({
                     before: '',
                     after: '',
                     delete: '12-34-56',
                     insert: 'f'
                  }, 'insert', '', oldFormat, newFormat);
                  console.log(result);
                  assert.deepEqual(result, {
                     value: '12-34-56',
                     position: 8,
                     format: oldFormat
                  });
               });
               it('Test_06', function() {
                  var newFormat = inputMod.MaskFormatBuilder.getFormat('dd-dd', {
                     d: '[0-9]'
                  }, ' ');
                  var oldFormat = inputMod.MaskFormatBuilder.getFormat('dd-dd-dd', {
                     d: '[0-9]'
                  }, ' ');
                  result = inputMod.MaskInputProcessor.input({
                     after: '',
                     before: '111111',
                     delete: '',
                     insert: ''
                  }, 'insert', '', oldFormat, newFormat);
                  result = inputMod.MaskInputProcessor.input({
                     after: replacer + replacer + replacer + replacer + replacer + replacer,
                     before: '',
                     delete: '',
                     insert: ''
                  }, 'delete', '', oldFormat, newFormat);
                  result = inputMod.MaskInputProcessor.input({
                     after: replacer + replacer + replacer + replacer,
                     before: '11',
                     delete: '',
                     insert: ''
                  }, 'insert', '', oldFormat, newFormat);
                  console.log(result);
                  assert.deepEqual(result, {
                     value: `11${replacer}${replacer}${replacer}${replacer}`,
                     position: 2,
                     format: oldFormat
                  });
               });

               [{
                  splitValue: {
                     after: "",
                     before: "+7 ",
                     delete: "",
                     insert: "+7 (123) 323-02-32"
                  },
                  format: telepfoneFormat,
                  result: { value: '+7(123) 323-02-32', position: 18 }
               }].forEach(function(test, testNumber) {
                  it(`Test_${testNumber}`, function() {
                     result = inputMod.MaskInputProcessor.input(test.splitValue, 'insert', '', test.format, test.format);
                     assert.equal(result.value, result.value);
                     assert.equal(result.position, result.position);
                  });
               })
            });
            describe('delete', function() {
               it('Test_01', function() {
                  result = inputMod.MaskInputProcessor.input({
                     before: '',
                     after: '',
                     delete: '1 . 4',
                     insert: ''
                  }, 'delete', replacer, format, format);
                  assert.deepEqual(result, {
                     value: '  .  ',
                     position: 0,
                     format: format
                  });
               });
            });
            describe('deleteForward', function() {
               it('Test_01', function() {
                  result = inputMod.MaskInputProcessor.input({
                     before: '1',
                     after: '. 4',
                     delete: '2',
                     insert: ''
                  }, 'deleteForward', replacer, format, format);
                  assert.deepEqual(result, {
                     value: '1 . 4',
                     position: 3,
                     format: format
                  });
               });
               it('Test_02', function() {
                  result = inputMod.MaskInputProcessor.input({
                     before: '12',
                     after: '34',
                     delete: '.',
                     insert: ''
                  }, 'deleteForward', replacer, format, format);
                  assert.deepEqual(result, {
                     value: '12. 4',
                     position: 4,
                     format: format
                  });
               });
            });
            describe('deleteBackward', function() {
               it('Test_01', function() {
                  result = inputMod.MaskInputProcessor.input({
                     before: '1',
                     after: '.34',
                     delete: '2',
                     insert: ''
                  }, 'deleteBackward', replacer, format, format);
                  assert.deepEqual(result, {
                     value: '1 .34',
                     position: 1,
                     format: format
                  });
               });
               it('Test_02', function() {
                  result = inputMod.MaskInputProcessor.input({
                     before: '12',
                     after: '34',
                     delete: '.',
                     insert: ''
                  }, 'deleteBackward', replacer, format, format);
                  assert.deepEqual(result, {
                     value: '1 .34',
                     position: 1,
                     format: format
                  });
               });
            });
         });
      });
   }
);
