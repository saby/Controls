import VirtualScroll from 'Controls/_list/ScrollContainer/VirtualScroll';
import {assert} from 'chai';

describe('Controls/_list/ScrollContainer/VirtualScroll', () => {
    const heights = [20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40, 20, 40];
    const children = heights.map((offsetHeight) => ({offsetHeight: offsetHeight, className: '', getBoundingClientRect() { return {height: this.offsetHeight}}}));
    const itemsContainer = {children, offsetHeight: 600};
    const viewModel = {
        at(index) {
            return {
                getContents() {
                    return {
                        get() {
                            return heights[index];
                        }
                    }
                }
            }
        },

        // mock
        subscribe() {}
    };
    describe('common virtual scroll', () => {
        const affectingInstance = {
            indexesChangedCallback(startIndex, stopIndex) {
                this.startIndex = startIndex;
                this.stopIndex = stopIndex;
            },
            placeholderChangedCallback(placeholdersValues) {
                this.placeholdersValues = placeholdersValues;
            },
            saveScrollPositionCallback(direction) {
                this.direction = direction;
            },
            loadMoreCallback(direction) {
                this.loadDirection = direction;
            }
        };

        const defaultOptions = {
            indexesChangedCallback(startIndex, stopIndex) {
                affectingInstance.indexesChangedCallback(startIndex, stopIndex);
            },
            placeholderChangedCallback(placeholdersValues) {
                affectingInstance.placeholderChangedCallback(placeholdersValues);
            },
            saveScrollPositionCallback(direction) {
                affectingInstance.saveScrollPositionCallback(direction);
            },
            loadMoreCallback(direction) {
                affectingInstance.loadMoreCallback(direction);
            },
            segmentSize: null,
            pageSize: 20,
            viewModel,
            itemHeightProperty: null,
            useNewModel: true,
            viewportHeight: null
        };

        it('segmentSize calc correctly', () => {
            // @ts-ignore
            let instance = new VirtualScroll({
                ...defaultOptions,
                pageSize: 100
            });

            // @ts-ignore
            assert.equal(25, instance._options.segmentSize, 'middle page size');

            // @ts-ignore
            instance = new VirtualScroll({
                ...defaultOptions,
                pageSize: 3
            });

            assert.equal(1, instance._options.segmentSize, 'minimum page size');
        });

        it('reset', () => {
            // @ts-ignore
            let instance = new VirtualScroll({
                ...defaultOptions,
                pageSize: 4
            });

            instance.itemsCount = 20;

            instance.reset();

            // @ts-ignore
            assert.equal(0, affectingInstance.startIndex, 'without initial index');
            // @ts-ignore
            assert.equal(4, affectingInstance.stopIndex);

            instance.reset(4);

            // @ts-ignore
            assert.equal(4, affectingInstance.startIndex, 'with initial index');
            // @ts-ignore
            assert.equal(8, affectingInstance.stopIndex);

            instance = new VirtualScroll({
                ...defaultOptions,
                viewportHeight: 200,
                // @ts-ignore
                viewModel,
                itemHeightProperty: 'height'
            });

            instance.itemsCount = 20;
            instance.reset();

            // @ts-ignore
            assert.equal(0, affectingInstance.startIndex, 'with item height property');
            // @ts-ignore
            assert.equal(8, affectingInstance.stopIndex);
        });
        it('recalcItemsHeights', () => {
            // @ts-ignore
            const instance = new VirtualScroll(defaultOptions);

            instance.itemsCount = 20;
            instance.reset();
            instance.itemsContainer = itemsContainer;

            const itemsHeight = heights.slice(0, 20);
            const itemsOffsets = [];
            let sum = 0;
            for (let i = 0; i < instance.itemsCount; i++) {
                itemsOffsets[i] = sum;
                sum += itemsHeight[i];
            }

            instance.recalcItemsHeights();

            assert.deepEqual(instance.itemsHeights, itemsHeight);
            assert.deepEqual(instance.itemsOffsets, itemsOffsets)
        });
        it('getItemsHeights', () => {
            // @ts-ignore
            const instance = new VirtualScroll(defaultOptions);

            instance.itemsCount = 20;
            instance.reset();
            instance.itemsContainer = itemsContainer;

            assert.equal(60, instance.getItemsHeights(0, 2));
        });
        it('can scroll to item', () => {
            // @ts-ignore
            const instance = new VirtualScroll(defaultOptions);

            instance.itemsCount = 20;
            instance.reset();
            instance.itemsContainer = itemsContainer;
            instance.itemsContainerHeight = 600;
            instance.viewportHeight = 400;

            assert.isTrue(instance.canScrollToItem(1));
            assert.isFalse(instance.canScrollToItem(18));
            assert.isTrue(instance.canScrollToItem(19));
            assert.isFalse(instance.canScrollToItem(21));
        });
        it('recalcFromScrollTop', () => {
            // @ts-ignore
            const instance = new VirtualScroll(defaultOptions);

            instance.itemsCount = 20;
            instance.reset();
            instance.itemsContainer = itemsContainer;

            instance.scrollTop = 0;
            instance.setStartIndex(4);
            instance.recalcRangeFromScrollTop();

            // @ts-ignore
            assert.equal(0, affectingInstance.startIndex);
            // @ts-ignore
            assert.equal(20, affectingInstance.stopIndex);
        });
        it('getActiveElement', () => {
            // @ts-ignore
            const instance = new VirtualScroll(defaultOptions);

            instance.itemsCount = 20;
            instance.reset();
            instance.itemsContainer = itemsContainer;

            instance.itemsContainerHeight = 600;
            instance.viewportHeight = 400;
            instance.scrollTop = 0;
            assert.equal(0, instance.getActiveElement());
            instance.scrollTop = 200;
            assert.equal(19, instance.getActiveElement());
            instance.scrollTop = 100;
            assert.equal(9, instance.getActiveElement());
            instance.itemsHeights = [];
            assert.isUndefined(instance.getActiveElement());
        });
        it('recalcToDirection', () => {
            // @ts-ignore
            const instance = new VirtualScroll(defaultOptions);

            instance.itemsCount = 20;

            instance.reset();
            instance.itemsContainer = itemsContainer;
            instance.viewportHeight = 100;

            instance.setStartIndex(0);
            instance.itemsCount = 40;
            instance.scrollTop = 280;
            instance.recalcRangeToDirection('down');
            // @ts-ignore
            assert.equal(5, affectingInstance.startIndex);
            // @ts-ignore
            assert.equal(25, affectingInstance.stopIndex);
            instance.setStartIndex(10);
            instance.recalcItemsHeights();
            instance.viewportHeight = 200;
            instance.scrollTop = 10;
            instance.recalcRangeToDirection('up');
            // @ts-ignore
            assert.equal(5, affectingInstance.startIndex);
            // @ts-ignore
            assert.equal(24, affectingInstance.stopIndex);
            instance.startIndex = 0;
            instance.stopIndex = 20;
            instance.itemsCount = 20;
            instance.recalcRangeToDirection('up');
            // @ts-ignore
            assert.equal('up', affectingInstance.loadDirection);
        });
        it('itemsAddedHandler', () => {
            // @ts-ignore
            const instance = new VirtualScroll(defaultOptions);
            instance._options.viewModel.getStartIndex = () => instance.startIndex;
            instance.triggerVisibility = { up: true , down: true };
            instance.itemsCount = 20;
            instance.reset();
            instance.itemsContainer = itemsContainer;
            instance.viewportHeight = 100;
            instance.itemsCount = 40;
            instance.itemsAddedHandler(20, {length: 20} as object[]);
            // @ts-ignore
            assert.equal(0, affectingInstance.startIndex);
            // @ts-ignore
            assert.equal(25, affectingInstance.stopIndex);
            instance.itemsCount = 20;
            instance.reset();
            instance.actualizeSavedIndexes();
            instance.itemsCount = 40;
            instance.recalcItemsHeights();
            instance.itemsFromLoadToDirection = true;
            instance.itemsAddedHandler(0, {length: 20} as object[]);
            // @ts-ignore
            assert.equal(15, affectingInstance.startIndex);
            // @ts-ignore
            assert.equal(40, affectingInstance.stopIndex);
            assert.equal(20, instance.savedStartIndex);
            instance.itemsCount = 20;
            instance.reset();
            instance.actualizeSavedIndexes();
            instance.itemsCount = 40;
            instance.recalcItemsHeights();
            instance.triggerVisibility = { up: false, down: false };
            // @ts-ignore
            affectingInstance.startIndex = 0;
            // @ts-ignore
            affectingInstance.stopIndex = 20;
            instance.itemsAddedHandler(0, {length: 20} as object[]);
            // @ts-ignore
            assert.equal(0, affectingInstance.startIndex);
            // @ts-ignore
            assert.equal(20, affectingInstance.stopIndex);
        });
        it('itemsRemovedHandler', () => {
            // @ts-ignore
            const instance = new VirtualScroll(defaultOptions);
            instance._options.viewModel.getStartIndex = () => instance.startIndex;
            instance.itemsCount = 20;
            instance.reset();
            instance.itemsChanged = false;
            instance.itemsContainer = itemsContainer;
            instance.itemsCount = 19;
            instance.itemsRemovedHandler(19, {length: 1} as object[]);
            // @ts-ignore
            assert.equal(0, affectingInstance.startIndex);
            // @ts-ignore
            assert.equal(19, affectingInstance.stopIndex);
        });
        it('set items container', () => {
            // @ts-ignore
            const instance = new VirtualScroll(defaultOptions);
            instance.itemsContainer = itemsContainer;
            assert.equal(instance.itemsContainerHeight, itemsContainer.offsetHeight);
        });
    });
});