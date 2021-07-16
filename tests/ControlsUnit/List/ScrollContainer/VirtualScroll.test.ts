import controller from 'Controls/_baseList/ScrollContainer/VirtualScroll';
import {assert} from 'chai';

function getItemsHeightsData(itemsHeights: number[]): { itemsHeights: number[], itemsOffsets: number[] } {
    let sum = 0;
    const itemHeightsData = {itemsHeights: [], itemsOffsets: []};

    for (let i = 0, len = itemsHeights.length; i < len; i++) {
        const itemHeight = itemsHeights[i];

        itemHeightsData.itemsHeights[i] = itemHeight;
        itemHeightsData.itemsOffsets[i] = sum;
        sum += itemHeight;
    }
    return itemHeightsData;
}

describe('Controls/_baseList/ScrollContainer/VirtualScroll', () => {
    describe('.resetRange', () => {
        const resetPlaceholdersValue = {top: 0, bottom: 0};

        describe('by index', () => {
            let instance: controller;
            beforeEach(() => {
                instance = new controller({pageSize: 5}, {});
            });
            it('from start', () => {
                // tslint:disable-next-line:no-magic-numbers
                assert.deepEqual({range: {start: 0, stop: 5}, placeholders: resetPlaceholdersValue},
                    // tslint:disable-next-line:no-magic-numbers
                    instance.resetRange(0, 10));
            });
            it('from middle', () => {
                assert.deepEqual({range: {start: 3, stop: 8}, placeholders: resetPlaceholdersValue},
                    // tslint:disable-next-line:no-magic-numbers
                    instance.resetRange(3, 10));
            });
            it('from ending', () => {
                assert.deepEqual({range: {start: 5, stop: 10}, placeholders: resetPlaceholdersValue},
                    // tslint:disable-next-line:no-magic-numbers
                    instance.resetRange(8, 10));
            });
            it('page size is more than items count', () => {
                assert.deepEqual({range: {start: 0, stop: 3}, placeholders: resetPlaceholdersValue},
                    // tslint:disable-next-line:no-magic-numbers
                    instance.resetRange(0, 3));
            });
            it('page size not specified', () => {
                instance = new controller({}, {});
                assert.deepEqual({range: {start: 0, stop: 10}, placeholders: resetPlaceholdersValue},
                    // tslint:disable-next-line:no-magic-numbers
                    instance.resetRange(0, 10));
            });
        });
        describe('by item height property', () => {
            let instance: controller;
            // tslint:disable-next-line:no-magic-numbers
            const itemsHeights = {itemsHeights: [20, 30, 40, 50, 60, 70, 80, 90]};
            beforeEach(() => {
                // tslint:disable-next-line:no-magic-numbers
                instance = new controller({}, {viewport: 200});
            });
            it('from start', () => {
                assert.deepEqual({range: {start: 0, stop: 6}, placeholders: {top: 0, bottom: 170}},
                    // tslint:disable-next-line:no-magic-numbers
                    instance.resetRange(0, 8, itemsHeights));
            });
            it('from middle', () => {
                assert.deepEqual({range: {start: 2, stop: 6}, placeholders: {top: 50, bottom: 170}},
                    // tslint:disable-next-line:no-magic-numbers
                    instance.resetRange(2, 8, itemsHeights));
            });
            it('from ending', () => {
                assert.deepEqual({range: {start: 5, stop: 8}, placeholders: {top: 200, bottom: 0}},
                    // tslint:disable-next-line:no-magic-numbers
                    instance.resetRange(6, 8, itemsHeights));
            });
        });
    });
    describe('.shiftRangeToScrollPosition', () => {
        let instance: controller;
        beforeEach(() => {
            instance = new controller({pageSize: 5}, {topTrigger: 10, bottomTrigger: 10});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 8, {itemsHeights: [20, 20, 20, 20, 20, 20, 20, 20]});
        });

        it('top position', () => {
            assert.deepEqual({range: {start: 0, stop: 5}, placeholders: {top: 0, bottom: 60}},
                instance.shiftRangeToScrollPosition(0));
        });
        it('middle position', () => {
            assert.deepEqual({range: {start: 2, stop: 7}, placeholders: {top: 40, bottom: 20}},
                // tslint:disable-next-line:no-magic-numbers
                instance.shiftRangeToScrollPosition(100));
        });
        it('end position', () => {
            assert.deepEqual({range: {start: 3, stop: 8}, placeholders: {top: 60, bottom: 0}},
                // tslint:disable-next-line:no-magic-numbers
                instance.shiftRangeToScrollPosition(160));
        });
        it('without pageSize', () => {
            instance = new controller({}, {topTrigger: 10, bottomTrigger: 10});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 8, {itemsHeights: [20, 20, 20, 20, 20, 20, 20, 20]});
            assert.deepEqual({range: {start: 0, stop: 8}, placeholders: {top: 0, bottom: 0}},
                // tslint:disable-next-line:no-magic-numbers
                instance.shiftRangeToScrollPosition(0));
        });
    });
    describe('.addItems', () => {
        let instance: controller;

        beforeEach(() => {
            instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 300});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60]));
        });

        it('at begining', () => {
            assert.deepEqual({range: {start: 0, stop: 5}, placeholders: {top: 0, bottom: 120}},
                instance.addItems(0, 2, {up: false, down: false}));
        });
        it('at middle', () => {
            assert.deepEqual({range: {start: 0, stop: 5}, placeholders: {top: 0, bottom: 0}},
                // tslint:disable-next-line:no-magic-numbers
                instance.addItems(5, 2, {up: false, down: false}));
        });
        it('at ending', () => {
            assert.deepEqual({range: {start: 0, stop: 5}, placeholders: {top: 0, bottom: 60}},
                // tslint:disable-next-line:no-magic-numbers
                instance.addItems(3, 1, {up: false, down: false}));
        });
        it('with up predictive direction', () => {
            assert.deepEqual({range: {start: 2, stop: 7}, placeholders: {top: 0, bottom: 0}},
                instance.addItems(0, 2, {up: false, down: false}, 'up'));
        });
        it('with down predictive direction', () => {
            assert.deepEqual({range: {start: 0, stop: 5}, placeholders: {top: 0, bottom: 60}},
                // tslint:disable-next-line:no-magic-numbers
                instance.addItems(3, 1, {up: false, down: false}, 'down'));
        });
        it('with predictive direction and trigger visibility', () => {
            assert.deepEqual({range: {start: 0, stop: 5}, placeholders: {top: 0, bottom: 60}},
                // tslint:disable-next-line:no-magic-numbers
                instance.addItems(3, 1, {up: false, down: true}, 'down'));
        });
        it('lack of items, direction up', () => {
            instance.setOptions({pageSize: 10});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60]));
            assert.deepEqual({range: {start: 0, stop: 6}, placeholders: {top: 0, bottom: 0}},
                instance.addItems(0, 1, {up: false, down: false}));
        });
        it('without specified options', () => {
            instance.setOptions({pageSize: undefined, segmentSize: undefined});
            assert.deepEqual({range: {start: 0, stop: 55}, placeholders: {top: 0, bottom: 0}},
                // tslint:disable-next-line:no-magic-numbers
                instance.addItems(5, 50, {up: false, down: false}));
        });
    });
    describe('.removeItems', () => {
        let instance: controller;

        beforeEach(() => {
            instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 300});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60]));
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
                // tslint:disable-next-line:no-magic-numbers
                instance.removeItems(4, 1));
        });
        it('remove more than a page', () => {
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(5, 10);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60, 60, 60, 60, 60, 60]));

            assert.deepEqual({range: {start: 0, stop: 3}, placeholders: {top: 0, bottom: 0}},
                // tslint:disable-next-line:no-magic-numbers
                instance.removeItems(3, 7));
        });
    });
    describe('.removeItems', () => {
        let instance: controller;

        beforeEach(() => {
            // tslint:disable-next-line:no-magic-numbers
            instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 300});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 4);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60]));
        });
        it('removeItems', () => {
            // tslint:disable-next-line:no-magic-numbers
            assert.deepEqual(instance.addItems(0, 1, {up: true, down: false}),
                {range: {start: 0, stop: 5}, placeholders: {top: 0, bottom: 0}});
            // tslint:disable-next-line:no-magic-numbers
            assert.deepEqual(instance.removeItems(5, 1, true),
                {range: {start: 0, stop: 4}, placeholders: {top: 0, bottom: 60}});
        });
        it('removeItems 1 from begin', () => {
            assert.deepEqual(instance.removeItems(0, 1, true).range, {start: 0, stop: 3});
        });
        it('removeItems all', () => {
            // tslint:disable-next-line:no-magic-numbers
            assert.deepEqual(instance.removeItems(0, 4, true).range, {start: 0, stop: 0});
        });
    });
    describe('.shiftRange', () => {
        // tslint:disable-next-line:no-magic-numbers
        const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 60, bottomTrigger: 60, scroll: 240});

        it('to up', () => {
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(2, 10, {itemsHeights: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60]});

            assert.deepEqual({start: 2, stop: 6 }, instance.getRange());
            assert.deepEqual({
                range: {start: 1, stop: 6},
                placeholders: {top: 60, bottom: 240}
            }, instance.shiftRange('up'));
        });
        it('to down', () => {
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 10, {itemsHeights: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60]});

            assert.deepEqual({start: 0, stop: 4 }, instance.getRange());

            assert.deepEqual({
                range: {start: 0, stop: 5},
                placeholders: {top: 0, bottom: 300}
            }, instance.shiftRange('down'));
        });
    });
    describe('.isNeedToRestorePosition', () => {
        it('after shift range', () => {
            // tslint:disable-next-line:no-magic-numbers
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 600});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 10, {itemsHeights: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60]});
            instance.shiftRange('down');

            assert.isTrue(instance.isNeedToRestorePosition);
        });
        it('after insert', () => {
            // tslint:disable-next-line:no-magic-numbers
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 300});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60]));
            // tslint:disable-next-line:no-magic-numbers
            instance.addItems(0, 2, {up: false, down: false});
            assert.isFalse(instance.isNeedToRestorePosition);
        });
        it('after insert with predicted direction', () => {
            // tslint:disable-next-line:no-magic-numbers
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 300});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60]));
            // tslint:disable-next-line:no-magic-numbers
            instance.addItems(0, 2, {up: false, down: false}, 'up');
            assert.isTrue(instance.isNeedToRestorePosition);
        });
        it('after remove', () => {
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 300});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60]));
            instance.removeItems(0, 1);
            assert.isFalse(instance.isNeedToRestorePosition);
        });
    });
    describe('insertItemsHeights', () => {
        it('addItems', () => {
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 300});
            instance.resetRange(0, 5);
            // @ts-ignore
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60]));
            instance.addItems(0, 2, {up: false, down: false});
            // @ts-ignore
            assert.deepEqual(instance._itemsHeightData, {
                itemsHeights: [0, 0, 60, 60, 60, 60, 60],
                itemsOffsets: [0, 0, 0, 60, 120, 180, 240]
            });
        });
    });
    describe('.canScrollToItem', () => {
        // tslint:disable-next-line:no-magic-numbers
        const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 600});
        // tslint:disable-next-line:no-magic-numbers
        instance.resetRange(0, 10);
        // tslint:disable-next-line:ban-ts-ignore
        // @ts-ignore
        // tslint:disable-next-line:no-magic-numbers
        instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60, 60, 60, 60, 60, 60]));

        it('can`t scroll', () => {
            // tslint:disable-next-line:no-magic-numbers
            assert.isFalse(instance.canScrollToItem(6, false, true), 'Item is out of range');
            // tslint:disable-next-line:no-magic-numbers
            assert.isFalse(instance.canScrollToItem(5, false, true), 'Item offset > viewport offset');
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            // tslint:disable-next-line:no-magic-numbers
            assert.isFalse(instance.canScrollToItem(5, false, true));
        });
        it('can scroll', () => {
            assert.isTrue(instance.canScrollToItem(0, false, true));
            // tslint:disable-next-line:no-magic-numbers
            assert.isTrue(instance.canScrollToItem(4, true, false));
            // tslint:disable-next-line:no-magic-numbers
            assert.isTrue(instance.canScrollToItem(4, false, false));
            // tslint:disable-next-line:no-magic-numbers
            assert.isTrue(instance.canScrollToItem(4, true, true));
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            // tslint:disable-next-line:no-magic-numbers
            assert.isTrue(instance.canScrollToItem(4, false, true));
        });
    });
    describe('.getActiveElementIndex()', () => {
        it('no items', () => {
            const instance = new controller({}, {});

            assert.isUndefined(instance.getActiveElementIndex(0));
        });
        it('scrolled to bottom', () => {
            // tslint:disable-next-line:no-magic-numbers
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 600});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60]));

            // tslint:disable-next-line:no-magic-numbers
            assert.equal(4, instance.getActiveElementIndex(400));
            // tslint:disable-next-line:no-magic-numbers
            assert.equal(4, instance.getActiveElementIndex(500));
        });
        it('scrolled to top', () => {
            // tslint:disable-next-line:no-magic-numbers
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 600});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60]));

            assert.equal(0, instance.getActiveElementIndex(0));
            // tslint:disable-next-line:no-magic-numbers
            assert.equal(0, instance.getActiveElementIndex(-20));
        });
        it('middle case', () => {
            // tslint:disable-next-line:no-magic-numbers
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 600});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60]));

            // tslint:disable-next-line:no-magic-numbers
            assert.equal(1, instance.getActiveElementIndex(2));
        });
    });
    describe('.getParamsToRestoreScroll()', () => {
        it('after shift', () => {
            // tslint:disable-next-line:no-magic-numbers
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 60, bottomTrigger: 60, scroll: 240});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 10, {itemsHeights: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60]});
            instance.shiftRange('down');

            // tslint:disable-next-line:no-magic-numbers
            assert.deepEqual({direction: 'down', heightDifference: 0}, instance.getParamsToRestoreScroll());
            instance.beforeRestoreScrollPosition();

            instance.shiftRange('up');

            assert.deepEqual({direction: 'up', heightDifference: 0}, instance.getParamsToRestoreScroll());
        });
        it('after insert with predicted direction', () => {
            // tslint:disable-next-line:no-magic-numbers
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 300});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60]));
            // tslint:disable-next-line:no-magic-numbers
            instance.addItems(0, 2, {up: false, down: false}, 'up');
            assert.deepEqual({direction: 'up', heightDifference: 0}, instance.getParamsToRestoreScroll());
        });
        it('after shift with recalculate indexes to both direction', () => {
            // test for task https://online.sbis.ru/opendoc.html?guid=d739f7ec-36e2-4386-8b17-f39d135f4656
            // tslint:disable-next-line:no-magic-numbers
            const instance = new controller({pageSize: 10, segmentSize: 5}, {viewport: 3, topTrigger: 1, bottomTrigger: 1, scroll: 30});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(1, 40);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]));
            instance.shiftRange('up');
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // render items 5, 6, 7, 8
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([3, 3, 3, 3]));
            instance.getParamsToRestoreScroll();
            instance.beforeRestoreScrollPosition();
            // add 5 items and render items *0, *1, *2, *3, *4, 5, 6, 7, 8, *9 (* - new items)
            // tslint:disable-next-line:no-magic-numbers
            instance.addItems(0, 5, {up: true, down: false}, 'up');
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]));
            // tslint:disable-next-line:no-magic-numbers
            assert.deepEqual({direction: 'up', heightDifference: 0}, instance.getParamsToRestoreScroll());
        });
        it('after shifting and adding items in opposite directiond', () => {
            // test for task https://online.sbis.ru/opendoc.html?guid=9040b3b7-eb6c-4a1f-b16a-7cf917bf6137
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 300});
            instance.resetRange(0, 10);
            // @ts-ignore
            instance.shiftRange('down');
            instance.addItems(0, 1, {up: false, down: false}, 'up');
            instance.shiftRange('up');
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60, 60, 60]));
            assert.deepEqual({direction: 'up', heightDifference: -60}, instance.getParamsToRestoreScroll());
        });
    });
    describe('.updateItemsHeights()', () => {
        it('range changed switch off', () => {
            // tslint:disable-next-line:no-magic-numbers
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 300});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            assert.isTrue(instance.rangeChanged);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60, 60]));
            assert.isFalse(instance.rangeChanged);
        });
        it('do not update if count is less than range', () => {
            // tslint:disable-next-line:no-magic-numbers
            const instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 300});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            assert.isTrue(instance.rangeChanged);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60, 60]));
            assert.isTrue(instance.rangeChanged);
        });
    });
    describe('.viewResize()', () => {
        let instance: controller;

        beforeEach(() => {
            // tslint:disable-next-line:no-magic-numbers
            instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 10, bottomTrigger: 10, scroll: 200});
        });

        it('range changed keeps value', () => {
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);

            assert.isTrue(instance.rangeChanged);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.viewResize(300, 0, getItemsHeightsData([60, 60, 60, 60, 60]));
            assert.isTrue(instance.rangeChanged);
        });
        it('correct shift range, after view resized', () => {
            // tslint:disable-next-line:no-magic-numbers
            instance.setOptions({pageSize: 3});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(3, 5);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.viewResize(180, 0, getItemsHeightsData([60, 60, 60]));
            // tslint:disable-next-line:no-magic-numbers
            assert.deepEqual({range: {start: 1, stop: 5}, placeholders: {top: 0, bottom: 0}},
                instance.shiftRange('up'));
        });
    });
    describe('.viewportResize()', () => {
        let instance: controller;

        beforeEach(() => {
            // tslint:disable-next-line:no-magic-numbers
            instance = new controller({pageSize: 5, segmentSize: 1}, {viewport: 200, topTrigger: 60, bottomTrigger: 60, scroll: 300});
        });

        it('range changed keeps value', () => {
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);

            assert.isTrue(instance.rangeChanged);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.viewportResize(300, 0, 0, getItemsHeightsData([60, 60, 60, 60, 60]));
            assert.isTrue(instance.rangeChanged);
        });
        it('correct shift range, after viewport resized', () => {
            // tslint:disable-next-line:no-magic-numbers
            instance.setOptions({pageSize: 3});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 5);
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            // tslint:disable-next-line:no-magic-numbers
            instance.viewportResize(80, 24, 24);
            // tslint:disable-next-line:no-magic-numbers
            instance.updateItemsHeights(getItemsHeightsData([60, 60, 60]));
            // tslint:disable-next-line:no-magic-numbers
            assert.deepEqual({range: {start: 1, stop: 4}, placeholders: {top: 60, bottom: 0}},
                instance.shiftRange('down'));
        });
    });
    describe('.isRangeOnEdge()', () => {
        let instance: controller;

        beforeEach(() => {
            // tslint:disable-next-line:no-magic-numbers
            instance = new controller({pageSize: 5, segmentSize: 1}, {});
        });

        it('on top edge', () => {
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(0, 10);

            assert.isTrue(instance.isRangeOnEdge('up'));

            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(1, 10);

            assert.isFalse(instance.isRangeOnEdge('up'));
        });
        it('on bottom edge', () => {
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(10, 10);

            assert.isTrue(instance.isRangeOnEdge('down'));

            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(4, 10);

            assert.isFalse(instance.isRangeOnEdge('down'));
        });
    });
    describe('calculateVirtualScrollHeight', () => {
        let instance: controller;

        beforeEach(() => {
            // tslint:disable-next-line:no-magic-numbers
            instance = new controller({pageSize: 5, segmentSize: 1}, {});
            // tslint:disable-next-line:no-magic-numbers
            instance.resetRange(9, 10, getItemsHeightsData([10, 10, 10, 10, 10, 10, 10, 10, 10, 10]));
        });
        it('calculateVirtualScrollHeight', () => {
            // tslint:disable-next-line:no-magic-numbers
            assert.equal(instance.calculateVirtualScrollHeight(), 100);
        });
    });
});
