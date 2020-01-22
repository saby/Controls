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

   describe('Controls/_dateRange/Input', function() {

      describe('_openDialog', function() {
         it('should open opener with default options', function() {
            const component = calendarTestUtils.createComponent(dateRange.Input, options);
            component._children.opener = {
               open: sinon.fake()
            };
            component._openDialog();
            sinon.assert.called(component._children.opener.open);
         });

         it('should open dialog with passed dialog options', function() {
            const
               extOptions = {
                  readOnly: true,
                  startValue: new Date(2019, 0, 1),
                  endValue: new Date(2019, 0, 1)
               },
               component = calendarTestUtils.createComponent(dateRange.Input, extOptions);
            component._children.opener = {
               open: sinon.fake()
            };
            component._openDialog();
            sinon.assert.called(component._children.opener.open);
            sinon.assert.calledWith(component._children.opener.open, sinon.match({
               className: 'controls-PeriodDialog__picker',
               templateOptions: {
                  startValue: extOptions.startValue,
                  endValue: extOptions.endValue,
                  readOnly: extOptions.readOnly
               }
            }));
         });
      });

      describe('_onResult', function() {
         it('should generate events and close opener', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.Input, options),
               startValue = new Date(2017, 11, 1),
               endValue = new Date(2017, 11, 2);

            component._children = {}
            component._children.opener = {
               close: sinon.fake()
            };
            sandbox.stub(component, '_notify');

            component._onResultWS3('event',startValue, endValue);

            sinon.assert.calledWith(component._notify, 'startValueChanged');
            sinon.assert.calledWith(component._notify, 'endValueChanged');
            sinon.assert.calledWith(component._notify, 'inputCompleted');
            sinon.assert.called(component._children.opener.close);
            sandbox.restore();
         });
         it('shouldn\'t call _notify if startValue hasn\'t change', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.Input, options),
               startValue = new Date(2017, 11, 2);

            sandbox.stub(component, '_notify');

            component._rangeModel._startValue = startValue;

            component._rangeModel.startValue = startValue;

            sinon.assert.notCalled(component._notify);
            sandbox.restore();
         });
         it('shouldn\'t call _notify if endValue hasn\'t change', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.Input, options),
               endValue = new Date(2017, 11, 2);

            sandbox.stub(component, '_notify');

            component._rangeModel._endValue = endValue;

            component._rangeModel.endValue = endValue;

            sinon.assert.notCalled(component._notify);
            sandbox.restore();
         });
      });

      describe('_onResultWS3', function() {
         it('should generate events and close opener', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.Input, options),
               startValue = new Date(2017, 11, 1),
               endValue = new Date(2017, 11, 2);

            component._children = {}
            component._children.opener = {
               close: sinon.fake()
            };
            sandbox.stub(component, '_notify');

            component._onResultWS3(null, startValue, endValue);

            sinon.assert.calledWith(component._notify, 'startValueChanged');
            sinon.assert.calledWith(component._notify, 'endValueChanged');
            sinon.assert.calledWith(component._notify, 'inputCompleted');
            sinon.assert.called(component._children.opener.close);
            sandbox.restore();
         });
      });

      describe('_keyUpHandler', function() {
         [{
            key: '0',
            checkHandle: true
         }, {
            key: '9',
            checkHandle: true
         }, {
            key: 'x',
            checkHandle: false
         }].forEach(function(test) {
            it('should generate events and close opener', function() {
               const
                  sandbox = sinon.sandbox.create(),
                  component = calendarTestUtils.createComponent(dateRange.Input, options);

               sandbox.stub(component, '_focusChanger');

               component._keyUpHandler({ nativeEvent: { key: test.key } });

               if (test.checkHandle) {
                  sinon.assert.called(component._focusChanger);
               } else {
                  sinon.assert.notCalled(component._focusChanger);
               }
               sandbox.restore();
            });
         });
      });

      describe('_notifyInputCompleted', function() {
         it('should generate inputCompleted event', function() {
            const
               sandbox = sinon.sandbox.create(),
               startValue = new Date(2017, 11, 1),
               endValue = new Date(2017, 11, 2),
               component = calendarTestUtils.createComponent(dateRange.Input, cMerge({startValue: startValue, endValue: endValue}, options));

            sandbox.stub(component, '_notify');

            component._notifyInputCompleted(startValue, endValue);
            sinon.assert.calledWith(component._notify, 'inputCompleted', [startValue, endValue, '01.12.2017', '02.12.2017']);

            sandbox.restore();
         });
      });

   });
});
