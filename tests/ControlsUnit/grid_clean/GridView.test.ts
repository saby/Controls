import { GridView } from 'Controls/gridNew';
import { assert } from 'chai';


describe('Controls/grid_clean/GridView', () => {

    describe('ColumnScroll', () => {
        let gridView: typeof GridView;
        let options = {};

        beforeEach(() => {
            gridView = new GridView(options);
        });

        describe('disabled. Should ignore all methods', () => {

            it('_beforeMount', async () => {
                await gridView._beforeMount(options);
                assert.isNull(gridView._columnScrollViewController);
            });

            it('handlers', () => {
                let columnScrollCallCount = 0;

                const handlers = [
                    '_onHorizontalPositionChangedHandler',
                    '_onGridWrapperWheel',
                    '_onScrollBarMouseUp',
                    '_onStartDragScrolling',
                    '_onMoveDragScroll',
                    '_onStopDragScrolling',
                    '_resizeHandler'
                ];
                gridView._actualizeColumnScroll = () => {
                    columnScrollCallCount++;
                };
                handlers.forEach((hName) => {
                    gridView[hName]({
                        stopPropagation: () => {}
                    });
                });
                assert.equal(columnScrollCallCount, 0);
            });
        });
    });
});
