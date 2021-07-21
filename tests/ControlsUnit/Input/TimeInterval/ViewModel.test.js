define([
   'Controls/_input/TimeInterval/ViewModel',
   'Types/entity'
], function(
   ViewModel,
   entity
) {
   'use strict';

   const  _options = {
      mask: 'HH:MM:SS',
      replacer: ' '
   };

   ViewModel = ViewModel.ViewModel;

   describe('Controls/_input/TimeInterval/ViewModel', function() {

      describe('._convertToValue', function() {
         it('should return correct TimeInterval object from String', function() {
            let model = new ViewModel(_options);
            let value = new entity.TimeInterval({days: 1, hours: 20, minutes: 10, seconds: 20});
            assert.strictEqual(model._convertToValue('44:10:20')._normIntervalStr, value._normIntervalStr);

            value = new entity.TimeInterval({hours: 20, minutes: 10, seconds: 20});
            assert.strictEqual(model._convertToValue('20:10:20')._normIntervalStr, value._normIntervalStr);

            value = new entity.TimeInterval({seconds: 20});
            assert.strictEqual(model._convertToValue('00:00:20')._normIntervalStr, value._normIntervalStr);
         });
         it('Recalculate value', function() {
            let value = new entity.TimeInterval({days: 1, hours: 20, minutes: 10, seconds: 20});
            let model = new ViewModel(_options, value);
            assert.equal(model._convertToValue('44:10:20'), value);
         });
      });

      describe('._convertToDisplayValue', function() {
         it('should return correct displayValue from TimeInterval object', function() {
            let model = new ViewModel(_options);
            let value = new entity.TimeInterval({days: 1, hours: 20, minutes: 10, seconds: 20});
            assert.strictEqual(model._convertToDisplayValue(value), '44:10:20');

            value = new entity.TimeInterval({hours: 20, minutes: 10, seconds: 20});
            assert.strictEqual(model._convertToDisplayValue(value), '20:10:20');

            value = new entity.TimeInterval({seconds: 20});
            assert.strictEqual(model._convertToDisplayValue(value), '00:00:20');
         });
      });

      describe('.autoComplete', function() {
         it('should auto complete display value in correct way', function() {
            let model = new ViewModel(_options),
               sandbox = sinon.createSandbox();
            model.value = model._convertToValue('1 :1 :1 ');
            model.autoComplete();
            assert.strictEqual(model.displayValue, '01:01:01');
            model.value = model._convertToValue(' 1: 1: 1');
            model.autoComplete();
            assert.strictEqual(model.displayValue, '01:01:01');
            sandbox.restore();
         });
      });

      describe('_getStartingPosition', function() {
         it('Test1', function() {
            const model = new ViewModel(_options);
            assert.equal(model._getStartingPosition(), 0);
         });
      });
   });
});
