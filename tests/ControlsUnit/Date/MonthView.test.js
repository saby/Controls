define([
   'Core/core-merge',
   'Controls/calendar',
   'Controls/dateUtils',
   'ControlsUnit/Calendar/Utils'
], function(
   coreMerge,
   calendar,
   DateUtil,
   calendarTestUtils
) {
   'use strict';

   let config = {
      month: new Date(2017, 0, 1),
      showCaption: true
   };

   describe('Controls/Date/MonthView', function() {
      describe('Initialisation', function() {

         it('should create the correct model for the month when creating', function() {
            let mv, weeks;

            mv = calendarTestUtils.createComponent(calendar.MonthView, config);

            assert.strictEqual(mv._caption, "Январь'17", 'wrong _caption field');

            weeks = mv._monthViewModel.getMonthArray();

            assert.equal(weeks.length, 6);
            calendarTestUtils.assertMonthView(weeks);
            assert.isTrue(DateUtil.Base.isDatesEqual(weeks[0][0].date, new Date(2016, 11, 26)));
         });

      });

      describe('_dayClickHandler', function() {
         it('should generate "itemClick" event', function() {
            let sandbox = sinon.sandbox.create(),
               mv = calendarTestUtils.createComponent(calendar.MonthView, config),
               item = 'item',
               event = 'event';

            sandbox.stub(mv, '_notify');
            [{
               isCurrentMonth: false,
               mode: 'extended'
            }, {
               isCurrentMonth: true,
               mode: 'current'
            }].forEach(function (test) {
               mv._dayClickHandler(event, item, test.mode, test.isCurrentMonth);
               sinon.assert.calledWith(mv._notify, 'itemClick', [item, event]);
            });

            sandbox.restore();
         });

         it('should\'t generate "itemClick" event', function() {
            let sandbox = sinon.sandbox.create(),
               mv = calendarTestUtils.createComponent(calendar.MonthView, config),
               item = 'item',
               clickable= false;

            sandbox.stub(mv, '_notify');
            mv._dayClickHandler({}, item, clickable);

            sinon.assert.notCalled(mv._notify);
            sandbox.restore();
         });

         it('should\'t generate "itemClick" event in readOnly mode', function() {
            let sandbox = sinon.sandbox.create(),
               item = 'item',
               mv = calendarTestUtils.createComponent(
                  calendar.MonthView, coreMerge({ readOnly: true }, config, { preferSource: true }));

            sandbox.stub(mv, '_notify');
            mv._dayClickHandler({}, item);

            sinon.assert.notCalled(mv._notify);
            sandbox.restore();
         });
      });

      describe('_mouseEnterHandler', function() {
         [{
            title: 'mode=current, month is current',
            isCurrentMonth: true,
            mode: 'current'
         }, {
            title: 'mode=extended, month is not current',
            isCurrentMonth: false,
            mode: 'extended'
         }].forEach((test) => {
            it('should generate "itemMouseEnter" event. ' + test.title, function() {
               let sandbox = sinon.sandbox.create(),
                  item = 'item',
                  mv = calendarTestUtils.createComponent(calendar.MonthView, { mode: test.mode });

               sandbox.stub(mv, '_notify');
               mv._mouseEnterHandler({}, item, test.isCurrentMonth);
               sinon.assert.calledWith(mv._notify, 'itemMouseEnter', [item]);
               sandbox.restore();
            });
         });

         it('should\'t generate "itemMouseEnter" event', function () {
            let sandbox = sinon.sandbox.create(),
               item = 'item',
               mv = calendarTestUtils.createComponent(calendar.MonthView, config);

            sandbox.stub(mv, '_notify');

            mv._mouseEnterHandler({}, item, false);
            sinon.assert.notCalled(mv._notify);
            sandbox.restore();
         });
      });

      describe('_updateView', function() {
         it('should update month and month caption when month changed', function() {
            const mv = calendarTestUtils.createComponent(calendar.MonthView, config),
               month = new Date(2018, 4, 1);
            calendar.MonthView._private._updateView(mv, Object.assign({}, mv._options, {month: month}));
            assert.equal(mv._month.getTime(), month.getTime(), 'wrong _month');
            assert.strictEqual(mv._caption, "Май'18", 'wrong _caption');
         });

         it('should not update month if month did not changed', function() {
            const mv = calendarTestUtils.createComponent(calendar.MonthView, config);
            calendar.MonthView._private._updateView(mv, Object.assign({}, config, {month: new Date(config.month)}));
            assert.strictEqual(mv._month.getTime(), config.month.getTime(), 'wrong _month');
         });
      });

   });
});
