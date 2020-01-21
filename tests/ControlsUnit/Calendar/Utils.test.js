/* global define, describe, it, assert */
define([
   'Types/entity',
   'Core/core-instance',
   'Controls/dateRange',
   'Controls/Utils/Date'
], function(
   TypesEntity,
   cInstance,
   dateRange,
   DateUtil
) {
   describe('Controls.Calendar.Utils', function() {
      // Тесты дублируются в ветки ws
      // describe('.formatDateRangeCaption', function() {
      //    it('should return emptyCaption option value if options passed as parameter and range dont specified.', function () {
      //       let emptyStr = '...';
      //       assert.equal(dateRange.Utils.formatDateRangeCaption(null, null, emptyStr), emptyStr);
      //    });
      //    [
      //       { start: new Date(2017, 0, 1), end: new Date(2017, 0, 1), ret: '1 января\'17' },
      //       // Single period
      //       { start: new Date(2017, 0, 1), end: new Date(2017, 11, 31), ret: '2017' },
      //       { start: new Date(2017, 0, 1), end: new Date(2017, 5, 30), ret: 'I полугодие\'17' },
      //       { start: new Date(2017, 0, 1), end: new Date(2017, 2, 31), ret: 'I квартал\'17' },
      //       { start: new Date(2017, 0, 1), end: new Date(2017, 0, 31), ret: 'Январь\'17' },
      //       { start: new Date(2017, 0, 1), end: new Date(2017, 0, 1), ret: '1 января\'17' },
      //       // Some years
      //       { start: new Date(2017, 0, 1), end: new Date(2018, 11, 31), ret: '2017-2018' },
      //       // Several simple periods within a year
      //       { start: new Date(2017, 0, 1), end: new Date(2017, 8, 30), ret: 'I-III квартал\'17' },
      //       { start: new Date(2017, 0, 1), end: new Date(2017, 1, 28), ret: 'Январь - Февраль\'17' },
      //       { start: new Date(2017, 0, 1), end: new Date(2017, 0, 15), ret: '01.01.17 - 15.01.17' },
      //       // Within several years
      //       { start: new Date(2017, 0, 1), end: new Date(2018, 5, 30), ret: 'I квартал\'17-II квартал\'18' },
      //       { start: new Date(2017, 0, 1), end: new Date(2018, 2, 31), ret: 'I квартал\'17-I квартал\'18' },
      //       { start: new Date(2017, 0, 1), end: new Date(2018, 0, 31), ret: 'Январь\'17 - Январь\'18' },
      //       { start: new Date(2017, 0, 1), end: new Date(2018, 0, 15), ret: '01.01.17 - 15.01.18' },
      //       // Empty period
      //       { start: undefined, end: undefined, ret: '...' },
      //       { start: null, end: null, ret: '...' },
      //       // The first date is not specified
      //       { start: undefined, end: new Date(2017, 0, 1), ret: '... - 01.01.17' },
      //       { start: null, end: new Date(2017, 0, 1), ret: '... - 01.01.17' },
      //       // The second date is not specified
      //       { start: new Date(2017, 0, 1), end: undefined, ret: '01.01.17 - ...' },
      //       { start: new Date(2017, 0, 1), end: null, ret: '01.01.17 - ...' }
      //    ].forEach(function(test) {
      //       it('should return correct range string value.', function () {
      //          assert.equal(dateRange.Utils.formatDateRangeCaption(test.start, test.end, '...'), test.ret);
      //       });
      //    });
      //
      // });

      it('getFirstDayOffset', function() {
         assert.equal(dateRange.Utils.getFirstDayOffset(2017, 12), 4);
         assert.equal(dateRange.Utils.getFirstDayOffset(2017, null), 6);
      });

      it('getDaysInMonth', function() {
         assert.equal(dateRange.Utils.getDaysInMonth(2017, 12), 31);
         assert.equal(dateRange.Utils.getDaysInMonth(2017, 2), 28);
         assert.equal(dateRange.Utils.getDaysInMonth(2016, 2), 29);
      });

      it('getWeeksInMonth', function() {
         assert.equal(dateRange.Utils.getWeeksInMonth(2017, 12), 5);
         assert.equal(dateRange.Utils.getWeeksInMonth(2018, 4), 6);
      });

      it('getWeeksArray', function() {
         let weeks = dateRange.Utils.getWeeksArray(new Date(2017, 0, 1));
         assert.equal(weeks.length, 6);
         for (let week of weeks) {
            assert.equal(week.length, 7);
         }
         assert.isTrue(DateUtil.isDatesEqual(weeks[0][0], new Date(2016, 11, 26)));
         assert.isTrue(cInstance.instanceOfModule(weeks[0][0], 'Types/entity:Date'));
      });

      it('getWeeksArray dateConstructor', function() {
         let weeks = dateRange.Utils.getWeeksArray(new Date(2017, 0, 1), 'current', TypesEntity.DateTime);
         assert.isTrue(cInstance.instanceOfModule(weeks[0][0], 'Types/entity:DateTime'));
      });

      it('getWeekdaysCaptions should return the same array if locale has not changed', function() {
         const result1 = dateRange.Utils.getWeekdaysCaptions();
         const result2 = dateRange.Utils.getWeekdaysCaptions();
         assert.equal(result1, result2);
      })

      describe('updateRangeByQuantum', function() {
         const tests = [{
            baseDate: new Date(2018, 0, 15),
            date: new Date(2018, 0, 16),
            quantum: {},
            ret: [new Date(2018, 0, 15), new Date(2018, 0, 16)]
         }, {
            baseDate: new Date(2018, 0, 16),
            date: new Date(2018, 0, 15),
            quantum: {},
            ret: [new Date(2018, 0, 15), new Date(2018, 0, 16)]
         }, {
            baseDate: new Date(2018, 0, 15),
            date: new Date(2018, 0, 16),
            quantum: {days: [1]},
            ret: [new Date(2018, 0, 15), new Date(2018, 0, 15)]
         }, {
            baseDate: new Date(2018, 0, 16),
            date: new Date(2018, 0, 15),
            quantum: {days: [1]},
            ret: [new Date(2018, 0, 16), new Date(2018, 0, 16)]
         }, {
            baseDate: new Date(2018, 0, 16),
            date: new Date(2018, 0, 17),
            quantum: {weeks: [1]},
            ret: [new Date(2018, 0, 15), new Date(2018, 0, 21)]
         }, {
            baseDate: new Date(2018, 0, 17),
            date: new Date(2018, 0, 16),
            quantum: {weeks: [1]},
            ret: [new Date(2018, 0, 15), new Date(2018, 0, 21)]
         }, {
            baseDate: new Date(2018, 0, 16),
            date: new Date(2018, 0, 17),
            quantum: {months: [1]},
            ret: [new Date(2018, 0, 1), new Date(2018, 0, 31)]
         }, {
            baseDate: new Date(2018, 0, 17),
            date: new Date(2018, 0, 16),
            quantum: {months: [1]},
            ret: [new Date(2018, 0, 1), new Date(2018, 0, 31)]
         }];
         tests.forEach(function(test) {
            it(`updateRangeByQuantum(${test.baseDate}, ${test.date}, ${test.quantum})`, function() {
               assert.deepEqual(dateRange.Utils.updateRangeByQuantum(test.baseDate, test.date, test.quantum), test.ret);
            });
         });
      });
   });
});
