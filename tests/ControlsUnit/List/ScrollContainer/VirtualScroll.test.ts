import controller from 'Controls/_list/ScrollContainer/VirtualScroll';
import {assert} from 'chai';

function generateContainer(itemsHeights: number[]): { children: object[] } {
    return {
        children: itemsHeights.map((item) => {
            return {
                getBoundingClientRect(): Partial<DOMRect> {
                    return {
                        height: item
                    };
                },
                className: ''
            };
        })
    };
}

describe('Controls/_list/ScrollContainer/VirtualScroll', () => {
    describe('.resetRange', () => {
        const resetPlaceholdersValue = {top: 0, bottom: 0};

        describe('by index', () => {
            let instance: controller;
            beforeEach(() => {
                instance = new controller({pageSize: 5}, {});
            });
            it('from start', () => {
                assert.deepEqual({range: {start: 0, stop: 5}, placeholders: resetPlaceholdersValue},
                    instance.resetRange(0, 10));
            });
            it('from middle', () => {
                assert.deepEqual({range: {start: 3, stop: 8}, placeholders: resetPlaceholdersValue},
                    instance.resetRange(3, 10));
            });
            it('from ending', () => {
                assert.deepEqual({range: {start: 5, stop: 10}, placeholders: resetPlaceholdersValue},
                    instance.resetRange(8, 10));
            });
            it('page size is more than items count', () => {
                assert.deepEqual({range: {start: 0, stop: 3}, placeholders: resetPlaceholdersValue},
                    instance.resetRange(0, 3));
            });
            it('page size not specified', () => {
                instance = new controller({}, {});
                assert.deepEqual({range: {start: 0, stop: 10}, placeholders: resetPlaceholdersValue},
                    instance.resetRange(0, 10));
            });
        });
        describe('by item height property', () => {
            let instance: controller;
            const itemsHeights = {itemsHeights: [20, 30, 40, 50, 60, 70, 80, 90]};
            beforeEach(() => {
                instance = new controller({}, {viewport: 200});
            });
            it('from start', () => {
                assert.deepEqual({range: {start: 0, stop: 6}, placeholders: {top: 0, bottom: 170}},
                    instance.resetRange(0, 8, itemsHeights));
            });
            it('from middle', () => {
                assert.deepEqual({range: {start: 2, stop: 6}, placeholders: {top: 50, bottom: 170}},
                    instance.resetRange(2, 8, itemsHeights));
            });
            it('from ending', () => {
                assert.deepEqual({range: {start: 5, stop: 8}, placeholders: {top: 200, bottom: 0}},
                    instance.resetRange(6, 8, itemsHeights));
            });
        });
    });
    describe('.shiftRangeToScrollPosition', () => {
        let instance: controller;
        beforeEach(() => {
            instance = new controller({pageSize: 5}, {trigger: 10});
            instance.resetRange(0, 8, {itemsHeights: [20, 20, 20, 20, 20, 20, 20, 20]});
        });

        it('top position', () => {
            assert.deepEqual({range: {start: 0, stop: 5}, placeholders: {top: 0, bottom: 60}},
                instance.shiftRangeToScrollPosition(0));
        });
        it('middle position', () => {
            assert.deepEqual({range: {start: 2, stop: 7}, placeholders: {top: 40, bottom: 20}},
                instance.shiftRangeToScrollPosition(100));
        });
        it('end position', () => {
            assert.deepEqual({range: {start: 3, stop: 8}, placeholders: {top: 60, bottom: 0}},
                instance.shiftRangeToScrollPosition(160));
        });
    });
    describe('.insertItems', () => {
        let instance: controller;

        beforeEach(() => {
            instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 300});
            instance.resetRange(0, 5);
            // @ts-ignore
            instance.updateItemsHeights(generateContainer([60, 60, 60, 60, 60]));
        });

        it('at begining', () => {
            assert.deepEqual({range: {start: 0, stop: 5}, placeholders: {top: 0, bottom: 120}},
                instance.insertItems(0, 2, {up: false, down: false}));
        });
        it('at middle', () => {
            assert.deepEqual({range: {start: 0, stop: 5}, placeholders: {top: 0, bottom: 0}},
                instance.insertItems(5, 2, {up: false, down: false}));
        });
        it('at ending', () => {
            assert.deepEqual({range: {start: 0, stop: 5}, placeholders: {top: 0, bottom: 60}},
                instance.insertItems(3, 1, {up: false, down: false}));
        });
        it('with up predictive direction', () => {
            assert.deepEqual({range: {start: 2, stop: 7}, placeholders: {top: 0, bottom: 0}},
                instance.insertItems(0, 2, {up: false, down: false}, 'up'));
        });
        it('with down predictive direction', () => {
            assert.deepEqual({range: {start: 0, stop: 5}, placeholders: {top: 0, bottom: 60}},
                instance.insertItems(3, 1, {up: false, down: false}, 'down'));
        });
        it('with predictive direction and trigger visibility', () => {
                assert.deepEqual({range: {start: 0, stop: 5}, placeholders: {top: 0, bottom: 60}},
                    instance.insertItems(3, 1, {up: false, down: true}, 'down'));
        });
        it('lack of items, direction up', () => {
            instance.setOptions({pageSize: 10});
            instance.resetRange(0, 5);
            // @ts-ignore
            instance.updateItemsHeights(generateContainer([60, 60, 60, 60, 60]));
            assert.deepEqual({range: {start: 0, stop: 6}, placeholders: {top: 0, bottom: 0}},
                instance.insertItems(0, 1, {up: false, down: false}));
        });
        it('without specified options', () => {
            instance.setOptions({pageSize: undefined, segmentSize: undefined});
            assert.deepEqual({range: {start: 0, stop: 55}, placeholders: {top: 0, bottom: 0}},
                instance.insertItems(5, 50, {up: false, down: false}));
        });
    });
    describe('.removeItems', () => {
        let instance: controller;

        beforeEach(() => {
            instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 300});
            instance.resetRange(0, 5);
            // @ts-ignore
            instance.updateItemsHeights(generateContainer([60, 60, 60, 60, 60]));
        });

        it('at begining', () => {
            assert.deepEqual({range: {start: 0, stop: 4}, placeholders: {top: 0, bottom: 0}},
                instance.removeItems(0, 1));
        });
        it('at middle', () => {
            assert.deepEqual({range: {start: 0, stop: 4}, placeholders: {top: 0, bottom: 0}},
                instance.removeItems(2, 1));
        });
        it('at ending', () => {
            assert.deepEqual({range: {start: 0, stop: 4}, placeholders: {top: 0, bottom: 0}},
                instance.removeItems(4, 1));
        });
    });
    describe('.shiftRange', () => {
        const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 600});

        it('to up', () => {
            instance.resetRange(2, 10, {itemsHeights: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60]});

            assert.deepEqual({
                range: {start: 1, stop: 6},
                placeholders: {top: 60, bottom: 240}
            }, instance.shiftRange('up'));
        });
        it('to down', () => {
            instance.resetRange(0, 10, {itemsHeights: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60]});

            assert.deepEqual({
                range: {start: 3, stop: 5},
                placeholders: {top: 180, bottom: 300}
            }, instance.shiftRange('down'));
        });
    });
    describe('.isNeedToRestorePosition', () => {
        it('after shift range', () => {
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 600});
            instance.resetRange(0, 10, {itemsHeights: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60]});
            instance.shiftRange('down');

            assert.isTrue(instance.isNeedToRestorePosition);
        });
        it('after insert', () => {
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 300});
            instance.resetRange(0, 5);
            // @ts-ignore
            instance.updateItemsHeights(generateContainer([60, 60, 60, 60, 60]));
            instance.insertItems(0, 2, {up: false, down: false});
            assert.isFalse(instance.isNeedToRestorePosition);
        });
        it('after insert with predicted direction', () => {
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 300});
            instance.resetRange(0, 5);
            // @ts-ignore
            instance.updateItemsHeights(generateContainer([60, 60, 60, 60, 60]));
            instance.insertItems(0, 2, {up: false, down: false}, 'up');
            assert.isTrue(instance.isNeedToRestorePosition);
        });
        it('after remove', () => {
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 300});
            instance.resetRange(0, 5);
            // @ts-ignore
            instance.updateItemsHeights(generateContainer([60, 60, 60, 60, 60]));
            instance.removeItems(0, 1);
            assert.isFalse(instance.isNeedToRestorePosition);
        });
    });
    describe('.canScrollToItem', () => {
        const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 600});
        instance.resetRange(0, 10);
        // @ts-ignore
        instance.updateItemsHeights(generateContainer([60, 60, 60, 60, 60, 60, 60, 60, 60, 60]));

        it('can`t scroll', () => {
            assert.isFalse(instance.canScrollToItem(6, false, true), 'Item is out of range');
            assert.isFalse(instance.canScrollToItem(5, false, true), 'Item offset > viewport offset');
            instance.resetRange(0, 5);
            assert.isFalse(instance.canScrollToItem(5, false, true));
        });
        it('can scroll', () => {
            assert.isTrue(instance.canScrollToItem(0, false, true));
            assert.isTrue(instance.canScrollToItem(4, true, false));
            assert.isTrue(instance.canScrollToItem(4, false, false));
            assert.isTrue(instance.canScrollToItem(4, true, true));
            instance.resetRange(0, 5);
            assert.isTrue(instance.canScrollToItem(4, false, true));
        });
    });
    describe('.getActiveElementIndex()', () => {
        it('no items', () => {
            const instance = new controller({}, {});

            assert.isUndefined(instance.getActiveElementIndex(0));
        });
        it('scrolled to bottom', () => {
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 600});
            instance.resetRange(0, 5);
            // @ts-ignore
            instance.updateItemsHeights(generateContainer([60, 60, 60, 60, 60]));

            assert.equal(4, instance.getActiveElementIndex(400));
            assert.equal(4, instance.getActiveElementIndex(500));
        });
        it('scrolled to top', () => {
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 600});
            instance.resetRange(0, 5);
            // @ts-ignore
            instance.updateItemsHeights(generateContainer([60, 60, 60, 60, 60]));

            assert.equal(0, instance.getActiveElementIndex(0));
            assert.equal(0, instance.getActiveElementIndex(-20));
        });
        it('middle case', () => {
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 600});
            instance.resetRange(0, 5);
            // @ts-ignore
            instance.updateItemsHeights(generateContainer([60, 60, 60, 60, 60]));

            assert.equal(1, instance.getActiveElementIndex(2));
        });
    });
    describe('.getParamsToRestoreScroll()', () => {
        it('after shift', () => {
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 600});
            instance.resetRange(0, 10, {itemsHeights: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60]});
            instance.shiftRange('down');

            assert.deepEqual({direction: 'down', heightDifference: 180}, instance.getParamsToRestoreScroll());

            instance.shiftRange('up');

            assert.deepEqual({direction: 'up', heightDifference: 0}, instance.getParamsToRestoreScroll());
        });
        it('after insert with predicted direction', () => {
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 300});
            instance.resetRange(0, 5);
            // @ts-ignore
            instance.updateItemsHeights(generateContainer([60, 60, 60, 60, 60]));
            instance.insertItems(0, 2, {up: false, down: false}, 'up');
            assert.deepEqual({direction: 'up', heightDifference: 0}, instance.getParamsToRestoreScroll());
        });
    });
    describe('.updateItemsHeights()', () => {
        it('range changed switch off', () => {
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 300});
            instance.resetRange(0, 5);
            assert.isTrue(instance.rangeChanged);
            // @ts-ignore
            instance.updateItemsHeights(generateContainer([60, 60, 60, 60, 60]));
            assert.isFalse(instance.rangeChanged);
        });
    });
    describe('.resizeView()', () => {
        let instance: controller;

        beforeEach(() => {
            instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 200});
        });

        it('range changed keeps value', () => {
            instance.resetRange(0, 5);

            assert.isTrue(instance.rangeChanged);
            // @ts-ignore
            instance.resizeView(300, 0, generateContainer([60, 60, 60, 60, 60]));
            assert.isTrue(instance.rangeChanged);
        });
        it('correct shift range, after view resized', () => {
            instance.setOptions({pageSize: 3});
            instance.resetRange(3, 5);
            // @ts-ignore
            instance.resizeView(180, 0, generateContainer([60, 60, 60]));
            assert.deepEqual({range: {start: 1, stop: 5}, placeholders: {top: 0, bottom: 0}},
                instance.shiftRange('up'));
        });
    });
    describe('.resizeViewport()', () => {
        let instance: controller;

        beforeEach(() => {
            instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, trigger: 10, scroll: 300});
        });

        it('range changed keeps value', () => {
            instance.resetRange(0, 5);

            assert.isTrue(instance.rangeChanged);
            // @ts-ignore
            instance.resizeViewport(300, 0, generateContainer([60, 60, 60, 60, 60]));
            assert.isTrue(instance.rangeChanged);
        });
        it('correct shift range, after viewport resized', () => {
            instance.setOptions({pageSize: 3});
            instance.resetRange(0, 5);
            // @ts-ignore
            instance.resizeViewport(80, 0, generateContainer([60, 60, 60]));
            assert.deepEqual({range: {start: 2, stop: 4}, placeholders: {top: 120, bottom: 0}},
                instance.shiftRange('down'));
        });
    });
    describe('.isRangeOnEdge()', () => {
        let instance: controller;

        beforeEach(() => {
            instance = new controller({pageSize: 5, segmentSize: 1}, {});
        });

        it('on top edge', () => {
            instance.resetRange(0, 10);

            assert.isTrue(instance.isRangeOnEdge('up'));

            instance.resetRange(1, 10);

            assert.isFalse(instance.isRangeOnEdge('up'));
        });
        it('on bottom edge', () => {
            instance.resetRange(10, 10);

            assert.isTrue(instance.isRangeOnEdge('down'));

            instance.resetRange(4, 10);

            assert.isFalse(instance.isRangeOnEdge('down'));
        });
    });
    describe('.getItemContainerByIndex()', () => {
        const instance = new controller({pageSize: 5, segmentSize: 1}, {});
        instance.resetRange(2, 10);

        it('get correct value', () => {
            const itemsContainer = generateContainer([60, 60, 60, 60, 60, 60]);

            // @ts-ignore
            assert.equal(itemsContainer.children[0], instance.getItemContainerByIndex(2, itemsContainer));
            // @ts-ignore
            assert.isUndefined(instance.getItemContainerByIndex(0, itemsContainer));
            // @ts-ignore
            assert.isUndefined(instance.getItemContainerByIndex(10, itemsContainer));
        });
    });
});
