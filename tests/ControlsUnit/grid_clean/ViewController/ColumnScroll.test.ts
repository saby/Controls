import ColumnScroll from 'Controls/_grid/ViewControllers/ColumnScroll';
import {assert} from 'chai';

describe('Controls/grid_clean/ViewController/ColumnScroll', () => {
    let columnScrollController: ColumnScroll;
    let mockContainersWithColumnScroll;
    let mockScrollBar;

    beforeEach(() => {
        mockContainersWithColumnScroll = {
            wrapper: {
                offsetWidth: 200,
                getClientRects: () => [{}]
            } as unknown as HTMLElement,
            content: {
                scrollWidth: 300,
                offsetWidth: 200,
                querySelectorAll: () => [],
                querySelector: () => ({
                    getBoundingClientRect: () => ({
                        left: 10
                    }),
                    offsetWidth: 100
                }),
                getBoundingClientRect: () => ({
                    left: 10
                })
            } as unknown as HTMLElement,
            styles: {} as unknown as HTMLElement,
            header: {} as unknown as HTMLElement
        };

        mockScrollBar = {
            recalcSizes: () => {},
            setPosition: () => {}
        };
    });

    it('should not throw error if drag scroll is disabled', async () => {
        const options = {
            columns: [{width: '100px'}, {width: '100px'}, {width: '100px'}],
            dragScrolling: false,
            isFullGridSupport: true
        };

        columnScrollController = new ColumnScroll(options);

        await columnScrollController.actualizeColumnScroll({
            ...options,
            scrollBar: {
                recalcSizes: () => {},
                setPosition: () => {}
            },
            containers: {
                ...mockContainersWithColumnScroll,
                header: {
                    ...mockContainersWithColumnScroll.header,
                    querySelectorAll: () => [{
                        getBoundingClientRect: () => ({left: 10})
                    }]
                }
            }
        });

        const methodNames: Array<[keyof ColumnScroll, unknown[]]> = [
            ['onPositionChanged', []]
        ];

        methodNames.forEach(([methodName, args]) => {
            assert.doesNotThrow(() => {
                columnScrollController[methodName](...args)
            });
        });
    });

    describe('actualizeColumnScroll', () => {
        it('update column scroll sizes on resize', async () => {
            const options = {
                columns: [{width: '100px'}, {width: '100px'}, {width: '100px'}],
                dragScrolling: false,
                isFullGridSupport: true
            };

            const controller = new ColumnScroll(options);
            const containers = {
                ...mockContainersWithColumnScroll,
                header: {
                    ...mockContainersWithColumnScroll.header,
                    querySelectorAll: () => [{
                        getBoundingClientRect: () => ({left: 10})
                    }]
                }
            };

            await controller.actualizeColumnScroll({
                    ...options,
                    scrollBar: mockScrollBar,
                    containers
                },
                options
            );

            assert.equal(controller.getSizes().containerSize, 200);
            assert.equal(controller.getSizes().contentSize, 300);

            containers.content.scrollWidth = 500;
            containers.content.offsetWidth = 400;
            containers.wrapper.offsetWidth = 400;

            const updateResult = await controller.actualizeColumnScroll({
                    ...options,
                    scrollBar: mockScrollBar,
                    containers
                },
                options
            );

            assert.equal(updateResult.status, 'updated');
            assert.equal(controller.getSizes().containerSize, 400);
            assert.equal(controller.getSizes().contentSize, 500);
        });
    });
});
