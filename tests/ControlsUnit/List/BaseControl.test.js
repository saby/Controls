/**
 * Created by kraynovdo on 23.10.2017.
 */
define([
   'Types/source',
   'Types/collection',
   'Controls/list',
   'Controls/treeGrid',
   'Controls/grid',
   'Controls/Utils/Toolbar',
   'Core/Deferred',
   'Core/core-instance',
   'Env/Env',
   'Core/core-clone',
   'Types/entity',
   'Controls/popup',
   'Core/polyfill/PromiseAPIDeferred'
], function(sourceLib, collection, lists, treeGrid, grid, tUtil, cDeferred, cInstance, Env, clone, entity, popup) {
   describe('Controls.List.BaseControl', function() {
      var data, result, source, rs, sandbox;
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
      });
      afterEach(function() {
         sandbox.restore();
      });
      it('remove incorrect config', async function() {
         var cfg = {
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: lists.ListViewModel,
            items: new collection.RecordSet({
               keyProperty: 'id',
               rawData: data
            })
         };
         var baseControl = new lists.BaseControl(cfg);
         baseControl.saveOptions(cfg);
         await baseControl._beforeMount(cfg);
         assert.equal(baseControl._listViewModel.getItems(), null);
      });
      it('life cycle', function(done) {
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
         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         var mountResult = ctrl._beforeMount(cfg);
         assert.isTrue(!!mountResult.addCallback, '_beforeMount doesn\'t return deferred');

         assert.isTrue(!!ctrl._sourceController, '_dataSourceController wasn\'t created before mounting');
         assert.deepEqual(filter, ctrl._options.filter, 'incorrect filter before mounting');

         // received state 3'rd argument
         mountResult = ctrl._beforeMount(cfg, {}, rs);
         assert.isTrue(!!mountResult.addCallback, '_beforeMount doesn\'t return deferred');

         assert.isTrue(!!ctrl._sourceController, '_dataSourceController wasn\'t created before mounting');
         assert.deepEqual(filter, ctrl._options.filter, 'incorrect filter before mounting');

         // создаем новый сорс
         var oldSourceCtrl = ctrl._sourceController;

         source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });

         var filter2 = { 3: 3 };
         cfg = {
            viewName: 'Controls/List/ListView',
            source: source,
            dataLoadCallback: function() {
               dataLoadFired = true;
            },
            viewModelConstructor: treeGrid.TreeViewModel,
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            filter: filter2
         };

         // сорс грузит асинхронно
         setTimeout(function() {
            assert.equal(ctrl._items, ctrl.getViewModel().getItems());
            const prevModel = ctrl._listViewModel;
            ctrl._beforeUpdate(cfg);

            // check saving loaded items after new viewModelConstructor
            // https://online.sbis.ru/opendoc.html?guid=72ff25df-ff7a-4f3d-8ce6-f19a666cbe98
            assert.equal(ctrl._items, ctrl.getViewModel()
               .getItems());
            assert.isTrue(ctrl._sourceController !== oldSourceCtrl, '_dataSourceController wasn\'t changed before updating');
            assert.deepEqual(filter, ctrl._options.filter, 'incorrect filter before updating');
            ctrl.saveOptions(cfg);
            assert.deepEqual(filter2, ctrl._options.filter, 'incorrect filter after updating');
            assert.equal(ctrl._viewModelConstructor, treeGrid.TreeViewModel);
            assert.equal(prevModel._display, null);
            assert.isTrue(
               cInstance.instanceOfModule(ctrl._listViewModel, 'Controls/treeGrid:TreeViewModel') ||
               cInstance.instanceOfModule(ctrl._listViewModel, 'Controls/_treeGrid/Tree/TreeViewModel')
            );
            setTimeout(function() {
               ctrl._afterUpdate({});
               assert.isTrue(dataLoadFired, 'dataLoadCallback is not fired');
               ctrl._children.listView = {
                  getItemsContainer: function() {
                     return {
                        children: []
                     };
                  }
               };
               ctrl._beforeUnmount();
               done();
            }, 100);
         }, 1);
      });

      it('beforeMount: right indexes with virtual scroll and receivedState', function() {
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
               view: 'infinity'
            },
            virtualScrollConfig: {
               pageSize: 100
            },
            viewModelConstructor: lists.ListViewModel,
            source: source
         };
         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         return new Promise(function(resolve, reject) {
            ctrl._beforeMount(cfg, null, [{
               id: 1,
               title: 'qwe'
            }]);
            setTimeout(function() {
               assert.equal(ctrl.getViewModel()
                  .getStartIndex(), 0);
               assert.equal(ctrl.getViewModel()
                  .getStopIndex(), 6);
               resolve();
            }, 10);
         });
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
               _sourceController: {
                  hasMoreData: () => true,
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
         var cfg = {
            viewName: 'Controls/Grid/GridView',
            source: new sourceLib.Memory({
               idProperty: 'id',
               data: gridData,
            }),
            displayProperty: 'title',
            columns: gridColumns,
            resultsPosition: 'top',
            keyProperty: 'id',
            navigation: {
               view: 'infinity'
            },
            virtualScrollConfig: {
               pageSize: 100
            },
            viewModelConstructor: grid.GridViewModel,
         };
         var ctrl = new lists.BaseControl(cfg);
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

            var ctrl = new lists.BaseControl(cfg);


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
         });
      });

      it('check dataLoadCallback and afterReloadCallback calling order', async function() {
         var
            dataLoadCallbackCalled = false,
            afterReloadCallbackCalled = false,
            cfg = {
               viewName: 'Controls/List/ListView',
               source: new sourceLib.Memory({}),
               viewModelConstructor: lists.ListViewModel,
               dataLoadCallback: function() {
                  dataLoadCallbackCalled = true;
               },
               afterReloadCallback: function() {
                  afterReloadCallbackCalled = true;
                  assert.isFalse(dataLoadCallbackCalled, 'dataLoadCallback is called before afterReloadCallback.');
               }
            },
            ctrl = new lists.BaseControl(cfg);

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
         ctrl._sourceController.load = function() {
            return cDeferred.fail();
         };

         afterReloadCallbackCalled = false;
         dataLoadCallbackCalled = false;

         await ctrl.reload();

         assert.isTrue(afterReloadCallbackCalled, 'afterReloadCallbackCalled is not called.');
         assert.isFalse(dataLoadCallbackCalled, 'dataLoadCallback is called.');
      });

      it('save loaded items into the controls\' state', async function () {
         var
             cfg = {
                viewName: 'Controls/List/ListView',
                source: new sourceLib.Memory({}),
                viewModelConstructor: lists.ListViewModel,
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
             ctrl = new lists.BaseControl(cfg);

         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);

         // Empty list
         assert.isUndefined(ctrl._loadedItems);

         ctrl._sourceController.load = () => ({
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
            viewModelConstructor: lists.ListViewModel,
            navigation: {}
         };

         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);
         assert.isFalse(ctrl._needScrollCalculation, 'Wrong _needScrollCalculation value after mounting');

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
               view: 'infinity'
            }
         };
         setTimeout(function() {
            ctrl._beforeUpdate(cfg);
            assert.isTrue(ctrl._needScrollCalculation, 'Wrong _needScrollCalculation value after updating');
            done();
         }, 1);

         ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);
         assert.isTrue(ctrl._needScrollCalculation, 'Wrong _needScrollCalculation value after mounting');
      });

      it('loadToDirection down', async function() {
         const source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });

         let dataLoadFired = false;
         let beforeLoadToDirectionCalled = false;

         const cfg = {
            viewName: 'Controls/List/ListView',
            dataLoadCallback: function() {
               dataLoadFired = true;
            },
            beforeLoadToDirectionCallback: function() {
               beforeLoadToDirectionCalled = true;
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
            searchValue: 'test'
         };

         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._container = {clientHeight: 100};
         ctrl._afterMount(cfg);

         ctrl._portionedSearch = lists.BaseControl._private.getPortionedSearch(ctrl);

         let loadPromise = lists.BaseControl._private.loadToDirection(ctrl, 'down');
         assert.equal(ctrl._loadingState, 'down');
         ctrl._portionedSearch.continueSearch();
         await loadPromise;
         assert.isTrue(ctrl._portionedSearchInProgress);
         assert.isFalse(ctrl._showContinueSearchButton);
         assert.equal(4, lists.BaseControl._private.getItemsCount(ctrl), 'Items wasn\'t load');
         assert.isTrue(dataLoadFired, 'dataLoadCallback is not fired');
         assert.isTrue(beforeLoadToDirectionCalled, 'beforeLoadToDirectionCallback is not called.');
         assert.equal(ctrl._loadingState, null);
         assert.isTrue(ctrl._listViewModel.getHasMoreData());

         loadPromise = lists.BaseControl._private.loadToDirection(ctrl, 'down');
         await loadPromise;
         assert.isFalse(ctrl._portionedSearchInProgress);
         assert.isFalse(ctrl._showContinueSearchButton);
         assert.isFalse(ctrl._listViewModel.getHasMoreData());
      });

      it('loadToDirection down with portioned load', async function() {
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
            beforeLoadToDirectionCallback: function() {
               beforeLoadToDirectionCalled = true;
            },
            serviceDataLoadCallback: function(currentItems, loadedItems) {
               setIterativeMetaData(currentItems);
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

         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._container = {clientHeight: 100};
         ctrl._afterMount(cfg);
         ctrl._portionedSearch = lists.BaseControl._private.getPortionedSearch(ctrl);

         isIterativeSearch = true;
         setIterativeMetaData(ctrl._items);
         await lists.BaseControl._private.loadToDirection(ctrl, 'down');
         ladingIndicatorTimer = ctrl._loadingIndicatorTimer;
         assert.isTrue(ctrl._portionedSearchInProgress);
         assert.isFalse(ctrl._showContinueSearchButton);
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

         let dataLoadFired = false;
         let beforeLoadToDirectionCalled = false;

         const cfg = {
            viewName: 'Controls/List/ListView',
            dataLoadCallback: function() {
               dataLoadFired = true;
            },
            beforeLoadToDirectionCallback: function() {
               beforeLoadToDirectionCalled = true;
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
            getHasMoreData: function(sourceController, direction) {
               return sourceController.hasMoreData(direction);
            }
         };

         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._container = {clientHeight: 100};
         ctrl._afterMount(cfg);

         let loadPromise = lists.BaseControl._private.loadToDirection(ctrl, 'down');
         assert.equal(ctrl._loadingState, 'down');
         await loadPromise;

         assert.equal(4, lists.BaseControl._private.getItemsCount(ctrl), 'Items wasn\'t load');
         assert.isTrue(dataLoadFired, 'dataLoadCallback is not fired');
         assert.isTrue(beforeLoadToDirectionCalled, 'beforeLoadToDirectionCallback is not called.');
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
         assert.isFalse(lists.BaseControl._private.hasMoreData(self, sourceController));
         assert.isFalse(lists.BaseControl._private.hasMoreData(self));

         hasMoreDataResult = true;
         assert.isTrue(lists.BaseControl._private.hasMoreData(self, sourceController));
      });

      it('isPortionedLoad',  () => {
         const baseControl = {
            _options: {}
         };

         baseControl._items = null;
         assert.isFalse(lists.BaseControl._private.isPortionedLoad(baseControl));

         baseControl._options.searchValue = 'test';
         assert.isTrue(lists.BaseControl._private.isPortionedLoad(baseControl));
      });


      it('loadToDirection indicator triggerVisibility', async () => {
         var source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });

         var dataLoadFired = false;
         var beforeLoadToDirectionCalled = false;
         var shadowVisibility = true;

         var cfg = {
            viewName: 'Controls/List/ListView',
            dataLoadCallback: function() {
               dataLoadFired = true;
            },
            beforeLoadToDirectionCallback: function() {
               beforeLoadToDirectionCalled = true;
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
               source: 'infinity',
               sourceConfig: {
                  pageSize: 2,
                  page: 0,
                  hasMore: false
               }
            },
            searchValue: 'test'
         };

         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._container = {clientHeight: 100};
         ctrl._afterMount(cfg);
         ctrl._loadTriggerVisibility = {
            up: false,
            down: true
         };
         ctrl._notify = (eventName, eventsArgs) => {
            if (eventName === 'updateShadowMode') {
               shadowVisibility = eventsArgs[0];
            }
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
         ctrl.triggerVisibilityChangedHandler(null, 'up', true);
         assert.isNotNull(ctrl._loadingIndicatorState);
         assert.isFalse(ctrl._showContinueSearchButton);

         // Down trigger became hidden, hide the indicator, show "Continue search" button
         ctrl.triggerVisibilityChangedHandler(null, 'down', false);
         assert.isNull(ctrl._loadingIndicatorState);
         assert.isTrue(ctrl._showContinueSearchButton);
         assert.equal(shadowVisibility.bottom, 'auto');
      });

      it('loadToDirection hides indicator with false navigation', async () => {
         var source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });

         var dataLoadFired = false;
         var portionSearchTimerReseted = false;
         var portionSearchReseted = false;
         var beforeLoadToDirectionCalled = false;

         var cfg = {
            viewName: 'Controls/List/ListView',
            dataLoadCallback: function() {
               dataLoadFired = true;
            },
            beforeLoadToDirectionCallback: function() {
               beforeLoadToDirectionCalled = true;
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
               source: 'infinity',
               sourceConfig: {
                  pageSize: 2,
                  page: 0,
                  hasMore: false
               }
            },
            searchValue: 'test'
         };

         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._container = {clientHeight: 100};
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
         var
            baseControl = {
               _options: {}
            },
            tests = [
               {
                  data: [
                     baseControl,
                     undefined,
                     {}
                  ],
                  result: {
                     _shouldDrawFooter: false
                  }
               },
               {
                  data: [
                     baseControl,
                     {},
                     {}
                  ],
                  result: {
                     _shouldDrawFooter: false
                  }
               },
               {
                  data: [
                     baseControl,
                     { view: 'page' },
                     {}
                  ],
                  result: {
                     _shouldDrawFooter: false
                  }
               },
               {
                  data: [
                     baseControl,
                     { view: 'demand' },
                     {
                        hasMoreData: function() {
                           return false;
                        }
                     }
                  ],
                  result: {
                     _shouldDrawFooter: false
                  }
               },
               {
                  data: [
                     baseControl,
                     { view: 'demand' },
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
                     { view: 'demand' },
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
                     { view: 'demand' },
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
         tests.forEach(function(test, index) {
            baseControl._options.groupingKeyCallback = undefined;
            lists.BaseControl._private.prepareFooter.apply(null, test.data);
            assert.equal(test.data[0]._shouldDrawFooter, test.result._shouldDrawFooter, 'Invalid prepare footer on step #' + index);
            assert.equal(test.data[0]._loadMoreCaption, test.result._loadMoreCaption, 'Invalid prepare footer on step #' + index);

            baseControl._options.groupingKeyCallback = () => 123;
            baseControl._listViewModel = { isAllGroupsCollapsed: () => true };
            lists.BaseControl._private.prepareFooter.apply(null, test.data);
            assert.isFalse(test.data[0]._shouldDrawFooter, 'Invalid prepare footer on step #' + index + ' with all collapsed groups');
         });
      });

      it('moveMarkerToNext && moveMarkerToPrevious', async function() {
         var
            cfg = {
               viewModelConstructor: lists.ListViewModel,
               keyProperty: 'key',
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
               markedKey: 2
            },
            baseControl = new lists.BaseControl(cfg),
            moveMarkerToNextCalled = false,
            moveMarkerToPrevCalled = false,
            originalScrollToItem = lists.BaseControl._private.scrollToItem,
            originalCreateMarkerController = lists.BaseControl._private.createMarkerController;
         lists.BaseControl._private.scrollToItem = function() {};
         lists.BaseControl._private.createMarkerController = function() {
            return {
               setMarkedKey(key) { baseControl._listViewModel.setMarkedKey(key) },
               moveMarkerToNext() { moveMarkerToNextCalled = true; },
               moveMarkerToPrev() { moveMarkerToPrevCalled = true; },
               handleRemoveItems() {},
               update() {}
            };
         };
         baseControl.saveOptions(cfg);
         await baseControl._beforeMount(cfg);
         assert.equal(baseControl._listViewModel.getMarkedKey(), null);
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
         assert.isTrue(moveMarkerToNextCalled);
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
         assert.isTrue(moveMarkerToPrevCalled);

         lists.BaseControl._private.scrollToItem = originalScrollToItem;
         lists.BaseControl._private.createMarkerController = originalCreateMarkerController;
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
            baseControl = new lists.BaseControl(cfg),
            originalScrollToItem = lists.BaseControl._private.scrollToItem,
            originalCreateMarkerController = lists.BaseControl._private.createMarkerController;

         lists.BaseControl._private.scrollToItem = function() {};
         lists.BaseControl._private.createMarkerController = function() {
            return {
               setMarkedKey(key) { baseControl._listViewModel.setMarkedKey(key) },
               moveMarkerToNext() { moveMarkerToNextCalled = true; },
               moveMarkerToPrev() { moveMarkerToPrevCalled = true; },
               handleRemoveItems() {},
               update() {}
            };
         };

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
         lists.BaseControl._private.createMarkerController = originalCreateMarkerController;
      });

      it('moveMarkerToNext && moveMarkerToPrevious while loading', async function() {
         var
            cfg = {
               viewModelConstructor: lists.ListViewModel,
               markerVisibility: 'visible',
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
               })
            },
            baseControl = new lists.BaseControl(cfg);
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

      it('enterHandler', function() {
         var notified = false;

         // Without marker
         lists.BaseControl._private.enterHandler({
            _options: {
               useNewModel: false
            },
            getViewModel: function() {
               return {
                  getMarkedItem: function() {
                     return null;
                  }
               };
            },
            _notify: function(e, item, options) {
               notified = true;
            }
         });
         assert.isFalse(notified);

         var myMarkedItem = { qwe: 123 };
         var mockedEvent = { target: 'myTestTarget' };
         // With marker
         lists.BaseControl._private.enterHandler({
            _options: {
               useNewModel: false
            },
            getViewModel: function() {
               return {
                  getMarkedItem: function() {
                     return {
                        getContents: function() {
                           return myMarkedItem;
                        }
                     };
                  }
               };
            },
            _notify: function(e, args, options) {
               notified = true;
               assert.equal(e, 'itemClick');
               assert.deepEqual(args, [myMarkedItem, mockedEvent]);
               assert.deepEqual(options, { bubbling: true });
            }
         }, mockedEvent);
         assert.isTrue(notified);
      });

      it('enterHandler while loading', function() {
         let
            myMarkedItem = null,
            notified = false;

         function enterClick(markedItem) {
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
            });
         }

         // Without marker
         enterClick(null);
         assert.isFalse(notified);

         // With marker
         enterClick({ getContents: () => ({ key: 123 }) });
         assert.isFalse(notified);
      });

      it('spaceHandler', async function() {
         var
             cfg = {
                viewModelConstructor: lists.ListViewModel,
                markerVisibility: 'visible',
                keyProperty: 'key',
                multiSelectVisibility: 'visible',
                source: new sourceLib.Memory({
                   keyProperty: 'key',
                   data: [{
                      key: 1
                   }, {
                      key: 2
                   }, {
                      key: 3
                   }]
                })
             },
             baseControl = new lists.BaseControl(cfg);

         const event = {
            preventDefault: () => {}
         };
         const sandbox = sinon.createSandbox();

         baseControl.saveOptions(cfg);
         await baseControl._beforeMount(cfg);
         baseControl._selectionController = {
            toggleItem: (key) => {
               if (baseControl._listViewModel.getSelectionStatus(key)) {
                  baseControl._listViewModel._selectedKeys.pop(key);
               } else {
                  baseControl._listViewModel._selectedKeys.push(key);
               }
            },
            handleReset: function() {}
         };
         assert.deepEqual([], baseControl._listViewModel._selectedKeys);
         baseControl._loadingIndicatorState = 'all';
         lists.BaseControl._private.enterHandler(baseControl);
         assert.deepEqual([], baseControl._listViewModel._selectedKeys);

         baseControl._loadingIndicatorState = null;
         sandbox.replace(lists.BaseControl._private, 'moveMarkerToNext', () => {});
         lists.BaseControl._private.spaceHandler(baseControl, event);
         assert.deepEqual([1], baseControl._listViewModel._selectedKeys);

         baseControl.getViewModel()._markedKey = 5;
         lists.BaseControl._private.spaceHandler(baseControl, event);
         assert.deepEqual([1, 1], baseControl._listViewModel._selectedKeys);


         sandbox.restore();
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
         const baseControl = new lists.BaseControl(cfg);
         baseControl.saveOptions(cfg);
         await baseControl._beforeMount(cfg);
         baseControl._container = {clientHeight: 100, getBoundingClientRect: () => ({ y: 0 }) };
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

         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._container = {clientHeight: 100};
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
         var ctrl = new lists.BaseControl(cfg);
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
         var ctrl = new lists.BaseControl(cfg);
         ctrl._container = {
            getBoundingClientRect: () => ({})
         };
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
         assert.isFalse(!!ctrl._showLoadingIndicatorImage, 'Wrong loading indicator image state');

         // искуственно покажем картинку
         ctrl._showLoadingIndicatorImage = true;

         lists.BaseControl._private.hideIndicator(ctrl);
         lists.BaseControl._private.showIndicator(ctrl);
         assert.isTrue(ctrl._loadingIndicatorTimer === ctrl._loadingIndicatorTimer, 'all', 'Loading timer created one more tile');

         // и вызовем скрытие
         lists.BaseControl._private.hideIndicator(ctrl);
         assert.equal(ctrl._loadingState, null, 'Wrong loading state');
         assert.equal(ctrl._loadingIndicatorState, null, 'Wrong loading indicator state');
         assert.isFalse(!!ctrl._showLoadingIndicatorImage, 'Wrong loading indicator image state');
         assert.isFalse(!!ctrl._loadingIndicatorTimer);
      });

      it('updateShadowModeHandler', () => {
         const updateShadowModeHandler = lists.BaseControl.prototype.updateShadowModeHandler;
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
            }
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
            control._showContinueSearchButton = true;
            updateShadowModeHandler.call(control, event, {
               top: 0,
               bottom: 0
            });
            assert.deepEqual({top: 'auto', bottom: 'auto'}, control.lastNotifiedArguments[0]);

            control._showContinueSearchButton = false;
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
         });
      });

      it('scrollToEdge_load', function(done) {
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
               source: 'page',
               sourceConfig: {
                  pageSize: 3,
                  page: 0,
                  hasMore: false
               }
            }
         };
         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);

         // два таймаута, первый - загрузка начального рекордсета, второй - на последюущий запрос
         setTimeout(function() {
            lists.BaseControl._private.scrollToEdge(ctrl, 'down');
            setTimeout(function() {
               assert.equal(3, ctrl._listViewModel.getCount(), 'Items wasn\'t load');
               done();
            }, 100);
         }, 100);
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
                     pagingMode: 'direct'
                  },
                  sourceConfig: {
                     pageSize: 3,
                     page: 0,
                     hasMore: false
                  }
               },
            };
            var ctrl = new lists.BaseControl(cfg);
            ctrl.saveOptions(cfg);
            ctrl._beforeMount(cfg);

            ctrl._children = triggers;
            ctrl._viewSize = 1000;
            ctrl._viewPortSize = 400;
            // эмулируем появление скролла
            await lists.BaseControl._private.onScrollShow(ctrl, heightParams);
            ctrl.updateShadowModeHandler({}, {top: 0, bottom: 0});

            assert.isTrue(!!ctrl._scrollPagingCtr, 'ScrollPagingController wasn\'t created');

            // прокручиваем к низу, проверяем состояние пэйджинга
            lists.BaseControl._private.handleListScrollSync(ctrl, 600);

            assert.deepEqual({
               backwardEnabled: true,
               forwardEnabled: false
            }, ctrl._pagingCfg, 'Wrong state of paging arrows after scroll to bottom');

            lists.BaseControl._private.handleListScrollSync(ctrl, 200);
            assert.deepEqual({
               backwardEnabled: true,
               forwardEnabled: true
            }, ctrl._pagingCfg, 'Wrong state of paging arrows after scroll');

            ctrl._pagingVisible = true;
            ctrl._abortSearch();
            assert.deepEqual({
               backwardEnabled: true,
               forwardEnabled: false
            }, ctrl._pagingCfg, 'Wrong state of paging arrows after abort search');

            lists.BaseControl._private.handleListScrollSync(ctrl, 200);
            assert.deepEqual({
               backwardEnabled: true,
               forwardEnabled: false
            }, ctrl._pagingCfg, 'Wrong state of paging arrows after abort search');
            lists.BaseControl._private.getPortionedSearch(ctrl).reset();

            // Если данные не были загружены после последнего подскролла в конец (и hasMoreData все еще false),
            // и еще раз доскроллили до конца, то самое время блокировать кнопки.
            lists.BaseControl._private.handleListScrollSync(ctrl, 400);
            assert.deepEqual({
               backwardEnabled: true,
               forwardEnabled: false
            }, ctrl._pagingCfg, 'Wrong state of paging arrows after scroll');


            lists.BaseControl._private.handleListScrollSync(ctrl, 200);

            await lists.BaseControl._private.onScrollHide(ctrl);
            assert.isFalse(ctrl._pagingVisible, 'Wrong state _pagingVisible after scrollHide');
            assert.isFalse(ctrl._cachedPagingState, 'Wrong state _cachedPagingState after scrollHide');

            lists.BaseControl._private.handleListScrollSync(ctrl, 200);

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
         const ctrl = new lists.BaseControl(cfg);
         let shadowMode;
         let iterativeSearchAborted;
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         lists.BaseControl._private.onScrollShow(ctrl, heightParams);
         ctrl.updateShadowModeHandler({}, {top: 0, bottom: 0});
         ctrl._pagingVisible = true;
         ctrl._pagingCfg = {};
         ctrl._notify = (eventName, eventResult) => {
            if (eventName === 'updateShadowMode') {
               shadowMode = eventResult[0];
            }
            if (eventName === 'iterativeSearchAborted') {
               iterativeSearchAborted = true;
            }
         };
         ctrl._abortSearch();
         assert.isFalse(ctrl._showContinueSearchButton);
         assert.deepEqual(ctrl._pagingCfg, {forwardEnabled: false});
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
         var baseControl = new lists.BaseControl(cfg);
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
      describe('calcTriggerVisibility', () => {
         let calcTriggerVisibility = lists.BaseControl._private.calcTriggerVisibility;
         it('up', () => {
            let scrollParams = {
               scrollTop: 0,
               clientHeight: 300,
               scrollHeight: 600
            };
            assert.isTrue(calcTriggerVisibility({}, scrollParams, 100, 'up'), 'up trigger should be visible');
            scrollParams = {
               scrollTop: 200,
               clientHeight: 300,
               scrollHeight: 600
            };
            assert.isFalse(calcTriggerVisibility({}, scrollParams, 100, 'up'), 'up trigger shouldn\'t be visible');
         });

         it('down', () => {
            let scrollParams = {
               scrollTop: 300,
               clientHeight: 300,
               scrollHeight: 600
            };
            assert.isTrue(calcTriggerVisibility({}, scrollParams, 100, 'down'), 'down trigger should be visible');
            scrollParams = {
               scrollTop: 0,
               clientHeight: 300,
               scrollHeight: 600
            };
            assert.isFalse(calcTriggerVisibility({}, scrollParams, 100, 'down'), 'down trigger shouldn\'t be visible');
         });

         it('down with paging', () => {
            let scrollParams = {
               scrollTop: 200,
               clientHeight: 300,
               scrollHeight: 600
            };
            assert.isTrue(calcTriggerVisibility({_pagingVisible: true}, scrollParams, 100, 'down'), 'down trigger should be visible');
            scrollParams = {
               scrollTop: 100,
               clientHeight: 300,
               scrollHeight: 600
            };
            assert.isFalse(calcTriggerVisibility({_pagingVisible: true}, scrollParams, 100, 'down'), 'down trigger shouldn\'t be visible');
         });

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
         var baseControl = new lists.BaseControl(cfg);
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
         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);

         // дождемся загрузки списка
         setTimeout(function() {
            result = false;
            ctrl._notify = function(event, dir) {
               result = dir;
            };
            ctrl._children = {
               scrollController: {
                  scrollToItem(key) {
                     if (key === data[0].id) {
                        result = 'top';
                     } else if (key === data[data.length - 1].id) {
                        result = 'bottom';
                     }
                     return Promise.resolve();
                  }
               }
            };

            // прокручиваем к низу, проверяем состояние пэйджинга
            lists.BaseControl._private.scrollToEdge(ctrl, 'down');
            assert.equal(result, 'bottom', 'List wasn\'t scrolled to bottom');

            lists.BaseControl._private.scrollToEdge(ctrl, 'up');
            assert.equal(result, 'top', 'List wasn\'t scrolled to top');

            done();
         }, 100);
      });

      it('__onPagingArrowClick', function(done) {
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
         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);
         ctrl._children = triggers;
         // эмулируем появление скролла
         lists.BaseControl._private.onScrollShow(ctrl, heightParams);

         // скроллпэйджиг контроллер создается асинхронном
         setTimeout(function() {
            ctrl._notify = function(eventName, type) {
               result = type;
            };
            ctrl._children = {
               scrollController: {
                  scrollToItem(key) {
                     if (key === data[0].id) {
                        result = ['top'];
                     } else if (key === data[data.length - 1].id) {
                        result = ['bottom'];
                     }
                     return Promise.resolve();
                  }
               }
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
            assert.isFalse(ctrl._scrollPageLocked, 'Paging should be unlocked in _afterUpdate');

            ctrl.__onPagingArrowClick({}, 'Prev');
            assert.equal('pageUp', result[0], 'Wrong state of scroll after clicking to Prev');

            assert.isTrue(ctrl._scrollPageLocked, 'Paging should be locked after paging Prev until _afterUpdate');
            ctrl._afterUpdate(cfg);
            assert.isFalse(ctrl._scrollPageLocked, 'Paging should be unlocked in _afterUpdate');

            ctrl.__onPagingArrowClick({}, 'Prev');
            assert.strictEqual('pageUp', result[0], 'Wrong state of scroll after clicking to Prev');

            assert.isTrue(ctrl._scrollPageLocked, 'Paging should be locked after paging Prev until handleScrollMoveSync');
            ctrl._setMarkerAfterScroll = false;
            ctrl.scrollMoveSyncHandler(null, { scrollTop: 0 });
            assert.isFalse(ctrl._scrollPageLocked, 'Paging should be unlocked in handleScrollMoveSync');

            done();
         }, 100);
      });

      it('_processError', function() {
         var self = {
            _options: {},
            _loadingState: 'all',
            _notify: () => {
            },
            __errorController: {
               process: () => {
                  return new Promise(() => {
                  });
               }
            },
            _isMounted: true
         };

         lists.BaseControl._private.processError(self, { error: {} });
         assert.equal(self._loadingState, null);
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

         let baseControl = new lists.BaseControl(baseControlOptions);
         baseControl.saveOptions(baseControlOptions);

         await baseControl._beforeMount(baseControlOptions);

         assert.isFalse(!!baseControl.__needShowEmptyTemplate(baseControl._options.emptyTemplate, baseControl._listViewModel));

         baseControl._listViewModel.getCount = function() {
            return 0;
         };

         assert.isTrue(!!baseControl.__needShowEmptyTemplate(baseControl._options.emptyTemplate, baseControl._listViewModel));

         assert.isFalse(!!baseControl.__needShowEmptyTemplate(null, baseControl._listViewModel));

         baseControl._sourceController.isLoading = function() {
            return true;
         };

         baseControl._noDataBeforeReload = false;
         assert.isFalse(!!baseControl.__needShowEmptyTemplate(baseControl._options.emptyTemplate, baseControl._listViewModel));

         baseControl._noDataBeforeReload = true;
         assert.isTrue(!!baseControl.__needShowEmptyTemplate(baseControl._options.emptyTemplate, baseControl._listViewModel));

         baseControl._listViewModel.getEditingItemData = function() {
            return {};
         };
         assert.isFalse(!!baseControl.__needShowEmptyTemplate(baseControl._options.emptyTemplate, baseControl._listViewModel));

         baseControl._listViewModel.getEditingItemData = function() {
            return null;
         };
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

      it('reload with changing source/navig/filter should call scroll to start', function() {

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
             lnBaseControl = new lists.BaseControl(lnCfg);

         lnBaseControl.saveOptions(lnCfg);
         lnBaseControl._beforeMount(lnCfg);

         return new Promise(function(resolve) {
            setTimeout(function() {
               lists.BaseControl._private.reload(lnBaseControl, lnCfg);
               setTimeout(function() {
                  assert.equal(lnBaseControl._shouldRestoreScrollPosition, true);
                  lnCfg = clone(lnCfg);
                  lnCfg.source = lnSource2;
                  lnBaseControl._isScrollShown = true;
                  lnBaseControl._beforeUpdate(lnCfg)
                     .addCallback(function() {

                        lnCfg = clone(lnCfg);
                        lnCfg.source = lnSource3;
                        lnBaseControl._beforeUpdate(lnCfg)
                           .addCallback(function(res) {
                              resolve();
                              return res;
                           });
                        lnBaseControl._afterUpdate({});
                     });
                  lnBaseControl._afterUpdate({});
               }, 10);
            }, 10);
         });
      });

      describe('updateItemActions', function() {
         var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: data
            }),
            cfg = {
               editingConfig: {
                  item: { id: 1 }
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
               viewModelConstructor: lists.ListViewModel,
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 6
                  }
               }
            },
            baseControl = new lists.BaseControl(cfg);

         baseControl.saveOptions(cfg);
         baseControl._beforeMount(cfg);
         var actionsUpdateCount = 0;
         baseControl._children = {
            itemActions: {
               updateActions: function() {
                  actionsUpdateCount++;
               }
            }
         };
         baseControl._container = {
            clientHeight: 100,
            getBoundingClientRect: () => ({ y: 0 })
         };

         afterEach(() => {
            actionsUpdateCount = 0;
         });
          it('update sourceController onListChange', function() {
              sandbox.stub(lists.BaseControl._private, 'prepareFooter');

              baseControl._listViewModel.getItems().getMetaData().more = 5;
              lists.BaseControl._private.onListChange(baseControl, null, 'collectionChanged');

              sinon.assert.calledOnce(lists.BaseControl._private.prepareFooter);
          });
         it('control in error state, should not call update', function() {
            baseControl.__error = true;
            baseControl._updateItemActions();
            assert.equal(actionsUpdateCount, 0);
            baseControl.__error = false;
         });
         it('without listViewModel should not call update', function() {
            baseControl._listViewModel = null;
            baseControl._updateItemActions();
            assert.equal(actionsUpdateCount, 0);
            baseControl._beforeMount(cfg);
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
            baseControl = new lists.BaseControl(cfg),
            doScrollNotified = false;

         baseControl._viewPortRect = {top: 0}
         baseControl._notify = function(eventName) {
            if (eventName === 'doScroll') {
               doScrollNotified = true;
            }
         };
         baseControl._container = {
            getBoundingClientRect: () => ({ y: 0 })
         };

         baseControl.saveOptions(cfg);

         it('before mounting', async function() {
            await baseControl._beforeMount(cfg);
            await lists.BaseControl._private.reload(baseControl, cfg);
            assert.isFalse(baseControl._resetScrollAfterReload);
            baseControl._container.clientHeight = 100;
            await baseControl._afterMount();
            assert.isTrue(baseControl._isMounted);
         });
         it('without scroll', async function() {
            baseControl._isScrollShown = false;
            await lists.BaseControl._private.reload(baseControl, cfg);
            assert.isFalse(baseControl._resetScrollAfterReload);
            await baseControl._afterUpdate(cfg);
            assert.isFalse(doScrollNotified);
         });
         it('with scroll', async function() {
            baseControl._isScrollShown = true;
            await lists.BaseControl._private.reload(baseControl, cfg);
            assert.isTrue(baseControl._resetScrollAfterReload);
            await baseControl._afterUpdate(cfg);
            assert.isFalse(doScrollNotified);
            baseControl._shouldNotifyOnDrawItems = true;
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
            let inst = {_options: {}, _setMarkerAfterScroll: false};
            lists.BaseControl._private.setMarkerAfterScroll(inst);
            assert.isTrue(inst._setMarkerAfterScroll);

            inst._setMarkerAfterScroll = false;
            inst._options.moveMarkerOnScrollPaging = false;
            lists.BaseControl._private.setMarkerAfterScroll(inst);
            assert.isFalse(inst._setMarkerAfterScroll);
         });
      });

      it('List navigation by keys and after reload', function(done) {
         // mock function working with DOM
         lists.BaseControl._private.scrollToItem = function() {
         };

         var
            stopImmediateCalled = false,
            preventDefaultCalled = false,
            getParamsKeyDown = function(keyCode) {
               return {
                  stopImmediatePropagation: function() {
                     stopImmediateCalled = true;
                  },
                  target: {
                     closest() {
                        return false;
                     }
                  },
                  nativeEvent: {
                     keyCode: keyCode
                  },
                  preventDefault: function() {
                     preventDefaultCalled = true;
                  }
               };
            },

            lnSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: data
            }),
            lnCfg = {
               viewName: 'Controls/List/ListView',
               source: lnSource,
               keyProperty: 'id',
               markedKey: 1,
               markerVisibility: 'visible',
               viewModelConstructor: lists.ListViewModel
            },
            lnCfg2 = {
               viewName: 'Controls/List/ListView',
               source: new sourceLib.Memory({
                  keyProperty: 'id',
                  data: [{
                     id: 'firstItem',
                     title: 'firstItem'
                  }]
               }),
               keyProperty: 'id',
               markedKey: 'firstItem',
               markerVisibility: 'visible',
               viewModelConstructor: lists.ListViewModel
            },
            lnBaseControl = new lists.BaseControl(lnCfg);
         lnBaseControl._selectionController = {
            toggleItem: function() {},
            handleReset: function() {}
         };

         lnBaseControl.saveOptions(lnCfg);
         lnBaseControl._beforeMount(lnCfg);

         setTimeout(function() {
            assert.equal(lnBaseControl.getViewModel()
               .getMarkedKey(), 1, 'Invalid initial value of markedKey.');
            lnBaseControl.reload();
            setTimeout(function() {
               assert.equal(lnBaseControl.getViewModel()
                  .getMarkedKey(), 1, 'Invalid value of markedKey after reload.');

               lnBaseControl._onViewKeyDown(getParamsKeyDown(Env.constants.key.down));
               assert.equal(lnBaseControl.getViewModel()
                  .getMarkedKey(), 2, 'Invalid value of markedKey after press "down".');

               lnBaseControl._onViewKeyDown(getParamsKeyDown(Env.constants.key.space));
               assert.equal(lnBaseControl.getViewModel()
                  .getMarkedKey(), 3, 'Invalid value of markedKey after press "space".');

               lnBaseControl._onViewKeyDown(getParamsKeyDown(Env.constants.key.up));
               assert.equal(lnBaseControl.getViewModel()
                  .getMarkedKey(), 2, 'Invalid value of markedKey after press "up".');

               assert.isTrue(stopImmediateCalled, 'Invalid value "stopImmediateCalled"');

               // reload with new source (first item with id "firstItem")
               lnBaseControl._beforeUpdate(lnCfg2);

               setTimeout(function() {
                  lnBaseControl._afterUpdate({});
                  // TODO хз почему после beforeUpdate новые опции не записываются в _options
                  /*assert.equal(lnBaseControl.getViewModel()
                     .getMarkedKey(), 'firstItem', 'Invalid value of markedKey after set new source.');*/
                  done();
               }, 1);
            }, 1);
         }, 1);
      });

      it('_onCheckBoxClick', function() {
         var rs = new collection.RecordSet({
            keyProperty: 'id',
            rawData: data
         });

         var source = new sourceLib.Memory({
            keyProperty: 'id',
            data: data
         });

         var cfg = {
            selectedKeys: [1, 3],
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
         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);
         ctrl._notify = function(e, args) {
            assert.equal(e, 'checkboxClick');
            assert.equal(args[0], 2);
            assert.equal(args[1], 0);
         };
         ctrl._selectionController = {
            toggleItem: function(key) {
                  assert.equal(key, 2);
            },
            handleReset: function() {}
         };
         ctrl._onCheckBoxClick({}, 2, 0);
         ctrl._notify = function(e, args) {
            assert.equal(e, 'checkboxClick');
            assert.equal(args[0], 1);
            assert.equal(args[1], 1);
         };
         ctrl._selectionController = {
            toggleItem: function(key) {
                  assert.equal(key, 1);
            },
            handleReset: function() {}
         };
         ctrl._onCheckBoxClick({}, 1, 1);
      });

      it('_onItemClick', async function() {
         var cfg = {
            keyProperty: 'id',
            viewName: 'Controls/List/ListView',
            source: source,
            viewModelConstructor: lists.ListViewModel
         };
         var originalEvent = {
            target: {
               closest: function(selector) {
                  return selector === '.js-controls-ListView__checkbox';
               },
               getAttribute: function(attrName) {
                  return attrName === 'contenteditable' ? 'true' : '';
               }
            }
         };
         var stopPropagationCalled = false;
         var event = {
            stopPropagation: function() {
               stopPropagationCalled = true;
            }
         };
         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         ctrl._onItemClick(event, ctrl._listViewModel.getItems().at(2), originalEvent);
         assert.isTrue(stopPropagationCalled);
      });

      it('_needBottomPadding after reload in beforeMount', async function() {
         var cfg = {
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
         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
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
         let cfgWithSource = {
            ...cfg,
            source: source
         }
         var ctrl = new lists.BaseControl(cfg);
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         assert.isFalse(ctrl._needBottomPadding);
         ctrl._beforeUpdate(cfgWithSource).addCallback(function() {
         assert.isTrue(ctrl._needBottomPadding);
      });
         ctrl._afterUpdate(cfgWithSource);
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
         let ctrl = new lists.BaseControl(cfg);
         let setHasMoreDataCalled = false;
         let origSHMD = lists.BaseControl._private.setHasMoreData;
         lists.BaseControl._private.setHasMoreData = () => {
            setHasMoreDataCalled = true;
         }
         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);
         assert.isTrue(setHasMoreDataCalled);

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
            getEditingItemData: function() {
               return null;
            }
         };
         const editingModel = {
            getEditingItemData: function() {
               return {};
            }
         };

         assert.isTrue(lists.BaseControl._private.needBottomPadding(cfg, items, model), "itemActionsPosinon is outside, padding is needed");
         cfg = {
            itemActionsPosition: 'inside'
         };
         assert.isFalse(lists.BaseControl._private.needBottomPadding(cfg, items, model), "itemActionsPosinon is inside, padding is not needed");
         cfg = {
            itemActionsPosition: 'outside',
            footerTemplate: "footer"
         };
         assert.isFalse(lists.BaseControl._private.needBottomPadding(cfg, items, model), "itemActionsPosinon is outside, footer exists, padding is not needed");
         cfg = {
            itemActionsPosition: 'outside',
            resultsPosition: "bottom"
         };
         assert.isFalse(lists.BaseControl._private.needBottomPadding(cfg, items, model), "itemActionsPosinon is outside, results row is in bottom padding is not needed");
         cfg = {
            itemActionsPosition: 'outside',
         };
         count = 0;
         assert.isFalse(lists.BaseControl._private.needBottomPadding(cfg, items, model), "itemActionsPosinon is outside, empty items, padding is not needed");
         assert.isTrue(lists.BaseControl._private.needBottomPadding(cfg, items, editingModel), "itemActionsPosinon is outside, empty items, run editing in place padding is needed");
      });

      describe('EditInPlace', function() {
         it('beginEdit', function() {
            var opt = {
               test: 'test'
            };
            var cfg = {
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
            var ctrl = new lists.BaseControl(cfg);
            ctrl._children = {
               editInPlace: {
                  beginEdit: function(options) {
                     assert.equal(options, opt);
                     return cDeferred.success();
                  }
               }
            };
            var result = ctrl.beginEdit(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('beginAdd', function() {
            var opt = {
               test: 'test'
            };
            var cfg = {
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
            var ctrl = new lists.BaseControl(cfg);
            ctrl._children = {
               editInPlace: {
                  beginAdd: function(options) {
                     assert.equal(options, opt);
                     return cDeferred.success();
                  }
               }
            };
            var result = ctrl.beginAdd(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('cancelEdit', function() {
            var cfg = {
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
            var ctrl = new lists.BaseControl(cfg);
            ctrl._children = {
               editInPlace: {
                  cancelEdit: function() {
                     return cDeferred.success();
                  }
               }
            };
            var result = ctrl.cancelEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('cancelEdit, readOnly: true', function() {
            var cfg = {
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
               readOnly: true
            };
            var ctrl = new lists.BaseControl(cfg);
            ctrl.saveOptions(cfg);
            var result = ctrl.cancelEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });

         it('commitEdit', function() {
            var cfg = {
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
            var ctrl = new lists.BaseControl(cfg);
            ctrl._children = {
               editInPlace: {
                  commitEdit: function() {
                     return cDeferred.success();
                  }
               }
            };
            var result = ctrl.commitEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('commitEditActionHandler', function () {
            var cfg = {
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
            let commitAndMoveDef = cDeferred.success();
            let result;

            const ctrl = new lists.BaseControl(cfg);
            ctrl._children = {
               editInPlace: {
                  commitAndMoveNextRow: function () {
                     result = commitAndMoveDef;
                  }
               }
            };
            ctrl._commitEditActionHandler();
            assert.equal(commitAndMoveDef, result);
         });

         it('commitEdit, readOnly: true', function() {
            var cfg = {
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
               readOnly: true
            };
            var ctrl = new lists.BaseControl(cfg);
            ctrl.saveOptions(cfg);
            var result = ctrl.commitEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });

         it('readOnly, beginEdit', function() {
            var opt = {
               test: 'test'
            };
            var cfg = {
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
               readOnly: true
            };
            var ctrl = new lists.BaseControl(cfg);
            ctrl.saveOptions(cfg);
            var result = ctrl.beginEdit(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });

         it('readOnly, beginAdd', function() {
            var opt = {
               test: 'test'
            };
            var cfg = {
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
               readOnly: true
            };
            var ctrl = new lists.BaseControl(cfg);
            ctrl.saveOptions(cfg);
            var result = ctrl.beginAdd(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });

         it('close editing if page has been changed', function() {
            let isCanceled = false;
            const fakeCtrl = {
               _listViewModel: {
                  getEditingItemData: () => ({})
               },
               _options: {},
               _children: {
                  editInPlace: {
                     cancelEdit: function() {
                        isCanceled = true;
                     }
                  }
               }
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
      });

      it('can\'t start drag on readonly list', function() {
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
             ctrl = new lists.BaseControl();
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);
         ctrl.itemsDragNDrop = true;
         ctrl._itemMouseDown({}, {key: 1}, {nativeEvent: {button: 0}});
         assert.isNull(ctrl._draggingItem);
      });
      it('can\'t start drag if canStartDragNDrop return false', function () {
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
            ctrl = new lists.BaseControl();
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);
         ctrl.itemsDragNDrop = true;
         ctrl._itemMouseDown({}, { key: 1 }, { nativeEvent: { button: 0 } });
         assert.isNull(ctrl._draggingItem);
      });
      describe('mouseDown with different buttons', function() {
         it('dragNDrop do not start on right or middle mouse button', async function() {
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: data
            });
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
                  itemsDragNDrop: true,
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
               },
               ctrl = new lists.BaseControl();
            let dragNDropStarted = false;
            let domEvent = {
               nativeEvent: {
                  button: 2
               },
               target: {
                  closest: function() {
                     return null;
                  }
               }
            };
            ctrl.saveOptions(cfg);
            await ctrl._beforeMount(cfg);
            ctrl.itemsDragNDrop = true;
            ctrl._notify = function() {
               return true;
            };
            ctrl._children = {
               dragNDropController: {
                  startDragNDrop: function() {
                     dragNDropStarted = true;
                  }
               }
            };
            ctrl._itemMouseDown({}, { key: 1 }, domEvent);
            assert.isFalse(dragNDropStarted);
            domEvent.nativeEvent.button = 1;
            ctrl._itemMouseDown({}, { key: 1 }, domEvent);
            assert.isFalse(dragNDropStarted);
            domEvent.nativeEvent.button = 0;
            ctrl._itemMouseDown({}, { key: 1 }, domEvent);
            assert.isTrue(dragNDropStarted);
         });
      });

      it('_dragEnter only works with ItemsEntity', function() {
         const ctrl = new lists.BaseControl({});

         ctrl._listViewModel = {
            getDragEntity: () => null
         };

         let
            notifiedEvent = null,
            notifiedEntity = null;

         ctrl._notify = function(eventName, dragEntity) {
            notifiedEvent = eventName;
            notifiedEntity = dragEntity && dragEntity[0];
         };

         ctrl._dragEnter({}, undefined);
         assert.isNull(notifiedEvent);

         const badDragObject = { entity: {} };
         ctrl._dragEnter({}, badDragObject);
         assert.isNull(notifiedEvent);

         const goodDragObject = {
            entity: {
               '[Controls/dragnDrop:ItemsEntity]': true
            }
         };
         ctrl._dragEnter({}, goodDragObject);
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
            ctrl = new lists.BaseControl(),
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

         // по mouseDown нельзя вызывать preventDefault, иначе сломается фокусировка
         ctrl._itemMouseDown({}, { key: 1 }, fakeMouseDown);
         assert.isFalse(isDefaultPrevented);

         // По dragStart нужно вызывать preventDefault
         ctrl._nativeDragStart(fakeDragStart);
         assert.isTrue(isDefaultPrevented);
      });

      it('_itemMouseDown places dragKey first', async() => {
         let dragKeys;
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
            ctrl = new lists.BaseControl(),
            fakeMouseDown = {
               nativeEvent: {
                  button: 0
               },
               target: {
                  closest: () => false
               },
               preventDefault: () => isDefaultPrevented = true
            };

         ctrl.saveOptions(cfg);
         await ctrl._beforeMount(cfg);

         ctrl._notify = (eventName, eventArgs) => {
            if (eventName === 'dragStart') {
               dragKeys = eventArgs[0];
            }
         };

         ctrl._itemMouseDown({}, { key: 4 }, fakeMouseDown);
         // First item in dragKeys should be the dragged item's key even if it
         // is not first in the recordset
         assert.strictEqual(dragKeys[0], 4);
      });

      it('_documentDragEnd', function() {
         var
            dragEnded,
            ctrl = new lists.BaseControl();
         ctrl._isMounted = true;
         ctrl._scrollTop = 0;
         ctrl._container = {
            getBoundingClientRect() {
               return {
                  y: -900
               };
            }
         };

         ctrl._viewPortRect = { top: 0 }
         //dragend without deferred
         dragEnded = false;
         ctrl._documentDragEndHandler = function() {
            dragEnded = true;
         };
         ctrl._documentDragEnd();
         assert.isTrue(dragEnded);

         //dragend with deferred
         dragEnded = false;
         // ctrl._dragEndResultPromise = new Promise((res) => {res('hello')})
         ctrl._dragEndResult = new cDeferred();
         ctrl._documentDragEnd();
         assert.isFalse(dragEnded);
         assert.isTrue(!!ctrl._loadingState);
         ctrl._dragEndResult.then(() => {
            assert.isTrue(dragEnded);
            assert.isFalse(!!ctrl._loadingState);
         });


      });

      it('getSelectionForDragNDrop', function() {
         var selection;

         selection = lists.BaseControl._private.getSelectionForDragNDrop([1, 2, 3], [], 4);
         assert.deepEqual(selection.selected, [4, 1, 2, 3]);
         assert.deepEqual(selection.excluded, []);

         selection = lists.BaseControl._private.getSelectionForDragNDrop([1, 2, 3], [], 2);
         assert.deepEqual(selection.selected, [2, 1, 3]);
         assert.deepEqual(selection.excluded, []);

         selection = lists.BaseControl._private.getSelectionForDragNDrop([1, 2, 3], [4], 3);
         assert.deepEqual(selection.selected, [3, 1, 2]);
         assert.deepEqual(selection.excluded, [4]);

         selection = lists.BaseControl._private.getSelectionForDragNDrop([1, 2, 3], [4], 5);
         assert.deepEqual(selection.selected, [5, 1, 2, 3]);
         assert.deepEqual(selection.excluded, [4]);

         selection = lists.BaseControl._private.getSelectionForDragNDrop([1, 2, 3], [4], 4);
         assert.deepEqual(selection.selected, [4, 1, 2, 3]);
         assert.deepEqual(selection.excluded, []);

         selection = lists.BaseControl._private.getSelectionForDragNDrop([null], [4], 4);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, []);

         selection = lists.BaseControl._private.getSelectionForDragNDrop([null], [], 4);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, []);

         selection = lists.BaseControl._private.getSelectionForDragNDrop([null], [3], 4);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [3]);
      });

      describe('ItemActions menu', () => {
         let instance;
         let fakeEvent;
         let item;

         beforeEach(async() => {
            const cfg = {
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
                     id: 2,
                     showType: 0
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
               source: source
            };
            instance = new lists.BaseControl(cfg);
            fakeEvent = {
               immediatePropagating: true,
               propagating: true,
               nativeEvent: {
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
                  closest: () => 'elem'
               }
            };
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
               })
            };
            instance.saveOptions(cfg);
            instance._children = {
               scrollController: {
                  scrollToItem: () => {}
               }
            };
            await instance._beforeMount(cfg);
            instance._updateItemActions(cfg);
         });

         // Не показываем контекстное меню браузера, если мы должны показать кастомное меню
         it('should prevent default context menu', () => {
            popup.Sticky.openPopup = (config) => Promise.resolve(1);
            instance._onItemContextMenu(null, item, fakeEvent);
            assert.isTrue(fakeEvent.nativeEvent.prevented);
            assert.isFalse(fakeEvent.propagating);
         });

         // Записи-"хлебные крошки" в getContents возвращают массив. Не должно быть ошибок
         it('should correctly work with breadcrumbs', () => {
            const breadcrumbItem = {
               '[Controls/_display/BreadcrumbsItem]': true,
               _$active: false,
               getContents: () => ['fake', 'fake', 'fake', {
                  getKey: () => 2
               }],
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
            instance._onItemContextMenu(null, breadcrumbItem, fakeEvent);
            assert(instance._listViewModel.getActiveItem(), item);
         });

      });

      it('resolveIndicatorStateAfterReload', function() {
         let listViewModelCount = 0;
         var baseControlMock = {
            _needScrollCalculation: true,
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
            _viewPortRect: { top: 0 },
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

      it('reloadItem', function() {
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
         var baseCtrl = new lists.BaseControl(cfg);
         baseCtrl.saveOptions(cfg);

         return new Promise(function(resolve) {
            baseCtrl._beforeMount(cfg)
               .addCallback(function() {
                  assert.isTrue(baseCtrl._sourceController.hasMoreData('down'));

                  baseCtrl.reloadItem(1)
                     .addCallback(function(item) {
                        assert.equal(item.get('id'), 1);
                        assert.equal(item.get('title'), 'Первый');
                        assert.isTrue(baseCtrl._sourceController.hasMoreData('down'), 'wrong navigation after reload item');
                        assert.isTrue(baseCtrl._itemReloaded);

                        baseCtrl.reloadItem(1, null, true, 'query')
                           .addCallback(function(items) {
                              assert.isTrue(!!items.getCount);
                              assert.equal(items.getCount(), 1);
                              assert.equal(items.at(0)
                                 .get('id'), 1);
                              assert.isTrue(baseCtrl._sourceController.hasMoreData('down'), 'wrong navigation after reload item');

                              let recordSet = new collection.RecordSet({
                                 keyProperty: 'id',
                                 rawData: [{ id: 'test' }]
                              });
                              baseCtrl._listViewModel.setItems(recordSet);
                              baseCtrl.reloadItem('test', null, true, 'query')
                                 .addCallback(function(reloadedItems) {
                                    assert.isTrue(reloadedItems.getCount() === 0);
                                    resolve();
                                 });
                           });
                     });
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
             instance = new lists.BaseControl(cfg);
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

      it('close editInPlace if model changed', async () => {
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
             instance = new lists.BaseControl(cfg);
         let cancelClosed = false;
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         instance._listViewModel.getEditingItemData = () => ({});
         instance._viewModelConstructor = {};
         instance._children = {
            editInPlace: {
               cancelEdit: () => {
                  cancelClosed = true;
               }
            }
         };
         instance._beforeUpdate(cfg);
         assert.isTrue(cancelClosed);
         instance.destroy(cancelClosed);
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
         bc._viewPortRect = {
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

      it('_itemMouseMove: notify draggingItemMouseMove', async function() {
         var cfg = {
                viewName: 'Controls/List/ListView',
                itemsDragNDrop: true,
                viewConfig: {
                   idProperty: 'id'
                },
                viewModelConfig: {
                   items: [],
                   idProperty: 'id'
                },
                viewModelConstructor: lists.ListViewModel,
                source: source
             },
             instance = new lists.BaseControl(cfg);
         let eName;
         await instance._beforeMount(cfg);
         instance.saveOptions(cfg);
         instance._listViewModel.getDragItemData = () => ({});
         instance._notify = (eventName) => {
            eName = eventName;
         };
         instance._itemMouseMove({}, {});
         assert.equal(eName, 'draggingItemMouseMove');
         instance.saveOptions({...cfg, itemsDragNDrop: false});
         instance._itemMouseLeave({}, {});
         assert.equal(eName, 'itemMouseLeave');
      });

      it('_itemMouseLeave: notify draggingItemMouseLeave', async function() {
         var cfg = {
                viewName: 'Controls/List/ListView',
                itemsDragNDrop: true,
                viewConfig: {
                   idProperty: 'id'
                },
                viewModelConfig: {
                   items: [],
                   idProperty: 'id'
                },
                viewModelConstructor: lists.ListViewModel,
                source: source
             },
             instance = new lists.BaseControl(cfg);
         let eName;
         await instance._beforeMount(cfg);
         instance.saveOptions(cfg);
         instance._notify = (eventName) => {
            eName = eventName;
         };
         instance._listViewModel.getDragItemData = () => ({});
         instance._itemMouseLeave({}, {});
         assert.equal(eName, 'draggingItemMouseLeave');
         eName = null;
         instance.saveOptions({...cfg, itemsDragNDrop: false});
         instance._itemMouseLeave({}, {});
         assert.equal(eName, 'itemMouseLeave');
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
             instance = new lists.BaseControl(cfg);
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
            instance = new lists.BaseControl(cfg);
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         instance._beforeUpdate(cfg);
         instance._afterUpdate(cfg);

         var fakeNotify = sandbox.spy(instance, '_notify')
            .withArgs('drawItems');

         instance.getViewModel()
            ._notify('onListChange', 'collectionChanged');
         assert.isFalse(fakeNotify.called);
         instance._beforeUpdate(cfg);
         assert.isFalse(fakeNotify.called);
         instance._afterUpdate(cfg);
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
            instance = new lists.BaseControl(cfg);
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         instance._beforeUpdate(cfg);
         instance._afterUpdate(cfg);

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
         assert.isFalse(fakeNotify.calledOnce);

         const redrawChange = [{ sourceItem: true}];

         instance.getViewModel()
            ._notify('onListChange', null, 'ch', redrawChange, 0, redrawChange, 0);
         assert.isFalse(fakeNotify.called);
         instance._beforeUpdate(cfg);
         assert.isFalse(fakeNotify.called);
         instance._afterUpdate(cfg);
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
            instance = new lists.BaseControl(cfg);
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         instance._beforeUpdate(cfg);
         instance._afterUpdate(cfg);

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
         assert.isFalse(fakeNotify.calledOnce);

         const redrawChange = [{ sourceItem: true}];

         instance.getViewModel()
            ._notify('onListChange', null, 'ch', redrawChange, 0, redrawChange, 0);
         assert.isFalse(fakeNotify.called);
         instance._beforeUpdate(cfg);
         assert.isFalse(fakeNotify.called);
         instance._afterUpdate(cfg);
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
            instance = new lists.BaseControl(cfg);
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         instance._beforeUpdate(cfg);
         instance._afterUpdate(cfg);
         var fakeNotify = sandbox.spy(instance, '_notify')
            .withArgs('drawItems');

         instance.getViewModel()
            ._notify('onListChange', 'indexesChanged');
         assert.isFalse(fakeNotify.called);
         instance._beforeUpdate(cfg);
         assert.isFalse(fakeNotify.called);
         instance._afterUpdate(cfg);
         assert.isTrue(fakeNotify.calledOnce);
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
         var instance = new lists.BaseControl(cfg);
         var cfgClone = { ...cfg };

         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);
         instance._container = {clientHeight: 100, getBoundingClientRect: () => ({ y: 0 }) };
         instance._afterMount(cfg);

         instance._beforeUpdate(cfg);
         instance._afterUpdate(cfg);

         lists.BaseControl._private.showIndicator(instance, 'down');
         assert.equal(instance._loadingState, 'down');

         cfgClone.loading = true;
         instance.saveOptions(cfg);
         instance._afterUpdate(cfg);
         assert.equal(instance._loadingState, 'down');
      });

      it('_beforeUpdate with new sorting/filter', async function() {
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
         let instance = new lists.BaseControl(cfg);
         let cfgClone = { ...cfg };
         let portionSearchReseted = false;

         instance._portionedSearch = lists.BaseControl._private.getPortionedSearch(instance);
         instance._portionedSearch.reset = () => {
            portionSearchReseted = true;
         };

         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);

         instance._beforeUpdate(cfg);
         instance._afterUpdate(cfg);

         let clock = sandbox.useFakeTimers();

         cfgClone.dataLoadCallback = sandbox.stub();
         cfgClone.sorting = [{ title: 'ASC' }];
         instance._beforeUpdate(cfgClone);
         clock.tick(100);
         instance._afterUpdate({});
         assert.isTrue(cfgClone.dataLoadCallback.calledOnce);
         assert.isTrue(portionSearchReseted);

         portionSearchReseted = false;
         cfgClone = { ...cfg };
         cfgClone.dataLoadCallback = sandbox.stub();
         cfgClone.filter = { test: 'test' };
         instance._beforeUpdate(cfgClone);
         instance._afterUpdate({});
         clock.tick(100);
         assert.isTrue(cfgClone.dataLoadCallback.calledOnce);
         assert.isTrue(portionSearchReseted);
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
         let instance = new lists.BaseControl(cfg);
         let cfgClone = { ...cfg };
         let portionSearchReseted = false;

         instance._portionedSearch = lists.BaseControl._private.getPortionedSearch(instance);
         instance._portionedSearch.reset = () => {
            portionSearchReseted = true;
         };

         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);

         instance._beforeUpdate(cfg);
         instance._afterUpdate(cfg);

         assert.isTrue(portionSearchReseted);
         portionSearchReseted = false;

         cfgClone.searchValue = 'test';
         instance._beforeUpdate(cfgClone);
         instance._afterUpdate({});

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
         let instance = new lists.BaseControl(cfg);
         instance.saveOptions(cfg);
         await instance._beforeMount(cfg);

         assert.isFalse(!!instance._groupingLoader);
         instance._beforeUpdate({ ...cfg, groupProperty: 'NewProp' });
         instance._options.groupProperty = 'NewProp';
         assert.isTrue(!!instance._groupingLoader);
         instance._beforeUpdate({ ...cfg, groupProperty: undefined });
         assert.isTrue(instance._groupingLoader._destroyed);

      })

      it('_beforeMount with PrefetchProxy in source', function() {
         let prefetchSource = new sourceLib.PrefetchProxy({
            target: source,
            data: {
               query: data
            }
         });
         let cfg = {
            viewName: 'Controls/List/ListView',
            sorting: [],
            viewModelConfig: {
               items: [],
               keyProperty: 'id'
            },
            viewModelConstructor: lists.ListViewModel,
            keyProperty: 'id',
            source: prefetchSource
         };
         let instance = new lists.BaseControl(cfg);
         instance.saveOptions(cfg);

         return new Promise(function(resolve) {
            instance._beforeMount(cfg)
               .addCallback(function(receivedState) {
                  assert.isTrue(!receivedState);
                  resolve();
               });
         });
      });


      it('_getLoadingIndicatorClasses', function() {
         const theme = 'default';
         function testCaseWithArgs(indicatorState, hasPaging, isPortionedSearchInProgress = false) {
            return lists.BaseControl._private.getLoadingIndicatorClasses({
               hasItems: true,
               hasPaging: hasPaging,
               loadingIndicatorState: indicatorState,
               theme,
               isPortionedSearchInProgress
            });
         }

         assert.equal('controls-BaseControl__loadingIndicator controls-BaseControl__loadingIndicator__state-all controls-BaseControl__loadingIndicator__state-all_theme-default', testCaseWithArgs('all', false));
         assert.equal('controls-BaseControl__loadingIndicator controls-BaseControl__loadingIndicator__state-up controls-BaseControl__loadingIndicator__state-up_theme-default', testCaseWithArgs('up', false));
         assert.equal('controls-BaseControl__loadingIndicator controls-BaseControl__loadingIndicator__state-down controls-BaseControl__loadingIndicator__state-down_theme-default', testCaseWithArgs('down', false));
         assert.equal(`controls-BaseControl__loadingIndicator controls-BaseControl__loadingIndicator__state-down controls-BaseControl__loadingIndicator__state-down_theme-default controls-BaseControl_withPaging__loadingIndicator__state-down_theme-${theme}`, testCaseWithArgs('down', true));
         assert.equal('controls-BaseControl__loadingIndicator controls-BaseControl__loadingIndicator__state-down controls-BaseControl__loadingIndicator__state-down_theme-default controls-BaseControl__loadingIndicator_style-portionedSearch_theme-default', testCaseWithArgs('down', false, true));

      });

      it('_getLoadingIndicatorStyles', function() {
         const baseControl = new lists.BaseControl();
         let itemsCount;
         baseControl._listViewModel = {
            getCount: () => itemsCount
         };

         assert.equal(baseControl._getLoadingIndicatorStyles('down'), '');
         assert.equal(baseControl._getLoadingIndicatorStyles('up'), '');
         assert.equal(baseControl._getLoadingIndicatorStyles('all'), '');

         baseControl._loadingIndicatorContainerHeight = 32;
         itemsCount = 0;
         assert.equal(baseControl._getLoadingIndicatorStyles('down'), '');
         assert.equal(baseControl._getLoadingIndicatorStyles('all'), 'min-height: 32px;');
         assert.equal(baseControl._getLoadingIndicatorStyles('up'), '');

         itemsCount = 10;
         assert.equal(baseControl._getLoadingIndicatorStyles('down'), '');
         assert.equal(baseControl._getLoadingIndicatorStyles('all'), 'min-height: 32px;');
         assert.equal(baseControl._getLoadingIndicatorStyles('up'), '');

         baseControl._loadingIndicatorContainerOffsetTop = 48;
         itemsCount = 0;
         assert.equal(baseControl._getLoadingIndicatorStyles('down'), '');
         assert.equal(baseControl._getLoadingIndicatorStyles('all'), 'min-height: 32px; top: 48px;');
         assert.equal(baseControl._getLoadingIndicatorStyles('up'), '');

         itemsCount = 10;
         assert.equal(baseControl._getLoadingIndicatorStyles('down'), '');
         assert.equal(baseControl._getLoadingIndicatorStyles('all'), 'min-height: 32px; top: 48px;');
         assert.equal(baseControl._getLoadingIndicatorStyles('up'), '');
      });

      it('hide indicator if shouldn\'t load more', function() {
         const baseControl = new lists.BaseControl();
         baseControl._isMounted = true;

         baseControl._loadingIndicatorState = 'down';
         baseControl._loadTriggerVisibility = {down: false};
         baseControl._beforePaint();
         assert.isNull(baseControl._loadingIndicatorState);

         baseControl._loadingIndicatorState = 'up';
         baseControl._loadTriggerVisibility = {up: false};
         baseControl._beforePaint();
         assert.isNull(baseControl._loadingIndicatorState);

         baseControl._loadingIndicatorState = 'down';
         baseControl._loadTriggerVisibility = {down: true};
         baseControl._beforePaint();
         assert.equal(baseControl._loadingIndicatorState, 'down');

         baseControl._loadingIndicatorState = 'up';
         baseControl._loadTriggerVisibility = {up: true};
         baseControl._beforePaint();
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
               }
            };
            let dataLoadFired = false;

            const ctrl = new lists.BaseControl(cfg);

            ctrl.saveOptions(cfg);
            await ctrl._beforeMount(cfg);
            ctrl._container = {clientHeight: 100};
            ctrl._afterMount(cfg);

            assert.isNull(ctrl._loadedItems);
            assert.isTrue(ctrl._shouldDrawFooter, 'Failed draw footer on first load.');
            assert.equal(ctrl._loadMoreCaption, 3, 'Failed draw footer on first load.');

            const loadPromise = lists.BaseControl._private.loadToDirection(ctrl, 'down');
            assert.equal(ctrl._loadingState, 'down');

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
            const instance = new lists.BaseControl(cfg);
            const enterItemData = {
               item: {}
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

            const ctrl = new lists.BaseControl(cfg);

            ctrl._setLoadOffset = lists.BaseControl._private.startScrollEmitter = function() {
            };
            ctrl._loadTriggerVisibility = {
               up: false,
               down: true
            };
            ctrl._container = {
               clientHeight: 100,
               getBoundingClientRect: () => ({y: 0})
            };
            ctrl._loadingIndicatorContainerOffsetTop = 222;
            ctrl.saveOptions(cfg);
            await ctrl._beforeMount(cfg);
            ctrl._afterMount(cfg);

            let queryCallsCount = 0;
            src.query = function(query) {
               if (queryCallsCount === 0) {
                  queryCallsCount++;
                  assert.deepEqual({ field: 'updatedFilter' }, query.getWhere());
                  return new Promise(function(resolve) {
                     resolve(new sourceLib.DataSet({
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
                  });
               } else if (queryCallsCount === 1) {
                  queryCallsCount++;
                  assert.deepEqual({ field: 'updatedFilter' }, query.getWhere());
                  return new Promise(function(resolve) {
                     resolve(new sourceLib.DataSet({
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
                  });
               }
            };

            let cfgClone = { ...cfg };
            cfgClone.filter = {
               field: 'updatedFilter'
            };

            await lists.BaseControl._private.reload(ctrl, cfgClone);

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
                              assert.deepEqual(ctrl._sourceController._queryParamsController._controllers.at(0).queryParamsController._afterPosition, [777]);
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

               ctrl = new lists.BaseControl(cfg);
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
               let baseControl = new lists.BaseControl(cfg);
               let expectedSourceConfig = {};
               baseControl.saveOptions(cfg);
               await baseControl._beforeMount(cfg);
               baseControl.recreateSourceController = function(newSource, newNavigation) {
                  assert.deepEqual(expectedSourceConfig, newNavigation.sourceConfig);
               };
               expectedSourceConfig.page = 0;
               expectedSourceConfig.pageSize = 100;
               expectedSourceConfig.hasMore = false;
               baseControl._changePageSize({}, 5);
               assert.equal(baseControl._currentPage, 1);
               expectedSourceConfig.page = 1;
               baseControl.__pagingChangePage({}, 2);
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
            var baseControl = new lists.BaseControl(cfg);
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
            };

            it('call check', async function() {
               bc = new lists.BaseControl(cfg);
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
            control._container = {clientHeight: 0};
            await control._afterMount(options);
         }

            beforeEach(async () => {
               baseControlOptions = {
                  keyProperty: 'id',
                  viewName: 'Controls/List/ListView',
                  source: source,
                  viewModelConstructor: lists.ListViewModel,
                  markedKey: null
               };
               const _baseControl = new lists.BaseControl(baseControlOptions);
               sandbox.replace(lists.BaseControl._private, 'createMarkerController', () => {
                  return {
                     setMarkedKey() { },
                     moveMarkerToNext() {},
                     moveMarkerToPrev() {},
                     handleRemoveItems() {},
                     update() {}
                  };
               });
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
                  target: {},
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
                  target: {},
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
               const originalEvent = { target: {} };
               const event = { stopPropagation: () => {} };

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
               const itemData = { item: {} };
               baseControl._listViewModel.setDragItemData = () => {};
               baseControl._listViewModel.getItemDataByItem = () => { return { item: {} };};
               baseControl._options.itemsDragNDrop = true;
               baseControl._draggingItem = { dispItem: {} };
               baseControl._unprocessedDragEnteredItem = null;
               baseControl._itemMouseEnter(event, itemData, originalEvent);
               assert.equal(baseControl._unprocessedDragEnteredItem, itemData, 'should save itemData');
               baseControl._dragStart(dragEvent, dragObject);
               assert.isNull(baseControl._unprocessedDragEnteredItem, 'should reset itemData after processing');
               baseControl._options.itemsDragNDrop = false;
            });
         });

         describe('_onItemMouseUp', () => {

               it('notify parent', () => {
                  const originalEvent = {
                     target: {},
                     nativeEvent: {}
                  };
                  const event = {
                     stopPropagation: () => {
                     }
                  };
                  const itemData = {item: {}};

                  baseControl._items.getCount = () => 1;
                  baseControl._markerController = {
                     setMarkedKey: function () {
                     }
                  };

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

               baseControl._children.scrollController = {
                  scrollToItem(key) {
                     assert.equal(key, 1);
                  }
               }

                  const originalEvent = {target: {}};
                  const event = {};
                  let setMarkedKeyIsCalled = false;

                  baseControl._items.getCount = () => 1;
                  baseControl._mouseDownItemKey = 1;
                  baseControl._markerController = {
                     setMarkedKey: function (key) {
                        assert.equal(key, 1);
                        setMarkedKeyIsCalled = true;
                     }
                  };

               assert.isUndefined(baseControl._listViewModel.getMarkedItem());
               baseControl._itemMouseUp(event, { key: 1 }, originalEvent);

                  assert.equal(setMarkedKeyIsCalled, true);
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
                  let setMarkedKeyIsCalled = false;

                  const originalEvent = {target: {}};
                  const event = {};
                  baseControl._mouseDownItemKey = 1;
                  baseControl._markerController = {
                     setMarkedKey: function (key) {
                        assert.equal(key, 1);
                        setMarkedKeyIsCalled = true;
                     }
                  };

                  baseControl._children = {
                     scrollController: {
                        scrollToItem(key) {
                           if (key === data[0].id) {
                              result = 'top';
                           } else if (key === data[data.length - 1].id) {
                              result = 'bottom';
                           }
                           return Promise.resolve();
                        }
                     }
                  };

                  // No editing
                  assert.isUndefined(baseControl._listViewModel.getMarkedItem());
                  baseControl._itemMouseUp(event, {key: 1}, originalEvent);
                  assert.equal(setMarkedKeyIsCalled, true);

                  // With editing
                  setMarkedKeyIsCalled = false;
                  baseControl._listViewModel.setMarkedKey(null);
                  baseControlOptions.editingConfig = {};
                  await mountBaseControl(baseControl, baseControlOptions);
                  baseControl._markerController = {
                     setMarkedKey: function (key) {
                        assert.equal(key, 1);
                        setMarkedKeyIsCalled = true;
                     }
                  };

               baseControl._mouseDownItemKey = 1;

                  assert.isUndefined(baseControl._listViewModel.getMarkedItem());
                  baseControl._itemMouseUp(event, {key: 1}, originalEvent);
                  assert.equal(setMarkedKeyIsCalled, true);
               });
            });


         describe('_onItemClick', () => {
            it('click on checkbox should not notifies itemClick, but other clicks should', function() {
               let isStopped = false;
               let isCheckbox = false;

               const e = { stopPropagation() { isStopped = true; } };

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
         });
      });
   });
});
