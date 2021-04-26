import { GridView } from 'Controls/grid';
import { assert } from 'chai';
import { RecordSet } from 'Types/collection';
import { GridCollection } from 'Controls/grid';
import { assert as sinonAssert, spy} from 'sinon';

describe('Controls/grid_clean/GridView', () => {

    describe('Mount', () => {
        it('Check gridCollection version after mount', async () => {
            const collectionOptions = {
                collection: new RecordSet({
                    rawData: [{
                        key: 1,
                        title: 'item_1'
                    }],
                    keyProperty: 'key'
                }),
                keyProperty: 'key',
                columns: [{}],
            };
            const gridOptions = {
                listModel: new GridCollection(collectionOptions),
                keyProperty: 'key',
                footerTemplate: () => '',
                footer: () => '',
                itemPadding: {}
            };
            let gridView = new GridView(gridOptions);
            await gridView._beforeMount(gridOptions);
            assert.strictEqual(gridView.getListModel().getVersion(), 0, 'Version must be equals zero! No other variants!');
        });
    });

    describe('ColumnScroll', () => {
        let gridView: typeof GridView;
        let mockListViewModel;
        let options;

        beforeEach(() => {
            mockListViewModel = {
                subscribe: () => {},
                setItemPadding: () => {},
                getDraggableItem: () => undefined
            };
            options = { listModel: mockListViewModel };
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
                        stopPropagation: () => {},
                        target: {
                            closest: (selector) => null
                        }
                    });
                });
                assert.equal(columnScrollCallCount, 0);
            });
        });

        describe('._getGridTemplateColumns()', () => {
            it('shouldn\'t add actions column if list is empty', () => {
                const columns = [{}, {}];
                options.columns = columns;
                options.multiSelectVisibility = 'hidden';
                options.columnScroll = true;

                gridView._beforeMount(options);

                mockListViewModel.getCount = () => 0;
                mockListViewModel.getColumnsConfig = () => columns;
                assert.equal(gridView._getGridTemplateColumns(options), 'grid-template-columns: 1fr 1fr;');
            });

            it('should add actions column if list in not empty', () => {
                const columns = [{}, {}];
                options.columns = columns;
                options.multiSelectVisibility = 'hidden';
                options.columnScroll = true;

                gridView._beforeMount(options);

                mockListViewModel.getCount = () => 10;
                mockListViewModel.getColumnsConfig = () => columns;
                assert.equal(gridView._getGridTemplateColumns(options), 'grid-template-columns: 1fr 1fr 0px;');
            });
        });
        describe('_getHorizontalScrollBarStyles', () => {
            it('should call _columnScrollViewController.getScrollBarStyles with correct arguments', () => {
                let testArguments = [];
                const columns = [{}, {}];
                options.columns = columns;
                options.multiSelectVisibility = 'hidden';
                options.columnScroll = true;

                gridView._beforeMount(options);

                mockListViewModel.getCount = () => 10;
                mockListViewModel.getColumnsConfig = () => columns;

                gridView._columnScrollViewController = {
                    isVisible: () => true,
                    getScrollBarStyles: () => {
                        // @ts-ignore
                        testArguments = arguments;
                    }
                };
                gridView._getHorizontalScrollBarStyles();
                assert.equal(testArguments.length, 2);
            });
        });
    });

    describe('_getGridViewClasses', () => {
        let options: {[p: string]: any};
        let fakeFooter: object;
        let fakeResults: object;
        let resultsPosition: string;

        async function getGridView(): typeof GridView {
            const optionsWithModel = {
                ...options,
                listModel: {
                    getFooter: () => fakeFooter,
                    getResults: () => fakeResults,
                    subscribe: () => {},
                    setItemPadding: () => {},
                    getResultsPosition: () => resultsPosition
                }};
            const grid = new GridView(optionsWithModel);
            await grid._beforeMount(optionsWithModel);
            return grid;
        }

        beforeEach(() => {
            fakeFooter = null;
            fakeResults = null;
            resultsPosition = null;
            options = {
                itemActionsPosition: 'outside',
                style: 'default',
                theme: 'default'
            };
        });

        it('should contain class for item actions padding when everything fine', async () => {
            const grid = await getGridView();
            const classes = grid._getGridViewClasses(options);
            assert.include(classes, 'controls-GridView__paddingBottom__itemActionsV_outside');
        });

        it('should contain class for item actions padding when results exists and position = \'top\'', async () => {
            resultsPosition = 'top';
            fakeResults = {};
            const grid = await getGridView();
            const classes = grid._getGridViewClasses(options);
            assert.include(classes, 'controls-GridView__paddingBottom__itemActionsV_outside');
        });

        it('shouldn\'t contain class for item actions padding when results exists and position = \'bottom\'', async () => {
            resultsPosition = 'bottom';
            fakeResults = {};
            const grid = await getGridView();
            const classes = grid._getGridViewClasses(options);
            assert.notInclude(classes, 'controls-GridView__paddingBottom__itemActionsV_outside');
        });

        it('shouldn\'t contain class for item actions padding when footer exists', async () => {
            fakeFooter = {};
            const grid = await getGridView();
            const classes = grid._getGridViewClasses(options);
            assert.notInclude(classes, 'controls-GridView__paddingBottom__itemActionsV_outside');
        });

        it('shouldn\'t contain class for item actions padding when itemActionsPosition = \'inside\'', async () => {
            options.itemActionsPosition = 'inside';
            const grid = await getGridView();
            const classes = grid._getGridViewClasses(options);
            assert.notInclude(classes, 'controls-GridView__paddingBottom__itemActionsV_outside');
        });
    });
});
