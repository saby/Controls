define([
   'Core/core-merge',
   'Controls/_datePopup/MonthsRangeItem',
   'Controls/dateUtils',
   'ControlsUnit/Calendar/Utils'
], function(
   coreMerge,
   MonthsRangeItem,
   dateUtils,
   calendarTestUtils
) {
   'use strict';

   MonthsRangeItem = MonthsRangeItem.default;

   const start = new Date(2018, 0, 1),
      end = new Date(2018, 0, 2);

   describe('Controls/Date/PeriodDialog/MonthRangeItem', function() {
      let sandbox;

      beforeEach(function() {
         sandbox = sinon.sandbox.create();
      });

      afterEach(function() {
         sandbox.restore();
         sandbox = null;
      });

      describe('Initialisation', function() {
         [{
            options: {
               selectionType: 'single',
               date: start
            },
            eq: {
               months: false,
               quarters: false,
               halfYears: false,
               years: false
            }
         }, {
            options: {
               selectionType: 'disable',
               date: start
            },
            eq: {
               months: false,
               quarters: false,
               halfYears: false,
               years: false
            }
         }, {
            options: { selectionType: 'range', date: start},
            eq: { months: true, quarters: true, halfYears: true, years: true }
         }, {
            options: { selectionType: 'quantum', ranges: { days: [3] }, date: start },
            eq: { months: false, quarters: false, halfYears: false, years: false }
         }, {
            options: {
               selectionType: 'quantum',
               ranges: { months: [1], quarters: [1], halfyears: [1], years: [1] },
               date: start
            },
            eq: { months: true, quarters: true, halfYears: true, years: true }
         }, {
            options: {
               selectionType: 'range',
               readOnly: true,
               date: start
            },
            eq: { months: false, quarters: false, halfYears: false, years: false }
         }].forEach(function(test) {
            it(`should set proper model for options ${JSON.stringify(test.options)}.`, function() {
               const component = calendarTestUtils.createComponent(MonthsRangeItem, test.options);

               assert.equal(component._monthsSelectionEnabled, test.eq.months);
               assert.equal(component._quarterSelectionEnabled, test.eq.quarters);
               assert.equal(component._halfyearSelectionEnabled, test.eq.halfYears);
               assert.equal(component._yearSelectionEnabled, test.eq.years);
            });
         });
      });


      [{
         method: '_onMonthTitleMouseLeave',
         tests: [{
            options: { selectionProcessing: true, monthClickable: true },
            event: null
         }, {
            options: { selectionProcessing: true, monthClickable: false },
            event: null
         }, {
            options: { selectionProcessing: false, monthClickable: true },
            event: 'itemMouseLeave'
         }, {
            options: { selectionProcessing: false, monthClickable: false },
            event: null
         }]
      }, {
         method: '_onMonthBodyClick',
         tests: [{
            options: { selectionProcessing: true, monthClickable: true },
            event: null
         }, {
            options: { selectionProcessing: true, monthClickable: false },
            event: null
         }, {
            options: { selectionProcessing: false, monthClickable: true },
            event: 'monthClick'
         }]
      }, {
         method: '_onMonthClick',
         tests: [{
            options: { selectionProcessing: true, monthClickable: true },
            event: 'itemClick'
         }, {
            options: { selectionProcessing: true, monthClickable: false },
            event: 'itemClick'
         }, {
            options: { selectionProcessing: false, monthClickable: true },
            event: null
         }, {
            options: { selectionProcessing: false, monthClickable: false },
            event: 'itemClick'
         }, {
            options: { selectionProcessing: true, monthClickable: true },
            event: 'selectionViewTypeChanged',
            eventOptions: ['months']
         }, {
            options: { selectionProcessing: true, monthClickable: false },
            event: 'selectionViewTypeChanged',
            eventOptions: ['months']
         }, {
            options: { selectionProcessing: false, monthClickable: false },
            event: 'selectionViewTypeChanged',
            eventOptions: ['months']
         }]
      }, {
         method: '_onMonthTitleClick',
         tests: [{
            options: { selectionProcessing: false, monthClickable: true },
            event: 'itemClick'
         }, {
            options: { selectionProcessing: false, monthClickable: false },
            event: null
         }, {
            options: { selectionProcessing: true, monthClickable: true },
            event: null
         }, {
            options: { selectionProcessing: false, monthClickable: true, ranges: { days: [1] } },
            event: null
         }]
      }, {
         method: '_onMonthMouseEnter',
         tests: [{
            options: { selectionProcessing: true, monthClickable: true },
            event: 'itemMouseEnter'
         }, {
            options: { selectionProcessing: true, monthClickable: false },
            event: 'itemMouseEnter'
         }, {
            options: { selectionProcessing: false, monthClickable: true },
            event: null
         }, {
            options: { selectionProcessing: false, monthClickable: false },
            event: 'itemMouseEnter'
         }]
      }, {
         method: '_onMonthMouseLeave',
         tests: [{
            options: { selectionProcessing: true, monthClickable: true },
            event: 'itemMouseLeave'
         }, {
            options: { selectionProcessing: true, monthClickable: false },
            event: 'itemMouseLeave'
         }, {
            options: { selectionProcessing: false, monthClickable: true },
            event: null
         }, {
            options: { selectionProcessing: false, monthClickable: false },
            event: 'itemMouseLeave'
         }]
      }].forEach(function(testGroup) {
         describe(testGroup.method, function() {
            testGroup.tests.forEach(function(test) {
               it(`should generate ${test.event} for options ${JSON.stringify(test.options)}.`, function () {
                  const component = calendarTestUtils.createComponent(
                     MonthsRangeItem, coreMerge({ date: start }, test.options, { preferSource: true }));

                  sandbox.stub(component, '_notify');
                  component[testGroup.method](null, start);

                  if (test.event) {
                     sinon.assert.calledWith(
                        component._notify, test.event, test.eventOptions || [start]);
                  } else {
                     sinon.assert.notCalled(component._notify);
                  }
               });
            });
         });
      });

      // describe('_onMonthKeyDown', () => {
      //    [{
      //       options: { selectionProcessing: true, monthClickable: false },
      //       event: {
      //          preventDefault: () => 0,
      //          nativeEvent: {
      //             keyCode: 40
      //          }
      //       },
      //       hoveredItem: new Date(2021, 1, 1),
      //       eventName: 'itemMouseEnter',
      //       eventOptions: new Date(2021, 4, 1)
      //    }, {
      //       options: { selectionProcessing: true, monthClickable: false },
      //       event: {
      //          preventDefault: () => 0,
      //          nativeEvent: {
      //             keyCode: 38
      //          }
      //       },
      //       hoveredItem: new Date(2021, 1, 1),
      //       eventName: 'itemMouseEnter',
      //       eventOptions: new Date(2020, 10, 1)
      //    }, {
      //       options: { selectionProcessing: true, monthClickable: false },
      //       event: {
      //          preventDefault: () => 0,
      //          nativeEvent: {
      //             keyCode: 37
      //          }
      //       },
      //       hoveredItem: new Date(2021, 1, 1),
      //       eventName: 'itemMouseEnter',
      //       eventOptions: new Date(2021, 0, 1)
      //    }, {
      //       options: { selectionProcessing: true, monthClickable: false },
      //       event: {
      //          preventDefault: () => 0,
      //          nativeEvent: {
      //             keyCode: 39
      //          }
      //       },
      //       hoveredItem: new Date(2021, 1, 1),
      //       eventName: 'itemMouseEnter',
      //       eventOptions: new Date(2021, 2, 1)
      //    }].forEach((test) => {
      //       it('should generate event with correct date', () => {
      //          const component = calendarTestUtils.createComponent(
      //             MonthsRangeItem, coreMerge({ date: start }, test.options, { preferSource: true })
      //          );
      //          global.document = {
      //             querySelector: () => null
      //          };
      //          let notifyCalled = false;
      //          let date;
      //          if (test.hoveredItem) {
      //             component._hoveredItem = test.hoveredItem;
      //          }
      //          component._notify = (event, args) => {
      //             date = args[0];
      //             notifyCalled = true;
      //          };
      //          component._onMonthKeyDown(test.event, start);
      //
      //          assert.isTrue(notifyCalled);
      //          assert.equal(date.getFullYear(), test.eventOptions.getFullYear());
      //          assert.equal(date.getMonth(), test.eventOptions.getMonth());
      //          assert.equal(date.getDate(), test.eventOptions.getDate());
      //       });
      //    });
      //    [{
      //       options: { selectionProcessing: true, monthClickable: false },
      //       event: {
      //          preventDefault: () => 0,
      //          nativeEvent: {
      //             keyCode: 39
      //          }
      //       },
      //       eventName: null
      //    }, {
      //       options: { selectionProcessing: true, monthClickable: false },
      //       event: {
      //          preventDefault: () => 0,
      //          nativeEvent: {
      //             keyCode: 40
      //          }
      //       },
      //       eventName: null
      //    }, {
      //       options: { selectionProcessing: true, monthClickable: false },
      //       event: {
      //          preventDefault: () => 0,
      //          nativeEvent: {
      //             keyCode: 55
      //          }
      //       },
      //       hoveredItem: new Date(2021, 1, 1),
      //       eventName: 'itemMouseEnter',
      //       eventOptions: new Date(2021, 2, 1)
      //    }].forEach((test) => {
      //       it('should generate event with correct date', () => {
      //          const component = calendarTestUtils.createComponent(
      //             MonthsRangeItem, coreMerge({ date: start }, test.options, { preferSource: true })
      //          );
      //          global.document = {
      //             querySelector: () => null
      //          };
      //          let notifyCalled = false;
      //          if (test.hoveredItem) {
      //             component._hoveredItem = test.hoveredItem;
      //          }
      //          component._notify = (event, args) => {
      //             notifyCalled = true;
      //          };
      //          component._onMonthKeyDown(test.event);
      //          assert.isFalse(notifyCalled);
      //       });
      //    });
      // });

      describe('_prepareItemClass', function() {
         [{
            options: {
               selectionProcessing: false,
               hoveredSelectionValue: start
            },
            cssClass: 'controls-PeriodDialog-MonthsRange__hovered'
         }, {
            options: {
               selectionProcessing: false,
               hoveredSelectionValue: start,
               hoveredStartValue: start,
               selectionViewType: MonthsRangeItem.SELECTION_VIEW_TYPES.months
            },
            cssClass: 'controls-RangeSelection__start-end-hovered'
         }].forEach(function(test) {
            it(`should return correct css class if options are equal to ${JSON.stringify(test.options)}.`, function() {
               const component = calendarTestUtils.createComponent(
                     MonthsRangeItem,
                     coreMerge({ date: start }, test.options, { preferSource: true })
                  ),
                  css = component._prepareItemClass();

               assert.include(css, test.cssClass);
            });
         });
      });

      // describe('_toggleState', function() {
      //    it('should toggle state.', function() {
      //       const component = calendarTestUtils.createComponent(PeriodDialog, {});
      //       assert.strictEqual(component._state, component._STATES.year);
      //       component._toggleState();
      //       assert.strictEqual(component._state, component._STATES.month);
      //    });
      // });
   });
});
