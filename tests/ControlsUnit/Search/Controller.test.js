define(['Controls/search', 'Types/source', 'Core/core-instance', 'Types/collection', 'Types/entity'], function(searchMod, sourceLib, cInstance, collection, entity) {

   var data = [
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
   ];

   var memorySource = new sourceLib.Memory({
      data: data
   });

   var getDefaultOptions = function() {
      return {
         searchParam: 'test',
         searchValue: '',
         minSearchLength: 3,
         searchDelay: 50,
         sorting: [],
         filter: {},
         source: memorySource,
         navigation: {
            source: 'page',
            view: 'page',
            sourceConfig: {
               pageSize: 2,
               page: 0,
               hasMore: false
            }
         }
      };
   };

   var defaultOptions = getDefaultOptions();

   var getSearchController = function(additionalOptions) {
      var options = getDefaultOptions();
      var controller = new searchMod.Controller(Object.assign(options, additionalOptions || {}));
      controller.saveOptions(options);
      return controller;
   };

   var sandbox;

   describe('Controls/_search/Controller', function() {

      beforeEach(function() {
         sandbox = sinon.createSandbox();
      });

      afterEach(function() {
         sandbox.restore();
      });

      it('private.startSearch', function() {
         var searchController = getSearchController();
         var value;
         var wasSearch = false;
         searchController._dataOptions = defaultOptions;
         searchController._options.searchValueTrim = true;

         searchMod.Controller._private.getSearchController(searchController);

         searchController._searchController.search = function(searchVal) {
            value = searchVal;
            wasSearch = true;
         };
         searchMod.Controller._private.startSearch(searchController, 'test');
         assert.equal(value, 'test');
         assert.isTrue(wasSearch);

         searchController._isSearchControllerLoading = function() {
            return true;
         }
         wasSearch = false;
         searchController._inputSearchValue = 'test2'
         searchMod.Controller._private.startSearch(searchController, '  test2  ');
         assert.isFalse(wasSearch);

         searchMod.Controller._private.startSearch(searchController, '');
         assert.equal(value, '');
         assert.isTrue(wasSearch);

         value = '';
         searchController._options.source = null;
         searchMod.Controller._private.startSearch(searchController, 'test3');
         assert.equal(value, '');
      });


      it('private.isSearchValueChanged', function() {
         var searchController = getSearchController();
         var result;
         searchController._dataOptions = defaultOptions;

         result = searchMod.Controller._private.isSearchValueChanged(searchController, 'test');
         assert.isTrue(result);

         searchMod.Controller._private.setInputSearchValue(searchController, 'test');
         result = searchMod.Controller._private.isSearchValueChanged(searchController, 'test');
         assert.isFalse(result);
      });

      it('private.isInputSearchValueShort', function() {
         var searchController = getSearchController();
         var result;
         searchController._dataOptions = defaultOptions;

         result = searchMod.Controller._private.isInputSearchValueShort(searchController, 'test');
         assert.isFalse(result);

         searchMod.Controller._private.setInputSearchValue(searchController, 'test');
         result = searchMod.Controller._private.isInputSearchValueShort(searchController, 'testing');
         assert.isFalse(result);

         result = searchMod.Controller._private.isInputSearchValueShort(searchController, 'te');
         assert.isTrue(result);

         result = searchMod.Controller._private.isInputSearchValueShort(searchController, undefined);
         assert.isTrue(result);
      });

      it('private.needStartSearch', function() {
         var result;

         result = searchMod.Controller._private.needStartSearch('', '');
         assert.isFalse(!!result);

         result = searchMod.Controller._private.needStartSearch('  ', '');
         assert.isFalse(!!result);

         result = searchMod.Controller._private.needStartSearch('', 'test');
         assert.isTrue(!!result);

         result = searchMod.Controller._private.needStartSearch('test', '');
         assert.isTrue(!!result);
      });

      it('_private.searchCallback', function() {
         var controller = getSearchController();
         var filterChanged = false;
         var itemsChanged = false;
         var searchValue;
         var filter;
         var isBubbling;

         controller._notify = (eventName, value, eventArgs) => {
            if (eventName === 'filterChanged') {
               filterChanged = true;
               filter = value[0];
               isBubbling = eventArgs && eventArgs.bubbling;
            }

            if (eventName === 'itemsChanged') {
               itemsChanged = true;
               isBubbling = eventArgs && eventArgs.bubbling;
            }

            if (eventName === 'searchValueChanged') {
               searchValue = value[0];
            }
         };

         controller._searchContext = { updateConsumers: () => {} };
         controller._viewMode = 'tile';

         searchMod.Controller._private.searchCallback(controller, {}, {test: 'testFilterValue'});

         assert.isFalse(controller._loading);
         assert.isTrue(filterChanged);
         assert.isTrue(itemsChanged);
         assert.isFalse(!!isBubbling);
         assert.equal(controller._viewMode, 'search');
         assert.equal(controller._previousViewMode, 'tile');
         assert.equal(controller._searchValue, 'testFilterValue');
         assert.equal(searchValue, 'testFilterValue');


         var rs = new collection.RecordSet({
            rawData: [],
            keyProperty: 'id'
         });
         rs.setMetaData({
            results: new entity.Model({
               rawData: {
                  switchedStr: 'testStr'
               }
            })
         });
         var result = {
            data: rs
         };
         var filter = {
            test: 'test'
         };
         searchMod.Controller._private.searchCallback(controller, result, filter);

         assert.equal(controller._misspellValue, 'testStr');
         assert.deepEqual(filter, {test: 'test'});
         assert.equal(controller._previousViewMode, 'tile');

         rs.setMetaData({});
         searchMod.Controller._private.searchCallback(controller, result, filter);
         assert.isTrue(!controller._misspellValue);
      });

      it('_private.searchCallback with startingWith = "root"', () => {
         var controller = getSearchController({
            parentProperty: 'parent',
            startingWith: 'root'
         });
         controller._searchContext = { updateConsumers: () => {} };
         controller._notify = () => {};
         controller._root = 'testRoot';
         controller._path = new collection.RecordSet({
            rawData: [{
               parent: null,
               id: 'testId'
            }],
            keyProperty: 'id'
         });

         searchMod.Controller._private.searchCallback(controller, { data: new collection.RecordSet() }, {});
         assert.equal(controller._root, null);
      });

      it('_private.abortCallback', function() {
         var controller = getSearchController();
         var filter = { 'Разворот': 'С разворотом', 'usePages': 'full', test: 'test' };

         controller._viewMode = 'search';
         controller._misspellValue = 'testStr';
         controller._loading = true;
         controller._searchValue = 'test';
         controller._inputSearchValue = 'testInputValue';
         controller._options.parentProperty = 'test';
         controller._options.filter = { 'Разворот': 'С разворотом', 'usePages': 'full', test: 'test', searchParam: 'testValue' };

         const stubNotify = sandbox.stub(controller, '_notify');

         controller._searchContext = { updateConsumers: function() {} };

         searchMod.Controller._private.abortCallback(controller, filter);

         assert.isTrue(stubNotify.calledTwice);
         assert.isTrue(controller._viewMode === 'search');
         assert.isFalse(controller._loading);
         assert.equal(controller._misspellValue, '');
         assert.equal(controller._searchValue, '');
         assert.equal(controller._inputSearchValue, 'testInputValue');
         assert.deepEqual(filter, {test: 'test'});
         assert.isTrue(stubNotify.withArgs('searchValueChanged', ['']).calledOnce);
         assert.isTrue(stubNotify.withArgs('filterChanged', [filter]).calledOnce);

         controller._options.filter = { test: 'test' };
         searchMod.Controller._private.abortCallback(controller, filter);
         assert.isTrue(stubNotify.withArgs('filterChanged', [filter]).calledOnce);
         assert.deepEqual(filter, {test: 'test'});
      });

      it('_private.dataLoadCallback', function() {
         var dataLoadCallbackCalled = false;
         var controller = getSearchController({
            dataLoadCallback: function() {
               dataLoadCallbackCalled = true;
            }
         });

         var rs = new collection.RecordSet({
            rawData: [],
            keyProperty: 'id'
         });
         rs.setMetaData({
            path: new collection.RecordSet({
               keyProperty: 'id',
               rawData: [{
                  id: 'testRoot'
               }]
            })
         });

         controller._viewMode = 'search';
         controller._previousViewMode = 'testViewMode';
         controller._dataLoadCallback(rs);

         assert.isTrue(dataLoadCallbackCalled);
         assert.equal(controller._viewMode, 'testViewMode');
         assert.equal(controller._path.getCount(), 1);
      });

      it('_private.searchStartCallback', function() {
         var controller = getSearchController();
         var filter = {};

         //case 1. Without parentProperty
         searchMod.Controller._private.searchStartCallback(controller, filter);
         assert.isTrue(controller._loading);
         assert.deepEqual(filter, {});

         controller._options.parentProperty = 'test';
         controller._loading = false;

         //case 2. With parentProperty
         searchMod.Controller._private.searchStartCallback(controller, filter);
         assert.isTrue(controller._loading);
         assert.deepEqual(filter, { 'Разворот': 'С разворотом', 'usePages': 'full' });

         //case 3. With root and startingWith='current'
         controller._options.startingWith = 'current';
         controller._root = 'testRootNode';
         controller._loading = false;
         searchMod.Controller._private.searchStartCallback(controller, filter);
         assert.isTrue(controller._loading);
         assert.deepEqual(filter, { 'Разворот': 'С разворотом', 'usePages': 'full', 'test': 'testRootNode' });

         //case 4. With root and startingWith='root'
         controller._options.startingWith = 'root';
         controller._root = 'testRootNode';
         controller._loading = false;
         filter = {
            test: 'testRootNode'
         };
         searchMod.Controller._private.searchStartCallback(controller, filter);
         assert.deepEqual(filter, { 'Разворот': 'С разворотом', 'usePages': 'full' });
      });

      it('_private.needUpdateSearchController', function() {
         let originSource = new sourceLib.Memory();
         let prefetchSource = new sourceLib.PrefetchProxy({ target: originSource });
         let newPrefetchSource = new sourceLib.PrefetchProxy({ target: originSource });

         assert.isFalse(searchMod.Controller._private.needUpdateSearchController({filter: {test: 'test'}}, {filter: {test: 'test'}}));
         assert.isFalse(searchMod.Controller._private.needUpdateSearchController({filter: {test: 'test'}}, {filter: {test: 'test1'}}));
         assert.isTrue(searchMod.Controller._private.needUpdateSearchController({minSearchLength: 3}, {minSearchLength: 2}));
         assert.isFalse(searchMod.Controller._private.needUpdateSearchController({source: prefetchSource}, {source: newPrefetchSource}));
      });

      it('_private.getSearchController', function() {
         var searchController = getSearchController();
         var controller;

         searchController._dataOptions = defaultOptions;
         searchController._dataOptions.filter = null;
         controller = searchMod.Controller._private.getSearchController(searchController);
         assert.isTrue(cInstance.instanceOfModule(controller, 'Controls/search:_SearchController'));
         assert.deepEqual(controller._options.sorting, []);
         assert.deepEqual(controller._options.filter, {});
      });

      it('_private.searchErrback', function() {
         let searchErrbackCalled = false;
         let err;

         let searchErrback = (error) => {
            searchErrbackCalled = true;
            err = error;
         };

         var searchController = getSearchController({dataLoadErrback: searchErrback});
         searchController._dataOptions = defaultOptions;
         searchController._loading = true;

         searchMod.Controller._private.searchErrback(searchController, 'test');
         assert.isTrue(searchErrbackCalled);
         assert.equal(err, 'test');
         assert.isFalse(searchController._loading);
      });

      it('_search', function() {
         var searchController = getSearchController();
         var value;
         var isLoading = false;
         searchController._dataOptions = defaultOptions;
         searchController._options.searchValueTrim = true;
         //initialize searchController
         searchMod.Controller._private.getSearchController(searchController);

         //moch method
         searchController._searchController.search = function(searchVal) {
            value = searchVal;
         };
         searchController._searchController.isLoading = function() {
            return isLoading;
         };

         searchController._search(null, 'test');

         assert.equal(value, 'test');
         assert.equal(searchController._inputSearchValue, 'test');

         value = '';
         isLoading = true;
         searchController._search(null, 'test');
         assert.equal(value, '');

         searchController._search(null, '  test2  ');
         assert.equal(value, 'test2');

         isLoading = false;
         value = '';
         searchController._options.source = null;
         searchController._search(null, 'test3');
         assert.equal(value, '');
         assert.equal(searchController._inputSearchValue, 'test3');

      });

      describe('_beforeMount', function() {
         var searchController = getSearchController(defaultOptions);

         it('without option searchValue', function() {
            searchController._beforeMount({root: 'test', viewMode: 'notSearch'}, {});

            assert.equal(searchController._root, 'test');
            assert.equal(searchController._viewMode, 'notSearch');
         });

         it('with option searchValue', function() {
            searchController._beforeMount({searchValue: 'test2', root: 'test2', viewMode: 'notSearch'}, {});

            assert.equal(searchController._inputSearchValue, 'test2');
            assert.equal(searchController._searchValue, 'test2');
            assert.equal(searchController._root, 'test2');
            assert.equal(searchController._previousViewMode, 'notSearch');
            assert.equal(searchController._viewMode, 'search');
         });
         it('with short searchValue', function() {
            searchController._searchValue = '';
            searchController._beforeMount({searchValue: 'te',  viewMode: 'notSearch'}, {});

            assert.equal(searchController._inputSearchValue, 'te');
            assert.equal(searchController._searchValue, '');
            assert.equal(searchController._viewMode, 'notSearch');
         })
      });

      describe('_beforeUpdate', function() {
         var searchController = getSearchController(defaultOptions);

         searchController._beforeMount({}, {dataOptions: defaultOptions});

         it('default options', function() {
            searchMod.Controller._private.getSearchController(searchController);
            searchController._beforeUpdate({searchValue: '', sorting: []}, {dataOptions: defaultOptions});
            assert.isNull(searchController._searchController);
         });

         it('source is changed', function() {
            var options = getDefaultOptions();
            options.source = new sourceLib.Memory();
            searchMod.Controller._private.getSearchController(searchController);
            searchController._inputSearchValue = 'test';
            searchController._beforeUpdate(options, {dataOptions: defaultOptions});

            assert.isNull(searchController._searchController);
            assert.isTrue(searchController._inputSearchValue === '');
         });

         it('filter is changed', function() {
            var options = getDefaultOptions();
            var sandbox = sinon.createSandbox();
            var aborted;

            options.filter = {test: 'testValue'};
            searchMod.Controller._private.getSearchController(searchController);
            searchController._beforeUpdate(options, {dataOptions: defaultOptions});
            assert.deepEqual(searchController._searchController.getFilter(), {test: 'testValue'});

            // filter and navigation changed
            options.filter = {test: 'testValue', test1: 'testValue1'};
            options.navigation = {};
            searchController._searchValue = 'test';
            searchController._viewMode = 'search';

            sandbox.replace(searchController._searchController, 'abort', () => {
               aborted = true;
            });
            searchController._beforeUpdate(options, {dataOptions: defaultOptions});
            assert.isTrue(aborted);
            searchController._viewMode = '';
            sandbox.restore();
         });

         it('filter is changed, navigation is changed', function() {
            var options = getDefaultOptions();

            options.filter = {test: 'testValue'};
            options.navigation = {};
            searchMod.Controller._private.getSearchController(searchController);
            var abortStub = sandbox.stub(searchController._searchController, 'abort');

            searchController._searchValue = '';
            searchController._beforeUpdate(options, {dataOptions: defaultOptions});
            assert.isNull(searchController._searchController);
            assert.isFalse(abortStub.calledOnce);

            searchMod.Controller._private.getSearchController(searchController);
            abortStub = sandbox.stub(searchController._searchController, 'abort');
            searchController._searchValue = '123';
            searchController._beforeUpdate(options, {dataOptions: defaultOptions});
            assert.isNull(searchController._searchController);
            assert.isTrue(abortStub.calledOnce);
         });

         it('sorting is changed', function() {
            var options = getDefaultOptions();

            options.sorting = [{testValue: "ASC"}];
            searchMod.Controller._private.getSearchController(searchController);
            searchController._beforeUpdate(options, {dataOptions: defaultOptions});
            assert.deepEqual(searchController._searchController._options.sorting, [{testValue: "ASC"}]);
         });

         it('search value is changed', function() {
            var value;

            searchController._inputSearchValue = 'test';
            searchController._options.searchValue = '';
            searchMod.Controller._private.getSearchController(searchController);
            searchController._search = function(searchVal) {
               value = searchVal;
            };

            it('equal _options.searchValue', function() {
               searchController._beforeUpdate({searchValue: ''}, {});
               assert.equal(value, undefined);
            });

            it('equal _inputSearchValue', function() {
               searchController._beforeUpdate({searchValue: 'test'}, {});
               assert.equal(value, undefined);
            });

            it('new value', function() {
               searchController._beforeUpdate({searchValue: 'test2'}, {});
               assert.equal(value, 'test2');
            });
         });
         it('viewMode is changed', function() {
            var options = getDefaultOptions();

            options.viewMode = "tile";
            searchController._beforeUpdate(options, {dataOptions: defaultOptions});
            assert.equal(searchController._viewMode, "tile");
         });

         it('search value reseted', function() {
            var options = getDefaultOptions();
            options.searchValue = 'test';
            searchController._searchValue = 'test';
            searchController._inputSearchValue = 'test';
            searchController._beforeUpdate(options, {dataOptions: defaultOptions});
            assert.equal(searchController._inputSearchValue, 'test');

            options.searchValue = '';
            searchController._options.searchValue = 'test'
            searchController._searchValue = 'test';
            searchController._beforeUpdate(options, {dataOptions: defaultOptions});
            assert.equal(searchController._inputSearchValue, '');
         });
      });

      describe('_beforeUnmount', function() {
         it('abort', function() {
            var aborted = false;
            var searchController = getSearchController(defaultOptions);
            searchController._beforeMount({filter: {test: 'testValue'}}, {dataOptions: defaultOptions});
            searchMod.Controller._private.getSearchController(searchController);
            searchController._searchController.abort = function(forced) {
               if (forced) {
                  aborted = true;
               }
            };
            searchController._beforeUnmount();
            assert.isTrue(aborted);
         })
      });

      it('itemOpenHandler', function() {
         var searchController = getSearchController(defaultOptions);
         var searchAborted = false;
         var abortForced = false;

         //Controller moch
         searchController._searchController = {
            abort: function(force) {
               searchAborted = true;
               abortForced = force;
            }
         };

         searchController._root = 'test';
         searchController._itemOpenHandler(null);
         assert.isFalse(searchAborted);
         assert.equal(searchController._root, null);

         searchController._itemOpenHandler('test');
         assert.isTrue(searchAborted);
         assert.isTrue(abortForced);
         assert.equal(searchController._root, 'test');
         assert.equal(searchController._inputSearchValue, '');
      });

      it('itemOpenHandler with searchNavigationMode="expand"', function() {
         var searchController = getSearchController(Object.assign(defaultOptions, {
            searchNavigationMode: 'expand',
            parentProperty: 'parent',
            nodeProperty: 'type'
         }));
         var markedKeyChangedParams = null;
         var expandedItemsChangedParams = null;
         var items = new collection.RecordSet({
            rawData: [
               { key: 1, parent: null, type: true },
               { key: 2, parent: 1, type: true },
               { key: 3, parent: 2, type: true }
            ],
            keyProperty: 'key'
         });
         searchController._searchController = {
            abort: function(){}
         };
         searchController._notify = function(eventName, params) {
            if (eventName === 'markedKeyChanged') {
               markedKeyChangedParams = params;
            }
            if (eventName === 'expandedItemsChanged') {
               expandedItemsChangedParams = params;
            }
         };
         searchController._root = null;
         searchController._viewMode = 'search';

         searchController._itemOpenHandler(3, items);
         assert.deepEqual(markedKeyChangedParams, [3]);
         assert.deepEqual(expandedItemsChangedParams,[[1, 2, 3]]);
      });
   });

});
