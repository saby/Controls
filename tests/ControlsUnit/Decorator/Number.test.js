define(
   [
      'Controls/decorator'
   ],
   function(decorator) {

      'use strict';

      describe('Controls.Decorator.Number', function() {
         var result;

         it('Zero number', function() {
            result = decorator.Number._formatNumber(0, {roundMode: 'round'});
            assert.equal(result, '0');
         });

         it('No fractionSize', function() {
            result = decorator.Number._formatNumber(10, {roundMode: 'round'});
            assert.equal(result, '10');

            result = decorator.Number._formatNumber(10.01, {roundMode: 'round'});
            assert.equal(result, '10.01');
         });

         it('should trim trailing zeros', function() {
            result = decorator.Number._formatNumber('10.00', {roundMode: 'round', precision: 2});
            assert.equal(result, '10');

            result = decorator.Number._formatNumber('10.1000', {roundMode: 'round', precision: 2});
            assert.equal(result, '10.1');

         });

         it('Add fractional path', function() {
            result = decorator.Number._formatNumber(10, {roundMode: 'round', fractionSize: 2, showEmptyDecimals: true});
            assert.equal(result, '10.00');

            result = decorator.Number._formatNumber(10, {roundMode: 'round', precision: 2, showEmptyDecimals: true});
            assert.equal(result, '10.00');

            result = decorator.Number._formatNumber(10.0001, {roundMode: 'round', fractionSize: 0, showEmptyDecimals: true});
            assert.equal(result, '10');

            result = decorator.Number._formatNumber(10.0001, {roundMode: 'round', precision: 0, showEmptyDecimals: true});
            assert.equal(result, '10');

            result = decorator.Number._formatNumber(10, {roundMode: 'trunc', precision: 2, showEmptyDecimals: true});
            assert.equal(result, '10.00');
         });

         it('Remove fractional path', function() {
            result = decorator.Number._formatNumber(10.123, {roundMode: 'round', fractionSize: 2});
            assert.equal(result, '10.12');

            result = decorator.Number._formatNumber(10.123, {roundMode: 'round', precision: 2});
            assert.equal(result, '10.12');
         });

         it('Divide into triads', function() {
            result = decorator.Number._formatNumber(123456.01, {roundMode: 'round', useGrouping: true});
            assert.equal(result, '123 456.01');

            result = decorator.Number._formatNumber(123456, {roundMode: 'round', useGrouping: true});
            assert.equal(result, '123 456');

            result = decorator.Number._formatNumber(123456.000001, {roundMode: 'round', useGrouping: true});
            assert.equal(result, '123 456.000001');

            result = decorator.Number._formatNumber(12345, {roundMode: 'round', useGrouping: true});
            assert.equal(result, '12 345');
         });

         it('Negative number', function() {
            result = decorator.Number._formatNumber(-123456.000001, {roundMode: 'round', useGrouping: true});
            assert.equal(result, '- 123 456.000001');
         });

         it('Mode trunc', function() {
            result = decorator.Number._formatNumber(1.234567890, {roundMode: 'trunc', fractionSize: 4});
            assert.equal(result, '1.2345');

            result = decorator.Number._formatNumber(1.234567890, {roundMode: 'trunc', precision: 4});
            assert.equal(result, '1.2345');

            result = decorator.Number._formatNumber(1.234567890, {roundMode: 'trunc', fractionSize: 0});
            assert.equal(result, '1');

            result = decorator.Number._formatNumber(1.234567890, {roundMode: 'trunc', precision: 0});
            assert.equal(result, '1');
         });
      });
   }
);
