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
      });
   });
});
