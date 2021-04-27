/**
 * Created by kraynovdo on 23.10.2017.
 */
define([
   'Types/source',
   'Types/collection',
   'Controls/list',
   'Controls/tree',
   'Controls/treeGridOld',
   'Controls/gridOld',
   'Controls/toolbars',
   'Core/Deferred',
   'Core/core-instance',
   'Env/Env',
   'Core/core-clone',
   'Types/entity',
   'Controls/Application/SettingsController',
   'Controls/popup',
   'Controls/listDragNDrop',
   'Controls/dragnDrop',
   'Controls/listRender',
   'Controls/itemActions',
   'Controls/dataSource',
   'Core/polyfill/PromiseAPIDeferred'
], function(sourceLib, collection, lists, tree, treeGrid, grid, tUtil, cDeferred, cInstance, Env, clone, entity, SettingsController, popup, listDragNDrop, dragNDrop, listRender, itemActions, dataSource) {
   describe('Controls.List.BaseControl', function() {
      var data, result, source, rs, sandbox;

      function getCorrectBaseControlConfig(cfg) {
         let sourceController;

         // Эмулируем, что в baseControl передан sourceController
         if (cfg.source) {
            sourceController = new dataSource.NewSourceController({
               source: cfg.source,
               keyProperty: cfg.keyProperty || cfg.source.getKeyProperty(),
               navigation: cfg.navigation,
               sorting: cfg.sorting,
               dataLoadCallback: cfg.dataLoadCallback
            });

            if (cfg.source._$data) {
               let rawData, items;

               if (cfg.navigation && cfg.navigation.sourceConfig && cfg.navigation.sourceConfig.pageSize) {
                  rawData = cfg.source._$data.slice(0, cfg.navigation.sourceConfig.pageSize);
               } else {
                  rawData = cfg.source._$data;
               }
               items = new collection.RecordSet({
                  rawData: rawData,
                  keyProperty: cfg.keyProperty || cfg.source.getKeyProperty()
               });
               items.setMetaData({
                  more: cfg.source._$data.length
               });
               sourceController.setItems(items);
            }

            cfg.sourceController = sourceController;
         }
         return cfg;
      }

      async function getCorrectBaseControlConfigAsync(cfg) {
         // Эмулируем, что в baseControl передан sourceController
         let sourceController;
         if (cfg.source) {
            sourceController = new dataSource.NewSourceController({
               source: cfg.source,
               keyProperty: cfg.keyProperty || cfg.source.getKeyProperty(),
               navigation: cfg.navigation,
               sorting: cfg.sorting,
               root: cfg.root !== undefined ? cfg.root : null,
               dataLoadCallback: cfg.dataLoadCallback
            });

            await sourceController.load();
            cfg.sourceController = sourceController;
         }

         return cfg;
      }

      function correctCreateBaseControl(cfg, asyncCreate) {
         const baseControl = new lists.BaseControl(getCorrectBaseControlConfig(cfg, asyncCreate));
         baseControl._children = {
            scrollObserver: { startRegister: () => null }
         };
         return baseControl;
      }

      async function correctCreateBaseControlAsync(cfg) {
         const config = await getCorrectBaseControlConfigAsync(cfg);
         const baseControl = new lists.BaseControl(config);
         baseControl._children = {
            scrollObserver: { startRegister: () => null }
         };
         return baseControl;
      }
      beforeEach(function() {
         data = [
            {
               id: 1,
               title: 'Первый',
               type: 1
            },
            {
               id: 2,
               title: 'Второй',
               type: 2
            },
            {
               id: 3,
               title: 'Третий',
               type: 2,
               'parent@': true
            },
            {
               id: 4,
               title: 'Четвертый',
               type: 1
            },
            {
               id: 5,
               title: 'Пятый',
               type: 2
            },
            {
               id: 6,
               title: 'Шестой',
               type: 2
            }
         ];
         source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data,
            filter: function(item, filter) {
               var result = true;

               if (filter['id'] && filter['id'] instanceof Array) {
                  result = filter['id'].indexOf(item.get('id')) !== -1;
               }

               return result;
            }

         });
         rs = new collection.RecordSet({
            keyProperty: 'id',
            rawData: data
         });
         sandbox = sinon.createSandbox();
         global.window = {
            requestAnimationFrame: (callback) => {
               callback();
            }
         };
      });
      afterEach(function() {
         global.window = undefined;
         sandbox.restore();
      });
      it('life cycle', async function() {
         var dataLoadFired = false;
         var filter = {
            1: 1,
            2: 2
         };
         var cfg = {
            viewName: 'Controls/List/ListView',
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            source: source,
            filter: filter
         };
         var ctrl = await correctCreateBaseControlAsync(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);

         assert.isTrue(!!ctrl._sourceController, '_dataSourceController wasn\'t created before mounting');
         assert.deepEqual(filter, ctrl._options.filter, 'incorrect filter before mounting');
      });

      it('beforeMount: right indexes with virtual scroll and receivedState', async () => {
         var cfg = {
            viewName: 'Controls/List/ListView',
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            navigation: {
               view: 'infinity',
               source: 'page',
               sourceConfig: {
                  pageSize: 10,
                  page: 0,
                  hasMore: false
               }
            },
            virtualScrollConfig: {
               pageSize: 100
            },
            viewModelConstructor: lists.ListViewModel,
            source: source
         };
         var ctrl = await correctCreateBaseControlAsync(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg, null);
         assert.equal(ctrl.getViewModel().getStartIndex(), 0);
         assert.equal(ctrl.getViewModel().getStopIndex(), 6);
      });

      it('_private::getSortingOnChange', function() {
         const emptySorting = [];
         const sortingASC = [{ test: 'ASC' }];
         const sortingDESC = [{ test: 'DESC' }];

         assert.deepEqual(lists.BaseControl._private.getSortingOnChange(emptySorting, 'test'), sortingDESC);
         assert.deepEqual(lists.BaseControl._private.getSortingOnChange(sortingDESC, 'test'), sortingASC);
         assert.deepEqual(lists.BaseControl._private.getSortingOnChange(sortingASC, 'test'), emptySorting);
      });

      it('_private::needLoadNextPageAfterLoad', function() {
         let list = new collection.RecordSet({
            rawData: [
               {
                  id: 0,
                  title: 'test'
               }
            ]
         });
         let emptyList = new collection.RecordSet({});
         let metaMore = {
            more: true
         };
         let infinityNavigation = {
            view: 'infinity',
            viewConfig: {}
         };
         let maxCountNaviation = {
            view: 'maxCount',
            viewConfig: {
               maxCountValue: 10
            }
         };
         let itemsCount = 1;
         let listViewModel = {
            getCount: () => itemsCount
         };
         emptyList.setMetaData(metaMore);
         list.setMetaData(metaMore);

         assert.isTrue(lists.BaseControl._private.needLoadNextPageAfterLoad(emptyList, listViewModel, infinityNavigation));
         assert.isTrue(lists.BaseControl._private.needLoadNextPageAfterLoad(emptyList, listViewModel, maxCountNaviation));

         assert.isFalse(lists.BaseControl._private.needLoadNextPageAfterLoad(list, listViewModel, infinityNavigation));
         assert.isTrue(lists.BaseControl._private.needLoadNextPageAfterLoad(list, listViewModel, maxCountNaviation));


         itemsCount = 20;
         assert.isFalse(lists.BaseControl._private.needLoadNextPageAfterLoad(list, listViewModel, infinityNavigation));
         assert.isFalse(lists.BaseControl._private.needLoadNextPageAfterLoad(list, listViewModel, maxCountNaviation));
      });

      it('_private::checkLoadToDirectionCapability', () => {
         const self = {_options: {}};
         const sandbox = sinon.createSandbox();
         const myFilter = {testField: 'testValue'};
         const resultNavigation = 'testNavigation';
         let maxCountNavigation;

         self._needScrollCalculation = false;
         // loadToDirectionIfNeed вызывается с фильтром, переданным в checkLoadToDirectionCapability
         sandbox.replace(lists.BaseControl._private, 'needLoadByMaxCountNavigation', (model, navigation) => {
            maxCountNavigation = navigation;
         });
         sandbox.replace(lists.BaseControl._private, 'loadToDirectionIfNeed', (baseControl, direction, filter) => {
            assert.equal(direction, 'down');
            assert.deepEqual(filter, myFilter);
         });
         lists.BaseControl._private.checkLoadToDirectionCapability(self, myFilter, resultNavigation);
         assert.equal(resultNavigation, maxCountNavigation);
         sandbox.restore();
      });

      describe('_private::loadToDirectionIfNeed', () => {
         const getInstanceMock = function() {
            return {
               _hasMoreData: () => true,
               _sourceController: {
                  isLoading: () => false
               },
               _loadedItems: new collection.RecordSet(),
               _options: {
                  navigation: {}
               }
            };
         };

         it('hasMoreData:true', () => {
            const self = getInstanceMock();
            const sandbox = sinon.createSandbox();
            let isLoadStarted;

            // navigation.view !== 'infinity'
            sandbox.replace(lists.BaseControl._private, 'needScrollCalculation', () => false);
            sandbox.replace(lists.BaseControl._private, 'setHasMoreData', () => null);
            sandbox.replace(lists.BaseControl._private, 'loadToDirection', () => {
               isLoadStarted = true;
            });

            lists.BaseControl._private.loadToDirectionIfNeed(self);
            assert.isTrue(isLoadStarted);
            sandbox.restore();
         });

         it('iterative search', () => {
            const self = getInstanceMock();
            const sandbox = sinon.createSandbox();
            let isLoadStarted;
            let shouldSearch;

            self._items = new collection.RecordSet();
            self._items.setMetaData({
               iterative: true
            });
            self._portionedSearch = {
               shouldSearch: () => {
                  return shouldSearch;
               }
            };
            self._loadedItems = new collection.RecordSet();

            // navigation.view !== 'infinity'
            sandbox.replace(lists.BaseControl._private, 'needScrollCalculation', () => false);
            sandbox.replace(lists.BaseControl._private, 'setHasMoreData', () => null);
            sandbox.replace(lists.BaseControl._private, 'loadToDirection', () => {
               isLoadStarted = true;
            });

            shouldSearch = true;
            lists.BaseControl._private.loadToDirectionIfNeed(self);
            assert.isTrue(isLoadStarted);

            shouldSearch = false;
            isLoadStarted = false;
            lists.BaseControl._private.loadToDirectionIfNeed(self);
            assert.isFalse(isLoadStarted);

            sandbox.restore();
         });
      });

      it('setHasMoreData', async function() {
         var gridColumns = [
            {
               displayProperty: 'title',
               width: '1fr',
               valign: 'top',
               style: 'default',
               textOverflow: 'ellipsis'
            },
            {
               displayProperty: 'price',
               width: 'auto',
               align: 'right',
               valign: 'bottom',
               style: 'default'
            },
            {
               displayProperty: 'balance',
               width: 'auto',
               align: 'right',
               valign: 'middle',
               style: 'default'
            }
         ];
         var gridData = [
            {
               'id': '123',
               'title': 'Хлеб',
               'price': 50,
               'balance': 15
            },
         ];
         var source = new sourceLib.Memory({
            idProperty: 'id',
            data: gridData,
         });
         var sourceController = new dataSource.NewSourceController({
            source: source,
            keyProperty: 'id'
         });
         sourceController.setItems(new collection.RecordSet({ rawData: gridData }));
         var cfg = {
            viewName: 'Controls/Grid/GridView',
            source: source,
            sourceController: sourceController,
            displayProperty: 'title',
            columns: gridColumns,
            resultsPosition: 'top',
            keyProperty: 'id',
            navigation: {
               view: 'infinity',
               source: 'page',
               sourceConfig: {
                  pageSize: 2,
                  page: 0,
                  hasMore: false
               }
            },
            virtualScrollConfig: {
               pageSize: 100
            },
            viewModelConstructor: grid.GridViewModel,
         };
         var ctrl = correctCreateBaseControl(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         assert.equal(undefined, ctrl.getViewModel()
            .getResultsPosition());

         ctrl._sourceController.hasMoreData = () => true;
         await ctrl.reload();
         assert.equal('top', ctrl.getViewModel()
            .getResultsPosition());
      });


      it('errback to callback', function() {
         return new Promise(function(resolve, reject) {
            var source = new sourceLib.Memory({
               data: [{
                  id: 11,
                  key: 1,
                  val: 'first'
               }, {
                  id: 22,
                  key: 2,
                  val: 'second'
               }]
            });

            var cfg = {
               keyProperty: 'key',
               viewName: 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'key'
               },
               viewModelConfig: {
                  items: [],
                  keyProperty: 'key'
               },
               viewModelConstructor: lists.ListViewModel
            };

            var ctrl = correctCreateBaseControl(cfg);


            ctrl.saveOptions(cfg);
            ctrl._beforeMount(cfg)
               .addCallback(function() {
                  try {
                     assert.equal(ctrl._items.getKeyProperty(), cfg.keyProperty);
                  } catch (e) {
                     reject(e);
                  }

                  // emulate loading error
                  ctrl._sourceController.load = function() {
                     var def = new cDeferred();
                     def.errback();
                     return def;
                  };

               lists.BaseControl._private.reload(ctrl, ctrl._options)
                  .addCallback(function() {
                     resolve();
                  })
                  .addErrback(function(error) {
                     reject(error);
                  });
            }).addErrback((error) => {
               reject(error);
            });
         }).then(() => {
            console.log('ergerg');
         }).catch(() => {
            console.log('ergerg');
         });
      });

      it('check dataLoadCallback and afterReloadCallback calling order', async function() {
         let dataLoadCallbackCalled = false;
         let afterReloadCallbackCalled = false;
         const cfg = {
            viewName: 'Controls/List/ListView',
            source: new sourceLib.Memory({}),
            viewModelConstructor: lists.ListViewModel,
            keyProperty: 'id',
            dataLoadCallback: function() {
               dataLoadCallbackCalled = true;
            }
         };
         const ctrl = await correctCreateBaseControlAsync(cfg);

         const localSandbox = sinon.createSandbox();

         localSandbox.replace(ctrl, '_afterReloadCallback', () => {
            afterReloadCallbackCalled = true;
         });

         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);

         assert.isTrue(afterReloadCallbackCalled, 'afterReloadCallbackCalled is not called.');
         assert.isTrue(dataLoadCallbackCalled, 'dataLoadCallback is not called.');

         afterReloadCallbackCalled = false;
         dataLoadCallbackCalled = false;

         await ctrl.reload();

         assert.isTrue(afterReloadCallbackCalled, 'afterReloadCallbackCalled is not called.');
         assert.isTrue(dataLoadCallbackCalled, 'dataLoadCallback is not called.');

         // emulate reload with error
         ctrl._sourceController.reload = function() {
            return cDeferred.fail();
         };

         afterReloadCallbackCalled = false;
         dataLoadCallbackCalled = false;

         await ctrl.reload();

         assert.isTrue(afterReloadCallbackCalled, 'afterReloadCallbackCalled is not called.');
         assert.isFalse(dataLoadCallbackCalled, 'dataLoadCallback is called.');
      });

      it('save loaded items into the controls\' state', async function () {
         var source = new sourceLib.Memory({});
         var sourceController = new dataSource.NewSourceController({
            source: source,
            keyProperty: 'id'
         });
         sourceController.setItems(new collection.RecordSet());
         var
             cfg = {
                viewName: 'Controls/List/ListView',
                source: source,
                sourceController: sourceController,
                viewModelConstructor: lists.ListViewModel,
                keyProperty: 'id'
             },
             loadedItems = new collection.RecordSet({
                keyProperty: 'id',
                rawData: [
                   {
                      id: 1,
                      title: 'qwe'
                   }
                ]
             }),
             ctrl = correctCreateBaseControl(cfg);

         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);

         // Empty list
         assert.isUndefined(ctrl._loadedItems);

         ctrl._sourceController.reload = () => ({
            addCallback(fn) {
               fn(loadedItems);
               return {
                  addErrback: () => {}
               };
            }
         });

         await ctrl.reload();

         assert.deepEqual(ctrl._loadedItems, loadedItems);
      });

      it('call itemsReadyCallback on recreation RS', async function () {
         var source = new sourceLib.Memory({});
         var sourceController = new dataSource.NewSourceController({
            source: source,
            keyProperty: 'id'
         });
         sourceController.setItems(new collection.RecordSet());
         let isItemsReadyCallbackSetted = false;
         const itemsReadyCallback = () => {
            isItemsReadyCallbackSetted = true;
         };
         var
             cfg = {
                viewName: 'Controls/List/ListView',
                source: source,
                sourceController: sourceController,
                viewModelConstructor: lists.ListViewModel,
                keyProperty: 'id',
                itemsReadyCallback
             },
             ctrl = new lists.BaseControl(cfg);

         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);

         lists.BaseControl._private.assignItemsToModel(ctrl, new collection.RecordSet({
            keyProperty: 'id',
            rawData: [ { id: 2, title: 'qwe' } ]
         }), cfg);

         assert.isTrue(isItemsReadyCallbackSetted);
      });

      it('_private.checkPortionedSearchByScrollTriggerVisibility', () => {
         const self = {};
         lists.BaseControl._private.checkPortionedSearchByScrollTriggerVisibility(self, false);

         assert.isTrue(!self._portionedSearch);

         self._portionedSearchInProgress = true;
         lists.BaseControl._private.checkPortionedSearchByScrollTriggerVisibility(self, false);

         assert.isTrue(self._portionedSearch._searchTimer !== null);
         self._portionedSearch._clearTimer();
      });

      it('_needScrollCalculation', function(done) {
         var source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });

         var dataLoadFired = false;

         var cfg = {
            viewName: 'Controls/List/ListView',
            dataLoadCallback: function() {
               dataLoadFired = true;
            },
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel
         };

         var ctrl = correctCreateBaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);
         assert.isNotOk(ctrl._needScrollCalculation, 'Wrong _needScrollCalculation value after mounting');

         cfg = {
            viewName: 'Controls/List/ListView',
            dataLoadCallback: function() {
               dataLoadFired = true;
            },
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            navigation: {
               view: 'infinity',
               source: 'page',
               sourceConfig: {
                  pageSize: 2,
                  page: 0,
                  hasMore: false
               }
            }
         };
         setTimeout(function() {
            ctrl._beforeUpdate(cfg);
            assert.isTrue(ctrl._needScrollCalculation, 'Wrong _needScrollCalculation value after updating');
            done();
         }, 1);

         ctrl = correctCreateBaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);
         assert.isTrue(ctrl._needScrollCalculation, 'Wrong _needScrollCalculation value after mounting');
      });

      it('loadToDirection down', async function() {
         let source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });
         let dataLoadFired = false;
         const cfg = {
            viewName: 'Controls/List/ListView',
            dataLoadCallback: function() {
               dataLoadFired = true;
            },
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 2,
                  page: 0,
                  hasMore: false
               }
            },
            root: 'testRoot',
            searchValue: 'test'
         };

         var ctrl = await correctCreateBaseControlAsync(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._container = {
            getElementsByClassName: () => ([{ clientHeight: 100, offsetHeight: 0 }]),
            getBoundingClientRect: function() { return {}; }
         };
         ctrl._afterMount(cfg);

         ctrl._portionedSearch = lists.BaseControl._private.getPortionedSearch(ctrl);

         let loadPromise = lists.BaseControl._private.loadToDirection(ctrl, 'down');
         assert.equal(ctrl._loadingState, 'down');
         ctrl._portionedSearch.continueSearch();
         await loadPromise;
         assert.isTrue(ctrl._portionedSearchInProgress);
         assert.isNull(ctrl._showContinueSearchButtonDirection);
         assert.equal(4, lists.BaseControl._private.getItemsCount(ctrl), 'Items wasn\'t load');
         assert.isTrue(dataLoadFired, 'dataLoadCallback is not fired');
         assert.equal(ctrl._loadingState, null);
         assert.isTrue(ctrl._listViewModel.getHasMoreData());
         assert.isTrue(ctrl._sourceController.hasMoreData('down', 'testRoot'));

         loadPromise = lists.BaseControl._private.loadToDirection(ctrl, 'down');
         await loadPromise;
         assert.isFalse(ctrl._portionedSearchInProgress);
         assert.isNull(ctrl._showContinueSearchButtonDirection);
         assert.isFalse(ctrl._listViewModel.getHasMoreData());
      });

      // Тест отключен до решения задачи https://online.sbis.ru/opendoc.html?guid=51841686-80a2-4ae9-9362-fd9f8c2a293b
      // т.к. на данный момент потребности в serviceDataLoadCallback больше нет и он был выпилен
      xit('loadToDirection down with portioned load', async function() {
         const source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });
         let isIterativeSearch = false;
         let ladingIndicatorTimer;
         const setIterativeMetaData = (items) => {
            if (items) {
               let metaData = items.getMetaData();
               metaData.iterative = isIterativeSearch;
               items.setMetaData(metaData);
            }
         };

         const cfg = {
            viewName: 'Controls/List/ListView',
            dataLoadCallback: function() {
               dataLoadFired = true;
            },
            serviceDataLoadCallback: function(currentItems, loadedItems) {
               setIterativeMetaData(loadedItems);
               setIterativeMetaData(loadedItems);
            },
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 2,
                  page: 0,
                  hasMore: false
               }
            }
         };
         var ctrl = await correctCreateBaseControlAsync(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._container = {
            getElementsByClassName: () => ([{ clientHeight: 100, offsetHeight: 0 }]),
            getBoundingClientRect: function() { return {}; }
         };
         ctrl._afterMount(cfg);
         ctrl._portionedSearch = lists.BaseControl._private.getPortionedSearch(ctrl);

         isIterativeSearch = true;
         setIterativeMetaData(ctrl._items);
         await lists.BaseControl._private.loadToDirection(ctrl, 'down');
         ladingIndicatorTimer = ctrl._loadingIndicatorTimer;
         assert.isTrue(ctrl._portionedSearchInProgress);
         assert.isNull(ctrl._showContinueSearchButtonDirection);
         assert.isNull(ctrl._loadingIndicatorTimer);

         let loadingIndicatorTimer = setTimeout(() => {});
         ctrl._loadingIndicatorTimer = loadingIndicatorTimer;
         await lists.BaseControl._private.loadToDirection(ctrl, 'up');
         assert.isTrue(ctrl._portionedSearchInProgress);
         assert.isTrue(loadingIndicatorTimer !== ctrl._loadingIndicatorTimer, 'loading indicator timer did not reset');

         isIterativeSearch = false;
         await lists.BaseControl._private.loadToDirection(ctrl, 'down');
         assert.isFalse(ctrl._portionedSearchInProgress);
      });

      it('loadToDirection down with getHasMoreData option', async function() {
         const source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });

         const sourceController = new dataSource.NewSourceController({
            source: source,
            keyProperty: 'id'
         });
         sourceController.setItems(new collection.RecordSet({
            rawData: data
         }));

         let dataLoadFired = false;

         const cfg = {
            viewName: 'Controls/List/ListView',
            dataLoadCallback: function() {
               dataLoadFired = true;
            },
            source: source,
            sourceController: sourceController,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 2,
                  page: 0,
                  hasMore: false
               }
            },
            getHasMoreData: function(sourceController, direction) {
               return sourceController.hasMoreData(direction);
            }
         };

         var ctrl = correctCreateBaseControl(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._container = {
            getElementsByClassName: () => ([{ clientHeight: 100, offsetHeight: 0 }]),
            getBoundingClientRect: function() { return {}; }
         };
         ctrl._afterMount(cfg);

         let loadPromise = lists.BaseControl._private.loadToDirection(ctrl, 'down');
         assert.equal(ctrl._loadingState, 'down');
         await loadPromise;

         assert.equal(4, lists.BaseControl._private.getItemsCount(ctrl), 'Items wasn\'t load');
         assert.isTrue(dataLoadFired, 'dataLoadCallback is not fired');
         assert.equal(ctrl._loadingState, null);
         assert.isTrue(ctrl._listViewModel.getHasMoreData());

         loadPromise = lists.BaseControl._private.loadToDirection(ctrl, 'down');
         await loadPromise;
         assert.isFalse(ctrl._listViewModel.getHasMoreData());
      });

      describe('_continueSearch', () => {
         let moreDataUp;
         let moreDataDown;
         let sandbox;
         let baseControl;
         let sourceController;
         let loadDirection;

         beforeEach(() => {
            moreDataUp = false;
            moreDataDown = false;
            sandbox = sinon.createSandbox();
            baseControl = new lists.BaseControl({});
            sourceController = {
               hasMoreData: direction => (direction === 'up' ? moreDataUp : moreDataDown)
            };
            baseControl._sourceController = sourceController;
            sandbox.replace(lists.BaseControl._private, 'loadToDirectionIfNeed', (self, direction) => {
               loadDirection = direction;
            });
         });

         afterEach(() => {
            sandbox.restore();
         });

         it('continue search up', () => {
            moreDataUp = true;
            baseControl._continueSearch();
            assert.equal(loadDirection, 'up');
         });

         it('continue search down', () => {
            moreDataDown = true;
            baseControl._continueSearch();
            assert.equal(loadDirection, 'down');
         });
      });

      it('_private.hasMoreData', function() {
         let hasMoreDataResult = false;
         const self = {
            _options: {}
         };
         const sourceController = {
            hasMoreData: () => {
               return hasMoreDataResult;
            }
         };
         const ctrl = new lists.BaseControl({});
         assert.isFalse(ctrl._hasMoreData(sourceController));
         assert.isFalse(ctrl._hasMoreData());

         hasMoreDataResult = true;
         assert.isTrue(ctrl._hasMoreData(sourceController));
      });

      it('isPortionedLoad',  () => {
         const baseControl = {
            _options: {}
         };

         baseControl._options.searchValue = 'test';
         assert.ok(lists.BaseControl._private.isPortionedLoad(baseControl))

         baseControl._options.searchValue = '';
         baseControl._items = null;
         assert.ok(!lists.BaseControl._private.isPortionedLoad(baseControl));

         baseControl._items = new collection.RecordSet();
         assert.ok(!lists.BaseControl._private.isPortionedLoad(baseControl));

         baseControl._items = new collection.RecordSet();
         baseControl._items.setMetaData({
            iterative: false
         });
         assert.ok(!lists.BaseControl._private.isPortionedLoad(baseControl));

         baseControl._options.searchValue = 'test';
         assert.ok(!lists.BaseControl._private.isPortionedLoad(baseControl));
      });


      it('loadToDirection indicator triggerVisibility', async () => {
         var source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });
         const sandbox = sinon.createSandbox();
         sandbox.replace(lists.BaseControl._private, 'updateIndicatorContainerHeight', () => {});

         var dataLoadFired = false;
         var shadowVisibility = true;

         var cfg = {
            viewName: 'Controls/List/ListView',
            dataLoadCallback: function() {
               dataLoadFired = true;
            },
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            navigation: {
               view: 'infinity',
               source: 'page',
               sourceConfig: {
                  pageSize: 2,
                  page: 0,
                  hasMore: false
               }
            },
            searchValue: 'test'
         };

         var ctrl = await correctCreateBaseControlAsync(cfg);
         await ctrl._beforeMount(cfg);
         ctrl.saveOptions(cfg);
         ctrl._container = {
            getElementsByClassName: () => ([{clientHeight: 100, offsetHeight:0}]),
            getBoundingClientRect: () => {}
         };
         ctrl._afterMount(cfg);
         ctrl._loadTriggerVisibility = {
            up: false,
            down: true
         };
         ctrl._isScrollShown = true;
         ctrl._shadowVisibility = {};
         ctrl._portionedSearch = lists.BaseControl._private.getPortionedSearch(ctrl);

         ctrl._loadingIndicatorState = 'down';
         ctrl._hideIndicatorOnTriggerHideDirection = 'down';

         ctrl._items.setMetaData({
            iterative: true
         });
         ctrl._portionedSearchInProgress = true;

         // Up trigger became visible, no changes to indicator
         ctrl.triggerVisibilityChangedHandler('up', true);
         assert.isNotNull(ctrl._loadingIndicatorState);
         assert.isNull(ctrl._showContinueSearchButtonDirection);

         const items = ctrl._items.clone();
         ctrl._items.clear();
         ctrl.triggerVisibilityChangedHandler('down', false);
         assert.isNull(ctrl._showContinueSearchButtonDirection);
         ctrl._items.assign(items);
         ctrl._hideIndicatorOnTriggerHideDirection = 'down';
         ctrl._portionedSearchInProgress = true;

         // Down trigger became hidden, hide the indicator, show "Continue search" button
         ctrl.triggerVisibilityChangedHandler('down', false);
         assert.isNull(ctrl._loadingIndicatorState);
         assert.isTrue(ctrl._showContinueSearchButtonDirection === 'down');

         ctrl._loadTriggerVisibility.down = true;
         ctrl._hideIndicatorOnTriggerHideDirection = 'down';
         ctrl._sourceController.isLoading = () => true;
         ctrl.triggerVisibilityChangedHandler('down', false);
         assert.isTrue(ctrl._hideIndicatorOnTriggerHideDirection === 'down');
         sandbox.restore();
      });

      it('loadToDirection hides indicator with false navigation', async () => {
         var source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });
         const sourceController = new dataSource.NewSourceController({
            source: source,
            keyProperty: 'id'
         });
         sourceController.setItems(new collection.RecordSet({
            rawData: data
         }));

         var dataLoadFired = false;

         var cfg = {
            viewName: 'Controls/List/ListView',
            dataLoadCallback: function() {
               dataLoadFired = true;
            },
            source: source,
            sourceController: sourceController,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            navigation: {
               view: 'infinity',
               source: 'page',
               sourceConfig: {
                  pageSize: 2,
                  page: 0,
                  hasMore: false
               }
            },
            searchValue: 'test'
         };

         var ctrl = correctCreateBaseControl(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._container = {
            getElementsByClassName: () => ([{ clientHeight: 100, offsetHeight: 0 }]),
            getBoundingClientRect: function() { return {}; }
         };
         ctrl._afterMount(cfg);
         ctrl._loadTriggerVisibility = {
            up: false,
            down: true
         };

         ctrl._portionedSearch = lists.BaseControl._private.getPortionedSearch(ctrl);
         ctrl._sourceController.hasMoreData = () => false;

         let loadPromise = lists.BaseControl._private.loadToDirection(ctrl, 'down');
         assert.equal(ctrl._loadingState, 'down');
         ctrl._portionedSearch.continueSearch();
         await loadPromise;

         assert.isNull(ctrl._loadingIndicatorState);
      });

      it('prepareFooter', function() {
         let bcHasMoreData = false;
         var
            baseControl = {
               _options: {},
               _hasMoreData: () => bcHasMoreData
            },
            tests = [
               {
                  data: [
                     baseControl,
                     {
                        navigation: undefined
                     },
                     {}
                  ],
                  result: {
                     _shouldDrawFooter: false
                  }
               },
               {
                  data: [
                     baseControl,
                     {
                        navigation: {}
                     },
                     {}
                  ],
                  result: {
                     _shouldDrawFooter: false
                  }
               },
               {
                  data: [
                     baseControl,
                     {
                        navigation: { view: 'page' }
                     },
                     {}
                  ],
                  result: {
                     _shouldDrawFooter: false
                  }
               },
               {
                  data: [
                     baseControl,
                     {
                        navigation: { view: 'demand' }
                     },
                     {

                     }
                  ],
                  result: {
                     _shouldDrawFooter: false
                  }
               },
               {
                  data: [
                     baseControl,
                     {
                        navigation: { view: 'demand' }
                     },
                     {
                        hasMoreData: function() {
                           return true;
                        },
                        getLoadedDataCount: function() {
                        },
                        getAllDataCount: function() {
                           return true;
                        }
                     }
                  ],
                  result: {
                     _shouldDrawFooter: true,
                     _loadMoreCaption: '...'
                  }
               },
               {
                  data: [
                     baseControl,
                     {
                        navigation: { view: 'demand' }
                     },
                     {
                        hasMoreData: function() {
                           return true;
                        },
                        getLoadedDataCount: function() {
                           return 5;
                        },
                        getAllDataCount: function() {
                           return true;
                        }
                     }
                  ],
                  result: {
                     _shouldDrawFooter: true,
                     _loadMoreCaption: '...'
                  }
               },
               {
                  data: [
                     baseControl,
                     {
                        navigation: { view: 'demand' }
                     },
                     {
                        hasMoreData: function() {
                           return true;
                        },
                        getLoadedDataCount: function() {
                           return 5;
                        },
                        getAllDataCount: function() {
                           return 10;
                        }
                     }
                  ],
                  result: {
                     _shouldDrawFooter: true,
                     _loadMoreCaption: 5
                  }
               }
            ];
         tests.forEach(function (test, index) {
            if (index >= 4) {
               bcHasMoreData = true;
            } else {
               bcHasMoreData = false;
            }
            baseControl._options.groupingKeyCallback = undefined;
            baseControl._items = {
               getCount: () => test.data[2].getLoadedDataCount()
            };
            baseControl._listViewModel = {
               getCount: () => test.data[2].getLoadedDataCount(),
               getCollection: () => ({
                  getMetaData: () => ({
                     more: test.data[2].getAllDataCount()
                  })
               }),
               getDisplay: () => ({
                  '[Controls/_display/Tree]': false,
				  getCount: () => test.data[2].getLoadedDataCount(),
               })
            };
            lists.BaseControl._private.prepareFooter.apply(null, test.data);
            assert.equal(test.data[0]._shouldDrawFooter, test.result._shouldDrawFooter, 'Invalid prepare footer on step #' + index);
            assert.equal(test.data[0]._loadMoreCaption, test.result._loadMoreCaption, 'Invalid prepare footer on step #' + index);

            test.data[1].groupingKeyCallback = () => 123;
            baseControl._listViewModel = {
               isAllGroupsCollapsed: () => true,
               getCount: () => undefined,
               getDisplay: () => ({})
            };
            lists.BaseControl._private.prepareFooter.apply(null, test.data);
            assert.isFalse(test.data[0]._shouldDrawFooter, 'Invalid prepare footer on step #' + index + ' with all collapsed groups');
         });
      });

      it('moveMarker activates the control', async function() {
         const
            cfg = {
               viewModelConstructor: lists.ListViewModel,
               keyProperty: 'key',
               source: new sourceLib.Memory({
                  idProperty: 'key',
                  data: [{
                     key: 1
                  }, {
                     key: 2
                  }, {
                     key: 3
                  }]
               }),
               markedKey: 2
            },
            baseControl = correctCreateBaseControl(cfg),
            originalScrollToItem = lists.BaseControl._private.scrollToItem;

         lists.BaseControl._private.scrollToItem = function() {};
         baseControl.saveOptions(cfg);
         await baseControl._beforeMount(cfg);

         let isActivated = false;
         baseControl.activate = () => {
            isActivated = true;
         };

         baseControl._mounted = true; // fake mounted for activation

         baseControl._onViewKeyDown({
            target: {
               closest: function() {
                  return false;
               }
            },
            stopImmediatePropagation: function() {
            },
            nativeEvent: {
               keyCode: Env.constants.key.down
            },
            preventDefault: function() {
            },
         });

         lists.BaseControl._private.scrollToItem = originalScrollToItem;
      });

      it('moveMarkerToNext && moveMarkerToPrevious while loading', async function() {
         var data = [{
            key: 1
         }, {
            key: 2
         }, {
            key: 3
         }];
         var source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });
         const sourceController = new dataSource.NewSourceController({
            source: source,
            keyProperty: 'id'
         });
         sourceController.setItems(new collection.RecordSet({
            rawData: data
         }));
         var
            cfg = {
               viewModelConstructor: lists.ListViewModel,
               markerVisibility: 'visible',
               keyProperty: 'key',
               source: source,
               sourceController: sourceController
            },
            baseControl = correctCreateBaseControl(cfg);
         baseControl.saveOptions(cfg);
         await baseControl._beforeMount(cfg);
         baseControl._listViewModel.setMarkedKey(1);
         assert.equal(1, baseControl._listViewModel.getMarkedKey());
         baseControl._loadingIndicatorState = 'all';
         baseControl._onViewKeyDown({
            target: {
               closest: function() {
                  return false;
               }
            },
            stopImmediatePropagation: function() {
            },
            nativeEvent: {
               keyCode: Env.constants.key.down
            },
            preventDefault: function() {
            },
         });
         assert.equal(1, baseControl._listViewModel.getMarkedKey());
         baseControl._onViewKeyDown({
            target: {
               closest: function() {
                  return false;
               }
            },
            stopImmediatePropagation: function() {
            },
            nativeEvent: {
               keyCode: Env.constants.key.up
            },
            preventDefault: function() {
            },
         });
         assert.equal(1, baseControl._listViewModel.getMarkedKey());
      });

      it('enterHandler', async function() {
         var
            cfg = {
               viewModelConstructor: lists.ListViewModel,
               markerVisibility: 'visible',
               keyProperty: 'key',
               markedKey: 1,
               multiSelectVisibility: 'visible',
               selectedKeys: [],
               excludedKeys: [],
               selectedKeysCount: 0,
               source: new sourceLib.Memory({
                  keyProperty: 'key',
                  data: [{
                     key: 1
                  }, {
                     key: 2
                  }, {
                     key: 3
                  }]
               }),
               selectedKeys: [],
               excludedKeys: []
            },
            baseControl = correctCreateBaseControl(cfg),
            notified = false;

         baseControl.saveOptions(cfg);
         await baseControl._beforeMount(cfg);

         baseControl._notify = function(e, args, options) {
            notified = true;
            assert.equal(e, 'itemClick');
            assert.deepEqual(options, { bubbling: true });
         };

         let ctrlKey = false;
         function getEvent() {
            return { nativeEvent: { ctrlKey }, isStopped: () => true, stopImmediatePropagation: () => {} }
         }

         // Without marker
         lists.BaseControl._private.enterHandler(baseControl, getEvent());
         assert.isTrue(notified);

         // With CtrlKey
         ctrlKey = true;
         notified = false;
         lists.BaseControl._private.enterHandler(baseControl, getEvent());
         assert.isFalse(notified);
      });

      it('enterHandler while loading', function() {
         let
            myMarkedItem = null,
            notified = false;

         function enterClick(markedItem) {
            const event = { nativeEvent: { ctrlKey: false }, isStopped: () => true, stopImmediatePropagation: () => {} };
            lists.BaseControl._private.enterHandler(
            {
               _options: {useNewModel: false},
               getViewModel: () => ({
                  getMarkedItem: () => myMarkedItem
               }),
               _notify: () => {
                  notified = true;
               },
               _loadingIndicatorState: 'all'
            }, event);
         }

         // Without marker
         enterClick(null);
         assert.isFalse(notified);

         // With marker
         enterClick({ getContents: () => ({ key: 123 }) });
         assert.isFalse(notified);
      });

      describe('_private.keyDownDel', () => {
         let cfg;
         let instance;
         let event;
         let isHandlerCalled;

         function initTest(options) {
            const source = new sourceLib.Memory({
               keyProperty: 'key',
               data: [
                  {
                     key: 1
                  },
                  {
                     key: 2
                  },
                  {
                     key: 3
                  }
               ]
            });
            cfg = getCorrectBaseControlConfig({
               viewName: 'Controls/List/ListView',
               viewModelConfig: {
                  items: [],
                  keyProperty: 'key'
               },
               viewModelConstructor: lists.ListViewModel,
               keyProperty: 'key',
               source,
               ...options
            });
            instance = new lists.BaseControl();
            instance.saveOptions(cfg);
            instance._container = {
               querySelector: (selector) => ({
                  parentNode: {
                     children: [{
                        className: 'controls-ListView__itemV'
                     }]
                  }
               })
            };
            return instance._beforeMount(cfg);
         }

         beforeEach(() => {
            isHandlerCalled = false;
            event = {
               preventDefault: () => {},
               stopImmediatePropagation: () => {}
            };
         });

         it('should work when itemActions are not initialized', async () => {
            await initTest({ itemActions: [{ id: 'delete', handler: () => {isHandlerCalled = true} }, { id: 1 }, { id: 2 }] });

            const controller = lists.BaseControl._private.getMarkerController(instance);
            controller.setMarkedKey(1);
            const spyUpdateItemActions = sinon.spy(lists.BaseControl._private, 'updateItemActions');
            lists.BaseControl._private.keyDownDel(instance, event);
            sinon.assert.called(spyUpdateItemActions);
            assert.isTrue(isHandlerCalled);
            spyUpdateItemActions.restore();
         });

         it('should work when itemActions are initialized', async () => {
            await initTest({ itemActions: [{ id: 'delete', handler: () => {isHandlerCalled = true} }, { id: 1 }, { id: 2 }] });
            lists.BaseControl._private.updateItemActions(instance, cfg);
            instance.setMarkedKey(1);
            const spyUpdateItemActions = sinon.spy(lists.BaseControl._private, 'updateItemActions');
            lists.BaseControl._private.keyDownDel(instance, event);
            sinon.assert.notCalled(spyUpdateItemActions);
            assert.isTrue(isHandlerCalled);
            spyUpdateItemActions.restore();
         });

         it('should not work when no itemActions passed', async () => {
            await initTest();
            instance.setMarkedKey(1);
            lists.BaseControl._private.keyDownDel(instance, event);
            assert.isFalse(isHandlerCalled);
         });

         it('should not work when itemAction "delete" is not passed', async () => {
            await initTest({ itemActions: [{ id: 1 }, { id: 2 }] });
            instance.setMarkedKey(1);
            lists.BaseControl._private.keyDownDel(instance, event);
            assert.isFalse(isHandlerCalled);
         });

         it('should work even when itemAction "delete" is not visible', async () => {
            await initTest({
               itemActions: [{ id: 'delete', handler: () => {isHandlerCalled = true} }, { id: 1 }, { id: 2 }],
               itemActionVisibilityCallback: (action, item) => action.id !== 'delete',
            });
            instance.setMarkedKey(1);
            lists.BaseControl._private.keyDownDel(instance, event);
            assert.isTrue(isHandlerCalled);
         });

         it('should not work when no item is marked', () => {
            initTest({ itemActions: [{ id: 'delete', handler: () => {isHandlerCalled = true} }, { id: 1 }, { id: 2 }] });
            lists.BaseControl._private.keyDownDel(instance, event);
            assert.isFalse(isHandlerCalled);
         });
      });

      it('_private.updateSelectionController', async function() {
         const
            lnSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: data
            }),
            lnCfg = {
               viewName: 'Controls/List/ListView',
               source: lnSource,
               keyProperty: 'id',
               viewModelConstructor: lists.ListViewModel,
               selectedKeys: [1],
               excludedKeys: []
            },
            baseControl = correctCreateBaseControl(lnCfg);


         baseControl.saveOptions(lnCfg);
         await baseControl._beforeMount(lnCfg);

         assert.isTrue(baseControl._listViewModel.getItemBySourceKey(1).isSelected());
         baseControl._beforeUpdate({...lnCfg, selectedKeys: []});
         assert.isFalse(baseControl._listViewModel.getItemBySourceKey(1).isSelected());
      });

      it('loadToDirection up', async function() {
         const source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });

         const cfg = {
            viewName: 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: rs,
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 3,
                  page: 1,
                  hasMore: false
               }
            }
         };
         const baseControl = await correctCreateBaseControlAsync(cfg);
         baseControl.saveOptions(cfg);
         await baseControl._beforeMount(cfg);
         baseControl._container = {
            getElementsByClassName: () => ([
               {clientHeight: 100, getBoundingClientRect: () => ({ y: 0 }) , offsetHeight:0}
            ]),
            clientHeight: 100,
            getBoundingClientRect: () => ({ y: 0 })
         };
         baseControl._afterMount(cfg);

         const loadPromise = lists.BaseControl._private.loadToDirection(baseControl, 'up');
         assert.equal(baseControl._loadingState, 'up');
         await loadPromise;
         assert.equal(baseControl._loadingState, null);
         assert.equal(6, lists.BaseControl._private.getItemsCount(baseControl), 'Items wasn\'t load');
      });

      it('loadToDirection error and restore', async function() {
         const source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });

         const cfg = {
            viewName: 'Controls/List/ListView',
            source: source,
            viewConfig: { keyProperty: 'id' },
            viewModelConfig: { items: [], keyProperty: 'id' },
            viewModelConstructor: lists.ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 2,
                  page: 0,
                  hasMore: false
               }
            }
         };

         var ctrl = correctCreateBaseControl(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._container = {
            getElementsByClassName: () => ([{ clientHeight: 100, offsetHeight: 0 }]),
            getBoundingClientRect: function() { return {}; }
         };
         ctrl._afterMount(cfg);

         ctrl._sourceController.load = sinon.stub()
            .rejects(new Error('test'))
            .onThirdCall()
            .resolves(
               new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: []
               })
            );

         ctrl.__errorController.process = sinon.stub().callsFake(function(config) {
            return Promise.resolve({
               mode: config.mode,
               options: {}
            });
         });

         // on error
         await lists.BaseControl._private.loadToDirection(ctrl, 'down').catch(() => 1);
         assert.isDefined(ctrl.__error, 'error was not set');
         assert.strictEqual(ctrl.__error.mode, 'inlist', 'wrong errorConfig mode');
         assert.typeOf(ctrl.__error.options.action, 'function', 'wrong action type');
         assert.strictEqual(ctrl.__error.options.showInDirection, 'down', 'wrong error template position');

         // on loading restoring
         await lists.BaseControl._private.loadToDirection(ctrl, 'down')
            .catch(() => ctrl.__error.options.action())
            .then(callback => callback());

         assert.isNull(ctrl.__error, 'error was not hidden after successful loading');
      });

      it('items should get loaded when a user scrolls to the bottom edge of the list', function(done) {
         var rs = new collection.RecordSet({
            keyProperty: 'id',
            rawData: data
         });

         var source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });

         var cfg = {
            viewName: 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: rs,
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            navigation: {
               view: 'infinity',
               source: 'page',
               sourceConfig: {
                  pageSize: 3,
                  page: 0,
                  hasMore: false
               }
            }
         };
         var ctrl = correctCreateBaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);

         // два таймаута, первый - загрузка начального рекордсета, второй - на последюущий запрос
         setTimeout(function() {
            /**
             * _beforeMount will load some items, so _loadedItems will get set. Normally, it will reset in _afterUpdate, but since we don't have lifecycle in tests,
             * we'll reset it here manually.
             */
            ctrl._loadedItems = null;

            lists.BaseControl._private.onScrollLoadEdge(ctrl, 'down');
            setTimeout(function() {
               assert.equal(6, ctrl._listViewModel.getCount(), 'Items weren\\\'t loaded');
               done();
            }, 100);
         }, 100);
      });

      it('indicator', function() {
         var cfg = {};
         var ctrl = correctCreateBaseControl(cfg);
         ctrl._container =  {getElementsByClassName: () => ([{
               getBoundingClientRect: () => ({})
            }]), getBoundingClientRect: () => ({})};
         ctrl._scrollTop = 200;

         assert.equal(ctrl._loadingIndicatorContainerOffsetTop, 0, 'Wrong top offset');
         lists.BaseControl._private.showIndicator(ctrl, 'down');
         assert.isNull(ctrl._loadingState, 'Wrong loading state');
         assert.isNull(ctrl._loadingIndicatorState, 'Wrong loading state');
         assert.equal(ctrl._loadingIndicatorContainerOffsetTop, 0, 'Wrong top offset');

         ctrl._isMounted = true;

         lists.BaseControl._private.showIndicator(ctrl, 'down');
         assert.equal(ctrl._loadingState, 'down', 'Wrong loading state');
         assert.equal(ctrl._loadingIndicatorState, null, 'Wrong loading state');
         assert.equal(ctrl._loadingIndicatorContainerOffsetTop, 0, 'Wrong top offset');

         lists.BaseControl._private.showIndicator(ctrl);
         assert.equal(ctrl._loadingState, 'all', 'Wrong loading state');
         assert.equal(ctrl._loadingIndicatorState, 'all', 'Wrong loading state');
         assert.equal(ctrl._loadingIndicatorContainerOffsetTop, 0, 'Wrong top offset');
         lists.BaseControl._private.hideIndicator(ctrl);

         lists.BaseControl._private.showIndicator(ctrl);
         assert.equal(ctrl._loadingState, 'all', 'Wrong loading state');
         assert.equal(ctrl._loadingIndicatorState, 'all', 'Wrong loading state');
         assert.isTrue(!!ctrl._loadingIndicatorTimer, 'Loading timer should created');
         assert.equal(ctrl._loadingIndicatorContainerOffsetTop, 0, 'Wrong top offset');
         lists.BaseControl._private.hideIndicator(ctrl);

         lists.BaseControl._private.showIndicator(ctrl, 'down');
         assert.equal(ctrl._loadingState, 'down', 'Wrong loading state');

         // картинка должнa появляться через 2000 мс, проверим, что её нет сразу
         assert.isFalse(!!ctrl._showLoadingIndicator, 'Wrong loading indicator image state');

         // искуственно покажем картинку
         ctrl._showLoadingIndicator = true;

         lists.BaseControl._private.hideIndicator(ctrl);
         lists.BaseControl._private.showIndicator(ctrl);
         assert.isTrue(ctrl._loadingIndicatorTimer === ctrl._loadingIndicatorTimer, 'all', 'Loading timer created one more tile');

         // и вызовем скрытие
         lists.BaseControl._private.hideIndicator(ctrl);
         assert.equal(ctrl._loadingState, null, 'Wrong loading state');
         assert.equal(ctrl._loadingIndicatorState, null, 'Wrong loading indicator state');
         assert.isFalse(!!ctrl._showLoadingIndicator, 'Wrong loading indicator image state');
         assert.isFalse(!!ctrl._loadingIndicatorTimer);
      });

      it('_updateShadowModeHandler', () => {
         const updateShadowModeHandler = lists.BaseControl.prototype._updateShadowModeHandler;
         const event = {};
         const control = {
            _options: {
               navigation: {}
            },
            _sourceController: {
               hasMoreData(direction) {
                  return this._hasMoreData[direction];
               },
               _hasMoreData: {
                  up: false,
                  down: false
               }
            },
            _notify(eventName, arguments, params) {
               this.lastNotifiedArguments = arguments;
               this.lastNotifiedParams = params;
            },
            _listViewModel: {
               getCount() { return this.count },
               count: 0
            },
            _isMounted: true
         };

         it('notifies with bubbling', () => {
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 0
            });
            assert.isTrue(control.lastNotifiedParams.bubbling);
         });

         it('with demand navigation', () => {
            control._options.navigation.view = 'demand';
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 0
            });
            assert.deepEqual({top: 'auto', bottom: 'auto'}, control.lastNotifiedArguments[0]);
         });
         it('depend on placeholders', () => {
            updateShadowModeHandler.call(control, event, {
               top: 100,
               bottom: 0
            });
            assert.deepEqual({top: 'visible', bottom: 'auto'}, control.lastNotifiedArguments[0]);
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 100
            });
            assert.deepEqual({top: 'auto', bottom: 'visible'}, control.lastNotifiedArguments[0]);
            updateShadowModeHandler.call(control, event, {
               top: 100,
               bottom: 100
            });
         });
         it('depend on items exist', () => {
            control._options.navigation.view = 'infinity';
            control._sourceController._hasMoreData = {up: true, down: true};
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 0
            });
            assert.deepEqual({top: 'auto', bottom: 'auto'}, control.lastNotifiedArguments[0]);
         });
         it('depend on source controller hasMoreData', () => {
            control._listViewModel.count = 20;
            control._sourceController._hasMoreData = {up: false, down: false};
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 0
            });
            assert.deepEqual({top: 'auto', bottom: 'auto'}, control.lastNotifiedArguments[0]);
            control._sourceController._hasMoreData = {up: true, down: false};
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 0
            });
            assert.deepEqual({top: 'visible', bottom: 'auto'}, control.lastNotifiedArguments[0]);
            control._sourceController._hasMoreData = {up: false, down: true};
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 0
            });
            assert.deepEqual({top: 'auto', bottom: 'visible'}, control.lastNotifiedArguments[0]);
            control._sourceController._hasMoreData = {up: true, down: true};
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 0
            });
            assert.deepEqual({top: 'visible', bottom: 'visible'}, control.lastNotifiedArguments[0]);
         });
         it('with demand navigation', () => {
            control._options.navigation.view = 'maxCount';
            control._options.navigation.viewConfig.maxCountValue = 12;
            control._listViewModel.count = 10;
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 0
            });
            assert.deepEqual({top: 'auto', bottom: 'visible'}, control.lastNotifiedArguments[0]);

            control._listViewModel.count = 12;
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 0
            });
            assert.deepEqual({top: 'auto', bottom: 'auto'}, control.lastNotifiedArguments[0]);
         });

         it('depend on portionedSearch', () => {
            control._sourceController._hasMoreData = {up: false, down: true};
            control._showContinueSearchButtonDirection = 'down';
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 0
            });
            assert.deepEqual({top: 'auto', bottom: 'auto'}, control.lastNotifiedArguments[0]);

            control._showContinueSearchButtonDirection = 'up';
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 0
            });
            assert.deepEqual({top: 'auto', bottom: 'visible'}, control.lastNotifiedArguments[0]);

            control._portionedSearch.abortSearch();
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 0
            });
            assert.deepEqual({top: 'auto', bottom: 'auto'}, control.lastNotifiedArguments[0]);
            updateShadowModeHandler.call(control, event);
            assert.deepEqual({top: 'auto', bottom: 'auto'}, control.lastNotifiedArguments[0]);
         });
      });

      let triggers = {
         topVirtualScrollTrigger: {
            style: {
               top: 0
            }
         },
         topLoadTrigger: {
            style: {
               top: 0
            }
         },
         bottomVirtualScrollTrigger: {
            style: {
               bottom: 0
            }
         },
         bottomLoadTrigger: {
            style: {
               bottom: 0
            }
         }
      };
      describe('ScrollPagingController', () => {
         it('ScrollPagingController', async function() {
            var heightParams = {
               scrollHeight: 1000,
               clientHeight: 400
            };

            var rs = new collection.RecordSet({
               keyProperty: 'id',
               rawData: data
            });

            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: data
            });

            var cfg = {
               viewName: 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items: rs,
                  keyProperty: 'id'
               },
               viewModelConstructor: lists.ListViewModel,
               navigation: {
                  view: 'infinity',
                  source: 'page',
                  viewConfig: {
                     pagingMode: 'direct',
                     showEndButton: true
                  },
                  sourceConfig: {
                     pageSize: 3,
                     page: 0,
                     hasMore: false
                  }
               }
            };
            var ctrl = correctCreateBaseControl(cfg);
            ctrl.saveOptions(cfg);
            await ctrl._beforeMount(cfg);

            ctrl._viewSize = 1000;
            ctrl._viewportSize = 400;
            ctrl._container = {
               clientHeight: 1000,
               getElementsByClassName: () => ([{ clientHeight: 100, offsetHeight: 0 }]),
               getBoundingClientRect: function() { return {}; }
            };
            ctrl._getItemsContainer = () => ({
               children: []
            });
            // эмулируем появление скролла
            await lists.BaseControl._private.onScrollShow(ctrl, heightParams);
            ctrl._updateShadowModeHandler({}, {top: 0, bottom: 0});

            assert.isFalse(!!ctrl._scrollPagingCtr, 'ScrollPagingController was created');

            ctrl._mouseEnter(null);
            await lists.BaseControl._private.onScrollShow(ctrl, heightParams);
            assert.isTrue(!!ctrl._scrollPagingCtr, 'ScrollPagingController wasn`t created');

            // прокручиваем к низу, проверяем состояние пэйджинга
            lists.BaseControl._private.handleListScrollSync(ctrl, 640);

            assert.deepEqual({
                    begin: "visible",
                    end: "readonly",
                    next: "readonly",
                    prev: "visible"
            }, ctrl._pagingCfg.arrowState, 'Wrong state of paging arrows after scroll to bottom');

            lists.BaseControl._private.handleListScrollSync(ctrl, 200);
            assert.deepEqual({
                    begin: "visible",
                    end: "visible",
                    next: "visible",
                    prev: "visible"
            }, ctrl._pagingCfg.arrowState, 'Wrong state of paging arrows after scroll');

            ctrl._pagingVisible = true;
            ctrl._abortSearch();
            assert.deepEqual({
                    begin: "visible",
                    end: "readonly",
                    next: "readonly",
                    prev: "visible"
            }, ctrl._pagingCfg.arrowState, 'Wrong state of paging arrows after abort search');

            lists.BaseControl._private.handleListScrollSync(ctrl, 200);
            assert.deepEqual({
                    begin: "visible",
                    end: "readonly",
                    next: "readonly",
                    prev: "visible"
            }, ctrl._pagingCfg.arrowState, 'Wrong state of paging arrows after abort search');
            lists.BaseControl._private.getPortionedSearch(ctrl).reset();

            // Если данные не были загружены после последнего подскролла в конец (и hasMoreData все еще false),
            // и еще раз доскроллили до конца, то самое время блокировать кнопки.
            lists.BaseControl._private.handleListScrollSync(ctrl, 400);
            assert.deepEqual({
                    begin: "visible",
                    end: "readonly",
                    next: "readonly",
                    prev: "visible"
            }, ctrl._pagingCfg.arrowState, 'Wrong state of paging arrows after scroll');


            lists.BaseControl._private.handleListScrollSync(ctrl, 200);

            await lists.BaseControl._private.onScrollHide(ctrl);
            assert.isFalse(ctrl._pagingVisible, 'Wrong state _pagingVisible after scrollHide');
            assert.isFalse(ctrl._cachedPagingState, 'Wrong state _cachedPagingState after scrollHide');

            setTimeout(function() {
               assert.isFalse(ctrl._pagingVisible);
            }, 100);
         });
      });

      it('abortSearch', async () => {
         const heightParams = {
            scrollHeight: 400,
            clientHeight: 1000
         };
         const source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });

         const cfg = {
            viewName: 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: rs,
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            navigation: {
               view: 'infinity',
               source: 'page',
               viewConfig: {
                  pagingMode: 'direct'
               },
               sourceConfig: {
                  pageSize: 3,
                  page: 0,
                  hasMore: false
               }
            },
         };
         const ctrl = correctCreateBaseControl(cfg);
         let shadowMode;
         let iterativeSearchAborted;
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._container = {
            getElementsByClassName: () => ([{ clientHeight: 100, offsetHeight: 0 }]),
            getBoundingClientRect: function() { return {}; }
         };
         ctrl._getItemsContainer = () => ({
            children: []
         });
         lists.BaseControl._private.onScrollShow(ctrl, heightParams);
         ctrl._updateShadowModeHandler({}, {top: 0, bottom: 0});
         ctrl._pagingVisible = true;
       ctrl._pagingCfg = {
           arrowState: {
               begin: 'visible',
               prev: 'visible',
               next: 'visible',
               end: 'visible'
           }
       };
         ctrl._notify = (eventName, eventResult) => {
            if (eventName === 'updateShadowMode') {
               shadowMode = eventResult[0];
            }
            if (eventName === 'iterativeSearchAborted') {
               iterativeSearchAborted = true;
            }
         };
         ctrl._abortSearch();
         assert.isNull(ctrl._showContinueSearchButtonDirection);
         assert.deepEqual(ctrl._pagingCfg, {
            arrowState: {
               begin: 'visible',
               prev: 'visible',
               next: 'readonly',
               end: 'readonly'
            }
         });
         assert.deepEqual(shadowMode, {top: 'auto', bottom: 'auto'});
         assert.isTrue(iterativeSearchAborted);
      });

      it('scrollHide/scrollShow base control state', function() {
         var cfg = {
            navigation: {
               view: 'infinity',
               source: 'page',
               viewConfig: {
                  pagingMode: 'direct'
               },
               sourceConfig: {
                  pageSize: 3,
                  page: 0,
                  hasMore: false
               }
            }
         };
         var heightParams = {
            scrollHeight: 400,
            clientHeight: 1000
         };
         var baseControl = correctCreateBaseControl(cfg);
         baseControl._container = {
            getElementsByClassName: () => ([{ clientHeight: 100, offsetHeight: 0 }]),
            getBoundingClientRect: function() { return {}; }
         };
         baseControl._children = triggers;
         baseControl.saveOptions(cfg);
         baseControl._needScrollCalculation = true;
         baseControl._isScrollShown = true;
         baseControl._loadOffset = {
            top: 10,
            bottom: 10
         };

         lists.BaseControl._private.onScrollHide(baseControl);
         assert.isFalse(baseControl._isScrollShown);

         lists.BaseControl._private.onScrollShow(baseControl, heightParams);
         assert.isTrue(baseControl._isScrollShown);

      });

      it('calcViewSize', () => {
         let calcViewSize = lists.BaseControl._private.calcViewSize;
         assert.equal(calcViewSize(140, true, 40), 100);
         assert.equal(calcViewSize(140, false, 40), 140);
      });
      it('needShowPagingByScrollSize', function() {
         var cfg = {
            navigation: {
               view: 'infinity',
               source: 'page',
               viewConfig: {
                  pagingMode: 'direct'
               },
               sourceConfig: {
                  pageSize: 3,
                  page: 0,
                  hasMore: false
               }
            }
         };
         var baseControl = correctCreateBaseControl(cfg);
         baseControl._sourceController = {
            nav: false,
            hasMoreData: function() {
               return this.nav;
            }
         };

         baseControl._loadTriggerVisibility = {
            up: true,
            down: true
         };

         var res = lists.BaseControl._private.needShowPagingByScrollSize(baseControl, 1000, 800);
         assert.isFalse(res, 'Wrong paging state');

         baseControl._sourceController.nav = true;
         res = lists.BaseControl._private.needShowPagingByScrollSize(baseControl, 1000, 800);
         assert.isFalse(res, 'Wrong paging state');

         baseControl._loadTriggerVisibility = {
            up: false,
            down: false
         };
         res = lists.BaseControl._private.needShowPagingByScrollSize(baseControl, 1000, 800);
         assert.isTrue(res, 'Wrong paging state');

         //one time true - always true
         baseControl._sourceController.nav = false;
         res = lists.BaseControl._private.needShowPagingByScrollSize(baseControl, 1000, 800);
         assert.isTrue(res, 'Wrong paging state');

         baseControl._cachedPagingState = false;
         res = lists.BaseControl._private.needShowPagingByScrollSize(baseControl, 1000, 800);
         assert.isFalse(res, 'Wrong paging state');

         res = lists.BaseControl._private.needShowPagingByScrollSize(baseControl, 2000, 800);
         assert.isTrue(res, 'Wrong paging state');

         const scrollPagingInst = baseControl._scrollPagingCtr;
         res = lists.BaseControl._private.needShowPagingByScrollSize(baseControl, 2000, 800);
         assert.strictEqual(baseControl._scrollPagingCtr, scrollPagingInst, 'ScrollPaging recreated');
      });

      it('needShowPagingByScrollSize with virtual scrollHeight', function() {
         var cfg = {
            navigation: {
               view: 'infinity',
               source: 'page',
               viewConfig: {
                  pagingMode: 'direct'
               },
               sourceConfig: {
                  pageSize: 3,
                  page: 0,
                  hasMore: false
               }
            }
         };
         var baseControl = correctCreateBaseControl(cfg);
         baseControl._sourceController = {
            nav: false,
            hasMoreData: function() {
               return this.nav;
            }
         };

         baseControl._loadTriggerVisibility = {
            up: true,
            down: true
         };

         var res = lists.BaseControl._private.needShowPagingByScrollSize(baseControl, 1000, 800);
         assert.isFalse(res, 'Wrong paging state');

         baseControl._scrollController = {
            calculateVirtualScrollHeight: () => 3000
         }

         res = lists.BaseControl._private.needShowPagingByScrollSize(baseControl, 1000, 800);
         assert.isTrue(res, 'Wrong paging state');
      });

      it('scrollToEdge without load', function(done) {
         var rs = new collection.RecordSet({
            keyProperty: 'id',
            rawData: data
         });

         var source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });

         var cfg = {
            keyProperty: 'id',
            viewName: 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: rs,
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 6,
                  page: 0,
                  hasMore: false
               },
               view: 'infinity',
               viewConfig: {
                  pagingMode: 'direct'
               }
            }
         };
         var ctrl = correctCreateBaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);

         // дождемся загрузки списка
         setTimeout(function() {
            result = false;
            ctrl._notify = function(event, dir) {
               result = dir;
            };
            ctrl._scrollController = {
               scrollToItem(key) {
                  if (key === data[0].id) {
                     result = 'top';
                  } else if (key === data[data.length - 1].id) {
                     result = 'bottom';
                  }
                  return Promise.resolve();
               },
               handleResetItems: () => undefined
            };

            // прокручиваем к низу, проверяем состояние пэйджинга
            lists.BaseControl._private.scrollToEdge(ctrl, 'down');
            assert.equal(result, 'bottom', 'List wasn\'t scrolled to bottom');

            lists.BaseControl._private.scrollToEdge(ctrl, 'up');
            assert.equal(result, 'top', 'List wasn\'t scrolled to top');

            done();
         }, 100);
      });

      it('__onPagingArrowClick', async function() {
         var rs = new collection.RecordSet({
            keyProperty: 'id',
            rawData: data
         });

         var source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });

         var cfg = {
            keyProperty: 'id',
            viewName: 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: rs,
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 6,
                  page: 0,
                  hasMore: false
               },
               view: 'infinity',
               viewConfig: {
                  pagingMode: 'direct'
               }
            }
         };
         var heightParams = {
            scrollHeight: 400,
            clientHeight: 1000
         };
         var ctrl = await correctCreateBaseControlAsync(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._children = { ...ctrl._children, ...triggers };
         ctrl._container = {
            getElementsByClassName: () => ([{ clientHeight: 100, offsetHeight: 0 }]),
            getBoundingClientRect: function() { return {}; }
         };
         ctrl._getItemsContainer = () => ({
            children: []
         });
         // эмулируем появление скролла
         lists.BaseControl._private.onScrollShow(ctrl, heightParams);

         return new Promise((resolve) => {
            // скроллпэйджиг контроллер создается асинхронном
            setTimeout(function() {
               ctrl._notify = function(eventName, type) {
                  result = type;
               };
               ctrl._scrollController = {
                  scrollToItem(key) {
                     if (key === data[0].id) {
                        result = ['top'];
                     } else if (key === data[data.length - 1].id) {
                        result = ['bottom'];
                     }
                     return Promise.resolve();
                  },
                  handleResetItems: () => undefined,
                  registerObserver: () => undefined,
                  continueScrollToItemIfNeed: () => undefined,
                  completeVirtualScrollIfNeed: () => undefined,
                  update: () => undefined,
                  setRendering: () => undefined,
                  scrollPositionChange: () => undefined,
                  setTriggers: () => undefined,
                  setIndicesAfterCollectionChange: () => undefined,
                  calculateVirtualScrollHeight: () => 0,
                  getParamsToRestoreScrollPosition: () => null,
                  setTriggerVisibility: () => undefined,
                  getPlaceholders: () => { return { top: 0, bottom: 0 }; },
                  updateItemsHeights: () => undefined
               };

               // прокручиваем к низу, проверяем состояние пэйджинга
               result = false;
               ctrl.__onPagingArrowClick({}, 'End');
               assert.equal('bottom', result[0], 'Wrong state of scroll after clicking to End');

               // прокручиваем к верху, проверяем состояние пэйджинга
               ctrl.__onPagingArrowClick({}, 'Begin');
               assert.equal('top', result[0], 'Wrong state of scroll after clicking to Begin');

               // прокручиваем страницу вверх и вниз, проверяем состояние пэйджинга
               ctrl.__onPagingArrowClick({}, 'Next');
               assert.equal('pageDown', result[0], 'Wrong state of scroll after clicking to Next');

               assert.isTrue(ctrl._scrollPageLocked, 'Paging should be locked after paging Next until _afterUpdate');
               ctrl._afterUpdate(cfg);
               ctrl._afterRender();
               assert.isFalse(ctrl._scrollPageLocked, 'Paging should be unlocked in _afterUpdate');

               ctrl.__onPagingArrowClick({}, 'Prev');
               assert.equal('pageUp', result[0], 'Wrong state of scroll after clicking to Prev');

               assert.isTrue(ctrl._scrollPageLocked, 'Paging should be locked after paging Prev until _afterUpdate');
               ctrl._afterUpdate(cfg);
               ctrl._afterRender();
               assert.isFalse(ctrl._scrollPageLocked, 'Paging should be unlocked in _afterUpdate');

               ctrl.__onPagingArrowClick({}, 'Prev');
               assert.strictEqual('pageUp', result[0], 'Wrong state of scroll after clicking to Prev');

               assert.isTrue(ctrl._scrollPageLocked, 'Paging should be locked after paging Prev until handleScrollMoveSync');
               ctrl._setMarkerAfterScroll = false;
               ctrl.scrollMoveSyncHandler({ scrollTop: 0 });
               assert.isFalse(ctrl._scrollPageLocked, 'Paging should be unlocked in handleScrollMoveSync');

               resolve();
            }, 100);
         });
      });

      it('__needShowEmptyTemplate', async function() {
         let baseControlOptions = {
            viewModelConstructor: lists.ListViewModel,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: rs,
               keyProperty: 'id'
            },
            viewName: 'Controls/List/ListView',
            source: source,
            emptyTemplate: {}
         };

         let baseControl = await correctCreateBaseControlAsync(baseControlOptions);
         baseControl.saveOptions(baseControlOptions);

         await baseControl._beforeMount(baseControlOptions);

         let editingItem;

         baseControl._editInPlaceController = {
            isEditing: () => {
               return !!editingItem;
            }
         };

         assert.isFalse(!!baseControl.__needShowEmptyTemplate(baseControl._options.emptyTemplate, baseControl._listViewModel));

         baseControl._listViewModel.getCount = function() {
            return 0;
         };

         assert.isTrue(!!baseControl.__needShowEmptyTemplate(baseControl._options.emptyTemplate, baseControl._listViewModel));

         assert.isTrue(!!baseControl.__needShowEmptyTemplate(baseControl._options.emptyTemplate, null));

         assert.isFalse(!!baseControl.__needShowEmptyTemplate(null, baseControl._listViewModel));

         baseControl._sourceController.isLoading = function() {
            return true;
         };

         baseControl._noDataBeforeReload = false;
         assert.isFalse(!!baseControl.__needShowEmptyTemplate(baseControl._options.emptyTemplate, baseControl._listViewModel));

         baseControl._noDataBeforeReload = true;
         assert.isTrue(!!baseControl.__needShowEmptyTemplate(baseControl._options.emptyTemplate, baseControl._listViewModel));

         editingItem = {};
         assert.isFalse(!!baseControl.__needShowEmptyTemplate(baseControl._options.emptyTemplate, baseControl._listViewModel));

         editingItem = null;
         baseControl._sourceController = null;
         assert.isTrue(!!baseControl.__needShowEmptyTemplate(baseControl._options.emptyTemplate, baseControl._listViewModel));

         baseControl._sourceController = {
            hasMoreData: function() {
               return true;
            },
            isLoading: function() {
               return true;
            }
         };
         assert.isFalse(!!baseControl.__needShowEmptyTemplate(baseControl._options.emptyTemplate, baseControl._listViewModel));
      });

      it('reload with changing source/navig/filter should call scroll to start', async function() {
         var
             lnSource = new sourceLib.Memory({
                keyProperty: 'id',
                data: data
             }),
             lnSource2 = new sourceLib.Memory({
                keyProperty: 'id',
                data: [{
                   id: 4,
                   title: 'Четвертый',
                   type: 1
                },
                   {
                      id: 5,
                      title: 'Пятый',
                      type: 2
                   }]
             }),
             lnSource3 = new sourceLib.Memory({
                keyProperty: 'id',
                data: []
             }),
             lnCfg = {
                viewName: 'Controls/List/ListView',
                source: lnSource,
                keyProperty: 'id',
                markedKey: 3,
                viewModelConstructor: lists.ListViewModel
             },
             lnBaseControl = correctCreateBaseControl(lnCfg);

         lnBaseControl.saveOptions(lnCfg);
         await lnBaseControl._beforeMount(lnCfg);
         await lnBaseControl._reload(lnCfg);
         assert.equal(lnBaseControl._shouldRestoreScrollPosition, true);
      });

      it('reload and restore model state', async function() {
         const
            lnSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: data
            }),
            lnCfg = {
               viewName: 'Controls/List/ListView',
               source: lnSource,
               keyProperty: 'id',
               viewModelConstructor: lists.ListViewModel,
               selectedKeys: [1],
               excludedKeys: [],
               markedKey: 1,
               markerVisibility: 'visible'
            },
            baseControl = await correctCreateBaseControlAsync(lnCfg);

         baseControl.saveOptions(lnCfg);
         await baseControl._beforeMount(lnCfg);

         let item = baseControl._listViewModel.getItemBySourceKey(1);
         assert.isTrue(item.isMarked());
         assert.isTrue(item.isSelected());

         // Меняю наверняка items, чтобы если этого не произойдет в reload, упали тесты
         baseControl._listViewModel.setItems(new collection.RecordSet({
            keyProperty: 'id',
            rawData: data
         }));

         item = baseControl._listViewModel.getItemBySourceKey(1);
         item.setMarked(false);
         item.setSelected(false);

         await baseControl.reload(false, {});

         item = baseControl._listViewModel.getItemBySourceKey(1);
         assert.isTrue(item.isMarked());
         assert.isTrue(item.isSelected());
      });

      describe('getItemActionsController', () => {
         let cfg;

         beforeEach(async() => {
            cfg = {
               items: new collection.RecordSet({
                  rawData: [
                     {
                        id: 1,
                        title: 'item 1'
                     },
                     {
                        id: 2,
                        title: 'item 2'
                     }
                  ],
                  keyProperty: 'id'
               }),
               itemActions: [
                  {
                     id: 1,
                     showType: 2,
                     'parent@': true
                  },
                  {
                     id: 2,
                     showType: 0,
                     parent: 1
                  },
                  {
                     id: 3,
                     showType: 0,
                     parent: 1
                  }
               ],
               viewName: 'Controls/List/ListView',
               viewConfig: {
                  idProperty: 'id'
               },
               viewModelConfig: {
                  items: [],
                  idProperty: 'id'
               },
               markedKey: null,
               viewModelConstructor: lists.ListViewModel,
               source: source,
               keyProperty: 'id'
            };
         });

         it('should not init when __error is occurred', async () => {
            const instance = correctCreateBaseControl(cfg);
            instance.saveOptions(cfg);
            await instance._beforeMount(cfg);
            lists.BaseControl._private.showError(instance, {
               mode: 'inlist'
            });
            assert.notExists(lists.BaseControl._private.getItemActionsController(instance, instance._options));
         });

         it('should not init when _listViewModel is not set', async () => {
            const instance = correctCreateBaseControl(cfg);
            instance.saveOptions(cfg);
            assert.notExists(lists.BaseControl._private.getItemActionsController(instance, instance._options));
         });

         it('should not init when there are no itemActions, no itemActionsProperty and no editingConfig.toolbarVisibility',  async () => {
            cfg.itemActions = undefined;
            const instance = correctCreateBaseControl(cfg);
            instance.saveOptions(cfg);
            await instance._beforeMount(cfg);
            assert.notExists(lists.BaseControl._private.getItemActionsController(instance, instance._options));
         });

         it('should return existing controller instance despite errors', async () => {
            const instance = correctCreateBaseControl(cfg);
            instance.saveOptions(cfg);
            await instance._beforeMount(cfg);
            lists.BaseControl._private.updateItemActions(instance, instance._options);
            lists.BaseControl._private.showError(instance, {
               mode: 'inlist'
            });
            assert.exists(lists.BaseControl._private.getItemActionsController(instance, instance._options));
         });

         it('should init when itemActions are set, but, there are no itemActionsProperty and toolbarVisibility is false', async () => {
            const instance = correctCreateBaseControl(cfg);
            instance.saveOptions(cfg);
            await instance._beforeMount(cfg);
            assert.exists(lists.BaseControl._private.getItemActionsController(instance, instance._options));
         });

         it('should init when itemActionsProperty is set, but, there are no itemActions and toolbarVisibility is false', async () => {
            const localCfg = { ...cfg, itemActions: null, itemActionsProperty: 'myActions' };
            const instance = new lists.BaseControl(localCfg);
            instance.saveOptions(localCfg);
            await instance._beforeMount(localCfg);
            assert.exists(lists.BaseControl._private.getItemActionsController(instance, instance._options));
         });

         it('should init when toolbarVisibility is true, but, there are no itemActions and no itemActionsProperty', async () => {
            const localCfg = {
               ...cfg,
               itemActions: null,
               editingConfig: {
                  toolbarVisibility: true
               }
            };
            const instance = new lists.BaseControl(localCfg);
            instance.saveOptions(localCfg);
            await instance._beforeMount(localCfg);
            assert.exists(lists.BaseControl._private.getItemActionsController(instance, instance._options));
         });

         it('getItemActionsController should be called with options on _beforeMount', () => {
            const stubGetItemActionsController = sinon
               .stub(lists.BaseControl._private, 'getItemActionsController')
               .callsFake((self, options) => {
                  assert.exists(options);
               });
            const localCfg = {
               ...cfg,
               itemActionsVisibility: 'visible'
            };
            const instance = new lists.BaseControl(localCfg);
            instance.saveOptions(localCfg);
            instance._beforeMount(localCfg, {}, {data: localCfg.items});
            sinon.assert.called(stubGetItemActionsController);
            stubGetItemActionsController.restore();
         });
      });

      describe('calling updateItemActions method with different params', function() {
         let stubItemActionsController;
         let source;
         let isActionsUpdated;
         let cfg;
         let baseControl;

         const initTestBaseControl = (config) => {
            const _baseControl = new lists.BaseControl(config);
            _baseControl.saveOptions(config);
            _baseControl._beginAdd = () => Promise.resolve();
            _baseControl._beforeMount(config);
            _baseControl._container = {
               clientHeight: 100,
               getBoundingClientRect: () => ({ y: 0 })
            };
            return _baseControl;
         };

         beforeEach(() => {
            source = new sourceLib.Memory({
               keyProperty: 'id',
               data: data
            });
            cfg = {
               editingConfig: {
                  item: new entity.Model({keyProperty: 'id', rawData: { id: 1 }})
               },
               viewName: 'Controls/List/ListView',
               source: source,
               keyProperty: 'id',
               itemActions: [
                  {
                     id: 1,
                     title: '123'
                  }
               ],
               viewModelConstructor: lists.ListViewModel
            };
            isActionsUpdated = false;
            stubItemActionsController = sinon.stub(itemActions.Controller.prototype, 'update').callsFake(() => {
               isActionsUpdated = true;
               return [];
            });
         });
         afterEach(() => {
            stubItemActionsController.restore();
         });

         it('control in error state, should not call update', function() {
            baseControl = initTestBaseControl(cfg);
            baseControl.__error = true;
            lists.BaseControl._private.updateItemActions(baseControl, baseControl._options);
            assert.isFalse(isActionsUpdated);
            baseControl.__error = false;
         });
         it('without listViewModel should not call update', function() {
            baseControl = initTestBaseControl(cfg);
            baseControl._listViewModel = null;
            lists.BaseControl._private.updateItemActions(baseControl, baseControl._options);
            assert.isFalse(isActionsUpdated);
            baseControl._beforeMount(cfg);
         });

         // Если нет опций записи, проперти, и тулбар для редактируемой записи выставлен в false, то не надо
         // инициализировать контроллер
         it('should not initialize controller when there are no itemActions, no itemActionsProperty and toolbarVisibility is false', () => {
            baseControl = initTestBaseControl({ ...cfg, itemActions: null });
            lists.BaseControl._private.updateItemActions(baseControl, baseControl._options);
            assert.isFalse(isActionsUpdated);
         });

         it('should initialize controller when itemActions are set, but, there are no itemActionsProperty and toolbarVisibility is false', () => {
            baseControl = initTestBaseControl({ ...cfg });
            lists.BaseControl._private.updateItemActions(baseControl, baseControl._options);
            assert.isTrue(isActionsUpdated);
         });

         it('should initialize controller when itemActionsProperty is set, but, there are no itemActions and toolbarVisibility is false', () => {
            baseControl = initTestBaseControl({ ...cfg, itemActions: null, itemActionsProperty: 'myActions' });
            lists.BaseControl._private.updateItemActions(baseControl, baseControl._options);
            assert.isTrue(isActionsUpdated);
         });

         it('should initialize controller when toolbarVisibility is true, but, there are no itemActions and no itemActionsProperty', () => {
            baseControl = initTestBaseControl({
               ...cfg,
               itemActions: null,
               editingConfig: {
                  toolbarVisibility: true
               }
            });
            lists.BaseControl._private.updateItemActions(baseControl, baseControl._options);
            assert.isTrue(isActionsUpdated);
         });
      });
      describe('resetScrollAfterReload', function() {
         var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: data
            }),
            cfg = {
               viewName: 'Controls/List/ListView',
               source: source,
               keyProperty: 'id',
               viewModelConstructor: lists.ListViewModel
            },
            baseControl = correctCreateBaseControl(cfg),
            doScrollNotified = false;

         baseControl._viewportRect = {top: 0}
         baseControl._notify = function(eventName) {
            if (eventName === 'doScroll') {
               doScrollNotified = true;
            }
         };
         let scrollContainer = { getBoundingClientRect: () => ({ y: 0 })};
         baseControl._container = Object.assign({}, scrollContainer, {
            getElementsByClassName: () => ([scrollContainer])
         });
         baseControl.saveOptions(cfg);

         it('before mounting', async function() {
            await baseControl._beforeMount(cfg);
            await baseControl._reload(cfg);
            assert.isFalse(baseControl._resetScrollAfterReload);
            scrollContainer.clientHeight = 100;
            await baseControl._afterMount();
            assert.isTrue(baseControl._isMounted);
         });
         it('after scroll to end', async function() {
            baseControl._wasScrollToEnd = true;
            await baseControl._reload(cfg);
            assert.isFalse(baseControl._resetScrollAfterReload);
            scrollContainer.clientHeight = 100;
            await baseControl._afterMount();
            assert.isTrue(baseControl._isMounted);
         });
         it('without scroll', async function() {
            baseControl._isScrollShown = false;
            await baseControl._reload(cfg);
            assert.isFalse(baseControl._resetScrollAfterReload);
            await baseControl._afterUpdate(cfg);
            baseControl._afterRender();
            assert.isFalse(doScrollNotified);
         });
         it('with scroll', async function() {
            baseControl._isScrollShown = true;
            await baseControl._reload(cfg);
            await baseControl._afterUpdate(cfg);
            baseControl._afterRender();
            assert.isFalse(doScrollNotified);
            baseControl._shouldNotifyOnDrawItems = true;
            baseControl._resetScrollAfterReload = true;
            await baseControl._beforeRender(cfg);
            assert.isTrue(doScrollNotified);
         });
      });

      describe('move marker after scroll', async function() {
         var lnSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: data
            }),
            lnCfg = {
               viewName: 'Controls/List/ListView',
               source: lnSource,
               keyProperty: 'id',
               viewModelConstructor: lists.ListViewModel
            },
            lnBaseControl = new lists.BaseControl(lnCfg);
         lnBaseControl.saveOptions(lnCfg);
         await lnBaseControl._beforeMount(lnCfg);
         it('moveMarkerOnScrollPaging option', function() {
            let inst = {_options: {}, _setMarkerAfterScroll: false, _shouldMoveMarkerOnScrollPaging: () => inst._options.moveMarkerOnScrollPaging };
            lists.BaseControl._private.setMarkerAfterScroll(inst);
            assert.isTrue(inst._setMarkerAfterScroll);

            inst._setMarkerAfterScroll = false;
            inst._options.moveMarkerOnScrollPaging = false;
            lists.BaseControl._private.setMarkerAfterScroll(inst);
            assert.isFalse(inst._setMarkerAfterScroll);
         });
      });

      it('should activate input after mounting', async function() {
         var lnSource = new sourceLib.Memory({
                keyProperty: 'id',
                data: data
             }),
             lnCfg = {
                viewName: 'Controls/List/ListView',
                source: lnSource,
                keyProperty: 'id',
                viewModelConstructor: lists.ListViewModel
             },
             lnBaseControl = new lists.BaseControl(lnCfg);
         lnBaseControl.saveOptions(lnCfg);
         await lnBaseControl._beforeMount(lnCfg);
         lnBaseControl._editInPlaceController = {
            isEditing: () => true
         };
         const origin = lists.BaseControl._private.activateEditingRow;
         let rowActivated = false;
         lists.BaseControl._private.activateEditingRow = () => {
            rowActivated = true;
         };
         lnBaseControl._afterMount(lnCfg);
         assert.isTrue(rowActivated);
         lists.BaseControl._private.activateEditingRow = origin;
      });

      describe('calling _onItemClick method', function() {
         let cfg;
         let originalEvent;
         let ctrl;
         beforeEach(async () => {
            cfg = {
               keyProperty: 'id',
               viewName: 'Controls/List/ListView',
               source: source,
               viewModelConstructor: lists.ListViewModel,
               itemActions: [{id: 1}, {id: 2}]
            };
            originalEvent = {
               target: {
                  closest: function(selector) {
                     return selector === '.js-controls-ListView__checkbox';
                  },
                  getAttribute: function(attrName) {
                     return attrName === 'contenteditable' ? 'true' : '';
                  }
               }
            };
            ctrl = correctCreateBaseControl(cfg);
            ctrl.saveOptions(cfg);
            await ctrl._beforeMount(cfg);
            lists.BaseControl._private.updateItemActions(ctrl, ctrl._options);
         });

         it('should stop event propagation if target is checkbox', () => {
            let stopPropagationCalled = false;
            let event = {
               stopPropagation: function() {
                  stopPropagationCalled = true;
               }
            };
            ctrl._onItemClick(event, ctrl._listViewModel.getItems().at(2), originalEvent);
            assert.isTrue(stopPropagationCalled);
         });

         it('shouldnt stop event propagation if editing will start', () => {
            let stopPropagationCalled = false;
            let event = {
               isStopped: () => stopPropagationCalled,
               stopPropagation: function() {
                  stopPropagationCalled = true;
               },
               isBubbling: () => false
            };
            ctrl._onItemClick(event, ctrl._listViewModel.getItems().at(2), {
               target: { closest: () => null }
            });
            assert.isFalse(stopPropagationCalled);
         });

         it('should call deactivateSwipe method', () => {
            let isDeactivateSwipeCalled = false;
            let event = {
               stopPropagation: function() {}
            };
            ctrl._itemActionsController.deactivateSwipe = () => {
               isDeactivateSwipeCalled = true;
            };
            ctrl._listViewModel.setActionsAssigned(true);
            ctrl._onItemClick(event, ctrl._listViewModel.getItems().at(2), originalEvent);
            assert.isTrue(isDeactivateSwipeCalled);
         });
      });

      it('_needBottomPadding after reload in beforeMount', async function() {
         const cfg = {
            viewName: 'Controls/List/ListView',
            itemActionsPosition: 'outside',
            keyProperty: 'id',
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            source: source,
         };
         const ctrl = await correctCreateBaseControlAsync(cfg);
         await ctrl._beforeMount(cfg);
         ctrl.saveOptions(cfg);
         assert.isTrue(ctrl._needBottomPadding);
      });

      it('_needBottomPadding after reload in beforeUpdate', async function() {
         let cfg = {
            viewName: 'Controls/List/ListView',
            itemActionsPosition: 'outside',
            keyProperty: 'id',
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            source: undefined,
         };
         let cfgWithSource = await getCorrectBaseControlConfigAsync({
            ...cfg,
            source: source
         });
         var ctrl = correctCreateBaseControl(cfg);
         ctrl._beforeMount(cfg);
         ctrl.saveOptions(cfg);
         assert.isFalse(ctrl._needBottomPadding);

         ctrl._beforeUpdate(cfgWithSource);
         assert.isTrue(ctrl._needBottomPadding);
      });

      it('_needBottomPadding without list view model', function() {
         assert.doesNotThrow(() => {
            lists.BaseControl._private.needBottomPadding({}, null)
         });
         assert.isFalse(lists.BaseControl._private.needBottomPadding({}, null));
      });

      it('setHasMoreData after reload in beforeMount', async function() {
         let cfg = {
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            useNewModel: true,
            viewModelConstructor: 'Controls/display:Collection',
            source: source,
         };
         let ctrl = correctCreateBaseControl(cfg);
         let setHasMoreDataCalled = false;
         let origSHMD = lists.BaseControl._private.setHasMoreData;
         let origNBP = lists.BaseControl._private.needBottomPadding;
         lists.BaseControl._private.setHasMoreData = () => {
            setHasMoreDataCalled = true;
         };
         lists.BaseControl._private.needBottomPadding = () => false;
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         assert.isTrue(setHasMoreDataCalled);
         lists.BaseControl._private.needBottomPadding = origNBP;
         lists.BaseControl._private.setHasMoreData = origSHMD;
      });

      it('getUpdatedMetaData: set full metaData.more on load to direction with position navigation', () => {
         const updatedMeta = lists.BaseControl._private.getUpdatedMetaData(
             { more: {before: true, after: false} },
             { more: false },
             {
                source: 'position',
                sourceConfig: {
                   direction: 'both'
                }
             },
             'up'
         );

         assert.isFalse(updatedMeta.more.before);
      });

      it('needFooterPadding', function() {
         let cfg = {
            itemActionsPosition: 'outside'
         };
         let count = 10;
         let items = {
            getCount: function() {
               return count;
            }
         };
         const model = {
            isEditing: function() {
               return false;
            },
            getDisplay: () => ({
               getCount: () => count
            })
         };
         const editingModel = {
            isEditing: function() {
               return true;
            },
            getDisplay: () => ({
               getCount: () => count
            })
         };

         assert.isTrue(lists.BaseControl._private.needBottomPadding(cfg, model), "itemActionsPosinon is outside, padding is needed");
         cfg = {
            itemActionsPosition: 'inside'
         };
         assert.isFalse(lists.BaseControl._private.needBottomPadding(cfg, model), "itemActionsPosinon is inside, padding is not needed");
         cfg = {
            itemActionsPosition: 'outside',
            footerTemplate: "footer"
         };
         assert.isFalse(lists.BaseControl._private.needBottomPadding(cfg, model), "itemActionsPosinon is outside, footer exists, padding is not needed");
         cfg = {
            itemActionsPosition: 'outside',
            resultsPosition: "bottom"
         };
         assert.isFalse(lists.BaseControl._private.needBottomPadding(cfg, model), "itemActionsPosinon is outside, results row is in bottom padding is not needed");
         cfg = {
            itemActionsPosition: 'outside',
         };
         count = 0;
         assert.isFalse(lists.BaseControl._private.needBottomPadding(cfg, model), "itemActionsPosinon is outside, empty items, padding is not needed");
         assert.isTrue(lists.BaseControl._private.needBottomPadding(cfg, editingModel), "itemActionsPosinon is outside, empty items, run editing in place padding is needed");
      });

      describe('EditInPlace', function() {
         describe('beginEdit(), BeginAdd()', () => {
            let opt;
            let cfg;
            let ctrl;
            let sandbox;
            let isCloseSwipeCalled;
            beforeEach(async () => {
               isCloseSwipeCalled = false;
               opt = {
                  test: 'test'
               };
               cfg = {
                  viewName: 'Controls/List/ListView',
                  source: source,
                  viewConfig: {
                     keyProperty: 'id'
                  },
                  viewModelConfig: {
                     items: rs,
                  },
                  keyProperty: 'id',
                  viewModelConstructor: lists.ListViewModel,
                  navigation: {
                     source: 'page',
                     sourceConfig: {
                        pageSize: 6,
                        page: 0,
                        hasMore: false
                     },
                     view: 'infinity',
                     viewConfig: {
                        pagingMode: 'direct'
                     }
                  },
                  selectedKeys: [1],
                  excludedKeys: []
               };
               sandbox = sinon.createSandbox();
               sandbox.replace(lists.BaseControl._private, 'closeSwipe', (self) => {
                  isCloseSwipeCalled = true;
               });
               ctrl = correctCreateBaseControl(cfg);
               await ctrl._beforeMount(cfg);
               ctrl._editInPlaceController = {
                  edit: () => Promise.resolve(),
                  add: () => Promise.resolve(),
                  commit: () => Promise.resolve(),
                  cancel: () => Promise.resolve()
               };
               ctrl._editInPlaceInputHelper = {
                  shouldActivate: () => {},
                  setClickInfo: () => {}
               };
            });

            afterEach(() => {
               sandbox.restore();
            });

            it('should close swipe on beginEdit', async() => {
               await ctrl.beginEdit(opt).then((beginRes) => {
                  assert.isUndefined(beginRes);
                  assert.isTrue(isCloseSwipeCalled);
               });
            });

            it('beginAdd', async() => {
               await ctrl.beginAdd(opt).then((beginRes) => {
                  assert.isUndefined(beginRes);
                  assert.isTrue(ctrl._listViewModel.getItemBySourceKey(1).isSelected());
               });
            });

            it('should not start editing if control in readonly mode', () => {
               const defaultCfg = {
                  ...opt,
                  editingConfig: {
                     editOnClick: true
                  }
               };
               const readOnlyCfg = {...defaultCfg, readOnly: true};
               const event = {
                  stopPropagation() {},
                  isStopped() { return true },
                  original: {
                     target: { closest() {} }
                  }
               };
               let beginEditStarted = false;

               ctrl._beginEdit = () => {
                  beginEditStarted = true;
                  return Promise.resolve();
               };

               ctrl.saveOptions(defaultCfg);
               ctrl._onItemClick(event, {}, event.original);
               assert.isTrue(beginEditStarted);
               beginEditStarted = false;

               ctrl.saveOptions(readOnlyCfg);
               ctrl._onItemClick(event, {}, event.original);
               assert.isFalse(beginEditStarted);
            });
         });

         describe('beginAdd(), addPosition', () => {
            let cfg;
            let ctrl;
            let sandbox;
            let scrollToItemCalled;
            beforeEach(() => {
               scrollToItemCalled = false;
               cfg = {
                  viewName: 'Controls/List/ListView',
                  source: source,
                  viewConfig: {
                     keyProperty: 'id'
                  },
                  viewModelConfig: {
                     items: rs,
                     keyProperty: 'id'
                  },
                  viewModelConstructor: lists.ListViewModel,
                  editingConfig: {
                     addPosition: 'top'
                  },
                  navigation: {
                     source: 'page',
                     sourceConfig: {
                        pageSize: 6,
                        page: 0,
                        hasMore: false
                     },
                     view: 'infinity',
                     viewConfig: {
                        pagingMode: 'direct'
                     }
                  }
               };
               sandbox = sinon.createSandbox();
               sandbox.replace(lists.BaseControl._private, 'scrollToItem', () => {
                  scrollToItemCalled = true;
                  return Promise.resolve();
               });
               sandbox.replace(lists.BaseControl._private, 'showIndicator', () => {
               });
               sandbox.replace(lists.BaseControl._private, 'hideIndicator', () => {
               });
               ctrl = correctCreateBaseControl(cfg);
               ctrl.saveOptions(cfg);
               ctrl._container = {
                  clientHeight: 100
               };
               ctrl._editInPlaceInputHelper = {
                  shouldActivate: () => {}
               };
               ctrl._editInPlaceController = {
                  add: function() {
                     return Promise.resolve();
                  }
               };
            });

            afterEach(() => {
               sandbox.restore();
            });
            it('scrollToItem not called on beginAdd if adding item is in range', async () => {
               await ctrl._beforeMount(cfg);
               ctrl._isMounted = true;
               ctrl._listViewModel._startIndex = 0;
               await ctrl.beginAdd({}).then(() => {
                  assert.isFalse(scrollToItemCalled);
               });
            });
         });

         describe('api', () => {
            let cfg, ctrl, sandbox;

            beforeEach(async () => {
               cfg = {
                  viewName: 'Controls/List/ListView',
                  source: source,
                  viewConfig: {
                     keyProperty: 'id'
                  },
                  viewModelConfig: {
                     items: rs,
                     keyProperty: 'id',
                     selectedKeys: [1, 3]
                  },
                  viewModelConstructor: lists.ListViewModel,
                  navigation: {
                     source: 'page',
                     sourceConfig: {
                        pageSize: 6,
                        page: 0,
                        hasMore: false
                     },
                     view: 'infinity',
                     viewConfig: {
                        pagingMode: 'direct'
                     }
                  },
                  keyProperty: 'id',
                  selectedKeys: [1],
                  excludedKeys: []
               };
               ctrl = correctCreateBaseControl(cfg);
               await ctrl._beforeMount(cfg);
               ctrl._editInPlaceController = {
                  cancel: () => Promise.resolve(),
                  commit: () => Promise.resolve(),
                  add: () => Promise.resolve(),
                  edit: () => Promise.resolve(),
                  destroy: () => {}
               };
               sandbox = sinon.createSandbox();
               sandbox.replace(lists.BaseControl._private, 'closeSwipe', (self) => {
                  isCloseSwipeCalled = true;
               });
               ctrl._editInPlaceInputHelper = {
                  shouldActivate: () => {}
               };
            });
            afterEach(() => {
               ctrl._beforeUnmount();
               sandbox.restore();
            });

            it('cancelEdit', function(done) {
               let isRejected = false;
               const result = ctrl.cancelEdit().catch(() => {
                  isRejected = true;
               }).finally(() => {
                  assert.isFalse(isRejected);
                  assert.isTrue(ctrl._listViewModel.getItemBySourceKey(1).isSelected());
                  done();
               });
               assert.isTrue(result instanceof Promise);
            });

            it('cancelEdit, readOnly: true', function(done) {
               ctrl.saveOptions({...cfg, readOnly: true});
               let isRejected = false;
               const result = ctrl.cancelEdit().catch(() => {
                  isRejected = true;
               }).finally(() => {
                  assert.isTrue(isRejected);
                  done();
               });
               assert.isTrue(result instanceof Promise);
            });

            it('commitEdit', function(done) {
               let isRejected = false;
               const result = ctrl.commitEdit().catch(() => {
                  isRejected = true;
               }).finally(() => {
                  assert.isFalse(isRejected);
                  done();
               });
               assert.isTrue(result instanceof Promise);
            });

            it('commitEdit, readOnly: true', function(done) {
               ctrl.saveOptions({...cfg, readOnly: true});
               let isRejected = false;
               const result = ctrl.commitEdit().catch(() => {
                  isRejected = true;
               }).finally(() => {
                  assert.isTrue(isRejected);
                  done();
               });
               assert.isTrue(result instanceof Promise);
            });

            it('beginEdit', function(done) {
               let isRejected = false;
               const result = ctrl.beginEdit().catch(() => {
                  isRejected = true;
               }).finally(() => {
                  assert.isFalse(isRejected);
                  done();
               });
               assert.isTrue(result instanceof Promise);
            });

            it('beginEdit, readOnly: true', function(done) {
               ctrl.saveOptions({...cfg, readOnly: true});
               let isRejected = false;
               const result = ctrl.beginEdit().catch(() => {
                  isRejected = true;
               }).finally(() => {
                  assert.isTrue(isRejected);
                  done();
               });
               assert.isTrue(result instanceof Promise);
            });

            it('beginAdd', function(done) {
               let isRejected = false;
               const result = ctrl.beginAdd().catch(() => {
                  isRejected = true;
               }).finally(() => {
                  assert.isFalse(isRejected);
                  done();
               });
               assert.isTrue(result instanceof Promise);
            });

            it('beginAdd, readOnly: true', function(done) {
               ctrl.saveOptions({...cfg, readOnly: true});
               let isRejected = false;
               const result = ctrl.beginAdd().catch(() => {
                  isRejected = true;
               }).finally(() => {
                  assert.isTrue(isRejected);
                  done();
               });
               assert.isTrue(result instanceof Promise);
            });
         });

         describe('Fast edit by arrows', () => {
            let cfg, ctrl, sandbox;

            beforeEach(() => {
               cfg = {
                  viewName: 'Controls/List/ListView',
                  source: source,
                  viewConfig: {
                     keyProperty: 'id'
                  },
                  viewModelConfig: {
                     items: rs,
                     keyProperty: 'id',
                     selectedKeys: [1, 3]
                  },
                  viewModelConstructor: lists.ListViewModel,
                  navigation: {
                     source: 'page',
                     sourceConfig: {
                        pageSize: 6,
                        page: 0,
                        hasMore: false
                     },
                     view: 'infinity',
                     viewConfig: {
                        pagingMode: 'direct'
                     }
                  }
               };
               ctrl = correctCreateBaseControl(cfg);
               ctrl._editInPlaceController = {
                  cancel: () => Promise.resolve(),
                  commit: () => Promise.resolve(),
                  add: () => Promise.resolve(),
                  edit: () => Promise.resolve(),
                  destroy: () => {}
               };
               sandbox = sinon.createSandbox();
               sandbox.replace(lists.BaseControl._private, 'closeSwipe', (self) => {
                  isCloseSwipeCalled = true;
               });
               ctrl._editInPlaceInputHelper = {
                  shouldActivate: () => {}
               };
            });
            afterEach(() => {
               ctrl._beforeUnmount();
               sandbox.restore();
            });

            it('should not close editing if arrow up pressed in first', () => {
               let isEditingRestarted = false;
               ctrl._editInPlaceController.getPrevEditableItem = () => null;
               ctrl.beginEdit = () => {
                  isEditingRestarted = true;
               };
               return ctrl._onEditingRowKeyDown({}, {keyCode: 38}).then(() => {
                  assert.isFalse(isEditingRestarted);
               });
            });
         });

         it('close editing if page has been changed', function() {
            let isCanceled = false;
            const fakeCtrl = {
               _listViewModel: {
               },
               _options: {},
               _editInPlaceController: {
                  isEditing: () => true
               },
               _cancelEdit: function() {
                  isCanceled = true;
               },
            };

            lists.BaseControl._private.closeEditingIfPageChanged(fakeCtrl, null, null);
            assert.isFalse(isCanceled);

            lists.BaseControl._private.closeEditingIfPageChanged(fakeCtrl, null, {});
            assert.isFalse(isCanceled);

            lists.BaseControl._private.closeEditingIfPageChanged(fakeCtrl, {}, null);
            assert.isFalse(isCanceled);

            lists.BaseControl._private.closeEditingIfPageChanged(fakeCtrl, {}, {});
            assert.isFalse(isCanceled);

            lists.BaseControl._private.closeEditingIfPageChanged(fakeCtrl, {sourceConfig: {}}, {sourceConfig: {}});
            assert.isFalse(isCanceled);

            lists.BaseControl._private.closeEditingIfPageChanged(fakeCtrl, {sourceConfig: {page: 1}}, {sourceConfig: {page: 1}});
            assert.isFalse(isCanceled);

            lists.BaseControl._private.closeEditingIfPageChanged(fakeCtrl, {sourceConfig: {page: 1}}, {sourceConfig: {page: 2}});
            assert.isTrue(isCanceled);
         });

         it('register form operation in afterMount if mount with editing', async() => {
            const cfg = {
               viewName: 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items: rs,
                  keyProperty: 'id',
                  selectedKeys: [1, 3]
               },
               editingConfig: {
                  item: new entity.Model({ keyProperty: 'id', rawData: { id: 1910 } })
               },
               viewModelConstructor: lists.ListViewModel
            };
            const baseControl = correctCreateBaseControl(cfg);
            let isRegistered = false;

            baseControl._notify = (eName) => {
               if (eName === 'registerFormOperation') {
                  isRegistered = true;
               }
            };

            baseControl.saveOptions(cfg);
            await baseControl._beforeMount(cfg);
            baseControl._children.listView = {};
            assert.isFalse(isRegistered);

            baseControl._afterMount(cfg);
            assert.isTrue(isRegistered);
         });

         it('register form operation immediately on create EIP', async() => {
            it('register form operation immediately on create EIP', (done) => {
               const cfg = {
                  viewName: 'Controls/List/ListView',
                  source: source,
                  viewConfig: {
                     keyProperty: 'id'
                  },
                  viewModelConfig: {
                     items: rs,
                     keyProperty: 'id',
                     selectedKeys: [1, 3]
                  },
                  viewModelConstructor: lists.ListViewModel
               };
               const baseControl = correctCreateBaseControl(cfg);
               let isRegistered = false;

               baseControl._notify = (eName) => {
                  if (eName === 'registerFormOperation') {
                     isRegistered = true;
                  }
               };
               baseControl.showIndicator = () => {};
               baseControl.hideIndicator = () => {};

               baseControl.saveOptions(cfg);
               baseControl._beforeMount(cfg).then(() => {
                  assert.isFalse(isRegistered);

                  baseControl._afterMount(cfg);
                  assert.isFalse(isRegistered);

                  source.read(1).then((item) => {
                     baseControl.beginEdit({ item }).then(() => {
                        assert.isTrue(isRegistered);
                        done();
                     });
                  });
               });
            });
         });

         describe('collapse group', () => {
            let ctrl;
            let cancelCalled;

            const cfg = {
               viewName: 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items: rs,
                  keyProperty: 'id',
                  selectedKeys: [1, 3]
               },
               viewModelConstructor: lists.ListViewModel,
               keyProperty: 'id',
            };

            beforeEach(async () => {
               cancelCalled = false;
               ctrl = correctCreateBaseControl(cfg);
               ctrl.saveOptions(cfg);
               await ctrl._beforeMount(cfg);
               ctrl._listViewModel.getDisplay = () => ({
                  find: () => ({
                     contents: {}
                  }),
                  getGroup: () => () => 1,
                  getCollapsedGroups: () => {}
               });
               ctrl._listViewModel.toggleGroup = () => {};
               ctrl.isEditing = () => true;
               ctrl._cancelEdit = () => {
                  cancelCalled = true;
                  return Promise.resolve();
               };
            });

            afterEach(() => {
               ctrl._beforeUnmount();
               sandbox.restore();
            });

            it('should cancel editing if its group will be collapsed', () => {
               ctrl._onGroupClick({}, 1, {
                  target: {
                     closest: () => true
                  }
               });
               assert.isTrue(cancelCalled);
            });

            it('should not cancel editing if the other group will be collapsed', () => {
               ctrl._onGroupClick({}, 2, {
                  target: {
                     closest: () => true
                  }
               });
               assert.isFalse(cancelCalled);
            });

            it('should not cancel editing and toggle group if end edit canceled', () => {
               ctrl._cancelEdit = () => {
                  cancelCalled = false;
                  return Promise.resolve({ canceled: true });
               };
               ctrl._onGroupClick({}, 1, {
                  target: {
                     closest: () => true
                  }
               });
               assert.isFalse(cancelCalled);
            });
         });
      });

      describe('_onGroupClick', () => {
         let ctrl;
         const cfg = {
            viewName: 'Controls/List/ListView',
            viewModelConstructor: 'Controls/display:Collection',
            useNewModel: true,
            keyProperty: 'id',
            groupProperty: 'group',
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: 1,
                     title: 'item 1',
                     group: 'group'
                  },
                  {
                     id: 2,
                     title: 'item 2',
                     group: 'group'
                  }
               ]
            })
         };

         beforeEach(() => {
            ctrl = correctCreateBaseControl(cfg);
            ctrl.saveOptions(cfg);
         });

         it('should call setCollapsedGroups', () => {
            ctrl._beforeMount(cfg);
            const spySetCollapsedGroups = sinon.spy(ctrl.getViewModel(), 'setCollapsedGroups');
            ctrl._onGroupClick({}, 0, {
               target: {
                  closest: () => true
               }
            }, ctrl.getViewModel().at(0));
            sinon.assert.called(spySetCollapsedGroups);
            spySetCollapsedGroups.restore();
         });
      });

      it('can\'t start drag on readonly list', async function() {
         let
             cfg = {
                viewName: 'Controls/List/ListView',
                source: source,
                viewConfig: {
                   keyProperty: 'id'
                },
                viewModelConfig: {
                   items: rs,
                   keyProperty: 'id',
                   selectedKeys: [1, 3]
                },
                viewModelConstructor: lists.ListViewModel,
                navigation: {
                   source: 'page',
                   sourceConfig: {
                      pageSize: 6,
                      page: 0,
                      hasMore: false
                   },
                   view: 'infinity',
                   viewConfig: {
                      pagingMode: 'direct'
                   }
                },
                readOnly: true,
             },
             ctrl;

         ctrl = await correctCreateBaseControlAsync(cfg);
         ctrl.saveOptions(cfg);
         ctrl.itemsDragNDrop = true;
         ctrl._itemMouseDown({}, {key: 1}, {target: { closest: () => null }, nativeEvent: {button: 0}});
         assert.isNull(ctrl._draggingItem);
      });
      it('can\'t start drag if canStartDragNDrop return false', async function () {
         let
            cfg = {
               viewName: 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items: rs,
                  keyProperty: 'id',
                  selectedKeys: [1, 3]
               },
               viewModelConstructor: lists.ListViewModel,
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 6,
                     page: 0,
                     hasMore: false
                  },
                  view: 'infinity',
                  viewConfig: {
                     pagingMode: 'direct'
                  }
               },
               canStartDragNDrop: function() {
                  return false;
               }
            },
            ctrl;
         ctrl = await correctCreateBaseControlAsync(cfg);
         ctrl.saveOptions(cfg);
         ctrl.itemsDragNDrop = true;
         ctrl._itemMouseDown({}, { key: 1 }, { target: { closest: () => null }, nativeEvent: { button: 0 } });
         assert.isNull(ctrl._draggingItem);
      });

      it('startDragNDrop', () => {
         const self = {
            _options: {
               readOnly: false,
               itemsDragNDrop: true,
               source,
               filter: {},
               selectedKeys: [],
               excludedKeys: [],
            },
            _listViewModel: new lists.ListViewModel({
               items: new collection.RecordSet({
                  rawData: data,
                  keyProperty: 'id'
               }),
               keyProperty: 'key'
            }),
            _registerMouseMove: () => null,
            _registerMouseUp: () => null
         },
         domEvent = {
            nativeEvent: {},
            target: {
               closest: function() {
                  return false;
               }
            }
         },
         itemData = {
            getContents() {
               return {
                  getKey() {
                     return 2;
                  }
               };
            }
         };

         let notifyCalled = false;

         self._notify = function(eventName, args) {
            notifyCalled = true;
            assert.equal(eventName, 'dragStart');
            assert.deepEqual(args[0], [2]);
            assert.equal(args[1], 2);
         };

         self._context = { isTouch: { isTouch: true } };

         lists.BaseControl._private.startDragNDrop(self, domEvent, itemData);
         assert.isFalse(notifyCalled, 'On touch device can\'t drag');

         self._context.isTouch.isTouch = false;

         lists.BaseControl._private.startDragNDrop(self, domEvent, itemData);
         assert.isTrue(notifyCalled);
      });

      it('_processItemMouseEnterWithDragNDrop', () => {
         const ctrl = new lists.BaseControl({});
         const dragEntity = { entity: 'entity' },
               itemData = {
                  dispItem: {
                     getContents: () => {}
                  }
               },
               dragPosition = {
                  dispItem: {
                     getContents: () => {}
                  },
                  position: 'after'
               };

         let notifyResult = false,
            notifyCalled = false,
            setDragPositionCalled = false;

         ctrl._dndListController = {
            isDragging() {
               return false;
            },
            getDragEntity() {
               return dragEntity;
            },
            calculateDragPosition(params) {
               assert.deepEqual(params.targetItem, itemData.dispItem);
               return dragPosition;
            },
            setDragPosition(position) {
               assert.deepEqual(position, dragPosition);
               setDragPositionCalled = true;
            }
         };

         ctrl._notify = (eventName, args) => {
            notifyCalled = true;
            assert.equal(eventName, 'changeDragTarget');
            assert.deepEqual(args[0], dragEntity);
            assert.equal(args[1], dragPosition.dispItem.getContents());
            assert.equal(args[2], 'after');
            return notifyResult;
         };

         ctrl._processItemMouseEnterWithDragNDrop(itemData);
         assert.isFalse(notifyCalled);

         ctrl._dndListController.isDragging = () => { return true; };
         ctrl._processItemMouseEnterWithDragNDrop(itemData);
         assert.isTrue(notifyCalled);
         assert.isFalse(setDragPositionCalled);
         assert.isNull(ctrl._unprocessedDragEnteredItem);

         notifyResult = true;
         ctrl._processItemMouseEnterWithDragNDrop(itemData);
         assert.isTrue(notifyCalled);
         assert.isTrue(setDragPositionCalled);
         assert.isNull(ctrl._unprocessedDragEnteredItem);
      });

      it('_dragEnter only works with ItemsEntity', function() {
         const ctrl = new lists.BaseControl({});

         ctrl._listViewModel = {
            getDragEntity: () => null,
            setDragOutsideList: () => null
         };

         let
            notifiedEvent = '_removeDraggingTemplate',
            notifiedEntity = null;

         ctrl._notify = function(eventName, dragEntity) {
            notifiedEvent = eventName;
            notifiedEntity = dragEntity && dragEntity[0];
         };

         ctrl._documentDragging = true;

         assert.isNull(ctrl._dndListController);
         ctrl._dragEnter({}, undefined);
         assert.equal(notifiedEvent, '_removeDraggingTemplate');
         assert.isNotNull(ctrl._dndListController);

         const badDragObject = { entity: {} };
         ctrl._dragEnter({}, badDragObject);
         assert.equal(notifiedEvent, '_removeDraggingTemplate');

         const goodDragObject = {
            entity: {
               '[Controls/dragnDrop:ItemsEntity]': true
            }
         };
         ctrl._dragEnter(goodDragObject);
         assert.strictEqual(notifiedEvent, 'dragEnter');
         assert.strictEqual(notifiedEntity, goodDragObject.entity);
      });

      it('native drag prevent only by native "dragstart" event', async function() {
         let isDefaultPrevented = false;

         const
            cfg = {
               viewName: 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items: rs,
                  keyProperty: 'id',
                  selectedKeys: [null],
                  excludedKeys: []
               },
               viewModelConstructor: lists.ListViewModel,
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 6,
                     page: 0,
                     hasMore: false
                  },
                  view: 'infinity',
                  viewConfig: {
                     pagingMode: 'direct'
                  }
               },
               selectedKeys: [null],
               excludedKeys: [],
               readOnly: false,
               itemsDragNDrop: true
            },
            ctrl = correctCreateBaseControl(cfg),
            fakeMouseDown = {
               nativeEvent: {
                  button: 0
               },
               target: {
                  closest: () => false
               },
               preventDefault: () => isDefaultPrevented = true
            },
            fakeDragStart = {
               preventDefault: () => isDefaultPrevented = true
            };

         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);

         const itemData = {
            getContents() {
               return {
                  getKey() {
                     return 1;
                  }
               };
            },
            key: 1
         };

         // по mouseDown нельзя вызывать preventDefault, иначе сломается фокусировка
         ctrl._itemMouseDown({target: { closest: () => null }}, itemData, fakeMouseDown);
         assert.isFalse(isDefaultPrevented);

         // По dragStart нужно вызывать preventDefault
         ctrl._nativeDragStart(fakeDragStart);
         assert.isTrue(isDefaultPrevented);
      });

      it('_documentDragEnd', async function() {
         const cfg = {
            viewName: 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: rs,
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel
         };
         var
            dragEnded,
            ctrl;

         ctrl = await correctCreateBaseControlAsync(cfg);
         await ctrl._beforeMount(cfg);
         ctrl.saveOptions(cfg);

         ctrl._isMounted = true;
         ctrl._scrollTop = 0;
         ctrl._container = {
            getBoundingClientRect() {
               return {
                  y: -900
               };
            }
         };

         ctrl._viewportRect = { top: 0 }
         //dragend without deferred
         dragEnded = false;

         ctrl._documentDragEnd();
         assert.isFalse(dragEnded, 'DndController was not created');

         ctrl._dndListController = {
            endDrag() {
               dragEnded = true;
            },
            getDragPosition: () => {
               return {
                  dispItem: {
                     getContents: () => {}
                  }
               };
            },
            getDraggableItem: () => ({
               getContents: () => ({
                  getKey: () => 1
               })
            })
         };
         ctrl._documentDragEnd({entity: {}});
         assert.isTrue(dragEnded);

         //dragend with deferred
         dragEnded = false;
         ctrl._dndListController = {
            endDrag() {
               dragEnded = true;
            },
            getDragPosition: () => {
               return {
                  dispItem: {
                     getContents: () => {}
                  }
               };
            },
            getDraggableItem: () => ({
               getContents: () => ({
                  getKey: () => 1
               })
            })
         };
         ctrl._insideDragging = true;
         ctrl._notify = () => new cDeferred();
         ctrl._documentDragEnd({entity: {}});
         assert.isFalse(dragEnded);
         assert.isTrue(!!ctrl._loadingState);
      });

      describe('Calling animation handlers', () => {
         let deactivateSwipeCalled;
         let stopItemAnimationCalled;
         let ctrl;
         beforeEach(() => {
            deactivateSwipeCalled = false;
            stopItemAnimationCalled = false;
            const cfg = {
               viewName: 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items: rs,
                  keyProperty: 'id',
                  selectedKeys: [null],
                  excludedKeys: []
               },
               viewModelConstructor: lists.ListViewModel,
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 6,
                     page: 0,
                     hasMore: false
                  },
                  view: 'infinity',
                  viewConfig: {
                     pagingMode: 'direct'
                  }
               },
               selectedKeys: [null],
               excludedKeys: [],
               readOnly: false,
               itemsDragNDrop: true,
               itemActions: [{id: 1}, {id: 2}]
            };
            ctrl = correctCreateBaseControl(cfg);
            ctrl.saveOptions(cfg);

            ctrl._itemActionsController = {
               update: () => ([1,2,3]),
               deactivateSwipe: () => {
                  deactivateSwipeCalled = true;
               },
               getSwipeItem: () => ({ id: 1 })
            };
            ctrl._selectionController = {
               stopItemAnimation: () => {
                  stopItemAnimationCalled = true;
               },
               getAnimatedItem: () => ({ id: 1 })
            };
            ctrl._listViewModel = {
               _isActionsAssigned: false,
               nextVersion: () => null,
               getEditingConfig: () => null,
               isActionsAssigned() { return this._isActionsAssigned; }
            };
         });

         it('should call deactivateSwipe method on \'itemActionsSwipeClose\' event', () => {
            lists.BaseControl._private.updateItemActions(ctrl, ctrl._options);
            ctrl._onActionsSwipeAnimationEnd({
               nativeEvent: {
                  animationName: 'test'
               }
            });
            assert.isFalse(deactivateSwipeCalled, 'swipe should not be deactivated on every animation end');
            ctrl._onActionsSwipeAnimationEnd({
               nativeEvent: {
                  animationName: 'itemActionsSwipeClose'
               }
            });
            assert.isTrue(deactivateSwipeCalled, 'swipe should be deactivated on \'itemActionsSwipeClose\' animation end');
         });

         it('should call deactivateSwipe method on \'rightSwipe\' event', () => {
            ctrl._onItemSwipeAnimationEnd({
               nativeEvent: {
                  animationName: 'test'
               }
            });
            assert.isFalse(stopItemAnimationCalled, 'right swipe should not be deactivated on every animation end');
            ctrl._onItemSwipeAnimationEnd({
               nativeEvent: {
                  animationName: 'rightSwipe'
               }
            });
            assert.isTrue(stopItemAnimationCalled, 'right swipe should be deactivated on \'rightSwipe\' animation end');
         });
      });

      describe('_onItemSwipe()', () => {
         let swipeEvent;
         let instance;

         function initTest(options) {
            const cfg = {
               viewName: 'Controls/List/ListView',
               viewConfig: {
                  idProperty: 'id'
               },
               viewModelConfig: {
                  items: rs,
                  idProperty: 'id'
               },
               viewModelConstructor: lists.ListViewModel,
               source: source,
               selectedKeys: [1],
               excludedKeys: [],
               ...options
            };
            instance = correctCreateBaseControl(cfg);
            instance._children = {
               itemActionsOpener: {
                  close: function() {
                  }
               }
            };
            instance.saveOptions(cfg);
            return (instance._beforeMount(cfg) || Promise.resolve()).then(() => {
               instance._listViewModel.setItems(rs, cfg);
               instance._items = rs;
            });
         }

         function initSwipeEvent(direction) {
            return {
               stopPropagation: () => null,
               target: {
                  closest: () => ({ classList: { contains: () => true }, clientHeight: 10 })
               },
               nativeEvent: {
                  direction: direction
               }
            };
         }

         describe('Animation for swipe', () => {
            before(() => {
               swipeEvent = initSwipeEvent('right');
            });

            after(() => {
               swipeEvent = undefined;
            });

            describe('with ItemActions', () => {
               beforeEach(() => {
                  return initTest({
                     itemActions: [
                        {
                           id: 1,
                           showType: 2,
                           'parent@': true
                        },
                        {
                           id: 2,
                           showType: 0,
                           parent: 1
                        },
                        {
                           id: 3,
                           showType: 0,
                           parent: 1
                        }
                     ]
                  }).then(() => lists.BaseControl._private.updateItemActions(instance, instance._options));
               });

               // Если Активирован свайп на одной записи и свайпнули по любой другой записи, надо закрыть свайп
               it('should close swipe when any record has been swiped right', () => {
                  const item = instance._listViewModel.at(0);
                  const spySetSwipeAnimation = sinon.spy(item, 'setSwipeAnimation');
                  item.setSwiped(true, true);
                  instance._onItemSwipe({}, instance._listViewModel.at(2), swipeEvent);

                  sinon.assert.calledWith(spySetSwipeAnimation, 'close');
                  spySetSwipeAnimation.restore();
               });

               // Если Активирован свайп на одной записи и свайпнули по любой другой записи, надо переместить маркер
               it('should change marker when any other record has been swiped right', () => {
                  const spySetMarkedKey = sinon.spy(instance, 'setMarkedKey');
                  instance._listViewModel.at(0).setSwiped(true, true);
                  instance._onItemSwipe({}, instance._listViewModel.at(2), swipeEvent);

                  sinon.assert.calledOnce(spySetMarkedKey);
                  spySetMarkedKey.restore();
               });

               // Если Активирован свайп на одной записи и свайпнули по той же записи, не надо вызывать установку маркера
               it('should deactivate swipe when any other record has been swiped right', () => {
                  const spySetMarkedKey = sinon.spy(instance, 'setMarkedKey');
                  instance._listViewModel.at(0).setSwiped(true, true);
                  instance._onItemSwipe({}, instance._listViewModel.at(0), swipeEvent);

                  sinon.assert.notCalled(spySetMarkedKey);
                  spySetMarkedKey.restore();
               });

               // Должен работать свайп по breadcrumbs
               it('should work with breadcrumbs', () => {
                  swipeEvent = initSwipeEvent('left');
                  const itemAt0 = instance._listViewModel.at(0);
                  const breadcrumbItem = {
                     '[Controls/_display/BreadcrumbsItem]': true,
                     _$active: false,
                     isSelected: () => true,
                     getContents: function () {
                        const breadcrumbs = this.getBreadcrumbs();
                        return breadcrumbs[breadcrumbs.length - 1];
                     },
                     getBreadcrumbs: () => ['fake', 'fake', 'fake', itemAt0.getContents() ],
                     setActive: function() {
                        this._$active = true;
                     },
                     getActions: () => ({
                        all: [{
                           id: 2,
                           showType: 0
                        }]
                     })
                  };
                  const stubActivateSwipe = sinon.stub(instance._itemActionsController, 'activateSwipe')
                     .callsFake((itemKey, actionsContainerWidth, actionsContainerHeight) => {
                        assert.equal(itemKey, itemAt0.getContents().getKey());
                        stubActivateSwipe.restore();
                     });

                  instance._onItemSwipe({}, breadcrumbItem, swipeEvent);
               });
            });

            // Должен бросать событие наверх
            it('it should fire event', () => {
               initTest();
               const spyNotify = sinon.spy(instance, '_notify');
               instance._onItemSwipe({}, instance._listViewModel.at(0), swipeEvent);
               sinon.assert.called(spyNotify);
               spyNotify.restore();
            });
         });

         describe('Animation for right-swipe with or without multiselectVisibility', function() {
            before(() => {
               swipeEvent = initSwipeEvent('right');
            });

            after(() => {
               swipeEvent = undefined;
            });

            // Свайп вправо не влияет на определение свайпа влево
            it('setAnimatedForSelection() should not affect isSwiped() result', () => {
               return initTest({
                  multiSelectVisibility: 'visible',
                  selectedKeys: [1],
                  excludedKeys: [],
                  selectedKeysCount: 0,
                  itemActions: [
                     {
                        id: 1,
                        showType: 2,
                        'parent@': true
                     },
                     {
                        id: 2,
                        showType: 0,
                        parent: 1
                     },
                     {
                        id: 3,
                        showType: 0,
                        parent: 1
                     }
                  ]
               }).then(() => {
                  lists.BaseControl._private.updateItemActions(instance, instance._options);
                  const item = instance._listViewModel.at(0);
                  instance._onItemSwipe({}, item, swipeEvent);
                  assert.notExists(instance._itemActionsController.getSwipeItem());
                  assert.equal(item, instance._selectionController.getAnimatedItem());
               });
            });
             it('_onItemSwipe() animated item with multiSelectVisibility: "visible"', () => {
                 return initTest({
                     multiSelectVisibility: 'visible',
                     selectedKeysCount: null,
                     selectedKeys: [],
                     excludedKeys: [],
                     itemActions: [
                         {
                             id: 1,
                             showType: 2,
                             'parent@': true
                         },
                         {
                             id: 2,
                             showType: 0,
                             parent: 1
                         },
                         {
                             id: 3,
                             showType: 0,
                             parent: 1
                         }
                     ]
                 }).then(() => {
                     lists.BaseControl._private.createSelectionController(instance, instance._options);
                     lists.BaseControl._private.updateItemActions(instance, instance._options);
                     const item = instance._listViewModel.at(0);
                     instance._onItemSwipe({}, item, swipeEvent);
                     assert.ok(instance._selectionController.getAnimatedItem() === item);
                 });
             });

            it('_onItemSwipe() animated item null', () => {
               return initTest({
                  multiSelectVisibility: 'hidden',
                  selectedKeysCount: null,
                  selectedKeys: [],
                  excludedKeys: [],
                  itemActions: [
                     {
                        id: 1,
                        showType: 2,
                        'parent@': true
                     },
                     {
                        id: 2,
                        showType: 0,
                        parent: 1
                     },
                     {
                        id: 3,
                        showType: 0,
                        parent: 1
                     }
                  ]
               }).then(() => {
                  lists.BaseControl._private.createSelectionController(instance, instance._options);
                  lists.BaseControl._private.updateItemActions(instance, instance._options);
                  const item = instance._listViewModel.at(0);
                  instance._onItemSwipe({}, item, swipeEvent);
                  assert.isNull(instance._selectionController.getAnimatedItem());
               });
            });
         });

         // Должен правильно рассчитывать ширину для записей списка при отображении опций свайпа
         // Предполагаем, что контейнер содержит класс js-controls-ListView__measurableContainer
         it('should correctly calculate row size for list', () => {
            // fake HTMLElement
            const fakeElement = {
               classList: {
                  contains: (selector) => true,
               },
               clientWidth: 500,
               clientHeight: 31
            };
            const _result = lists.BaseControl._private.getSwipeContainerSize(fakeElement);
            assert.equal(_result.width, 500);
            assert.equal(_result.height, 31);
         });

         // Должен правильно рассчитывать ширину для записей таблицы при отображении опций свайпа
         // Предполагаем, что сам контейнер не содержит класс js-controls-ListView__measurableContainer,
         // а его потомки содержат
         it('should correctly calculate row size for grid', () => {
            // fake HTMLElement
            const fakeElement = {
               classList: {
                  contains: (selector) => false,
               },
               querySelectorAll: (selector) => (new Array(5)).fill({
                  clientWidth: 50,
                  clientHeight: 31
               })
            };
            const _result = lists.BaseControl._private.getSwipeContainerSize(fakeElement);
            assert.equal(_result.width, 250);
            assert.equal(_result.height, 31);
         });
      });

      describe('ItemActions menu', () => {
         let cfg;
         let instance;
         let item;
         let outgoingEventsMap;

         let initFakeEvent = () => {
            return {
               immediatePropagating: true,
               propagating: true,
               nativeEvent: {
                  button: 0,
                  prevented: false,
                  preventDefault: function() {
                     this.prevented = true;
                  }
               },
               stopImmediatePropagation: function() {
                  this.immediatePropagating = false;
               },
               stopPropagation: function() {
                  this.propagating = false;
               },
               target: {
                  getBoundingClientRect: () => ({
                     top: 100,
                     bottom: 100,
                     left: 100,
                     right: 100,
                     width: 100,
                     height: 100
                  }),
                  closest: (selector) => ({
                     className: selector.substr(1)
                  })
               }
            };
         };

         beforeEach(async() => {
            outgoingEventsMap = {};
            cfg = {
               items: new collection.RecordSet({
                  rawData: [
                     {
                        id: 1,
                        title: 'item 1'
                     },
                     {
                        id: 2,
                        title: 'item 2'
                     }
                  ],
                  keyProperty: 'id'
               }),
               itemActions: [
                  {
                     id: 1,
                     showType: 2,
                     'parent@': true
                  },
                  {
                     id: 2,
                     showType: 0,
                     parent: 1
                  },
                  {
                     id: 3,
                     showType: 0,
                     parent: 1
                  }
               ],
               viewName: 'Controls/List/ListView',
               viewConfig: {
                  idProperty: 'id'
               },
               viewModelConfig: {
                  items: [],
                  idProperty: 'id'
               },
               markedKey: null,
               viewModelConstructor: lists.ListViewModel,
               source: source,
               keyProperty: 'id'
            };
            instance = correctCreateBaseControl(cfg);
            item =  item = {
               _$active: false,
               getContents: () => ({
                  getKey: () => 2
               }),
               setActive: function() {
                  this._$active = true;
               },
               getActions: () => ({
                  all: [{
                     id: 2,
                     showType: 0
                  }]
               }),
               isMarked: () => false,
               isSwiped: () => false,
               isEditing: () => false
            };
            instance.saveOptions(cfg);
            instance._scrollController = {
               scrollToItem: () => {},
               setIndicesAfterCollectionChange: () => undefined,
               handleResetItems: () => {}
            };
            instance._container = {
               querySelector: (selector) => ({
                  parentNode: {
                     children: [{
                        className: 'controls-ListView__itemV'
                     }]
                  }
               })
            };
            await instance._beforeMount(cfg);
            lists.BaseControl._private.updateItemActions(instance, cfg);
            popup.Sticky.openPopup = (config) => Promise.resolve('ekaf');
            instance._notify = (eventName, args) => {
               outgoingEventsMap[eventName] = args;
            };
         });

         // Не показываем контекстное меню браузера, если мы должны показать кастомное меню
         it('should prevent default context menu', () => {
            const fakeEvent = initFakeEvent();
            instance._onItemContextMenu(null, item, fakeEvent);
            assert.isTrue(fakeEvent.nativeEvent.prevented);
            assert.isFalse(fakeEvent.propagating);
         });

         // Пытаемся показать контекстное меню, если был инициализирован itemActionsController
         it('should not display context menu when itemActionsController is not initialized', () => {
            const spyOpenItemActionsMenu = sinon.spy(lists.BaseControl._private, 'openItemActionsMenu');
            const fakeEvent = initFakeEvent();
            instance._onItemContextMenu(null, item, fakeEvent);
            sinon.assert.calledOnce(spyOpenItemActionsMenu);
            spyOpenItemActionsMenu.restore();
         });

         // Не показываем наше контекстное меню, если не был инициализирован itemActionsController
         it('should not display context menu when itemActionsController is not initialized', () => {
            const spyOpenItemActionsMenu = sinon.spy(lists.BaseControl._private, 'openItemActionsMenu');
            const fakeEvent = initFakeEvent();
            instance._itemActionsController = undefined;
            instance._onItemContextMenu(null, item, fakeEvent);
            sinon.assert.notCalled(spyOpenItemActionsMenu);
            spyOpenItemActionsMenu.restore();
         });

         // Записи-"хлебные крошки" в getContents возвращают массив. Не должно быть ошибок
         it('should correctly work with breadcrumbs', async () => {
            const fakeEvent = initFakeEvent();
            const itemAt1 = instance._listViewModel.at(1);
            const breadcrumbItem = {
               '[Controls/_display/BreadcrumbsItem]': true,
               _$active: false,
               getContents: function () {
                  const breadcrumbs = this.getBreadcrumbs();
                  return breadcrumbs[breadcrumbs.length - 1];
               },
               getBreadcrumbs: () => ['fake', 'fake', 'fake', itemAt1.getContents() ],
               setActive: function() {
                  this._$active = true;
               },
               getActions: () => ({
                  all: [{
                     id: 2,
                     showType: 0
                  }]
               })
            };
            await instance._onItemContextMenu(null, breadcrumbItem, fakeEvent);
            assert.equal(instance._listViewModel.getActiveItem(), itemAt1);
         });

         // Клик по ItemAction в меню отдавать контейнер в событии
         it('should send target container in event on click in menu', async () => {
            const fakeEvent = initFakeEvent();
            const fakeEvent2 = initFakeEvent();
            const action = {
               id: 1,
               showType: 0,
               'parent@': true
            };
            const actionModel = {
               getRawData: () => ({
                  id: 2,
                  showType: 0,
                  parent: 1
               })
            };
            await instance._onItemActionMouseDown(fakeEvent, action, instance._listViewModel.at(0));

            // popup.Sticky.openPopup called in openItemActionsMenu is an async function
            // we cannot determine that it has ended
            instance._listViewModel.setActiveItem(instance._listViewModel.at(0));
            instance._onItemActionsMenuResult('itemClick', actionModel, fakeEvent2);
            assert.exists(outgoingEventsMap.actionClick, 'actionClick event has not been fired');
            assert.exists(outgoingEventsMap.actionClick[2], 'Third argument has not been set');
            assert.equal(outgoingEventsMap.actionClick[2].className, 'controls-ListView__itemV');
         });

         // Клик по ItemAction в контекстном меню отдавать контейнер в событии
         it('should send target container in event on click in context menu', async () => {
            const fakeEvent = initFakeEvent();
            const fakeEvent2 = initFakeEvent();
            const actionModel = {
               getRawData: () => ({
                  id: 2,
                  showType: 0
               })
            };
            await instance._onItemContextMenu(null, item, fakeEvent);
            instance._onItemActionsMenuResult('itemClick', actionModel, fakeEvent2);
            assert.exists(outgoingEventsMap.actionClick, 'actionClick event has not been fired');
            assert.exists(outgoingEventsMap.actionClick[2], 'Third argument has not been set');
            assert.equal(outgoingEventsMap.actionClick[2].className, 'controls-ListView__itemV');
         });

         // Клик по itemAction с подменю ('parent@': true) должен бросать событие actionClick
         it('should emit actionClick event on submenu (\'parent@\': true) action click', async () => {
            const fakeEvent2 = initFakeEvent();
            const stubHandleItemActionClick = sinon.stub(lists.BaseControl._private, 'handleItemActionClick');
            const actionModel = {
               getRawData: () => ({
                  id: 2,
                  showType: 0,
                  parent: 1,
                  'parent@': true
               })
            };
            instance._listViewModel.setActiveItem(instance._listViewModel.at(0));
            instance._onItemActionsMenuResult('itemClick', actionModel, fakeEvent2);
            sinon.assert.called(stubHandleItemActionClick);
            stubHandleItemActionClick.restore();
         });

         // Клик по itemAction с подменю ('parent@': true) не должен закрывать меню если обрабочик события вернул false
         it('should not close actions menu when event has returned false', async () => {
            const fakeEvent2 = initFakeEvent();
            const spyCloseActionsMenu = sinon.spy(lists.BaseControl._private, 'closeActionsMenu');
            const stubNotify = sinon.stub(instance, '_notify').callsFake((event, args) => {
               if (event === 'actionClick') {
                  return false;
               }
            });
            const actionModel = {
               getRawData: () => ({
                  id: 2,
                  showType: 0,
                  parent: 1,
                  'parent@': true
               })
            };
            instance._listViewModel.setActiveItem(instance._listViewModel.at(0));
            instance._onItemActionsMenuResult('itemClick', actionModel, fakeEvent2);
            sinon.assert.notCalled(spyCloseActionsMenu);
            stubNotify.restore();
            spyCloseActionsMenu.restore();
         });

         // Клик по itemAction с подменю ('parent@': true) должен закрывать меню если обрабочик события не вернул false
         it('should close actions menu when event hasn\'t returned false', async () => {
            const fakeEvent2 = initFakeEvent();
            const stubCloseActionsMenu = sinon.stub(lists.BaseControl._private, 'closeActionsMenu').callsFake(() => {});
            const stubNotify = sinon.stub(instance, '_notify').callsFake((event, args) => {
               if (event === 'actionClick') {
                  return null;
               }
            });
            const actionModel = {
               getRawData: () => ({
                  id: 2,
                  showType: 0,
                  parent: 1,
                  'parent@': true
               })
            };
            instance._listViewModel.setActiveItem(instance._listViewModel.at(0));
            instance._onItemActionsMenuResult('itemClick', actionModel, fakeEvent2);
            sinon.assert.called(stubCloseActionsMenu);
            stubNotify.restore();
            stubCloseActionsMenu.restore();
         });

         // Скрытие ItemActions должно происходить только после открытия меню (событие menuOpened)
         it('should hide ItemActions on menuOpened event', () => {
            const fakeEvent = initFakeEvent();
            const spyHideActions = sinon.spy(lists.BaseControl._private, 'removeShowActionsClass');
            instance._onItemActionsMenuResult('menuOpened', null, fakeEvent);
            sinon.assert.called(spyHideActions);
            spyHideActions.restore();
         });

         // после закрытия меню ItemActions должны появиться снова
         it('should show ItemActions on menu close event', () => {
            instance._itemActionsMenuId = 'popupId_1';
            const spyShowActions = sinon.spy(lists.BaseControl._private, 'addShowActionsClass');
            instance._onItemActionsMenuClose({id: 'popupId_1'});
            sinon.assert.called(spyShowActions);
            spyShowActions.restore();
         });

         // Скрытие Swipe ItemActions должно происходить после открытия меню (событие menuOpened)
         it('should hide Swipe ItemActions on menuOpened event', () => {
            const fakeEvent = initFakeEvent();
            const itemActionsController = lists.BaseControl._private.getItemActionsController(instance, cfg);
            const spyDeactivateSwipe = sinon.spy(itemActionsController, 'deactivateSwipe');
            const spySetActiveItem = sinon.spy(itemActionsController, 'setActiveItem');
            instance._onItemActionsMenuResult('menuOpened', null, fakeEvent);
            sinon.assert.called(spyDeactivateSwipe);
            sinon.assert.notCalled(spySetActiveItem);
            spyDeactivateSwipe.restore();
            spySetActiveItem.restore();
         });

         // должен открывать меню, соответствующее новому id Popup
         it('should open itemActionsMenu according to its id', () => {
            const fakeEvent = initFakeEvent();
            const stubGetItemActionsController = sinon.stub(lists.BaseControl._private, 'getItemActionsController');
            const fake = {
               _itemActionsController: {
                  prepareActionsMenuConfig: (item, clickEvent, action, self, isContextMenu) => ({}),
                  setActiveItem: (_item) => {},
                  deactivateSwipe: () => {}
               },
               _itemActionsMenuId: 'fake',
               _scrollHandler: () => {},
               _notify: () => {}
            };
            stubGetItemActionsController.callsFake((self) => self._itemActionsController);
            const menuConfig = lists.BaseControl._private.getItemActionsMenuConfig(fake, null, fakeEvent, item, false);
            return lists.BaseControl._private.openItemActionsMenu(fake, fakeEvent, item, menuConfig)
               .then(() => {
                  assert.equal(fake._itemActionsMenuId, 'ekaf');
               })
                .finally(() => {
                   stubGetItemActionsController.restore();
                });
         });

         // Нужно устанавливать active item только после того, как пришёл id нового меню
         it('should set active item only after promise then result', (done) => {
            const fakeEvent = initFakeEvent();
            const stubGetItemActionsController = sinon.stub(lists.BaseControl._private, 'getItemActionsController');
            let activeItem = null;
            const fake = {
               _itemActionsController: {
                  prepareActionsMenuConfig: (item, clickEvent, action, self, isContextMenu) => ({}),
                  setActiveItem: (_item) => {
                     activeItem = _item;
                  }
               },
               _itemActionsMenuId: null,
               _scrollHandler: () => {},
               _notify: () => {}
            };
            stubGetItemActionsController.callsFake((self) => self._itemActionsController);
            const menuConfig = lists.BaseControl._private.getItemActionsMenuConfig(fake, null, fakeEvent, item, false);
            lists.BaseControl._private.openItemActionsMenu(fake, fakeEvent, item, menuConfig)
               .then(() => {
                  assert.equal(activeItem, item);
                  done();
               })
               .catch((error) => {
                  done();
               })
               .finally(() => {
                  stubGetItemActionsController.restore();
               });
            assert.equal(activeItem, null);
         });

         // Необходимо закрывать контекстное меню, если элемент, по которому оно было открыто, удалён из списка
         // См. также https://online.sbis.ru/opendoc.html?guid=b679bbc7-210f-4326-8c08-fcba2e3989aa
         it('should close context menu if its owner was removed', function() {
            instance._itemActionsMenuId = 'popup-id-0';
            instance._itemActionsController.setActiveItem(item);
            instance.getViewModel()
               ._notify(
                  'onListChange',
                  'collectionChanged',
                  collection.IObservable.ACTION_REMOVE,
                  null,
                  null,
                  [{
                     getContents: () => {
                        return {
                           getKey: () => 2
                        };
                     },
                     setMarked: () => null
                  }],
                  null);

            assert.isNull(instance._itemActionsMenuId);
            assert.isNull(instance._itemActionsController.getActiveItem());
         });

         // Необходимо закрывать контекстное меню, если элемент, по которому оно было открыто, заменён
         it('should close context menu if its owner was removed', function() {
            instance._itemActionsMenuId = 'popup-id-0';
            instance._itemActionsController.setActiveItem(item);
            instance.getViewModel()
               ._notify(
                  'onListChange',
                  'collectionChanged',
                  collection.IObservable.ACTION_REPLACE,
                  null,
                  null,
                  [{
                     getContents: () => {
                        return {
                           getKey: () => 2
                        };
                     },
                     setMarked: () => null
                  }],
                  null);

            assert.isNull(instance._itemActionsMenuId);
            assert.isNull(instance._itemActionsController.getActiveItem());
         });

         // Необходимо закрывать контекстное меню, если элемент, по которому оно было открыто удалён из списка.
         // Даже если это breadCrumbsItem
         // См. также https://online.sbis.ru/opendoc.html?guid=b679bbc7-210f-4326-8c08-fcba2e3989aa
         it('should close context menu if its owner was removed even if it was breadcrumbsItem', function() {
            instance._itemActionsMenuId = 'popup-id-0';
            const itemAt1 = instance._listViewModel.at(1);
            const breadcrumbItem = {
               '[Controls/_display/BreadcrumbsItem]': true,
               _$active: false,
               getContents: function () {
                  const breadcrumbs = this.getBreadcrumbs();
                  return breadcrumbs[breadcrumbs.length - 1];
               },
               getBreadcrumbs: () => ['fake', 'fake', 'fake', itemAt1.getContents() ],
               setActive: function() {
                  this._$active = true;
               },
               getActions: () => ({
                  all: [{
                     id: 2,
                     showType: 0
                  }]
               }),
               isSwiped: () => false,
               setMarked: () => null
            };
            instance._itemActionsController.setActiveItem(breadcrumbItem);
            instance.getViewModel()
               ._notify(
                  'onListChange',
                  'collectionChanged',
                  collection.IObservable.ACTION_REMOVE,
                  null,
                  null,
                  [breadcrumbItem],
                  null);

            assert.isNull(instance._itemActionsMenuId);
            assert.isNull(instance._itemActionsController.getActiveItem());
         });

         // Должен сбрасывать activeItem Только после того, как мы закрыли последнее меню.
         describe ('Multiple clicks to open context menu', () => {
            let fakeEvent;
            let fakeEvent2;
            let fakeEvent3;
            let popupIds;
            let openPopupStub;
            let closePopupStub;
            let _onItemActionsMenuCloseSpy;
            let localInstance;

            before(async () => {
               localInstance = instance;
               fakeEvent = initFakeEvent();
               fakeEvent2 = initFakeEvent();
               fakeEvent3 = initFakeEvent();
               popupIds = [];
               openPopupStub = sinon.stub(popup.Sticky, 'openPopup');
               closePopupStub = sinon.stub(popup.Sticky, 'closePopup');
               _onItemActionsMenuCloseSpy = sinon.spy(localInstance, '_onItemActionsMenuClose');

               openPopupStub.callsFake((config) => {
                  const popupId = `popup-id-${popupIds.length}`;
                  popupIds.push(popupId);
                  return Promise.resolve(popupId);
               });
               closePopupStub.callsFake((popupId) => {
                  const index = popupIds.indexOf(popupId);
                  if (index !== -1) {
                     popupIds.splice(index, 1);

                     // В реальности callback вызывается асинхронно,
                     // Но нам главное, чтобы activeItem обнулялся только после закрытия самого последнего меню,
                     // поэтому это не играет роли.
                     localInstance._onItemActionsMenuClose({id: popupId});
                  }
               });

               const menuConfig = lists.BaseControl._private.getItemActionsMenuConfig(localInstance, item, fakeEvent, null, false);

               // имитируем клик правой кнопкой мыши несколько раз подряд.
               await Promise.all([
                  lists.BaseControl._private.openItemActionsMenu(localInstance, fakeEvent, item, menuConfig),
                  lists.BaseControl._private.openItemActionsMenu(localInstance, fakeEvent2, item, menuConfig),
                  lists.BaseControl._private.openItemActionsMenu(localInstance, fakeEvent3, item, menuConfig)
               ]);
            });

            after(() => {
               openPopupStub.restore();
               closePopupStub.restore();
            });

            // Ожидаем, что произошла попытка открыть три popup и закрыть 2 из них
            it('should open 3 popups and close 2', () => {
               sinon.assert.callCount(openPopupStub, 3);
               sinon.assert.callCount(_onItemActionsMenuCloseSpy, 2);
            });

            // Проверяем activeItem, он не должен быть null
            // проверяем текущий _itemActionsMenuId. Он жолжен быть равен последнему popupId
            it('active item and _itemActionsMenuId should not be null until last menu is closed', () => {
               assert.exists(localInstance._itemActionsController.getActiveItem(),
                  'active item should not be null until last menu will closed');
               assert.equal(localInstance._itemActionsMenuId, popupIds[popupIds.length - 1],
                  '_itemActionsMenuId should not be null until last menu will closed');
            });

            it('active item and _itemActionsMenuId should be null after closing last menu', () => {
               // Пытаемся закрыть самый последний popup
               localInstance._onItemActionsMenuClose({id: popupIds[popupIds.length - 1]});

               // Проверяем activeItem, он должен быть null
               assert.notExists(localInstance._itemActionsController.getActiveItem(),
                  'active item should be null after closing last menu');

               // проверяем текущий _itemActionsMenuId. Он должен быть null
               assert.notExists(localInstance._itemActionsMenuId,
                  '_itemActionsMenuId should be null after closing last menu');
            });
         });

         // Необходимо закрывать popup с указанным id
         it('should close popup with specified id', () => {
            instance._itemActionsMenuId = 'fake';
            instance._onItemActionsMenuClose({id: 'ekaf'});
            assert.equal(instance._itemActionsMenuId, 'fake');
            instance._onItemActionsMenuClose(null);
            assert.equal(instance._itemActionsMenuId, null);
         });

         // Необходимо показать контекстное меню по longTap, если не был инициализирован itemActionsController
         it('should display context menu on longTap', () => {
            const spyOpenContextMenu = sinon.spy(lists.BaseControl._private, 'openContextMenu');
            const spyUpdateItemActions = sinon.spy(lists.BaseControl._private, 'updateItemActions');
            const spyOpenItemActionsMenu = sinon.spy(lists.BaseControl._private, 'openItemActionsMenu');
            const fakeEvent = initFakeEvent();
            instance._listViewModel.setActionsAssigned(false);
            instance._itemActionsController = undefined;
            instance._onItemLongTap(null, item, fakeEvent);
            sinon.assert.called(spyOpenContextMenu);
            sinon.assert.called(spyUpdateItemActions);
            sinon.assert.called(spyOpenItemActionsMenu);
            spyOpenContextMenu.restore();
            spyUpdateItemActions.restore();
            spyOpenItemActionsMenu.restore();
         });

         // Клик по ItemAction в тулбаре должен приводить к расчёту контейнера
         it('should calculate container to send it in event on toolbar action click', () => {
            const fakeEvent = initFakeEvent();
            const action = {
               id: 1,
               showType: 0
            };
            instance._listViewModel.getIndex = (item) => 0;
            instance._onItemActionMouseDown(fakeEvent, action, instance._listViewModel.at(0));
            assert.exists(outgoingEventsMap.actionClick, 'actionClick event has not been fired');
            assert.exists(outgoingEventsMap.actionClick[2], 'Third argument has not been set');
            assert.equal(outgoingEventsMap.actionClick[2].className, 'controls-ListView__itemV');
         });

         // Клик по ItemAction в тулбаре должен в событии actionClick передавать nativeEvent
         it('should pass nativeEvent as param for outgoing event on toolbar action click', () => {
            const fakeEvent = initFakeEvent();
            const action = {
               id: 1,
               showType: 0
            };
            instance._listViewModel.getIndex = (item) => 0;
            instance._onItemActionMouseDown(fakeEvent, action, instance._listViewModel.at(0));
            assert.exists(outgoingEventsMap.actionClick, 'actionClick event has not been fired');
            assert.exists(outgoingEventsMap.actionClick[3], 'Third argument has not been set');
            assert.exists(outgoingEventsMap.actionClick[3].preventDefault, 'Third argument should be nativeEvent');
         });

         // Необходимо при показе меню ItemActions регистрировать обработчик события скролла
         it('should register scroll handler on display ItemActions menu', (done) => {
            const fakeEvent = initFakeEvent();
            const stubGetItemActionsController = sinon.stub(lists.BaseControl._private, 'getItemActionsController');
            let isScrollHandlerCalled = false;
            let lastFiredEvent = null;
            const fake = {
               _itemActionsController: {
                  prepareActionsMenuConfig: (item, clickEvent, action, self, isContextMenu) => ({}),
                  setActiveItem: (_item) => {}
               },
               _itemActionsMenuId: null,
               _scrollHandler: () => {
                  isScrollHandlerCalled = true;
               },
               _notify: (eventName, args) => {
                  lastFiredEvent = {eventName, args};
               }
            };
            stubGetItemActionsController.callsFake((self) => self._itemActionsController);
            const menuConfig = lists.BaseControl._private.getItemActionsMenuConfig(fake, null, fakeEvent, item, false);
            lists.BaseControl._private.openItemActionsMenu(fake, fakeEvent, item, menuConfig)
               .then(() => {
                  assert.exists(lastFiredEvent, 'ListenerUtils did not fire any event');
                  assert.equal(lastFiredEvent.eventName, 'register', 'Last fired event is wrong');
                  lastFiredEvent.args[2]();
                  assert.isTrue(isScrollHandlerCalled, '_scrollHandler() should be called');
                  done();
               })
               .catch((error) => {
                  done();
               })
               .finally(() => {
                  stubGetItemActionsController.restore();
               });
         });

         // Необходимо при закрытии меню ItemActions снимать регистрацию обработчика события скролла
         it('should unregister scroll handler on close ItemActions menu', () => {
            let lastFiredEvent = null;
            const self = {
               _itemActionsMenuId: 'fake',
               _notify: (eventName, args) => {
                  lastFiredEvent = {eventName, args};
               },
               _itemActionsController: {
                  setActiveItem: (_item) => { },
                  deactivateSwipe: () => {}
               }
            };
            lists.BaseControl._private.closePopup(self);
            assert.exists(lastFiredEvent, 'ListenerUtils did not fire any event');
            assert.equal(lastFiredEvent.eventName, 'unregister', 'Last fired event is wrong');
         });
      });

      it('should close Swipe when list loses its focus (_onListDeactivated() is called)', () => {
         const cfg = {
            viewName: 'Controls/List/ListView',
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            keyProperty: 'id',
            source: source
         };
         const instance = correctCreateBaseControl(cfg);
         const sandbox = sinon.createSandbox();
         let isCloseSwipeCalled = false;
         sandbox.replace(lists.BaseControl._private, 'closeSwipe', () => {
            isCloseSwipeCalled = true;
         });
         instance._onListDeactivated();
         assert.isTrue(isCloseSwipeCalled);
         sandbox.restore();
      });

      it('resolveIndicatorStateAfterReload', function() {
         let listViewModelCount = 0;
         var baseControlMock = {
            _needScrollCalculation: true,
            _hasMoreData: () => {
               return true;
            },
            _sourceController: {
               hasMoreData: () => {
                  return true;
               }
            },
            _listViewModel: {
               getCount: function() {
                  return listViewModelCount;
               }
            },
            _notify: () => {},
            _isMounted: true,
            _scrollTop: 0,
            _container: {
               getBoundingClientRect() {
                  return {
                     y: -900
                  };
               }
            },
            _viewportRect: { top: 0 },
            _options: {}
         };
         const navigation = {
            view: 'maxCount'
         };
         var emptyList = new collection.List();
         var list = new collection.List({ items: [{ test: 'testValue' }] });

         lists.BaseControl._private.resolveIndicatorStateAfterReload(baseControlMock, emptyList, navigation);
         assert.equal(baseControlMock._loadingState, 'down');

         listViewModelCount = 1;
         lists.BaseControl._private.resolveIndicatorStateAfterReload(baseControlMock, emptyList, navigation);
         assert.equal(baseControlMock._loadingState, 'down');

         lists.BaseControl._private.resolveIndicatorStateAfterReload(baseControlMock, list, navigation);
         assert.isNull(baseControlMock._loadingState);

      });

      it('reloadItem', async function() {
         var filter = {};
         var cfg = {
            viewName: 'Controls/List/ListView',
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            keyProperty: 'id',
            source: source,
            filter: filter,
            items: rs,
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
         var baseCtrl = await correctCreateBaseControlAsync(cfg);
         await baseCtrl._beforeMount(cfg);
         baseCtrl.saveOptions(cfg);

         assert.isTrue(baseCtrl._sourceController.hasMoreData('down'));

         const reloadedItem = await baseCtrl.reloadItem(1);
         assert.equal(reloadedItem.get('id'), 1);
         assert.equal(reloadedItem.get('title'), 'Первый');
         assert.isTrue(baseCtrl._sourceController.hasMoreData('down'), 'wrong navigation after reload item');
         assert.isTrue(baseCtrl._itemReloaded);
         assert.isTrue(baseCtrl._items.getCount() === 2);

         let reloadedItems = await baseCtrl.reloadItem(1, null, true, 'query');
         assert.isTrue(!!reloadedItems.getCount);
         assert.equal(reloadedItems.getCount(), 1);
         assert.equal(reloadedItems.at(0).get('id'), 1);
         assert.isTrue(baseCtrl._sourceController.hasMoreData('down'), 'wrong navigation after reload item');

         let recordSet = new collection.RecordSet({
            keyProperty: 'id',
            rawData: [{ id: 'test' }]
         });
         baseCtrl._listViewModel.setItems(recordSet);
         reloadedItems = await baseCtrl.reloadItem('test', null, true, 'query');
         assert.isTrue(reloadedItems.getCount() === 0);
      });

      it('reloadItem with new model', function() {
         var filter = {};
         var cfg = {
            viewName: 'Controls/List/ListView',
            viewModelConstructor: 'Controls/display:Collection',
            useNewModel: true,
            keyProperty: 'id',
            source: source,
            filter: filter,
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
         var baseCtrl = correctCreateBaseControl(cfg);
         baseCtrl.saveOptions(cfg);

         return new Promise(function(resolve) {
            baseCtrl._beforeMount(cfg);
            assert.isTrue(baseCtrl._sourceController.hasMoreData('down'));

            baseCtrl.reloadItem(1).addCallback((item) => {
               assert.equal(item.get('id'), 1);
               assert.equal(item.get('title'), 'Первый');
               assert.isFalse(baseCtrl._itemReloaded);
               resolve();
            });
         });
      });

      it('update key property', async() => {
         const cfg = {
                viewName: 'Controls/List/ListView',
                viewModelConfig: {
                   items: [],
                   keyProperty: 'id'
                },
                viewModelConstructor: lists.ListViewModel,
                keyProperty: 'id',
                source: source
             },
             instance = correctCreateBaseControl(cfg);
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         let newKeyProperty;
         instance._listViewModel.setKeyProperty = (value) => {
            newKeyProperty = value;
         };
         const keyProperty = 'name';
         const newCfg = {
            ...cfg,
            keyProperty
         };
         instance._beforeUpdate(newCfg);
         assert.equal(newKeyProperty, 'name');
         instance.destroy();
      });

      it('close and destroy editInPlace if model changed', async () => {
         const cfg = {
               viewName: 'Controls/List/ListView',
               viewModelConfig: {
                  items: [],
                  keyProperty: 'id'
               },
               viewModelConstructor: lists.ListViewModel,
               keyProperty: 'id',
               source: source
            },
            instance = correctCreateBaseControl(cfg);
         let isEditingCanceled = false;
         let isEIPDestroyed = false;
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         instance._viewModelConstructor = {};
         const cancelPromise = Promise.resolve();
         instance._cancelEdit = () => {
            isEditingCanceled = true;
            return cancelPromise;
         };
         instance._editInPlaceController = {
            isEditing: () => true,
            updateOptions: () => {},
            destroy: () => {
               isEIPDestroyed = true;
            }
         };
         instance._beforeUpdate(cfg);
         return cancelPromise.then(() => {
            assert.isTrue(isEditingCanceled);
            assert.isTrue(isEIPDestroyed);
            assert.isNull(instance._editInPlaceController);
         });
      });

      it('close and but not destroy editInPlace if reloaded', async () => {
         const cfg = {
               viewName: 'Controls/List/ListView',
               viewModelConfig: {
                  items: [],
                  keyProperty: 'id'
               },
               viewModelConstructor: lists.ListViewModel,
               keyProperty: 'id',
               source: source
            },
            instance = correctCreateBaseControl(cfg);
         let isEditingCanceled = false;
         let isEIPDestroyed = false;
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         const cancelPromise = Promise.resolve();
         instance._cancelEdit = () => {
            isEditingCanceled = true;
            return cancelPromise;
         };
         instance._editInPlaceController = {
            isEditing: () => true,
            updateOptions: () => {},
            destroy: () => {
               isEIPDestroyed = true;
            }
         };
         instance._beforeUpdate({...cfg, filter: {qw: ''}, loading: true});
         return cancelPromise.then(() => {
            assert.isTrue(isEditingCanceled);
            assert.isFalse(isEIPDestroyed);
            assert.isNotNull(instance._editInPlaceController);
         });
      });

      it('getListTopOffset', function () {
         let resultsHeight = 0;
         let headerHeight = 0;

         const enableHeader = () => { bc._children.listView.getHeaderHeight = () => headerHeight };
         const disableHeader = () => { bc._children.listView.getHeaderHeight = undefined };
         const enableResults = () => { bc._children.listView.getResultsHeight = () => resultsHeight };
         const disableResults = () => { bc._children.listView.getResultsHeight = undefined };

         const bc = {
            _children: {
               listView: {
               }
            }
         };
         assert.equal(lists.BaseControl._private.getListTopOffset(bc), 0);

         enableHeader();
         headerHeight = 40;
         assert.equal(lists.BaseControl._private.getListTopOffset(bc), 40);

         enableResults();
         resultsHeight = 30;
         assert.equal(lists.BaseControl._private.getListTopOffset(bc), 70);

         disableHeader();
         disableResults();

         /* Список находится в скроллконтейнере, но не личном. До списка лежит контент */
         bc._isScrollShown = true;
         bc._viewportRect = {
            top: 50
         };
         bc._scrollTop = 1000;
         bc._container = {
            getBoundingClientRect() {
               return {
                  y: -900
               };
            }
         };
         bc._isMounted = false;
         assert.equal(lists.BaseControl._private.getListTopOffset(bc), 0);
         bc._isMounted = true;
         assert.equal(lists.BaseControl._private.getListTopOffset(bc), 50);
      });

      it('should fire "drawItems" in afterMount', async function() {
         let
             cfg = {
                viewName: 'Controls/List/ListView',
                viewModelConfig: {
                   items: [],
                   keyProperty: 'id'
                },
               viewModelConstructor: lists.ListViewModel,
                keyProperty: 'id',
                source: source
             },
             instance = correctCreateBaseControl(cfg);
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         instance._container = {};
         let fakeNotify = sandbox.spy(instance, '_notify')
             .withArgs('drawItems');
         instance._afterMount(cfg);
         assert.isTrue(fakeNotify.calledOnce);
      });

      it('should fire "drawItems" event if collection has changed', async function() {
         var
            cfg = {
               viewName: 'Controls/List/ListView',
               viewModelConfig: {
                  items: [],
                  keyProperty: 'id'
               },
               viewModelConstructor: lists.ListViewModel,
               keyProperty: 'id',
               source: source
            },
            instance = correctCreateBaseControl(cfg);
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         instance._beforeUpdate(cfg);
         instance._afterUpdate(cfg);
         instance._afterRender();

         var fakeNotify = sandbox.spy(instance, '_notify')
            .withArgs('drawItems');

         instance.getViewModel()
            ._notify('onListChange', 'collectionChanged');
         assert.isFalse(fakeNotify.called);
         instance._beforeUpdate(cfg);
         assert.isFalse(fakeNotify.called);
         instance._afterUpdate(cfg);
         instance._afterRender();
         assert.isTrue(fakeNotify.calledOnce);
      });

      it('changing source, if sourceController in options', async function() {
         var
             cfg = {
                viewName: 'Controls/List/ListView',
                viewModelConfig: {
                   items: [],
                   keyProperty: 'id'
                },
                viewModelConstructor: lists.ListViewModel,
                keyProperty: 'id',
                source: source,
                sourceController: new dataSource.NewSourceController({
                   source
                })
             },
             instance = correctCreateBaseControl(cfg);

         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);

         cfg = {...cfg};
         cfg.source = new sourceLib.Memory();
         assert.isTrue(!(instance._beforeUpdate(cfg) instanceof Promise));
      });

      it('should fire "drawItems" with new collection if source item has changed', async function() {
         var
            cfg = {
               viewName: 'Controls/List/ListView',
               viewModelConfig: {
                  items: [],
                  keyProperty: 'id'
               },
               viewModelConstructor: lists.ListViewModel,
               keyProperty: 'id',
               source: source
            },
            instance = correctCreateBaseControl(cfg);
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         instance._beforeUpdate(cfg);
         instance._afterUpdate(cfg);
         instance._afterRender();

         instance.saveOptions({
            ...cfg,
            useNewModel: true
         });

         var fakeNotify = sandbox.spy(instance, '_notify')
            .withArgs('drawItems');

         const noRedrawChange = [{ sourceItem: true}];
         noRedrawChange.properties = 'marked';

         instance.getViewModel()
            ._notify('onListChange', null, 'ch', noRedrawChange, 0, noRedrawChange, 0);
         assert.isFalse(fakeNotify.called);
         instance._beforeUpdate(cfg);
         assert.isFalse(fakeNotify.called);
         instance._afterUpdate(cfg);
         instance._afterRender();
         assert.isFalse(fakeNotify.calledOnce);

         const redrawChange = [{ sourceItem: true}];

         instance.getViewModel()
            ._notify('onListChange', null, 'ch', redrawChange, 0, redrawChange, 0);
         assert.isFalse(fakeNotify.called);
         instance._beforeUpdate(cfg);
         assert.isFalse(fakeNotify.called);
         instance._afterUpdate(cfg);
         instance._afterRender();
         assert.isTrue(fakeNotify.calledOnce);
      });

      it('should fire "drawItems" with new collection if source item has changed', async function() {
         var
            cfg = {
               viewName: 'Controls/List/ListView',
               viewModelConfig: {
                  items: [],
                  keyProperty: 'id'
               },
               viewModelConstructor: lists.ListViewModel,
               keyProperty: 'id',
               source: source
            },
            instance = correctCreateBaseControl(cfg);
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         instance._beforeUpdate(cfg);
         instance._afterUpdate(cfg);
         instance._afterRender();

         instance.saveOptions({
            ...cfg,
            useNewModel: true
         });

         var fakeNotify = sandbox.spy(instance, '_notify')
            .withArgs('drawItems');

         const noRedrawChange = [{ sourceItem: true}];
         noRedrawChange.properties = 'marked';

         instance.getViewModel()
            ._notify('onListChange', null, 'ch', noRedrawChange, 0, noRedrawChange, 0);
         assert.isFalse(fakeNotify.called);
         instance._beforeUpdate(cfg);
         assert.isFalse(fakeNotify.called);
         instance._afterUpdate(cfg);
         instance._afterRender();
         assert.isFalse(fakeNotify.calledOnce);

         const redrawChange = [{ sourceItem: true}];

         instance.getViewModel()
            ._notify('onListChange', null, 'ch', redrawChange, 0, redrawChange, 0);
         assert.isFalse(fakeNotify.called);
         instance._beforeUpdate(cfg);
         assert.isFalse(fakeNotify.called);
         instance._afterUpdate(cfg);
         instance._afterRender();
         assert.isTrue(fakeNotify.calledOnce);
      });

      it('should fire "drawItems" event if indexes have changed', async function() {
         var
            cfg = {
               viewName: 'Controls/List/ListView',
               viewModelConfig: {
                  items: [],
                  keyProperty: 'id'
               },
               viewModelConstructor: lists.ListViewModel,
               keyProperty: 'id',
               source: source,
               virtualScrollConfig: {
                  pageSize: 100
               }
            },
            instance = correctCreateBaseControl(cfg);
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         instance._beforeUpdate(cfg);
         instance._afterUpdate(cfg);
         instance._afterRender();
         var fakeNotify = sandbox.spy(instance, '_notify')
            .withArgs('drawItems');

         instance.getViewModel()
            ._notify('onListChange', 'indexesChanged');
         assert.isFalse(fakeNotify.called);
         instance._beforeUpdate(cfg);
         assert.isFalse(fakeNotify.called);
         instance._afterUpdate(cfg);
         instance._afterRender();
         assert.isTrue(fakeNotify.calledOnce);
      });

      describe('onCollectionChanged with some values of \'properties\' should not reinitialize itemactions', () => {
         let self;
         let handleinitItemActionsCalled;
         let items;
         let sandbox;
         beforeEach(() => {
            handleinitItemActionsCalled = false;
            self = {
               _options: {
                  root: 5
               },
               _prevRootId: 5,
               _selectionController: {
                  isAllSelected: () => true,
                  clearSelection: () => {},
                  handleReset: (items, prevRoot, rootChanged) => {},
                  handleAddItems: (items) => {}
               },
               _listViewModel: {
                  getCount: () => 5
               },
               _onCollectionChange: () => 0,
               changeSelection: () => {}
            };
            items = [{}];
            sandbox = sinon.createSandbox();
            sandbox.replace(lists.BaseControl._private, 'updateInitializedItemActions', (self, options) => {
               handleinitItemActionsCalled = true;
            });
         });

         afterEach(() => {
            sandbox.restore();
         });

         // Смена маркера не должна провоцировать обновление itemActions
         it('should not call updateItemActions when marker has changed', () => {
            items.properties = 'marked';
            lists.BaseControl._private.onCollectionChanged(self, null, 'collectionChanged', 'ch', items);
            assert.isFalse(handleinitItemActionsCalled);
         });

         // Свайп не должен провоцировать обновление itemActions
         it('should not call updateItemActions when item has swiped', () => {
            items.properties = 'swiped';
            lists.BaseControl._private.onCollectionChanged(self, null, 'collectionChanged', 'ch', items);
            assert.isFalse(handleinitItemActionsCalled);
         });

         // Активация не должна провоцировать обновление itemActions
         it('should not call updateItemActions when item has been activated', () => {
            items.properties = 'active';
            lists.BaseControl._private.onCollectionChanged(self, null, 'collectionChanged', 'ch', items);
            assert.isFalse(handleinitItemActionsCalled);
         });

         // Установка флага hovered не должна провоцировать обновление itemActions
         it('should not call updateItemActions when item\'s hovered has been set', () => {
            items.properties = 'hovered';
            lists.BaseControl._private.onCollectionChanged(self, null, 'collectionChanged', 'ch', items);
            assert.isFalse(handleinitItemActionsCalled);
         });

         // Drag не должен провоцировать обновление itemActions
         it('should not call updateItemActions when item has been dragged', () => {
            items.properties = 'dragged';
            lists.BaseControl._private.onCollectionChanged(self, null, 'collectionChanged', 'ch', items);
            assert.isFalse(handleinitItemActionsCalled);
         });

         // Ввод данных в строку редактирования не должен провоцировать обновление itemActions
         it('should not call updateItemActions when item has been dragged', () => {
            items.properties = 'editingContents';
            lists.BaseControl._private.onCollectionChanged(self, null, 'collectionChanged', 'ch', items);
            assert.isFalse(handleinitItemActionsCalled);
         });

         // Если значение properties===undefined не указан, то обновление itemActions происходит по умолчанию
         it('should call updateItemActions when properties is not set', () => {
            lists.BaseControl._private.onCollectionChanged(self, null, 'collectionChanged', 'ch', items);
            assert.isTrue(handleinitItemActionsCalled);
         });
      });

      it('_afterUpdate while loading do not update loadingState', async function() {
         var cfg = {
            viewName: 'Controls/List/ListView',
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            keyProperty: 'id',
            source: source
         };
         var instance = correctCreateBaseControl(cfg);
         var cfgClone = { ...cfg };

         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         instance._container = {
            getElementsByClassName: () => ([{clientHeight: 100, getBoundingClientRect: () => ({ y: 0 }), offsetHeight:0 }]),
            clientHeight: 100,
            getBoundingClientRect: () => ({ y: 0 })
         };
         instance._afterMount(cfg);

         instance._beforeUpdate(cfg);
         instance._afterUpdate(cfg);
         instance._afterRender();

         lists.BaseControl._private.showIndicator(instance, 'down');
         assert.equal(instance._loadingState, 'down');

         cfgClone.loading = true;
         instance.saveOptions(cfg);
         instance._afterUpdate(cfg);
         instance._afterRender();
         assert.equal(instance._loadingState, 'down');
      });

      it('_beforeUpdate with new viewModelConstructor', function() {
         let cfg = {
            viewName: 'Controls/List/ListView',
            sorting: [],
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            keyProperty: 'id',
            source: source
         };
         let instance = correctCreateBaseControl(cfg);

         instance.saveOptions(cfg);
         instance._beforeMount(cfg);
         instance._hasMoreData = () => true;
         instance._beforeUpdate({ ...cfg, viewModelConstructor: tree.TreeViewModel });
         assert.isTrue(instance._listViewModel.getHasMoreData());
      });

      it('_beforeUpdate with new searchValue', async function() {
         let cfg = {
            viewName: 'Controls/List/ListView',
            sorting: [],
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            keyProperty: 'id',
            source: source
         };
         let instance = await correctCreateBaseControlAsync(cfg);
         let cfgClone = { ...cfg };
         let portionSearchReseted = false;

         instance._portionedSearch = lists.BaseControl._private.getPortionedSearch(instance);
         instance._portionedSearch.reset = () => {
            portionSearchReseted = true;
         };

         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);

         cfgClone.searchValue = 'testSearchValue';
         instance._beforeUpdate(cfgClone);
         instance._afterUpdate(cfgClone);
         instance._afterRender();

         assert.isTrue(portionSearchReseted);
         portionSearchReseted = false;

         cfgClone.searchValue = 'test';
         instance._beforeUpdate(cfgClone);
         assert.isTrue(instance._listViewModel._options.searchValue !== cfgClone.searchValue);
         instance._afterUpdate({});
         instance._afterRender();
         assert.isTrue(instance._listViewModel._options.searchValue === cfgClone.searchValue);

         assert.isTrue(portionSearchReseted);
         portionSearchReseted = false;

         await instance.reload();
         assert.isTrue(portionSearchReseted);
      });

      it('_beforeUpdate with new groupingLoader', async function() {
         let cfg = {
            viewName: 'Controls/List/ListView',
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            keyProperty: 'id',
            source: source
         };
         let instance = correctCreateBaseControl(cfg);
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);

         assert.isFalse(!!instance._groupingLoader);
         instance._beforeUpdate({ ...cfg, groupProperty: 'NewProp' });
         instance._options.groupProperty = 'NewProp';
         assert.isTrue(!!instance._groupingLoader);
         instance._beforeUpdate({ ...cfg, groupProperty: undefined });
         assert.isFalse(!!instance._groupingLoader);
         cfg.navigation = {
            view: 'demand'
         };
         instance._beforeUpdate({ ...cfg, groupProperty: 'NewProp' });
         assert.isFalse(!!instance._groupingLoader);
      });

      // Иногда необходимо переинициализировать опции записи в момент обновления контрола
      describe('Update ItemActions in beforeUpdate hook', function() {
         let cfg;
         let instance;
         let items;
         let sandbox;
         let updateItemActionsCalled;
         let isDeactivateSwipeCalled;

         beforeEach(() => {
            items = new collection.RecordSet({
               keyProperty: 'id',
               rawData: data
            });
            cfg = {
               viewName: 'Controls/List/ListView',
               viewModelConfig: {
                  items,
                  keyProperty: 'id'
               },
               itemActions: [
                  {
                     id: 1,
                     title: '123'
                  }
               ],
               viewModelConstructor: lists.ListViewModel,
               itemActionVisibilityCallback: () => {
                  return true;
               },
               keyProperty: 'id',
               source
            };
            instance = correctCreateBaseControl(cfg);
            instance.saveOptions(cfg);
            instance._viewModelConstructor = cfg.viewModelConstructor;
            instance._listViewModel = new lists.ListViewModel(cfg.viewModelConfig);
            instance._itemActionsController = {
               deactivateSwipe: () => {
                  isDeactivateSwipeCalled = true;
               }
            };
            sandbox = sinon.createSandbox();
            updateItemActionsCalled = false;
            isDeactivateSwipeCalled = false;
         });

         afterEach(() => {
            sandbox.restore();
         });

         // Необходимо вызывать updateItemActions при изменении visibilityCallback (демка Controls-demo/OperationsPanel/Demo)
         it('should call updateItemActions when visibilityCallback has changed', async () => {
            instance._listViewModel.setActionsAssigned(true);
            sandbox.replace(lists.BaseControl._private, 'updateItemActions', (self, options) => {
               updateItemActionsCalled = true;
            });
            await instance._beforeUpdate({
               ...cfg,
               source: instance._options.source,
               itemActionVisibilityCallback: () => {
                  return false;
               }
            });
            assert.isTrue(updateItemActionsCalled);
         });

         // Необходимо вызывать updateItemActions при изиенении самих ItemActions
         it('should call updateItemActions when ItemActions have changed', async () => {
            instance._listViewModel.setActionsAssigned(true);
            sandbox.replace(lists.BaseControl._private, 'updateItemActions', (self, options) => {
               updateItemActionsCalled = true;
            });
            await instance._beforeUpdate({
               ...cfg,
               source: instance._options.source,
               itemActions: [
                  {
                     id: 2,
                     title: '456'
                  }
               ]
            });
            assert.isTrue(updateItemActionsCalled);
         });

         // Надо сбрасывать свайп, если изменились ItemActions. Иначе после их изменения свайп будет оставаться поверх записи
         it('should deactivate swipe if it is activated and itemActions have changed', async () => {
            instance._listViewModel.setActionsAssigned(true);
            sandbox.replace(lists.BaseControl._private, 'updateItemActions', (self, options) => {});
            await instance._beforeUpdate({
               ...cfg,
               source: instance._options.source,
               itemActions: [
                  {
                     id: 2,
                     title: '456'
                  }
               ]
            });
            assert.isTrue(isDeactivateSwipeCalled);
         });

         // Необходимо вызывать updateItemActions при изиенении модели (Демка Controls-demo/Explorer/ExplorerLayout)
         it('should call updateItemActions when Model constructor has changed', () => {
            const columns = [
               {
                  displayProperty: 'title',
                  width: '1fr',
                  valign: 'top',
                  style: 'default',
                  textOverflow: 'ellipsis'
               }
            ];
            instance._listViewModel.setActionsAssigned(true);
            sandbox.replace(lists.BaseControl._private, 'updateItemActions', (self, options) => {
               updateItemActionsCalled = true;
            });
            instance._beforeUpdate({
               ...cfg,
               source: instance._options.source,
               columns,
               viewModelConstructor: grid.GridViewModel
            });
            assert.isTrue(updateItemActionsCalled);
         });

         // при неидентичности source необходимо перезапрашивать данные этого source и затем вызывать updateItemActions
         it('should call updateItemActions when data was reloaded', async () => {
            instance._listViewModel.setActionsAssigned(true);
            sandbox.replace(lists.BaseControl._private, 'updateItemActions', (self, options) => {
               updateItemActionsCalled = true;
            });
            await instance._beforeUpdate({
               ...cfg,
               itemActions: [
                  {
                     id: 2,
                     title: '456'
                  }
               ]
            });
            assert.isTrue(updateItemActionsCalled);
         });

         // при смене значения свойства readOnly необходимо вызывать updateItemAction
         it('should call updateItemActions when readOnly option has been changed', () => {
            instance._listViewModel.setActionsAssigned(true);
            sandbox.replace(lists.BaseControl._private, 'updateItemActions', (self, options) => {
               updateItemActionsCalled = true;
            });
            instance._beforeUpdate({
               ...cfg,
               source: instance._options.source,
               readOnly: true,
            });
            assert.isTrue(updateItemActionsCalled);
         });

         // при смене значения свойства itemActionsPosition необходимо вызывать updateItemAction
         it('should call updateItemActions when itemActionsPosition option has been changed', () => {
            instance._listViewModel.setActionsAssigned(true);
            sandbox.replace(lists.BaseControl._private, 'updateItemActions', (self, options) => {
               updateItemActionsCalled = true;
            });
            instance._beforeUpdate({
               ...cfg,
               source: instance._options.source,
               itemActionsPosition: 'outside',
            });
            assert.isTrue(updateItemActionsCalled);
         });

         // при смене набора items из sourceController необходимо вызывать updateItemActions
         it('should call updateItemActions when items wee updated from sourceController', () => {
            const sourceCfg = {
               ...cfg,
               source: instance._options.source,
            };
            const sourceController = new dataSource.NewSourceController(sourceCfg);
            const items = new collection.RecordSet({
               keyProperty: 'id',
               adapter: 'adapter.sbis'
            });
            sourceController.setItems(items);
            instance._listViewModel.setActionsAssigned(true);
            sandbox.replace(lists.BaseControl._private, 'updateItemActions', (self, options) => {
               updateItemActionsCalled = true;
            });

            const newCfg = { ...sourceCfg, sourceController };
            instance._beforeUpdate(newCfg);

            assert.isTrue(updateItemActionsCalled);
         });
      });

      it('_beforeMount create controllers when passed receivedState', async function() {
         let cfg = {
            viewName: 'Controls/List/ListView',
            viewModelConstructor: lists.ListViewModel,
            keyProperty: 'id',
            markerVisibility: 'visible',
            markedKey: 1,
            selectedKeys: [1],
            excludedKeys: [],
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: data
            })
         };
         let instance = await correctCreateBaseControlAsync(cfg);
         await instance._beforeMount(cfg);
         instance.saveOptions(cfg);

         assert.isNotNull(instance._markerController);
         assert.isNotNull(instance._selectionController);
         const item = instance._listViewModel.getItemBySourceKey(1);
         assert.isTrue(item.isMarked());
         assert.isTrue(item.isSelected());
      });

      it('_beforeUnmount', function() {
         let instance = new lists.BaseControl();
         instance._portionedSearch = lists.BaseControl._private.getPortionedSearch(instance);
         instance._beforeUnmount();
         assert.isNull(instance._portionedSearch);
      });

      describe('beforeUpdate', () => {
         let cfg;
         let instance;

         beforeEach(async () => {
            cfg = {
               viewName: 'Controls/List/ListView',
               viewModelConstructor: lists.ListViewModel,
               keyProperty: 'id',
               source,
               viewModelConfig: {
                  items: new collection.RecordSet({
                     keyProperty: 'id',
                     rawData: data
                  }),
                  keyProperty: 'id'
               },
               markerVisibility: 'hidden',
               selectedKeys: [],
               excludedKeys: []
            };
            instance = await correctCreateBaseControlAsync(cfg);
            instance.saveOptions(cfg);
            instance._listViewModel = new lists.ListViewModel(cfg.viewModelConfig);
         });

         it('should create selection controller', async () => {
            assert.isNull(instance._selectionController);
            instance._items = instance._listViewModel.getItems();
            await instance._beforeUpdate({
               ...cfg,
               selectedKeys: [1]
            });
            assert.isNotNull(instance._selectionController);
         });

         it('not should create selection controller', async () => {
            assert.isNull(instance._selectionController);
            await instance._beforeUpdate({
               ...cfg,
               viewModelConstructor: null
            });
            assert.isNull(instance._selectionController);
         });

         it('items changed in sourceController', async() => {
            const sourceController = new dataSource.NewSourceController({ ...cfg });
            const items = new collection.RecordSet({
               keyProperty: 'id',
               adapter: 'adapter.sbis'
            });
            sourceController.setItems(items);
            const newCfg = { ...cfg, sourceController };
            instance._beforeUpdate(newCfg);
            assert.ok(instance._items === items);
         });
      });

      it('should not call _getItemsContainer on error', () => {
         const baseControl = new lists.BaseControl();
         let isGetItemsContainerCalled = false;
         baseControl._isMounted = true;
         baseControl._loadTriggerVisibility = {down: false};
         baseControl._scrollController = {};
         lists.BaseControl._private.showError(baseControl, {
            mode: dataSource.error.Mode.include
         });
         baseControl._getItemsContainer = () => {
            isGetItemsContainerCalled = true;
         };
         baseControl._afterRender();
         assert.isFalse(isGetItemsContainerCalled);
         assert.isNull(baseControl._scrollController);
      });

      it('_getLoadingIndicatorClasses', function() {
         const theme = 'default';
         function testCaseWithArgs(indicatorState, hasPaging, isPortionedSearchInProgress = false) {
            return lists.BaseControl._private.getLoadingIndicatorClasses({
               hasItems: true,
               hasPaging: hasPaging,
               loadingIndicatorState: indicatorState,
               theme,
               isPortionedSearchInProgress,
               attachLoadTopTriggerToNullOption: true
            });
         }

         assert.equal('controls-BaseControl__loadingIndicator controls-BaseControl__loadingIndicator__state-all', testCaseWithArgs('all', false));
         assert.equal('controls-BaseControl__loadingIndicator controls-BaseControl__loadingIndicator__state-up', testCaseWithArgs('up', false));
         assert.equal('controls-BaseControl__loadingIndicator controls-BaseControl__loadingIndicator__state-down', testCaseWithArgs('down', false));
         assert.equal(`controls-BaseControl__loadingIndicator controls-BaseControl__loadingIndicator__state-down`, testCaseWithArgs('down', true));
         assert.equal('controls-BaseControl__loadingIndicator controls-BaseControl__loadingIndicator__state-down controls-BaseControl__loadingIndicator_style-portionedSearch', testCaseWithArgs('down', false, true));

      });

      it('_getLoadingIndicatorStyles', function() {
         const baseControl = new lists.BaseControl();
         let itemsCount;
         baseControl._listViewModel = {
            getCount: () => itemsCount
         };

         assert.equal(baseControl._getLoadingIndicatorStyles('down'), 'display: none;');
         assert.equal(baseControl._getLoadingIndicatorStyles('up'), 'display: none; ');
         assert.equal(baseControl._getLoadingIndicatorStyles('all'), '');

         baseControl._loadingIndicatorContainerHeight = 32;
         itemsCount = 0;
         assert.equal(baseControl._getLoadingIndicatorStyles('down'), 'display: none;');
         assert.equal(baseControl._getLoadingIndicatorStyles('all'), 'min-height: 32px; ');
         assert.equal(baseControl._getLoadingIndicatorStyles('up'), 'display: none; ');

         itemsCount = 10;
         assert.equal(baseControl._getLoadingIndicatorStyles('down'), 'display: none;');
         assert.equal(baseControl._getLoadingIndicatorStyles('all'), 'min-height: 32px; ');
         assert.equal(baseControl._getLoadingIndicatorStyles('up'), 'display: none; ');

         baseControl._loadingIndicatorContainerOffsetTop = 48;
         itemsCount = 0;
         assert.equal(baseControl._getLoadingIndicatorStyles('down'), 'display: none;');
         assert.equal(baseControl._getLoadingIndicatorStyles('all'), 'min-height: 32px; top: 48px;');
         assert.equal(baseControl._getLoadingIndicatorStyles('up'), 'display: none; ');

         itemsCount = 10;
         assert.equal(baseControl._getLoadingIndicatorStyles('down'), 'display: none;');
         assert.equal(baseControl._getLoadingIndicatorStyles('all'), 'min-height: 32px; top: 48px;');
         assert.equal(baseControl._getLoadingIndicatorStyles('up'), 'display: none; ');
      });

      it('hide indicator if shouldn\'t load more', function() {
         const baseControl = new lists.BaseControl();
         baseControl._isMounted = true;

         baseControl._loadingIndicatorState = 'down';
         baseControl._loadTriggerVisibility = {down: false};
         baseControl._afterRender();
         assert.isNull(baseControl._loadingIndicatorState);

         baseControl._loadingIndicatorState = 'up';
         baseControl._loadTriggerVisibility = {up: false};
         baseControl._afterRender();
         assert.isNull(baseControl._loadingIndicatorState);

         baseControl._loadingIndicatorState = 'down';
         baseControl._loadTriggerVisibility = {down: true};
         baseControl._afterRender();
         assert.equal(baseControl._loadingIndicatorState, 'down');

         baseControl._loadingIndicatorState = 'up';
         baseControl._loadTriggerVisibility = {up: true};
         baseControl._afterRender();
         assert.equal(baseControl._loadingIndicatorState, 'up');
      });

      it('setIndicatorContainerHeight: list bigger then scrollContainer', function() {

          const fakeBaseControl = {
              _loadingIndicatorContainerHeight: 0,
              _isScrollShown: true,
          };

          const viewRect = {
             y: -10,
             height: 1000
          };

          const viewPortRect = {
             y: 100,
             height: 500
          };

          lists.BaseControl._private.updateIndicatorContainerHeight(fakeBaseControl, viewRect, viewPortRect);
          assert.equal(fakeBaseControl._loadingIndicatorContainerHeight, 500);
       });

       it('setIndicatorContainerHeight: list smaller then scrollContainer', function () {
          const fakeBaseControl = {
             _loadingIndicatorContainerHeight: 0,
             _isScrollShown: true,
          };

          const viewRect = {
             y: 50,
             height: 200
          };

          const viewPortRect = {
             y: 0,
             height: 500
          };

          lists.BaseControl._private.updateIndicatorContainerHeight(fakeBaseControl, viewRect, viewPortRect);
          assert.equal(fakeBaseControl._loadingIndicatorContainerHeight, 200);
       });

      describe('loading indicators', () => {
          let baseControl,  testCases;

          const getErrorMsg = (index, caseData) => `Test case ${index} failed. Expected ${caseData[4]}. ` +
              `Params: { _loadingIndicatorState: ${caseData[0]}, _attachLoadTopTriggerToNull: ${caseData[1]},
              _loadToDirectionInProgress: ${caseData[2]}, _showLoadingIndicator: ${caseData[3]} }.`;

          const checkCase = (index, caseData, method) => {
             baseControl._loadingIndicatorState = caseData[0];
             baseControl._attachLoadTopTriggerToNull = caseData[1];
             baseControl._loadToDirectionInProgress = caseData[2];
             baseControl._showLoadingIndicator = caseData[3];
             assert.equal(method.apply(baseControl), caseData[4], getErrorMsg(index, caseData));
          };

          beforeEach(() => {
             testCases = [];
             baseControl = new lists.BaseControl();
          });

          it('_shouldDisplayTopLoadingIndicator', () => {
             // indicatorState, _attachLoadTopTriggerToNull, _loadToDirectionInProgress, _showLoadingIndicator, expected
             testCases = [
                ['up',   true,  true,  true,  true],
                ['up',   true,  true,  false, true],
                ['up',   false, false, true,  true],
                ['up',   false, false, true,  true],

                ['down', true,  true,  true,  true],
                ['down', false, true,  false, false],
                ['down', false, false, true,  false],
                ['down', false, false, true,  false],

                ['all',  true,  true,  true,  true],
                ['all',  false, true,  false, false],
                ['all',  false, false, true,  false],
                ['all',  false, false, true,  false],
             ];

             testCases.forEach((caseData, index) => {
                checkCase(index, caseData, baseControl._shouldDisplayTopLoadingIndicator);
             });

             baseControl._loadingIndicatorState = 'up';
             baseControl._portionedSearchInProgress = true;
             assert.equal(baseControl._shouldDisplayTopLoadingIndicator(), false);

             baseControl._portionedSearchInProgress = false;
             baseControl._loadingIndicatorState = 'bottom';
             baseControl.__needShowEmptyTemplate = () => true;
             assert.equal(baseControl._shouldDisplayTopLoadingIndicator(), false);
          });

          it('_shouldDisplayMiddleLoadingIndicator', () => {
             testCases = [
                ['up',   true,  undefined,  true,  false],
                ['up',   false, undefined, false, false],
                ['down', true,  undefined,  true,  false],
                ['down', false, undefined, false, false],
                ['all',  true,  undefined,  true, true],
                ['all',  false, undefined,  true, true],
                ['all',  true,  undefined, false, false],
                ['all',  false, undefined, false, false]
             ];

             testCases.forEach((caseData, index) => {
                checkCase(index, caseData, baseControl._shouldDisplayMiddleLoadingIndicator);
             });

             baseControl._loadingIndicatorState = 'all';
             baseControl.__needShowEmptyTemplate = () => false;
             baseControl._children = {
                listView: {
                   isColumnScrollVisible: () => true
                }
             };
             assert.equal(baseControl._shouldDisplayMiddleLoadingIndicator(), false);
          });

          it('_shouldDisplayBottomLoadingIndicator', () => {
             // indicatorState, __needShowEmptyTemplate, _loadToDirectionInProgress, _showLoadingIndicator, expected
             testCases = [
                ['up',   true,  true,  true,  false],
                ['up',   false, true,  false, false],
                ['up',   false, false, true,  false],
                ['up',   false, false, true,  false],

                ['down', true,  true,  true,  true],
                ['down', false, true,  false, true],
                ['down', false, false, true,  true],
                ['down', false, false, true,  true],

                ['all',  true,  true,  true,  false],
                ['all',  false, true,  false, false],
                ['all',  false, false, true,  false],
                ['all',  false, false, true,  false],
             ];

             testCases.forEach((caseData, index) => {
                checkCase(index, caseData, baseControl._shouldDisplayBottomLoadingIndicator);
             });

             baseControl._loadingIndicatorState = 'bottom';
             baseControl.__needShowEmptyTemplate = () => true;
             assert.equal(baseControl._shouldDisplayBottomLoadingIndicator(), false);

             baseControl._loadingIndicatorState = 'bottom';
             baseControl._attachLoadDownTriggerToNull = true;
             baseControl.__needShowEmptyTemplate = () => false;
             assert.equal(baseControl._shouldDisplayBottomLoadingIndicator(), true);

             baseControl._showContinueSearchButtonDirection = true;
             assert.equal(baseControl._shouldDisplayBottomLoadingIndicator(), false);

             baseControl._showContinueSearchButtonDirection = false;
             baseControl._portionedSearch = {
                isAborted: () => true
             };
             assert.equal(baseControl._shouldDisplayBottomLoadingIndicator(), false);
          });

          it('attachToNull, onCollectionChanged', () => {
            const control = new lists.BaseControl();
            control.saveOptions({
               navigation: {
                  view: 'infinity'
               }
            });
            control._hasMoreData = () => true;
            control._sourceController = {
               hasMoreData: () => false
            };
            control._isMounted = true;
            control._listViewModel = {
               isActionsAssigned: () => false
            };

            lists.BaseControl._private.onCollectionChanged(control, {}, 'collectionChanged', 'rs', [], 0, [], 0);
            assert.isFalse(control._attachLoadTopTriggerToNull);

            lists.BaseControl._private.onCollectionChanged(control, {}, 'collectionChanged', 'rs', [1], 0, [], 0);
            assert.isTrue(control._attachLoadTopTriggerToNull);

             control._attachLoadTopTriggerToNull = false;
             lists.BaseControl._private.onCollectionChanged(control, {}, 'collectionChanged', 'rs', [], 0, [1], 0);
             assert.isTrue(control._attachLoadTopTriggerToNull);
          });
       });

      describe('navigation', function() {
         it('Navigation demand', async function() {
            const source = new sourceLib.Memory({
               keyProperty: 'id',
               data: data
            });

            const cfg = {
               viewName: 'Controls/List/ListView',
               dataLoadCallback: function() {
                  dataLoadFired = true;
               },
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items: [],
                  keyProperty: 'id'
               },
               viewModelConstructor: lists.ListViewModel,
               navigation: {
                  view: 'demand',
                  source: 'page',
                  sourceConfig: {
                     pageSize: 3,
                     page: 0,
                     hasMore: false
                  }
               },
               markerVisibility: 'visible'
            };
            let dataLoadFired = false;

            const ctrl = correctCreateBaseControl(cfg);

            ctrl.saveOptions(cfg);
            await ctrl._beforeMount(cfg);
            ctrl._container = {
               getElementsByClassName: () => ([{ clientHeight: 100, offsetHeight: 0 }]),
               getBoundingClientRect: function() { return {}; }
            };
            ctrl._afterMount(cfg);

            assert.isNull(ctrl._loadedItems);
            assert.isTrue(ctrl._shouldDrawFooter, 'Failed draw footer on first load.');
            assert.equal(ctrl._loadMoreCaption, 3, 'Failed draw footer on first load.');

            const loadPromise = lists.BaseControl._private.loadToDirection(ctrl, 'down');
            assert.equal(ctrl._loadingState, 'down');
            assert.equal(ctrl._markerController.getMarkedKey(), 1);

            await loadPromise;
            assert.isFalse(ctrl._shouldDrawFooter, 'Failed draw footer on second load.');
            assert.equal(6, lists.BaseControl._private.getItemsCount(ctrl), 'Items wasn\'t load');
            assert.isTrue(dataLoadFired, 'dataLoadCallback is not fired');
            assert.equal(ctrl._loadingState, null);
         });

         it('notify itemMouseEnter to parent', function() {
            const cfg = {
               viewName: 'Controls/List/ListView',
               viewConfig: {
                  idProperty: 'id'
               },
               viewModelConfig: {
                  items: rs,
                  idProperty: 'id'
               },
               viewModelConstructor: lists.ListViewModel,
               source: source,
               selectedKeysCount: 1
            };
            const instance = correctCreateBaseControl(cfg);
            const enterItemData = {
               item: {},
               getContents: () => ({
                  getKey: () => null
               })
            };
            const enterNativeEvent = {};
            let called = false;

            instance._notify = (eName, args) => {
               if (eName === 'itemMouseEnter') {
                  called = true;
                  assert.equal(args[0], enterItemData.item);
                  assert.equal(args[1], enterNativeEvent);
               }
            };
            instance._listViewModel = new lists.ListViewModel(cfg.viewModelConfig);

            instance._itemMouseEnter({}, enterItemData, enterNativeEvent);
            assert.isTrue(called);
         });

         it('Reload with empty results', async function() {
            let src = new sourceLib.Memory({
               keyProperty: 'id',
               data: []
            });
            const cfg = {
               source: src,
               viewName: 'Controls/List/ListView',
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items: [],
                  keyProperty: 'id'
               },
               viewModelConstructor: lists.ListViewModel,
               navigation: {
                  view: 'infinity',
                  source: 'page',
                  viewConfig: {
                     pagingMode: 'direct'
                  },
                  sourceConfig: {
                     pageSize: 3,
                     page: 0
                  }
               }
            };

            const ctrl = correctCreateBaseControl(cfg);

            ctrl._setLoadOffset = lists.BaseControl._private.startScrollEmitter = function() {
            };
            ctrl._loadTriggerVisibility = {
               up: false,
               down: true
            };

            ctrl._container = {
               getElementsByClassName: () => ([{
                  clientHeight: 100,
                  getBoundingClientRect: () => ({y: 0})
               }]),
               clientHeight: 100,
               getBoundingClientRect: () => ({y: 0})
            };
            ctrl._children = {
               scrollObserver: {
                  startRegister: () => undefined
               }
            };
            ctrl._loadingIndicatorContainerOffsetTop = 222;
            ctrl.saveOptions(cfg);
            await ctrl._beforeMount(cfg);
            ctrl._afterMount(cfg);

            let queryCallsCount = 0;
            src.query = function(query) {
               if (queryCallsCount === 0) {
                  queryCallsCount++;
                  return Promise.resolve(new sourceLib.DataSet({
                     keyProperty: 'id',
                     metaProperty: 'meta',
                     itemsProperty: 'items',
                     rawData: {
                        items: [],
                        meta: {
                           more: true
                        }
                     }
                  }));
               } else if (queryCallsCount === 1) {
                  queryCallsCount++;
                  return Promise.resolve(new sourceLib.DataSet({
                     keyProperty: 'id',
                     metaProperty: 'meta',
                     itemsProperty: 'items',
                     rawData: {
                        items: [{ id: 1 }, { id: 2 }],
                        meta: {
                           more: false
                        }
                     }
                  }));
               }
            };

            let cfgClone = { ...cfg };
            await ctrl._reload(cfgClone);
            await ctrl._sourceController._loadPromise.promise;

            assert.equal(2, queryCallsCount);
            assert.equal(ctrl._loadingIndicatorContainerOffsetTop, 0);
         });
         it('Navigation position', function() {
            return new Promise(function(resolve, reject) {
               var
                  ctrl,
                  source = new sourceLib.Memory({
                     keyProperty: 'id',
                     data: data,
                     filter: function() {
                        return true;
                     }
                  }),
                  cfg = {
                     viewName: 'Controls/List/ListView',
                     itemsReadyCallback: function(items) {
                        setTimeout(function() {
                           var
                              newItem = items.at(items.getCount() - 1)
                                 .clone();
                           newItem.set('id', 777);
                           items.add(newItem);
                           try {
                              assert.deepEqual(ctrl._sourceController._navigationController._navigationStores.at(0).store._forwardPosition, [777]);
                              resolve();
                           } catch (e) {
                              reject(e);
                           }
                        });
                     },
                     source: source,
                     viewConfig: {
                        keyProperty: 'id'
                     },
                     viewModelConfig: {
                        items: [],
                        keyProperty: 'id'
                     },
                     viewModelConstructor: lists.ListViewModel,
                     navigation: {
                        source: 'position',
                        sourceConfig: {
                           field: 'id',
                           position: 0,
                           direction: 'forward',
                           limit: 20
                        }
                     }
                  };

               ctrl = correctCreateBaseControl(cfg);
               ctrl.saveOptions(cfg);
               ctrl._beforeMount(cfg);
            });
         });
         describe('paging navigation', function() {
            let pageSize, hasMore, self;

            afterEach(() => {
               pageSize = hasMore = self = null;
            });

            it('pageSize=5 && 10 more items && curPage=1 && totalPages=1', function() {
               pageSize = 5;
               hasMore = 10;
               self = {
                  _currentPage: 1,
                  _knownPagesCount: 1
               };

               assert.equal(lists.BaseControl._private.calcPaging(self, hasMore, pageSize), 2);
            });

            it('pageSize=5 && hasMore true && curPage=2 && totalPages=2', function() {
               pageSize = 5;
               hasMore = true;
               self = {
                  _currentPage: 2,
                  _knownPagesCount: 2
               };
               assert.equal(lists.BaseControl._private.calcPaging(self, hasMore, pageSize), 3);
            });

            it('pageSize=5 && hasMore false && curPage=1 && totalPages=1', function() {
               pageSize = 5;
               hasMore = false;
               self = {
                  _currentPage: 1,
                  _knownPagesCount: 1
               };
               assert.equal(lists.BaseControl._private.calcPaging(self, hasMore, pageSize), 1);
            });

            it('isPagingNavigationVisible', () => {
               let isPagingNavigationVisible = lists.BaseControl._private.isPagingNavigationVisible;

               const baseControlOptions = {
                   _options: {
                       navigation: {
                           viewConfig: {
                               totalInfo: 'extended'
                           }
                       }
                   }
               };

               // Известно общее количество  записей, записей 0
               let result = isPagingNavigationVisible(baseControlOptions, 0);
               assert.isFalse(result, 'paging should not be visible');

               // Известно общее количество записей, записей 6
               result = isPagingNavigationVisible(baseControlOptions, 6);
               assert.isTrue(result, 'paging should be visible');

               // Неизвестно общее количество записей, записей 5
               result = isPagingNavigationVisible(baseControlOptions, 5);
               assert.isFalse(result, 'paging should not be visible');


               // Неизвестно общее количество записей, hasMore = false
               result = isPagingNavigationVisible(baseControlOptions, false);
               assert.isFalse(result, 'paging should not be visible');

               // Неизвестно общее количество записей, hasMore = true
               result = isPagingNavigationVisible(baseControlOptions, true);
               assert.isTrue(result, 'paging should be visible');



             baseControlOptions._options.navigation = {};
             // Известно общее количество  записей, записей 0
             result = isPagingNavigationVisible(baseControlOptions, 0);
             assert.isFalse(result, 'paging should not be visible');

             // Известно общее количество записей, записей 6
             result = isPagingNavigationVisible(baseControlOptions, 6);
             assert.isFalse(result, 'paging should not be visible');

             // Неизвестно общее количество записей, hasMore = false
             result = isPagingNavigationVisible(baseControlOptions, false);
             assert.isFalse(result, 'paging should not be visible');

             // Неизвестно общее количество записей, hasMore = true
             result = isPagingNavigationVisible(baseControlOptions, true);
             assert.isTrue(result, 'paging should not be visible');
            });

            describe('getPagingLabelData', function() {
               it('getPagingLabelData', function() {
                  let getPagingLabelData = lists.BaseControl._private.getPagingLabelData;
                  let totalItemsCount = false,
                     currentPage = 1,
                     pageSize = 10;
                  assert.equal(getPagingLabelData(totalItemsCount, pageSize, currentPage), null);

                  totalItemsCount = 100;
                  assert.deepEqual({
                        totalItemsCount: 100,
                        pageSize: '10',
                        firstItemNumber: 1,
                        lastItemNumber: 10,
                     },
                     getPagingLabelData(totalItemsCount, pageSize, currentPage)
                  );

                  totalItemsCount = 15;
                  currentPage = 2;
                  assert.deepEqual({
                        totalItemsCount: 15,
                        pageSize: '10',
                        firstItemNumber: 11,
                        lastItemNumber: 15,
                     },
                     getPagingLabelData(totalItemsCount, pageSize, currentPage)
                  );
               });
            });
            it('changePageSize', async function() {
               let cfg = {
                  viewModelConstructor: lists.ListViewModel,
                  source: source,
                  navigation: {
                     view: 'pages',
                     source: 'page',
                     viewConfig: {
                        pagingMode: 'direct'
                     },
                     sourceConfig: {
                        pageSize: 5,
                        page: 0,
                        hasMore: false
                     }
                  }
               };
               let baseControl = correctCreateBaseControl(cfg);
               let expectedSourceConfig = {};
               let isEditingCanceled = false;
               baseControl.saveOptions(cfg);
               await baseControl._beforeMount(cfg);
               baseControl._sourceController.updateOptions = function(newOptions) {
                  assert.deepEqual(expectedSourceConfig, newOptions.navigation.sourceConfig);
               };
               baseControl._cancelEdit = () => {
                  isEditingCanceled = true;
                  return {
                     then: (cb) => {
                        return cb()
                     }
                  }
               };
               baseControl._editInPlaceController = {
                  isEditing: () => true
               };
               expectedSourceConfig.page = 0;
               expectedSourceConfig.pageSize = 100;
               expectedSourceConfig.hasMore = false;
               baseControl._changePageSize({}, 5);
               assert.isTrue(isEditingCanceled);
               isEditingCanceled = false;
               assert.equal(baseControl._currentPage, 1);
               expectedSourceConfig.page = 1;
               baseControl.__pagingChangePage({}, 2);
               assert.isTrue(isEditingCanceled);
               baseControl._options.navigation.sourceConfig.page = 1;
               expectedSourceConfig.page = 0;
               expectedSourceConfig.pageSize = 200;
               isEditingCanceled = false;
               expectedSourceConfig.hasMore = false;
               baseControl._changePageSize({}, 6);
               assert.isTrue(isEditingCanceled);
            });
         });
         describe('navigation switch', function() {
            var cfg = {
               navigation: {
                  view: 'infinity',
                  source: 'page',
                  viewConfig: {
                     pagingMode: 'direct'
                  },
                  sourceConfig: {
                     pageSize: 3,
                     page: 0,
                     hasMore: false
                  }
               }
            };
            var baseControl = correctCreateBaseControl(cfg);
            baseControl.saveOptions(cfg);
            baseControl._children = triggers;
            it('infinity navigation', function() {
               lists.BaseControl._private.initializeNavigation(baseControl, cfg);
               assert.isTrue(baseControl._needScrollCalculation);
               assert.isFalse(baseControl._pagingNavigation);
            });
            it('page navigation', function() {
               let scrollPagingDestroyed = false;
               cfg.navigation = {
                  view: 'pages',
                  source: 'page',
                  viewConfig: {
                     pagingMode: 'direct'
                  },
                  sourceConfig: {
                     pageSize: 3,
                     page: 0,
                     hasMore: false
                  }
               };
               baseControl._scrollPagingCtr = {
                  destroy:() => { scrollPagingDestroyed = true }
               };
               lists.BaseControl._private.initializeNavigation(baseControl, cfg);
               assert.isTrue(scrollPagingDestroyed);
               assert.isNull(baseControl._scrollPagingCtr);
               assert.isFalse(baseControl._needScrollCalculation);
               assert.isTrue(baseControl._pagingNavigation);
            });
         });
         describe('initializeNavigation', function() {
            let cfg, cfg1, bc;
            cfg = {
               navigation: {
                  view: 'infinity',
                  source: 'page',
                  viewConfig: {
                     pagingMode: 'direct'
                  },
                  sourceConfig: {
                     pageSize: 3,
                     page: 0,
                     hasMore: false
                  }
               },
               viewModelConstructor: lists.ListViewModel,
                keyProperty: 'id'
            };

            it('call check', async function() {
               bc = correctCreateBaseControl(cfg);
               bc.saveOptions(cfg);
               await bc._beforeMount(cfg);
               bc._loadTriggerVisibility = {
                  up: true,
                  down: true
               };
               await bc._beforeUpdate(cfg);
               assert.deepEqual(bc._loadTriggerVisibility, {
                  up: true,
                  down: true
               });
               cfg = {
                  navigation: {
                     view: 'infinity',
                     source: 'page',
                     viewConfig: {
                        pagingMode: 'direct'
                     },
                     sourceConfig: {
                        pageSize: 3,
                        page: 0,
                        hasMore: false
                     }
                  },
                  viewModelConstructor: lists.ListViewModel,
                  keyProperty: 'id'
               };
               await bc._beforeUpdate(cfg);
               assert.deepEqual(bc._loadTriggerVisibility, {
                  up: true,
                  down: true
               });
            });
         });
         it('resetPagingNavigation', function() {
            let instance = {};
            lists.BaseControl._private.resetPagingNavigation(instance);
            assert.deepEqual(instance, {_currentPage: 1, _knownPagesCount: 1, _currentPageSize: 1});

            lists.BaseControl._private.resetPagingNavigation(instance, {sourceConfig: {page:1, pageSize: 5}});
            assert.deepEqual(instance, {_currentPage: 2, _knownPagesCount: 1, _currentPageSize: 5});

         });
      });

      describe('event handlers', function() {

         let
            baseControlOptions,
            baseControl;

         async function mountBaseControl(control, options) {
            control.saveOptions(options);
            await control._beforeMount(options);
            control._container =  {
               getElementsByClassName: () => ([{ clientHeight: 0, offsetHeight: 0 }]),
               getBoundingClientRect: function() { return {}; }
            };
            await control._afterMount(options);
         }

         beforeEach(async () => {
            baseControlOptions = getCorrectBaseControlConfig({
               keyProperty: 'id',
               viewName: 'Controls/List/ListView',
               source: source,
               viewModelConstructor: lists.ListViewModel,
               markedKey: null
            });
            const _baseControl = new lists.BaseControl(baseControlOptions);
            await mountBaseControl(_baseControl, baseControlOptions);
            baseControl = _baseControl;
         });

         afterEach(async () => {
            await baseControl._beforeUnmount();
            baseControl = null;
         });

         describe('_onItemMouseDown', () => {
            it('reset _unprocessedDragEnteredItem', () => {
               const originalEvent = {
                  target: { closest: () => null },
                  nativeEvent: {}
               };
               const itemData = { item: {} };
               const event = { stopPropagation: () => {} };
               baseControl._unprocessedDragEnteredItem = {};
               baseControl._itemMouseDown(event, itemData, originalEvent);
               assert.isNull(baseControl._unprocessedDragEnteredItem);
            });
            it('notify parent', () => {
               const originalEvent = {
                  target: { closest: () => null },
                  nativeEvent: {}
               };
               const event = { stopPropagation: () => {} };
               const itemData = { item: {} };

               baseControl._notify = (eName, args) => {
                  if (eName === 'itemMouseDown') {
                     isNotified = true;
                     assert.equal(args[0], itemData.item);
                     assert.equal(args[1], originalEvent.nativeEvent);
                  }
               };

               let isNotified = false;
               baseControl._itemMouseDown(event, itemData, originalEvent);
               assert.isTrue(isNotified);
            });

            it('should not mark item. Marked key changes only on mouse up', function() {
               const originalEvent = { target: { closest: () => null } };
               const event = { target: { closest: () => null }, stopPropagation: () => {} };

               baseControl._itemMouseDown(event, { key: 3 }, originalEvent);

               assert.equal(baseControl._listViewModel.getMarkedItem(), undefined);
            });
         });

         describe('itemMouseEnter', () => {
            it('reset _unprocessedDragEnteredItem', () => {
               const originalEvent = {
                  target: {},
                  nativeEvent: {}
               };
               const event = {
                  stopPropagation: () => {}
               };
               const dragEvent = {
                  stopPropagation: () => {}
               };
               const dragObject = {
                  entity: {}
               };
               const itemData = {
                  item: {},
                  getContents: () => ({
                     getKey: () => null
                  })
               };
               baseControl._listViewModel.setDragItemData = () => {};
               baseControl._listViewModel.getItemDataByItem = () => { return { item: {} };};
               baseControl._dndListController = {
                  isDragging() { return false; },
                  startDrag() {},
                  calculateDragPosition() {}
               };
               baseControl._draggingItem = { dispItem: {} };
               baseControl._unprocessedDragEnteredItem = null;
               baseControl._itemMouseEnter(event, itemData, originalEvent);
               assert.equal(baseControl._unprocessedDragEnteredItem, itemData, 'should save itemData');

               baseControl._dndListController.isDragging = function() { return true; }
               baseControl._dragStart(dragEvent, dragObject);
               assert.isNull(baseControl._unprocessedDragEnteredItem, 'should reset itemData after processing');
               baseControl._dndListController = null;
            });
         });

         describe('_onItemMouseUp', () => {

            it('notify parent', () => {
               const originalEvent = {
                  target: {
                     closest: () => false
                  },
                  nativeEvent: {}
               };
               const event = {
                  stopPropagation: () => {
                  }
               };
               const itemData = {item: {}, key: 1};

               baseControl._items.getCount = () => 1;

               baseControl._notify = (eName, args) => {
                  if (eName === 'itemMouseUp') {
                     isNotified = true;
                     assert.equal(args[0], itemData.item);
                     assert.equal(args[1], originalEvent.nativeEvent);
                  }
               };

               let isNotified = false;
               baseControl._itemMouseUp(event, itemData, originalEvent);
               assert.isTrue(isNotified);
            });

            it('should mark single item if not editing', async function() {
               baseControlOptions.markerVisibility = 'onactivated';
               await mountBaseControl(baseControl, baseControlOptions);

               const originalEvent = {target: {
                     closest: () => false
                  }
               };
               const event = {};

               const notifySpy = sinon.spy(baseControl, '_notify');

               baseControl._items.getCount = () => 1;
               baseControl._mouseDownItemKey = 1;

               assert.isUndefined(baseControl._listViewModel.getMarkedItem());
               await baseControl._itemMouseUp(event, { key: 1 }, originalEvent);

               assert.isTrue(notifySpy.withArgs('markedKeyChanged', [1]).called);
               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(1).isMarked());
            });

            it('not should marker, _needSetMarkerCallback return false', async function() {
               baseControlOptions._needSetMarkerCallback = () => false;
               await mountBaseControl(baseControl, baseControlOptions);

               const originalEvent = {target: { closest: () => false}};
               const event = {};

               const notifySpy = sinon.spy(baseControl, '_notify');

               baseControl._items.getCount = () => 1;
               baseControl._mouseDownItemKey = 1;

               assert.isUndefined(baseControl._listViewModel.getMarkedItem());
               baseControl._itemMouseUp(event, { key: 1 }, originalEvent);

               assert.isFalse(notifySpy.withArgs('markedKeyChanged', [1]).called);
               assert.isUndefined(baseControl._listViewModel.getMarkedItem());
            });

            it('should not mark single item if editing', async function() {
               baseControlOptions.markerVisibility = 'onactivated';
               baseControlOptions.editingConfig = {};
               await mountBaseControl(baseControl, baseControlOptions);

               const originalEvent = { target: {} };
               const event = {};

               baseControl._items.getCount = () => 1;
               baseControl._mouseDownItemKey = 1;

               assert.isUndefined(baseControl._listViewModel.getMarkedItem());
               baseControl._itemMouseUp(event, { key: 1 }, originalEvent);
               assert.isUndefined(baseControl._listViewModel.getMarkedItem());
            });

            it('should mark item if there are more then one item in list', async function () {
               baseControlOptions.markerVisibility = 'onactivated';
               await mountBaseControl(baseControl, baseControlOptions);

               const originalEvent = {target: {
                     closest: () => false
                  }
               };
               const event = {};
               baseControl._mouseDownItemKey = 1;

               baseControl._scrollController = {
                  scrollToItem(key) {
                     if (key === data[0].id) {
                        result = 'top';
                     } else if (key === data[data.length - 1].id) {
                        result = 'bottom';
                     }
                     return Promise.resolve();
                  },
                  setIndicesAfterCollectionChange: () => undefined,
                  handleResetItems: () => {}
               };

               const notifySpy = sinon.spy(baseControl, '_notify');

               // No editing
               assert.isUndefined(baseControl._listViewModel.getMarkedItem());
               await baseControl._itemMouseUp(event, {key: 1}, originalEvent);
               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(1).isMarked());
               assert.isTrue(notifySpy.withArgs('markedKeyChanged', [1]).calledOnce);

               // With editing
               baseControl._markerController.setMarkedKey(null);
               baseControlOptions.editingConfig = {};

               baseControl._mouseDownItemKey = 1;

               assert.isUndefined(baseControl._listViewModel.getMarkedItem());
               await baseControl._itemMouseUp(event, {key: 1}, originalEvent);

               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(1).isMarked());
               assert.isTrue(notifySpy.withArgs('markedKeyChanged', [1]).calledTwice);
            });
         });

         describe('_onItemClick', () => {
            it('click on checkbox should not notify itemClick, but other clicks should', function() {
               let isStopped = false;
               let isCheckbox = false;

               const e = {
                  isStopped: () => isStopped,
                  stopPropagation() { isStopped = true; },
                  isBubbling: () => false
               };

               const originalEvent = {
                  target: {
                     closest: () => isCheckbox
                  }
               };

               // click not on checkbox
               baseControl._onItemClick(e, {}, originalEvent);
               assert.isFalse(isStopped);

               // click on checkbox
               isCheckbox = true;
               baseControl._onItemClick(e, {}, originalEvent);
               assert.isTrue(isStopped);
            });

            it('in list wit EIP itemClick should fire after beforeBeginEdit', () => {
               let isItemClickStopped = false;
               let firedEvents = [];

               baseControl.saveOptions({
                  ...baseControlOptions,
                  editingConfig: {
                     ...baseControlOptions.editingConfig,
                     editOnClick: true
                  }
               });

               const e = {
                  isStopped: () => isItemClickStopped,
                  stopPropagation() {
                     isItemClickStopped = true;
                     // Событие стопается еще до начала редактирования и отстрела нужных событий
                     assert.deepEqual(firedEvents, []);
                  }
               };
               const item = baseControl.getViewModel().getItemBySourceKey(1).contents;
               const originalEvent = {
                  target: {
                     closest: () => null
                  },
                  type: 'click'
               };

               baseControl._notify = (eName, args, params) => {
                  if (eName !== 'itemClick' && eName !== 'beforeBeginEdit') {
                     return;
                  }
                  firedEvents.push(eName);
                  if (eName === 'itemClick') {
                     assert.isTrue(params.bubbling);
                     assert.equal(args[0], item);
                     assert.equal(args[1], originalEvent);
                     assert.isTrue(isItemClickStopped);
                     assert.deepEqual(['beforeBeginEdit', 'itemClick'], firedEvents);
                     done();
                  }
               };

               // click not on checkbox
               baseControl._onItemClick(e, item, originalEvent);
            });

            it('should not notify if was drag-n-drop', () => {
               baseControl._dndListController = {
                  isDragging: () => true
               };

               const originalEvent = {
                  target: {
                     closest: () => false
                  }
               };

               let isStopped = false;

               const e = {
                  isStopped: () => isStopped,
                  stopPropagation() { isStopped = true; }
               };

               baseControl._itemMouseUp(e, { key: 1 }, originalEvent);

               // click on checkbox
               baseControl._onItemClick(e, { key: 1 }, originalEvent);
               assert.isTrue(isStopped);
            });
         });
      });

      describe('_beforeMount()', () => {
         let stubCreate;
         beforeEach(() => {
            stubCreate = sinon.stub(lists.BaseControl._private, 'createScrollController');
         });
         afterEach(() => {
            stubCreate.restore();
         });
         it('should create scrollController without source', async (done) => {
            const cfg = {
               viewName: 'Controls/List/ListView',
               keyProperty: 'id',
               viewModelConstructor: lists.ListViewModel,
               items: new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: data
               })
            };
            const baseControl = correctCreateBaseControl(cfg);
            baseControl.saveOptions(cfg);
            stubCreate.callsFake(() => {
               done();
            });
            baseControl._beforeMount(cfg);
         });
      });
      describe('scrollToItem _afterMount', () => {
         let stubScrollToItem;
         beforeEach(() => {
            stubScrollToItem = sinon.stub(lists.BaseControl._private, 'scrollToItem');
         });
         afterEach(() => {
            stubScrollToItem.restore();
         });
         it('scroll to active element aftermount', async () => {
            const cfg = {
               viewName: 'Controls/List/ListView',
               keyProperty: 'id',
               viewModelConstructor: lists.ListViewModel,
               source: source,
               navigation: {
                  view: 'infinity',
                  source: 'page',
                  viewConfig: {
                     pagingMode: 'direct'
                  },
                  sourceConfig: {
                     pageSize: 3,
                     page: 0,
                     hasMore: false
                  }
               },
               virtualScrollConfig: {
                  pageSize: 100
               },
               activeElement: 4
            };
            let scrolledToItem = false;
            const baseControl = correctCreateBaseControl(cfg);
            baseControl._container = {};
            baseControl.saveOptions(cfg);
            stubScrollToItem.callsFake(() => {
               scrolledToItem = true;
            });
            await baseControl._beforeMount(cfg);
            baseControl._afterMount(cfg);
         });
      });

      describe('_afterMount registerIntersectionObserver', () => {
         const cfg = {
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: lists.ListViewModel,
            source: source,
            navigation: {
               view: 'infinity'
            },
            virtualScrollConfig: {
               pageSize: 100
            }
         };
         let baseControl;
         let registered;
         let registerIntersectionObserver = () => { registered = true; }
         beforeEach(() => {
            registered = false;
            baseControl = correctCreateBaseControl(cfg);
            baseControl._registerIntersectionObserver = registerIntersectionObserver;
         });
         afterEach(() => {
            baseControl = null;
         });
         it('without error', async () => {

            baseControl._container = {};
            baseControl.saveOptions(cfg);
            await baseControl._beforeMount(cfg);
            baseControl._afterMount(cfg);
            assert.isTrue(registered);
         });
         it('with error', async () => {

            baseControl._container = {};
            baseControl.saveOptions(cfg);
            await baseControl._beforeMount(cfg);
            baseControl.__error = {};
            baseControl._afterMount(cfg);
            assert.isFalse(registered);
         });
      });

      describe('drag-n-drop', () => {
         source = new sourceLib.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: 1,
                  title: 'Первый'
               },
               {
                  id: 2,
                  title: 'Второй'
               }
            ]
         });

         const
            cfg = getCorrectBaseControlConfig({
               viewName: 'Controls/List/ListView',
               source,
               keyProperty: 'id',
               viewModelConstructor: lists.ListViewModel,
               itemsDragNDrop: true,
               multiSelectVisibility: 'visible',
               selectedKeys: [1],
               excludedKeys: []
            });

         let baseControl, notifySpy;

         beforeEach( async () => {
            baseControl = new lists.BaseControl();
            baseControl.saveOptions(cfg);
            await baseControl._beforeMount(cfg);

            notifySpy = sinon.spy(baseControl, '_notify');
         });


         it('startDragNDrop', () => {
            baseControl._notify = (name, args) => {
               if (name === 'dragStart') {
                  return new dragNDrop.ItemsEntity({
                     items: args[0]
                  });
               }
            };

            const draggedItem = baseControl._listViewModel.getItemBySourceKey(1);
            const event = {
               nativeEvent: {
                  pageX: 500,
                  pageY: 500
               },
               target: {
                  closest: () => null
               }
            };

            const registerMouseMoveSpy = sinon.spy(baseControl, '_registerMouseMove');
            const registerMouseUpSpy = sinon.spy(baseControl, '_registerMouseUp');

            lists.BaseControl._private.startDragNDrop(baseControl, event, draggedItem);

            assert.equal(baseControl._draggedKey, 1);
            assert.isNotNull(baseControl._dragEntity);
            assert.isNotNull(baseControl._startEvent);
            assert.isTrue(registerMouseMoveSpy.called);
            assert.isTrue(registerMouseUpSpy.called);
         });

         describe('onMouseMove', () => {
            it('start drag', () => {
               const event = {
                  nativeEvent: {
                     buttons: {},
                     pageX: 501,
                     pageY: 501
                  },
                  target: {
                     closest: () => null
                  }
               };

               baseControl._startEvent = {
                  pageX: 500,
                  pageY: 500
               };

               baseControl._onMouseMove(event);

               assert.isFalse(notifySpy.withArgs('_documentDragStart').called);
               assert.isFalse(notifySpy.withArgs('dragMove').called);
               assert.isFalse(notifySpy.withArgs('_updateDraggingTemplate').called);
               assert.isFalse(notifySpy.withArgs('_documentDragEnd').called);

               event.nativeEvent.pageX = 505;
               event.nativeEvent.pageY = 505;

               baseControl._onMouseMove(event);

               assert.isTrue(notifySpy.withArgs('_documentDragStart').called);
               assert.isFalse(notifySpy.withArgs('dragMove').called);
               assert.isFalse(notifySpy.withArgs('_updateDraggingTemplate').called);
            });

            it('end drag', () => {
               const event = {
                  nativeEvent: {
                     pageX: 501,
                     pageY: 501
                  },
                  target: {
                     closest: () => null
                  }
               };

               baseControl._dndListController = {
                  isDragging: () => true
               };
               const unregisterMouseMoveSpy = sinon.spy(baseControl, '_unregisterMouseMove');
               const unregisterMouseUpSpy = sinon.spy(baseControl, '_unregisterMouseUp');

               baseControl._onMouseMove(event);

               assert.isFalse(notifySpy.withArgs('_documentDragStart').called);
               assert.isFalse(notifySpy.withArgs('dragMove').called);
               assert.isFalse(notifySpy.withArgs('_updateDraggingTemplate').called);
               assert.isTrue(notifySpy.withArgs('_documentDragEnd').called);
               assert.isTrue(unregisterMouseMoveSpy.called);
               assert.isTrue(unregisterMouseUpSpy.called);

               baseControl._documentDragging = false;
            });
         });

         it('skip drag start if no drag entity', () => {
            baseControl._documentDragStart({ entity: null }, 1);
            assert.isFalse(baseControl._documentDragging);
         });

         it('drag start', () => {
            baseControl._dragStart({ entity: new dragNDrop.ItemsEntity({items: [1]}) }, 1);
            assert.isNotNull(baseControl._dndListController);
            assert.isNotNull(baseControl._dndListController.getDragEntity());
         });

         it('_documentDragStart', () => {
            baseControl._insideDragging = true;

            baseControl.saveOptions({...cfg, itemsDragNDrop: false});
            baseControl._documentDragStart({ entity: new dragNDrop.ItemsEntity({items: [1]}) });
            assert.isNull(baseControl._dndListController);

            baseControl.saveOptions({...cfg, itemsDragNDrop: true});
            baseControl._documentDragStart({ entity: new dragNDrop.ItemsEntity({items: [1]}) });
            assert.isNotNull(baseControl._dndListController);
            assert.isNotNull(baseControl._dndListController.getDragEntity());
         });

         it('drag leave', () => {
            const newPos = {};
            baseControl._dndListController = {
               setDragPosition: () => undefined,
               calculateDragPosition: () => newPos,
               getDraggableItem: () => ({
                  getContents: () => ({
                     getKey: () => 1
                  })
               }),
               endDrag: () => undefined,
               isDragging: () => true
            };

            const setDragPositionSpy = sinon.spy(baseControl._dndListController, 'setDragPosition');
            baseControl._dragLeave();
            assert.isTrue(setDragPositionSpy.withArgs(newPos).called);

            baseControl._dndListController.getDraggableItem = () => ({
               getContents: () => ({
                  getKey: () => 5
               })
            });
            const endDragSpy = sinon.spy(baseControl._dndListController, 'endDrag');
            baseControl._dragLeave();
            assert.isTrue(endDragSpy.called);
         });

         it('drag enter', async () => {
            const secondBaseControl = new lists.BaseControl();
            secondBaseControl.saveOptions(cfg);
            await secondBaseControl._beforeMount(cfg);
            secondBaseControl._listViewModel.setItems(rs);
            secondBaseControl._documentDragging = true;

            secondBaseControl._notify = () => true;
            const dragEntity = new dragNDrop.ItemsEntity({ items: [1] });
            secondBaseControl._dragEnter({ entity: dragEntity });
            assert.isOk(secondBaseControl._dndListController);
            assert.equal(secondBaseControl._dndListController.getDragEntity(), dragEntity);
            assert.isNotOk(secondBaseControl._dndListController.getDraggableItem());

            secondBaseControl._dndListController = null;
            const newRecord = new entity.Model({ rawData: { id: 0 }, keyProperty: 'id' });
            secondBaseControl._notify = () => newRecord;
            secondBaseControl._dragEnter({ entity: dragEntity });
            assert.isOk(secondBaseControl._dndListController);
            assert.isOk(secondBaseControl._dndListController.getDragEntity());
            assert.isOk(secondBaseControl._dndListController.getDraggableItem());
            assert.isOk(secondBaseControl._dndListController.getDragPosition());
            assert.equal(secondBaseControl._dndListController.getDraggableItem().getContents(), newRecord);
         });

         it('drag end', () => {
            const dndController = {
               endDrag: () => undefined,
               getDragPosition: () => {
                  return {
                     dispItem: {
                        getContents: () => {}
                     }
                  };
               },
               getDraggableItem: () => undefined
            };
            baseControl._dndListController = dndController;

            const endDragSpy = sinon.spy(baseControl._dndListController, 'endDrag');

            baseControl._documentDragEnd({});
            assert.isFalse(endDragSpy.called);

            baseControl._documentDragEnd({ entity: {} });

            assert.isTrue(endDragSpy.called);
            assert.isFalse(notifySpy.withArgs('dragEnd').called);
            assert.isFalse(notifySpy.withArgs('markedKeyChanged', [1]).called);
            assert.isFalse(notifySpy.withArgs('selectedKeysChanged', [[], [1], []]).called);

            dndController.getDraggableItem = () => ({
               getContents: () => ({
                  getKey: () => 1
               })
            });

            baseControl._documentDragEnd({ entity: {} });
            assert.isTrue(endDragSpy.called);
            assert.isFalse(notifySpy.withArgs('dragEnd').called);
            assert.isFalse(notifySpy.withArgs('markedKeyChanged', [1]).called);

            baseControl._insideDragging = true;
            baseControl._dndListController = dndController;

            baseControl._documentDragEnd({ entity: {} });

            assert.isTrue(endDragSpy.called);
            assert.isTrue(notifySpy.withArgs('dragEnd').called);
            assert.isTrue(notifySpy.withArgs('markedKeyChanged', [1]).called);
            assert.isTrue(notifySpy.withArgs('selectedKeysChanged').called);

            notifySpy.resetHistory();
            baseControl._insideDragging = true;
            baseControl._documentDragEnd({ entity: {} });

            assert.isTrue(endDragSpy.called);
            assert.isFalse(notifySpy.withArgs('selectedKeysChanged').called);

            baseControl._insideDragging = undefined;
         });

         it('loadToDirection, drag all items', () => {
            const self = {
               _hasMoreData: () => true,
               _sourceController: {
                  hasMoreData: () => true,
                  isLoading: () => false
               },
               _loadedItems: new collection.RecordSet(),
               _options: {
                  navigation: {}
               }
            };
            let isLoadStarted = false;

            // navigation.view !== 'infinity'
            sandbox.replace(lists.BaseControl._private, 'needScrollCalculation', () => false);
            sandbox.replace(lists.BaseControl._private, 'setHasMoreData', () => null);
            sandbox.replace(lists.BaseControl._private, 'loadToDirection', () => {
               isLoadStarted = true;
            });

            self._dndListController = {isDragging: () => true};
            self._selectionController = {isAllSelected: () => true};

            lists.BaseControl._private.loadToDirectionIfNeed(self);
            assert.isFalse(isLoadStarted);
            sandbox.restore();
         });

         it('loadToDirection, is dragging', () => {
            baseControl._sourceController = {
               hasMoreData: () => true,
               isLoading: () => false
            };
            baseControl._loadedItems = new collection.RecordSet();
            let isLoadStarted = false;

            // navigation.view !== 'infinity'
            sandbox.replace(lists.BaseControl._private, 'needScrollCalculation', () => false);
            sandbox.replace(lists.BaseControl._private, 'setHasMoreData', () => null);
            sandbox.replace(lists.BaseControl._private, 'loadToDirection', () => {
               isLoadStarted = true;
            });

            baseControl._dndListController = {isDragging: () => true};

            lists.BaseControl._private.loadToDirectionIfNeed(baseControl);
            assert.isFalse(isLoadStarted);

            baseControl._dndListController = {
               endDrag: () => undefined,
               getDragPosition: () => {
                  return {
                     dispItem: {
                        getContents: () => {}
                     }
                  };
               },
               getDraggableItem: () => undefined
            };

            const spy = sinon.spy(baseControl, 'checkTriggerVisibilityAfterRedraw');
            baseControl._documentDragEnd({ entity: {} });
            assert.isTrue(spy.called);

            sandbox.restore();
         });

         it('mouseEnter', () => {
            baseControl._dragEntity = new dragNDrop.ItemsEntity({ items: [1] });
            baseControl._documentDragging = true;

            let isDragging = false;
            baseControl._dndListController = {
               isDragging: () => isDragging,
            };
            baseControl._mouseEnter(null);
            assert.isTrue(notifySpy.withArgs('dragEnter', [baseControl._dragEntity]).called);

            notifySpy.resetHistory();
            isDragging = true;
            baseControl._mouseEnter(null);
            assert.isFalse(notifySpy.withArgs('dragEnter').called);
         });

         it('move outside list while load draggable items', () => {
            const items = new collection.RecordSet({
               keyProperty: 'id',
               rawData: [{id: 1}, {id: 2}]
            });
            let cfg = {
               viewName: 'Controls/List/ListView',
               keyProperty: 'id',
               viewModelConstructor: 'Controls/display:Collection',
               useNewModel: true,
               items,
               draggingTemplate: {}
            };
            baseControl = correctCreateBaseControl(cfg);
            baseControl.saveOptions(cfg);
            baseControl._beforeMount(cfg, {}, {data: items});
            notifySpy = sinon.spy(baseControl, '_notify');

            baseControl._dndListController = {
               isDragging: () => true
            };
            baseControl._startEvent = {
               pageX: 500,
               pageY: 500
            };

            baseControl._documentDragging = false;
            const timeout = setTimeout(() => {
               baseControl._documentDragging = true;
            }, 2000);

            const event = {
               nativeEvent: {
                  buttons: {},
                  pageX: 501,
                  pageY: 501,
                  buttons: {}
               },
               target: {
                  closest: () => null
               }
            };

            baseControl._container = {
               contains: () => false
            };

            baseControl._onMouseMove(event);

            assert.isTrue(notifySpy.withArgs('_updateDraggingTemplate').called);
            assert.isTrue(baseControl.getViewModel().isDragOutsideList());
            return timeout;
         });
      });

      // region Move

      describe('MoveController', () => {
         const moveController = {
            move: () => Promise.resolve(),
            moveWithDialog: () => Promise.resolve(),
            updateOptions: () => {}
         };
         let spyMove;
         let spyMoveWithDialog;
         let cfg;
         let baseControl;

         beforeEach(() => {
            const items = new collection.RecordSet({
               keyProperty: 'id',
               rawData: data
            });
            const collectionItem = {
               getContents: () => items.at(2)
            };
            cfg = {
               viewName: 'Controls/List/ListView',
               keyProperty: 'id',
               viewModelConstructor: lists.ListViewModel,
               items,
               source
            };
            baseControl = correctCreateBaseControl(cfg);
            baseControl.saveOptions(cfg);
            baseControl._beforeMount(cfg);
            baseControl._moveController = moveController;
            baseControl._listViewModel._display = {
               getCollection: () => items,
               getItemBySourceItem: () => collectionItem,
               getKeyProperty: () => 3,
               getIndexByKey: () => 3,
               at: () => collectionItem,
               getCount: () => data.length,
               getCollapsedGroups: () => {},
               unsubscribe: () => {},
               destroy: () => {},
               setKeyProperty: () => {},
               getItemBySourceKey: () => collectionItem,
               isEditing: () => false
            };
            spyMove = sinon.spy(moveController, 'move');
            spyMoveWithDialog = sinon.spy(moveController, 'moveWithDialog');
         });

         afterEach(() => {
            spyMove.restore();
            spyMoveWithDialog.restore();
         });

         // moveItemUp вызывает moveController
         it('moveItemUp() should call moveController', () => {
            return baseControl.moveItemUp(2).then(() => {
               sinon.assert.called(spyMove);
            });
         });

         // moveItemDown вызывает moveController
         it('moveItemDown() should call moveController', () => {
            return baseControl.moveItemDown(2).then(() => {
               sinon.assert.called(spyMove);
            });
         });

         // moveItems вызывает moveController
         it('moveItems() should call moveController', () => {
            const selectionObject = {
               selected: [2],
               excluded: []
            };
            return baseControl.moveItems(selectionObject, 3, 'on').then(() => {
               sinon.assert.called(spyMove);
            });
         });

         // moveItemsWithDialog вызывает moveController
         it('moveItemsWithDialog() should call moveController', () => {
            const selectionObject = {
               selected: [2],
               excluded: []
            };
            return baseControl.moveItemsWithDialog(selectionObject, {anyFilter: 'anyVal'}).then(() => {
               sinon.assert.called(spyMoveWithDialog);
            });
         });

         // Работает даже после update
         it('should also work after update', () => {
            baseControl._beforeUpdate({
               ...cfg,
               moveDialogTemplate: {
                  templateName: 'fakeTemplate',
                  templateOptions: {
                     containerWidth: 500
                  }
               }
            });
            const stubUpdateOptions = sinon.stub(moveController, 'updateOptions').callsFake((options) => {
               assert(options.popupOptions.template, 'fakeTemplate');
               assert(options.popupOptions.templateOptions.containerWidth, 500);
            });
            stubUpdateOptions.restore();
         });
      });

      // endregion Move

      // region Marker

      describe('marker', () => {
         const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
         const source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });
         const cfg = getCorrectBaseControlConfig({
            viewName: 'Controls/List/ListView',
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            keyProperty: 'id',
            markerVisibility: 'visible',
            source: source
         });
         let baseControl;

         beforeEach(async () => {
            baseControl = await correctCreateBaseControlAsync(cfg);
            baseControl.saveOptions(cfg);
            baseControl._environment = {};
            baseControl._notify = (eventName, params) => {
               if (eventName === 'beforeMarkedKeyChanged') {
                  return params[0];
               }
            };
            await baseControl._beforeMount(cfg);
         });

         describe('mount', () => {
            let newBaseControl;
            it('beforeMount', () => {
               const newCfg = getCorrectBaseControlConfig({ ...cfg });
               newBaseControl = new lists.BaseControl();
               newBaseControl.saveOptions(newCfg);
               newBaseControl._beforeMount(newCfg);
               const viewModel = newBaseControl.getViewModel();
               assert.isTrue(viewModel.getItemBySourceKey(1).isMarked());
            });

            it('afterMount', () => {
               const notifySpy = sinon.spy(newBaseControl, '_notify');
               newBaseControl._afterMount();
               assert.isTrue(notifySpy.withArgs('beforeMarkedKeyChanged', [1]).called);
               assert.isTrue(notifySpy.withArgs('markedKeyChanged', [1]).called);
            });
         });

         describe('_changeMarkedKey', () => {
            it('notify return promise', () => {
               baseControl._notify = (eventName, params) => {
                  assert.deepEqual(params, [3]);
                  return Promise.resolve(3);
               };

               return baseControl._changeMarkedKey(3).then((newMarkedKey) => {
                  assert.equal(newMarkedKey, 3);
                  assert.isTrue(baseControl.getViewModel().getItemBySourceKey(3).isMarked());
               });
            });

            it('notify return new key', () => {
               baseControl._notify = (eventName, params) => {
                  if (eventName === 'beforeMarkedKeyChanged') {
                     assert.deepEqual(params, [3]);
                  } else {
                     assert.deepEqual(params, [2]);
                  }
                  return 2;
               };

               baseControl._changeMarkedKey(3);
               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(3).isMarked());
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
            });

            it('notify nothing return', () => {
               baseControl._notify = (eventName, params) => {
                  assert.deepEqual(params, [3]);
               };

               baseControl._changeMarkedKey(3);
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(3).isMarked());
            });

            it('pass undefined', () => {
               let notifyCalled = false;
               baseControl._notify = () => {
                  notifyCalled = true;
               };
               baseControl._changeMarkedKey(undefined);
               assert.isFalse(notifyCalled);
            });

            it('pass current markedKey', () => {
               baseControl.setMarkedKey(1);
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(1).isMarked());

               let notifyCalled = false;
               baseControl._notify = () => {
                  notifyCalled = true;
               };
               baseControl._changeMarkedKey(1);
               assert.isFalse(notifyCalled);
            });
         });

         describe('move marker', () => {
            let activateCalled = false;
            let preventDefaultCalled = false;
            const event = {
               preventDefault: () => preventDefaultCalled = true
            };

            beforeEach(() => {
               baseControl._mounted = true;
               baseControl._getItemsContainer = () => ({
                  children: []
               });
               baseControl.activate = () => activateCalled = true;
               return baseControl.setMarkedKey(2);
            });

            afterEach(() => {
               activateCalled = false;
               preventDefaultCalled = false;
            });

            it('to next', () => {
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
               assert.equal(baseControl.getViewModel().getItemBySourceKey(2).getVersion(), 1);

               lists.BaseControl._private.moveMarkerToNext(baseControl, event)
               assert.isTrue(preventDefaultCalled);
               assert.isTrue(activateCalled);
               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
               assert.equal(baseControl.getViewModel().getItemBySourceKey(2).getVersion(), 2);
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(3).isMarked());
               assert.equal(baseControl.getViewModel().getItemBySourceKey(3).getVersion(), 1);
            });

            it('to prev', function() {
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
               assert.equal(baseControl.getViewModel().getItemBySourceKey(2).getVersion(), 1);

               lists.BaseControl._private.moveMarkerToPrevious(baseControl, event)
               assert.isTrue(preventDefaultCalled);
               assert.isTrue(activateCalled);
               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
               assert.equal(baseControl.getViewModel().getItemBySourceKey(2).getVersion(), 2);
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(1).isMarked());
               assert.equal(baseControl.getViewModel().getItemBySourceKey(1).getVersion(), 3);
            });
         });

         describe('onCollectionChanged', () => {
            beforeEach(() => {
               baseControl.setMarkedKey(1)
               let item = baseControl.getViewModel().getItemBySourceKey(1);
               assert.isTrue(item.isMarked());
            });

            it('reset marker for removed items', () => {
               const item = baseControl.getViewModel().getItemBySourceKey(1);

               lists.BaseControl._private.onCollectionChanged(baseControl, {}, 'collectionChanged', 'rm', [], null, [item], 0);
               assert.isFalse(item.isMarked());
            });

            it('restore marker on add', () => {
               const item = baseControl.getViewModel().getItemBySourceKey(1);

               lists.BaseControl._private.onCollectionChanged(baseControl, {}, 'collectionChanged', 'rm', [], null, [item], 0);
               assert.isFalse(item.isMarked());

               lists.BaseControl._private.onCollectionChanged(baseControl, {}, 'collectionChanged', 'a', [baseControl.getViewModel().getItemBySourceKey(2)], null, [item], 0);
               assert.isFalse(item.isMarked());

               lists.BaseControl._private.onCollectionChanged(baseControl, {}, 'collectionChanged', 'a', [item], null, [], 0);
               assert.isTrue(item.isMarked());
            });

            it('restore marker for replaced item', () => {
               let item = baseControl.getViewModel().getItemBySourceKey(1);
               item.setMarked(false);

               lists.BaseControl._private.onCollectionChanged(baseControl, {}, 'collectionChanged', 'rp', [item], 0);
               item = baseControl.getViewModel().getItemBySourceKey(1);
               assert.isTrue(item.isMarked());
            });

            it('restore marker on reset', () => {
               baseControl.getViewModel().setItems(new collection.RecordSet({
                  rawData: [
                     {id: 1},
                     {id: 2},
                     {id: 3}
                  ],
                  keyProperty: 'id'
               }));

               lists.BaseControl._private.onCollectionChanged(baseControl, {}, 'collectionChanged', 'rs');
               const item = baseControl.getViewModel().getItemBySourceKey(1);
               assert.isTrue(item.isMarked());
            });

            it('reset after update with new markedKey', () => {
               const newCfg = getCorrectBaseControlConfig({
                  ...cfg,
                  markedKey: 2,
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: data
                  })
               });
               baseControl._beforeUpdate(newCfg);
               baseControl.saveOptions(newCfg);
               baseControl.getViewModel().setItems(new collection.RecordSet({
                  rawData: [
                     {id: 1},
                     {id: 2},
                     {id: 3}
                  ],
                  keyProperty: 'id'
               }));

               lists.BaseControl._private.onCollectionChanged(baseControl, {}, 'collectionChanged', 'rs');
               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(1).isMarked());
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(3).isMarked());
            });

            it('reset and not exist controller', () => {
               baseControl._markerController = null;
               baseControl.getViewModel().setItems(new collection.RecordSet({
                  rawData: [
                     {id: 1},
                     {id: 2},
                     {id: 3}
                  ],
                  keyProperty: 'id'
               }));

               lists.BaseControl._private.onCollectionChanged(baseControl, {}, 'collectionChanged', 'rs');
               const item = baseControl.getViewModel().getItemBySourceKey(1);
               assert.isTrue(item.isMarked());
            });
         });

         describe('_beforeUpdate', () => {
            it('updateOptions', () => {
               const newCfg = {
                  ...cfg,
                  markerVisibility: 'onactivated'
               };
               baseControl._beforeUpdate(newCfg);

               assert.equal(baseControl._markerController._markerVisibility, 'onactivated');
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(1).isMarked());
               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
            });

            it('updateOptions with new model', () => {
               const searchViewModel = new treeGrid.SearchGridViewModel({
                  items: new collection.RecordSet({
                     rawData: [{
                        id: 1,
                        type: true,
                        parent: null
                     }, {
                        id: 2,
                        type: null,
                        parent: 1
                     }],
                     keyProperty: 'id'
                  }),
                  parentProperty: 'parent',
                  nodeProperty: 'type',
                  keyProperty: 'id'
               });

               const notifySpy = sinon.spy(baseControl, '_notify');

               baseControl.setMarkedKey(3);
               baseControl._listViewModel = searchViewModel;
               baseControl._modelRecreated = true;
               baseControl._beforeUpdate(cfg);


               assert.isTrue(notifySpy.withArgs('beforeMarkedKeyChanged', [2]).called);
               assert.isTrue(notifySpy.withArgs('markedKeyChanged', [2]).called);

               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(1).isMarked());
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
            });

            it('setMarkedKey', () => {
               const newCfg = {
                  ...cfg,
                  markedKey: 2
               };
               baseControl._beforeUpdate(newCfg);

               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(1).isMarked());
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
            });

            it('change markerVisibility on visible', () => {
               let newCfg = getCorrectBaseControlConfig({
                  ...cfg,
                  markerVisibility: 'onactivated'
               });
               baseControl.saveOptions(newCfg);

               baseControl.getViewModel().setItems(new collection.RecordSet({
                  rawData: [
                     {id: 2},
                     {id: 3}
                  ],
                  keyProperty: 'id'
               }));

               newCfg = {
                  ...cfg,
                  markerVisibility: 'visible'
               };
               baseControl._beforeUpdate(newCfg);

               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(3).isMarked());
            });

            it('hide marker and show it with marked key in options', () => {
               let newCfg = getCorrectBaseControlConfig({
                  ...cfg,
                  markerVisibility: 'hidden',
                  markedKey: 2
               });
               baseControl.saveOptions(newCfg);

               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(2).isMarked());

               newCfg = {
                  ...cfg,
                  markerVisibility: 'visible',
                  markedKey: 2
               };
               baseControl._beforeUpdate(newCfg);

               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
            });

            it('updateOptions with new model', () => {
               const searchViewModel = new treeGrid.SearchGridViewModel({
                  items: new collection.RecordSet({
                     rawData: [{
                        id: 1,
                        type: true,
                        parent: null
                     }, {
                        id: 2,
                        type: null,
                        parent: 1
                     }],
                     keyProperty: 'id'
                  }),
                  parentProperty: 'parent',
                  nodeProperty: 'type',
                  keyProperty: 'id'
               });

               const notifySpy = sinon.spy(baseControl, '_notify');

               baseControl.setMarkedKey(3);
               baseControl._listViewModel = searchViewModel;
               baseControl._modelRecreated = true;
               baseControl._beforeUpdate(cfg);


               assert.isTrue(notifySpy.withArgs('beforeMarkedKeyChanged', [2]).called);
               assert.isTrue(notifySpy.withArgs('markedKeyChanged', [2]).called);

               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(1).isMarked());
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
            });

            it('not set new marked key, when load items', () => {
               const sourceController = {
                  isLoading: () => true,
                  getState: () => {
                     return {
                        source: {}
                     };
                  },
                  getItems: () => new collection.RecordSet({
                     rawData: data,
                     keyProperty: 'id'
                  }),
                  setDataLoadCallback: () => null
               };
               const newCfg = {
                  ...cfg,
                  markedKey: 2,
                  sourceController,
                  loading: true
               };
               baseControl._beforeUpdate(newCfg);

               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(1).isMarked());
               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
            });
         });
      });

      // endregion

      // region Multiselection

      describe('multiselection', () => {
         const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
         const source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });
         const cfg = getCorrectBaseControlConfig({
            viewModelConstructor: lists.ListViewModel,
            keyProperty: 'id',
            multiSelectVisibility: 'visible',
            selectedKeys: [],
            excludedKeys: [],
            selectedKeysCount: 0,
            source
         });
         let baseControl, viewModel;

         beforeEach(() => {
            baseControl = new lists.BaseControl();
            baseControl.saveOptions(cfg);
            baseControl._getItemsContainer = () => ({
               children: []
            });
            return (baseControl._beforeMount(cfg) || Promise.resolve()).then(() => viewModel = baseControl.getViewModel());
         });

         describe('mount', () => {
            let newBaseControl;
            it('beforeMount', () => {
               const newCfg = getCorrectBaseControlConfig({ ...cfg, selectedKeys: [1] });
               newBaseControl = new lists.BaseControl();
               newBaseControl.saveOptions(newCfg);
               newBaseControl._beforeMount(newCfg);
               const viewModel = newBaseControl.getViewModel();
               assert.isTrue(viewModel.getItemBySourceKey(1).isSelected());
               assert.isFalse(viewModel.getItemBySourceKey(2).isSelected());
               assert.isFalse(viewModel.getItemBySourceKey(2).isSelected());
            });

            it('afterMount', () => {
               const notifySpy = sinon.spy(newBaseControl, '_notify');
               newBaseControl._afterMount();
               assert.isTrue(notifySpy.withArgs('listSelectedKeysCountChanged', [1, false]).called);
               assert.isTrue(notifySpy.withArgs('listSelectionTypeForAllSelectedChanged', ['all']).called);
            });

            it('beforeMount not load items', () => {
               let newCfg = getCorrectBaseControlConfig({ ...cfg, selectedKeys: [1], source: undefined });
               delete newCfg.sourceController;
               newBaseControl = new lists.BaseControl();
               newBaseControl.saveOptions(newCfg);
               newBaseControl._beforeMount(newCfg);
               assert.isNotOk(newBaseControl._selectionController);
            });
         });

         describe('_beforeUpdate', () => {
            it('clear by selection view mode', () => {
               const newCfg = { ...cfg, selectedKeys: [null] };
               baseControl.saveOptions(newCfg);
               baseControl._beforeMount(newCfg);
               const notifySpy = sinon.spy(baseControl, '_notify');
               baseControl._beforeUpdate({ ...newCfg, selectionViewMode: '', filter: {} });
               assert.isTrue(notifySpy.withArgs('selectedKeysChanged', [[], [], [null]]).called);
            });

            it('change selection', () => {
               const newCfg = { ...cfg, selectedKeys: [1] };
               baseControl.saveOptions(newCfg);
               baseControl._beforeMount(newCfg);
               const notifySpy = sinon.spy(baseControl, '_notify');
               baseControl._beforeUpdate({ ...newCfg, selectedKeys: [1, 2] });
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(1).isSelected());
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(2).isSelected());
               assert.isFalse(notifySpy.withArgs('selectedKeysChanged').called);
            });

            it('change visible on hidden and change selected keys on empty array', () => {
               const newCfg = { ...cfg, selectedKeys: [1] };
               baseControl.saveOptions(newCfg);
               baseControl._beforeMount(newCfg);
               assert.isTrue(baseControl.getViewModel().getItemBySourceKey(1).isSelected());
               baseControl._beforeUpdate({ ...newCfg, selectedKeys: [], multiSelectVisibility: 'hidden' });
               assert.isFalse(baseControl.getViewModel().getItemBySourceKey(1).isSelected());
            });

            it('destroy controller', () => {
               const newCfg = { ...cfg, selectedKeys: [1] };
               baseControl.saveOptions(newCfg);
               baseControl._beforeMount(newCfg);
               assert.isOk(baseControl._selectionController);
               baseControl._beforeUpdate({ ...newCfg, multiSelectVisibility: 'hidden' });
               assert.isNotOk(baseControl._selectionController);
            });

            it('empty items', () => {
               const source = new sourceLib.Memory({
                  keyProperty: 'id',
                  data: []
               });
               const newCfg = getCorrectBaseControlConfig({ ...cfg, source, selectedKeys: [] });
               baseControl.saveOptions(newCfg);
               baseControl._beforeMount(newCfg);
               assert.isNotOk(baseControl._selectionController);
               baseControl._beforeUpdate({ ...newCfg, selectedKeys: [1] });
               assert.isOk(baseControl._selectionController);
            });

            it('change root', () => {
               const spyNotify = sinon.spy(baseControl, '_notify');
               const newCfg = { ...cfg, selectedKeys: [null], excludedKeys: [null], root: null };
               baseControl.saveOptions(newCfg);
               baseControl._beforeMount(newCfg);
               assert.isOk(baseControl._selectionController);
               baseControl._beforeUpdate({ ...newCfg, root: 2 });
               assert.isTrue(spyNotify.withArgs('selectedKeysChanged', [[], [], [null]]).called);
               assert.isTrue(spyNotify.withArgs('excludedKeysChanged', [[], [], [null]]).called);
            });
         });

         describe('_onCheckboxClick', () => {
            it('select', () => {
               const notifySpy = sinon.spy(baseControl, '_notify');

               baseControl._onCheckBoxClick({}, baseControl._listViewModel.getItemBySourceKey(1) );
               assert.isTrue(notifySpy.withArgs('selectedKeysChanged', [[1], [1], []]).calledOnce);
               assert.isFalse(notifySpy.withArgs('excludedKeysChanged').calledOnce);
            });

            it('from notify return another key', () => {
               const oldNotify = baseControl._notify;
               baseControl._notify = (eventName) => {
                  if (eventName === 'beforeSelectionChanged') {
                     return {
                        selected: [2],
                        excluded: []
                     };
                  }
               };

               const notifySpy = sinon.spy(baseControl, '_notify');
               baseControl._onCheckBoxClick({}, baseControl._listViewModel.getItemBySourceKey(1) );
               assert.isTrue(notifySpy.withArgs('selectedKeysChanged', [[2], [2], []]).calledOnce);
               assert.isFalse(notifySpy.withArgs('excludedKeysChanged').calledOnce);

               baseControl._notify = oldNotify;
            });

            it('readonly checkbox', () => {
               const notifySpy = sinon.spy(baseControl, '_notify');
               baseControl._onCheckBoxClick({}, baseControl._listViewModel.getItemBySourceKey(1), true );
               assert.isFalse(notifySpy.withArgs('selectedKeysChanged').calledOnce);
               assert.isFalse(notifySpy.withArgs('excludedKeysChanged').calledOnce);
            });

            it('shift pressed', () => {
               const notifySpy = sinon.spy(baseControl, '_notify');
               const event = {
                  nativeEvent: {
                     shiftKey: true
                  }
               };
               baseControl._onCheckBoxClick(event, baseControl._listViewModel.getItemBySourceKey(1));
               assert.isTrue(notifySpy.withArgs('selectedKeysChanged', [[1], [1], []]).calledOnce);
               assert.isFalse(notifySpy.withArgs('excludedKeysChanged').calledOnce);
            });
         });

         it('spaceHandler', () => {
            const notifySpy = sinon.spy(baseControl, '_notify');
            lists.BaseControl._private.spaceHandler(baseControl, { preventDefault: () => null })
            assert.isTrue(notifySpy.withArgs('selectedKeysChanged', [[1], [1], []]).calledOnce);
            assert.isFalse(notifySpy.withArgs('excludedKeysChanged').calledOnce);

            notifySpy.resetHistory();
            lists.BaseControl._private.spaceHandler(baseControl, { preventDefault: () => null })
            assert.isFalse(notifySpy.withArgs('selectedKeysChanged').called);
            assert.isFalse(notifySpy.withArgs('excludedKeysChanged').called);

            baseControl._beforeUpdate(cfg);
            notifySpy.resetHistory();
            lists.BaseControl._private.spaceHandler(baseControl, { preventDefault: () => null })
            assert.isTrue(notifySpy.withArgs('selectedKeysChanged').called);
            assert.isFalse(notifySpy.withArgs('excludedKeysChanged').called);
         });

         it('spaceHandler and multiselection hidden', () => {
            const baseControlConfig = { ...cfg, multiSelectVisibility: 'hidden' };
            const baseControl = correctCreateBaseControl(baseControlConfig);
            baseControl.saveOptions(baseControlConfig);
            baseControl._beforeMount(baseControlConfig);
            const result = lists.BaseControl._private.spaceHandler(baseControl, { preventDefault: () => null });
            assert.isUndefined(result);
         });

         it('_onItemSwipe', () => {
            const swipeEvent = {
               stopPropagation: () => null,
               target: {
                  closest: () => ({ classList: { contains: () => true }, clientHeight: 10 })
               },
               nativeEvent: {
                  direction: 'right'
               }
            };

            const swipedItem = viewModel.getItemBySourceKey(1);

            const notifySpy = sinon.spy(baseControl, '_notify');

            baseControl.saveOptions({ ...cfg, multiSelectVisibility: 'hidden' });

            baseControl._onItemSwipe({}, swipedItem, swipeEvent);
            assert.isTrue(notifySpy.withArgs('selectedKeysChanged', [[1], [1], []]).calledOnce);
            assert.isFalse(notifySpy.withArgs('excludedKeysChanged').calledOnce);
            assert.isTrue(viewModel.getItemBySourceKey(1).isAnimatedForSelection());
         });

         describe('onSelectedTypeChanged', () => {
            it('selectAll', () => {
               const notifySpy = sinon.spy(baseControl, '_notify');
               lists.BaseControl._private.onSelectedTypeChanged.apply(baseControl, ['selectAll']);
               assert.isTrue(notifySpy.withArgs('selectedKeysChanged', [[null], [null], []]).calledOnce);
               assert.isFalse(notifySpy.withArgs('excludedKeysChanged').calledOnce);
            });

            it('selectAll with limit', () => {
               const notifySpy = sinon.spy(baseControl, '_notify');
               lists.BaseControl._private.onSelectedTypeChanged.apply(baseControl, ['selectAll', 2]);
               assert.isTrue(notifySpy.withArgs('selectedKeysChanged', [[null], [null], []]).calledOnce);
               assert.isFalse(notifySpy.withArgs('excludedKeysChanged').calledOnce);
            });

            it('unselectAll', () => {
               const newCfg = { ...cfg, selectedKeys: [null] };
               baseControl.saveOptions(newCfg);
               baseControl._beforeMount(newCfg);
               const notifySpy = sinon.spy(baseControl, '_notify');
               lists.BaseControl._private.onSelectedTypeChanged.apply(baseControl, ['unselectAll']);
               assert.isTrue(notifySpy.withArgs('selectedKeysChanged', [[], [], [null]]).called);
            });

            it('toggleAll', () => {
               const notifySpy = sinon.spy(baseControl, '_notify');
               lists.BaseControl._private.onSelectedTypeChanged.apply(baseControl, ['toggleAll']);
               assert.isTrue(notifySpy.withArgs('selectedKeysChanged', [[null], [null], []]).calledOnce);
               assert.isFalse(notifySpy.withArgs('excludedKeysChanged').calledOnce);
            });

            it('destroyed BaseControl', () => {
               const notifySpy = sinon.spy(baseControl, '_notify');
               baseControl._destroyed = true;
               lists.BaseControl._private.onSelectedTypeChanged.apply(baseControl, ['toggleAll']);
               assert.isFalse(notifySpy.withArgs('selectedKeysChanged').called);
               assert.isFalse(notifySpy.withArgs('excludedKeysChanged').called);
               baseControl._destroyed = false;
            });
         });

         describe('onCollectionChanged', () => {
            beforeEach(() => {
               const baseControlConfig = { ...cfg, selectedKeys: [1] };
               baseControl = correctCreateBaseControl(baseControlConfig);
               return (baseControl._beforeMount(baseControlConfig) || Promise.resolve()).then(() => viewModel = baseControl.getViewModel());
            });

            it('add', () => {
               const notifySpy = sinon.spy(baseControl, '_notify');
               const addedItem = viewModel.getItemBySourceKey(1);
               addedItem.setSelected(false);
               lists.BaseControl._private.onCollectionChanged(baseControl, {}, 'collectionChanged', 'a', [addedItem]);
               assert.isTrue(addedItem.isSelected());
               assert.isTrue(notifySpy.withArgs('listSelectedKeysCountChanged', [1, false]).called);
            });

            it('remove', () => {
               const notifySpy = sinon.spy(baseControl, '_notify');
               const item = viewModel.getItemBySourceKey(1);
               viewModel.getCollection().remove(item.getContents());
               lists.BaseControl._private.onCollectionChanged(baseControl, {}, 'collectionChanged', 'rm', [], undefined, [item], 0);
               lists.BaseControl._private.onAfterCollectionChanged(baseControl);
               assert.isTrue(notifySpy.withArgs('selectedKeysChanged', [[], [], [1]]).called);
            });
         });
      });

      // endregion

      it('change RecordSet with eventRaising=false', () => {
         const recordSet = new collection.RecordSet({
            keyProperty: 'id',
            rawData: [{ id: 1 }, { id: 2 }, { id: 3 }]
         });
         const cfg = {
            viewName: 'Controls/List/ListView',
            viewModelConstructor: lists.ListViewModel,
            keyProperty: 'id',
            markerVisibility: 'visible',
            items: recordSet
         };

         const baseControl = new lists.BaseControl();
         baseControl.saveOptions(cfg);
         baseControl._beforeMount(cfg, null);
         const newRecord = new entity.Model({ rawData: { id: 0 }, keyProperty: 'id' });

         recordSet.setEventRaising(false, true);
         recordSet.move(0, 1);
         recordSet.add(newRecord, 0);
         recordSet.move(0, 1);
         recordSet.setEventRaising(true, true);

         assert.isFalse(baseControl.getViewModel().getItemBySourceKey(0).isMarked());
         assert.isTrue(baseControl.getViewModel().getItemBySourceKey(1).isMarked());
         assert.isFalse(baseControl.getViewModel().getItemBySourceKey(2).isMarked());
         assert.isFalse(baseControl.getViewModel().getItemBySourceKey(3).isMarked());
      });

      describe('propStorageId', function() {
         let origSaveConfig = SettingsController.saveConfig;
         afterEach(() => {
            SettingsController.saveConfig = origSaveConfig;
         });
         it('saving sorting', async () => {
            let saveConfigCalled = false;
            SettingsController.saveConfig = function() {
               saveConfigCalled = true;
            };
            const cfg = {
               viewName: 'Controls/List/ListView',
               viewModelConfig: {
                  items: [],
                  keyProperty: 'id'
               },
               viewModelConstructor: lists.ListViewModel,
               keyProperty: 'id',
               source: source,
               sorting: [1],
               sourceController: new dataSource.NewSourceController({
                  source
               })
            };

            const baseControl = correctCreateBaseControl(cfg);
            baseControl.saveOptions(cfg);
            await baseControl._beforeMount(cfg);

            baseControl._beforeUpdate(cfg);
            assert.isFalse(saveConfigCalled);
            baseControl.saveOptions(cfg);
            baseControl._beforeUpdate({...cfg, sorting: [3]});
            assert.isFalse(saveConfigCalled);
            baseControl.saveOptions({...cfg, sorting: [3]});
            baseControl._beforeUpdate({...cfg, propStorageId: '1'});
            assert.isTrue(saveConfigCalled);
         });
      });
   });
});
