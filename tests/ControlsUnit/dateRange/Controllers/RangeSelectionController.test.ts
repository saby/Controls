import RangeSelectionController from 'Controls/_dateRange/Controllers/RangeSelectionController';
import calendarTestUtils = require('ControlsUnit/Calendar/Utils');

describe('Controls/_dateRange/Controllers/RangeSelectionController', () => {
    describe('_getDisplayedRangeEdges', () => {
        [{
            options: {
                selectionType: RangeSelectionController.SELECTION_TYPES.single,
                selectionBaseValue: null
            },
            item: new Date(2019, 0, 1),
            resp: [new Date(2019, 0, 1), new Date(2019, 0, 1)]
        }, {
            options: {
                selectionType: RangeSelectionController.SELECTION_TYPES.range,
                selectionBaseValue: null
            },
            item: new Date(2019, 0, 1),
            resp: [new Date(2019, 0, 1), new Date(2019, 0, 1)]
        }, {
            options: {
                selectionType: RangeSelectionController.SELECTION_TYPES.range,
                selectionBaseValue: new Date(2019, 0, 1)
            },
            item: new Date(2019, 0, 5),
            resp: [new Date(2019, 0, 1), new Date(2019, 0, 5)]
        }].forEach((test) => {
            it(`should return proper range for options ${JSON.stringify(test.options)}.`, () => {
                const
                    component: RangeSelectionController =
                        calendarTestUtils.createComponent(RangeSelectionController, test.options);
                let range: Date[];

                range = component._getDisplayedRangeEdges(test.item);
                assert.notStrictEqual(range[0], range[1]);
                assert.deepEqual(range, test.resp);
            });
        });
    });

    describe('_mouseleaveHandler', () => {
        [{
            clickedItem: new Date(2019, 0, 10),
            hoveredItem: new Date(2019, 0, 11)
        }, {
            clickedItem: new Date(2019, 0, 10),
            hoveredItem: new Date(2019, 0, 9)
        }].forEach((test) => {
            it(`should reset hovered item ${JSON.stringify(test)}.`, () => {
                const
                    component: RangeSelectionController =
                        calendarTestUtils.createComponent(RangeSelectionController, {});

                component._itemClickHandler(null, test.clickedItem);
                component._itemMouseEnterHandler(null, test.hoveredItem);

                component._mouseleaveHandler();

                assert.strictEqual(+component._selectionHoveredValue, +test.clickedItem);
                assert.strictEqual(+component._displayedStartValue, +test.clickedItem);
                assert.strictEqual(+component._displayedEndValue, +test.clickedItem);
                assert.strictEqual(+component._startValue, +test.clickedItem);
                assert.strictEqual(+component._endValue, +test.clickedItem);
            });
        });
    });

    describe('_itemKeyDownHandler', () => {
        [{
            options: { selectionProcessing: true, monthClickable: false },
            event: {
                preventDefault: () => 0,
                nativeEvent: {
                    keyCode: 40
                }
            },
            hoveredItem: new Date(2021, 1, 1),
            eventName: 'itemMouseEnter',
            eventOptions: new Date(2021, 4, 1)
        }, {
            options: { selectionProcessing: true, monthClickable: false },
            event: {
                preventDefault: () => 0,
                nativeEvent: {
                    keyCode: 38
                }
            },
            hoveredItem: new Date(2021, 1, 1),
            eventName: 'itemMouseEnter',
            eventOptions: new Date(2020, 10, 1)
        }, {
            options: { selectionProcessing: true, monthClickable: false },
            event: {
                preventDefault: () => 0,
                nativeEvent: {
                    keyCode: 37
                }
            },
            hoveredItem: new Date(2021, 1, 1),
            eventName: 'itemMouseEnter',
            eventOptions: new Date(2021, 0, 1)
        }, {
            options: { selectionProcessing: true, monthClickable: false },
            event: {
                preventDefault: () => 0,
                nativeEvent: {
                    keyCode: 39
                }
            },
            hoveredItem: new Date(2021, 1, 1),
            eventName: 'itemMouseEnter',
            eventOptions: new Date(2021, 2, 1)
        }].forEach((test) => {
            it('should choose correct date', () => {
                const component: RangeSelectionController =
                        calendarTestUtils.createComponent(RangeSelectionController, {});
                const start = new Date(2018, 0, 1);
                global.document = {
                    querySelector: () => null
                };
                let callbackCalled = false;
                let date;
                if (test.hoveredItem) {
                    component._selectionHoveredValue = test.hoveredItem;
                }
                component._itemMouseEnter = (item) => {
                    date = item;
                    callbackCalled = true;
                };

                component._itemKeyDownHandler(test.event, start, test.event.nativeEvent.keyCode, '.controls-PeriodDialog-MonthsRange__item', 'months');

                assert.isTrue(callbackCalled);
                assert.equal(date.getFullYear(), test.eventOptions.getFullYear());
                assert.equal(date.getMonth(), test.eventOptions.getMonth());
                assert.equal(date.getDate(), test.eventOptions.getDate());
            });
        });
        [{
            options: { selectionProcessing: true, monthClickable: false },
            event: {
                preventDefault: () => 0,
                nativeEvent: {
                    keyCode: 39
                }
            },
            eventName: null
        }, {
            options: { selectionProcessing: true, monthClickable: false },
            event: {
                preventDefault: () => 0,
                nativeEvent: {
                    keyCode: 40
                }
            },
            eventName: null
        }, {
            options: { selectionProcessing: true, monthClickable: false },
            event: {
                preventDefault: () => 0,
                nativeEvent: {
                    keyCode: 55
                }
            },
            hoveredItem: new Date(2021, 1, 1),
            eventName: 'itemMouseEnter',
            eventOptions: new Date(2021, 2, 1)
        }].forEach((test) => {
            it('should generate event with correct date', () => {
                const component: RangeSelectionController =
                    calendarTestUtils.createComponent(RangeSelectionController, {});
                global.document = {
                    querySelector: () => null
                };
                let callbackCalled = false;
                if (test.hoveredItem) {
                    component._hoveredItem = test.hoveredItem;
                }
                component._itemMouseEnter = () => {
                    callbackCalled = true;
                };
                component._itemKeyDownHandler(test.event);
                assert.isFalse(callbackCalled);
            });
        });
    });
});
