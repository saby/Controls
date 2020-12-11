import {Browser} from 'Controls/browser';
import {Memory} from 'Types/source';
import { RecordSet } from 'Types/collection';
import { detection } from 'Env/Env';
import {assert} from 'chai';

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
        filter: {}
    };
}

function getBrowser(options: object = {}): Browser {
    return new Browser(options);
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

            it('searchValue', async () => {
                let options = getBrowserOptions();
                const browser = getBrowser(options);

                await browser._beforeMount(options);
                assert.ok(browser._searchValue === '');

                options = {...options};
                options.searchValue = 'test';
                await browser._beforeMount(options);
                assert.ok(browser._searchValue === 'test');
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
                return Promise.reject(new Error('testError'));
            };
            const browser = getBrowser(options);

            const result = await browser._beforeMount(options);
            assert.ok(result instanceof Error);
        });

    });

    describe('_beforeUnmount', () => {
        it('_beforeUnmount while sourceController is loading', async () => {
            const options = getBrowserOptions();
            const browser = getBrowser(options);

            await browser._beforeMount(options);

            browser._beforeUnmount();
            assert.ok(!browser._sourceController);
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
            assert.ok(browser._items !== browserItems);
        });

        it('source returns error, then _beforeUpdate', async () => {
            let options = getBrowserOptions();
            const browser = getBrowser();

            options.source.query = () => Promise.reject(new Error('testError'));
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
            options.source.query = () => Promise.reject(new Error('testError'));
            await browser._beforeUpdate(options);
            assert.ok(browser._errorRegister);
        });

    });

    describe('_updateSearchController', () => {
       it('filter changed if search was reset', async () => {
           const options = getBrowserOptions();
           const browser = getBrowser();
           browser.saveOptions({...options, ...{searchParam: 'param'}});

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

           assert.isTrue(notifyStub.withArgs('filterChanged', [{param: ''}]).called);

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
                handleDataLoad: () => {}
            };

            browser._dataLoadCallback(null, 'down');
            assert.equal(actualDirection, 'down');
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
    });

    describe('_afterSearch', () => {
        it('filter updated', async () => {
            const filter = {
                title: 'test'
            };
            const options = getBrowserOptions();
            const browser = getBrowser(options);
            await browser._beforeMount(options);
            browser._sourceController.getState = () => { return {filter}; };
            browser._itemsChanged = () => {};

            browser._afterSearch(null, 'test');
            assert.deepEqual(browser._filter, filter);
        });
    });

    it('_startSearch', async () => {
        const searchController = getBrowser(getBrowserOptions());
        let errorProcessed = false;
        const error = new Error('error');
        error.canceled = true;
        searchController._getSearchController = () => {
            return Promise.resolve({
                search: () => {
                    return Promise.resolve(error);
                }
            });
        };
        searchController._options.dataLoadErrback = () => {
            errorProcessed = true;
        };
        await searchController._startSearch('testValue');
        assert.isFalse(errorProcessed);
    });

});
