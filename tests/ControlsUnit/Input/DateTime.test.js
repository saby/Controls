define([
   'Core/core-merge',
   'Controls/input',
   'ControlsUnit/Calendar/Utils',
   'Core/constants'
], function(
   cMerge,
   input,
   calendarTestUtils,
   constants
) {
   'use strict';

   const
       options = {
         mask: 'DD.MM.YYYY',
         value: new Date(2018, 0, 1),
         replacer: ' ',
      },
      optionsWithEmptyDate = {
         mask: 'DD.MM.YYYY',
         replacer: ' ',
      };

   describe('Controls/_input/DateTime', function() {
      describe('Initialisation', function() {
         it('should create correct model', function() {
            const component = calendarTestUtils.createComponent(input.DateBase, options);
            assert(component._model);
            assert.strictEqual(component._model._mask, options.mask);
            assert.strictEqual(component._model.value, options.value);
            assert.strictEqual(component._model._lastValue, options.value);
            assert.strictEqual(component._model.textValue, '01.01.2018');
         });

      });

      describe('_beforeUpdate', function() {
         it('should update the model', function() {
            const component = calendarTestUtils.createComponent(input.DateBase, options),
               value = new Date(2017, 11, 1);

            component._beforeUpdate(cMerge({ value: value }, options, { preferSource: true }));

            assert.strictEqual(component._model.value, value);
            assert.strictEqual(component._model.textValue, '01.12.2017');
         });
      });

      describe('_inputCompletedHandler', function() {
         it('should update model and generate events', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(input.DateBase, options),
               textValue = '01.12.2017',
               value = new Date(2017, 11, 1),
               event = {
                  stopImmediatePropagation: sinon.fake()
               };

            sandbox.stub(component, '_notify');
            component._inputCompletedHandler(event, '01122017', textValue);

            assert.strictEqual(component._model.value.getTime(), value.getTime());
            assert.strictEqual(component._model.textValue, textValue);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sinon.assert.calledWith(component._notify, 'inputCompleted');
            sinon.assert.calledOnce(event.stopImmediatePropagation);

            sandbox.restore();
         });
      });

      describe('_valueChangedHandler', function() {
         it('should update the model', function() {
            const sandbox = sinon.sandbox.create(),
               event = {
                  stopImmediatePropagation: sinon.fake()
               },
               component = calendarTestUtils.createComponent(input.DateBase, options),
               textValue = '01.12.2017',
               value = new Date(2017, 11, 1);

            sandbox.stub(component, '_notify');
            component._valueChangedHandler(event, '01122017', textValue);

            assert.strictEqual(component._model.value.getTime(), value.getTime());
            assert.strictEqual(component._model.textValue, textValue);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sinon.assert.called(event.stopImmediatePropagation);

            sandbox.restore();
         });
      });

      describe('_beforeUnmount', function() {
         it('should destroy the model', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(input.DateBase, options);

            sandbox.stub(component._model, 'destroy');
            component._beforeUnmount();

            sinon.assert.calledOnce(component._model.destroy);

            sandbox.restore();
         });
      });

      describe('_onKeyDown', function() {
         it('should set current date on insert key press', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(
                  input.DateBase, cMerge({ dateConstructor: Date }, options, { preferSource: true })),
               event = {
                  nativeEvent: {
                     keyCode: constants.key.insert
                  },
                  stopImmediatePropagation: sinon.fake()
               };
            sandbox.stub(component, '_notify');
            component._onKeyDown(event);
            sinon.assert.calledWith(component._notify, 'inputCompleted');
            const model = component._model;
            const converter = new input.StringValueConverter();
            assert.deepEqual(model.value, converter.getCurrentDate(model._lastValue, model._mask));
            assert.instanceOf(model.value, Date);
            sandbox.restore();
         });

         it('should not set date on insert + shift key press', function() {
            const
               component = calendarTestUtils.createComponent(
                  input.DateBase, cMerge({ dateConstructor: Date }, optionsWithEmptyDate, { preferSource: true })),
               event = {
                  nativeEvent: {
                     keyCode: constants.key.insert,
                     ctrlKey: false,
                     shiftKey: true
                  },
                  stopImmediatePropagation: sinon.fake()
               };
            component._onKeyDown(event);
            const model = component._model;
            assert.isUndefined(model.value);
         });

         it('should not set date on insert + ctrl key press', function() {
            const
               component = calendarTestUtils.createComponent(
                  input.DateBase, cMerge({ dateConstructor: Date }, optionsWithEmptyDate, { preferSource: true })),
               event = {
                  nativeEvent: {
                     keyCode: constants.key.insert,
                     ctrlKey: true,
                     shiftKey: false
                  },
                  stopImmediatePropagation: sinon.fake()
               };
            component._onKeyDown(event);
            const model = component._model;
            assert.isUndefined(model.value);
         });

         it('should increase current date on one day by plus key press', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(input.DateBase, options),
               event = {
                  nativeEvent: {
                     keyCode: constants.key.plus
                  },
                  stopImmediatePropagation: sinon.fake()
               };
            const model = component._model;
            const converter = new input.StringValueConverter();
            const currentDate = converter.getCurrentDate(model._lastValue, model._mask);
            model.value = currentDate;
            component._onKeyDown(event);
            const localDate = new Date(currentDate);
            localDate.setDate(localDate.getDate() + 1);
            assert.deepEqual(model.value, localDate);
            sandbox.restore();
         });

         it('should decrease current date on one day by minus key press', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(input.DateBase, options),
               event = {
                  nativeEvent: {
                     keyCode: constants.key.minus
                  },
                  stopImmediatePropagation: sinon.fake()
               };
            const model = component._model;
            const converter = new input.StringValueConverter();
            const currentDate = converter.getCurrentDate(model._lastValue, model._mask);
            model.value = currentDate;
            component._onKeyDown(event);
            const localDate = new Date(currentDate);
            localDate.setDate(localDate.getDate() - 1);
            assert.deepEqual(model.value, localDate);
            sandbox.restore();
         });

         it('should not change date, if value is empty', function(){
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(input.DateBase, optionsWithEmptyDate);
            [{
               nativeEvent: {
                  keyCode: constants.key.minus
               },
               stopImmediatePropagation: sinon.fake()
            }, {
               nativeEvent: {
                  keyCode: constants.key.plus
               },
               stopImmediatePropagation: sinon.fake()
            }].forEach(function (event) {
               component._onKeyDown(event);
               const model = component._model;
               assert.isUndefined(model.value);
            });
            sandbox.restore();
         });
      });
   });
});
