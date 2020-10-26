import ScrollbarsModel from 'Controls/_scroll/Container/ScrollbarsModel';
import {getDefaultOptions as getScrollbarsDefaultOptions} from 'Controls/_scroll/Container/Interface/IScrollbars';
import {SCROLL_MODE} from 'Controls/_scroll/Container/Type';
import {SCROLL_DIRECTION} from 'Controls/_scroll/Utils/Scroll';

describe('Controls/scroll:Container ScrollbarsModel', () => {

    describe('constructor', () => {
        [{
            scrollMode: SCROLL_MODE.VERTICAL,
            direction: [SCROLL_DIRECTION.VERTICAL]
        }, {
            scrollMode: SCROLL_MODE.VERTICAL_HORIZONTAL,
            direction: [SCROLL_DIRECTION.VERTICAL, SCROLL_DIRECTION.HORIZONTAL]
        }].forEach((test) => {
            it(`should init scrollbars models. ${test.scrollMode}`, () => {
                const model: ScrollbarsModel = new ScrollbarsModel({
                    ...getScrollbarsDefaultOptions(),
                    scrollMode: test.scrollMode
                });
                assert.hasAllKeys(model._models, test.direction);
                for (let direction of test.direction) {
                    assert.isFalse(model._models[direction].isVisible);
                    assert.strictEqual(model._models[direction].position, 0);
                    assert.isUndefined(model._models[direction].contentSize);
                }
            });
        });
        it('should restore serialized state.', () => {
            const
                state = {
                    overflowHidden: true,
                    styleHideScrollbar: 'styleHideScrollbar'
                },
                model: ScrollbarsModel = new ScrollbarsModel({
                    ...getScrollbarsDefaultOptions(),
                    scrollMode: SCROLL_MODE.VERTICAL
                }, state);

            assert.isTrue(model._overflowHidden);
            assert.strictEqual(model._styleHideScrollbar, state.styleHideScrollbar);
        });
    });

    describe('scrollContainerStyles', () => {
        const state = {
            overflowHidden: true,
            scrollContainerStyles: 'scrollContainerStyles',
            styleHideScrollbar: 'styleHideScrollbar'
        };
        let model: ScrollbarsModel = new ScrollbarsModel({
            ...getScrollbarsDefaultOptions(),
            scrollMode: SCROLL_MODE.VERTICAL
        }, state);

        it('overflowHidden = true', () => {
            assert.equal(model.scrollContainerStyles, '');
        });

        it('overflowHidden = false', () => {
            state.overflowHidden = false;
            model = new ScrollbarsModel({
                ...getScrollbarsDefaultOptions(),
                scrollMode: SCROLL_MODE.VERTICAL
            }, state);
           assert.equal(model.scrollContainerStyles, 'styleHideScrollbar');
        });
    });

    describe('serializeState', () => {
        it('should serialize state.', () => {
            const model: ScrollbarsModel = new ScrollbarsModel({
                ...getScrollbarsDefaultOptions(),
                scrollMode: SCROLL_MODE.VERTICAL
            });
            assert.deepEqual(model.serializeState(), {
                overflowHidden: false,
                styleHideScrollbar: undefined
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
                    scrollMode: SCROLL_MODE.VERTICAL_HORIZONTAL
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
                    scrollMode: SCROLL_MODE.VERTICAL_HORIZONTAL
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
                    scrollMode: SCROLL_MODE.VERTICAL_HORIZONTAL
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
        const placeholders = { top: 10, bottom: 10, left: 10, right: 10 };

        it('should update position and contentSize.', () => {
            const
                model: ScrollbarsModel = new ScrollbarsModel({
                    ...getScrollbarsDefaultOptions(),
                    scrollMode: SCROLL_MODE.VERTICAL_HORIZONTAL
                });

            // В реальнности метод задебоунсен, в тестах выключаем дебоунс.
            model._updateContainerSizes = ScrollbarsModel.prototype._updateContainerSizes;

            model.updateScrollState(scrollState, { offsetHeight: 50 });
            model.updatePlaceholdersSize({ top: 10, bottom: 10, left: 10, right: 10 });

            assert.strictEqual(model._models.vertical.position, scrollState.scrollTop + placeholders.top);
            assert.strictEqual(model._models.horizontal.position, scrollState.scrollLeft + placeholders.left);
            assert.strictEqual(model._models.vertical.contentSize,
                scrollState.scrollHeight + placeholders.top + placeholders.bottom);
            assert.strictEqual(model._models.horizontal.contentSize,
                scrollState.scrollWidth + placeholders.left + placeholders.right);
        });
    })

});
