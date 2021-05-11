import {Browser} from 'Controls/browser';
import {Memory, PrefetchProxy, DataSet} from 'Types/source';
import { RecordSet } from 'Types/collection';
import { detection } from 'Env/Env';
import {assert} from 'chai';
import * as sinon from 'sinon';
import {SyntheticEvent} from 'UI/Vdom';

const browserData = [
    {
        id: 0,
        name: 'Sasha'
    },
    {
        id: 1,
        name: 'Aleksey'
    },
    {
        id: 2,
        name: 'Dmitry'
    }
];

const browserHierarchyData = [
    {
        key: 0,
        title: 'Интерфейсный фреймворк',
        parent: null
    },
    {
        key: 1,
        title: 'Sasha',
        parent: 0
    },
    {
        key: 2,
        title: 'Dmitry',
        parent: null
    }
];

const eventMock = {
    stopPropagation: () => void 0,
    preventDefault: () => void 0
};

function getBrowserOptions(): object {
    return {
        minSearchLength: 3,
        source: new Memory({
            keyProperty: 'id',
            data: browserData
        }),
        searchParam: 'name',
        filter: {},
        keyProperty: 'id'
    };
}

function getBrowser(options: object = {}): Browser {
    return new Browser(options);
}

async function getBrowserWithMountCall(options: object = {}): Promise<Browser> {
    const brow = getBrowser(options);
    await brow._beforeMount(options);
    brow.saveOptions(options);
    return brow;
}

describe('Controls/browser:Browser', () => {

    describe('_beforeMount', () => {

        describe('init states on beforeMount', () => {

            it('root', async () => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);

                await browser._beforeMount(options);
                assert.ok(browser._root === null);

                options = {...options};
                options.root = 'testRoot';
                await browser._beforeMount(options);
                assert.ok(browser._root === 'testRoot');
            });

            it('viewMode', async () => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);

                await browser._beforeMount(options);
                assert.ok(browser._viewMode === undefined);

                options = {...options};
                options.viewMode = 'table';
                await browser._beforeMount(options);
                assert.ok(browser._viewMode === 'table');
            });

            it('items', async () => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);

                await browser._beforeMount(options);
                assert.ok(browser._items.getCount() === 3);
            });

            it('searchValue/inputSearchValue', async () => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);

                await browser._beforeMount(options);
                assert.ok(browser._searchValue === '');
                assert.ok(browser._inputSearchValue === '');

                options = {...options};
                options.searchValue = 'test';
                await browser._beforeMount(options);
                assert.ok(browser._searchValue === 'test');
                assert.ok(browser._inputSearchValue === 'test');
                assert.ok(browser._viewMode === 'search');
            });

            it('source returns error', async () => {
                const options = getBrowserOptions();
                options.source.query = () => {
                    const error = new Error();
                    error.processed = true;
                    return Promise.reject(error);
                };
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                assert.ok(browser._contextState.source === options.source);
            });

            it('_beforeMount with receivedState and dataLoadCallback', async () => {
                const receivedState = {
                   data: new RecordSet(),
                   historyItems: [
                       {
                           name: 'filterField',
                           value: 'filterValue',
                           textValue: 'filterTextValue'
                       }
                   ]
                };
                const options = getBrowserOptions();
                let dataLoadCallbackCalled = false;

                options.filterButtonSource = [
                    {
                        name: 'filterField',
                        value: '',
                        textValue: ''
                    }
                ];
                options.dataLoadCallback = () => {
                    dataLoadCallbackCalled = true;
                };
                options.filter = {};
                const browser = getBrowser(options);
                await browser._beforeMount(options, {}, [receivedState]);
                browser.saveOptions(options);

                assert.ok(dataLoadCallbackCalled);
                assert.deepStrictEqual(browser._filter, {filterField: 'filterValue'});
            });

            it('_beforeMount without receivedState and historyItems in options', async () => {
                const options = getBrowserOptions();
                options.filterButtonSource = [{
                    name: 'filterField',
                    value: '',
                    textValue: ''
                }];
                options.historyItems = [{
                    name: 'filterField',
                    value: 'historyValue'
                }];
                options.filter = {};
                const browser = getBrowser(options);
                await browser._beforeMount(options, {});
                browser.saveOptions(options);
                assert.deepStrictEqual(browser._filter, {filterField: 'historyValue'});
            });

            describe('init expandedItems', () => {
                it('with receivedState', async () => {
                    const receivedState = {
                        data: new RecordSet(),
                        historyItems: []
                    };
                    const options = getBrowserOptions();
                    options.expandedItems = [1];
                    const browser = getBrowser(options);
                    await browser._beforeMount(options, {}, [receivedState]);
                    assert.deepEqual(browser._contextState.expandedItems, [1]);
                    assert.deepEqual(browser._getSourceController().getExpandedItems(), [1]);
                });

                it('without receivedState', async () => {
                    const options = getBrowserOptions();
                    options.expandedItems = [1];
                    const browser = getBrowser(options);
                    await browser._beforeMount(options, {}, []);
                    assert.deepEqual(browser._contextState.expandedItems, [1]);
                    assert.deepEqual(browser._getSourceController().getExpandedItems(), [1]);
                });
            });
        });

        describe('searchController', () => {

            describe('searchValue on _beforeMount', () => {

                it('searchValue is longer then minSearchLength', () => {
                    const options = getBrowserOptions();
                    options.searchValue = 'Sash';
                    const browser = getBrowser(options);
                    return new Promise((resolve) => {
                        browser._beforeMount(options, {}).then(() => {
                            assert.equal(browser._searchValue, 'Sash');
                            resolve();
                        });
                    });
                });

                it('filter in context without source on _beforeMount', async () => {
                    const options = getBrowserOptions();
                    const filter = {
                        testField: 'testValue'
                    };
                    options.source = null;
                    options.filter = filter;

                    const browser = getBrowser(options);
                    await browser._beforeMount(options, {});
                    assert.deepStrictEqual(browser._contextState.filter, filter);
                    assert.deepStrictEqual(browser._filter, filter);
                });

                it('filterButtonSource and filter in context without source on _beforeMount', async () => {
                    const options = getBrowserOptions();
                    const filter = {
                        testField: 'testValue'
                    };
                    options.source = null;
                    options.filter = filter;
                    options.filterButtonSource = [{
                        id: 'testField2',
                        value: 'testValue2'
                    }];

                    const expectedFilter = {
                        testField: 'testValue',
                        testField2: 'testValue2'
                    };

                    const browser = getBrowser(options);
                    await browser._beforeMount(options, {});
                    assert.deepStrictEqual(browser._contextState.filter, expectedFilter);
                    assert.deepStrictEqual(browser._filter, expectedFilter);
                });

            });

            describe('search', () => {
                it('search query returns error', async () => {
                    let dataErrorProcessed = false;
                    let propagationStopped = false;
                    let eventMock = {
                        stopPropagation: () => {
                            propagationStopped = true;
                        }
                    };
                    const options = {...getBrowserOptions(), dataLoadErrback: () => {
                            dataErrorProcessed = true;
                        }
                    };
                    const browser = getBrowser(options);
                    await browser._beforeMount(options, {});
                    browser.saveOptions(options);
                    options.source.query = () => {
                        const error = new Error();
                        error.processed = true;
                        return Promise.reject(error);
                    };

                    await browser._search(eventMock, 'test');
                    assert.isTrue(dataErrorProcessed);
                    assert.isTrue(propagationStopped);
                    assert.isFalse(browser._loading);
                    assert.deepStrictEqual(browser._filter, {name: 'test'});
                    assert.ok(browser._searchValue === 'test');
                });

                it('double search call will create searchController once', async () => {
                    const browserOptions = getBrowserOptions();
                    const browser = getBrowser(browserOptions);
                    await browser._beforeMount(browserOptions);
                    browser.saveOptions(browserOptions);

                    const searchControllerCreatedPromise1 = browser._getSearchController(browserOptions);
                    const searchControllerCreatedPromise2 = browser._getSearchController(browserOptions);

                    const searchController1 = await searchControllerCreatedPromise1;
                    const searchController2 = await searchControllerCreatedPromise2;
                    assert.isTrue(searchController1 === searchController2);
                });
                it('loading state on search', async () => {
                    const browserOptions = getBrowserOptions();
                    const browser = getBrowser(browserOptions);
                    await browser._beforeMount(browserOptions);
                    browser.saveOptions(browserOptions);
                    const searchPromise = browser._search(null, 'test');
                    assert.ok(browser._loading);
                    await searchPromise;
                    assert.ok(!browser._loading);
                    assert.ok(browser._searchValue === 'test');

                    // search with same value
                    searchPromise = browser._search(null, 'test');
                    assert.ok(browser._loading);
                    await searchPromise;
                    assert.ok(!browser._loading);
                });

                it('empty searchParam in options', async () => {
                    const browserOptions = getBrowserOptions();
                    delete browserOptions.searchParam;
                    const browser = getBrowser(browserOptions);
                    await browser._beforeMount(browserOptions);
                    browser.saveOptions(browserOptions);
                    const searchPromise = browser._search(null, 'test');
                    assert.ok(!browser._loading);
                    await searchPromise;
                    assert.ok(!browser._loading);
                });
            });

            describe('_searchReset', () => {
                it('_searchReset while loading', async () => {
                    const options = getBrowserOptions();
                    const browser = getBrowser(options);
                    await browser._beforeMount(options);
                    browser.saveOptions(options);

                    const sourceController = browser._getSourceController();
                    sourceController.reload();
                    browser._searchResetHandler();
                    assert.ok(!sourceController.isLoading());
                });

                it('_searchReset with startingWith === "current"', async () => {
                    const options = getBrowserOptions();
                    options.startingWith = 'current';
                    options.root = 'testRoot';
                    options.source.query = (query) => {
                        const recordSet = new RecordSet();
                        recordSet.setMetaData({
                            path: new RecordSet({
                                rawData: [
                                    {
                                        id: query.getWhere()[options.parentProperty]
                                    }
                                ]
                            })
                        });
                        return Promise.resolve(recordSet);
                    };
                    const browser = getBrowser(options);
                    await browser._beforeMount(options);
                    browser.saveOptions(options);

                    await browser._search(eventMock, 'testSearchValue');
                    assert.ok(browser._root === 'testRoot');

                    await browser._searchResetHandler();
                    assert.ok(browser._root === 'testRoot');
                });
            });
        });

        describe('init shadow visibility', () => {
            const recordSet = new RecordSet({
                rawData: [{id: 1}],
                keyProperty: 'id',
                metaData: {
                    more: {
                        before: true,
                        after: true
                    }
                }
            });

            const options = getBrowserOptions();

            let browser;

            let defaultIsMobilePlatformValue;

            beforeEach(() => {
                defaultIsMobilePlatformValue = detection.isMobilePlatform;
            });

            afterEach(() => {
                detection.isMobilePlatform = defaultIsMobilePlatformValue;
            });

            it('items in receivedState', () => {
                const newOptions = {
                    ...options,
                    topShadowVisibility: 'auto',
                    bottomShadowVisibility: 'auto'
                };

                browser = new Browser(newOptions);
                browser._beforeMount(newOptions, {}, [{data: recordSet, historyItems: [] }]);
                assert.equal(browser._topShadowVisibility, 'gridauto');
                assert.equal(browser._bottomShadowVisibility, 'gridauto');

                detection.isMobilePlatform = true;

                browser = new Browser(newOptions);
                browser._beforeMount(newOptions, {}, [{data: recordSet, historyItems: [] }]);
                assert.equal(browser._topShadowVisibility, 'auto');
                assert.equal(browser._bottomShadowVisibility, 'auto');
            });
        });

        it('source returns error', async () => {
            const options = getBrowserOptions();
            options.source.query = () => {
                const error = new Error('testError');
                error.processed = true;
                return Promise.reject(error);
            };
            const browser = getBrowser(options);

            const result = await browser._beforeMount(options);
            assert.ok(result instanceof Error);
        });

        it('source as prefetchProxy', async () => {
           const options = getBrowserOptions();
           const source = options.source;
           options.source = new PrefetchProxy({
               target: source,
               data: {
                   query: new DataSet()
               }
           });
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            assert.ok(browser._source === options.source);
        });

        it('source as prefetchProxy and with receivedState', async () => {
            const options = getBrowserOptions();
            const receivedState = {
                data: new RecordSet(),
                historyItems: [
                    {
                        name: 'filterField',
                        value: 'filterValue',
                        textValue: 'filterTextValue'
                    }
                ]
            };
            const source = options.source;
            options.source = new PrefetchProxy({
                target: source,
                data: {
                    query: new DataSet()
                }
            });
            const browser = getBrowser(options);
            await browser._beforeMount(options, {}, [receivedState]);
            assert.ok(browser._source === source);
        });

    });

    describe('_beforeUpdate', () => {

        describe('searchController', () => {

            it('filter in searchController updated', async () => {
                const options = getBrowserOptions();
                const filter = {
                    testField: 'newFilterValue'
                };
                options.filter = filter;
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser._filter = {
                    testField: 'oldFilterValue'
                };
                browser._options.source = options.source;
                browser._getSourceController().updateOptions = () => true;
                const searchController = await browser._getSearchController(browser._options);
                options.searchValue = 'oldFilterValue';
                await browser._beforeUpdate(options);
                assert.deepStrictEqual(searchController._options.filter, filter);
            });

            it('filter and source are updated, searchValue is cleared', async () => {
                let options = getBrowserOptions();

                options.filter = { testField: 'filterValue' };
                options.searchValue = 'searchValue';
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);
                await browser._getSearchController();

                options = {...options};
                options.filter = { testField: 'newFilterValue' };
                options.searchValue = '';
                options.source = new Memory();
                const sandBox = sinon.createSandbox();
                const notifyStub = sandBox.stub(browser, '_notify');
                await browser._beforeUpdate(options);

                assert.ok(notifyStub.calledWith('filterChanged', [{ testField: 'newFilterValue' }]));
                sandBox.restore();
            });

            it('searchParam is changed', async () => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);
                await browser._getSearchController();

                options = {...options};
                options.searchParam = 'newSearchParam';
                await browser._beforeUpdate(options);
                assert.ok(browser._getSearchControllerSync()._options.searchParam === 'newSearchParam');
            });

            it('update with searchValue', async () => {
                let options = getBrowserOptions();
                const filter = {
                    testField: 'newFilterValue'
                };
                options.filter = filter;
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);

                options = {...options};
                options.filter = {};
                options.searchValue = 'test';
                browser._beforeUpdate(options);
                assert.deepStrictEqual(browser._filter.name, 'test');
            });

            it('update source and searchValue should reset inputSearchValue', async () => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);

                await browser._search(null, 'testSearchValue');
                options.searchValue = 'testSearchValue';
                browser.saveOptions(options);
                assert.ok(browser._inputSearchValue === 'testSearchValue');
                assert.deepStrictEqual(browser._filter, {name: 'testSearchValue'});

                options = {...options};
                options.source = new Memory();
                options.searchValue = '';
                browser._beforeUpdate(options);
                assert.ok(!browser._inputSearchValue);
                assert.deepStrictEqual(browser._filter, {});
            });

            it('update source and reset searchValue', async () => {
                let options = getBrowserOptions();
                options.searchValue = 'testSearchValue';
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);
                await browser._getSearchController(options);

                assert.ok(browser._searchValue === 'testSearchValue');
                assert.ok(browser._inputSearchValue === 'testSearchValue');
                assert.ok(browser._filter.name === 'testSearchValue');

                options = {...options};
                options.source = new Memory();
                options.searchValue = '';
                browser._beforeUpdate(options);
                assert.ok(!browser._inputSearchValue);
                assert.ok(!browser._filter.name);
            });

            it('cancel query while searching', async () => {
                const options = getBrowserOptions();
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);

                browser._search(null, 'testSearchValue');
                await browser._getSearchController(options);
                assert.ok(browser._loading);

                browser._dataLoader.getSourceController().cancelLoading();
                assert.ok(browser._loading);
            });

        });

        describe('operationsController', () => {

            it('listMarkedKey is updated by markedKey in options', async () => {
                const options = getBrowserOptions();
                options.markedKey = 'testMarkedKey';
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser._beforeUpdate(options);
                assert.deepStrictEqual(browser._operationsController._savedListMarkedKey, 'testMarkedKey');

                options.markedKey = undefined;
                browser._beforeUpdate(options);
                assert.deepStrictEqual(browser._operationsController._savedListMarkedKey, 'testMarkedKey');
            });

        });

        describe('sourceController', () => {
            it('update expandedItems', async () => {
                const options = getBrowserOptions();
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser._beforeUpdate({...options, expandedItems: [1]});
                assert.deepEqual(browser._getSourceController().getExpandedItems(), [1]);
            });
        });

        it('update source', async () => {
            let options = getBrowserOptions();
            const browser = getBrowser();

            await browser._beforeMount(options);

            options = {...options};
            options.source = new Memory({
                data: browserHierarchyData,
                keyProperty: 'key'
            });
            const browserItems = browser._items;

            await browser._beforeUpdate(options);
            assert.ok(browser._items.at(0).get('title') === 'Интерфейсный фреймворк');
        });

        it('update source while loading', async () => {
            let options = getBrowserOptions();
            const browser = getBrowser();
            const errorStub = sinon.stub(browser, '_onDataError');

            await browser._beforeMount(options);

            options = {...options};
            options.source = new Memory({
                data: browserHierarchyData,
                keyProperty: 'key'
            });
            browser._beforeUpdate(options);

            options.source = new Memory({
                data: browserHierarchyData,
                keyProperty: 'key'
            });
            await browser._beforeUpdate(options);

            assert.ok(errorStub.notCalled);
        });

        it('source returns error, then _beforeUpdate', async () => {
            let options = getBrowserOptions();
            const browser = getBrowser();

            options.source.query = () => {
                const error = new Error();
                error.processed = true;
                return Promise.reject(error);
            };
            await browser._beforeMount(options);

            function update() {
                browser._beforeUpdate(options);
            }
            options = {...options};
            assert.doesNotThrow(update);
        });

        it('new source in beforeUpdate returns error', async () => {
            let options = getBrowserOptions();
            const browser = getBrowser();

            await browser._beforeMount(options);

            options = {...options};
            options.source = new Memory();
            options.source.query = () => {
                const error = new Error();
                error.processed = true;
                return Promise.reject(error);
            };
            await browser._beforeUpdate(options);
            assert.ok(browser._errorRegister);
        });

        it('beforeUpdate without source', async () => {
            let options = getBrowserOptions();
            const browser = getBrowser();

            await browser._beforeMount(options);

            options = {...options};
            delete options.source;
            options.filter = {newFilterField: 'newFilterValue'};

            await browser._beforeUpdate(options);
            assert.deepStrictEqual(browser._filter, {newFilterField: 'newFilterValue'});
        });

        it('if searchValue is empty, then the same field i filter must be reset', async () => {
            const sandbox = sinon.createSandbox();
            const browser = getBrowser();
            const filter = {
                payload: 'something'
            };
            let options = {...getBrowserOptions(), searchValue: '123', filter};
            await browser._beforeMount(options);
            browser.saveOptions(options);

            const sourceController = browser._getSourceController();
            sourceController.setFilter({...filter, name: 'test123'});
            const filterChangedStub = sandbox.stub(browser, '_filterChanged');

            options = {...options};
            options.searchValue = '';

            await browser._beforeUpdate(options);
            assert.isTrue(filterChangedStub.withArgs( null, {payload: 'something'}).calledOnce);
            sandbox.restore();
        });

        it('update viewMode', async () => {
            const sandbox = sinon.createSandbox();
            let options = getBrowserOptions();
            const browser = getBrowser();

            options.viewMode = 'table';
            await browser._beforeMount(options);
            browser.saveOptions(options);

            assert.equal(browser._viewMode, 'table');

            options = {...options, viewMode: 'tile'};
            browser._beforeUpdate(options);

            assert.equal(browser._viewMode, 'tile');
        });

        it('update expanded items in context', async () => {
            const options = getBrowserOptions();
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser._beforeUpdate({...options, expandedItems: [1]});
            assert.deepEqual(browser._contextState.expandedItems, [1]);
        });
    });

    describe('_updateSearchController', () => {
       it('filter changed if search was reset', async () => {
           let options = getBrowserOptions();
           options = {
               ...options,
               searchParam: 'param',
               searchValue: 'testSearchValue',
               filter: {
                   payload: 'something'
               }
           };
           const browser = getBrowser(options);
           await browser._beforeMount(options);
           browser.saveOptions(options);

           const notifyStub = sinon.stub(browser, '_notify');

           options = {...options};
           options.searchValue = '';
           options.searchParam = 'param';
           await browser._updateSearchController(options);

           assert.isTrue(notifyStub.withArgs('filterChanged', [{payload: 'something'}]).called);
           assert.equal(browser._searchValue, '');

           notifyStub.restore();
       });
    });

    describe('_update', () => {
       it('update without source in options', async () => {
           const options = getBrowserOptions();
           const browser = getBrowser(options);
           await browser._beforeMount(options);
           browser.saveOptions(options);
           const notifyStub = sinon.stub(browser, '_reload');
           const newOptions = {...options};
           newOptions.searchParam = 'param';
           await browser._update(options, newOptions);

           assert.isFalse(notifyStub.withArgs('filterChanged', [{payload: 'something'}]).called);

           notifyStub.restore();
       });
    });

    describe('_dataLoadCallback', () => {
        it('check direction', async () => {
            let actualDirection = null;
            const options = getBrowserOptions();
            options.dataLoadCallback = (items, direction) => {
                actualDirection = direction;
            };
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);
            browser._dataLoadCallback(null, 'down');
            assert.equal(actualDirection, 'down');
        });

        it('search view mode changed on dataLoadCallback', async () => {
            const options = getBrowserOptions();
            options.searchValue = 'Sash';
            const browser = await getBrowserWithMountCall(options);

            browser._viewMode = 'search';
            browser._dataLoadCallback(new RecordSet());
            assert.ok(browser._searchValue === 'Sash');

            browser._searchValue = '';
            browser._dataLoadCallback(new RecordSet());
            assert.isUndefined(browser._viewMode);
            assert.ok(browser._misspellValue === '');
        });

        it('misspellValue after search', async () => {
            let options = getBrowserOptions();
            const searchQueryMock = () => {
                const dataSet = new DataSet({
                    rawData: {
                        meta: {
                            returnSwitched: true,
                            switchedStr: 'Саша'
                        }
                    },
                    metaProperty: 'meta'
                });
                return Promise.resolve(dataSet);
            };
            const browser = new Browser();
            await browser._beforeMount(options);
            browser.saveOptions(options);

            options = {...options};
            options.searchValue = 'Cfif';
            options.source.query = searchQueryMock;
            await browser._beforeUpdate(options);
            assert.ok(browser._misspellValue === 'Саша');
        });

        it('path is updated in searchController after load', async () => {
            const options = getBrowserOptions();
            const path = new RecordSet({
                rawData: [
                    {id: 1, title: 'folder'}
                ]
            });
            options.source.query = () => {
                const recordSet = new RecordSet();
                recordSet.setMetaData({path});
                return Promise.resolve(recordSet);
            };
            const browser = await getBrowserWithMountCall(options);
            await browser._getSearchController();
            await browser._reload(options);
            assert.ok(browser._getSearchControllerSync()._path === path);
        });
    });

    describe('_handleItemOpen', () => {
       it ('root is changed synchronously', async () => {
           const options = getBrowserOptions();
           const browser = getBrowser(options);
           await browser._beforeMount(options);
           browser.saveOptions(options);
           await browser._getSearchController();

           browser._handleItemOpen('test123', undefined, 'test123');

           assert.equal(browser._root, 'test123');
           assert.equal(browser._getSearchControllerSync()._root, 'test123');
       });

       it('root changed, browser is in search mode', async () => {
           const options = getBrowserOptions();
           options.parentProperty = 'parentProperty';
           const browser = getBrowser(options);
           await browser._beforeMount(options);
           browser.saveOptions(options);
           await browser._search(null, 'testSearchValue');

           browser._handleItemOpen('testRoot', undefined, null);
           assert.ok(!browser._inputSearchValue);
           assert.equal(browser._root, 'testRoot');
           assert.deepStrictEqual(browser._filter, {parentProperty: null});
       });

       it ('root is changed, shearchController is not created', async () => {
            const options = getBrowserOptions();
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);
            browser._handleItemOpen('test123', undefined, 'test123');

            assert.equal(browser._root, 'test123');
        });

       it ('root is in options', async () => {
            const options = {...getBrowserOptions(), root: 'testRoot'};
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);
            await browser._getSearchController();
            browser._handleItemOpen('test123', undefined, 'test123');

            assert.equal(browser._root, 'testRoot');
        });
    });

    describe('_afterSearch', () => {
        it('filter updated', async () => {
            const filter = {
                title: 'test'
            };
            const resultFilter = {
                title: 'test',
                testSearchParam: 'test'
            };
            const options = {...getBrowserOptions(), searchParam: 'testSearchParam', searchValue: 'testSearchValue', filter};
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);
            await browser._search(null, 'test');

            assert.deepEqual(browser._filter, resultFilter);
            assert.deepEqual(browser._sourceControllerState.filter, resultFilter);
        });
    });

    it('resetPrefetch', async () => {
        const filter = {
            testField: 'testValue',
            PrefetchSessionId: 'test'
        };
        await import('Controls/filter');
        let options = {...getBrowserOptions(), filter};
        const browser = getBrowser(options);
        await browser._beforeMount(options);
        browser.saveOptions(options);

        options = {...options};
        options.source = new Memory();
        const loadPromise = browser._beforeUpdate(options);

        browser.resetPrefetch();
        assert.ok(!!browser._filter.PrefetchSessionId);

        await loadPromise;
        browser.resetPrefetch();
        assert.ok(!browser._filter.PrefetchSessionId);
    });

});
