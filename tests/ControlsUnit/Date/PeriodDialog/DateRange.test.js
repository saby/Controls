define([
   'Core/core-merge',
   'Core/core-instance',
   'Types/entity',
   'Controls/_datePopup/DateRange',
   'Controls/_datePopup/Utils',
   'Controls/dateUtils',
   'ControlsUnit/Calendar/Utils'
], function(
   coreMerge,
   cInstance,
   entity,
   DateRange,
   datePopupUtils,
   dateUtils,
   calendarTestUtils
) {
   'use strict';

   const start = new Date(2018, 0, 1),
      end = new Date(2018, 0, 2),
      year = new Date(2018, 0, 1);

   let sandbox;

   describe('Controls/_datePopup/DateRange', function() {
      beforeEach(function() {
         sandbox = sinon.sandbox.create();
      });

      afterEach(function() {
         sandbox.restore();
         sandbox = null;
      });

      describe('Initialisation', function() {

         it('should create the correct models when empty range passed.', function() {
            const component = calendarTestUtils.createComponent(DateRange, { year: year });
            assert.isUndefined(component._rangeModel.startValue);
            assert.isUndefined(component._rangeModel.endValue);
         });

         it('should create the correct range model when range passed.', function() {
            const component = calendarTestUtils.createComponent(
               DateRange,
               { year: year, startValue: start, endValue: end }
            );
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.endValue, end));
         });

         [
            { options: { selectionType: 'range' }, eq: true },
            { options: { selectionType: 'quantum', ranges: { months: [1] } }, eq: true },
            { options: { selectionType: 'quantum', ranges: { years: [1] } }, eq: false },
            { options: { selectionType: 'single' }, eq: false },
            { options: { readonly: false }, eq: false }
         ].forEach(function(test) {
            it(`should set proper _monthSelectionEnabled for options ${JSON.stringify(test.options)}.`, function() {
               const component = calendarTestUtils.createComponent(DateRange, test.options);
               assert.equal(component._monthSelectionEnabled, test.eq);
            });
         });

      });

      describe('_monthCaptionClick', function() {
         it('should notify event.', function() {
            const component = calendarTestUtils.createComponent(DateRange, { month: year, selectionType: 'range' });
            sandbox.stub(component, '_notify');
            component._monthCaptionClick(null, new Date(2019, 0), 3);
            sinon.assert.calledWith(
               component._notify, 'fixedPeriodClick', [new entity.applied.Date(2019, 3, 1), new entity.applied.Date(2019, 3, 30)]);
         });
         it('should not notify event if month selection disabled.', function() {
            const component = calendarTestUtils.createComponent(
               DateRange, { month: year, selectionType: 'quantum', ranges: { days: [1] } });
            sandbox.stub(component, '_notify');
            component._monthCaptionClick(null, new Date(2019, 0), 3);
            sinon.assert.notCalled(component._notify);
         });
      });

      describe('_formatMonth', function() {
         [
            { month: 0, text: 'Январь' },
            { month: 1, text: 'Февраль' },
            { month: 2, text: 'Март' },
            { month: 3, text: 'Апрель' },
            { month: 4, text: 'Май' },
            { month: 5, text: 'Июнь' },
            { month: 6, text: 'Июль' },
            { month: 7, text: 'Август' },
            { month: 8, text: 'Сентябрь' },
            { month: 9, text: 'Октябрь' },
            { month: 10, text: 'Ноябрь' },
            { month: 11, text: 'Декабрь' }

         ].forEach(function(test) {
            it(`should return ${test.text} if ${test.month} is passed.`, function() {
               const component = calendarTestUtils.createComponent(DateRange, { year: year });
               assert.equal(component._formatMonth(test.month), test.text);
            });
         });
      });
       describe('_onMonthsPositionChanged', () => {
           [{
               position: new Date(2018, 5),
               newPosition: new Date(2019, 2),
               result: new Date(2019, 0)
           }, {
               position: new Date(2018, 5),
               newPosition: new Date(2016, 4),
               result: new Date(2017, 0)
           }].forEach((test) => {
               it('should set correct position', () => {
                   const component = calendarTestUtils.createComponent(DateRange, {});
                   component._position = test.position
                   let resultValue;
                   component._notify = (eventName, value) => {
                       resultValue = value[0];
                   };
                   component._onMonthsPositionChanged('event', test.newPosition);
                   assert.equal(resultValue.getFullYear(), test.result.getFullYear());
               });
           });

           [{
               position: new Date(2018, 5),
               newPosition: new Date(2018, 2)
           }, {
               position: new Date(2018, 5),
               newPosition: new Date(2017, 4)
           }].forEach((test) => {
               it('should not set position', () => {
                   const component = calendarTestUtils.createComponent(DateRange, {});
                   component._position = test.position;
                   sinon.stub(component, '_notify');
                   component._onMonthsPositionChanged('event', test.newPosition);
                   sinon.assert.notCalled(component._notify);
                   sinon.restore();
               });
           });
       });

       describe('_updateView', () => {
            it('should  update _monthsPosition', () => {
                const component = calendarTestUtils.createComponent(DateRange, {});
                component._position = new Date(2020, 5);
                this._shouldUpdateMonthsPosition = true;
                component._updateView({
                    position: new Date(2019, 4)
                });
                const result = new Date(2019, 0);
                assert.isTrue(dateUtils.Base.isDatesEqual(result, component._monthsPosition));
            });
           it('should not update _monthsPosition', () => {
               const component = calendarTestUtils.createComponent(DateRange, {});
               component._position = new Date(2020, 5);
               const result = new Date(2020, 0);
               component._monthsPosition = result;
               component._shouldUpdateMonthsPosition = false;
               component._updateView({
                   position: new Date(2019, 4)
               });
               assert.isTrue(dateUtils.Base.isDatesEqual(result, component._monthsPosition));
           });
       });
   });
});
