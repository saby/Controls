define([
   'Core/core-merge',
   'Controls/_input/DateTime/Model'
], function(
   cMerge,
   DateTimeModel
) {
   'use strict';

   let options = {
      mask: 'DD.MM.YYYY',
      value: new Date(2018, 0, 1),
      replacer: ' ',
      dateConstructor: Date
   };

   describe('Controls/_input/DateTime/Model', function() {
      describe('constructor', function() {
         it('should initialize internal fields', function() {
            let model = new DateTimeModel(options);

            assert.strictEqual(model._mask, options.mask);
            assert.strictEqual(model.value, options.value);
            assert.instanceOf(model.value, Date);
            assert.strictEqual(model._lastValue, options.value);
            assert.strictEqual(model.textValue, '01.01.2018');
         });
      });

      describe('.update', function() {

         it('should update value fields if value changed', function() {
            let sandbox = sinon.sandbox.create(),
               model = new DateTimeModel(options),
               newDate = new Date(2019, 1, 2);

            sandbox.stub(model, '_notify');
            model.update(cMerge({ value: newDate }, options, { preferSource: true }));

            sinon.assert.notCalled(model._notify);
            assert.strictEqual(model.value, newDate);
            assert.instanceOf(model.value, Date);
            assert.strictEqual(model._lastValue, newDate);
            assert.strictEqual(model.textValue, '02.02.2019');
            sandbox.restore();
         });

         it('should update displayValue fields if displayValue changed', function() {
            const options = {
               mask: 'DD.MM.YY',
               displayValue: '01.01.21',
               replacer: ' ',
               dateConstructor: Date
            };
            const sandbox = sinon.sandbox.create(),
               model = new DateTimeModel(options);

            sandbox.stub(model, '_notify');
            model.update(cMerge({ displayValue: '02.01.21' }, options, { preferSource: true }));

            sinon.assert.notCalled(model._notify);
            assert.strictEqual(model.value.getTime(), (new Date(2021, 0, 2)).getTime());
            assert.instanceOf(model.value, Date);
            assert.strictEqual(model._lastValue.getTime(), (new Date(2021, 0, 2)).getTime());
            assert.strictEqual(model.textValue, '02.01.21');
            sandbox.restore();
         });

      });

      describe('.value', function() {

         it('should update native and text value', function() {
            let model = new DateTimeModel(options),
               newDate = new Date(2019, 1, 2);

            model.value = newDate;

            assert.strictEqual(model.value, newDate);
            assert.strictEqual(model._lastValue, newDate);
            assert.strictEqual(model.textValue, '02.02.2019');
         });

      });

      describe('.textValue', function() {

         it('should update native and text value', function() {
            let model = new DateTimeModel(options),
               newTextValue = '02.02.2019',
               newDate = new Date(2019, 1, 2);

            model.textValue = newTextValue;

            assert.strictEqual(model.value.getTime(), newDate.getTime());
            assert.instanceOf(model.value, Date);
            assert.strictEqual(model._lastValue.getTime(), newDate.getTime());
            assert.strictEqual(model.textValue, newTextValue);
         });

         it('should set Invalid Date if text value not full', function() {
            let model = new DateTimeModel(options),
               newTextValue = '02.0 .2019';

            model.textValue = newTextValue;

            // assert.isNone(model.value.getTime());
            assert.strictEqual(model._lastValue.getTime(), options.value.getTime());
            assert.strictEqual(model.textValue, newTextValue);
         });

         it('should not generate valueChanged event if the text value changed from one invalid date to another', function() {
            let
               sandbox = sinon.sandbox.create(),
               model = new DateTimeModel(options);
            model.textValue = '02.0 .2019';
            sandbox.stub(model, '_notify');
            model.textValue = '02.99.2019';
            sinon.assert.notCalled(model._notify);
            sandbox.restore();
         });

      });

      describe('.autocomplete', function() {

         it('should update native and text value', function() {
            let model = new DateTimeModel(options),
               newTextValue = '02.02.2019',
               newDate = new Date(2019, 1, 2);

            model.autocomplete(newTextValue);

            assert.strictEqual(model.value.getTime(), newDate.getTime());
            assert.instanceOf(model.value, Date);
            assert.strictEqual(model._lastValue.getTime(), newDate.getTime());
            assert.strictEqual(model.textValue, newTextValue);
         });

      });

      describe('.setCurrentDate', function() {

         it('should set current date in value', function() {
            let model = new DateTimeModel(options);
            let clock = sinon.useFakeTimers(new Date(2019, 0, 2, 3, 4, 5, 6), 'Date');
            model.setCurrentDate();
            assert.strictEqual((new Date(2019, 0, 2)).getTime(), model.value.getTime());
            assert.instanceOf(model.value, Date);
            clock.restore();
         });
      });

   });
});
