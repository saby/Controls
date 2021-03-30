import {assert} from 'chai';
import {CssClassesAssert} from './../CustomAsserts';
import {ColumnScrollController as ColumnScroll} from 'Controls/columnScroll';

// @ts-ignore
ColumnScroll.prototype._createGuid = () => '12345';

//#region Mock functions

function mockScrollContainer(params: { offsetWidth: number }): HTMLElement {
    const rect: DOMRect = {
        left: 12,
        right: params.offsetWidth
    } as DOMRect;
    return {
        getClientRects: () => [null, null],
        offsetWidth: params.offsetWidth,
        getBoundingClientRect: () => ({
            ...rect,
            toJSON(): DOMRect {
                return rect;
            }
        })
    } as unknown as HTMLElement;
}

function mockStylesContainer(): HTMLStyleElement {
    return {
        innerHTML: ''
    } as unknown as HTMLStyleElement;
}

function mockStickyCellContainer(): HTMLStyleElement {
    return {
        offsetWidth: 300,
        getBoundingClientRect: () => ({
            left: 52
        })
    } as unknown as HTMLStyleElement;
}

function mockColumnsHTMLContainer(columnsSizes: number[] | number[][], offset: number): HTMLDivElement {
    const sticky = mockStickyCellContainer();
    let startPosition;
    const columnsRects: DOMRect[] = [];

    function initStartPosition(): void {
        startPosition = offset + sticky.offsetWidth + sticky.getBoundingClientRect().left;
    }

    function collect(row: number[]): void {
        row.forEach((width) => {
            columnsRects.push({
                width,
                left: startPosition,
                right: startPosition + width
            } as DOMRect);
            startPosition = startPosition + width;
        });
    }

    if (Array.isArray(columnsSizes[0])) {
        columnsSizes.forEach((row) => {
            initStartPosition();
            collect(row);
        });
    } else {
        initStartPosition();
        collect(columnsSizes as number[]);
    }

    return {
        querySelectorAll: (selectors: string): NodeListOf<HTMLElement> => columnsRects.map((rect) => ({
            getBoundingClientRect(): DOMRect {
                return rect;
            },
            offsetWidth: rect.width
        })) as undefined as NodeListOf<HTMLElement>
    } as HTMLDivElement;
}

function mockContentContainer(params: {
    scrollWidth: number,
    offsetWidth: number,
    stickyElements?: unknown[],
    stickyColumnsCount?: number,
    hasMultiSelect?: boolean,
    scrollPosition?: number
}): HTMLElement {
    const left = 12 + params.scrollPosition ? params.scrollPosition : 0;
    return {
        scrollWidth: params.scrollWidth,
        offsetWidth: params.offsetWidth,
        querySelectorAll: (selector: string) => (selector === '.controls-Grid_columnScroll_wrapper' && !!params.stickyElements) ? params.stickyElements : [],
        querySelector: (selector: string) => {
            const lastStickyColumnSelector = `.controls-Grid_columnScroll__fixed:nth-child(${(params.stickyColumnsCount || 1) + (params.hasMultiSelect ? 1 : 0)})`;
            if (selector === lastStickyColumnSelector) {
                return mockStickyCellContainer();
            }
        },
        getBoundingClientRect: () => ({
            left,
            right: left + params.scrollWidth
        })
    } as unknown as HTMLElement;
}

//#endregion

describe('Controls/columnScroll', () => {
    let columnScroll: ColumnScroll;

    //#region beforeEach
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
    //#endregion

    describe('constructor', () => {
        it('initial state: transformSelector', () => {
            assert.equal(columnScroll.getTransformSelector(), 'controls-ColumnScroll__transform-12345');
        });
        it('initial state: scrollPosition', () => {
            assert.equal(columnScroll.getScrollPosition(), 0);
        });
    });

    describe('.updateSizes()', () => {

        it('should call only once(last callback) in debounced updateSizes', (done) => {
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
    });

    // TODO: Убрать ts-ignore
    it('.getShadowClasses()', () => {
        // @ts-ignore
        columnScroll._shadowState = {start: true, end: true};

        CssClassesAssert.isSame(
            columnScroll.getShadowClasses('start'),
            [
                'js-controls-ColumnScroll__shadow-start',
                'controls-ColumnScroll__shadow_theme-default',
                'controls-ColumnScroll__shadow_without-bottom-padding_theme-default',
                'controls-ColumnScroll__shadow-start_theme-default',
                'controls-horizontal-gradient-default_theme-default'
            ]
        );

        CssClassesAssert.isSame(
            columnScroll.getShadowClasses('end'),
            [
                'js-controls-ColumnScroll__shadow-end',
                'controls-ColumnScroll__shadow_theme-default',
                'controls-ColumnScroll__shadow_without-bottom-padding_theme-default',
                'controls-ColumnScroll__shadow-end_theme-default',
                'controls-horizontal-gradient-default_theme-default'
            ]
        );

    });

    // TODO: Переписать на публичные вызовы. Тестировать поведение кусками.
    describe('tests in old format. REWRITE.', () => {

        // FIXME: Этот тест неправильный, не может быть отрицательного значения
        it('should scroll to position', () => {
            const target = {
                left: 0,
                right: 200
            };
            assert.equal(columnScroll.getScrollPosition(), 0);
            columnScroll.scrollToElementIfHidden(target);
            assert.equal(columnScroll.getScrollPosition(), -12);
        });

        it('should scroll to right column when not multiHeader', () => {
            columnScroll.setScrollPosition(8);
            assert.equal(columnScroll.getScrollPosition(), 8);
            const mockContainer = mockColumnsHTMLContainer([100, 150, 51, 51], columnScroll.getScrollPosition());
            columnScroll.scrollToColumnWithinContainer(mockContainer);
            assert.equal(columnScroll.getScrollPosition(), 18);
        });

        it('should scroll to right column when multiHeader', () => {
            columnScroll.setScrollPosition(8);
            assert.equal(columnScroll.getScrollPosition(), 8);
            columnScroll.scrollToColumnWithinContainer(mockColumnsHTMLContainer([
                [250, 102],
                [100, 150, 51, 51]
            ], columnScroll.getScrollPosition()));
            assert.equal(columnScroll.getScrollPosition(), 18);
        });
    })
});
