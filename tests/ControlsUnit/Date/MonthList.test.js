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
      describe('_beforeMount', function() {
         it('default options', function() {
            let ml = calendarTestUtils.createComponent(calendar.MonthList, config);
            assert.strictEqual(ml._itemTemplate, YearTemplate);
            assert.strictEqual(ml._positionToScroll, config.position);
            assert.strictEqual(ml._displayedPosition, config.position);
            assert.strictEqual(ml._startPositionId, '2018-01-01');
            assert.strictEqual(+ml._lastNotifiedPositionChangedDate, +config.position);
         });

         it('viewMode = "year", position = 2020.03.01', function() {
            const
                position = new Date(2020, 2, 1),
                ml = calendarTestUtils.createComponent(calendar.MonthList, {viewMode: 'year', position: position});
            assert.strictEqual(ml._positionToScroll, position);
            assert.strictEqual(ml._displayedPosition, position);
            assert.strictEqual(ml._startPositionId, '2020-01-01');
            assert.strictEqual(+ml._lastNotifiedPositionChangedDate, +(new Date(2020, 0, 1)));
         });

         it('should render by month if viewMode is equals "month"', function() {
            let ml = calendarTestUtils.createComponent(
               calendar.MonthList, coreMerge({ viewMode: 'month' }, config, { preferSource: true }));
            assert.strictEqual(ml._itemTemplate, MonthTemplate);
         });

         it('position option', function() {
            let
               position = new Date(2018, 0, 1),
               ml = calendarTestUtils.createComponent(calendar.MonthList, { position: position });
            assert.equal(ml._positionToScroll, position);
            assert.equal(ml._displayedPosition, position);
            assert.equal(ml._startPositionId, '2018-01-01');
         });

         it('should initialize _extDataLastVersion if source option passed', function() {
            let
               sandbox = sinon.createSandbox(),
               control = calendarTestUtils.createComponent(
                  calendar.MonthList, coreMerge(config, { preferSource: true }));
            sandbox.stub(control, '_enrichItemsDebounced');
            assert.strictEqual(control._extDataLastVersion, control._extData.getVersion());
            sandbox.restore();
         });
         it('without receivedState', function() {
            const sandBox = sinon.createSandbox();
            let ml = calendarTestUtils.createComponent(calendar.MonthList);
            sinon.replace(ml, '_updateSource', () => {
               return;
            });
            ml._extData = {
               enrichItems: function() {
                  return;
               }
            };
            sandBox.stub(ml._extData, 'enrichItems');
            ml._beforeMount({});
            sinon.assert.calledOnce(ml._extData.enrichItems);
            sandBox.restore();
         });
         it('with receivedState', function() {
            const sandBox = sinon.createSandbox();
            let ml = calendarTestUtils.createComponent(calendar.MonthList),
               options = 'options',
               context = 'context',
               receivedState = 'receivedState';
            sinon.replace(ml, '_updateSource', () => {
               return;
            });
            ml._extData = {
               updateData: function() {
                  return;
               }
            };
            sandBox.stub(ml._extData, 'updateData');
            ml._beforeMount({}, '', 'receivedState');
            sinon.assert.calledOnce(ml._extData.updateData);
            sandBox.restore();
         });
      });
   });
});
