import {assert} from 'chai';
import {ColumnScroll} from 'Controls/_grid/resources/ColumnScroll';

// @ts-ignore
ColumnScroll.prototype._createGuid = () => '12345';

function mockScrollContainer(params: { offsetWidth: number }): HTMLElement {
    return {
        getClientRects: () => [null, null],
        offsetWidth: params.offsetWidth
    } as unknown as HTMLElement;
}

function mockStylesContainer(): HTMLStyleElement {
    return {
        innerHTML: ''
    } as unknown as HTMLStyleElement;
}

function mockContentContainer(params: {
    scrollWidth: number,
    offsetWidth: number,
    stickyElements?: unknown[],
    stickyColumnsCount?: number,
    hasMultiSelect?: boolean
}): HTMLElement {
    return {
        scrollWidth: params.scrollWidth,
        offsetWidth: params.offsetWidth,
        querySelectorAll: (selector: string) => selector === '.controls-Grid_columnScroll_wrapper' && !!params.stickyElements ? params.stickyElements : [],
        querySelector: (selector: string) => {
            const lastStickyColumnSelector = `.controls-Grid_columnScroll__fixed:nth-child(${(params.stickyColumnsCount || 1) + (params.hasMultiSelect ? 1 : 0)})`;
            if (selector === lastStickyColumnSelector) {
                return {
                    offsetWidth: 300,
                    getBoundingClientRect: () => ({
                        left: 52
                    })
                };
            }
        },
        getBoundingClientRect: () => ({
            left: 12
        })
    } as unknown as HTMLElement;
}

describe('Controls/grid_clean/Controllers/ColumnScroll', () => {

    let columnScroll: ColumnScroll;

    beforeEach(() => {
        const cfg = {
            hasMultiSelect: false,
            stickyColumnsCount: 2
        };
        columnScroll = new ColumnScroll(cfg);

        columnScroll.setContainers({
            scrollContainer: mockScrollContainer({
                offsetWidth: 600
            }),
            contentContainer: mockContentContainer({
                ...cfg,
                scrollWidth: 782,
                offsetWidth: 600
            }),
            stylesContainer: mockStylesContainer()
        });
    });

    it('state after ctor', () => {
        assert.equal(columnScroll.getTransformSelector(), 'controls-ColumnScroll__transform-12345');
        assert.equal(columnScroll.getScrollPosition(), 0);
    });

    it('should call only once, last callback in debounced updateSizes', (done) => {
        let updateCounter = 0;
        let isFiredLast = false;

        columnScroll.updateSizes(() => {
            // Должен быть проигнорирован.
            updateCounter++;
        });
        columnScroll.updateSizes(() => {
            // Должен быть проигнорирован.
            updateCounter++;
        });
        columnScroll.updateSizes(() => {
            updateCounter++;
            isFiredLast = true;
            assert.equal(updateCounter, 1, 'Debounced updating sizes called then more then 1 time.');
            assert.isTrue(isFiredLast, 'Should fire callback only on rea update(last in debounced fn).');
            done();
        });
    });

    it('should not call debounced updateSizes if controller was destroyed', () => {
        let isCallbackCalled = false;
        columnScroll.updateSizes(() => {
            isCallbackCalled = true;
        });

        columnScroll.destroy();

        columnScroll.updateSizes(() => {
            isCallbackCalled = true;
        });
        assert.isFalse(isCallbackCalled, 'Callback wasCalled for destroyed controller.');
    });

    it('shouldn\'t scroll to fixed element', () => {
        const target = {
            closest: (selector: string) => selector === '.controls-Grid_columnScroll__fixed' ? {} : null,
            getBoundingClientRect: () => ({
                left: -100,
                right: 100
            })
        } as HTMLElement;
        assert.equal(columnScroll.getScrollPosition(), 0);
        columnScroll.scrollToElementIfHidden(target);
        assert.equal(columnScroll.getScrollPosition(), 0);
    });

    it('getShadowClasses', () => {
        // @ts-ignore
        columnScroll._shadowState = {start: true, end: true};
        let shadowClasses = columnScroll.getShadowClasses('start');
        let expectedClasses = `js-controls-ColumnScroll__shadow-start`
            + ` controls-ColumnScroll__shadow_theme-default`
            + ` controls-ColumnScroll__shadow_without-bottom-padding_theme-default`
            + ` controls-ColumnScroll__shadow-start_theme-default`
            + ` controls-horizontal-gradient-default_theme-default`;
        assert.equal(shadowClasses, expectedClasses, 'wrong start shadow classes for visible shadow without bottom padding');

        // @ts-ignore
        shadowClasses = columnScroll.getShadowClasses('end');
        expectedClasses = `js-controls-ColumnScroll__shadow-end`
            + ` controls-ColumnScroll__shadow_theme-default`
            + ` controls-ColumnScroll__shadow_without-bottom-padding_theme-default`
            + ` controls-ColumnScroll__shadow-end_theme-default`
            + ` controls-horizontal-gradient-default_theme-default`;
        assert.equal(shadowClasses, expectedClasses, 'wrong end shadow classes for visible shadow without bottom padding');
    });
});
