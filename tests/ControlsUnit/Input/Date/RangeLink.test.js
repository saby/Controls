define([
   'Core/core-clone',
   'Core/core-merge',
   'Controls/dateRange',
   'ControlsUnit/Calendar/Utils'
], function(
   cClone,
   cMerge,
   dateRange,
   calendarTestUtils
) {
   'use strict';

   const options = {
      rangeModel: new dateRange.DateRangeModel(),
      mask: 'DD.MM.YYYY',
      value: new Date(2018, 0, 1),
      replacer: ' ',
   };

   describe('Controls/_dateRange/RangeSelector', function() {
      describe('initialization', function() {
         it('should set endValue if selectionType is equal "single"', function() {
            const
               date = new Date(2019, 0),
               component = calendarTestUtils.createComponent(
                  dateRange.RangeSelector, { startValue: date, selectionType: 'single' });

            assert.equal(component._rangeModel.startValue, date);
            assert.equal(component._rangeModel.endValue, date);
         });
      });

      describe('_beforeUpdate', function() {
         it('should set endValue if selectionType is equal "single"', function() {
            const
               date = new Date(2019, 0),
               component = calendarTestUtils.createComponent(dateRange.RangeSelector, {});

            component._beforeUpdate(
               calendarTestUtils.prepareOptions(dateRange.RangeSelector, { startValue: date, selectionType: 'single' }));

            assert.equal(component._rangeModel.startValue, date);
            assert.equal(component._rangeModel.endValue, date);
         });
      });

      describe('openPopup', function() {
         it('should open opener with default options', function() {
            const
               opts = cMerge({
                  startValue: new Date(2019, 0, 1),
                  endValue: new Date(2019, 0, 1)
               }, options),
               component = calendarTestUtils.createComponent(dateRange.RangeSelector, opts),
               TARGET = 'value';

            component._options.nextArrowVisibility = true;
            component._children = {
               opener: {
                  open: sinon.fake()
               },
               linkView: {
                   getPopupTarget: sinon.stub().returns(TARGET)
               }
            };
            component.openPopup();
            sinon.assert.called(component._children.opener.open);
            sinon.assert.called(component._children.linkView.getPopupTarget);
            sinon.assert.calledWith(component._children.opener.open, sinon.match({
               className: 'controls-DatePopup__selector-marginTop controls-DatePopup__selector-marginLeft',
               target: TARGET,
               templateOptions: {
                  startValue: opts.startValue,
                  endValue: opts.endValue,
                  minRange: 'day'
               }
            }));
         });
         it('should open dialog with passed dialog options', function() {
            const
               extOptions = {
                  ranges: { days: [1] },
                  minRange: 'month',
                  emptyCaption: 'caption',
                  captionFormatter: function(){},
                  readOnly: true
               },
               component = calendarTestUtils.createComponent(dateRange.RangeSelector, cMerge(cClone(extOptions), options));
            component._children = {
               opener: {
                  open: sinon.fake()
               },
               linkView: {
                   getPopupTarget: sinon.fake()
               }
            };
            component.openPopup();
            sinon.assert.calledWith(component._children.opener.open, sinon.match({
               className: 'controls-DatePopup__selector-marginTop controls-DatePopup__selector-marginLeft',
               templateOptions: {
                  quantum: extOptions.ranges,
                  minRange: extOptions.minRange,
                  captionFormatter: extOptions.captionFormatter,
                  emptyCaption: extOptions.emptyCaption,
                  readOnly: extOptions.readOnly
               }
            }));
         });
         describe('open dialog with .controls-DatePopup__selector-marginLeft css class', function() {
            [{
               selectionType: 'single'
            }, {
               selectionType: 'range'
            }, {
               minRange: 'day'
            }, {
               ranges: { days: [1] }
            }, {
               ranges: { weeks: [1] }
            }, {
               ranges: { days: [1], months: [1] }
            }, {
               ranges: { weeks: [1], quarters: [1] }
            }, {
               ranges: { days: [1], quarters: [1] }
            }, {
               ranges: { days: [1], halfyears: [1] }
            }, {
               ranges: { days: [1], years: [1] }
            }].forEach(function (test) {
               it(`${JSON.stringify(test)}`, function () {
                  const
                     component = calendarTestUtils.createComponent(dateRange.RangeSelector, cMerge(cClone(test), options));
                  component._children = {
                     opener: {
                        open: sinon.fake()
                     },
                     linkView: {
                         getPopupTarget: sinon.fake()
                     }
                  };
                  component.openPopup();
                  sinon.assert.calledWith(component._children.opener.open, sinon.match({
                     className: 'controls-DatePopup__selector-marginTop controls-DatePopup__selector-marginLeft'
                  }));
               });
            });
         });
         describe('open dialog with .controls-DatePopup__selector-marginLeft-withoutModeBtn css class', function() {
            [{
               minRange: 'month'
            }, {
               ranges: { months: [1] }
            }, {
               ranges: { quarters: [1] }
            }, {
               ranges: { halfyears: [1] }
            }, {
               ranges: { years: [1] }
            }].forEach(function (test) {
               it(`${JSON.stringify(test)}`, function () {
                  const
                     component = calendarTestUtils.createComponent(dateRange.RangeSelector, cMerge(cClone(test), options));
                  component._children = {
                     opener: {
                        open: sinon.fake()
                     },
                     linkView: {
                         getPopupTarget: sinon.fake()
                     }
                  };
                  component.openPopup();
                  sinon.assert.calledWith(component._children.opener.open, sinon.match({
                     className: 'controls-DatePopup__selector-marginTop controls-DatePopup__selector-marginLeft-withoutModeBtn'
                  }));
               });
            });
         });

      });

      describe('_onResult', function() {
         it('should generate valueChangedEvent and close opener', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.RangeSelector, options),
               startValue = new Date(2018, 11, 10),
               endValue = new Date(2018, 11, 13);

            component._children.opener = {
               close: sinon.fake()
            };
            sandbox.stub(component, '_notify');

            component._onResult(startValue, endValue);

            sinon.assert.calledWith(component._notify, 'startValueChanged');
            sinon.assert.calledWith(component._notify, 'endValueChanged');
            sinon.assert.called(component._children.opener.close);
            sandbox.restore();
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
