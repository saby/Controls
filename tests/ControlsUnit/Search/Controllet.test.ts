import {Controller} from 'Controls/search';
import {NewSourceController} from 'Controls/dataSource';
import {Memory} from 'Types/source';
import {ok} from 'assert';
import {assert} from "chai";

const getDefatultSearchControllerOptions = (): object => {
    const source = new Memory();
    return {
        source,
        keyProperty: 'id',
        searchValue: 'testValue',
        sourceController: new NewSourceController({source})
    };
};

const getController = (options): Controller => {
    return new Controller(options);
};

describe('Controls/search:Controller', () => {
    let options;
    let dataOptions;

    beforeEach(() => {
        options = {...getDefatultSearchControllerOptions(), root: 'testRoot'};
        dataOptions = {
            sourceController: options.sourceController
        };
    });

    describe('_beforeMount', () => {
        it('_dataLoadCallback called', async () => {
            let callbackCalled = false;
            const searchController = new Controller(options);
            searchController._options = options;
            searchController._dataLoadCallback = () => {
                callbackCalled = true;
            };
            options.dataLoadCallback = () => {};
            searchController._beforeMount(options, {dataOptions});
            await searchController._sourceController.load();
            assert.isTrue(callbackCalled);
        });
    });

    describe('_beforeUnmount', () => {
        it('_beforeUnmount with undefined viewMode', async () => {
            let searchControllerReseted = false;
            const searchController = new Controller(options);
            searchController._searchController = {
                reset: () => {
                    searchControllerReseted = true;
                }
            };
            searchController._beforeUnmount();
            assert.isFalse(searchControllerReseted);
        });

        it('_beforeUnmount with search viewMode', async () => {
            let searchControllerReseted = false;
            const searchController = new Controller(options);
            searchController._viewMode = 'search';
            searchController._searchController = {
                reset: () => {
                    searchControllerReseted = true;
                }
            };
            searchController._beforeUnmount();
            assert.isTrue(searchControllerReseted);
        });
    });

    describe('_beforeUpdate', () => {
        it('root is changed', () => {
            const searchController = getController(options);
            searchController._beforeMount(options, {dataOptions: {}});
            searchController.saveOptions(options);

            ok(searchController._root === 'testRoot');

            options = {...options};
            options.root = 'testRoot2';
            searchController._sourceController = options.sourceController;
            searchController._beforeUpdate(options, {dataOptions: {}});
            ok(searchController._root === 'testRoot2');
        });

        it('_dataLoadCallback called', async () => {
            let callbackCalled = false;
            const searchController = new Controller(options);
            searchController.saveOptions(options);

            searchController._dataLoadCallback = () => {
                callbackCalled = true;
            };
            options.dataLoadCallback = () => {};
            searchController._sourceController = options.sourceController;
            searchController._beforeUpdate(options, {dataOptions: {}});
            await searchController._sourceController.load();
            assert.isTrue(callbackCalled);
        });

        it('_dataLoadCallback from options called', async () => {
            let dataLoadCallbackFromOptionsCalled = false;

            const searchController = new Controller(options);
            options.dataLoadCallback = () => {
                dataLoadCallbackFromOptionsCalled = true;
            };
            searchController._beforeMount(options, {dataOptions: {}});
            searchController.saveOptions(options);
            searchController._sourceController = options.sourceController;
            searchController._beforeUpdate(options, {dataOptions: {}});
            await searchController._sourceController.load();
            assert.isTrue(dataLoadCallbackFromOptionsCalled);
        });

        it('_searchValue updated', () => {
            let searchControllerUpdated = false;
            const searchController = new Controller(options);
            searchController._beforeMount(options, {dataOptions});

            searchController._searchController = {
                update: () => {
                    searchControllerUpdated = true;
                    return {};
                }
            };
            options.searchValue = 'newValue';
            searchController._searchValue = '';
            searchController._beforeUpdate(options, {dataOptions: {}});
            assert.equal(searchController._searchValue, 'newValue');
            assert.equal(searchController._inputSearchValue, 'newValue');
        });

        it('searchValue wasn\'t changed', () => {
            let searchControllerUpdated = false;
            let sourceControllerOption = null;
            const searchController = new Controller(options);

            searchController._options = options;
            searchController._searchController = {
                update: () => {
                    searchControllerUpdated = true;
                }
            };

            options.viewMode = 'searchViewMode';
            options.dataLoadCallback = () => {};
            searchController._sourceController = new NewSourceController({
                source: options.source,
                viewMode: 'sourceViewMode'
            });
            searchController._sourceController.updateOptions = (options) => {
                sourceControllerOption = options.viewMode;
            };
            searchController._searchValue = 'testValue';
            searchController._beforeUpdate(options, {dataOptions: {}});
            assert.isFalse(searchControllerUpdated);
            assert.equal(sourceControllerOption, 'sourceViewMode');
        });

        it('searchValue was changed', () => {
            let searchControllerUpdated = false;

            const searchController = new Controller(options);
            searchController._beforeMount(options, {dataOptions});

            searchController._searchController = {
                update: () => {
                    searchControllerUpdated = true;
                }
            };
            options.searchValue = 'newValue';

            searchController._beforeUpdate(options, {dataOptions});
            assert.isTrue(searchControllerUpdated);
        });

        it('_searchValue is equal newOptions.searchValue', () => {
            let searchControllerUpdated = false;

            const searchController = new Controller(options);
            options.searchValue = 'oldValue';
            searchController._beforeMount(options, {dataOptions});

            searchController._searchController = {
                update: () => {
                    searchControllerUpdated = true;
                }
            };
            searchController._searchValue = 'newValue';
            options.searchValue = 'newValue';
            searchController._beforeUpdate(options, {dataOptions: {}});
            assert.isFalse(searchControllerUpdated);
        });

        it('newOptions.searchValue is undefined', () => {
            let searchControllerUpdated = false;

            const searchController = new Controller(options);
            searchController._beforeMount(options, {dataOptions});

            searchController._searchController = {
                update: () => {
                    searchControllerUpdated = true;
                }
            };
            searchController._searchValue = 'newValue';
            options.searchValue = undefined;
            searchController._beforeUpdate(options, {dataOptions});
            assert.isFalse(searchControllerUpdated);
        });

        it('_beforeUpdate without sourceController', () => {
            let errorCatched = false;

            const searchController = new Controller(options);
            searchController._beforeMount(options, {dataOptions});
            searchController._sourceController = null;
            try {
                searchController._beforeUpdate(options, {dataOptions});
            } catch {
                errorCatched = true;
            }

            assert.isFalse(errorCatched);
        });
    });

    describe('_itemOpenHandler', () => {

        it('searchValue is reseted on _itemOpenHandler', async () => {
            options.sourceController = new NewSourceController({
                source: options.source
            });
            options.searchValue = 'testSearchValue';
            const searchController = getController(options);
            await searchController._beforeMount(options, {dataOptions});
            searchController.saveOptions(options);

            await searchController._getSearchController();

            searchController._itemOpenHandler('test1234', undefined, 'test123');
            assert.equal(searchController._searchValue, '');
        });

    });

});
