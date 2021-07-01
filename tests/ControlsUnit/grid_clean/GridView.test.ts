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
                isDragging: () => false
            };
            options = { listModel: mockListViewModel, isFullGridSupport: true };
            gridView = new GridView(options);
        });

        describe('._getGridTemplateColumns()', () => {
            it('should add actions column if list is empty', () => {
                const columns = [{}, {}];
                options.columns = columns;
                options.multiSelectVisibility = 'hidden';
                options.columnScroll = true;

                gridView._beforeMount(options);

                mockListViewModel.getCount = () => 0;
                mockListViewModel.getColumnsConfig = () => columns;
                assert.equal(gridView._getGridTemplateColumns(options), 'grid-template-columns: 1fr 1fr 0px;');
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
                    getResultsPosition: () => resultsPosition,
                    isDragging: () => false
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

        xit('should contain class for item actions padding when everything fine', async () => {
            const grid = await getGridView();
            const classes = grid._getGridViewClasses(options);
            assert.include(classes, 'controls-GridView__paddingBottom__itemActionsV_outside');
        });

        xit('should contain class for item actions padding when results exists and position = \'top\'', async () => {
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

        it('should contain class when dragging', async () => {
            const grid = await getGridView();
            grid._listModel.isDragging = () => true;
            const classes = grid._getGridViewClasses(options);
            assert.include(classes, 'controls-Grid_dragging_process');
        });
    });

    describe('ladder offset style', () => {
        it('_getLadderTopOffsetStyles', () => {
            const options = {
                columns: [{}]
            };
            const gridView = new GridView(options);
            gridView._listModel = {
                getResultsPosition: () => 'top'
            };
            gridView._createGuid = () => 'guid';
            gridView._container = {
                getElementsByClassName: (className) => {
                    if (className === 'controls-Grid__header') {
                        return [{getComputedStyle: () => '', getBoundingClientRect: () => ({height: 100}) }];
                    }
                    if (className === 'controls-Grid__results') {
                        return [{getComputedStyle: () => '', getBoundingClientRect: () => ({height: 50}) }];
                    }
                }
            };
            gridView.saveOptions(options);
            gridView._beforeMount(options)
            const expectedStyle = '.controls-GridView__ladderOffset-guid .controls-Grid__row-cell__ladder-spacing_withHeader_withResults {' +
                                    'top: calc(var(--item_line-height_l_grid) + 150px) !important;' +
                                    '}' +
                                    '.controls-GridView__ladderOffset-guid .controls-Grid__row-cell__ladder-spacing_withHeader_withResults_withGroup {' +
                                    'top: calc(var(--item_line-height_l_grid) + var(--grouping_height_list) + 150px) !important;' +
                                    '}';
            assert.equal(gridView._getLadderTopOffsetStyles(), expectedStyle);
        });
    });

    describe('Header', () => {
        let headerVisibility;
        let resultsVisibility;
        let colspanGroup;
        let gridView;

        beforeEach(() => {
            headerVisibility = false;
            colspanGroup = false;
            const options = {
                headerVisibility: 'hasdata'
            };
            gridView = new GridView(options);
            gridView.saveOptions(options);
            gridView._listModel = {
                setHeaderVisibility: (value) => {
                    headerVisibility = value;
                },
                setResultsVisibility: (value) => {
                    resultsVisibility = value;
                },
                setColspanGroup: (value) => {
                    colspanGroup = value;
                }
            };
        });

        it('update header visibility', () => {
            const newVisibility = 'visible';
            gridView._beforeUpdate({headerVisibility: newVisibility});
            assert.equal(headerVisibility, newVisibility);
        });

        it('update results visibility', () => {
            const newVisibility = 'visible';
            gridView._beforeUpdate({resultsVisibility: newVisibility});
            assert.equal(resultsVisibility, newVisibility);
        });

        it('update colspanGroup', () => {
            gridView._beforeUpdate({});
            assert.equal(colspanGroup, true);
        });
    });
});
