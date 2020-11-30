import {ControllerClass, Prefetch, IFilterControllerOptions} from 'Controls/filter';
import {SbisService} from 'Types/source';
import {assert} from 'chai';

function getFilterButtonItems(): any[] {
    return [{
        id: 'testId1',
        value: '',
        textValue: ''
    }, {
        id: 'testId2',
        value: '',
        textValue: ''
    }];
}

describe('Controls/filter:ControllerClass', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('init filter with prefetchParams', () => {
            const filterController = new ControllerClass({
                filter: {test: '123'},
                prefetchParams: { PrefetchSessionId: 'test' }
            });
            assert.deepEqual(filterController._filter, {
                test: '123',
                PrefetchSessionId: 'test'
            });
        });
    });

    it('loadFilterItemsFromHistory', () => {
        const filterController = new ControllerClass({
            filterButtonSource: getFilterButtonItems(),
            historyId: 'hId'
        });
        const historyItems = [
            {
                id: 'testId1',
                value: '',
                textValue: ''
            }, {
                id: 'testId2',
                value: 'testValue',
                textValue: 'textValue4'
            }
        ];
        sandbox.replace(filterController, '_loadHistoryItems', () => {return Promise.resolve(historyItems)});

        return filterController.loadFilterItemsFromHistory().then((history) => {
            assert.deepEqual(filterController.getFilterButtonItems(), [
                {
                    id: 'testId1',
                    value: '',
                    textValue: ''
                }, {
                    id: 'testId2',
                    value: 'testValue',
                    textValue: 'textValue4'
                }
            ]);
        });
    });

    it ('loadFilterItemsFromHistory with prefetch', () => {
        const historyItems = [                {
            name: 'testId1',
            value: '',
            textValue: '',
            resetValue: ''
        }, {
            name: 'testId2',
            value: 'testValue',
            textValue: 'textValue4',
            resetValue: ''
        }];
        let itemsLoaded = false;
        const filterController = new ControllerClass({
            filterButtonSource: getFilterButtonItems(),
            searchParam: 'test',
            filter: {},
            searchValue: '',
            minSearchLength: 1,
            parentProperty: '',
            historyId: 'hId2',
            historyItems,
            prefetchParams: {PrefetchSessionId: 'test', PrefetchDataValidUntil: null}
        });
        sandbox.replace(filterController, '_loadHistoryItems', () => {
            itemsLoaded = true;
            return Promise.resolve();
        });
        sandbox.replace(filterController, '_findItemInHistory', () => null);
        return filterController.loadFilterItemsFromHistory().then(() => {
            assert.isTrue(itemsLoaded);
        });
    });

    it('handleDataLoad', () => {
        const controller = new ControllerClass({
            filter: {},
            historyId: 'TEST_HISTORY_ID'
        });
        controller._isFilterChanged = true;

        const addToHistoryStub = sandbox.stub(controller, '_addToHistory');
        sandbox.stub(controller, '_deleteCurrentFilterFromHistory');
        sandbox.replace(Prefetch, 'getPrefetchParamsForSave', () => {});
        sandbox.replace(Prefetch, 'applyPrefetchFromItems', () => {});

        controller.handleDataLoad();
        assert.isFalse(controller._isFilterChanged);
        sinon.assert.calledOnce(addToHistoryStub);
  });

    it('handleDataError', () => {
        const controller = new ControllerClass({
            filter: {},
            historyId: 'TEST_HISTORY_ID'
        });
        controller._isFilterChanged = true;

        const historyItems = {
            data: {
               items: [],
               prefetchParams: {
                  PrefetchSessionId: 'test'
               }
            }
        };

        sandbox.replace(controller, '_getHistoryByItems', () => historyItems);

        controller.handleDataError();
        assert.deepEqual(controller._filter, {PrefetchSessionId: 'test'});
  });

    it('resetPrefetch', () => {
        const controller = new ControllerClass({
            filter: {
                testField: 'testValue',
                PrefetchSessionId: 'test'
            }
        });

         controller.resetPrefetch();
         assert.deepEqual(controller._filter, {testField: 'testValue'});
    });

    it('updateFilterItems', () => {
        const filterController = new ControllerClass({});
        filterController._filterButtonItems = getFilterButtonItems();
        const newFilterItems = [
            {
                id: 'testId1',
                value: 'value1',
                textValue: 'text1'
            }, {
                id: 'testId2',
                value: 'value2',
                textValue: 'text2'
            }
        ];
        filterController.updateFilterItems(newFilterItems);
        assert.deepEqual(filterController.getFilter(), {
            'testId1': 'value1',
            'testId2': 'value2'
        });
        assert.deepEqual(filterController.getFilterButtonItems(), newFilterItems);
    });

    describe('setFilterItems', () => {
        it('save history on data load only with historyItems', () => {
            const controller = new ControllerClass({
                filterButtonSource: [],
                prefetchParams: {
                    PrefetchSessionId: 'test'
                }
            });
            controller.setFilterItems([]);
            assert.isFalse(controller._isFilterChanged);
            controller.setFilterItems([{}]);
            assert.isTrue(controller._isFilterChanged);
        });
    });

    describe('setFilter', () => {
        const controller = new ControllerClass({});

        it('check operations filter', () => {
            const filter = {};
            controller.update({
                filter,
                source: new SbisService({
                    endpoint: {contract: '123'},
                    keyProperty: 'id'
                })
            });
            assert.deepEqual(controller.getFilter(), {});

            const controllerOptions = {...controller._options};
            controllerOptions.selectionViewMode = 'selected';
            controllerOptions.selectedKeys = [1, 2];
            controller.update(controllerOptions as IFilterControllerOptions);
            assert.isTrue('SelectionWithPath' in controller.getFilter());
        });

        it('check search filter in constructor', () => {
            let filterController = new ControllerClass({
                searchParam: 'title',
                searchValue: 'test',
                parentProperty: 'test',
                minSearchLength: 3
            });

            assert.deepEqual(filterController.getFilter(), {
                'Разворот': 'С разворотом',
                'usePages': 'full',
                title: 'test'
            });

            filterController = new ControllerClass({
                searchValue: 'test',
                minSearchLength: 3
            });

            assert.deepEqual(filterController.getFilter(), {});

            filterController = new ControllerClass({
                minSearchLength: 3,
                searchParam: 'title',
                searchValue: 'te'
            });
            assert.deepEqual(filterController.getFilter(), {});
        });

        it('check search filter on update', () => {
            const filterController = new ControllerClass({
                filter: { title: 'test' }
            });
            filterController.update({
                filter: {
                    title: 'test2'
                }
            });

            assert.deepEqual(filterController.getFilter(), { title: 'test2' });

            filterController._options.filter = null;
            filterController.update({
                filter: {
                    title: 'test2'
                },
                searchValue: 'test',
                searchParam: 'search_string',
                minSearchLength: 3
            });

            assert.deepEqual(filterController.getFilter(), { title: 'test2', search_string: 'test' });

            filterController._options.filter = {
                title: 'test2'
            };
            filterController._filter = null;
            // filter options is not changed
            filterController.update({
                filter: {
                    title: 'test2'
                }
            });
            assert.isNull(filterController.getFilter());
        });
    });

    describe('updateHistory', () => {
        let historyItems = null;
        let historyItemDeleted = false;
        const filterController = new ControllerClass({
            filter: {
                PrefetchSessionId: 'testId',
                testFilterFilter: 'testValue'
            },
            prefetchParams: {}
        });

        before(() => {
            sandbox.replace(filterController, '_getHistoryByItems', () => {
                return historyItems;
            });

            sandbox.replace(ControllerClass, '_deleteFromHistory', () => {
                historyItemDeleted = true;
            });
        });

        it('clearPrefetchSession', () => {
            filterController.updateHistory({});
            assert.deepEqual(filterController.getFilter(), { testFilterFilter: 'testValue' });
        });

        it('delete history item', () => {
            historyItems = {
                data: {
                    items: [],
                    prefetchParams: {
                        PrefetchSessionId: 'testId'
                    }
                },
                item: {
                    getId: () => 'test'
                },
                index: 1
            };

            filterController.updateHistory({});

            assert.deepEqual(filterController.getFilter(), {
                PrefetchSessionId: 'testId',
                testFilterFilter: 'testValue'
            });
            assert.isTrue(historyItemDeleted);
        });

        it('update PrefetchParams', () => {
            filterController.setFilter({
                PrefetchSessionId: 'testId',
                testFilterFilter: 'testValue'
            });
            historyItemDeleted = false;

            filterController.updateHistory(historyItems);

            assert.deepEqual(filterController.getFilter(), {
                PrefetchSessionId: 'testId',
                testFilterFilter: 'testValue'
            });
            assert.isFalse(historyItemDeleted);
        });
      });

    describe('getItemsByOptions', () => {
        const items = [{
            id: 'testId',
            value: '',
            resetValue: ''
        }];

        it('items is array', () => {
            const result = ControllerClass._getItemsByOption(items);
            assert.deepEqual(result, items);
            assert.isFalse(result === items);
        });

        it('items if function', function () {
             const returnOptFunc = () => [{
                   id: 'testId',
                   value: '',
                   resetValue: ''
             }];

             const result = ControllerClass._getItemsByOption(returnOptFunc);
             assert.deepEqual(result, items);
        });

        const history = [{
            id: 'testId',
            value: 'testValue',
            resetValue: ''
        }];
        it('items is array, with history', function () {
            const result = ControllerClass._getItemsByOption(items, history);
            assert.deepEqual(result, history);
            assert.isFalse(result === items);
        });

        it('items is function, with history', function () {
            const returnOptFunc = function(history) {
               return [{
                  id: 'testId',
                  value: history[0].value,
                  resetValue: ''
               }];
            };
            const result = ControllerClass._getItemsByOption(returnOptFunc, history);
            assert.deepEqual(result, history);
        });
    });

    describe('minimizeItem', () => {
        let filterButtonItem;
        let expectedMinItem;
        it('item with id', () => {
            filterButtonItem = {
                id: 'testId4',
                value: 'testValue4',
                textValue: 'textValue',
                resetValue: '',
                visibility: true
            };
            expectedMinItem = {
                id: 'testId4',
                value: 'testValue4',
                textValue: 'textValue',
                visibility: true
            };

            const resultItem = ControllerClass._minimizeItem(filterButtonItem);
            assert.deepEqual(resultItem, expectedMinItem);
        });

        it('item with name', () => {
            filterButtonItem = {
                name: 'testId4',
                value: 'testValue4',
                textValue: 'textTextValue',
                resetValue: '',
                visibility: true,
                viewMode: 'basic'
            };
            expectedMinItem = {
                name: 'testId4',
                value: 'testValue4',
                textValue: 'textTextValue',
                visibility: true,
                viewMode: 'basic'
            };

            const resultItem = ControllerClass._minimizeItem(filterButtonItem);
            assert.deepEqual(resultItem, expectedMinItem);
        });
        it('item is reseted', () => {
            filterButtonItem = {
                name: 'testId4',
                value: 'testValue4',
                resetValue: 'testValue4',
                visibility: true,
                viewMode: 'basic'
            };
            expectedMinItem = {
                name: 'testId4',
                visibility: false,
                viewMode: 'basic'
            };
            const resultItem = ControllerClass._minimizeItem(filterButtonItem);
            assert.deepEqual(resultItem, expectedMinItem);
        });

        it('item without textValue', () => {
            filterButtonItem = {
                name: 'testId4',
                value: 'testValue4',
                visibility: true,
                viewMode: 'basic'
            };
            expectedMinItem = {
                name: 'testId4',
                value: 'testValue4',
                visibility: false,
                viewMode: 'basic'
            };
            const resultItem = ControllerClass._minimizeItem(filterButtonItem);
            assert.deepEqual(resultItem, expectedMinItem);
        });
    });
});
