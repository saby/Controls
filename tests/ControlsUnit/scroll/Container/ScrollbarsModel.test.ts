import ScrollbarsModel from 'Controls/_scroll/Container/ScrollbarsModel';
import {getDefaultOptions as getScrollbarsDefaultOptions} from 'Controls/_scroll/Container/Interface/IScrollbars';
import {SCROLL_MODE} from 'Controls/_scroll/Container/Type';
import {SCROLL_DIRECTION} from 'Controls/_scroll/Utils/Scroll';

describe('Controls/scroll:ContainerNew ScrollbarsModel', () => {

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
                    scrollContainerStyles: 'scrollContainerStyles',
                    styleHideScrollbar: 'styleHideScrollbar'
                },
                model: ScrollbarsModel = new ScrollbarsModel({
                    ...getScrollbarsDefaultOptions(),
                    scrollMode: SCROLL_MODE.VERTICAL
                }, state);

            assert.isTrue(model._overflowHidden);
            assert.strictEqual(model._styleHideScrollbar, state.styleHideScrollbar);
            assert.strictEqual(model._scrollContainerStyles, state.scrollContainerStyles);
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
           assert.equal(model.scrollContainerStyles, 'scrollContainerStyles');
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
                scrollContainerStyles: undefined,
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

            model.updateScrollState(scrollState, { offsetHeight: 50 });

            assert.strictEqual(model._models.vertical.position, scrollState.scrollTop);
            assert.strictEqual(model._models.horizontal.position, scrollState.scrollLeft);
            assert.strictEqual(model._models.vertical.contentSize, scrollState.scrollHeight);
            assert.strictEqual(model._models.horizontal.contentSize, scrollState.scrollWidth);
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

    describe('adjustContentMarginsForBlockRender', () => {
        it('should`t update margins.', () => {
            const model: ScrollbarsModel = new ScrollbarsModel({
                ...getScrollbarsDefaultOptions(),
                scrollMode: SCROLL_MODE.VERTICAL
            });
            sinon.stub(ScrollbarsModel, '_getComputedStyle').returns({ marginRight: 10 });
            model._overflowHidden = false;
            model._styleHideScrollbar = 'margin-right: 10px';
            model.adjustContentMarginsForBlockRender({});
            assert.strictEqual(model._scrollContainerStyles, 'margin-right: 20px');
            sinon.restore();
        });
        it('should`t update margins if theres no scrollbars.', () => {
            const model: ScrollbarsModel = new ScrollbarsModel({
                ...getScrollbarsDefaultOptions(),
                scrollMode: SCROLL_MODE.VERTICAL
            });
            sinon.stub(ScrollbarsModel, '_getComputedStyle');
            model.adjustContentMarginsForBlockRender({});
            sinon.assert.notCalled(ScrollbarsModel._getComputedStyle);
            sinon.restore();
        });
    });
});
