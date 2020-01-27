import { assert } from 'chai';

import * as VirtualScrollController from 'Controls/_display/controllers/VirtualScroll';

describe('Controls/_display/controllers/VirtualScroll', () => {
    function makeEnumerator() {
        const enumerator = {
            _$position: -1,
            getPosition: () => enumerator._$position,
            setPosition: (position) => enumerator._$position = position,
            getCurrentIndex: () => enumerator.getPosition(),

            moveNext: () => {
                enumerator._$position++;
                return true;
            },
            getCurrent: () => null
        };
        return enumerator;
    }

    function makeCollection() {
        const collection = {
            _$version: 0,
            nextVersion: () => collection._$version++,

            _$count: 100,
            getCount: () => collection._$count,

            _$viewIterator: null,
            getViewIterator: () => collection._$viewIterator,
            setViewIterator: (viewIterator) => collection._$viewIterator = viewIterator,

            getEnumerator: () => null
        };
        return collection;
    }

    describe('setup()', () => {
        it('sets view iterator with required fields', () => {
            const collection = makeCollection();

            VirtualScrollController.setup(collection);

            assert.isFunction(collection._$viewIterator.each);
            assert.isFunction(collection._$viewIterator.setIndices);
            assert.isFunction(collection._$viewIterator.isItemAtIndexHidden);

            const { startIndex, stopIndex } = collection._$viewIterator.data;
            assert.strictEqual(startIndex, 0);
            assert.strictEqual(stopIndex, 100);

            assert.isAbove(collection._$version, 0);
        });
    });

    describe('setIndices()', () => {
        it('changes the start and stop index and increases version', () => {
            const collection = makeCollection();

            VirtualScrollController.setup(collection);
            collection._$version = 0;

            VirtualScrollController.setIndices(collection, 2, 5);

            const { startIndex, stopIndex } = collection._$viewIterator.data;
            assert.strictEqual(startIndex, 2);
            assert.strictEqual(stopIndex, 5);

            assert.isAbove(collection._$version, 0);
        });
        it('respects item count', () => {
            const collection = makeCollection();
            collection._$count = 6;

            VirtualScrollController.setup(collection);
            VirtualScrollController.setIndices(collection, -100, 100);

            const { startIndex, stopIndex } = collection._$viewIterator.data;
            assert.strictEqual(startIndex, 0);
            assert.strictEqual(stopIndex, 6);
        });
    });

    describe('each()', () => {
        it('iterates over each item once with correct indices', () => {
            const collection = makeCollection();

            VirtualScrollController.setup(collection);
            VirtualScrollController.setIndices(collection, 5, 10);

            const enumerator = makeEnumerator();
            collection.getEnumerator = () => enumerator;

            const iteratedIndices = [];
            VirtualScrollController.each(collection, (_item, index) => iteratedIndices.push(index));

            assert.deepEqual(iteratedIndices, [5, 6, 7, 8, 9]);
        });
    });

    describe('getStartIndex()', () => {
        it('returns start index', () => {
            const collection = makeCollection();

            collection._$viewIterator = {
                data: { startIndex: 10 }
            };

            assert.strictEqual(VirtualScrollController.getStartIndex(collection), 10);
        });
    });

    describe('getStopIndex()', () => {
        it('returns stop index', () => {
            const collection = makeCollection();

            collection._$viewIterator = {
                data: { stopIndex: 25 }
            };

            assert.strictEqual(VirtualScrollController.getStopIndex(collection), 25);
        });
    });
});
