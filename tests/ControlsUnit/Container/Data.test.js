define(
   [
      'Controls/list',
      'Types/source',
      'Controls/context',
      'Core/Deferred',
      'Types/collection',
      'Application/Initializer',
      'Application/Env',
      'Env/Config'
   ],
   function(lists, sourceLib, contexts, Deferred, collection, AppInit, AppEnv, Config) {
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

            data._beforeMount(dataOptions).then(() => {
               data._dataOptionsContext = new contexts.ContextOptions();
               const prefetchSource = data._dataOptionsContext.prefetchSource;
               const newFilter = {test: 'testFilter'};
               var loadDef = data._beforeUpdate({source: newSource, idProperty: 'id', filter: newFilter});
               assert.isTrue(data._loading);
               loadDef.addCallback(function() {
                  try {
                     assert.isTrue(data._dataOptionsContext.prefetchSource !== prefetchSource);
                     assert.deepEqual(data._filter, newFilter);
                     assert.isFalse(data._loading);
                     done();
                  } catch (e) {
                     done(e);
                  }
               });
            });
         });

         it('source and filter/navigation changed', async () => {
            const dataOptions = {source: source, keyProperty: 'id'};
            const data = getDataWithConfig(dataOptions);
            data._dataOptionsContext = new contexts.ContextOptions();

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
            assert.isUndefined(data._dataOptionsContext.navigation);

            return new Promise((resolve, reject) => {
               loadDef
                  .addCallback(() => {
                     assert.deepEqual(data._dataOptionsContext.navigation, newNavigation);
                     assert.deepEqual(data._dataOptionsContext.filter, newFilter);
                     resolve();
                  })
                  .addErrback((error) => {
                     reject(error);
                  });
            });
         });

         it('_beforeMount with receivedState', function() {
            let data = getDataWithConfig({source: source, keyProperty: 'id'});
            let newSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: sourceData
            });
            let resetCallback = setNewEnvironmentValue(true);
            data._beforeMount({source: newSource, idProperty: 'id'}, {}, sourceData);

            assert.deepEqual(data._items, sourceData);

            // TODO тест для совместимости, чтоб ничего не разломать
            const prefSource = data._sourceController.getState().prefetchSource;
            assert.isTrue(!!prefSource);

            resetCallback();
         });

         it('_beforeMount with receivedState and prefetchProxy', function() {
            let memory = new sourceLib.Memory({
               keyProperty: 'id',
               data: sourceData
            });
            let prefetchSource = new sourceLib.PrefetchProxy({
               target: memory,
               data: {
                  query: sourceData
               }
            });
            let data = getDataWithConfig({source: prefetchSource, keyProperty: 'id'});
            let resetCallback = setNewEnvironmentValue(true);

            data._beforeMount({source: prefetchSource, idProperty: 'id'}, {}, sourceData);

            // TODO тест для совместимости, чтоб ничего не разломать
            const prefSource = data._sourceController.getState().prefetchSource;
            assert.isTrue(prefSource.getOriginal() === memory);
            assert.isTrue(prefSource !== prefetchSource);
            assert.equal(prefSource._$data.query, sourceData);

            resetCallback();
         });

         it('_beforeMount with prefetchProxy', async function() {
            let memory = new sourceLib.Memory({
               keyProperty: 'id',
               data: sourceData
            });
            let prefetchSource = new sourceLib.PrefetchProxy({
               target: memory,
               data: {
                  query: sourceData
               }
            });
            let data = getDataWithConfig({source: prefetchSource, keyProperty: 'id'});

            await data._beforeMount({source: prefetchSource, idProperty: 'id'}, {}, sourceData);

            // TODO тест для совместимости, чтоб ничего не разломать
            const prefSource = data._sourceController.getState().prefetchSource;
            assert.isTrue(prefSource.getOriginal() === memory);
            assert.isTrue(prefSource !== prefetchSource);
            assert.equal(prefSource._$data.query, sourceData);
         });

         it('_beforeMount without source', () => {
            const filter = {
               testField: 'testValue'
            };
            const dataOptions = { keyProperty: 'id', filter };
            const data = getDataWithConfig(dataOptions);

            data._beforeMount(dataOptions);
            assert.deepEqual(data._dataOptionsContext.filter, filter);
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

         it('_itemsReadyCallbackHandler', async function() {
            const options = {source: source, keyProperty: 'id'};
            let data = getDataWithConfig(options);
            await data._beforeMount(options);

            const currentItems = data._items;
            const newItems = new collection.RecordSet();

            data._itemsReadyCallbackHandler(newItems);
            assert.isTrue(data._items === newItems);
         });

         it('data source options tests', function(done) {
            var config = {source: null, keyProperty: 'id'},
               data = getDataWithConfig(config);

            //creating without source
            data._beforeMount(config);

            assert.equal(data._source, null);
            assert.isTrue(!!data._dataOptionsContext);

            //new source received in _beforeUpdate
            data._beforeUpdate({source: source}).addCallback(function() {
               assert.isTrue(data._sourceController._options.source === source);

               // TODO тест для совместимости, чтоб ничего не разломать
               const prefSource = data._sourceController.getState().prefetchSource;
               assert.isTrue(!!prefSource);
               done();
            });
         });

         it('update source', function(done) {
            const config = {source: source, keyProperty: 'id'};
            const data = getDataWithConfig(config);

            data._beforeMount(config).addCallback(function() {
               const prefetchSource = data._dataOptionsContext.prefetchSource;
               data._beforeUpdate({source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: sourceDataEdited
                  }), idProperty: 'id'}).addCallback(function() {
                  assert.isTrue(prefetchSource !== data._dataOptionsContext.prefetchSource);
                  done();
               });
            });
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
                  data: [{
                     id: 0,
                     title: 'Ivan'
                  }],
                  keyProperty: 'id'
               });
               data._itemsChanged(event, newList);
               assert.isTrue(!data._items.getRecordById(0), 'items changed instead of prefetchSource');
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
                  assert.isTrue(config.source === data._dataOptionsContext.prefetchSource);

                  // TODO тест для совместимости, чтоб ничего не разломать
                  const filter = data._sourceController.getState().filter;
                  assert.deepEqual(filter, {test1: 'test1'});
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
            assert.isTrue(!data._dataOptionsContext.filter.root);
         });

         it('query returns error', function(done) {
            var source = {
               query: function() {
                  return Deferred.fail({
                     canceled: false,
                     processed: false,
                     _isOfflineMode: false
                  });
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
               const prefetchSource = data._sourceController.getState().prefetchSource;
               assert.isTrue(!!prefetchSource);
               assert.equal(data._sourceController._options.source, source);
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

         it('_beforeMount with collapsed groups', function(done) {
            var data = new sourceLib.DataSet();
            var queryCalled = false;
            let queryFilter;

            var source = {
               query: function(query) {
                  queryCalled = true;
                  queryFilter = query.getWhere();
                  return Deferred.success(data);
               },
               _mixins: [],
               "[Types/_source/ICrud]": true
            };
            var dataLoadErrbackCalled = false;
            var dataLoadErrback = function() {
               dataLoadErrbackCalled = true;
            };

            var config = {source: source, keyProperty: 'id', dataLoadErrback: dataLoadErrback, groupProperty: 'prop', historyIdCollapsedGroups: 'gid' };
            var self = getDataWithConfig(config);
            self._filter = {};
            const originConfigGetParam = Config.UserConfig.getParam;
            Config.UserConfig.getParam = (preparedStoreKey) => {
               if (preparedStoreKey === 'LIST_COLLAPSED_GROUP_gid') {
                  return Promise.resolve('[1, 3]');
               }
               return originConfigGetParam();
            };


            var promise = self._beforeMount(config);
            assert.instanceOf(promise, Promise);
            promise.then(function() {
               assert.isFalse(dataLoadErrbackCalled);
               assert.isTrue(queryCalled);
               Config.UserConfig.getParam = originConfigGetParam;
               assert.deepEqual(queryFilter, { collapsedGroups: [1, 3] });
               done();
            }).catch(function(error) {
               Config.UserConfig.getParam = originConfigGetParam;
               done(error);
            });
         });
      });
   });
