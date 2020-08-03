define(
   [
      'Controls/_input/Money/ViewModel'
   ],
   function(ViewModel) {
      'use strict';

      describe('Controls.Money.ViewModel', function() {
         var model = new ViewModel.default({
            precision: 2,
            useGrouping: true,
            onlyPositive: false,
            showEmptyDecimals: true,
            useAdditionToMaxPrecision: true
         }, null);

         it('_getStartingPosition', function() {
            var testModel = new ViewModel.default({
               precision: 2,
               useGrouping: true,
               onlyPositive: false,
               showEmptyDecimals: true,
               useAdditionToMaxPrecision: true
            }, '0.00');

            assert.equal(testModel.selection.start, 1);
            assert.equal(testModel.selection.end, 1);
         });

         describe('Change the value.', function() {
            it('Empty', function() {
               model.value = '';

               assert.equal(model.value, '');
               assert.equal(model.displayValue, '');
            });
            it('0', function() {
               model.value = '0';

               assert.equal(model.value, '0');
               assert.equal(model.displayValue, '0.00');
            });
            it('0.1', function() {
               model.value = '0.1';

               assert.equal(model.value, '0.1');
               assert.equal(model.displayValue, '0.10');
            });
            it('0.12', function() {
               model.value = '0.12';

               assert.equal(model.value, '0.12');
               assert.equal(model.displayValue, '0.12');
            });
            it('123456', function() {
               model.value = '123456';

               assert.equal(model.value, '123456');
               assert.equal(model.displayValue, '123 456.00');
            });
            it('1e21', function() {
               model.value = 1e21;

               assert.equal(model.value, 1e21);
               assert.equal(model.displayValue, '1 000 000 000 000 000 000 000.00');
            });
            it('Type number', function() {
               model.value = 123456;

               assert.equal(model.value, '123456');
               assert.equal(model.displayValue, '123 456.00');
            });
         });
         describe('Change the display value.', function() {
            it('0.00', function() {
               model.displayValue = '0.00';

               assert.equal(model.value, '0');
               assert.equal(model.displayValue, '0.00');
            });
            it('0.10', function() {
               model.displayValue = '0.10';

               assert.equal(model.value, '0.1');
               assert.equal(model.displayValue, '0.10');
            });
            it('0.12', function() {
               model.displayValue = '0.12';

               assert.equal(model.value, '0.12');
               assert.equal(model.displayValue, '0.12');
            });
            it('123 456.00', function() {
               model.displayValue = '123 456.00';

               assert.equal(model.value, '123456');
               assert.equal(model.displayValue, '123 456.00');
            });
            it('Type number', function() {
               model.value = 0;
               model.displayValue = '123 456.00';

               assert.equal(model.value, 123456);
               assert.equal(model.displayValue, '123 456.00');
            });
         });
         describe('_getStartingPosition', function() {
            it('123', function() {
               model.displayValue = '123';

               assert.equal(model.selection.start, 3);
               assert.equal(model.selection.end, 3);
            });
            it('123.456', function() {
               model.displayValue = '123.456';

               assert.equal(model.selection.start, 3);
               assert.equal(model.selection.end, 3);
            });
         });
      });
   }
);
