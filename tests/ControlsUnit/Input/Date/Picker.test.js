define([
   'Core/core-merge',
   'Controls/input',
   'ControlsUnit/Calendar/Utils'
], function(
   cMerge,
   input,
   calendarTestUtils
) {
   'use strict';

   const options = {
      mask: 'DD.MM.YYYY',
      value: new Date(2018, 0, 1),
      replacer: ' ',
   };

   describe('Controls/_input/Date/Picker', function() {

      describe('openPopup', function() {
         it('should open opener with default options', function() {
            const component = calendarTestUtils.createComponent(input.Date, options);
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
         it('should open dialog with passed dialog options', function() {
            const
               extOptions = {
                  readOnly: true
               },
               component = calendarTestUtils.createComponent(input.Date, extOptions),
               TARGET = 'target';
            component._children = {
               opener: {
                  open: sinon.fake()
               },
               linkView: {
                  getPopupTarget: sinon.fake()
               }
            };
            component.openPopup();
            sinon.assert.called(component._children.opener.open);
            sinon.assert.calledWith(component._children.opener.open, sinon.match({
               className: 'controls-PeriodDialog__picker',
               templateOptions: {
                  readOnly: extOptions.readOnly
               }
            }));
         });
      });

      describe('_onResult', function() {
         it('should generate events and close opener', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(input.Date, options),
               value = new Date(2017, 11, 1);

            component._children = {}
            component._children.opener = {
               close: sinon.fake()
            };
            sandbox.stub(component, '_notify');

            component._onResult(value);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sinon.assert.calledWith(component._notify, 'inputCompleted');
            sinon.assert.called(component._children.opener.close);
            sandbox.restore();
         });
      });

      describe('_onResultWS3', function() {
         it('should generate events and close opener', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(input.Date, options),
               value = new Date(2017, 11, 1);

            component._children = {}
            component._children.opener = {
               close: sinon.fake()
            };
            sandbox.stub(component, '_notify');

            component._onResultWS3(null, value);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sinon.assert.calledWith(component._notify, 'inputCompleted');
            sinon.assert.called(component._children.opener.close);
            sandbox.restore();
         });
      });

   });
});
