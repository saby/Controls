import {_ContainerNew} from 'Controls/scroll';

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

describe('Controls/scroll:_ContainerNew', () => {
    describe('constructor', () => {
        it('should initialize by default', () => {
            const component = createComponent(_ContainerNew, {});

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
            const component = createComponent(_ContainerNew, {scrollMode: 'vertical'});
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
            const component = createComponent(_ContainerNew, {scrollMode: 'verticalHorizontal'});
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
    });


});
