define([
   'Core/core-merge',
   'Controls/_datePopup/YearsRange',
   'Controls/dateUtils',
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
            assert.isUndefined(component._rangeModel.startValue);
            assert.isUndefined(component._rangeModel.endValue);
         });

         it('should create the correct range model when range passed.', function() {
            const component = calendarTestUtils.createComponent(
               YearsRange,
               { year: year, startValue: start, endValue: end }
            );
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.startValue, start));
            assert(dateUtils.Base.isDatesEqual(component._rangeModel.endValue, end));
         });

         [{
            position: new Date(2019, 0),
            lastYear: 2020
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

      describe('_changeYear', function() {
         it('should decrease year', function() {
            const component = calendarTestUtils.createComponent(YearsRange, { year: year });
            const cachedYear = component._lastYear;
            component._changeYear(-1);
            assert.equal(component._lastYear, cachedYear - 1);
         });
         it('should increase year', function() {
            const component = calendarTestUtils.createComponent(YearsRange, { year: year });
            const cachedYear = component._lastYear;
            component._changeYear(1);
            assert.equal(component._lastYear, cachedYear + 1);
         });
      });
      describe('_updateModel', () => {
         [{
            lastYear: 10000
         }, {
            lastYear: 1200
         }].forEach((test) => {
            it('should not let _lastYears get out of valid range', () => {
               const component = calendarTestUtils.createComponent(YearsRange, { year: year });
               component._lastYear = test.lastYear;
               component._updateModel();
               assert.isTrue(component._lastYear >= dateUtils.Base.MIN_YEAR_VALUE &&
                   component._lastYear <= dateUtils.Base.MAX_YEAR_VALUE);
            });
         });
      });
   });
});
