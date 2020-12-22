define(
   [
      'Core/core-merge',
      'UI/Utils',
      'Controls/input',
      'ControlsUnit/Calendar/Utils'
   ],
   function(coreMerge, UIUtils, input, testUtils) {

      'use strict';

      let createComponent = function(Component, cfg) {
         let cmp;
         if (Component.getDefaultOptions) {
            cfg = coreMerge(cfg, Component.getDefaultOptions(), { preferSource: true });
         }
         cmp = new Component(cfg);
         cmp.saveOptions(cfg);
         cmp._beforeMount(cfg);
         return cmp;
      };

      describe('Controls/_input/Mask', function() {

         describe('_beforeUpdate', function() {
            [{
               mask: 'dd.dd',
               replacer: ' ',
               value: null,
               startValue: ''
            }, {
               mask: 'dd.dd',
               replacer: ' ',
               value: '',
               startValue: '1234'
            }, {
               mask: 'dd.dd',
               replacer: ' ',
               value: '1234',
               startValue: ''
            }].forEach(function(test) {
               it('should update selection if value changed', function() {
                  var component = createComponent(input.Mask, {
                     value: test.startValue,
                     mask: 'dd.dd',
                     replacer: ' '
                  });
                  component._viewModel.selection = {
                     start: 3,
                     end: 3
                  };
                  component._beforeUpdate(coreMerge(
                     test, input.Mask.getDefaultOptions(), { preferSource: true }));
                  assert.deepEqual(component._viewModel.selection, {
                     start: 0,
                     end: 0
                  });
               });
            });

            it('should not update selection if value changed', function() {
               var component = createComponent(input.Mask, {
                  mask: 'dd.dd',
                  replacer: ' '
               });
               component._viewModel.selection = {
                  start: 3,
                  end: 3
               };
               component._beforeUpdate(coreMerge(
                  {
                     mask: 'dd.dd',
                     replacer: ' '
                  }, input.Mask.getDefaultOptions(), { preferSource: true }
               ));
               assert.deepEqual(component._viewModel.selection, {
                  start: 3,
                  end: 3
               });
            });
         });

         it('validateReplacer', function() {
            var message = '';
            var error = UIUtils.Logger.error;
            var validateReplacer = input.Mask._validateReplacer;

            UIUtils.Logger.error = function(arg1, arg2) {
               message = arg1 + ': ' + arg2;
            };

            assert.equal(validateReplacer('', 'dd.dd'), true);
            assert.equal(message, '');
            assert.equal(validateReplacer(' ', 'dd.dd'), true);
            assert.equal(message, '');
            assert.equal(validateReplacer('', 'd\\*'), true);
            assert.equal(message, '');
            assert.equal(validateReplacer(' ', 'd\\*'), false);
            assert.equal(message, 'Mask: Used not empty replacer and mask with quantifiers. More on https://wi.sbis.ru/docs/js/Controls/_input/Mask/options/replacer/');

            UIUtils.Logger.error = error;
         });

         it('calcReplacer', function() {
            var calcReplacer = input.Mask._calcReplacer;

            assert.equal(calcReplacer(' ', 'dd.dd'), ' ');
            assert.equal(calcReplacer(' ', 'd\\*'), '');
         });

         describe('_focusInHandler', function() {
            it('should set default selection position', function() {
               const sandbox = sinon.sandbox.create();
               var component = createComponent(input.Mask, {
                  mask: 'dd.dd',
                  replacer: ' '
               });
               component._viewModel.selection = {
                  start: 3,
                  end: 3
               };
               sandbox.replace(component, '_getField', function() {
                  return { selectionStart: 0 };
               });
               component._focusInHandler({
                  target: {}
               });
               assert.deepEqual(
                  component._viewModel.selection,
                  {
                     start: 0,
                     end: 0
                  }
               );
               sandbox.restore();
            });
            it('should not set update selection position if the focus was set by a mouse click', function() {
               const
                  sandbox = sinon.sandbox.create(),
                  component = createComponent(input.Mask, {
                     mask: 'dd.dd',
                     replacer: ' '
                  });
               component._viewModel.selection = {
                  start: 3,
                  end: 3
               };
               sandbox.replace(component, '_getField', function() {
                  return { selectionStart: 0 };
               });
               component._mouseDownHandler();
               component._focusInHandler({
                  target: {}
               });
               assert.deepEqual(component._viewModel.selection, {
                  start: 3,
                  end: 3
               });
               sandbox.restore();
            });
         });

         describe('_clickHandler', function() {
            it('should set default selection position', function() {
               const
                  sandbox = sinon.sandbox.create(),
                  component = createComponent(input.Mask, {
                     mask: 'dd.dd',
                     replacer: ' '
                  });
               component._viewModel.selection = {
                  start: 3,
                  end: 3
               };
               sandbox.replace(component, '_getField', function() {
                  return {
                     getFieldData: function(name) {
                        if (name === 'selectionStart') {
                           return 0;
                        }
                     },
                     setSelectionRange: function() {
                     }
                  };
               });
               component._mouseDownHandler();
               component._focusInHandler({
                  target: {}
               });
               component._clickHandler();
               assert.deepEqual(component._viewModel.selection, {
                  start: 0,
                  end: 0
               });
               sandbox.restore();
            });
            it('should not update selection position on click on already focused field', function() {
               const
                  sandbox = sinon.sandbox.create(),
                  component = createComponent(input.Mask, {
                     mask: 'dd.dd',
                     replacer: ' '
                  });
               component._viewModel.selection = {
                  start: 3,
                  end: 3
               };
               sandbox.replace(component, '_getField', function() {
                  return { selectionStart: 0 };
               });
               component._mouseDownHandler();
               component._clickHandler();
               assert.deepEqual(component._viewModel.selection, {
                  start: 3,
                  end: 3
               });
               sandbox.restore();
            });
         });
      });
   }
);
