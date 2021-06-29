import { assert } from 'chai';
import ScrollbarsModel from 'Controls/_scroll/Container/ScrollbarsModel';
import {getDefaultOptions as getScrollbarsDefaultOptions} from 'Controls/_scroll/Container/Interface/IScrollbars';
import {SCROLL_MODE} from 'Controls/_scroll/Container/Type';
import {SCROLL_DIRECTION} from 'Controls/_scroll/Utils/Scroll';

describe('Controls/scroll:Container ScrollbarsModel', () => {

    describe('constructor', () => {
        [{
            scrollOrientation: SCROLL_MODE.VERTICAL,
            direction: [SCROLL_DIRECTION.VERTICAL]
        }, {
            scrollOrientation: SCROLL_MODE.VERTICAL_HORIZONTAL,
            direction: [SCROLL_DIRECTION.VERTICAL, SCROLL_DIRECTION.HORIZONTAL]
        }].forEach((test) => {
            it(`should init scrollbars models. ${test.scrollOrientation}`, () => {
                const model: ScrollbarsModel = new ScrollbarsModel({
                    ...getScrollbarsDefaultOptions(),
                    scrollOrientation: test.scrollOrientation
                });
                assert.hasAllKeys(model._models, test.direction);
                for (let direction of test.direction) {
                    assert.isFalse(model._models[direction].isVisible);
                    assert.strictEqual(model._models[direction].position, 0);
                    assert.isUndefined(model._models[direction].contentSize);
                }
            });
        });
    });

    describe('updateScrollState', () => {
        const scrollState = {
            scrollTop: 10,
            scrollLeft: 20,
            scrollHeight: 30,
            scrollWidth: 40
        };
        it('should update position and contentSize.', () => {
            const
                model: ScrollbarsModel = new ScrollbarsModel({
                    ...getScrollbarsDefaultOptions(),
                    scrollOrientation: SCROLL_MODE.VERTICAL_HORIZONTAL
                });

            // В реальнности метод задебоунсен, в тестах выключаем дебоунс.
            model._updateContainerSizes = ScrollbarsModel.prototype._updateContainerSizes;

            model.updateScrollState(scrollState, { offsetHeight: 50 });

            assert.strictEqual(model._models.vertical.position, scrollState.scrollTop);
            assert.strictEqual(model._models.horizontal.position, scrollState.scrollLeft);
            assert.strictEqual(model._models.vertical.contentSize, scrollState.scrollHeight);
            assert.strictEqual(model._models.horizontal.contentSize, scrollState.scrollWidth);
        });

        it('should\'t update view if can\'t scroll.', () => {
            const
                model: ScrollbarsModel = new ScrollbarsModel({
                    ...getScrollbarsDefaultOptions(),
                    scrollOrientation: SCROLL_MODE.VERTICAL_HORIZONTAL
                })
            const scrollState = {
                scrollTop: 0,
                scrollLeft: 0,
                scrollHeight: 30,
                scrollWidth: 40,
                canVerticalScroll: false,
                canHorizontalScroll: false
            };

            // В реальнности метод задебоунсен, в тестах выключаем дебоунс.
            model._updateContainerSizes = ScrollbarsModel.prototype._updateContainerSizes;

            sinon.stub(model, '_nextVersion');

            model.updateScrollState(scrollState, { offsetHeight: 50 });

            sinon.assert.notCalled(model._nextVersion);

            sinon.restore();
        });

        it('should set _overflowHidden to true if content fits into the container.', () => {
            const
                model: ScrollbarsModel = new ScrollbarsModel({
                    ...getScrollbarsDefaultOptions(),
                    scrollOrientation: SCROLL_MODE.VERTICAL_HORIZONTAL
                });

            model.updateScrollState(scrollState, { offsetHeight: 30 });

            assert.isFalse(model._overflowHidden);
        });
    });

    describe('updatePlaceholdersSize', () => {
        const scrollState = {
            scrollTop: 10,
            scrollLeft: 20,
            scrollHeight: 30,
            scrollWidth: 40
        };

        [{
            placeholders: { top: 10, bottom: 10, left: 10, right: 10 }
        }, {
            placeholders: { top: 10, bottom: 10 }
        }].forEach((test) => {
            it('should update position and contentSize.', () => {
                const
                    model: ScrollbarsModel = new ScrollbarsModel({
                        ...getScrollbarsDefaultOptions(),
                        scrollOrientation: SCROLL_MODE.VERTICAL_HORIZONTAL
                    });

                // В реальнности метод задебоунсен, в тестах выключаем дебоунс.
                model._updateContainerSizes = ScrollbarsModel.prototype._updateContainerSizes;

                model.updateScrollState(scrollState, { offsetHeight: 50 });
                model.updatePlaceholdersSize(test.placeholders);

                assert.strictEqual(model._models.vertical.position, scrollState.scrollTop + (test.placeholders.top || 0));
                assert.strictEqual(model._models.horizontal.position, scrollState.scrollLeft + (test.placeholders.left || 0));
                assert.strictEqual(model._models.vertical.contentSize,
                    scrollState.scrollHeight + (test.placeholders.top || 0) + (test.placeholders.bottom || 0));
                assert.strictEqual(model._models.horizontal.contentSize,
                    scrollState.scrollWidth + (test.placeholders.left || 0) + (test.placeholders.right || 0));
            });
        });

    });

    describe('updateScrollbarsModels', () => {
        it('should update _models if scrollOrientation changed', () => {
            const
                model: ScrollbarsModel = new ScrollbarsModel({
                    ...getScrollbarsDefaultOptions(),
                    scrollOrientation: SCROLL_MODE.VERTICAL_HORIZONTAL
                });
            assert.equal(Object.keys(model._models).length, 2);
            model.updateScrollbarsModels({
                ...getScrollbarsDefaultOptions(),
                scrollOrientation: SCROLL_MODE.VERTICAL
            });
            assert.equal(Object.keys(model._models).length, 1);
        });
    });

    describe('updateOptions', () => {
        it('should set isVisible to true, if there was no wheel event', () => {
            const
                model: ScrollbarsModel = new ScrollbarsModel({
                    ...getScrollbarsDefaultOptions(),
                    scrollOrientation: SCROLL_MODE.VERTICAL_HORIZONTAL
                });
            model._models.vertical._canScroll = true;
            model._models.horizontal._canScroll = true;
            model.updateOptions({scrollOrientation: SCROLL_MODE.VERTICAL_HORIZONTAL, scrollbarVisible: false});
            assert.isTrue(model._models.vertical.isVisible);
            assert.isTrue(model._models.horizontal.isVisible);
            ScrollbarsModel.wheelEventHappened = true;
            model.updateOptions({scrollOrientation: SCROLL_MODE.VERTICAL_HORIZONTAL, scrollbarVisible: false});
            assert.isFalse(model._models.vertical.isVisible);
            assert.isFalse(model._models.horizontal.isVisible);
        });
    });

});
