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

                assert.strictEqual(component._selectionHoveredValue, null);
                assert.strictEqual(+component._displayedStartValue, +test.clickedItem);
                assert.strictEqual(component._displayedEndValue, null);
            });
        });
    });
});
