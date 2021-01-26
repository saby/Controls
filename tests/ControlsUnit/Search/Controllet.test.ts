import {Controller} from 'Controls/search';
import {NewSourceController} from 'Controls/dataSource';
import {Memory} from 'Types/source';
import {ok} from 'assert';
import {assert} from "chai";

const getDefatultSearchControllerOptions = (): object => {
    const source = new Memory();
    return {
        source,
        keyProperty: 'id'
    };
};

const getController = (options): Controller => {
    return new Controller(options);
};

describe('Controls/search:Controller', () => {

    describe('_beforeUpdate', () => {

        it('root is changed', () => {
            let options = {...getDefatultSearchControllerOptions(), root: 'testRoot'};
            const searchController = getController(options);
            searchController._beforeMount(options, {dataOptions: {}});
            searchController.saveOptions(options);

            ok(searchController._root === 'testRoot');

            options = {...options};
            options.root = 'testRoot2';
            searchController._beforeUpdate(options, {dataOptions: {}});
            ok(searchController._root === 'testRoot2');
        });

        it('_dataLoadCallback called', async () => {
            let callbackCalled = false;
            const searchController = new Controller(options);
            searchController._options = options;
            searchController._dataLoadCallback = () => {
                callbackCalled = true;
            };
            searchController._beforeUpdate(options, {dataOptions: {}});
            await searchController._sourceController.load();
            assert.isTrue(callbackCalled);
        });

        it('searchValue wasn\'t changed', () => {
            const source = new Memory();
            const options = {
                source,
                keyProperty: 'id',
                root: 'testRoot',
                searchValue: 'testValue',
                sourceController: 'sourceController'
            };
            let searchControllerUpdated = false;
            const searchController = new Controller(options);

            searchController._options = options;
            searchController._searchController = {
                update: () => {
                    searchControllerUpdated = true;
                }
            };
            searchController._searchValue = 'testValue';
            searchController._beforeUpdate(options, {dataOptions: {}});
            assert.isFalse(searchControllerUpdated);
        });

        it('searchValue was changed', () => {
            const source = new Memory();
            const options = {
                source,
                keyProperty: 'id',
                root: 'testRoot',
                searchValue: 'testValue',
                sourceController: 'sourceController'
            };
            let searchControllerUpdated = false;

            const searchController = new Controller(options);
            searchController._beforeMount(options, {dataOptions: {}});

            searchController._searchController = {
                update: () => {
                    searchControllerUpdated = true;
                }
            };
            options.searchValue = 'newValue';

            searchController._beforeUpdate(options, {dataOptions: {}});
            assert.isTrue(searchControllerUpdated);
        });

        it('newOptions.searchValue is undefined', () => {
            const source = new Memory();
            const options = {
                source,
                keyProperty: 'id',
                root: 'testRoot',
                sourceController: 'sourceController'
            };
            let searchControllerUpdated = false;

            const searchController = new Controller(options);
            searchController._beforeMount(options, {dataOptions: {}});

            searchController._searchController = {
                update: () => {
                    searchControllerUpdated = true;
                }
            };
            searchController._searchValue = 'newValue';

            searchController._beforeUpdate(options, {dataOptions: {}});
            assert.isFalse(searchControllerUpdated);
        });

        it('_searchValue not equal newOptions.searchValue', () => {
            const source = new Memory();
            const options = {
                source,
                keyProperty: 'id',
                root: 'testRoot',
                searchValue: 'testValue',
                sourceController: 'sourceController'
            };
            let searchControllerUpdated = false;

            const searchController = new Controller(options);
            searchController._beforeMount(options, {dataOptions: {}});

            searchController._searchController = {
                update: () => {
                    searchControllerUpdated = true;
                }
            };
            searchController._searchValue = 'newValue';

            searchController._beforeUpdate(options, {dataOptions: {}});
            assert.isTrue(searchControllerUpdated);
        });
    });

    describe('_itemOpenHandler', () => {

        it('searchValue is reseted on _itemOpenHandler', async () => {
            let options = getDefatultSearchControllerOptions();
            options.sourceController = new NewSourceController({
                source: options.source
            });
            options.searchValue = 'testSearchValue';
            const searchController = getController(options);
            await searchController._beforeMount(options, {dataOptions: {}});
            searchController.saveOptions(options);

            await searchController._getSearchController();

            searchController._itemOpenHandler('test1234', undefined, 'test123');
            assert.equal(searchController._searchValue, '');
        });

    });

});
