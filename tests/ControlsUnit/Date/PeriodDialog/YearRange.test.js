define([
   'Core/core-merge',
   'Controls/_datePopup/YearsRange',
   'Controls/Utils/Date',
   'ControlsUnit/Calendar/Utils'
], function(
   coreMerge,
   YearsRange,
   dateUtils,
   calendarTestUtils
) {
   'use strict';

   const start = new Date(2018, 0, 1),
      end = new Date(2018, 0, 2),
      year = new Date(2018, 0, 1);

   describe('Controls/Date/PeriodDialog/YearRange', function() {
      describe('Initialisation', function() {

         it('should create the correct models when empty range passed.', function() {
            const component = calendarTestUtils.createComponent(YearsRange, { year: year });
            assert.isNull(component._rangeModel.startValue);
            assert.isNull(component._rangeModel.endValue);
         });

         it('should create the correct range model when range passed.', function() {
            const component = calendarTestUtils.createComponent(
               YearsRange,
               { year: year, startValue: start, endValue: end }
            );
            assert(dateUtils.isDatesEqual(component._rangeModel.startValue, start));
            assert(dateUtils.isDatesEqual(component._rangeModel.endValue, end));
         });

         [{
            position: new Date(2019, 0),
            lastYear: 2019
         }, {
            position: new Date(2019, 0),
            startValue: new Date(2019, 0),
            lastYear: 2019
         }, {
            position: new Date(2019, 0),
            startValue: new Date(2019, 0),
            endValue: new Date(2021, 0),
            lastYear: 2021
         }, {
            position: new Date(2019, 0),
            startValue: new Date(2019, 0),
            endValue: new Date(2024, 0),
            lastYear: 2024
         }, {
            position: new Date(2019, 0),
            startValue: new Date(2019, 0),
            endValue: new Date(2025, 0),
            lastYear: 2024
         }].forEach(function(test) {
            it('should set the correct lastYear model when options' +
               `{ year: ${test.position}, startValue: ${test.startValue}, endValue: ${test.endValue} } passed.`, function() {
               const component = calendarTestUtils.createComponent(
                  YearsRange,
                  { year: test.position, startValue: test.startValue, endValue: test.endValue }
               );
               assert.strictEqual(component._lastYear, test.lastYear);
            });
         });
      });


      describe('_onPrevClick', function() {
         it('should decrease year.', function() {
            const component = calendarTestUtils.createComponent(YearsRange, { year: year });
            component._onPrevClick();
            assert.equal(component._lastYear, year.getFullYear() - 1);
         });
      });

      describe('_onNextClick', function() {
         it('should increase year.', function() {
            const component = calendarTestUtils.createComponent(YearsRange, { year: year });
            component._onNextClick();
            assert.equal(component._lastYear, year.getFullYear() + 1);
         });
      });

   });
});
