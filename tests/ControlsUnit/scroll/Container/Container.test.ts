import {Container} from 'Controls/scroll';
import {constants} from 'Env/Env';
import {SHADOW_VISIBILITY} from 'Controls/_scroll/Container/Interface/IShadows';
import {SCROLL_POSITION} from 'Controls/_scroll/Utils/Scroll';

function createComponent(Component, cfg) {
    let cmp;
    if (Component.getDefaultOptions) {
        cfg = { ...Component.getDefaultOptions(), ...cfg };
    }
    cmp = new Component(cfg);
    cmp.saveOptions(cfg);
    cmp._beforeMount(cfg);
    return cmp;
}

describe('Controls/scroll:Container', () => {
    beforeEach(() => {
        global.window = {
            devicePixelRatio: 1
        };
        global.document = {
            createElement: function () {
                return {
                    setAttribute: function () {
                        return 0;
                    }
                };
            },
            body: {
                removeChild: function () {
                    return 0;
                },
                appendChild: function () {
                    return 0;
                }
            }
        };
    });

    afterEach(() => {
        global.window = undefined;
        global.document = undefined;
    });

    describe('constructor', () => {
        it('should initialize by default', () => {
            const component = createComponent(Container, {});

            assert.strictEqual(component._scrollCssClass, ' controls-Scroll__content_hideNativeScrollbar controls-Scroll-ContainerBase__scroll_vertical');
        });
    });

    describe('_updateState', () => {
        const state = {
            scrollTop: 0,
            scrollLeft: 0,
            clientHeight: 100,
            scrollHeight: 200,
            clientWidth: 100,
            scrollWidth: 200,
            verticalPosition: 'start',
            horizontalPosition: 'start',
            canVerticalScroll: true,
            canHorizontalScroll: true,
        };

        it('should update _scrollCssClass, scrollMode: "vertical"', () => {
            const component = createComponent(Container, {scrollMode: 'vertical'});
            component._children = {
                content: {
                    getBoundingClientRect: () => undefined
                }
            };
            component._container = {
                offsetHeight: 100
            };
            component._scrollbars._scrollContainerStyles = '';
            component._updateState(state);
            assert.strictEqual(component._scrollCssClass, ' controls-Scroll__content_hideNativeScrollbar controls-Scroll-ContainerBase__scroll_vertical');
        });
        it('should update _scrollCssClass, scrollMode: "verticalHorizontal"', () => { // controls-Scroll-ContainerBase__scroll_vertical
            const component = createComponent(Container, {scrollMode: 'verticalHorizontal'});
            component._children = {
                content: {
                    getBoundingClientRect: () => undefined
                }
            };
            component._container = {
                offsetHeight: 100
            };
            component._scrollbars._scrollContainerStyles = '';
            component._updateState(state);
            assert.strictEqual(component._scrollCssClass, ' controls-Scroll__content_hideNativeScrollbar controls-Scroll-ContainerBase__scroll_verticalHorizontal');
        });

        describe('shadows', () => {
            it('should update shadows models if optimized shadows are enabled and there are sticky headers', () => {
                const component = createComponent(Container, {scrollMode: 'vertical'});
                component._isOptimizeShadowEnabled = true;
                component._children = {
                    content: {
                        getBoundingClientRect: () => undefined
                    }
                };
                sinon.stub(component._stickyHeaderController, 'hasFixed').returns(true);

                assert.isFalse(component._shadows.top.isStickyHeadersShadowsEnabled());
                component._updateState({
                    ...state,
                    scrollTop: 10
                });
                assert.isTrue(component._shadows.top.isStickyHeadersShadowsEnabled());

                sinon.restore();
            });
        });
    });

    describe('_keydownHandler', () => {
        it('should scroll top 40px when key up', () => {
            const component = createComponent(Container, {});
            const result = 960;
            component._topPlaceholderSize = 0;
            component._state = {
                scrollTop: 1000
            };
            component._children = {
                content: {
                    scrollTop : 1000
                }
            };
            const event = {
                nativeEvent: {
                    isTrusted: false,
                    which: constants.key.up
                },
                preventDefault: () => {
                    return 0;
                }
            };
            component._keydownHandler(event);
            assert.strictEqual(component._children.content.scrollTop, result);
        });
        it('should scroll down 40px when key down', () => {
            const component = createComponent(Container, {});
            const result = 1040;
            component._topPlaceholderSize = 0;
            component._state = {
                scrollTop: 1000,
                scrollHeight: 2000,
                clientHeight: 600
            };
            component._children = {
                content: {
                    scrollTop: 1000
                }
            };
            const event = {
                nativeEvent: {
                    isTrusted: false,
                    which: constants.key.down
                },
                preventDefault: () => {
                    return 0;
                }
            };
            component._keydownHandler(event);
            assert.strictEqual(component._children.content.scrollTop, result);
        });
        it('should not scroll down 40px when key down', () => {
            const component = createComponent(Container, {});
            const result = 1000;
            component._topPlaceholderSize = 0;
            component._state = {
                scrollTop: 1000,
                scrollHeight: 2000,
                clientHeight: 1000
            };
            component._children = {
                content: {
                    scrollTop: 1000
                }
            };
            const event = {
                nativeEvent: {
                    isTrusted: false,
                    which: constants.key.down
                },
                preventDefault: () => {
                    return 0;
                }
            };
            component._keydownHandler(event);
            assert.strictEqual(component._children.content.scrollTop, result);
        });
        it('should not scroll down 40px when key up', () => {
            const component = createComponent(Container, {});
            const result = 0;
            component._topPlaceholderSize = 0;
            component._state = {
                scrollTop: 0
            };
            component._children = {
                content: {
                    scrollTop: 0
                }
            };
            const event = {
                nativeEvent: {
                    isTrusted: false,
                    which: constants.key.up
                },
                preventDefault: () => {
                    return 0;
                }
            };
            component._keydownHandler(event);
            assert.strictEqual(component._children.content.scrollTop, result);
        });
        it('should not scroll anywhere if not native keydown', () => {
            const component = createComponent(Container, {});
            const result = 0;
            component._topPlaceholderSize = 0;
            component._state = {
                scrollTop: 0
            };
            component._children = {
                content: {
                    scrollTop: 0
                }
            };
            const event = {
                nativeEvent: {
                    isTrusted: true,
                    which: constants.key.up
                },
                preventDefault: () => {
                    return 0;
                }
            };
            component._keydownHandler(event);
            assert.strictEqual(component._children.content.scrollTop, result);
        });
    });

    describe('_updateShadowVisibility', () => {
        it('should set always visible', () => {
            const component = createComponent(Container, {});
            component._shadows._models.top._scrollState.canVerticalScroll = true;
            component._shadows._models.bottom._scrollState.canVerticalScroll = true;
            component._shadows._models.top._isVisible = false;
            component._shadows._models.bottom._isVisible = false;
            component._updateShadowVisibility(
                {}, { top: SHADOW_VISIBILITY.VISIBLE, bottom: SHADOW_VISIBILITY.VISIBLE });
            assert.isTrue(component._shadows._models.top.isVisible);
            assert.isTrue(component._shadows._models.bottom.isVisible);
            assert.isTrue(component._stickyHeaderController._isShadowVisible.top);
            assert.isTrue(component._stickyHeaderController._isShadowVisible.bottom);
        });
        it('should set always invisible', () => {
            const component = createComponent(Container, {});
            component._shadows._models.top._scrollState.canVerticalScroll = true;
            component._shadows._models.bottom._scrollState.canVerticalScroll = true;
            component._shadows._models.top._scrollState.verticalPosition = SCROLL_POSITION.MIDDLE;
            component._shadows._models.bottom._scrollState.verticalPosition = SCROLL_POSITION.MIDDLE;
            component._shadows._models.top._isVisible = true;
            component._shadows._models.bottom._isVisible = true;
            component._updateShadowVisibility(
                {}, { top: SHADOW_VISIBILITY.HIDDEN, bottom: SHADOW_VISIBILITY.HIDDEN });
            assert.isFalse(component._shadows._models.top.isVisible);
            assert.isFalse(component._shadows._models.bottom.isVisible);
            assert.isFalse(component._stickyHeaderController._isShadowVisible.top);
            assert.isFalse(component._stickyHeaderController._isShadowVisible.bottom);
        });
    });
});
