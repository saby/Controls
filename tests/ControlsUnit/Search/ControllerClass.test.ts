import {ControllerClass} from 'Controls/search';
import {Memory} from 'Types/source';
import {assert} from 'chai';
import {createSandbox, assert as sinonAssert} from 'sinon';

function getMemorySource(): Memory {
    return new Memory({
        data: [
            {
                id: 0,
                title: 'test'
            },
            {
                id: 1,
                title: 'test1'
            },
            {
                id: 2,
                title: 'test'
            },
            {
                id: 3,
                title: 'test2'
            }
        ]
    });
}

function getDefaultOptions() {
    return {
        searchParam: 'test',
        searchValue: '',
        minSearchLength: 3,
        searchDelay: 50,
        sorting: [],
        filter: {},
        keyProperty: 'id',
        source: getMemorySource(),
        navigation: {
            source: 'page',
            view: 'page',
            sourceConfig: {
                pageSize: 2,
                page: 0,
                hasMore: false
            }
        },
        loadingChangedCallback: () => {}
    };
}

describe('Controls/search:ControllerClass', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('isSearchValueChanged', () => {
        const searchController = new ControllerClass(getDefaultOptions(), {});
        assert.isTrue(searchController._isSearchValueChanged('test'));

        searchController._inputSearchValue = 'test';
        assert.isFalse(searchController._isSearchValueChanged('test'));
    });

    it('_searchCallback', () => {
        let disableNotify;
        const options = getDefaultOptions();
        options.searchValueChangedCallback = (firstParam, secParam) => {
            disableNotify = secParam;
        };
        const searchController = new ControllerClass(options, {});
        const result = {
            data: {
                getMetaData: () => {
                    return {
                        switchedStr: 'test',
                        results: 'res'
                    };
                }
            }
        };
        searchController._updateSearchParams = () => {};
        searchController._options.itemsChangedCallback = () => {};

        searchController._searchCallback(result);
        assert.notEqual(searchController._searchValue, 'test');
        assert.equal(searchController._misspellValue, 'test');

        result.data.getMetaData = () => {
            return {
                switchedStr: 'test',
                results: 'res',
                returnSwitched: true
            };
        };
        searchController._searchCallback(result);
        assert.equal(searchController._searchValue, 'test');
        assert.isTrue(disableNotify);
    });

    it('isSearchValueShort', () => {
        const searchController = new ControllerClass(getDefaultOptions(), {});
        assert.isFalse(searchController._isSearchValueShort('test', 3));
        assert.isTrue(searchController._isSearchValueShort('te', 3));
        assert.isTrue(searchController._isSearchValueShort(undefined, 3));
    });

    it('destroy', () => {
        const searchController = new ControllerClass(getDefaultOptions(), {});
        const stub = sandbox.stub(searchController._getSearchController(getDefaultOptions()), 'abort');
        searchController.destroy();
        stub.withArgs(true);
    });

    it('isSearchValueEmpty', () => {
        const searchController = new ControllerClass(getDefaultOptions(), {});

        assert.isTrue(!!searchController._isSearchValueEmpty('', ''));
        assert.isFalse(!!searchController._isSearchValueEmpty('  ', ''));
        searchController._options.searchValueTrim = true;
        assert.isTrue(!!searchController._isSearchValueEmpty('  ', ''));
        assert.isFalse(!!searchController._isSearchValueEmpty('', 'test'));
        assert.isFalse(!!searchController._isSearchValueEmpty('test', ''));
    });

    it('filter updated on search errback', async () => {
        const options = getDefaultOptions();
        const searchController = new ControllerClass(options, {dataOptions: {}});
        let filter;

        options.filterChangedCallback = (newFilter) => {
            filter = newFilter;
        };
        searchController._searchErrback({}, {testField: 'testValue'});
        assert.deepEqual(filter, {testField: 'testValue'});
    });

    describe('constructor', () => {

        it('searchValueChangedCallback is not called on constructor', () => {
            let searchValueChangedCallbackCalled = false;
            const options = getDefaultOptions();
            options.searchValueChangedCallback = () => {
                searchValueChangedCallbackCalled = true;
            }
            options.searchValue = 'test';
            new ControllerClass(options, {});
            assert.isFalse(searchValueChangedCallbackCalled);
        });
    });

    it('update with switchedReturn', () => {
        const searchController = new ControllerClass(getDefaultOptions(), {});
        const options = {
            searchParam: 'title',
            searchValue: 'еуые',
            source: getMemorySource(),
            keyProperty: 'id',
            loadingChangedCallback: () => {},
            itemsChangedCallback: () => {}
        };
        const context = {
            dataOptions: {
                source: options.source
            }
        };

        searchController._options.searchDelay = 0;
        searchController._needStartSearchBySearchValueChanged = () => true;
        searchController._isNeedRecreateSearchControllerOnOptionsChanged = () => false;
        searchController._updateSearchParams = () => {};

        searchController.update(options, context).then(() => {
            assert.equal(searchController._searchValue, 'tst');
            assert.equal(searchController._misspellValue, 'test');
        });
    });
});
