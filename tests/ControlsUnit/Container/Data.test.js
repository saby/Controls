define(
   [
      'Controls/list',
      'Types/source',
      'Core/Deferred',
      'Types/collection',
      'Application/Initializer',
      'Application/Env',
      'EnvConfig/Config',
      'Controls/dataSource'
   ],
   function(lists, sourceLib, Deferred, collection, AppInit, AppEnv, Config, dataSourceLib) {
      describe('Container/Data', function() {

         var sourceData = [
            {id: 1, title: 'Sasha'},
            {id: 2, title: 'Dmitry'},
            {id: 3, title: 'Andrey'},
            {id: 4, title: 'Aleksey'},
            {id: 5, title: 'Sasha'},
            {id: 6, title: 'Ivan'}
         ];

         var sourceDataEdited = [
            {id: 1, title: 'Sasha'},
            {id: 2, title: 'Dmitry'},
            {id: 3, title: 'Andrey'},
            {id: 4, title: 'Petr'},
            {id: 5, title: 'Petr'},
            {id: 6, title: 'Petr'}
         ];

         var source = new sourceLib.Memory({
            keyProperty: 'id',
            data: sourceData
         });

         var getDataWithConfig = function(config) {
            var data = new lists.DataContainer(config);
            data.saveOptions(config);
            return data;
         };

         var setNewEnvironmentValue = function(value) {
            let sandbox = sinon.createSandbox();

            if (value) {
               sandbox.replace(AppInit, 'isInit', () => true);
               sandbox.replace(AppEnv, 'getStore', () => ({
                  isNewEnvironment: true
               }));
            } else {
               sandbox.replace(AppInit, 'isInit', () => false);
            }

            return function resetNewEnvironmentValue() {
               sandbox.restore();
            };
         };

         it('update source', function(done) {
            const dataOptions = {source: source, keyProperty: 'id'};
            const data = getDataWithConfig(dataOptions);
            const newSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: sourceDataEdited
            });
            let callbackCalled = false;
            const dataLoadCallbackFunction = () => {
               callbackCalled = true;
            };

            data._beforeMount(dataOptions).then(() => {
               data._dataOptionsContext = {};
               const newFilter = {test: 'testFilter'};
               const newOptions = {source: newSource, idProperty: 'id', filter: newFilter, dataLoadCallback: dataLoadCallbackFunction};
               var loadDef = data._beforeUpdate(newOptions);
               data.saveOptions(newOptions);
               assert.isTrue(data._loading);
               loadDef.addCallback(function() {
                  try {
                     assert.isTrue(data._contextState.source === newSource);
                     assert.deepEqual(data._filter, newFilter);
                     assert.isFalse(data._loading);
                     assert.isTrue(callbackCalled);
                     done();
                  } catch (e) {
                     done(e);
                  }
               });
            });
         });

         it('update source, that returns error', async function() {
            let dataOptions = { source: source, keyProperty: 'id' };
            let isErrorProcessed = false;

            const data = getDataWithConfig(dataOptions);
            await data._beforeMount(dataOptions);

            const errorSource = new sourceLib.Memory();
            errorSource.query = () => {
               const error = new Error('testError');
               error.processed = true;
               return Promise.reject(error);
            };
            dataOptions = {...dataOptions};
            dataOptions.source = errorSource;
            data._onDataError = () => {
               isErrorProcessed = true;
            };
            const updateResult = await data._beforeUpdate(dataOptions);

            assert.ok(updateResult instanceof Error);
            assert.ok(isErrorProcessed);
            assert.ok(!data._loading);
         });

         it('cancel loading while loading data from new source', async function() {
            let dataOptions = { source: source, keyProperty: 'id' };

            const data = getDataWithConfig(dataOptions);
            await data._beforeMount(dataOptions);

            const newSource = new sourceLib.Memory();
            dataOptions = {...dataOptions};
            dataOptions.source = newSource;
            const loadPromise = data._beforeUpdate(dataOptions);
            data._sourceController.cancelLoading();
            await loadPromise;

            assert.ok(data._contextState.source === newSource)
         });

         it('filter, navigation, sorting changed', async () => {
            const dataOptions = {source: source, keyProperty: 'id'};
            const data = getDataWithConfig(dataOptions);
            data._contextState = {};

            const newNavigation = {view: 'page', source: 'page', sourceConfig: {pageSize: 2, page: 0, hasMore: false}};
            const newFilter = {title: 'Ivan'};
            const newSorting = [{ amount: 'ASC' }];
            await data._beforeMount(dataOptions);
            data.saveOptions(dataOptions);
            await data._beforeUpdate({
               source: source,
               idProperty: 'id',
               filter: newFilter,
               navigation: newNavigation,
               sorting: newSorting
            });

            assert.deepEqual(data._contextState.navigation, newNavigation);
            assert.deepEqual(data._contextState.filter, newFilter);
            assert.deepEqual(data._contextState.sorting, newSorting);
            assert.deepEqual(data._filter, newFilter);
         });

         it('source and filter/navigation changed', async () => {
            const dataOptions = {source: source, keyProperty: 'id'};
            const data = getDataWithConfig(dataOptions);
            data._contextState = {};

            const newSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: sourceDataEdited
            });
            const newNavigation = {view: 'page', source: 'page', sourceConfig: {pageSize: 2, page: 0, hasMore: false}};
            const newFilter = {title: 'Ivan'};
            await data._beforeMount(dataOptions);

            const loadDef = data._beforeUpdate({
               source: newSource,
               idProperty: 'id',
               navigation: newNavigation,
               filter: newFilter
            });
            assert.isUndefined(data._contextState.navigation);
            assert.deepStrictEqual(data._filter, newFilter);

            return new Promise((resolve, reject) => {
               loadDef
                  .addCallback(() => {
                     assert.deepEqual(data._contextState.navigation, newNavigation);
                     assert.deepEqual(data._contextState.filter, newFilter);
                     assert.deepEqual(data._filter, newFilter);
                     resolve();
                  })
                  .addErrback((error) => {
                     reject(error);
                  });
            });
         });

         it('_beforeUpdate filter changed, sourceController in options', async() => {
            let filter = {};
            let options = {
               source,
               keyProperty: 'id',
               filter
            };
            const sourceController = new dataSourceLib.NewSourceController(options);
            options = {...options, sourceController};
            const data = getDataWithConfig(options);
            await sourceController.reload();
            await data._beforeMount(options);
            data.saveOptions(options);

            options = {...options};
            filter = {...filter};
            filter.test = '123';

            data._beforeUpdate(options);
            assert.deepEqual(options.filter, data._filter);
         });

         it('_beforeMount with receivedState', function() {
            let data = getDataWithConfig({source: source, keyProperty: 'id'});
            let newSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: sourceData
            });
            const items = new collection.RecordSet({
               rawData: sourceData,
               keyProperty: 'id'
            });
            let resetCallback = setNewEnvironmentValue(true);
            data._beforeMount({source: newSource, idProperty: 'id'}, {}, items);

            assert.deepEqual(data._items, items);
            assert.ok(data._sourceController.getItems());
            assert.ok(data._sourceController.getState().items);
            resetCallback();
         });

         it('_beforeMount with receivedState and prefetchProxy', function() {
            let memory = new sourceLib.Memory({
               keyProperty: 'id',
               data: sourceData
            });
            const items = new collection.RecordSet({
               rawData: sourceData,
               keyProperty: 'id'
            });
            let prefetchSource = new sourceLib.PrefetchProxy({
               target: memory,
               data: {
                  query: items
               }
            });
            let data = getDataWithConfig({source: prefetchSource, keyProperty: 'id'});
            let resetCallback = setNewEnvironmentValue(true);

            data._beforeMount({source: prefetchSource, idProperty: 'id'}, {}, items);

            const sourceControllerState = data._sourceController.getState();
            assert.isTrue(sourceControllerState.source === memory);
            assert.equal(sourceControllerState.items, items);
            assert.isTrue(data._source === memory);

            resetCallback();
         });

         it('_beforeMount with prefetchProxy', async function() {
            let memory = new sourceLib.Memory({
               keyProperty: 'id',
               data: sourceData
            });
            const items = new collection.RecordSet({
               rawData: sourceData,
               keyProperty: 'id'
            });
            let prefetchSource = new sourceLib.PrefetchProxy({
               target: memory,
               data: {
                  query: items
               }
            });
            let data = getDataWithConfig({source: prefetchSource, keyProperty: 'id'});

            await data._beforeMount({source: prefetchSource, idProperty: 'id'}, {});

            const sourceControllerState = data._sourceController.getState();
            assert.isTrue(sourceControllerState.source === memory);
            assert.equal(sourceControllerState.items, items);
            assert.isTrue(data._source === prefetchSource);
         });

         it('_beforeMount without source', () => {
            const filter = {
               testField: 'testValue'
            };
            const dataOptions = { keyProperty: 'id', filter };
            const data = getDataWithConfig(dataOptions);

            data._beforeMount(dataOptions);
            assert.deepEqual(data._contextState.filter, filter);
         });

         it('_beforeMount with root and parentProperty', async() => {
            const data = new sourceLib.DataSet();
            let sourceQuery;
            const dataSource = {
               query: function(query) {
                  sourceQuery = query;
                  return Deferred.success(data);
               },
               _mixins: [],
               "[Types/_source/ICrud]": true
            };

            const dataOptions = {
               source: dataSource,
               keyProperty: 'id',
               filter: {},
               parentProperty: 'testParentProperty',
               root: 'testRoot'
            };
            const dataContainer = getDataWithConfig(dataOptions);
            await dataContainer._beforeMount(dataOptions);
            assert.deepEqual(sourceQuery.getWhere(), {testParentProperty: 'testRoot'});
         });

         it('_beforeMount sourceController in options', () => {
            const memorySource = new sourceLib.Memory({
               keyProperty: 'id',
               data: sourceData
            });
            const items = new collection.RecordSet({
               rawData: sourceData,
               keyProperty: 'id'
            });
            const sourceController = new dataSourceLib.NewSourceController({
               source: memorySource
            });
            sourceController.setItems(items);
            const dataOptions = {
               sourceController,
               source: memorySource,
               keyProperty: 'id'
            };
            const dataContainer = getDataWithConfig(dataOptions);
            const mountResult = dataContainer._beforeMount(dataOptions);

            assert.isTrue(!mountResult);
            assert.isTrue(dataContainer._sourceController === sourceController, 'wrong sourceController after mount');
            assert.isTrue(dataContainer._items === sourceController.getItems(), 'wrong items after mount');
            assert.isTrue(!dataContainer._errorRegister);
         });

         it('_beforeMount with sourceController and dataLoadCallback in options', async () => {
            const memorySource = new sourceLib.Memory({
               keyProperty: 'id',
               data: sourceData
            });
            const items = new collection.RecordSet({
               rawData: sourceData,
               keyProperty: 'id'
            });
            const sourceController = new dataSourceLib.NewSourceController({
               source: memorySource
            });
            sourceController.setItems(items);
            let dataLoadCallbackItems;
            const dataOptions = {
               sourceController,
               source: memorySource,
               keyProperty: 'id',
               dataLoadCallback: (loadedItems) => {
                  dataLoadCallbackItems = loadedItems;
               }
            };
            const dataContainer = getDataWithConfig(dataOptions);
            await dataContainer._beforeMount(dataOptions);

            assert.isTrue(dataLoadCallbackItems === items, 'wrong items in dataLoadCallback');
         });

         it('_itemsReadyCallbackHandler', async function() {
            const options = {source: source, keyProperty: 'id'};
            let data = getDataWithConfig(options);
            await data._beforeMount(options);

            const prefetchSource = data._contextState.prefetchSource;
            const currentItems = data._items;
            const newItems = new collection.RecordSet();

            data._itemsReadyCallbackHandler(newItems);
            assert.isTrue(data._items === newItems);
            assert.isTrue(data._contextState.items === newItems);
            assert.isTrue(data._contextState.prefetchSource === prefetchSource);
         });

         it('data source options tests', function(done) {
            var config = {source: null, keyProperty: 'id'},
               data = getDataWithConfig(config);

            //creating without source
            data._beforeMount(config);

            assert.equal(data._source, null);
            assert.isTrue(!!data._contextState);

            //new source received in _beforeUpdate
            data._beforeUpdate({source: source}).addCallback(function() {
               assert.isTrue(data._sourceController._options.source === source);
               assert.ok(data._sourceController.getState().items);
               done();
            });
         });

         it('update source', function(done) {
            const config = {source: source, keyProperty: 'id'};
            const data = getDataWithConfig(config);

            data._beforeMount(config).addCallback(function() {
               const contextSource = data._contextState.source;
               data._beforeUpdate({source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: sourceDataEdited
                  }), keyProperty: 'id'}).addCallback(function() {
                  assert.isTrue(contextSource !== data._contextState.source);
                  done();
               });
            });
         });

         it('sourceController is null in _beforeUpdate', async function() {
            let config = {source: source, keyProperty: 'id'};
            const data = getDataWithConfig(config);
            await data._beforeMount(config);

            config = { ...config, sourceController: null };
            data._beforeUpdate(config);
            assert.isTrue(data._sourceController === null);
         });

         it('sourceController is null on _beforeMount and _beforeUpdate', async function() {
            let config = {source: source, keyProperty: 'id', sourceController: null};
            const data = getDataWithConfig(config);

            await data._beforeMount(config);
            assert.ok(data._sourceController);

            config = { ...config, sourceController: null };
            await data._beforeUpdate(config);
            assert.ok(data._sourceController);

         });

         it('set source after mount', function(done) {
            const config = {keyProperty: 'id'};
            const data = getDataWithConfig(config);

            data._beforeMount(config);

            data._beforeUpdate({
               source: new sourceLib.Memory({
                  keyProperty: 'id',
                  data: sourceDataEdited
               }),
               keyProperty: 'id'
            }).addCallback(function() {
               assert.deepEqual(data._items.getRawData(), sourceDataEdited);
               done();
            });
         });

         it('itemsChanged', (done) => {
            const config = {
               source: source,
               keyProperty: 'id'
            };
            const data = getDataWithConfig(config);
            const event = {
               stopPropagation: () => {
                  propagationStopped = true;
               }
            };

            let propagationStopped = false;

            data._beforeMount(config).addCallback(function() {
               const newList = new collection.RecordSet({
                  rawData: [{
                     id: 0,
                     title: 'Ivan'
                  }],
                  keyProperty: 'id'
               });
               data._itemsChanged(event, newList);
               assert.ok(data._items.getRecordById(0), 'items not changed');
               assert.ok(!data._items.getRecordById(1), 'items not changed');
               assert.isTrue(propagationStopped);
               done();
            });
         });

         it('filterChanged', function() {
            var config = {source: source, keyProperty: 'id', filter: {test: 'test'}};
            var data = getDataWithConfig(config);

            return new Promise(function(resolve) {
               data._beforeMount(config).addCallback(function() {
                  data._filterChanged(null, {test1: 'test1'});
                  assert.isTrue(config.source === data._contextState.source);
                  assert.deepEqual(data._filter, {test1: 'test1'});
                  resolve();
               });
            });
         });

         it('rootChanged', async () => {
            const config = {source: source, keyProperty: 'id', filter: {test: 'test'}, root: '123', parentProperty: 'root'};
            const data = getDataWithConfig(config);

            await data._beforeMount(config);
            const newConfig = {...config};
            delete newConfig.root;
            data._beforeUpdate(newConfig);
            assert.isTrue(!data._contextState.filter.root);
         });

         it('query returns error', function(done) {
            var source = {
               query: function() {
                  const error = new Error('testError');
                  error.processed = true;
                  error.canceled = false;
                  error._isOfflineMode = false;
                  return Promise.reject(error);
               },
               _mixins: [],
               "[Types/_source/ICrud]": true
            };
            var dataLoadErrbackCalled = false;
            var dataLoadErrback = function() {
               dataLoadErrbackCalled = true;
            };
            var config = {source: source, keyProperty: 'id', dataLoadErrback: dataLoadErrback};
            var data = getDataWithConfig(config);

            data._beforeMount(config).then(function() {
               // TODO тест для совместимости, чтоб ничего не разломать
               const soruceControllerState = data._sourceController.getState();
               assert.ok(soruceControllerState.source);
               assert.equal(soruceControllerState.source, source);
               assert.equal(data._contextState.source, source);
               assert.isTrue(dataLoadErrbackCalled);
               done();
            });
         });

         it('_beforeMount with error data', function(done) {
            var queryCalled = false;
            var source = {
               query: function() {
                  queryCalled = true;
                  return Deferred.fail(error);
               },
               _mixins: [],
               "[Types/_source/ICrud]": true
            };

            var dataLoadErrbackCalled = false;
            var dataLoadErrback = function() {
               dataLoadErrbackCalled = true;
            };
            var error = new Error('test');
            error.processed = true;

            var config = {source: source, keyProperty: 'id', dataLoadErrback: dataLoadErrback};
            var promise = getDataWithConfig(config)._beforeMount(config);
            assert.instanceOf(promise, Promise);
            promise.then(function(result) {
               assert.equal(result, error);
               assert.isTrue(dataLoadErrbackCalled);
               assert.isTrue(queryCalled);
               done();
            }).catch(function(error) {
               done(error);
            });
         });

         it('_beforeUnmount with sourceController in options', async() => {
            const sourceController = new dataSourceLib.NewSourceController({ source: source, keyProperty: 'id' });
            const dataOptions = { source, sourceController, keyProperty: 'id' };
            let isSourceControllerDestroyed = false;
            sourceController.destroy = () => {
               isSourceControllerDestroyed = true;
            };
            await sourceController.reload();
            const data = getDataWithConfig(dataOptions);
            await data._beforeMount(dataOptions);
            data._beforeUnmount();
            assert.isFalse(isSourceControllerDestroyed);
         });
      });
   });
