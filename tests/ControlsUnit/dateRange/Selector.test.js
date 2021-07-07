define([
   'Core/core-merge',
   'Controls/dateRange',
   'ControlsUnit/Calendar/Utils'
], function(
   cMerge,
   dateRange,
   calendarTestUtils
) {
   'use strict';

   const options = {
      rangeModel: new dateRange.DateRangeModel(),
      mask: 'DD.MM.YYYY',
      startValue: new Date(2018, 0, 1),
      endValue: new Date(2018, 0, 1),
      replacer: ' ',
   };

   describe('Controls/dateRange/Selector', function() {
      describe('_beforeUpdate', function() {
         it('should not generate exceptions if value option is set', function() {
            const component = calendarTestUtils.createComponent(dateRange.RangeSelector, options);
            component._beforeUpdate({
               startValue: options.startValue,
               endValue: options.endValue,
               value: []
            });
         });
      });

      describe('EventHandlers', function() {
         [{
            startValue: new Date(),
            result: true
         }, {
            startValue: null,
            result: true
         }, {
            startValue: 'string',
            result: false
         }].forEach(function (test) {
            it('should close popup', function () {
               const component = calendarTestUtils.createComponent(dateRange.RangeSelector, options);
               const sandbox = sinon.createSandbox();

               sandbox.stub(component._rangeModel, 'setRange');
               const stubClosePopup = sandbox.stub(component, 'closePopup');
               component._onResult(test.startValue);

               assert.equal(stubClosePopup.called, test.result);
               sandbox.restore();
            });
         });
      });

      describe('_rangeChangedHandler', function() {
         it('should set range on model', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.RangeSelector, options),
               startValue = new Date(2018, 11, 10),
               endValue = new Date(2018, 11, 13);

            sandbox.stub(component, '_notify');

            component._rangeChangedHandler(startValue, endValue);

            sinon.assert.calledWith(component._notify, 'startValueChanged');
            sinon.assert.calledWith(component._notify, 'endValueChanged');
            sinon.assert.calledWith(component._notify, 'rangeChanged');
            sinon.assert.callCount(component._notify, 3);
            sandbox.restore();
         });
         it('should not generate date change events if dates differ only in time', function() {
            const opt = {
               rangeModel: new dateRange.DateRangeModel(),
               mask: 'DD.MM.YYYY',
               startValue: new Date(2018, 0, 1, 10, 10, 10),
               endValue: new Date(2018, 0, 1, 10, 12, 15),
               replacer: ' ',
            };

            const
                sandbox = sinon.sandbox.create(),
                component = calendarTestUtils.createComponent(dateRange.RangeSelector, opt),
                startValue = new Date(2018, 0, 1),
                endValue = new Date(2018, 0, 1);

            sandbox.stub(component, '_notify');

            component._rangeChangedHandler(null, startValue, endValue);

            sinon.assert.neverCalledWith(component._notify, 'startValueChanged');
            sinon.assert.neverCalledWith(component._notify, 'endValueChanged');
            sinon.assert.neverCalledWith(component._notify, 'rangeChanged');
            sinon.assert.callCount(component._notify, 0);
            sandbox.restore();
         });
      });
   });
});
