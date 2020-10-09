define(
   [
      'Core/core-instance',
      'Controls/input',
      'ControlsUnit/resources/TemplateUtil',
      'ControlsUnit/Input/Base/InputUtility',
      'wml!ControlsUnit/Input/Money/ZeroValueTest',
      'wml!ControlsUnit/Input/Money/EmptyValueTest'
   ],
   function(instance, input, TemplateUtil, InputUtility, zeroValueTemplate, emptyValueTemplate) {
      'use strict';

      describe('Controls/_input/Money', function() {
         var ctrl, calls;
         var Money = input.Money;

         beforeEach(function() {
            calls = [];
            ctrl = new Money();
            var beforeMount = ctrl._beforeMount;

            ctrl._beforeMount = function() {
               beforeMount.apply(this, arguments);

               ctrl._children[this._fieldName] = {
                  selectionStart: 0,
                  selectionEnd: 0,
                  value: '',
                  focus: function() {
                  },
                  setSelectionRange: function(start, end) {
                     this.selectionStart = start;
                     this.selectionEnd = end;
                  }
               };
            };
         });

         describe('The integer and the fractional part in the reading mode.', function() {
            beforeEach(function() {
               ctrl._beforeMount({
                  value: ''
               });
               ctrl._readOnlyField.scope.options = {
                  theme: 'default',
                  precision: 2,
                  horizontalPadding: 'xs'
               };
               ctrl._readOnlyField.template = TemplateUtil.clearTemplate(ctrl._readOnlyField.template);
            });
            it('Empty value', function() {
               ctrl._readOnlyField.scope.value = '';

               assert.equal(ctrl._readOnlyField.template(ctrl._readOnlyField.scope), emptyValueTemplate({}));
            });
            it('Zero value', function() {
               ctrl._readOnlyField.scope.value = '0.00';

               assert.equal(ctrl._readOnlyField.template(ctrl._readOnlyField.scope), zeroValueTemplate({}));
            });
         });

         describe('Money part', function() {
            it('value = 100.00, precision = 2', function() {
               const value = '100.00';
               const precision = 2;
               assert.equal(Money.integerPart(value, precision), '100');
               assert.equal(Money.fractionPart(value, precision), '.00');
            });
            it('value = 100, precision = 0', function() {
               const value = '100';
               const precision = 0;
               assert.equal(Money.integerPart(value, precision), '100');
               assert.equal(Money.fractionPart(value, precision), '');
            });
         });
      });
   }
);
