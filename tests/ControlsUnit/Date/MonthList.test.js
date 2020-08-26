define([
   'Core/core-merge',
   'Types/entity',
   'Types/collection',
   'Controls/calendar',
   'Controls/Utils/Date',
   'ControlsUnit/Calendar/Utils',
   'Controls/_calendar/MonthList/ItemTypes',
   'wml!Controls/_calendar/MonthList/MonthTemplate',
   'wml!Controls/_calendar/MonthList/YearTemplate'
], function(
   coreMerge,
   entity,
   collection,
   calendar,
   DateUtil,
   calendarTestUtils,
   ItemTypes,
   MonthTemplate,
   YearTemplate
) {
   'use strict';
   let config = {
      position: new Date(2018, 0, 1)
   };

   ItemTypes = ItemTypes.default;

   describe('Controls/_calendar/MonthList', function() {
      describe('_findElementByDate', function() {
         const
            ITEM_BODY_SELECTOR = calendar.MonthList._ITEM_BODY_SELECTOR,
            returnAllPeriodTypes = function(selector, date) {
               return selector;
            },
            returnMonths = function(selector, date) {
               return selector === ITEM_BODY_SELECTOR.month ? selector : null;
            },
            returnYears = function(selector, date) {
               return selector === ITEM_BODY_SELECTOR.year ? selector : null;
            };

         [{
            date: new Date(2020, 1, 2),
            getElementByDateStub: returnAllPeriodTypes,
            result: ITEM_BODY_SELECTOR.day
         }, {
            date: new Date(2020, 1, 1),
            getElementByDateStub: returnAllPeriodTypes,
            result: ITEM_BODY_SELECTOR.month
         }, {
            date: new Date(2020, 0, 1),
            getElementByDateStub: returnAllPeriodTypes,
            result: ITEM_BODY_SELECTOR.year
         }, {
            date: new Date(2020, 1, 2),
            getElementByDateStub: returnMonths,
            result: ITEM_BODY_SELECTOR.month
         }, {
            date: new Date(2020, 1, 2),
            getElementByDateStub: returnYears,
            result: ITEM_BODY_SELECTOR.year
         }].forEach(function(test, index) {
            it(`test ${index}`, function () {
               let
                  sandbox = sinon.createSandbox(),
                  control = calendarTestUtils.createComponent(
                     calendar.MonthList, coreMerge(test.options, config, { preferSource: true }));

               sandbox.stub(control, '_getElementByDate').callsFake(test.getElementByDateStub);
               assert.strictEqual(control._findElementByDate(test.date), test.result);
               sandbox.restore();
            });
         });
      });
   });
});
