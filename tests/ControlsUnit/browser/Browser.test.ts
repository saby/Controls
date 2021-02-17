import {Browser} from 'Controls/browser';
import {Memory} from 'Types/source';
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

            it('viewMode', async() => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);

                await browser._beforeMount(options);
                assert.ok(browser._viewMode === undefined);

                options = {...options};
                options.viewMode = 'table';
                await browser._beforeMount(options);
                assert.ok(browser._viewMode === 'table');
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
                let options = getBrowserOptions();
                options.source.query = () => {
                    const error = new Error();
                    error.processed = true;
                    return Promise.reject(error);
                };
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                assert.ok(browser._dataOptionsContext.source === options.source);
            });

            it('_beforeMount with receivedState and dataLoadCallback', async () => {
                const receivedState = {
                   items: new RecordSet(),
                   filterItems: [
                       {
                           name: 'filterField',
                           value: 'filterValue',
                           textValue: 'filterTextValue'
                       }
                   ]
                };
                let options = getBrowserOptions();
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
                await browser._beforeMount(options, {}, receivedState);
                browser.saveOptions(options);

                assert.ok(dataLoadCallbackCalled);
                assert.deepStrictEqual(browser._filter, {filterField: 'filterValue'});
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
                    assert.deepStrictEqual(browser._dataOptionsContext.filter, filter);
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
                    assert.deepStrictEqual(browser._dataOptionsContext.filter, expectedFilter);
                    assert.deepStrictEqual(browser._filter, expectedFilter);
                });

            });

            describe('search', () => {
                it('search query returns error', async () => {
                    let dataErrorProcessed = false;
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

                    await browser._search({}, 'test');
                    assert.isTrue(dataErrorProcessed);
                    assert.isFalse(browser._loading);
                    assert.deepStrictEqual(browser._filter, {name: 'test'});
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
                    const searchPromise = browser._search({}, 'test');
                    assert.ok(browser._loading);
                    await searchPromise;
                    assert.ok(!browser._loading);
                    assert.ok(browser._searchValue === 'test');

                    //search with same value
                    searchPromise = browser._search({}, 'test');
                    assert.ok(browser._loading);
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

                    browser._sourceController.reload();
                    browser._searchReset({} as SyntheticEvent);
                    assert.ok(!browser._sourceController.isLoading());
                });

                it('_searchReset with startingWith === "current"', async () => {
                    const options = getBrowserOptions();
                    options.startingWith = 'current';
                    const browser = getBrowser(options);
                    await browser._beforeMount(options);
                    browser.saveOptions(options);

                    browser._rootBeforeSearch = 'testRoot';
                    await browser._searchReset({} as SyntheticEvent);
                    assert.isNull(browser._rootBeforeSearch);
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
                browser._beforeMount(newOptions, {}, {items: recordSet, filterItems: {} });
                assert.equal(browser._topShadowVisibility, 'gridauto');
                assert.equal(browser._bottomShadowVisibility, 'gridauto');

                detection.isMobilePlatform = true;

                browser = new Browser(newOptions);
                browser._beforeMount(newOptions, {}, {items: recordSet, filterItems: {} });
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

    });

    describe('_beforeUnmount', () => {
        const options = getBrowserOptions();
        it('_beforeUnmount while sourceController is loading', async () => {
            const browser = getBrowser(options);

            await browser._beforeMount(options);

            browser._beforeUnmount();
            assert.ok(!browser._sourceController);
        });

        it('_beforeUnmount with undefined viewMode', () => {
            let searchControllerReseted = false;
            const browser = getBrowser(options);
            browser._searchController = {
                reset: () => {
                    searchControllerReseted = true;
                }
            };
            browser._beforeUnmount();
            assert.isFalse(searchControllerReseted);
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
                browser._sourceController.updateOptions = () => { return true; };
                await browser._getSearchController(browser._options);
                options.searchValue = 'oldFilterValue';
                await browser._beforeUpdate(options);
                assert.deepStrictEqual(browser._searchController._options.filter, filter);
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
                assert.ok(browser._searchController._options.searchParam === 'newSearchParam');
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

            it('update source without new searchValue should reset inputSearchValue', async () => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser.saveOptions(options);

                await browser._search({}, 'testSearchValue');
                assert.ok(browser._inputSearchValue === 'testSearchValue');

                options = {...options};
                options.source = new Memory();
                browser._beforeUpdate(options);
                assert.ok(!browser._inputSearchValue);
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
                browser._beforeUpdate(options)
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

        it('if searchValue is empty, then the same field i filter must be reset', async () => {
            const sandbox = sinon.createSandbox();
            const browser = getBrowser();
            const filter = {
                payload: 'something'
            };
            let options = {...getBrowserOptions(), searchValue: '123', filter};
            browser.saveOptions(options);

            await browser._beforeMount(options);
            browser.saveOptions(options);

            const sourceController = browser._getSourceController(options);
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

    });

    describe('_updateSearchController', () => {
       it('filter changed if search was reset', async () => {
           const options = getBrowserOptions();
           const browser = getBrowser();
           browser.saveOptions({
               ...options,
               searchParam: 'param',
               filter: {
                   payload: 'something'
               }
           });

           let buf;
           browser._filterController = {
               setFilter: (filter) => buf = filter,
               getFilter: () => buf
           };
           browser._updateContext = () => {};
           browser._dataOptionsContext = {
               updateConsumers: () => {}
           };
           const notifyStub = sinon.stub(browser, '_notify');

           await browser._updateSearchController({
               searchValue: '',
               searchParam: 'param'
           });

           assert.isTrue(notifyStub.withArgs('filterChanged', [{payload: 'something'}]).called);
           assert.equal(browser._searchValue, '');

           notifyStub.restore();
       });
    });

    describe('_itemsChanged', () => {

        it('itemsChanged, items with new format', async () => {
            const options = getBrowserOptions();
            const browser = getBrowser(options);

            await browser._beforeMount(options);

            browser._items = new RecordSet({
                rawData: {
                    _type: 'recordset',
                    d: [],
                    s: [{ n: 'key', t: 'Строка' }]
                },
                keyProperty: 'key',
                adapter: 'adapter.sbis'
            });

            const newItems = new RecordSet({
                rawData: {
                    _type: 'recordset',
                    d: [],
                    s: [{ n: 'key', t: 'Строка' }, { n: 'newKey', t: 'Строка' }]
                },
                keyProperty: 'key',
                adapter: 'adapter.sbis'
            });

            browser._itemsChanged(null, newItems);
            assert.deepStrictEqual(browser._items.getRawData(), newItems.getRawData());
        });

    });

    describe('_dataLoadCallback', () => {
        it('check direction', () => {
            let actualDirection = null;
            const options = getBrowserOptions();

            const browser = getBrowser(options);
            browser._options.dataLoadCallback = (items, direction) => {
                actualDirection = direction;
            };
            browser._filterController = {
                handleDataLoad: () => {}
            };
            browser._searchController = {
                handleDataLoad: () => {},
                isSearchInProcess: () => true,
                getSearchValue: () => 'searchValue'
            };

            browser._dataLoadCallback(null, 'down');
            assert.equal(actualDirection, 'down');
        });

        it('search view mode changed on dataLoadCallback', async () => {
            const options = getBrowserOptions();
            options.searchValue = 'Sash';
            const browser = await getBrowserWithMountCall(options);

            browser._viewMode = 'search';
            browser._searchValue = '';

            browser._dataLoadCallback(new RecordSet());
            assert.isUndefined(browser._viewMode);
            assert.isNull(browser._rootBeforeSearch);
            assert.isEmpty(browser._misspellValue);
        });

        it('path is updated in searchController after load', async () => {
            const options = getBrowserOptions();
            const browser = await getBrowserWithMountCall(options);
            await browser._getSearchController();
            const recordset = new RecordSet();
            const path = new RecordSet({
                rawData: [
                    {id: 1, title: 'folder'}
                ]
            });
            recordset.setMetaData({path});
            browser._dataLoadCallback(recordset);
            assert.ok(browser._searchController._path === path);
            assert.ok(browser._path === path);
        });
    });

    describe('_handleItemOpen', () => {
       it ('root is changed synchronously', async () => {
           const options = getBrowserOptions();
           const browser = getBrowser(options);

           browser._searchController = await browser._getSearchController();

           browser._handleItemOpen('test123', undefined, 'test123');

           assert.equal(browser._root, 'test123');
           assert.equal(browser._searchController._root, 'test123');
       });

        it ('root is changed, shearchController is not created', async () => {
            const options = getBrowserOptions();
            const browser = getBrowser(options);

            browser._handleItemOpen('test123', undefined, 'test123');

            assert.equal(browser._root, 'test123');
        });

        it ('root is in options', async () => {
            const options = {...getBrowserOptions(), root: 'testRoot'};
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser.saveOptions(options);
            browser._searchController = await browser._getSearchController();
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
                testSearchParam: 'testSearchValue'
            };
            const options = {...getBrowserOptions(), searchParam: 'testSearchParam', searchValue: 'testSearchValue', filter};
            const browser = getBrowser(options);
            const sandbox = sinon.createSandbox();
            const notifyStub = sandbox.stub(browser, '_notify');
            await browser._beforeMount(options);
            browser.saveOptions(options);
            await browser._getSearchController();

            browser._afterSearch(new RecordSet(), 'test');
            assert.deepEqual(browser._filter, resultFilter);
            assert.isTrue(notifyStub.calledWith('filterChanged', [resultFilter]));
        });
    });

});
