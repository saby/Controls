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
        loadingChangedCallback: () => {},
        filterChangedCallback: () = {}
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

    describe('search', () => {

        it('search value is changed after data loaded', () => {
            const options = getDefaultOptions();
            let searchValue;

            options.searchValueChangedCallback = function(value) {
                searchValue = value;
            };
            const searchController = new ControllerClass(options, {dataOptions: {}});
            return new Promise((resolve, reject) => {
                const searchResult = searchController.search('test', true);
                assert.ok(searchValue !== 'test');

                return searchResult
                    .then((result) => {
                        assert.ok(searchValue === 'test');
                        resolve(result);
                    })
                    .catch((error) => {
                        reject(error);
                        return error;
                    });
            });
        });

    });

    describe('constructor', () => {

        it('searchValueChangedCallback is not called on constructor', () => {
            let searchValueChangedCallbackCalled = false;
            const options = getDefaultOptions();
            options.searchValueChangedCallback = () => {
                searchValueChangedCallbackCalled = true;
            };
            options.searchValue = 'test';
            new ControllerClass(options, {});
            assert.isFalse(searchValueChangedCallbackCalled);
        });
    });
});
