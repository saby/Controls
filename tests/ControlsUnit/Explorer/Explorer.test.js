define([
   'Controls/explorer',
   'Core/Deferred',
   'Types/collection',
   'Types/chain',
   'Controls/dragnDrop',
   'Types/entity',
   'Types/source',
   'Controls/dataSource'
], function(
   explorerMod,
   Deferred,
   collection,
   chain,
   dragnDrop,
   entityLib,
   sourceLib,
   dataSource
) {
   function dragEntity(items, dragControlId) {
      var entity = new dragnDrop.ItemsEntity({
         items: items
      });
      entity.dragControlId = dragControlId;
      return entity;
   }

   const emptyFn = () => {/* empty */};
   const GlobalView = new explorerMod.View();
   GlobalView._beforeMount({});

   describe('Controls.Explorer', function() {
      it('_private block', function() {
         const notify = emptyFn;
         const forceUpdate = emptyFn;
         const dataLoadCallback = emptyFn;
         const updateHeadingPath = emptyFn;
         let itemOpenHandlerCalled = false;
         const itemOpenHandler = () => {
            itemOpenHandlerCalled = true;
         };

         const self = {
            _forceUpdate: forceUpdate,
            _notify: notify,
            _updateHeadingPath: updateHeadingPath,
            _options: {
               dataLoadCallback: dataLoadCallback,
               itemOpenHandler: itemOpenHandler
            }
         };
         const testRoot = 'testRoot';

         GlobalView._setRoot.call(self, testRoot);
         assert.deepEqual({
            _root: 'testRoot',
            _forceUpdate: forceUpdate,
            _updateHeadingPath: updateHeadingPath,
            _notify: notify,
            _options: {
               dataLoadCallback: dataLoadCallback,
               itemOpenHandler: itemOpenHandler
            }
         }, self, 'Incorrect self data after "setRoot(self, testRoot)".');
         assert.isTrue(itemOpenHandlerCalled);
      });

      it('_private.canStartDragNDrop', function() {
         const explorer = new explorerMod.View({});
         explorer._beforeMount({});

         explorer._viewMode = 'table';
         assert.isTrue(explorer._canStartDragNDrop());
         explorer._viewMode = 'search';
         assert.isFalse(explorer._canStartDragNDrop());
      });

      it('_private.getRoot', function() {
         var
            cfg = {
               root: 'rootFromOptions'
            },
            explorer = new explorerMod.View(cfg);

         explorer.saveOptions(cfg);
         explorer._root = 'rootFromState';
         assert.equal(explorer._getRoot(cfg.root), 'rootFromOptions');

         delete cfg.root;
         explorer.saveOptions(cfg);
         assert.equal(explorer._getRoot(cfg.root), 'rootFromState');
      });

      it('_private._getTopRoot', function() {
         const cfg = {
            parentProperty: 'parent',
            root: 'rootFromOptions'
         };
         const explorer = new explorerMod.View(cfg);

         explorer.saveOptions(cfg);
         assert.equal(explorer._getTopRoot([], cfg.parentProperty, cfg.root), 'rootFromOptions');

         delete cfg.root;
         explorer.saveOptions(cfg);
         explorer._root = 'rootFromState';
         assert.equal(explorer._getTopRoot([], cfg.parentProperty, cfg.root), 'rootFromState');

         let breadcrumbs = [new entityLib.Model({
            rawData: {
               parent: 'rootFromBreadCrumbs'
            },
            keyProperty: 'id'
         })];
         assert.equal(explorer._getTopRoot(breadcrumbs, cfg.parentProperty, cfg.root), 'rootFromBreadCrumbs');

         cfg.root = 'rootFromOptions';
         explorer.saveOptions(cfg);
         assert.equal(explorer._getTopRoot(breadcrumbs, cfg.parentProperty, cfg.root), 'rootFromBreadCrumbs');
      });

      it('itemsReadyCallback', function() {
         var
            items = {},
            itemsReadyCallbackArgs,
            itemsReadyCallback = function(items) {
               itemsReadyCallbackArgs = items;
            },
            cfg = {
               itemsReadyCallback: itemsReadyCallback
            },
            explorer = new explorerMod.View(cfg);
         explorer.saveOptions(cfg);
         explorer._beforeMount({});

         explorer._itemsReadyCallback(items);
         assert.equal(itemsReadyCallbackArgs, items);
         assert.equal(explorer._items, items);
      });

      it('itemsSetCallback', function() {
         let markedKey = '', clearSelectionCalled = false;
         const cfg = {};
         const explorer = new explorerMod.View(cfg);
         explorer.saveOptions(cfg);
         explorer.__beforeMount(cfg);

         explorer._isGoingBack = true;
         explorer._root = null;
         explorer._restoredMarkedKeys = {
            [null]: { markedKey: 'test' }
         };
         explorer._children = {
            treeControl: {
               setMarkedKey: (key) => markedKey = key,
               isAllSelected: () => true,
               clearSelection: () => clearSelectionCalled = true
            }
         };

         assert.equal(explorer._markerForRestoredScroll, null);
         explorer._onBreadcrumbsChanged(null, []);
         explorer._itemsSetCallback();

         assert.strictEqual(markedKey, 'test');
         assert.strictEqual(explorer._markerForRestoredScroll, 'test');
         assert.isFalse(explorer._isGoingBack);
         assert.isTrue(clearSelectionCalled);

         clearSelectionCalled = false;
         explorer._isGoingFront = true;
         explorer._root = 'test';
         explorer._restoredMarkedKeys = {
            [null]: { markedKey: 'test' }
         };

         explorer._itemsSetCallback();

         // assert.strictEqual(markedKey, null);
         assert.isFalse(explorer._isGoingFront);
         assert.isFalse(clearSelectionCalled);
      });

      it('setViewMode', async() => {
         const cfg = {
            root: 'rootNode',
            viewMode: 'tree',
            virtualScrollConfig: {
               pageSize: 100
            }
         };
         const newCfg = {
            viewMode: 'search',
            root: 'rootNode',
            virtualScrollConfig: {
               pageSize: 100
            }
         };
         const newCfg2 = {
            viewMode: 'tile',
            root: 'rootNode',
            virtualScrollConfig: {
               pageSize: 100
            }
         };
         const newCfg3 = {
            viewMode: 'search',
            root: 'rootNode',
            virtualScrollConfig: {
               pageSize: 100
            },
            searchStartingWith: 'root'
         };
         const instance = new explorerMod.View(cfg);
         let rootChanged = false;
         let root;

         instance.saveOptions(cfg);
         instance._isMounted = true;

         await instance._beforeMount(cfg);
         assert.equal(instance._viewMode, 'tree');
         assert.equal(instance._viewName, explorerMod.View._constants.VIEW_NAMES.tree);
         assert.equal(instance._viewModelConstructor, explorerMod.View._constants.VIEW_MODEL_CONSTRUCTORS.tree);
         assert.isFalse(rootChanged);

         instance._notify = function(eventName, eventValue) {
            if (eventName === 'rootChanged') {
               rootChanged = true;
               root = eventValue[0];
            }
         };
         await instance._setViewMode(newCfg.viewMode, newCfg);
         assert.equal(instance._viewMode, 'search');
         assert.equal(instance._viewName, explorerMod.View._constants.VIEW_NAMES.search);
         assert.equal(instance._viewModelConstructor, explorerMod.View._constants.VIEW_MODEL_CONSTRUCTORS.search);
         assert.isFalse(rootChanged);

         let breadcrumbs = [new entityLib.Model({
            rawData: [
               { id: 1, title: 'item1' }
            ],
            keyProperty: 'id'
         })];
         instance.saveOptions(Object.assign(
            {},
            instance._options,
            {
               searchStartingWith: 'root',
               root: 'test',
               parentProperty: 'id'
            }
         ));
         instance._onBreadcrumbsChanged(null, breadcrumbs);
         instance._viewMode = 'tree';
         await instance._setViewMode(newCfg.viewMode, newCfg);
         assert.isFalse(rootChanged);

         await instance._setViewMode(newCfg2.viewMode, newCfg2);
         assert.equal(instance._viewMode, 'tile');
         assert.equal(instance._viewName, explorerMod.View._constants.VIEW_NAMES.tile);
         assert.equal(instance._viewModelConstructor, explorerMod.View._constants.VIEW_MODEL_CONSTRUCTORS.tile);
         assert.isFalse(rootChanged);

         breadcrumbs = [new entityLib.Model({
            rawData: {
               id: 1,
               title: 'crumb'
            },
            keyProperty: 'id'
         })];
         instance._onBreadcrumbsChanged(null, breadcrumbs);
         instance._setViewMode(newCfg3.viewMode, newCfg3);
         assert.isTrue(rootChanged);
         assert.equal(root, 1);
      });

      it('toggleExpanded', function() {
         var
            explorer = new explorerMod.View({
               viewMode: 'tree'
            }),
            toggleExpandedCalled = false;
         explorer._children.treeControl = {
            toggleExpanded: function(id) {
               toggleExpandedCalled = true;
               assert.equal(id, 'id_toggled_item', 'Invalid key of toggled item.');
            }
         };
         explorer.toggleExpanded('id_toggled_item');
         assert.isTrue(toggleExpandedCalled, 'TreeControl::toggleExpanded not called.');
      });

      it('_beforeMount', function() {
         let instance = new explorerMod.View();
         let cfg = {
            root: 1
         };

         instance._beforeMount(cfg);
         assert.deepEqual({ 1: { markedKey: null } }, instance._restoredMarkedKeys);
      });

      it('sourceController with error', async() => {
         const explorer = new explorerMod.View();
         const sourceWithQueryError = new sourceLib.Memory();
         sourceWithQueryError.query = () => {
            const error = new Error();
            error.processed = true;
            return Promise.reject(error);
         };
         const sourceController = new dataSource.NewSourceController({
            source: sourceWithQueryError
         });
         await sourceController.reload().catch(() => {});

         const explorerOptions = {
            source: sourceWithQueryError,
            sourceController: sourceController,
            root: 1
         };

         explorer._beforeMount(explorerOptions);
         await explorer._itemsPromise;
      });

      describe('_beforeUpdate', function() {
         it('collapses and expands items as needed', async() => {
            const cfg = { viewMode: 'tree', root: null };
            const cfg2 = { viewMode: 'search', root: null };
            const instance = new explorerMod.View(cfg);
            let resetExpandedItemsCalled = false;
            instance._children = {
               treeControl: {
                  resetExpandedItems: () => resetExpandedItemsCalled = true
               }
            };

            instance.saveOptions(cfg);
            instance._viewMode = cfg.viewMode;

            instance._beforeUpdate(cfg2);
            await instance._setViewModePromise;
            assert.isTrue(resetExpandedItemsCalled);

            resetExpandedItemsCalled = false;
            instance._viewMode = cfg2.viewMode;

            instance._beforeUpdate(cfg2);
            await instance._setViewModePromise;
            assert.isTrue(resetExpandedItemsCalled);

            instance._isGoingFront = true;
            instance.saveOptions(cfg);
            instance._beforeUpdate(cfg2);
            assert.isTrue(instance._isGoingFront);
         });

         it('set marker when cancel root changed', () => {
            const cfg = { root: null };
            const instance = new explorerMod.View(cfg);
            let setMarkedKeyArg;
            instance._children = {
               treeControl: {
                  setMarkedKey: (key) => setMarkedKeyArg = key
               }
            };

            instance.saveOptions(cfg);
            instance._potentialMarkedKey = 1;

            instance._beforeUpdate(cfg);
            assert.equal(setMarkedKeyArg, 1);
         });

         it('changes viewMode on items set if both viewMode and root changed(tree -> search)', () => {
            const cfg = { viewMode: 'tree', root: null };
            const cfg2 = { viewMode: 'search' , root: 'abc' };
            const instance = new explorerMod.View(cfg);
            instance._children = {
               treeControl: {
                  resetExpandedItems: () => null
               }
            };

            instance.saveOptions(cfg);
            instance._viewMode = 'tree';

            instance._beforeUpdate(cfg2);
            instance.saveOptions(cfg2);
            assert.strictEqual(instance._pendingViewMode, 'search');
         });

         it('changes viewMode on items set if both viewMode and root changed(tree -> tile)', () => {
            const cfg = { viewMode: 'tree', root: null };
            const cfg2 = { viewMode: 'tile' , root: 'abc' };
            const instance = new explorerMod.View(cfg);
            instance._beforeMount({});
            instance._children = {
               treeControl: {
                  resetExpandedItems: () => null
               }
            };

            instance.saveOptions(cfg);
            instance._viewMode = 'tree';

            instance._beforeUpdate(cfg2);
            instance.saveOptions(cfg2);
            assert.strictEqual(instance._viewMode, 'tree');

            instance._itemsSetCallback();
            assert.strictEqual(instance._viewMode, 'tile');
         });
      });

      describe('_onBreadcrumbsChanged', () => {
         it('fill _restoredMarkedKeys by breadcrumbs', () => {
            // Создаем explorer c с навигацией по курсору, т.к. в
            // _restoredMarkedKeys курсор берется из крошек
            const cfg = {
               nodeProperty: 'type',
               parentProperty: 'parent',
               navigation: {
                  source: 'position',
                  sourceConfig: {
                     field: ['title', 'id']
                  }
               }
            };
            const explorer = new explorerMod.View(cfg);
            explorer.saveOptions(cfg);
            explorer._navigation = cfg.navigation;

            // Создаем данные крошек
            const rootItem = new entityLib.Model({
               keyProperty: 'id',
               rawData: {
                  id: 1,
                  title: 'Title1',
                  type: true,
                  parent: null
               }
            });
            const childItem = new entityLib.Model({
               keyProperty: 'id',
               rawData: {
                  id: 2,
                  title: 'Title2',
                  type: true,
                  parent: 1
               }
            });

            // Эмулируем простановку новых крошек
            explorer._onBreadcrumbsChanged(null, [rootItem, childItem]);
            // _restoredMarkedKeys должен заполнится на основании переданных крошек
            assert.deepEqual(
               explorer._restoredMarkedKeys,
               {
                  null: {
                     markedKey: 1,
                     cursorPosition: ['Title1', 1]
                  },
                  1: {
                     markedKey: 2,
                     parent: null,
                     cursorPosition: ['Title2', 2]
                  },
                  2: {
                     markedKey: null,
                     parent: 1
                  }
               }
            );
         });

         it('set _potentialMarkedKey', () => {
            // Создаем explorer и эмулируем состояние когда от показывает
            // содержимое папки 2го уровня
            const cfg = {
               nodeProperty: 'type',
               parentProperty: 'parent'
            };
            const explorer = new explorerMod.View(cfg);
            explorer.saveOptions(cfg);
            explorer._restoredMarkedKeys = {
               null: {
                  markedKey: 1,
                  cursorPosition: ['Title1', 1]
               },
               1: {
                  markedKey: 2,
                  parent: null,
                  cursorPosition: ['Title2', 2]
               },
               2: {
                  markedKey: null,
                  parent: 1
               }
            };
            explorer._root = 2;

            const rootItem = new entityLib.Model({
               keyProperty: 'id',
               rawData: {
                  id: 1,
                  title: 'Title1',
                  type: true,
                  parent: null
               }
            });

            // Эмулируем простановку хлебных крошек после возврата назад
            explorer._root = 1;
            explorer._isGoingBack = true;
            explorer._onBreadcrumbsChanged(null, [rootItem]);
            // explorer на основании заданного выше _restoredMarkedKeys
            // должен проставить корректный _potentialMarkedKey
            assert.strictEqual(explorer._potentialMarkedKey, 2);
         });
      });

      it('_onBreadCrumbsClick', function() {
         const testBreadCrumbs = new collection.RecordSet({
            rawData: [
               { id: 1, title: 'item1' },
               { id: 2, title: 'item2', parent: 1 },
               { id: 3, title: 'item3', parent: 2 }
            ],
            keyProperty: 'id'
         });
         const instance = new explorerMod.View();
         instance._children = {
            treeControl: {}
         };

         instance.saveOptions({
            parentProperty: 'parent',
            keyProperty: 'id'
         });

         instance._restoredMarkedKeys = {
            null: {
               markedKey: null
            }
         };
         instance._onBreadCrumbsClick({}, testBreadCrumbs.at(0));
         assert.equal(instance._root, testBreadCrumbs.at(0).get('id'));
         instance._onBreadCrumbsClick({}, testBreadCrumbs.at(1));
         assert.equal(instance._root, testBreadCrumbs.at(1).get('id'));
      });

      it('_notifyHandler', function() {
         var
            instance = new explorerMod.View(),
            events = [],
            result;

         instance._notify = function() {
            events.push({
               eventName: arguments[0],
               eventArgs: arguments[1]
            });
            return 123;
         };

         result = instance._notifyHandler({}, 'itemActionsClick', 1, 2);
         instance._notifyHandler({}, 'beforeBeginEdit');
         instance._notifyHandler({}, 'sortingChanged', {field: 'DESC'});
         assert.equal(result, 123);
         assert.equal(events[0].eventName, 'itemActionsClick');
         assert.deepEqual(events[0].eventArgs, [1, 2]);
         assert.equal(events[1].eventName, 'beforeBeginEdit');
         assert.deepEqual(events[1].eventArgs, []);
         assert.equal(events[2].eventName, 'sortingChanged');
         assert.deepEqual(events[2].eventArgs, [{field: 'DESC'}]);
      });

      it('reloadItem', function() {
         let instance = new explorerMod.View();
         let reloadItemCalled = false;
         instance._children = {
            treeControl: {
               reloadItem: function() {
                  reloadItemCalled = true;
               }
            }
         };
         instance.reloadItem();
         assert.isTrue(reloadItemCalled);
      });

      describe('_notify(rootChanged)', function() {
         var
            root,
            isNotified = false,
            isWeNotified = false,
            isNativeClickEventExists = false,

            _notify = function(eName, eArgs) {
               if (eName === 'rootChanged') {
                  isNotified = true;
                  root = eArgs[0];
               }
               if (eName === 'itemClick') {
                  isWeNotified = true;
                  if (eArgs[1] && eArgs[1].nativeEvent) {
                     isNativeClickEventExists = true;
                  }
                  return true;
               }
            };

         it('_beforeUpdate', function() {
            isNotified = false;

            var
               explorer = new explorerMod.View({});
            explorer.saveOptions({});
            explorer._notify = _notify;
            explorer._beforeUpdate({
               root: 1,
               viewMode: null
            });

            assert.isFalse(isNotified);
            isNotified = false;

         });

         it('should do nothing by item click with option ExpandByItemClick', () => {
            const cfg = {
               editingConfig: {},
               expandByItemClick: true
            };
            const explorer = new explorerMod.View(cfg);
            explorer.saveOptions(cfg);

            const rootBefore = explorer._root;
            explorer.commitEdit = () => {
               throw Error('Explorer:commitEdit shouldn\'t be called!')
            };
            const event = { stopPropagation: () => {} };
            const clickEvent = {
               target: {closest: () => {}}
            };
            explorer._children.treeControl = { isEditing: () => false };
            assert.doesNotThrow(() => { explorer._onItemClick(event, { get: () => true  }, clickEvent) });
            assert.equal(rootBefore, explorer._root);
            assert.doesNotThrow(() => { explorer._onItemClick(event, { get: () => false }, clickEvent) });
            assert.equal(rootBefore, explorer._root);
            assert.doesNotThrow(() => { explorer._onItemClick(event, { get: () => null  }, clickEvent) });
            assert.equal(rootBefore, explorer._root);
         });

         it('should open node by item click with option expandByItemClick in search mode', () => {
            const cfg = {
               editingConfig: {},
               expandByItemClick: true,
               nodeProperty: 'node@'
            };
            const explorer = new explorerMod.View(cfg);
            explorer.saveOptions(cfg);
            explorer._viewMode = 'search';
            explorer._restoredMarkedKeys = {
               null: {
                  markedKey: null
               }
            };
            const rootBefore = explorer._root;
            explorer._children = {
               treeControl: {
                  _children: {

                  },
                  commitEdit: () => ({
                     addCallback(callback) {
                        callback();
                        assert.notEqual(rootBefore, explorer._root);
                     }
                  }),
                  isEditing: () => false
               }
            };
            const event = { stopPropagation: () => {} };
            const clickEvent = {
               target: { closest: () => {} }
            };
            const item = {
               get: () => true,
               getKey: () => 'itemId'
            };
            assert.doesNotThrow(() => {
               explorer._onItemClick(event, item, clickEvent);
            });
         });

         it('_onItemClick', async function() {
            isNotified = false;
            isWeNotified = false;

            const successfulCommit = Promise.resolve({});
            const unSuccessfulCommit = Promise.resolve({ validationFailed: true });

            let commitEditResult = successfulCommit;

            var
               explorer = new explorerMod.View({
                  editingConfig: {}
               }),
               isEventResultReturns = false,
               isPropagationStopped = isNotified = isNativeClickEventExists = false;
            explorer._beforeMount({});
            explorer._isMounted = true;

            explorer.saveOptions({
               editingConfig: {}
            });
            explorer._notify = (eName, eArgs) => {
               if (eName === 'itemClick') {
                  assert.equal(3, eArgs[2]);
               }
               return _notify(eName, eArgs);
            };
            explorer._restoredMarkedKeys = {
               null: {
                  markedKey: null
               }
            };
            explorer._children = {
               treeControl: {
                  _children: {
                  },
                  isEditing: () => false,
                  commitEdit: () => commitEditResult
               }
            };
            await (new Promise((res) => {
               isEventResultReturns = explorer._onItemClick(
                  {
                     stopPropagation: function() {
                        isPropagationStopped = true;
                     }
                  },
                  {
                     get: function() {
                        return true;
                     },
                     getKey: function() {
                        return 'itemId';
                     }
                  },
                  {
                     nativeEvent: 123
                  },
                  3
               );

               setTimeout(() => {
                  res();
               }, 0);
            }));

            assert.isFalse(isEventResultReturns);
            assert.isTrue(isPropagationStopped);
            // Click
            assert.isTrue(isWeNotified);
            // RootChanged
            assert.equal(root, 'itemId');
            assert.isTrue(isNotified);

            /* https://online.sbis.ru/opendoc.html?guid=3523e32f-2bb3-4ed4-8b0f-cde55cb81f75 */
            assert.isTrue(isNativeClickEventExists);


            // if return false
            explorer._notify = function() {
               return false;
            };

            isPropagationStopped = false;

            await new Promise((res) => {
               explorer._onItemClick({
                  stopPropagation: function () {
                     isPropagationStopped = true;
                  }
               }, {
                  get: function () {
                     return true;
                  },
                  getId: function () {
                     return 'itemIdOneMore';
                  }
               }, {
                  nativeEvent: 123
               });
               setTimeout(() => {
                  res();
               }, 0);
            });

            assert.isTrue(isPropagationStopped);
            // Root wasn't changed
            assert.equal(root, 'itemId');


            explorer._notify = () => true;
            commitEditResult = unSuccessfulCommit;
            isPropagationStopped = false;

            await new Promise((res) => {
               explorer._onItemClick({
                  stopPropagation: () => {
                     isPropagationStopped = true;
                  }
               }, {
                  get: () => true,
                  getKey: () => 'itemIdOneMore'
               }, {
                  nativeEvent: 123
               });
               setTimeout(() => {
                  res();
               }, 0);
            });

            assert.isTrue(isPropagationStopped);
            // Root wasn't changed
            assert.equal(root, 'itemId');

            explorer._isGoingFront = false;
            explorer.saveOptions({
               searchNavigationMode: 'expand'
            });
            await new Promise((res) => {
               explorer._onItemClick({
                  stopPropagation: () => {
                     isPropagationStopped = true;
                  }
               }, {
                  get: () => true,
                  getKey: () => 'itemIdOneMore'
               }, {
                  nativeEvent: 123
               });
               setTimeout(() => {
                  res();
               }, 0);
            });
            assert.isFalse(explorer._isGoingFront);
         });

         it('_onBreadCrumbsClick', function() {
            isNotified = false;
            root = undefined;

            var explorer = new explorerMod.View({});
            explorer.saveOptions({});
            explorer._isMounted = true;
            explorer._notify = _notify;
            explorer._children = {
               treeControl: {

               }
            };

            explorer._restoredMarkedKeys = {
               null: {
                  markedKey: null,
                  cursorPosition: '0'
               },
               itemId: { parent: null, cursorPosition: '1', markedKey: 'itemId1' },
               itemId1: { parent: 'itemId', cursorPosition: '2', markedKey: null }
            };
            explorer._root = 'itemId1';
            explorer._isGoingBack = false;

            explorer._onBreadCrumbsClick({}, {
               getKey: function() {
                  return 'itemId';
               }
            });

            // После клика по хлебным крошкам должно:
            // 1. Послаться событие rootChanged
            assert.isTrue(isNotified);
            // 1.1 В событии должен быть root кликнутой хлебной крошки
            assert.strictEqual(root, 'itemId');
            // 2. explorer должен переключиться в режим _isGoingBack
            assert.isTrue(explorer._isGoingBack);
            // 3. root в самом explorer должен смениться на id крошки
            assert.strictEqual(explorer._getRoot(explorer._options.root), 'itemId');
         });
      });

      describe('EditInPlace', function() {
         it('beginEdit', function() {
            var opt = {
               test: '123'
            };
            var
               instance = new explorerMod.View({});
            instance._children = {
               treeControl: {
                  beginEdit: function(options) {
                     assert.equal(opt, options);
                     return Deferred.success();
                  }
               }
            };
            var result = instance.beginEdit(opt);
            assert.instanceOf(result, Deferred);
            assert.isTrue(result.isSuccessful());
         });

         it('beginAdd', function() {
            var opt = {
               test: '123'
            };
            var
               instance = new explorerMod.View({});
            instance._children = {
               treeControl: {
                  beginAdd: function(options) {
                     assert.equal(opt, options);
                     return Deferred.success();
                  }
               }
            };
            var result = instance.beginAdd(opt);
            assert.instanceOf(result, Deferred);
            assert.isTrue(result.isSuccessful());
         });

         it('cancelEdit', function() {
            var
               instance = new explorerMod.View({});
            instance._children = {
               treeControl: {
                  cancelEdit: function() {
                     return Deferred.success();
                  }
               }
            };
            var result = instance.cancelEdit();
            assert.instanceOf(result, Deferred);
            assert.isTrue(result.isSuccessful());
         });

         it('commitEdit', function() {
            var
               instance = new explorerMod.View({});
            instance._children = {
               treeControl: {
                  commitEdit: function() {
                     return Deferred.success();
                  }
               }
            };
            var result = instance.commitEdit();
            assert.instanceOf(result, Deferred);
            assert.isTrue(result.isSuccessful());
         });
      });

      describe('DragNDrop', function() {
         var
            explorer,
            explorerCfg = {
               parentProperty: 'parent',
               root: null,
               itemsDragNDrop: true,
            };

         beforeEach(function() {
            var
               items = new collection.RecordSet({
                  rawData: [
                     { id: 1, title: 'item1', parent: null },
                     { id: 2, title: 'item2', parent: 1 },
                     { id: 3, title: 'item3', parent: 2 }
                  ],
                  keyProperty: 'id'
               });

            explorer = new explorerMod.View(explorerCfg);

            explorer.saveOptions(explorerCfg);
            explorer._beforeMount(explorerCfg);
            explorer._onBreadcrumbsChanged(null, []);
            explorer._items = items;
         });

         it('_hoveredCrumbChanged', function() {
            var hoveredBreadCrumb = new entityLib.Model({
                  rawData: {
                     id: 1
                  },
                  keyProperty: 'id'
               }),
                explorer = new explorerMod.View({});

            explorer._hoveredCrumbChanged({}, hoveredBreadCrumb);
            assert.equal(explorer._hoveredBreadCrumb, hoveredBreadCrumb.get('id'));
         });
         it('dragItemsFromRoot', function() {

            //item from the root
            assert.isTrue(explorer._dragItemsFromRoot([1]));

            //item is not from the root
            assert.isFalse(explorer._dragItemsFromRoot([2]));

            //item is not from the root and from the root
            assert.isFalse(explorer._dragItemsFromRoot([1, 2]));

            //an item that is not in the list.
            assert.isFalse(explorer._dragItemsFromRoot([4]));
         });
         it('_dragHighlighter', function() {
            explorer._hoveredBreadCrumb = 2;

            assert.equal(explorer._dragHighlighter(), '');

            explorer._dragOnBreadCrumbs = true;
            assert.equal(explorer._dragHighlighter(1), '');
            assert.equal(explorer._dragHighlighter(2), 'controls-BreadCrumbsView__dropTarget_withoutArrow');
            assert.equal(explorer._dragHighlighter(2, true), 'controls-BreadCrumbsView__dropTarget_withArrow');
            assert.equal(explorer._dragHighlighter('dots'), '');
         });
         it('_documentDragStart', function() {
            var dcid = 'test-id';
            explorer._dragControlId = dcid;

            explorer._documentDragStart({}, {
               entity: 'notDragEntity'
            });
            assert.isFalse(explorer._dragOnBreadCrumbs);

            //drag in the root
            explorer._dragOnBreadCrumbs = false;
            explorer._documentDragStart({}, {
               entity: dragEntity([1], dcid)
            });
            assert.isFalse(explorer._dragOnBreadCrumbs);

            explorer._dragOnBreadCrumbs = false;
            explorer._documentDragStart({}, {
               entity: dragEntity([2], dcid)
            });
            assert.isTrue(explorer._dragOnBreadCrumbs);

            explorer._dragOnBreadCrumbs = false;
            explorer._options.itemsDragNDrop = false;
            explorer._documentDragStart({}, {
               entity: dragEntity([2], dcid)
            });
            assert.isFalse(explorer._dragOnBreadCrumbs);
            explorer._options.itemsDragNDrop = true;

            //drag not in root
            explorer._options.root = 'notnull';

            explorer._dragOnBreadCrumbs = false;
            explorer._documentDragStart({}, {
               entity: dragEntity([1], dcid)
            });
            assert.isTrue(explorer._dragOnBreadCrumbs);

            explorer._dragOnBreadCrumbs = false;
            explorer._documentDragStart({}, {
               entity: dragEntity([2], dcid)
            });
            assert.isTrue(explorer._dragOnBreadCrumbs);

            // ignore drag entities with wrong dragControlId
            explorer._dragOnBreadCrumbs = false;
            explorer._documentDragStart({}, {
               entity: dragEntity([2], 'wrong-id')
            });
            assert.isFalse(explorer._dragOnBreadCrumbs);

            explorerCfg.parentProperty = undefined;
            explorer.saveOptions(explorerCfg);
            explorer._documentDragStart({}, {
               entity: dragEntity([2], dcid)
            });
            assert.isFalse(explorer._dragOnBreadCrumbs);
         });
         it('_documentDragEnd', function() {
            var
               dragEnrArgs,
               dragEntity = new dragnDrop.ItemsEntity();

            explorer._notify = function(e, args) {
               if (e === 'dragEnd') {
                  dragEnrArgs = args;
               }
            };
            explorer._dragOnBreadCrumbs = true;

            explorer._documentDragEnd({}, {});
            assert.equal(dragEnrArgs, undefined);
            assert.isFalse(explorer._dragOnBreadCrumbs);

            explorer._hoveredBreadCrumb = 'hoveredItemKey';
            explorer._documentDragEnd({}, {
               entity: dragEntity
            });
            assert.equal(dragEnrArgs[0], dragEntity);
            assert.equal(dragEnrArgs[1], 'hoveredItemKey');
            assert.equal(dragEnrArgs[2], 'on');
         });
      });

      describe('restore position navigation when going back', () => {
         it('_private::isCursorNavigation', () => {
            assert.isFalse(GlobalView._isCursorNavigation({}));
            assert.isFalse(GlobalView._isCursorNavigation({}));
            assert.isFalse(GlobalView._isCursorNavigation({
               source: 'page'
            }));

            assert.isTrue(GlobalView._isCursorNavigation({
               source: 'position'
            }));
         });

         it('_private::getCursorPositionFor', () => {
            const item = new entityLib.Model({
               keyProperty: 'id',
               rawData: {
                  id: 12,
                  title: 'Title'
               }
            });
            const navigation = {
               sourceConfig: {
                  field: 'id'
               }
            };

            assert.deepEqual(
                GlobalView._getCursorPositionFor(item, navigation),
               [12]
            );

            navigation.sourceConfig.field = ['id'];
            assert.deepEqual(
                GlobalView._getCursorPositionFor(item, navigation),
               [12]
            );

            navigation.sourceConfig.field = ['id', 'title'];
            assert.deepEqual(
                GlobalView._getCursorPositionFor(item, navigation),
               [12, 'Title']
            );
         });

         it('step back', () => {
            const root = new entityLib.Model({
               keyProperty: 'id',
               rawData: {
                  id: null,
               }
            });
            const rootItem = new entityLib.Model({
               keyProperty: 'id',
               rawData: {
                  id: 1,
                  title: 'Title1',
                  type: true,
                  parent: null
               }
            });
            const childItem = new entityLib.Model({
               keyProperty: 'id',
               rawData: {
                  id: 2,
                  title: 'Title2',
                  type: true,
                  parent: 1
               }
            });

            const cfg = {
               keyProperty: 'id',
               nodeProperty: 'type',
               parentProperty: 'parent',
               navigation: {
                  source: 'position',
                  sourceConfig: {
                     field: ['title', 'id']
                  }
               }
            };
            // Создаем explorer с навигацией по курсору и с текущим корнем в папке с id 2
            const explorer = new explorerMod.View(cfg);
            explorer.saveOptions(cfg);
            explorer._navigation = cfg.navigation;
            explorer._restoredMarkedKeys = {
               null: {
                  markedKey: 1,
                  cursorPosition: ['Title1', 1]
               },
               1: {
                  markedKey: 2,
                  parent: null,
                  cursorPosition: ['Title2', 2]
               },
               2: {
                  markedKey: null,
                  parent: 1
               }
            };
            explorer._forceUpdate = () => undefined;

            // Сразу из текущий папки возвращаемся в самый верхний корень
            explorer._onBreadCrumbsClick(null, root);
            // В соответствии с _restoredMarkedKeys position должен выставиться в
            // ['Title1', 1]
            assert.deepEqual(
               explorer._navigation.sourceConfig.position,
               ['Title1', 1]
            );

            // Восстанавливаем состояние к исходному
            explorer._restoredMarkedKeys = {
               null: {
                  markedKey: 1,
                  cursorPosition: ['Title1', 1]
               },
               1: {
                  markedKey: 2,
                  parent: null,
                  cursorPosition: ['Title2', 2]
               },
               2: {
                  markedKey: null,
                  parent: 1
               }
            };
            // Возвращаемся в rootItem
            explorer._onBreadCrumbsClick(null, rootItem);
            // В соответствии с _restoredMarkedKeys position должен выставиться в
            // ['Title2', 2]
            assert.deepEqual(
               explorer._navigation.sourceConfig.position,
               ['Title2', 2]
            );

            // Возвращаемся в самый верхний корень
            explorer._onBreadCrumbsClick(null, root);
            // В соответствии с _restoredMarkedKeys position должен выставиться в
            // ['Title1', 1]
            assert.deepEqual(
               explorer._navigation.sourceConfig.position,
               ['Title1', 1]
            );
         });
      });
   });
});
