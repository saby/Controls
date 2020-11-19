import {Container} from 'Controls/scroll';
import {compatibility, constants} from 'Env/Env';
import {SHADOW_VISIBILITY, SHADOW_MODE} from 'Controls/_scroll/Container/Interface/IShadows';
import {SCROLL_DIRECTION, SCROLL_POSITION} from 'Controls/_scroll/Utils/Scroll';

function createComponent(Component, cfg) {
    let cmp;
    if (Component.getDefaultOptions) {
        cfg = { theme: 'default', ...Component.getDefaultOptions(), ...cfg };
    }
    cmp = new Component(cfg);
    cmp.saveOptions(cfg);
    cmp._beforeMount(cfg);
    return cmp;
}

describe('Controls/scroll:Container', () => {
    describe('constructor', () => {
        it('should initialize by default', () => {
            const component = createComponent(Container, {});

            assert.strictEqual(component._scrollCssClass, ' controls-Scroll__content_hideNativeScrollbar controls-Scroll-ContainerBase__scroll_vertical');
        });
    });

    describe('_beforeMount', () => {
        [{
            shadowMode: SHADOW_MODE.CSS,
        }, {
            shadowMode: SHADOW_MODE.MIXED,
        }].forEach((options) => {
            it(`should initialize with css shadows. Options ${JSON.stringify(options)}`, () => {
                const component = createComponent(Container, options);
                assert.isTrue(component._isOptimizeShadowEnabled);
            });
        });

        [{
            shadowMode: SHADOW_MODE.JS,
        }, {
            shadowMode: SHADOW_MODE.MIXED,
            bottomShadowVisibility: SHADOW_VISIBILITY.VISIBLE,
            topShadowVisibility: SHADOW_VISIBILITY.VISIBLE
        }].forEach((options) => {
            it(`should initialize with js shadows. Options ${JSON.stringify(options)}`, () => {
                const component = createComponent(Container, options);
                assert.isFalse(component._isOptimizeShadowEnabled);
            });
        });
    });

    describe('_beforeUnmount', () => {
        it('should call beforeUnmount in ContainerBase', () => {
            const component = createComponent(Container);
            const state = component._state;
            component._beforeUnmount();

            assert.notEqual(state, component._state);
            assert.isNull(component._state);
        });
    });

    describe('_afterMount', () => {
        let component: Container;
        beforeEach(() => {
            component = createComponent(Container, {});
            sinon.stub(component._stickyHeaderController, 'init');
            component._children = {
                content: {
                    getBoundingClientRect: () => undefined,
                    children: []
                }
            };
        });
        afterEach(() => {
             sinon.restore();
        });
        it('should\'t init sticky header controller on not touch devices', () => {
            component._afterMount({}, {});
            sinon.assert.notCalled(component._stickyHeaderController.init);
        });
        it('should init sticky header controller on touch devices', () => {
            const touch = compatibility.touch;
            compatibility.touch = true;
            component._afterMount({}, {});
            sinon.assert.called(component._stickyHeaderController.init);
            compatibility.touch = touch
        });
    });

    describe('shadowMode', () => {
        [{
            shadowMode: SHADOW_MODE.JS,
            isOptimizeShadowEnabled: false,
            isOptimizeShadowEnabledAfterMouseEnter: false,
            optimizeShadowClass: '',
            optimizeShadowClassAfterMouseEnter: ''
        }, {
            shadowMode: SHADOW_MODE.MIXED,
            isOptimizeShadowEnabled: true,
            isOptimizeShadowEnabledAfterMouseEnter: false,
            optimizeShadowClass: 'controls-Scroll__backgroundShadow controls-Scroll__background-Shadow_style-default_theme-default controls-Scroll__background-Shadow_top-auto_bottom-auto_style-default_theme-default',
            optimizeShadowClassAfterMouseEnter: ''
        }, {
            shadowMode: SHADOW_MODE.CSS,
            isOptimizeShadowEnabled: true,
            isOptimizeShadowEnabledAfterMouseEnter: true,
            optimizeShadowClass: 'controls-Scroll__backgroundShadow controls-Scroll__background-Shadow_style-default_theme-default controls-Scroll__background-Shadow_top-auto_bottom-auto_style-default_theme-default',
            optimizeShadowClassAfterMouseEnter: 'controls-Scroll__backgroundShadow controls-Scroll__background-Shadow_style-default_theme-default controls-Scroll__background-Shadow_top-auto_bottom-auto_style-default_theme-default'
        }].forEach((test) => {
            it(test.shadowMode, () => {
                const component = createComponent(Container, {shadowMode: test.shadowMode});
                assert.strictEqual(component._isOptimizeShadowEnabled, test.isOptimizeShadowEnabled);
                assert.strictEqual(component._optimizeShadowClass, test.optimizeShadowClass);

                component._mouseenterHandler();
                assert.strictEqual(component._isOptimizeShadowEnabled, test.isOptimizeShadowEnabledAfterMouseEnter);
                assert.strictEqual(component._optimizeShadowClass, test.optimizeShadowClassAfterMouseEnter);
            });
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

        describe('scrollbars', () => {
            it('should initialize scrollbars only after mouseenter', () => {
                const component = createComponent(Container, {scrollMode: 'vertical'});
                component._children = {
                    content: {
                        getBoundingClientRect: () => undefined
                    }
                };
                component._container = {
                    offsetHeight: 100
                };
                component._updateState(state);
                assert.isFalse(component._scrollbars.vertical.isVisible);
                component._mouseenterHandler();
                assert.isTrue(component._scrollbars.vertical.isVisible);
            });

            it('should initialize scrollbars in _updateState  after mouseenter', () => {
                const component = createComponent(Container, {scrollMode: 'vertical'});
                component._children = {
                    content: {
                        getBoundingClientRect: () => undefined
                    }
                };
                component._container = {
                    offsetHeight: 100
                };

                component._mouseenterHandler();
                assert.isFalse(component._scrollbars.vertical.isVisible);
                component._updateState(state);
                assert.isTrue(component._scrollbars.vertical.isVisible);
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
            const version: number = component._shadows.getVersion();
            component._wasMouseEnter = true;
            component._shadows._models.top._scrollState.canVerticalScroll = true;
            component._shadows._models.bottom._scrollState.canVerticalScroll = true;
            component._shadows._models.top._isVisible = false;
            component._shadows._models.bottom._isVisible = false;
            component._updateShadowVisibility({ top: SHADOW_VISIBILITY.VISIBLE, bottom: SHADOW_VISIBILITY.VISIBLE });
            assert.isTrue(component._shadows._models.top.isVisible);
            assert.isTrue(component._shadows._models.bottom.isVisible);
            assert.isTrue(component._stickyHeaderController._isShadowVisible.top);
            assert.isTrue(component._stickyHeaderController._isShadowVisible.bottom);
            assert.notEqual(component._shadows.getVersion(), version);
        });
        it('should\'t update version until the mouse has been hover.', () => {
            const component = createComponent(Container, {});
            const version: number = component._shadows.getVersion();
            component._shadows._models.top._scrollState.canVerticalScroll = true;
            component._shadows._models.bottom._scrollState.canVerticalScroll = true;
            component._shadows._models.top._isVisible = false;
            component._shadows._models.bottom._isVisible = false;
            component._updateShadowVisibility({ top: SHADOW_VISIBILITY.VISIBLE, bottom: SHADOW_VISIBILITY.VISIBLE });
            assert.isTrue(component._shadows._models.top.isVisible);
            assert.isTrue(component._shadows._models.bottom.isVisible);
            assert.isTrue(component._stickyHeaderController._isShadowVisible.top);
            assert.isTrue(component._stickyHeaderController._isShadowVisible.bottom);
            assert.strictEqual(component._shadows.getVersion(), version);
        });
        it('should set always invisible', () => {
            const component = createComponent(Container, {});
            const version: number = component._shadows.getVersion();
            component._wasMouseEnter = true;
            component._shadows._models.top._scrollState.canVerticalScroll = true;
            component._shadows._models.bottom._scrollState.canVerticalScroll = true;
            component._shadows._models.top._scrollState.verticalPosition = SCROLL_POSITION.MIDDLE;
            component._shadows._models.bottom._scrollState.verticalPosition = SCROLL_POSITION.MIDDLE;
            component._shadows._models.top._isVisible = true;
            component._shadows._models.bottom._isVisible = true;
            component._updateShadowVisibility({ top: SHADOW_VISIBILITY.HIDDEN, bottom: SHADOW_VISIBILITY.HIDDEN });
            assert.isFalse(component._shadows._models.top.isVisible);
            assert.isFalse(component._shadows._models.bottom.isVisible);
            assert.isFalse(component._stickyHeaderController._isShadowVisible.top);
            assert.isFalse(component._stickyHeaderController._isShadowVisible.bottom);
            assert.notEqual(component._shadows.getVersion(), version);
        });
    });

    describe('_positionChangedHandler', () => {

        it('should update scrollTop, scrollMode: "vertical"', () => {
            const component = createComponent(Container, {scrollMode: 'vertical'});
            component._children = {
                content: {
                    getBoundingClientRect: () => undefined,
                    scrollTop: 100
                }
            };
            component._container = {
                offsetHeight: 100
            };
            component._positionChangedHandler({}, SCROLL_DIRECTION.VERTICAL, 10);
            assert.strictEqual(component._children.content.scrollTop, 10);
        });
    });
});
