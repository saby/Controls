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

            assert.strictEqual(collection._$version, 0);
        });
    });

    describe('setIndices()', () => {
        it('changes the start and stop index and increases version', () => {
            const collection = makeCollection();

            VirtualScrollController.setup(collection);

            VirtualScrollController.setIndices(collection, 2, 5);

            const { startIndex, stopIndex } = collection._$viewIterator.data;
            assert.strictEqual(startIndex, 2);
            assert.strictEqual(stopIndex, 5);
            assert.strictEqual(collection._$version, 1);

            VirtualScrollController.setIndices(collection, 2, 5);
            assert.strictEqual(collection._$version, 1);
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
        it('iterates over each item once with correct indices with sticked items', () => {
            const collection = makeCollection();

            VirtualScrollController.setup(collection);
            VirtualScrollController.setIndices(collection, 5, 10);

            const enumerator = makeEnumerator();

            // 1, 7 и 15 записи застиканы и должны участвовать в обходе.
            // 7 должна быть только 1 раз.
            enumerator.getCurrent = () => {
                if (enumerator._$position === 1 || 
                    enumerator._$position === 7 || 
                    enumerator._$position === 15) {
                    return {
                        isSticked: () => true
                    }
                }
            }
            collection.getEnumerator = () => enumerator;

            const iteratedIndices = [];
            VirtualScrollController.each(collection, (_item, index) => iteratedIndices.push(index));

            assert.deepEqual(iteratedIndices, [1, 5, 6, 7, 8, 9, 15]);
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
