define([
   'Core/core-merge',
   'Core/Deferred',
   'Controls/dateRange',
   'Types/formatter',
   'Controls/datePopup',
   'Controls/scroll',
   'Controls/dateUtils',
   'ControlsUnit/Calendar/Utils'
], function(
   coreMerge,
   Deferred,
   dateRange,
   formatter,
   PeriodDialog,
   scroll,
   dateUtils,
   calendarTestUtils
) {
   'use strict';

   const start = new Date(2018, 0, 1),
      end = new Date(2018, 0, 2);

   const formatDate = function(date) {
      return date ? formatter.date(date, formatter.date.FULL_DATE) : 'null';
   };

   describe('Controls/Date/PeriodDialog', function() {
      describe('Initialisation', function() {

         it('should create the correct range model when empty range passed.', function() {
            const
               now = new Date(2019, 6, 1),
               clock = sinon.useFakeTimers(now.getTime(), 'Date'),
               component = calendarTestUtils.createComponent(PeriodDialog.default, {});

            assert.isTrue(component._monthStateEnabled);
            assert.isTrue(component._yearStateEnabled);
            assert.strictEqual(component._state, component._STATES.year);
            assert.strictEqual(component._yearRangeSelectionType, 'range');
            assert.strictEqual(component._headerType, 'link');
            assert(dateUtils.Base.isDatesEqual(component._displayedDate, dateUtils.Base.getStartOfYear(now)));

            clock.restore();
         });

         it('should initialize if invalid start and end dates passed.', function() {
            const
               now = new Date(2019, 6, 1),
               clock = sinon.useFakeTimers(now.getTime(), 'Date'),
               component = calendarTestUtils.createComponent(PeriodDialog.default, {});

            assert(dateUtils.Base.isDatesEqual(component._displayedDate, dateUtils.Base.getStartOfYear(now)));

            clock.restore();
         });

         it('should initialize _displayedDate as start of year if dialog opens in year mode.', function() {
            const
               start = new Date(2018, 3, 1),
               end = new Date(2018, 4, 0),
               component = calendarTestUtils.createComponent(PeriodDialog.default, { startValue: start, endValue: end });

            assert(dateUtils.Base.isDatesEqual(component._displayedDate, dateUtils.Base.getStartOfYear(start)));

         });

         it('should create the correct range models when empty range passed.', function() {
            const component = calendarTestUtils.createComponent(PeriodDialog.default, {});
            assert.isNull(component._rangeModel.startValue);
            assert.isNull(component._rangeModel.endValue);
            assert.isNull(component._headerRangeModel.startValue);
            assert.isNull(component._headerRangeModel.endValue);
            assert.isNull(component._yearRangeModel.startValue);
            assert.isNull(component._yearRangeModel.endValue);
         });

         it('should create the correct range models when range passed.', function() {
            const component = calendarTestUtils.createComponent(PeriodDialog.default, { startValue: start, endValue: end });
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.endValue, end));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.endValue, end));
            assert.isNull(component._yearRangeModel.startValue);
            assert.isNull(component._yearRangeModel.endValue);
         });

         [{
            options: {},
            yearModel: {
               startValue: null,
               endValue: null
            }
         }, {
            options: {
               startValue: new Date(2019, 1, 1),
               endValue: new Date(2020, 0, 0)
            },
            yearModel: {
               startValue: null,
               endValue: null
            }
         }, {
            options: {
               startValue: new Date(2019, 0, 1),
               endValue: new Date(2019, 1, 10)
            },
            yearModel: {
               startValue: null,
               endValue: null
            }
         }, {
            options: {
               startValue: new Date(2019, 0, 1),
               endValue: new Date(2020, 0, 0)
            },
            yearModel: {
               startValue: new Date(2019, 0, 1),
               endValue: new Date(2020, 0, 0)
            }
         }].forEach(function(test) {
            it(`should update _yearsModel if options are equals ${JSON.stringify(test.options)}.`, function () {
               const component = calendarTestUtils.createComponent(PeriodDialog.default, test.options);
               assert(dateUtils.Base.isDatesEqual(component._yearRangeModel.startValue, test.yearModel.startValue));
               assert(dateUtils.Base.isDatesEqual(component._yearRangeModel.endValue, test.yearModel.endValue));
            });
         });

         [
            { selectionType: dateRange.IDateRangeSelectable.SELECTION_TYPES.range },
            { selectionType: dateRange.IDateRangeSelectable.SELECTION_TYPES.range, quantum: { months: [1], days: [1] } }
         ].forEach(function(options) {
            it(`should enable year and month modes if options are equals ${JSON.stringify(options)}.`, function () {
               const component = calendarTestUtils.createComponent(PeriodDialog.default, options);
               assert.isTrue(component._monthStateEnabled);
               assert.isTrue(component._yearStateEnabled);
               assert.strictEqual(component._state, component._STATES.year);
               assert.strictEqual(component._yearRangeSelectionType, options.selectionType);
               assert.strictEqual(component._monthRangeSelectionType, options.selectionType);
            });
         });

         [
            { selectionType: dateRange.IDateRangeSelectable.SELECTION_TYPES.single },
            { selectionType: dateRange.IDateRangeSelectable.SELECTION_TYPES.range, quantum: { days: [1] } }
         ].forEach(function(options) {
            it(`should enable only month mode if options are equals ${JSON.stringify(options)}.`, function() {
               const component = calendarTestUtils.createComponent(PeriodDialog.default, options);
               assert.isTrue(component._monthStateEnabled);
               assert.isFalse(component._yearStateEnabled);
               assert.strictEqual(component._yearRangeSelectionType, dateRange.IDateRangeSelectable.SELECTION_TYPES.disable);
               assert.strictEqual(component._monthRangeSelectionType, dateRange.IDateRangeSelectable.SELECTION_TYPES.disable);
            });
         });

         [
            { selectionType: dateRange.IDateRangeSelectable.SELECTION_TYPES.quantum, quantum: { years: [1] } },
            { selectionType: dateRange.IDateRangeSelectable.SELECTION_TYPES.quantum, quantum: { months: [1] } }
         ].forEach(function(options) {
            it(`should enable only year mode if options are equals ${JSON.stringify(options)}.`, function() {
               const component = calendarTestUtils.createComponent(PeriodDialog.default, options);
               assert.isFalse(component._monthStateEnabled);
               assert.isTrue(component._yearStateEnabled);
            });
         });

         [{
            state: 'year',
            tests: [
               { },
               { startValue: new Date(2019, 0, 1), endValue: new Date(2019, 1, 0) },
               { startValue: new Date(2019, 0, 3), endValue: new Date(2019, 1, 10) }
            ]
         }, {
            state: 'month',
            tests: [
               { startValue: new Date(2019, 0, 1), endValue: new Date(2019, 0, 1) },
               { selectionType: dateRange.IDateRangeSelectable.SELECTION_TYPES.single },
               { selectionType: dateRange.IDateRangeSelectable.SELECTION_TYPES.quantum, quantum: { days: [1] } },
               { selectionType: dateRange.IDateRangeSelectable.SELECTION_TYPES.quantum, quantum: { weeks: [1] } }
            ]
         }].forEach(function(testGroup) {
            testGroup.tests.forEach(function(options) {
               it(`should set ${testGroup.state} state if options are equals ${JSON.stringify(options)}.`, function() {
                  const component = calendarTestUtils.createComponent(PeriodDialog.default, options);
                  assert.equal(component._state, testGroup.state);
               });
            });
         });


         it("should initialize readOnly state.", function() {
            const component = calendarTestUtils.createComponent(PeriodDialog.default, { readOnly: true });
            assert.strictEqual(component._yearRangeSelectionType, dateRange.IDateRangeSelectable.SELECTION_TYPES.disable);
         });

         [{
            homeButtonVisiable: false,
            options: {
               startValue: new Date(),
               endValue: new Date()
            },
         }, {
            homeButtonVisiable: false,
            options: {
               startValue: dateUtils.Base.getStartOfYear(new Date()),
               endValue: dateUtils.Base.getEndOfQuarter(new Date())
            },
         }, {
            homeButtonVisiable: true,
            options: {
               startValue: new Date(2019, 0, 3),
               endValue: new Date(2019, 0, 4)
            },
         }, {
            homeButtonVisiable: true,
            options: {
               startValue: new Date(2019, 0, 3),
               endValue: new Date(2019, 2, 3)
            },
         }].forEach(function(test) {
            it(`should set homeButtonVisiable to ${test.homeButtonVisiable} if options are ${JSON.stringify(test.options)}`, function() {
               const component = calendarTestUtils.createComponent(PeriodDialog.default, test.options);
               assert.strictEqual(component._homeButtonVisible, test.homeButtonVisiable);
            });
         });

         it('should set correct header type.', function() {
            const component = calendarTestUtils.createComponent(
               PeriodDialog.default,
               { headerType: 'input' }
            );
            assert.strictEqual(component._headerType, 'input');
         });

         describe('mask', function() {
            [{
               options: {},
               mask: 'DD.MM.YY'
            }, {
               options: { mask: 'DD.MM.YY hh:mm' },
               mask: 'DD.MM.YY hh:mm'
            }, {
               options: { minRange: 'month' },
               mask: 'MM.YYYY'
            }].forEach(function (test) {
               it(`should set mask to ${test.mask} if options are equals ${JSON.stringify(test.options)}.`, function () {
                  const component = calendarTestUtils.createComponent(PeriodDialog.default, test.options);
                  assert.strictEqual(component._mask, test.mask);
               });
            });
         });

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
                  component = calendarTestUtils.createComponent(PeriodDialog.default,
                      { startValueValidators: validators, endValueValidators: validators });

               assert.isArray(component._startValueValidators);
               assert.lengthOf(component._startValueValidators, 4);

               assert.isArray(component._endValueValidators);
               assert.lengthOf(component._endValueValidators, 4);
            });
         });
      });

      describe('_afterUpdate', function() {
         it('should not activate default autofocus field if _activateInputField is equal false.', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(PeriodDialog.default, {});

            sandbox.stub(component, 'activate');
            component._afterUpdate();
            assert.isFalse(component._activateInputField);
            sinon.assert.notCalled(component.activate);

            sandbox.restore();
         });
         it('should activate default autofocus field if _activateInputField is equal true.', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(PeriodDialog.default, {});

            component._activateInputField = true;
            sandbox.stub(component, 'activate');

            component._afterUpdate();

            assert.isFalse(component._activateInputField);
            sinon.assert.called(component.activate);

            sandbox.restore();
         });
      });

      describe('_homeButtonClick', function() {
         it('should update _displayedDate.', function() {
            const
               oldDate = new Date(2017, 0, 1),
               component = calendarTestUtils.createComponent(PeriodDialog.default, { startValue: oldDate, endValue: oldDate });
            assert(dateUtils.Base.isDatesEqual(component._displayedDate, oldDate));
            component._homeButtonClick();
            assert(dateUtils.Base.isMonthsEqual(component._displayedDate, new Date()));
         });
      });

      describe('_headerLinkClick', function() {
         it('should toggle header type.', function() {
            const component = calendarTestUtils.createComponent(PeriodDialog.default, {});
            assert.strictEqual(component._headerType, 'link');
            component._headerLinkClick();
            assert.strictEqual(component._headerType, 'input');
            assert.isTrue(component._activateInputField);
         });
      });

      describe('_onHeaderLinkRangeChanged', function() {
         it('should update range.', function() {
            const component = calendarTestUtils.createComponent(
               PeriodDialog.default, { startValue: new Date(2019, 0, 1), endValue: new Date(2019, 1, 0) });
            component._onHeaderLinkRangeChanged(null, null, null);
            assert.isNull(component._rangeModel.startValue);
            assert.isNull(component._rangeModel.endValue);
         });
      });

      describe('_startValuePickerChanged', function() {
         it('should update start value.', function() {
            const component = calendarTestUtils.createComponent(PeriodDialog.default, {}),
               date = new Date();
            component._startValuePickerChanged(null, date);
            assert.strictEqual(component._rangeModel.startValue, date);
            assert.strictEqual(component._headerRangeModel.startValue, date);
         });
      });

      describe('_endValuePickerChanged', function() {
         [{
            options: {},
            date: new Date(2019, 6, 10),
            endValue: new Date(2019, 6, 10)
         }, {
            options: { mask: 'MM.YYYY' },
            date: new Date(2019, 6, 10),
            endValue: new Date(2019, 7, 0)
         }, {
            options: { mask: 'MM.YYYY' },
            date: new Date('InvalidDate'),
            endValue: new Date('InvalidDate')
         }, {
            options: { mask: 'MM.YYYY' },
            date: null,
            endValue: null
         }].forEach(function(test) {
            it(`should update end value to ${formatDate(test.endValue)} if ${formatDate(test.date)} is passed and options is equal ${JSON.stringify(test.options)}.`, function() {
               const component = calendarTestUtils.createComponent(PeriodDialog.default, test.options);
               component._endValuePickerChanged(null, test.date);
               assert(dateUtils.Base.isDatesEqual(component._rangeModel.endValue, test.endValue));
               assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.endValue, test.endValue));
            });
         });
      });

      describe('_toggleStateClick', function() {
         [{
            options: { startValue: new Date(2019, 3, 10), endValue: new Date(2019, 5, 0) },
            state: 'year',
            displayedDate: new Date(2019, 3, 1)
         }, {
            options: { startValue: new Date(2019, 3, 10), endValue: new Date(2019, 5, 0) },
            state: 'month',
            displayedDate: new Date(2019, 0, 1)
         }].forEach(function(test) {
            it('should toggle state and set correct displayed date.', function() {
               const component = calendarTestUtils.createComponent(PeriodDialog.default, test.options);
               component._state = test.state;
               component._toggleStateClick();
               assert.strictEqual(component._state,
                  test.state === component._STATES.year ? component._STATES.month : component._STATES.year);
               assert(dateUtils.Base.isDatesEqual(component._displayedDate, test.displayedDate));
            });
         });
      });

      describe('_yearsRangeChanged', function() {
         it('should update range models.', function() {
            const component = calendarTestUtils.createComponent(PeriodDialog.default, {});
            component._yearsRangeChanged(null, start, end);
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.endValue, dateUtils.Base.getEndOfYear(end)));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.endValue, dateUtils.Base.getEndOfYear(end)));
         });
      });

      describe('_yearsSelectionChanged', function() {
         it('should update range models and displayed day.', function() {
            const component = calendarTestUtils.createComponent(PeriodDialog.default, {});
            component._yearsSelectionChanged(null, start, end);
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.endValue, dateUtils.Base.getEndOfYear(end)));
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.endValue, dateUtils.Base.getEndOfYear(end)));
         });
      });

      describe('_onYearsSelectionHoveredValueChanged', function() {
         it('should update range models and displayed day.', function() {
            const
               date = new Date(2018, 0, 1),
               component = calendarTestUtils.createComponent(PeriodDialog.default, {});
            component._onYearsSelectionHoveredValueChanged(null, date);
            assert(dateUtils.Base.isDatesEqual(component._displayedDate, date));
         });
         it('should\'t update displayed day.', function() {
            const
               date = new Date(2018, 0, 1),
               component = calendarTestUtils.createComponent(PeriodDialog.default, { startValue: date, endValue: date });
            component._onYearsSelectionHoveredValueChanged(null, null);
            assert(dateUtils.Base.isDatesEqual(component._displayedDate, date));
         });
      });

      describe('_monthsRangeChanged', function() {
         it('should update range models.', function() {
            const component = calendarTestUtils.createComponent(PeriodDialog.default, {});
            component._monthsRangeChanged(null, start, end);
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.endValue, dateUtils.Base.getEndOfMonth(end)));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.endValue, dateUtils.Base.getEndOfMonth(end)));
         });
      });

      describe('_monthsSelectionChanged', function() {
         it('should update range models.', function() {
            const component = calendarTestUtils.createComponent(PeriodDialog.default, {});
            component._monthsSelectionChanged(null, start, end);
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.endValue, dateUtils.Base.getEndOfMonth(end)));
         });
      });

      describe('_monthRangeMonthClick', function() {
         it('should toggle state and update _displayedDate.', function() {
            const
               component = calendarTestUtils.createComponent(PeriodDialog.default, {}),
               newDate = dateUtils.Base.getStartOfMonth(new Date());
            assert.strictEqual(component._state, component._STATES.year);
            component._monthRangeMonthClick(null, newDate);
            assert.strictEqual(component._state, component._STATES.month);
            assert(dateUtils.Base.isDatesEqual(component._displayedDate, newDate));
         });
      });

      describe('_monthRangeFixedPeriodClick', function() {
         it('should update range models.', function() {
            const component = calendarTestUtils.createComponent(PeriodDialog.default, {});
            component._monthRangeFixedPeriodClick(null, start, end);
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.endValue, end));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.endValue, end));
            assert.isFalse(component._monthRangeSelectionProcessing);
         });
      });

      describe('_dateRangeChanged', function() {
         it('should update range models.', function() {
            const component = calendarTestUtils.createComponent(PeriodDialog.default, {});
            component._dateRangeChanged(null, start, end);
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.endValue, end));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.endValue, end));
         });
      });

      describe('_dateRangeSelectionChanged', function() {
         it('should update range models.', function() {
            const component = calendarTestUtils.createComponent(PeriodDialog.default, {});
            component._dateRangeSelectionChanged(null, start, end);
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.endValue, end));
         });
      });

      describe('_dateRangeFixedPeriodClick', function() {
         it('should update range models.', function() {
            const component = calendarTestUtils.createComponent(PeriodDialog.default, {});
            component._dateRangeFixedPeriodClick(null, start, end);
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.endValue, end));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._headerRangeModel.endValue, end));
            assert.isFalse(component._monthRangeSelectionProcessing);
         });
      });

      describe('_dateRangeSelectionEnded', function() {
         it('should generate "sendResult" event.', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(PeriodDialog.default, {}),
               start = new Date(),
               end = new Date();

            sandbox.stub(component, '_notify');

            component._dateRangeSelectionEnded(null, start, end);
            sinon.assert.calledWith(component._notify, 'sendResult', [start, end]);
            sandbox.restore();
         });
      });

      describe('_applyClick', function() {
         it('should generate "sendResult" event if validation successful.', function() {
            const sandbox = sinon.createSandbox(),
               start = new Date(),
               end = new Date(),
               component = calendarTestUtils.createComponent(PeriodDialog.default, { startValue: start, endValue: end });

            sandbox.stub(component, '_notify');
            component._children = {
               formController: {
                  submit: function() {
                     return (new Deferred()).callback({ '0': null, '1': null });
                  }
               }
            };
            return component._applyClick(null).then(() => {
               sinon.assert.calledWith(component._notify, 'sendResult', [start, end]);
               sandbox.restore();
            });
         });
         it('should generate "sendResult" event if validation failed.', function() {
            const sandbox = sinon.createSandbox(),
               start = new Date(),
               end = new Date(),
               component = calendarTestUtils.createComponent(PeriodDialog.default, { startValue: start, endValue: end });

            sandbox.stub(component, '_notify');
            component._children = {
               formController: {
                  submit: function() {
                     return (new Deferred()).callback({ '0': ['error'], '1': null });
                  }
               }
            };
            return component._applyClick(null).then(() => {
               sinon.assert.notCalled(component._notify);
               sandbox.restore();
            });
         });
      });

      describe('_currentDayIntersectHandler', function() {
         [{
            isIntersecting: false,
            homeButtonVisible: true
         }, {
            isIntersecting: true,
            homeButtonVisible: false
         }].forEach(function(test) {
            it(`should set homeButtonVisible to ${test.homeButtonVisible} if isIntersecting is ${test.isIntersecting}.`, function() {
               const
                  component = calendarTestUtils.createComponent(PeriodDialog.default, {}),
                  entry = new scroll.IntersectionObserverSyntheticEntry({ isIntersecting: test.isIntersecting }, {})
               component._currentDayIntersectHandler(null, entry);

               if (test.homeButtonVisible) {
                  assert.isTrue(component._homeButtonVisible);
               } else {
                  assert.isFalse(component._homeButtonVisible);
               }
            });
         });
      });

      describe('_inputFocusOutHandler', function() {
         const event = {
            nativeEvent: {}
         };

         it('should reset header type if the focus is not on the input fields.', function() {
            const
               sandbox = sinon.createSandbox(),
               component = calendarTestUtils.createComponent(PeriodDialog.default, {}),
               defaultOptions = calendarTestUtils.prepareOptions(PeriodDialog.default);

            component._children = {
               inputs: {
                  contains: function() {
                     return false;
                  }
               },
               formController: {
                  submit: function() {
                     return (new Deferred()).callback({ '0': null, '1': null });
                  }
               }
            };

            component._headerType = 'someHeaderType';
            return component._inputFocusOutHandler(event).then(() => {
               assert.strictEqual(component._headerType, defaultOptions.headerType);
               sandbox.restore();
            });
         });

         it('should\'t reset header type if the focus is on the input fields.', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(PeriodDialog.default, {}),
               headerType = 'someHeaderType';

            component._children = {
               inputs: {
                  contains: function() {
                     return true;
                  }
               }
            };

            component._headerType = headerType;
            return component._inputFocusOutHandler(event).then(() => {
               assert.strictEqual(component._headerType, headerType);
               sandbox.restore();
            });
         });

         it('should\'t reset header type if validation of the input fields is failed.', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(PeriodDialog.default, {}),
               headerType = 'someHeaderType';

            component._children = {
               inputs: {
                  contains: function() {
                     return false;
                  }
               },
               formController: {
                  submit: function() {
                     return (new Deferred()).callback({ '0': [], '1': null });
                  }
               }
            };

            component._headerType = headerType;
            return component._inputFocusOutHandler(event).then(() => {
               assert.strictEqual(component._headerType, headerType);
               sandbox.restore();
            });
         });
      });

      describe('_inputControlHandler', function() {
         [{
            selectionType: 'range',
         }, {
            selectionType: 'quantum',
         }].forEach(function (test) {
            it('should activate adjacent input', function () {
               const
                  sandbox = sinon.sandbox.create(),
                  component = calendarTestUtils.createComponent(PeriodDialog.default, {}),
                  displayValue = {
                     length: 8
                  },
                  selection = {
                     end: 8
                  };
               let result = false;
               component._children = {
                  endValueField: {
                     activate: () => {
                        result = true;
                     }
                  }
               };
               component._options = {
                  selectionType: test.selectionType
               };
               component._inputControlHandler('e', 'value', displayValue, selection);
               assert.isTrue(result);
               sandbox.restore();
            });
         });
         [{
            selectionType: 'range',
            displayValueLength: 8,
            selectionEnd: 7
         }, {
            selectionType: 'single',
            displayValueLength: 8,
            selectionEnd: 8
         }].forEach(function (test) {
            it('should not activate adjacent input', function() {
               const
                  sandbox = sinon.sandbox.create(),
                  component = calendarTestUtils.createComponent(PeriodDialog.default, {}),
                  displayValue = {
                     length: test.displayValueLength
                  },
                  selection = {
                     end: test.selectionEnd
                  };
               let result = false;
               component._children = {
                  endValueField: {
                     activate: () => {
                        result = true;
                     }
                  }
               };
               component._options = {
                  selectionType: test.selectionType
               };

               component._inputControlHandler('e', 'value', displayValue, selection);
               assert.isFalse(result);
               sandbox.restore();
            });
         });
      });

      describe('_monthsRangeSelectionEnded', () => {
         it('should send correct range with rangeSelectedCallback', () => {
            const startValue = new Date(2018, 0);
            const endValue = new Date(2018, 2);
            const formattedStartValue = new Date(2018, 0, 2);
            const formattedEndValue = new Date(2018, 3);
            const rangeSelectedCallback = (startValue, endValue) => {
               return [
                  new Date(startValue.getFullYear(), startValue.getMonth(), startValue.getDate() + 1),
                  new Date(endValue.getFullYear(), endValue.getMonth(), endValue.getDate() + 1)
               ];
            };
            const component = calendarTestUtils.createComponent(PeriodDialog.default, {rangeSelectedCallback});
            const stubSendResult = sinon.stub(component, 'sendResult');
            component._monthsRangeSelectionEnded(null, startValue, endValue);
            sinon.assert.calledWith(stubSendResult, formattedStartValue, formattedEndValue);
            sinon.restore();
         });
      });

      describe('_yearsRangeSelectionEnded', () => {
         it('should send correct range with rangeSelectedCallback', () => {
            const startValue = new Date(2018, 0);
            const endValue = new Date(2018, 0);
            const formattedStartValue = new Date(2018, 0, 2);
            const formattedEndValue = new Date(2019, 0);
            const rangeSelectedCallback = (startValue, endValue) => {
               return [
                  new Date(startValue.getFullYear(), startValue.getMonth(), startValue.getDate() + 1),
                  new Date(endValue.getFullYear(), endValue.getMonth(), endValue.getDate() + 1)
               ];
            };
            const component = calendarTestUtils.createComponent(PeriodDialog.default, {rangeSelectedCallback});
            const stubSendResult = sinon.stub(component, 'sendResult');
            component._yearsRangeSelectionEnded(null, startValue, endValue);
            sinon.assert.calledWith(stubSendResult, formattedStartValue, formattedEndValue);
            sinon.restore();
         });
      });
   });
});
