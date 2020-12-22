define([
   'Core/core-instance',
   'Types/entity',
   'Controls/dateUtils'
], function(
   cInstance,
   entity,
   dateUtil
) {
   describe('Controls/dateUtils', function () {
      describe('getDaysInMonth', function() {
         [
            { date: new Date(2018, 0, 4), resp: 31 },
            { date: new Date(2018, 1, 4), resp: 28 },
            { date: new Date(2016, 1, 4), resp: 29 },
            { date: new Date(2018, 3, 1), resp: 30 }
         ].forEach(function(test) {
            it(`should return ${test.resp} for ${test.date}`, function() {
               assert.equal(dateUtil.Base.getDaysInMonth(test.date), test.resp);
            });
         });
      });

      describe('The return date class must be the same as the passed date', function() {
         [
            'getStartOfWeek',
            'getEndOfWeek',
            'getStartOfMonth',
            'getEndOfMonth',
            'getStartOfQuarter',
            'getEndOfQuarter',
            'getStartOfHalfyear',
            'getEndOfHalfyear',
            'getStartOfYear',
            'getEndOfYear',
            'normalizeMonth',
            'normalizeDate'
         ].forEach(function (functionName) {
            it(functionName, function () {
               assert.isTrue(
                  cInstance.instanceOfModule(dateUtil.Base[functionName](new entity.DateTime()), 'Types/entity:DateTime')
               );
            });
         });
      });
   });
});
