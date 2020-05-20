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
      mask: 'DD.MM.YYYY',
      value: new Date(2018, 0, 1),
      replacer: ' ',
   };

   describe('Controls/Input/Date/DateSelector', function() {

      describe('openPopup', function() {
         it('should open opener', function() {
            const component = calendarTestUtils.createComponent(dateRange.DateSelector, options);
            component._children = {
               opener: {
                  open: sinon.fake()
               },
               linkView: {
                   getPopupTarget: sinon.stub().returns()
               }
            };
            component.openPopup();
            sinon.assert.called(component._children.opener.open);
         });
      });

      describe('_onResult', function() {
         it('should generate valueChangedEvent and close opener', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.DateSelector, options),
               value = new Date(2018, 11, 10);

            component._children.opener = {
               close: sinon.fake()
            };
            sandbox.stub(component, '_notify');

            component._onResult(null, value);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sinon.assert.called(component._children.opener.close);
            sandbox.restore();
         });
      });
      describe('_rangeChangedHandler', function() {
         it('should generate valueChangedEvent', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.DateSelector, options),
               value = new Date(2018, 11, 10);

            component._children.opener = {
               close: sinon.fake()
            };
            sandbox.stub(component, '_notify');

            component._rangeChangedHandler(null, value);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sandbox.restore();
         });
      });

   });
});
