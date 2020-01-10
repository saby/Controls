define([
   'Core/core-merge',
   'Types/collection',
   'Controls/calendar',
   'Controls/Utils/Date',
   'ControlsUnit/Calendar/Utils',
   'Controls/_calendar/MonthList/ItemTypes',
   'wml!Controls/_calendar/MonthList/MonthTemplate',
   'wml!Controls/_calendar/MonthList/YearTemplate'
], function(
   coreMerge,
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
      startPosition: new Date(2018, 0, 1)
   };

   ItemTypes = ItemTypes.default;

   describe('Controls/_calendar/MonthList', function() {
      describe('_beforeMount', function() {
         it('default options', function() {
            let ml = calendarTestUtils.createComponent(calendar.MonthList, config);
            assert.strictEqual(ml._itemTemplate, YearTemplate);
            assert.strictEqual(ml._positionToScroll, config.startPosition);
            assert.strictEqual(ml._displayedPosition, config.startPosition);
            assert.strictEqual(ml._startPositionId, '2018-01-01');
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

      describe('_afterMount', function() {
         it('should set setShadowMode', function() {
            let
               sandbox = sinon.createSandbox(),
               control = calendarTestUtils.createComponent(calendar.MonthList, { position: new Date(2017, 2, 3) });

            sandbox.stub(control, '_canScroll').returns([true]);
            sandbox.stub(control, '_scrollToDate');
            control._afterMount();
            sinon.assert.called(control._scrollToDate);
            sandbox.restore();
         });
      });

      describe('_beforeUpdate', function() {
         it('should update position fields if position changed', function () {
            let
               sandbox = sinon.createSandbox(),
               position = new Date(2018, 0, 1),
               ml = calendarTestUtils.createComponent(calendar.MonthList, { position: new Date(2017, 2, 3) });

            sandbox.stub(ml, '_canScroll');
            ml._children.months = { reload: sinon.fake() };
            ml._container = {};
            ml._displayedDates = [1, 2];

            ml._beforeUpdate(calendarTestUtils.prepareOptions(calendar.MonthList, { position: position }));
            assert.isTrue(DateUtil.isDatesEqual(ml._positionToScroll, position));
            assert.strictEqual(ml._displayedPosition, position);
            assert.equal(ml._startPositionId, '2018-01-01');
            assert.isEmpty(ml._displayedDates);
            sandbox.restore();
         });

         it('should not update _startPositionId field if item already rendered', function () {
            let
               sandbox = sinon.createSandbox(),
               position = new Date(2018, 0, 1),
               ml = calendarTestUtils.createComponent(calendar.MonthList, { position: new Date(2017, 2, 3) });

            sandbox.stub(ml, '_canScroll').returns([true]);
            sandbox.stub(ml, '_findElementByDate').returns([true]);
            ml._children.months = { reload: sinon.fake() };
            ml._container = {};

            ml._beforeUpdate(calendarTestUtils.prepareOptions(calendar.MonthList, { position: position }));
            assert.isNull(ml._positionToScroll);
            assert.strictEqual(ml._displayedPosition, position);
            assert.equal(ml._startPositionId, '2017-01-01');
            sinon.assert.notCalled(ml._children.months.reload);
            sandbox.restore();
         });

         it('should not update the position before the list is updated', function () {
            let
               sandbox = sinon.createSandbox(),
               position1 = new Date(2018, 0, 1),
               position2 = new Date(2019, 0, 1),
               ml = calendarTestUtils.createComponent(calendar.MonthList, { position: new Date(2017, 2, 3) });

            sandbox.stub(ml, '_canScroll').returns(false);
            sandbox.stub(ml, '_findElementByDate').returns(null);
            ml._children.months = { reload: sinon.fake() };
            ml._container = {};

            ml._beforeUpdate(calendarTestUtils.prepareOptions(calendar.MonthList, { position: position1 }));
            ml._beforeUpdate(calendarTestUtils.prepareOptions(calendar.MonthList, { position: position2 }));
            assert.strictEqual(+ml._positionToScroll, +position1);
            assert.strictEqual(ml._displayedPosition, position1);
            assert.strictEqual(ml._lastPositionFromOptions, position2);
            assert.equal(ml._startPositionId, '2018-01-01');
            sandbox.restore();
         });

         it('should scroll to position immediately without changing position if item already rendered', function () {
            let
               sandbox = sinon.createSandbox(),
               position1 = new Date(2018, 0, 1),
               position2 = new Date(2019, 0, 1),
               ml = calendarTestUtils.createComponent(calendar.MonthList, { position: new Date(2017, 2, 3) });

            sandbox.stub(ml, '_canScroll').returns(true);
            sandbox.stub(ml, '_findElementByDate').returns(null);
            ml._children.months = { reload: sinon.fake() };
            ml._container = {};

            ml._beforeUpdate(calendarTestUtils.prepareOptions(calendar.MonthList, { position: position1 }));
            ml._beforeUpdate(calendarTestUtils.prepareOptions(calendar.MonthList, { position: position2 }));
            assert.strictEqual(+ml._positionToScroll, +position1);
            assert.strictEqual(ml._displayedPosition, position1);
            assert.strictEqual(ml._lastPositionFromOptions, position2);
            assert.equal(ml._startPositionId, '2017-01-01');
            sinon.assert.notCalled(ml._children.months.reload);
            sandbox.restore();
         });

      });

      describe('_afterUpdate', function() {
         it('should notify \'enrichItems\' event if model has been changed', function() {
            const
               sandbox = sinon.createSandbox(),
               component = calendarTestUtils.createComponent(
                  calendar.MonthList, coreMerge(config, { preferSource: true }));

            sandbox.stub(component, '_notify');
            sandbox.stub(component, '_enrichItemsDebounced');
            component._extData._nextVersion();
            component._afterUpdate();
            sinon.assert.calledWith(component._notify, 'enrichItems');
            sandbox.restore();
         });

         it('should\'t notify "enrichItems" event if model has\'t been changed', function() {
            const
               sandbox = sinon.createSandbox(),
               component = calendarTestUtils.createComponent(
                  calendar.MonthList, coreMerge(config, { preferSource: true }));

            sandbox.stub(component, '_notify');
            sandbox.stub(component, '_enrichItemsDebounced');
            component._afterUpdate();
            sinon.assert.notCalled(component._notify);
            sandbox.restore();
         });
      });


      describe('_afterRender, _drawItemsHandler', function() {
         [
            '_afterRender',
            '_drawItemsHandler'
         ].forEach(function(test) {
            it('should scroll to item after position changed', function() {
               let
                  sandbox = sinon.createSandbox(),
                  position = new Date(2018, 0, 1),
                  ml = calendarTestUtils.createComponent(calendar.MonthList, { position: new Date(2017, 2, 3) });
               sandbox.stub(ml, '_canScroll').returns([true]);
               ml._container = {};
               sandbox.stub(ml, '_scrollToDate');
               ml._beforeUpdate(calendarTestUtils.prepareOptions(calendar.MonthList, { position: position }));
               ml[test]();
               sinon.assert.called(ml._scrollToDate);
               sandbox.restore();
            });
         });
      });

      describe('_drawItemsHandler', function() {
         it('should set the position if the _beforeUpdate function has been called several times', function() {
            let
               sandbox = sinon.createSandbox(),
               position1 = new Date(2018, 0, 1),
               position2 = new Date(2019, 0, 1),
               ml = calendarTestUtils.createComponent(calendar.MonthList, { position: new Date(2017, 2, 3) });
            sandbox.stub(ml, '_canScroll').returns([true]);
            ml._container = {};
            sandbox.stub(ml, '_scrollToPosition');
            ml._beforeUpdate(calendarTestUtils.prepareOptions(calendar.MonthList, { position: position1 }));
            ml._beforeUpdate(calendarTestUtils.prepareOptions(calendar.MonthList, { position: position2 }));
            ml._drawItemsHandler();
            assert.strictEqual(ml._displayedPosition, position2);
            sinon.assert.called(ml._scrollToPosition);
            sandbox.restore();
         });
      });

      describe('_scrollToPosition', function() {
         it('should update position in the list and reload list if it cannot scroll', function() {
            let
               sandbox = sinon.createSandbox(),
               position = new Date(2018, 0, 1),
               ml = calendarTestUtils.createComponent(calendar.MonthList, { position: position });
            sandbox.stub(ml, '_canScroll').returns(false);
            ml._children = {
               months: {
                  reload: sinon.fake()
               }
            };
            ml._scrollToPosition(position);
            assert.isEmpty(ml._displayedDates);
            assert.strictEqual(ml._startPositionId, '2018-01-01');
            sinon.assert.called(ml._children.months.reload);
            sandbox.restore();
         });

         it('should not reload list if position changed, it will be changed on update hooks in list control.', function() {
            let
               sandbox = sinon.createSandbox(),
               position = new Date(2018, 0, 1),
               ml = calendarTestUtils.createComponent(calendar.MonthList, { position: new Date(2019, 0, 1) });
            sandbox.stub(ml, '_canScroll').returns(false);
            ml._children = {
               months: {
                  reload: sinon.fake()
               }
            };
            ml._scrollToPosition(position);
            assert.isEmpty(ml._displayedDates);
            assert.strictEqual(ml._startPositionId, '2018-01-01');
            sinon.assert.notCalled(ml._children.months.reload);
            sandbox.restore();
         });

         it('should scroll to days.', function() {
            let
               sandbox = sinon.createSandbox(),
               position = new Date(2018, 0, 2),
               ml = calendarTestUtils.createComponent(calendar.MonthList, { position: new Date(2019, 0, 1) });
            sandbox.stub(ml, '_canScroll').returns(false);
            ml._children = {
               months: {
                  reload: sinon.fake()
               }
            };
            ml._scrollToPosition(position);
            assert.isEmpty(ml._displayedDates);
            assert.strictEqual(ml._startPositionId, '2018-01-01');
            assert.strictEqual(ml._positionToScroll, position);
            sinon.assert.notCalled(ml._children.months.reload);
            sandbox.restore();
         });
      });

      describe('_scrollToDate', function() {
         it('should scroll with animation if animation is enabled', function() {
            let
               sandbox = sinon.createSandbox(),
               mv = calendarTestUtils.createComponent(calendar.MonthList, { animation: true }),
               scrollIntoView = sinon.fake();

            sandbox.stub(mv, '_findElementByDate').returns({
               scrollIntoView: scrollIntoView
            });
            mv._children = {
               scroll: {
                  delayLoadTriggersEvents: sinon.fake()
               }
            };
            mv._scrollToDate(new Date(2019, 0, 1));
            sinon.assert.calledOnce(scrollIntoView);
            sinon.assert.calledOnce(mv._children.scroll.delayLoadTriggersEvents);
            sandbox.restore();
         });
         it('should not scroll with animation if animation is disabled', function() {
            let
               sandbox = sinon.createSandbox(),
               mv = calendarTestUtils.createComponent(calendar.MonthList, {}),
               scrollIntoView = sinon.fake();

            sandbox.stub(mv, '_findElementByDate').returns({
               scrollIntoView: scrollIntoView
            });
            mv._children = {
               scroll: {
                  delayLoadTriggersEvents: sinon.fake()
               }
            };
            mv._scrollToDate(new Date(2019, 0, 1));
            sinon.assert.notCalled(scrollIntoView);
            sinon.assert.notCalled(mv._children.scroll.delayLoadTriggersEvents);
            sandbox.restore();
         });
         it('should not scroll with animation if animation is temporarily disabled', function() {
            let
               sandbox = sinon.createSandbox(),
               mv = calendarTestUtils.createComponent(calendar.MonthList, { animation: true }),
               scrollIntoView = sinon.fake();

            sandbox.stub(mv, '_findElementByDate').returns({
               scrollIntoView: scrollIntoView
            });
            mv._children = {
               scroll: {
                  delayLoadTriggersEvents: sinon.fake()
               }
            };
            mv._animationDisabled = true;
            mv._scrollToDate(new Date(2019, 0, 1));
            sinon.assert.notCalled(scrollIntoView);
            sinon.assert.notCalled(mv._children.scroll.delayLoadTriggersEvents);
            sandbox.restore();
         });
      });

      describe('_getMonth', function() {
         it('should return correct month', function() {
            let mv = calendarTestUtils.createComponent(calendar.MonthList, config);
            assert.isTrue(DateUtil.isDatesEqual(mv._getMonth(2018, 1), new Date(2018, 1, 1)));
         });
      });

      describe('_intersectHandler', function() {
         [{
            title: 'Should generate an event when the element appeared on top and half visible',
            entries: [{
               nativeEntry: {
                  boundingClientRect: { top: 10, bottom: 30 },
                  rootBounds: { top: 20 }
               },
               data: {
                  date: new Date(2019, 0),
                  type: ItemTypes.body
               }
            }],
            options: {},
            date: new Date(2019, 0)
         }, {
            title: 'Should generate an event when the element appeared on top and the next one is half visible. viewMode: "year"',
            entries: [{
               nativeEntry: {
                  boundingClientRect: { top: 50, bottom: 30 },
                  rootBounds: { top: 60 },
                  target: { offsetHeight: 50 }
               },
               data: {
                  date: new Date(2019, 0),
                  type: ItemTypes.body
               }
            }],
            options: {},
            date: new Date(2020, 0)
         }, {
            title: 'Should generate an event when the element appeared on top and the next one is half visible. viewMode: "month"',
            entries: [{
               nativeEntry: {
                  boundingClientRect: { top: 50, bottom: 30 },
                  rootBounds: { top: 60 },
                  target: { offsetHeight: 50 }
               },
               data: {
                  date: new Date(2019, 0),
                  type: ItemTypes.body
               }
            }],
            options: { viewMode: 'month' },
            date: new Date(2019, 1)
         }, {
            title: 'Should generate an event when the 2 elements appeared on top and the next one is half visible. viewMode: "month"',
            entries: [{
               nativeEntry: {
                  boundingClientRect: { top: 0, bottom: 30 },
                  rootBounds: { top: 55 },
                  target: { offsetHeight: 30 }
               },
               data: {
                  date: new Date(2019, 0),
                  type: ItemTypes.body
               }
            }, {
               nativeEntry: {
                  boundingClientRect: { top: 30, bottom: 50 },
                  rootBounds: { top: 55 },
                  target: { offsetHeight: 20 }
               },
               data: {
                  date: new Date(2019, 1),
                  type: ItemTypes.body
               }
            }],
            options: { viewMode: 'month' },
            date: new Date(2019, 2)
         }].forEach(function(test) {
            it(test.title, function() {
               const
                  sandbox = sinon.createSandbox(),
                  component = calendarTestUtils.createComponent(
                     calendar.MonthList, coreMerge(test.options, config, { preferSource: true })
                  );

               sandbox.stub(component, '_notify');
               component._intersectHandler(null, test.entries);
               sinon.assert.calledWith(component._notify, 'positionChanged', [test.date]);
               sandbox.restore();
            });
         });

         it('Should\'t update position and displayed items if component invisible', function() {
            const
               sandbox = sinon.createSandbox(),
               component = calendarTestUtils.createComponent(calendar.MonthList, config);

            component._container.offsetParent = null;
            sandbox.stub(component, '_updateDisplayedItems');
            sandbox.stub(component, '_updateDisplayedPosition');
            component._intersectHandler(null, [{}, {}]);
            sinon.assert.notCalled(component._updateDisplayedItems);
            sinon.assert.notCalled(component._updateDisplayedPosition);
            sandbox.restore();
         });

         [{
            title: 'Should add date to displayed dates.',
            entries: [{
               nativeEntry: {
                  boundingClientRect: { top: 10, bottom: 30 },
                  rootBounds: { top: 20 },
                  isIntersecting: true
               },
               data: {
                  date: new Date(2019, 0),
                  type: ItemTypes.body
               }
            }],
            displayedDates: [],
            options: {
               source: {
                  query:function (data) {
                     return new Promise(function(resolve) {
                        resolve(data);
                     });
                  }
               }
            },
            resultDisplayedDates: [(new Date(2019, 0)).getTime()],
            date: new Date(2019, 0)
         }, {
            title: 'Should\'t add date to displayed dates if header item is has been shown.',
            entries: [{
               nativeEntry: {
                  boundingClientRect: { top: 10, bottom: 30 },
                  rootBounds: { top: 20 },
                  isIntersecting: true
               },
               data: {
                  date: new Date(2019, 0),
                  type: ItemTypes.header
               }
            }],
            displayedDates: [],
            options: {
               source: {
                  query:function (data) {
                     return new Promise(function(resolve) {
                        resolve(data);
                     });
                  }
               }
            },
            resultDisplayedDates: [],
            date: new Date(2019, 0)
         }, {
            title: 'Should remove date from displayed dates.',
            entries: [{
               nativeEntry: {
                  boundingClientRect: { top: 10, bottom: 30 },
                  rootBounds: { top: 20 },
                  isIntersecting: false
               },
               data: {
                  date: new Date(2019, 0),
                  type: ItemTypes.body
               }
            }],
            displayedDates: [(new Date(2019, 0)).getTime(), 123],
            options: {
               source: {
                  query:function (data) {
                     return new Promise(function(resolve) {
                        resolve(data);
                     });
                  }
               }
            },
            resultDisplayedDates: [123],
            date: new Date(2019, 0)
         }, {
            title: 'Should\'t remove date from displayed dates if header item is has been hidden.',
            entries: [{
               nativeEntry: {
                  boundingClientRect: { top: 10, bottom: 30 },
                  rootBounds: { top: 20 },
                  isIntersecting: false
               },
               data: {
                  date: new Date(2019, 0),
                  type: ItemTypes.header
               }
            }],
            displayedDates: [(new Date(2019, 0)).getTime(), 123],
            options: {
               source: {
                  query:function (data) {
                     return new Promise(function(resolve) {
                        resolve(data);
                     });
                  }
               }
            },
            resultDisplayedDates: [(new Date(2019, 0)).getTime(), 123],
            date: new Date(2019, 0)
         }].forEach(function(test) {
            it(test.title, function() {
               const
                  sandbox = sinon.createSandbox(),
                  component = calendarTestUtils.createComponent(
                     calendar.MonthList, coreMerge(test.options, config, { preferSource: true })
                  );

               sandbox.stub(component, '_enrichItemsDebounced');
               component._displayedDates = test.displayedDates;
               component._intersectHandler(null, test.entries);
               assert.deepEqual(component._displayedDates, test.resultDisplayedDates);
               sandbox.restore();
            });
         });
      });

      describe('_canScroll', function() {
         [{
            title: 'should scroll if viewMode === \'year\' and period is not the first month of the year',
            options: { viewMode: 'year' },
            date: new Date(2018, 3, 1),
            result: true
         }].forEach(function(test) {
            it(test.title, function () {
               let
                  sandbox = sinon.createSandbox(),
                  control = calendarTestUtils.createComponent(
                     calendar.MonthList, coreMerge(test.options, config, { preferSource: true })),
                  result;

               sandbox.stub(control, '_findElementByDate').returns({});
               result = control._canScroll(test.date);
               if (test.result) {
                  assert.isTrue(result);
               } else {
                  assert.isFalse(result);
               }
               sandbox.restore();
            });
         });
      });

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
            date: new Date(2020, 0, 1),
            options: { viewMode: 'month' },
            getElementByDateStub: returnAllPeriodTypes,
            result: ITEM_BODY_SELECTOR.month
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
