import ColumnScroll from 'Controls/_gridNew/ViewControllers/ColumnScroll';
import {assert} from 'chai';

describe('Controls/grid_clean/ViewController/ColumnScroll', () => {
    let columnScrollController: ColumnScroll;
    const mockContainersWithColumnScroll = {
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
            containers: mockContainersWithColumnScroll
        });

        const methodNames: Array<[keyof ColumnScroll, unknown[]]> = [
            ['onPositionChanged', []]
        ];

        methodNames.forEach(([methodName, args]) => {
            assert.doesNotThrow(() => {
                columnScrollController[methodName](...args)
            });
        })
    });
});
