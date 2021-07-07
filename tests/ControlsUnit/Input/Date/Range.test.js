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

      describe('Initialisation', function() {
         describe('validators', function() {
            it('should create validators list.', function() {
               const
                  validators = [
                     function() {},
                     {
                        validator: function() {}
                     }, {
                        validator: function() {},
                        arguments: {}
                     }
                  ],
                  component = calendarTestUtils.createComponent(dateRange.Input,
                     cMerge({ startValueValidators: validators, endValueValidators: validators },
                         options, { preferSource: true }));

               assert.isArray(component._startValueValidators);
               assert.lengthOf(component._startValueValidators, 4);

               assert.isArray(component._endValueValidators);
               assert.lengthOf(component._endValueValidators, 4);
            });
         });
      });

      describe('openPopup', function() {
         it('should open opener with default options', function() {
            const component = calendarTestUtils.createComponent(dateRange.Input, options);
            component._children.opener = {
               open: sinon.fake()
            };
            component.openPopup();
            sinon.assert.called(component._children.opener.open);
         });

         it('should open dialog with passed dialog options', function() {
            const
               extOptions = {
                  readOnly: true,
                  startValue: new Date(2019, 0, 1),
                  endValue: new Date(2019, 0, 1),
                  theme: 'default'
               },
               component = calendarTestUtils.createComponent(dateRange.Input, extOptions);
            component._children.opener = {
               open: sinon.fake()
            };
            component.openPopup();
            sinon.assert.called(component._children.opener.open);
            sinon.assert.calledWith(component._children.opener.open, sinon.match({
               className: 'controls-PeriodDialog__picker_theme-default',
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

      describe('_inputControlHandler', function() {
         let sandbox, component;
         beforeEach(() => {
            sandbox = sinon.createSandbox();
            component = calendarTestUtils.createComponent(dateRange.Input, options);
            sandbox.stub(component._children.endValueField, 'activate');
         });
         it('Move to the next field', function() {
            component._inputControlHandler({}, '', '12.12.12', {
               start: 8,
               end: 8
            });
            sinon.assert.called(component._children.endValueField.activate);
         });
         it('Stayed the current field', function() {
            component._inputControlHandler({}, '', '12.12.12', {
               start: 0,
               end: 0
            });
            sinon.assert.notCalled(component._children.endValueField.activate);
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

      describe('_afterUpdate', function() {
         it('should start validation', function () {
            const
               startValue = new Date(2017, 11, 1),
               endValue = new Date(2017, 11, 2),
               component = calendarTestUtils.createComponent(dateRange.Input, cMerge({startValue: startValue, endValue: endValue}, options));

            let result = false;
            component._children = {};
            component._children.opener = {
               close: sinon.fake()
            };
            component._children.startValueField = {
               validate: function() {
                  result = true;
               }
            };
            component._children.endValueField = {
               validate: function() {
                  result = true;
               }
            };
            component._onResult(startValue, endValue);
            component._afterUpdate();
            assert.isTrue(result);
         });
         it('should not start validation', function () {
            const
               startValue = new Date(2017, 11, 1),
               endValue = new Date(2017, 11, 2),
               component = calendarTestUtils.createComponent(dateRange.Input, cMerge({startValue: startValue, endValue: endValue}, options));

            let result = false;
            component._children = {};
            component._children.opener = {
               close: sinon.fake()
            };
            component._children.startValueField = {
               validate: function() {
                  result = true;
               }
            };
            component._children.endValueField = {
               validate: function() {
                  result = true;
               }
            };
            component._afterUpdate();
            assert.isFalse(result);
         });
      });
   });
});
