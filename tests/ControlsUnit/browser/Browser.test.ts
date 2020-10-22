import {Browser} from 'Controls/browser';
import {Memory} from 'Types/source';
import {equal, deepStrictEqual, ok} from 'assert';
import { RecordSet } from 'Types/collection';
import { detection } from 'Env/Env';

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

        describe('searchController', () => {

            describe('searchValue on _beforeMount', () => {

                it('searchValue is longer then minSearchLength', () => {
                    const options = getBrowserOptions();
                    options.searchValue = 'Sash';
                    const browser = getBrowser(options);
                    return new Promise((resolve) => {
                        browser._beforeMount(options, {}).then(() => {
                            equal(browser._searchValue, 'Sash');
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
                    deepStrictEqual(browser._dataOptionsContext.filter, filter);
                    deepStrictEqual(browser._filter, filter);
                    deepStrictEqual(browser._searchController._dataOptions.filter, filter);
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
                    deepStrictEqual(browser._dataOptionsContext.filter, expectedFilter);
                    deepStrictEqual(browser._filter, expectedFilter);
                    deepStrictEqual(browser._searchController._dataOptions.filter, expectedFilter);
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
            })

            afterEach(() => {
                detection.isMobilePlatform = defaultIsMobilePlatformValue;
            })

            it('items in receivedState',() => {
                const newOptions = {
                    ...options,
                    topShadowVisibility: 'auto',
                    bottomShadowVisibility: 'auto',
                }

                browser = new Browser(newOptions)
                browser._beforeMount(newOptions, {}, {items: recordSet, filterItems: {} });
                equal(browser._topShadowVisibility, 'visible');
                equal(browser._bottomShadowVisibility, 'visible');

                equal(browser._topShadowVisibilityFromOptions, 'auto');
                equal(browser._bottomShadowVisibilityFromOptions, 'auto');

                detection.isMobilePlatform = true;

                browser = new Browser(newOptions)
                browser._beforeMount(newOptions, {}, {items: recordSet, filterItems: {} });
                equal(browser._topShadowVisibility, 'auto');
                equal(browser._bottomShadowVisibility, 'auto');
            });
        });

        it('source returns error', async () => {
            const options = getBrowserOptions();
            options.source.query = () => {
                return Promise.reject(new Error('testError'));
            };
            const browser = getBrowser(options);

            const mountResult = await browser._beforeMount(options);
            ok(mountResult instanceof Error);
        });

    });

    describe('_beforeUnmount', () => {
        it('_beforeUnmount while sourceController is loading', async () => {
            const options = getBrowserOptions();
            const browser = getBrowser(options);

            await browser._beforeMount(options);

            browser._beforeUnmount();
            ok(!browser._sourceController);
        });
    });

    describe('_beforeUnmount', () => {
        it('_beforeUnmount while sourceController is loading', async () => {
            const options = getBrowserOptions();
            const browser = getBrowser(options);

            await browser._beforeMount(options);

            browser._beforeUnmount();
            ok(!browser._sourceController);
        });
    });

    describe('_beforeUpdate', () => {

        describe('searchController', () => {

            it('context in searchController updated', async () => {
                const options = getBrowserOptions();
                const filter = {
                    testField: 'testValue'
                };
                options.filter = filter;
                const browser = getBrowser(options);
                await browser._beforeMount(options);

                browser._beforeUpdate(options);
                deepStrictEqual(browser._searchController._dataOptions.filter, filter);
            });

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
                browser._beforeUpdate(options);
                deepStrictEqual(browser._searchController._options.filter, filter);
            });

        });

        describe('operationsController', () => {

            it('listMarkedKey is updated by markedKey in options', async () => {
                const options = getBrowserOptions();
                options.markedKey = 'testMarkedKey';
                const browser = getBrowser(options);
                await browser._beforeMount(options);
                browser._beforeUpdate(options);
                deepStrictEqual(browser._operationsController._savedListMarkedKey, 'testMarkedKey');

                options.markedKey = undefined;
                browser._beforeUpdate(options);
                deepStrictEqual(browser._operationsController._savedListMarkedKey, 'testMarkedKey');
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
            ok(browser._items !== browserItems);
        });

    });

});
