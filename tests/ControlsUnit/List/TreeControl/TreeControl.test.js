define([
   'Controls/treeGrid',
   'Controls/list',
   'Core/Deferred',
   'Core/core-merge',
   'Core/core-instance',
   'Env/Env',
   'Types/collection',
   'Types/source',
   'Controls/Application/SettingsController'
], function(
   treeGrid,
   listMod,
   Deferred,
   cMerge,
   cInstance,
   Env,
   collection,
   sourceLib,
   SettingsController
) {
   function correctCreateTreeControl(cfg) {
      var
         treeControl,
         baseControl,
         treeBeforeUpdate,
         cfgBaseControl,
         cfgTreeControl = cMerge(cfg, {
            viewModelConstructor: treeGrid.ViewModel
         });
      cfgTreeControl = Object.assign(treeGrid.TreeControl.getDefaultOptions(), cfgTreeControl);
      treeControl = new treeGrid.TreeControl(cfgTreeControl);
      treeControl.saveOptions(cfgTreeControl);
      treeControl._beforeMount(cfgTreeControl);
      cfgBaseControl = cMerge(cfgTreeControl, {
         beforeReloadCallback: treeControl._beforeReloadCallback,
         afterReloadCallback: treeControl._afterReloadCallback
      });
      baseControl = new listMod.BaseControl(cfgBaseControl);
      baseControl.saveOptions(cfgBaseControl);
      baseControl.cancelEdit = function() {};
      baseControl._beforeMount(cfgBaseControl);
      treeControl._children = {
         baseControl: baseControl
      };
      treeBeforeUpdate = treeControl._beforeUpdate;
      treeControl._beforeUpdate = function() {
         treeBeforeUpdate.apply(treeControl, arguments);
         baseControl._beforeUpdate(treeControl._options);
      };
      return treeControl;
   }

   function getHierarchyData() {
      return [
         {id: 0, 'Раздел@': true, "Раздел": null},
         {id: 1, 'Раздел@': true, "Раздел": 0},
         {id: 2, 'Раздел@': null, "Раздел": 0},
         {id: 3, 'Раздел@': null, "Раздел": 1},
         {id: 4, 'Раздел@': null, "Раздел": null}
      ];
   }

   describe('Controls.List.TreeControl', function() {
      it('TreeControl creating with expandedItems', function() {
         return new Promise(function(resolve, reject) {
            correctCreateTreeControl({
               columns: [],
               source: new sourceLib.Memory({
                  data: [{
                     id: 111,
                     parent: null
                  },
                  {
                     id: 111111,
                     parent: 111
                  },
                  {
                     id: 777,
                     parent: null
                  },
                  {
                     id: 777777,
                     parent: 777
                  }],
                  keyProperty: 'id',
                  filter: function(item, filter) {
                     for (var i = 0; i < filter.parent.length; i++) {
                        if (item.get('parent') === filter.parent[i]) {
                           return true;
                        }
                     }
                     return false;
                  }
               }),
               expandedItems: [777],
               keyProperty: 'id',
               parentProperty: 'parent',
               dataLoadCallback: function(items) {
                  try {
                     assert.deepEqual(items.getRawData(), [{
                        id: 111,
                        parent: null
                     },
                     {
                        id: 777,
                        parent: null
                     },
                     {
                        id: 777777,
                        parent: 777
                     }], 'Invalid items value after reload with expandedItems');
                     resolve();
                  } catch(e) {
                     reject(e);
                  }
               }
            });
         });
      });

      it('afterReloadCallback before mounting should not cause errors', function() {

         //по сценарию https://online.sbis.ru/opendoc.html?guid=8237131f-3294-4704-92a5-fe448e40bf50
         let tree =  new treeGrid.TreeControl({viewModelConstructor: treeGrid.ViewModel});
         treeGrid.TreeControl._private.afterReloadCallback(tree);
      });
      it('TreeControl._private.toggleExpanded', function() {
         var
            nodeLoadCallbackCalled = false,
            treeControl = correctCreateTreeControl({
               columns: [],
               source: new sourceLib.Memory({
                  data: [],
                  keyProperty: 'id'
               }),
               nodeLoadCallback: function() {
                  nodeLoadCallbackCalled = true;
               }
            });
         var isSourceControllerUsed = false;

         var originalCreateSourceController = treeGrid.TreeControl._private.createSourceController;
         treeGrid.TreeControl._private.createSourceController = function() {
            return {
               load: function() {
                  isSourceControllerUsed = true;
                  return Deferred.success([]);
               },
               hasMoreData: function () {
                  return false;
               }
            };
         };

         //viewmodel moch
         treeControl._children.baseControl.getViewModel = function() {
            return {
               getExpandedItems: function() {
                  return [1];
               },
               toggleExpanded: function(){},
               isExpandAll: function() {
                  return false;
               },
               resetExpandedItems: function() {},
               isExpanded: function() {
                  return false;
               },
               getChildren: function() {return [1]},
               getIndexByKey: function() {

               },
               getCount:function(){
                  return 2;
               },
               setHasMoreStorage: function() {},
               appendItems: function() {},
               mergeItems: function() {}
            };
         };

         treeControl._children.baseControl.getVirtualScroll = function(){
            return {
               ItemsCount: 0,
               updateItemsIndexesOnToggle: function() {
               }
            };
         };

         treeControl._nodesSourceControllers = new Map([
            [
               1,
               treeGrid.TreeControl._private.createSourceController()
            ]
         ]);

         // Test
         return new Promise(function(resolve) {
            treeGrid.TreeControl._private.toggleExpanded(treeControl, {
               getContents: function() {
                  return {
                     getId: function() {
                        return 1;
                     }
                  };
               },
               isRoot: function() {
                  return false;
               }
            });
            assert.isFalse(isSourceControllerUsed);
            assert.isFalse(nodeLoadCallbackCalled);
            treeGrid.TreeControl._private.toggleExpanded(treeControl, {
               getContents: function() {
                  return {
                     getId: function() {
                        return 2;
                     }
                  };
               },
               isRoot: function() {
                  return false;
               }
            });
            assert.isTrue(isSourceControllerUsed);
            assert.isTrue(nodeLoadCallbackCalled);
            treeGrid.TreeControl._private.createSourceController = originalCreateSourceController;
            resolve();
         });
      });
      it('expandMarkedItem', function() {
         var
            toggleExpandedStack = [],
            rawData =  [{
                key: 1,
                parent: null,
                type: true
            }, {
                key: 2,
                parent: null,
                type: false
            }, {
                key: 3,
                parent: null,
                type: null
            }],
            cfg = {
               columns: [],
               source: new sourceLib.HierarchicalMemory({
                  data: rawData,
                  keyProperty: 'key'
               }),
               keyProperty: 'key',
               nodeProperty: 'type',
               parentProperty: 'parent',
               markedKey: 1
            },
            treeControl = correctCreateTreeControl(cfg);
         treeControl.toggleExpanded = function(key) {
            toggleExpandedStack.push(key);
         };
         var model = treeControl._children.baseControl.getViewModel();
         model.setItems(new collection.RecordSet({
            rawData: rawData,
            keyProperty: 'key'
         }));
         treeGrid.TreeControl._private.expandMarkedItem(treeControl);
         model.setMarkedKey(2);
         treeGrid.TreeControl._private.expandMarkedItem(treeControl);
         model.setMarkedKey(3);
         treeGrid.TreeControl._private.expandMarkedItem(treeControl);
         assert.deepEqual(toggleExpandedStack, [1, 2]);
      });
      describe('itemMouseMove calls nodeMouseMove when dragging', function() {
         let tree = correctCreateTreeControl({
            columns: [],
            source: new sourceLib.Memory({
               data: [],
               keyProperty: 'id'
            })
         });
         let nodeMouseMoveCalled;
         let dragEntity;
         let dragItemData;
         let nodeItem = {
            dispItem: {
               isNode: function () {
                  return true;
               }
            }
         };
         let leafItem = {
            dispItem: {
               isNode: function () {
                  return false;
               }
            }
         };
         const event = {
            stopped: false,
            stopPropagation(){
               this.stopped = true;
            }
         };
         let model = tree._children.baseControl.getViewModel();
         model.getDragEntity = function () {
            return dragEntity;
         };
         model.getDragItemData = function () {
            return dragItemData;
         };
         tree._nodeMouseMove = function() {
            nodeMouseMoveCalled = true;
         };
         beforeEach(function() {
            nodeMouseMoveCalled = false;
            dragItemData = null;
            dragEntity = null;
            event.stopped = false;
         });
         it('dragEntity', function() {
            dragEntity = {};
            tree._draggingItemMouseMove(event, leafItem, {});
            assert.isFalse(nodeMouseMoveCalled);
            assert.isTrue(event.stopped);
            event.stopped = false;
            tree._draggingItemMouseMove(event, nodeItem, {});
            assert.isTrue(nodeMouseMoveCalled);
            assert.isTrue(event.stopped);
         });
         it('dragItemData', function() {
            dragItemData = {};
            tree._draggingItemMouseMove(event, leafItem, {});
            assert.isFalse(nodeMouseMoveCalled);
            assert.isTrue(event.stopped);
            event.stopped = false;
            tree._draggingItemMouseMove(event, nodeItem, {});
            assert.isTrue(nodeMouseMoveCalled);
            assert.isTrue(event.stopped);
         });
      });
      describe('expanding nodes on dragging', function() {
         let treeControl = correctCreateTreeControl({
               columns: [],
               source: new sourceLib.Memory({
                  data: [],
                  keyProperty: 'id'
               })
            }),
            itemData = {isExpanded: false},
            toggleExpandedCalled = false;

         treeControl._expandNodeOnDrag = function(itemData) {
            if (!itemData.isExpanded) {
               toggleExpandedCalled = true;
            }
         }

         it('clearTimeoutForExpandOnDrag on dragEnd', function(done) {
            treeControl._setTimeoutForExpandOnDrag(itemData);
            assert.isFalse(toggleExpandedCalled);
            assert.notEqual(treeControl._timeoutForExpandOnDrag, null);
            treeControl._dragEnd();
            assert.equal(treeControl._timeoutForExpandOnDrag, null);
            setTimeout(function() {
               assert.isFalse(toggleExpandedCalled);
               done();
            }, 1000);
         });

         it('clearTimeoutForExpandOnDrag on itemMouseLeave', function(done) {
            itemData = {isExpanded: false};
            toggleExpandedCalled = false;

            treeControl._setTimeoutForExpandOnDrag(itemData);
            assert.isFalse(toggleExpandedCalled);
            assert.notEqual(treeControl._timeoutForExpandOnDrag, null);
            treeControl._draggingItemMouseLeave();
            assert.equal(treeControl._timeoutForExpandOnDrag, null);
            setTimeout(function() {
               assert.isFalse(toggleExpandedCalled);
               done();
            }, 1000);
         });

         it('ExpandOnDrag on collapsed', function(done) {
            itemData = {isExpanded: false};
            toggleExpandedCalled = false;
            treeControl._setTimeoutForExpandOnDrag(itemData);
            assert.isFalse(toggleExpandedCalled);
            assert.notEqual(treeControl._timeoutForExpandOnDrag, null);
            setTimeout(function() {
               assert.isTrue(toggleExpandedCalled);
               done();
            }, 1000);
         });
         it('ExpandOnDrag on expanded', function(done) {
            toggleExpandedCalled = false;
            itemData.isExpanded = true;
            treeControl._setTimeoutForExpandOnDrag(itemData);
            assert.isFalse(toggleExpandedCalled);
            assert.notEqual(treeControl._timeoutForExpandOnDrag, null);
            setTimeout(function() {
               assert.isFalse(toggleExpandedCalled);
               done();
            }, 1000);
         });
      });
      it('nodeMouseMove does not call setDragTargetPosition if dragItemData is null', function() {
         let tree = correctCreateTreeControl({
            columns: [],
            source: new sourceLib.Memory({
               data: [],
               idProperty: 'id'
            })
         });
         let nodeItem = {
            nodeProperty: 'node',
            item: {
               get: function () {
                  return true;
               }
            },
            isExpanded: true,
            dispItem: {
               isNode: function () {
                  return true;
               }
            }
         };
         let target = {
            getBoundingClientRect: function () {
               return {
                  top: 10,
                  height: 10
               };
            }
         }
         let event = {
            target: {
               closest: function() {
                  return target;
               }
            },
            nativeEvent: {
               pageY: 15,
            }
         }
         let model = tree._children.baseControl.getViewModel();

         model.getDragItemData = function () {
            return null;
         };
         let setDragTargetPositionCalled = false;
         model.setDragTargetPosition = function() {
            setDragTargetPositionCalled = true;
         };
         tree._nodeMouseMove(nodeItem, event);
         assert.isFalse(setDragTargetPositionCalled);
      });

      it('TreeControl.toggleExpanded with sorting', function() {
         let treeControl = correctCreateTreeControl({
            columns: [],
            root: null,
            sorting: [{sortField: 'DESC'}],
            source: new sourceLib.Memory({
               data: [],
               keyProperty: 'id'
            })
         });
         let expandSorting;
         let originalCreateSourceController = treeGrid.TreeControl._private.createSourceController;
         treeGrid.TreeControl._private.createSourceController = function() {
            return {
               load: function(filter, sorting) {
                  var result = Deferred.success([]);
                  expandSorting = sorting;
                  return result
               }
            }
         };

         treeGrid.TreeControl._private.toggleExpanded(treeControl, {
            getContents: function() {
               return {
                  getId: function() {
                     return 1;
                  }
               };
            },
            isRoot: function() {
               return false;
            }
         });
         treeGrid.TreeControl._private.createSourceController = originalCreateSourceController;

         assert.deepEqual([{sortField: 'DESC'}], expandSorting);
      });

      it('_private.shouldLoadChildren', function() {
         const
            source = new sourceLib.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: 'leaf',
                     title: 'Leaf',
                     parent: null,
                     nodeType: null,
                     hasChildren: false
                  },
                  {
                     id: 'node_has_loaded_children',
                     title: 'Has Loaded Children',
                     parent: null,
                     nodeType: true,
                     hasChildren: true
                  },
                  {
                     id: 'node_has_unloaded_children',
                     title: 'Has Unloaded Children',
                     parent: null,
                     nodeType: true,
                     hasChildren: true
                  },
                  {
                     id: 'node_has_no_children',
                     title: 'Has No Children',
                     parent: null,
                     nodeType: true,
                     hasChildren: false
                  },
                  {
                     id: 'leaf_2',
                     title: 'Leaf 2',
                     parent: 'node_has_loaded_children',
                     nodeType: null,
                     hasChildren: false
                  },
                  {
                     id: 'leaf_3',
                     title: 'Leaf 3',
                     parent: 'node_has_unloaded_children',
                     nodeType: null,
                     hasChildren: false
                  }
               ],
               filter: function(item, where) {
                  if (!where.parent) {
                     // Эмулируем метод БЛ, который по запросу корня возвращает еще и подзаписи родителя
                     // с ключом node_has_loaded_children
                     return !item.get('parent') || item.get('parent') === 'node_has_loaded_children';
                  }
                  return item.get('parent') === where.parent;
               }
            }),
            originalQuery = source.query;
         source.query = function() {
            return originalQuery.apply(this, arguments).addCallback(function(items) {
               let moreDataRs = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     {
                        id: 'node_has_loaded_children',
                        nav_result: false
                     },
                     {
                        id: 'node_has_no_children',
                        nav_result: true
                     }
                  ]
               });
               let rawData = items.getRawData();
               rawData.meta.more = moreDataRs;
               items.setRawData(rawData);
               return items;
            });
         };
         const
            treeControl = correctCreateTreeControl({
               columns: [],
               parentProperty: 'parent',
               nodeProperty: 'nodeType',
               hasChildrenProperty: 'hasChildren',
               source: source
            }),
            shouldLoadChildrenResult = {
               'node_has_loaded_children': false,
               'node_has_unloaded_children': true,
               'node_has_no_children': true
            };
         return new Promise(function(resolve) {
            setTimeout(function() {
               for (const nodeKey in shouldLoadChildrenResult) {
                  const
                     expectedResult = shouldLoadChildrenResult[nodeKey];
                  assert.strictEqual(
                     treeGrid.TreeControl._private.shouldLoadChildren(treeControl, nodeKey),
                     expectedResult,
                     '_private.shouldLoadChildren returns unexpected result for ' + nodeKey
                  );
               }
               resolve();
            }, 10);
         });
      });

      it('toggleExpanded does not load if shouldLoadChildren===false', function() {
         const
            treeControl = correctCreateTreeControl({
               columns: [],
               root: null,
               sorting: [{sortField: 'DESC'}],
               source: new sourceLib.Memory({
                  data: [],
                  keyProperty: 'id'
               })
            }),
            originalCreateSourceController = treeGrid.TreeControl._private.createSourceController,
            originalShouldLoadChildren = treeGrid.TreeControl._private.shouldLoadChildren,
            model = treeControl._children.baseControl.getViewModel(),
            fakeDispItem = {
               getContents: function() {
                  return {
                     getId: function() {
                        return 1;
                     }
                  };
               },
               isRoot: function() {
                  return false;
               }
            };

         let
            loadedDataFromServer = false,
            expandedCorrectItem = false,
            expandedCorrectState = false;

         treeGrid.TreeControl._private.createSourceController = function() {
            return {
               load: function() {
                  loadedDataFromServer = true;
                  return Deferred.success([]);
               }
            };
         };

         treeGrid.TreeControl._private.shouldLoadChildren = function() {
            return false;
         };

         model.toggleExpanded = function(item, expanded) {
            expandedCorrectItem = item === fakeDispItem;
            expandedCorrectState = expanded === true;
         };

         treeGrid.TreeControl._private.toggleExpanded(treeControl, fakeDispItem);

         treeGrid.TreeControl._private.createSourceController = originalCreateSourceController;
         treeGrid.TreeControl._private.shouldLoadChildren = originalShouldLoadChildren;

         assert.isFalse(loadedDataFromServer);
         assert.isTrue(expandedCorrectItem);
         assert.isTrue(expandedCorrectState);
      });

      it('_private.isDeepReload', function() {
         assert.isFalse(!!treeGrid.TreeControl._private.isDeepReload({}, false));
         assert.isTrue(!!treeGrid.TreeControl._private.isDeepReload({}, true));

         assert.isTrue(!!treeGrid.TreeControl._private.isDeepReload({ deepReload: true }, false));
         assert.isFalse(!!treeGrid.TreeControl._private.isDeepReload({ deepReload: false}, false));
      });

      it('TreeControl.reload', function(done) {
         var treeControl = correctCreateTreeControl({
               columns: [],
               source: new sourceLib.Memory({
                  data: [],
                  keyProperty: 'id'
               })
            });
         var isSourceControllerNode1Destroyed = false;
         var isSourceControllerNode2Destroyed = false;
         var vmHasMoreStorage = null;

         //viewmodel moch
         treeControl._children.baseControl.getViewModel = function() {
            return {
               setHasMoreStorage: function (hms) {
                  vmHasMoreStorage = hms;
               },
               getExpandedItems: function() {
                  return [1];
               },
               isExpandAll: function() {
                  return false;
               },
               resetExpandedItems: function() {

               },
               getItems: function() {
                  return {
                     at: function () {}
                  };
               }
            };
         };

         treeControl._nodesSourceControllers = new Map([
            [
               1,
               {
                  destroy: function() {
                     isSourceControllerNode1Destroyed = true;
                  },
                  hasMoreData: function() {
                     return false;
                  }
               }
            ],
            [
               2,
               {
                  destroy: function() {
                     isSourceControllerNode2Destroyed = true;
                  },
                  hasMoreData: function() {
                     return true;
                  }
               }
            ]
         ]);

         setTimeout(function() {
            assert.isTrue(treeControl._nodesSourceControllers.get(2).hasMoreData());
            treeControl.reload();
            setTimeout(function() {
               assert.equal(treeControl._nodesSourceControllers.size, 1, 'Invalid value "_nodesSourceControllers" after call "treeControl.reload()".');
               assert.isFalse(isSourceControllerNode1Destroyed, 'Invalid value "isSourceControllerNode1Destroyed" after call "treeControl.reload()".');
               assert.isTrue(isSourceControllerNode2Destroyed, 'Invalid value "isSourceControllerNode2Destroyed" after call "treeControl.reload()".');
               assert.deepEqual({1: false}, vmHasMoreStorage);
               done();
            }, 10);
         }, 10);
      });


      it('TreeControl._afterUpdate', function() {
         var source = new sourceLib.Memory({
            data: [],
            keyProperty: 'id'
         });
         var treeControl = correctCreateTreeControl({
            columns: [],
            root: 1,
            parentProperty: 'testParentProperty',
            source: source
         });
         var treeViewModel = treeControl._children.baseControl.getViewModel();
         var isNeedForceUpdate = false;
         var sourceControllersCleared = false;
         var clearNodesSourceControllersOriginal = treeGrid.TreeControl._private.clearNodesSourceControllers;
         var beforeReloadCallbackOriginal = treeGrid.TreeControl._private.beforeReloadCallback;
         var reloadFilter;
         var beforeReloadCallback = function() {
            var filter = arguments[0];
            beforeReloadCallbackOriginal(treeControl, filter, null, null, treeControl._options);
            reloadFilter = filter;
         };

         // Mock TreeViewModel and TreeControl
         treeControl._updatedRoot = true;
         treeControl._children.baseControl._options.beforeReloadCallback = beforeReloadCallback;
         treeGrid.TreeControl._private.clearNodesSourceControllers = () => {
            sourceControllersCleared = true;
         };
         treeViewModel._model._display = {
            setFilter: () => {},
            destroy: () => {},
            setRoot: (root) => {
               treeViewModel._model._root = root;
            },
            getRoot: () => {
               return {
                  getContents: () => {
                     return treeViewModel._model._root;
                  }
               };
            },
            subscribe: () => {},
            unsubscribe: () => {}
         };

         // Need to know that list notifies when he has been changed after setting new root by treeControl._afterUpdate
         treeViewModel._model._notify = (e) => {
            if (e === 'onListChange') {
               isNeedForceUpdate = true;
            }
         };

         // Chack that values before test are right
         treeViewModel.setExpandedItems([1, 3]);
         assert.deepEqual([1, 3], treeViewModel.getExpandedItems());
         assert.equal(1, treeControl._options.root);

         var resetExpandedItemsCalled = false;
         treeViewModel.resetExpandedItems = function() {
            resetExpandedItemsCalled = true;
         };

         // Test
         return new Promise(function(resolve) {
            setTimeout(function() {
               treeControl._options.root = undefined;
               treeControl._root = 12;
               let sourceController = treeControl._children.baseControl._sourceController;
               treeControl._afterUpdate({filter: {}, source: source});
               setTimeout(function() {
                  assert.deepEqual([], treeViewModel.getExpandedItems());
                  assert.equal(12, treeViewModel._model._root);
                  assert.equal(12, treeControl._root);
                  assert.isTrue(isNeedForceUpdate);
                  assert.isTrue(sourceController !== treeControl._children.baseControl._sourceController);
                  assert.isTrue(sourceControllersCleared);
                  assert.deepEqual(reloadFilter, {testParentProperty: 12});
                  treeControl._beforeUpdate({root: treeControl._root});
                  assert.isTrue(resetExpandedItemsCalled);
                  treeGrid.TreeControl._private.clearNodesSourceControllers = clearNodesSourceControllersOriginal;
                  resolve();
               }, 20);
            }, 10);
         });


      });

      it('clearSourceControllersForNotExpandedNodes', function() {
         const getSourceController = () => {
            return {
               destroy: () => {}
            };
         };
         const oldExpandedItems = [1, 2, 3];
         const newExpandedItems = [3, 4, 5];
         const self = {};
         self._nodesSourceControllers = new Map();

         oldExpandedItems.forEach((key) => {
            self._nodesSourceControllers.set(key, getSourceController());
         });
         newExpandedItems.forEach((key) => {
            self._nodesSourceControllers.set(key, getSourceController());
         });

         treeGrid.TreeControl._private.clearSourceControllersForNotExpandedNodes(self, oldExpandedItems, newExpandedItems);
         assert.equal(self._nodesSourceControllers.size, 3);
      });

      it('TreeControl.afterReloadCallback resets expanded items and hasMoreStorage on set root', function () {
         const source = new sourceLib.Memory({
            data: [],
            idProperty: 'id'
         });
         const treeControl = correctCreateTreeControl({
            columns: [],
            root: null,
            parentProperty: 'testParentProperty',
            source: source
         });
         const treeViewModel = treeControl._children.baseControl.getViewModel();

         // Mock TreeViewModel and TreeControl

         treeViewModel._model._display = {
            setFilter: () => undefined,
            setRoot: (root) => {
               treeViewModel._model._root = root;
            },
            getRoot: () => treeViewModel._model._root
         };

         treeControl._needResetExpandedItems = true;
         treeGrid.TreeControl._private.afterReloadCallback(treeControl, treeControl._options);
         assert.deepEqual([], treeViewModel.getExpandedItems());
         assert.deepEqual({}, treeViewModel.getHasMoreStorage());
      });

      it('TreeControl.afterReloadCallback created source controller with multi root navigation', function () {
         const source = new sourceLib.Memory({
            data: [],
            idProperty: 'id'
         });
         const treeControl = correctCreateTreeControl({
            columns: [],
            root: null,
            parentProperty: 'testParentProperty',
            nodeProperty: '@parent',
            source: source,
            expandedItems: [1, 2],
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 10,
                  page: 0,
                  hasMore: true
               }
            }
         });
         const treeViewModel = treeControl._children.baseControl.getViewModel();
         const moreDataRs = new collection.RecordSet({
            keyProperty: 'id',
            rawData: [
               {
                  id: 1,
                  nav_result: true
               },
               {
                  id: 2,
                  nav_result: false
               }
            ]
         });
         const items = new collection.RecordSet({
            keyProperty: 'id',
            rawData: [
               {
                  'id': 1,
                  '@parent': true
               },
               {
                  'id': 2,
                  '@parent': true
               },
               {
                  'id': 3,
                  '@parent': false
               }
            ]
         });
         items.setMetaData({ more: moreDataRs });
         treeControl._children.baseControl.getSourceController().calculateState(items);

         // Mock TreeViewModel and TreeControl

         treeViewModel._model._display = {
            setFilter: () => undefined,
            setRoot: (root) => {
               treeViewModel._model._root = root;
            },
            getRoot: () => treeViewModel._model._root,
            getExpandedItems: () => [1, 2],
            getItems: () => items
         };
         treeControl._deepReload = true;

         treeGrid.TreeControl._private.afterReloadCallback(treeControl, treeControl._options, items);

         assert.equal(treeControl._nodesSourceControllers.size, 2);
         assert.isTrue(treeControl._nodesSourceControllers.get(1).hasMoreData('down', 1));
         assert.isFalse(treeControl._nodesSourceControllers.get(2).hasMoreData('down', 2));

         treeControl._deepReload = false;
         treeControl._options.deepReload = true;

         treeGrid.TreeControl._private.afterReloadCallback(treeControl, treeControl._options, items);

         assert.equal(treeControl._nodesSourceControllers.size, 2);
         assert.isTrue(treeControl._nodesSourceControllers.get(1).hasMoreData('down', 1));
         assert.isFalse(treeControl._nodesSourceControllers.get(2).hasMoreData('down', 2));
      });

      it('List navigation by keys', function(done) {
         // mock function working with DOM
         listMod.BaseControl._private.scrollToItem = function() {};

         var
            stopImmediateCalled = false,

            lnSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: [
                  { id: 1, type: true, parent: null },
                  { id: 2, type: true, parent: 1 }
               ]
            }),
            lnCfg = {
               viewName: 'Controls/List/TreeGridView',
               source: lnSource,
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'type',
               markedKey: 1,
               columns: [],
               viewModelConstructor: treeGrid.ViewModel
            },
            lnTreeControl = correctCreateTreeControl(lnCfg),
            treeGridViewModel = lnTreeControl._children.baseControl.getViewModel();

         setTimeout(function () {
            assert.deepEqual([], treeGridViewModel._model._expandedItems);

            lnTreeControl._onTreeViewKeyDown({
               stopImmediatePropagation: function() {
                  stopImmediateCalled = true;
               },
               target: {closest() { return false; }},
               nativeEvent: {
                  keyCode: Env.constants.key.right
               }
            });
            setTimeout(function () {
               assert.deepEqual([1], treeGridViewModel._model._expandedItems);

               lnTreeControl._onTreeViewKeyDown({
                  stopImmediatePropagation: function() {
                     stopImmediateCalled = true;
                  },
                  target: {closest() { return false; }},
                  nativeEvent: {
                     keyCode: Env.constants.key.left
                  }
               });
               assert.deepEqual([], treeGridViewModel._model._expandedItems);

               assert.isTrue(stopImmediateCalled, 'Invalid value "stopImmediateCalled"');
               done();
            }, 1);
         }, 1);
      });
      it('TreeControl._beforeUpdate name of property', function() {
         var
            source = new sourceLib.Memory({
               data: [],
               keyProperty: 'id'
            }),
            treeControl = correctCreateTreeControl({
               columns: [],
               source: source,
               items: new collection.RecordSet({
                  rawData: [],
                  keyProperty: 'id'
               }),
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'type'
            }),
            treeGridViewModel = treeControl._children.baseControl.getViewModel();
         treeControl._beforeUpdate({
            root: 'testRoot',
            parentProperty: 'parentKey',
            nodeProperty: 'itemType',
            hasChildrenProperty: 'hasChildren'
         });
         assert.equal(treeGridViewModel._options.parentProperty, 'parentKey');
         assert.equal(treeGridViewModel._model._options.parentProperty, 'parentKey');
         assert.equal(treeGridViewModel._options.nodeProperty, 'itemType');
         assert.equal(treeGridViewModel._model._options.nodeProperty, 'itemType');
         assert.equal(treeGridViewModel._options.hasChildrenProperty, 'hasChildren');
         assert.equal(treeGridViewModel._model._options.hasChildrenProperty, 'hasChildren');
      });
      describe('propStorageId', function() {
         let origSaveConfig = SettingsController.saveConfig;
         afterEach(() => {
            SettingsController.saveConfig = origSaveConfig;
         });
         it('saving sorting', function() {
            var saveConfigCalled = false;
            SettingsController.saveConfig = function() {
               saveConfigCalled = true;
            };
            var source = new sourceLib.Memory({
               data: [],
               keyProperty: 'id'
            });
            var cfg = {
               columns: [],
               viewModelConstructor: treeGrid.ViewModel,
               source: source,
               items: new collection.RecordSet({
                  rawData: [],
                  keyProperty: 'id'
               }),
               keyProperty: 'id',
               parentProperty: 'parent',
               sorting: [1]
            };
            var cfg1 = {...cfg, propStorageId: '1'};
            cfg1.sorting = [2];
            var treeControl = correctCreateTreeControl(({...cfg}));
            treeControl.saveOptions(cfg);
            treeControl._beforeUpdate(cfg);
            assert.isFalse(saveConfigCalled);
            treeControl._beforeUpdate({...cfg, sorting: [3]});
            assert.isFalse(saveConfigCalled);
            treeControl._beforeUpdate(cfg1);
            assert.isTrue(saveConfigCalled);

         });
      });
      it('TreeControl._beforeUpdate', function() {
         var
            reloadCalled = false,
            setRootCalled = false,
            filterOnOptionChange = null,
            isSourceControllerDestroyed = false,
            source = new sourceLib.Memory({
               data: [],
               keyProperty: 'id'
            }),
            treeControl = correctCreateTreeControl({
               columns: [],
               source: source,
               items: new collection.RecordSet({
                  rawData: [],
                  keyProperty: 'id'
               }),
               keyProperty: 'id',
               parentProperty: 'parent'
            }),
            treeGridViewModel = treeControl._children.baseControl.getViewModel(),
            reloadOriginal = treeControl._children.baseControl.reload;

         treeControl._nodesSourceControllers = new Map([
            [
               1,
               {
                  destroy: function() {
                     isSourceControllerDestroyed = true;
                  }
               }
            ]
         ]);

         treeGridViewModel.setRoot = function() {
            setRootCalled = true;
         };
         treeControl._children.baseControl.reload = function() {
            reloadCalled = true;
            return reloadOriginal.apply(this, arguments);
         };
         treeGridViewModel._model._display = {
            setFilter: function() {},
            getRoot: function() {
               return {
                  getContents: function() {
                     return null;
                  }
               };
            }
         };
         treeGridViewModel.setExpandedItems(['testRoot']);

         return new Promise(function(resolve, reject) {
            treeControl._children.baseControl._options.beforeReloadCallback = function(filter) {
               treeControl._beforeReloadCallback(filter, null, null, treeControl._options);
               filterOnOptionChange = filter;
            };
            treeControl._children.baseControl._sourceController._loader.addCallback(function(result) {
               treeControl._children.baseControl.reload().addCallback(function(res) {
                  var newFilter = {
                     parent: null
                  };
                  treeControl._beforeUpdate({root: 'testRoot'});
                  treeControl._options.root = 'testRoot';
                  try {
                     assert.deepEqual(treeGridViewModel.getExpandedItems(), []);
                     assert.deepEqual(filterOnOptionChange, newFilter);
                  } catch (e) {
                     reject(e);
                  }

                  treeControl._afterUpdate({root: null, filter: {}, source: source});
                  treeControl._children.baseControl._sourceController._loader.addCallback(function() {
                     try {
                        assert.isTrue(reloadCalled, 'Invalid call "reload" after call "_beforeUpdate" and apply new "root".');
                        assert.isTrue(setRootCalled, 'Invalid call "setRoot" after call "_beforeUpdate" and apply new "root".');
                        assert.isTrue(isSourceControllerDestroyed);
                        resolve();
                     } catch (e) {
                        reject(e);
                     }
                  });
                  return res;
               });
               return result;
            });
         });
      });
      it('TreeControl._private.prepareHasMoreStorage', function() {
         var
            sourceControllers = new Map([
               [
                  1,
                  {
                     hasMoreData: function() {
                        return true;
                     }
                  }
               ],
               [
                  2,
                  {
                     hasMoreData: function() {
                        return false;
                     }
                  }
               ]
            ]),
            hasMoreResult = {
               1: true,
               2: false
            };
         assert.deepEqual(hasMoreResult, treeGrid.TreeControl._private.prepareHasMoreStorage(sourceControllers),
            'Invalid value returned from "prepareHasMoreStorage(sourceControllers)".');
      });
      it('TreeControl._private.beforeLoadToDirectionCallback', function() {
         var filter = {
            field1: 'value 1'
         };
         treeGrid.TreeControl._private.beforeLoadToDirectionCallback({ _root: 'myCurrentRoot' }, filter, { parentProperty: 'parent' });
         assert.deepEqual(filter, {
            field1: 'value 1',
            parent: 'myCurrentRoot'
         });

         treeGrid.TreeControl._private.beforeLoadToDirectionCallback({ _root: 'myCurrentRoot' }, filter, { parentProperty: 'parent', selectedKeys: [1], source: new sourceLib.Memory() });
         assert.deepEqual(filter.entries.get('marked'), ['1']);
      });
      it('TreeControl._private.loadMore', function () {
         var
             setHasMoreCalled = false,
             mergeItemsCalled = false,
             isIndicatorHasBeenShown = false,
             isIndicatorHasBeenHidden = false,
             dataLoadCallbackCalled = false,
             loadMoreSorting,
             mockedTreeControlInstance = {
                _options: {
                   filter: {
                      testParam: 11101989
                   },
                   dataLoadCallback: function () {
                      dataLoadCallbackCalled = true;
                   },
                   task1177940587: true,
                   sorting: [{'test': 'ASC'}],
                   parentProperty: 'parent',
                   uniqueKeys: true
                },
                _nodesSourceControllers: new Map([
                   [
                      1,
                      {
                         load: (filter, sorting) => {
                            let result = new Deferred();
                            loadMoreSorting = sorting;
                            result.callback();
                            return result;
                         },
                         hasMoreData: function () {
                            return true;
                         }
                      }
                   ]
                ]),
                _children: {
                   baseControl: {
                      getViewModel: function () {
                         return {
                            setHasMoreStorage: function () {
                               setHasMoreCalled = true;
                            },
                            mergeItems: function () {
                               mergeItemsCalled = true;
                            }
                         };
                      },
                      showIndicator() {
                         isIndicatorHasBeenShown = true;
                      },
                      hideIndicator() {
                         isIndicatorHasBeenHidden = true;
                      }
                   }
                }
             },
             dispItem = {
                getContents: function () {
                   return {
                      getId: function () {
                         return 1;
                      }
                   };
                }
             };
         dataLoadCallbackCalled = false;
         treeGrid.TreeControl._private.loadMore(mockedTreeControlInstance, dispItem);
         assert.deepEqual({
                testParam: 11101989
             }, mockedTreeControlInstance._options.filter,
             'Invalid value "filter" after call "TreeControl._private.loadMore(...)".');
         assert.isTrue(setHasMoreCalled, 'Invalid call "setHasMore" by "TreeControl._private.loadMore(...)".');
         assert.isTrue(mergeItemsCalled, 'Invalid call "mergeItemsCalled" by "TreeControl._private.loadMore(...)".');
         assert.isTrue(dataLoadCallbackCalled, 'Invalid call "dataLoadCallbackCalled" by "TreeControl._private.loadMore(...)".');
         assert.isTrue(isIndicatorHasBeenShown);
         assert.isTrue(isIndicatorHasBeenHidden);
         assert.deepEqual(loadMoreSorting, [{'test': 'ASC'}]);
      });
      describe('EditInPlace', function() {
         it('beginEdit', function() {
            var opt = {
               test: '123'
            };
            var
               treeControl = correctCreateTreeControl({});
            treeControl._children.baseControl.beginEdit = function(options) {
               assert.equal(opt, options);
               return Deferred.success();
            };
            var result = treeControl.beginEdit(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('beginEdit, readOnly: true', function() {
            var opt = {
               test: '123'
            };
            var
               treeControl = correctCreateTreeControl({ readOnly: true });
            var result = treeControl.beginEdit(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });

         it('beginAdd', function() {
            var opt = {
               test: '123'
            };
            var
               treeControl = correctCreateTreeControl({});
            treeControl._children.baseControl.beginAdd = function(options) {
               assert.equal(opt, options);
               return Deferred.success();
            };
            var result = treeControl.beginAdd(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('beginAdd, readOnly: true', function() {
            var opt = {
               test: '123'
            };
            var
               treeControl = correctCreateTreeControl({ readOnly: true });
            var result = treeControl.beginAdd(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });
         it('cancelEdit', function() {
            var
               treeControl = correctCreateTreeControl({});
            treeControl._children.baseControl.cancelEdit = function() {
               return Deferred.success();
            };
            var result = treeControl.cancelEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('cancelEdit, readOnly: true', function() {
            var
               treeControl = correctCreateTreeControl({ readOnly: true });
            var result = treeControl.cancelEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });

         it('commitEdit', function() {
            var
               treeControl = correctCreateTreeControl({});
            treeControl._children.baseControl.commitEdit = function() {
               return Deferred.success();
            };
            var result = treeControl.commitEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('commitEdit, readOnly: true', function() {
            var
               treeControl = correctCreateTreeControl({ readOnly: true }),
               result = treeControl.commitEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });

         it('cancelEdit on change root', function() {
            var
               treeControl = correctCreateTreeControl({
                  columns: [],
                  source: new sourceLib.Memory(),
                  items: new collection.RecordSet({
                     rawData: [],
                     idProperty: 'id'
                  }),
                  root: 'test'
               }),
               cancelEditCalled = false;
            treeControl._children.baseControl.cancelEdit = function() {
               cancelEditCalled = true;
            };
            treeControl._beforeUpdate({
               root: 'test2'
            });
            assert.isTrue(cancelEditCalled);
         });
      });
      it('All items collapsed after reload', function() {
         var
            treeControl = correctCreateTreeControl({
               expandedItems: [2246, 452815, 457244, 471641],
               columns: [],
               source: new sourceLib.Memory(),
               items: new collection.RecordSet({
                  rawData: [],
                  keyProperty: 'id'
               })
            });
         treeControl.reload();
         assert.deepEqual([2246, 452815, 457244, 471641], treeControl._children.baseControl.getViewModel().getExpandedItems());
      });
      it('Expand all', function(done) {
         var
            treeControl = correctCreateTreeControl({
               source: new sourceLib.Memory({
                  data: [
                     { id: 1, type: true, parent: null },
                     { id: 2, type: true, parent: null },
                     { id: 11, type: null, parent: 1 }
                  ],
                  keyProperty: 'id'
               }),
               columns: [],
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'type',
               expandedItems: [null]
            }),
            treeGridViewModel = treeControl._children.baseControl.getViewModel();
         setTimeout(function () {
            assert.deepEqual([null], treeGridViewModel._model._expandedItems);
            assert.deepEqual([], treeGridViewModel._model._collapsedItems);
            treeGridViewModel.toggleExpanded(treeGridViewModel._model._display.at(0));
            setTimeout(function() {
               assert.deepEqual([null], treeGridViewModel._model._expandedItems);
               assert.deepEqual([1], treeGridViewModel._model._collapsedItems);
               done();
            }, 10);
         }, 10);
      });

      it('expandedItems bindind 1', function(done){

         //expandedItems задана, и после обновления контрола, должна соответствовать начальной опции
         setTimeout(()=>{
            var _cfg = {
               source: new sourceLib.Memory({
                  data: [
                     { id: 1, type: true, parent: null },
                     { id: 2, type: true, parent: null },
                     { id: 11, type: null, parent: 1 }
                  ],
                  keyProperty: 'id'
               }),
               columns: [],
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'type',
               expandedItems: [1]
            };
            var treeControl1 = correctCreateTreeControl(_cfg);

            setTimeout(()=>{
               var treeGridViewModel1 = treeControl1._children.baseControl.getViewModel();
               assert.deepEqual([1], treeGridViewModel1._model._expandedItems,'wrong expandedItems');
               treeControl1.toggleExpanded(1);
               setTimeout(()=>{
                  treeControl1._beforeUpdate(_cfg);
                  setTimeout(()=>{
                     assert.deepEqual([], treeControl1._children.baseControl.getViewModel()._model._expandedItems,'wrong expandedItems after _breforeUpdate');
                     done();
                  }, 10);
               }, 10);
            }, 10);
         }, 10);
      });
      it('expandedItems binding 2', function(done){

         //expandedItems не задана, и после обновления контрола, не должна измениться
         setTimeout(()=>{
            var _cfg = {
               source: new sourceLib.Memory({
                  data: [
                     { id: 1, type: true, parent: null },
                     { id: 2, type: true, parent: null },
                     { id: 11, type: null, parent: 1 }
                  ],
                  keyProperty: 'id'
               }),
               columns: [],
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'type',
            };
            var treeControl1 = correctCreateTreeControl(_cfg);

            setTimeout(()=>{
               var treeGridViewModel1 = treeControl1._children.baseControl.getViewModel();
               assert.deepEqual([], treeGridViewModel1._model._expandedItems,'wrong expandedItems');
               treeControl1.toggleExpanded(1);
               setTimeout(()=>{
                  treeControl1._beforeUpdate(_cfg);
                  setTimeout(()=>{
                     assert.deepEqual([1], treeGridViewModel1._model._expandedItems,'wrong expandedItems after _breforeUpdate');
                     done();
                  }, 10);
               }, 10);
            }, 10);
         }, 10);

      });
      it('collapsedItems bindind', function(done){

         //collapsedItems задана, и после обновления контрола, должна соответствовать начальной опции
         setTimeout(()=>{
            var _cfg = {
               source: new sourceLib.Memory({
                  data: [
                     { id: 1, type: true, parent: null },
                     { id: 2, type: true, parent: null },
                     { id: 11, type: null, parent: 1 }
                  ],
                  keyProperty: 'id'
               }),
               columns: [],
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'type',
               expandedItems: [null],
               collapsedItems: []
            };
            var treeControl1 = correctCreateTreeControl(_cfg);

            setTimeout(()=>{
               var treeGridViewModel1 = treeControl1._children.baseControl.getViewModel();
               assert.deepEqual([], treeGridViewModel1._model._collapsedItems,'wrong collapsedItems');
               treeControl1.toggleExpanded(1);
               setTimeout(()=>{
                  treeControl1._beforeUpdate(_cfg);
                  setTimeout(()=>{
                     assert.deepEqual([], treeControl1._children.baseControl.getViewModel()._model._collapsedItems,'wrong collapsedItems after _breforeUpdate');
                     done();
                  }, 10);
               }, 10);
            }, 10);
         }, 10);
      });
      it('markItemByExpanderClick true', function() {
         var
            savedMethod = treeGrid.TreeControl._private.toggleExpanded,
            baseControlFocused = false,
            rawData = [
               { id: 1, type: true, parent: null },
               { id: 2, type: true, parent: null },
               { id: 11, type: null, parent: 1 }
            ],
            source = new sourceLib.Memory({
               rawData: rawData,
               keyProperty: 'id'
            }),
            cfg = {
               source: source,
               markerVisibility: 'visible',
               columns: [],
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'type',
               markItemByExpanderClick: true
            },
            e = {
               stopImmediatePropagation: function(){}
            },
            treeControl = new treeGrid.TreeControl(cfg),
            treeGridViewModel = new treeGrid.ViewModel(cfg);
         treeControl.saveOptions(cfg);
         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: rawData,
            keyProperty: 'id'
         }));

         treeControl._children = {
            baseControl: {
               getViewModel: function() {
                  return treeGridViewModel;
               }
            }
         };

         treeGrid.TreeControl._private.toggleExpanded = function(){};

         treeControl._onExpanderClick(e, treeGridViewModel.at(0));
         assert.deepEqual(1, treeGridViewModel._model._markedKey);

         treeControl._onExpanderClick(e, treeGridViewModel.at(1));
         assert.deepEqual(2, treeGridViewModel._model._markedKey);

         treeGrid.TreeControl._private.toggleExpanded = savedMethod;
      });

      it('markItemByExpanderClick false', function() {

         var
            savedMethod = treeGrid.TreeControl._private.toggleExpanded,
            baseControlFocused = false,
            rawData = [
               { id: 1, type: true, parent: null },
               { id: 2, type: true, parent: null },
               { id: 11, type: null, parent: 1 }
            ],
            source = new sourceLib.Memory({
               rawData: rawData,
               keyProperty: 'id'
            }),
            cfg = {
               source: source,
               columns: [],
               markerVisibility: 'visible',
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'type',
               markItemByExpanderClick: false
            },
            e = {
               stopImmediatePropagation: function(){}
            },
            treeControl = new treeGrid.TreeControl(cfg),
            treeGridViewModel = new treeGrid.ViewModel(cfg);
         treeControl.saveOptions(cfg);
         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: rawData,
            keyProperty: 'id'
         }));

         treeControl._children = {
            baseControl: {
               getViewModel: function() {
                  return treeGridViewModel;
               }
            }
         };

         treeGrid.TreeControl._private.toggleExpanded = function(){};

         treeControl._onExpanderClick(e, treeGridViewModel.at(0));
         assert.deepEqual(1, treeGridViewModel._model._markedKey);

         treeControl._onExpanderClick(e, treeGridViewModel.at(1));
         assert.deepEqual(1, treeGridViewModel._model._markedKey);

         treeGrid.TreeControl._private.toggleExpanded = savedMethod;
      });

      it('reloadItem', function(done) {
         var source = new sourceLib.Memory({
            data: [{id: 0, 'Раздел@': false, "Раздел": null}],
            rawData: [{id: 0, 'Раздел@': false, "Раздел": null}],
            keyProperty: 'id',
            filter: function(item, filter) {
               if (filter['Раздел'] && filter['Раздел'] instanceof Array) {
                  return filter['Раздел'].indexOf(item.get('id')) !== -1 || filter['Раздел'].indexOf(item.get('Раздел')) !== -1;
               }
               return true;
            }
         });
         var cfg = {
            source: source,
            columns: [],
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            filter: {},
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 10,
                  page: 0,
                  hasMore: false
               }
            }
         };

         var treeGridViewModel = new treeGrid.ViewModel(cfg);
         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         }));
         var treeControl = new treeGrid.TreeControl(cfg);
         treeControl.saveOptions(cfg);
         treeControl._children = {
            baseControl: {
               getViewModel: function() {
                  return treeGridViewModel;
               }
            }
         };

         var oldItems = treeControl._children.baseControl.getViewModel().getItems();
         assert.deepEqual(oldItems.getRawData(), getHierarchyData());

         treeControl.reloadItem(0, {}, 'depth').addCallback(function() {
            const viewModel = treeControl._children.baseControl.getViewModel();
            const newItems = viewModel.getItems()
            assert.deepEqual(
               newItems.getRawData(),
               [
                  {id: 0, 'Раздел@': false, "Раздел": null},
                  {id: 3, 'Раздел@': null, "Раздел": 1},
                  {id: 4, 'Раздел@': null, "Раздел": null}
               ]
            );
            assert.deepEqual(
               viewModel._model.getHasMoreStorage(),
               {
                  0: false
               }
            )
            done();
         });
      });

      it('toggle node by click', async function() {
         let
             isIndicatorHasBeenShown = false,
             isIndicatorHasBeenHidden = false,
             savedMethod = treeGrid.TreeControl._private.createSourceController,
             data = [
                {id: 0, 'Раздел@': true, "Раздел": null},
                {id: 1, 'Раздел@': false, "Раздел": null},
                {id: 2, 'Раздел@': null, "Раздел": null}
             ],
             source = new sourceLib.Memory({
                rawData: data,
                keyProperty: 'id',
             }),
             cfg = {
                source: source,
                columns: [],
                keyProperty: 'id',
                parentProperty: 'Раздел',
                nodeProperty: 'Раздел@',
                filter: {},
                expandByItemClick: true
             },
             treeGridViewModel = new treeGrid.ViewModel(cfg),
             treeControl;

         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: data,
            keyProperty: 'id'
         }));

         treeControl = new treeGrid.TreeControl(cfg);
         treeControl.saveOptions(cfg);
         treeControl._children = {
            baseControl: {
               getViewModel: function() {
                  return treeGridViewModel;
               },
               showIndicator() {
                  isIndicatorHasBeenShown = true;
               },
               hideIndicator() {
                  isIndicatorHasBeenHidden = true;
               }
            }
         };

         // Mock source controller four synchronous unit.
         treeGrid.TreeControl._private.createSourceController = function () {
            return {
               hasMoreData: () => false,
               load: function() {
                  return {
                     addCallback: (func) => {
                        func(new collection.RecordSet({
                           rawData: [],
                           keyProperty: 'id'
                        }));
                     }
                  }
               }
            }
         };

         // Initial
         assert.deepEqual(treeGridViewModel.getExpandedItems(), []);

         const fakeEvent = {
            stopPropagation: () => {
            }
         };

         const assertTestCaseResult = (expandedItems, useIndicator) => {
            assert.deepEqual(treeGridViewModel.getExpandedItems(), expandedItems);
            if (useIndicator !== false) {
               assert.isTrue(isIndicatorHasBeenShown);
               assert.isTrue(isIndicatorHasBeenHidden);
            } else {
               assert.isFalse(isIndicatorHasBeenShown);
               assert.isFalse(isIndicatorHasBeenHidden);
            }
            isIndicatorHasBeenShown = false;
            isIndicatorHasBeenHidden = false;
         };

         // Expanding. Child items has not loaded
         treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(0).getContents(), {});
         assertTestCaseResult([0]);

         treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(1).getContents(), {});
         assertTestCaseResult([0, 1]);

         // Leaf
         treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(2).getContents(), {});
         assertTestCaseResult([0, 1], false);

         // Closing. Child items loaded
         treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(0).getContents(), {});
         assertTestCaseResult([1], false);

         treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(1).getContents(), {});
         assertTestCaseResult([], false);

         treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(2).getContents(), {});
         assertTestCaseResult([], false);

         // Expanding. Child items loaded
         treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(0).getContents(), {});
         assertTestCaseResult([0], false);

         treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(1).getContents(), {});
         assertTestCaseResult([0, 1], false);

         treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(2).getContents(), {});
         assertTestCaseResult([0, 1], false);

         treeGrid.TreeControl._private.createSourceController = savedMethod;
      });


       it('don\'t toggle node by click if handler returns false', async function() {
           const savedMethod = treeGrid.TreeControl._private.createSourceController;
           const data = [
               {id: 0, 'Раздел@': true, "Раздел": null},
               {id: 1, 'Раздел@': false, "Раздел": null},
               {id: 2, 'Раздел@': null, "Раздел": null}
           ];
           const source = new sourceLib.Memory({
               idProperty: 'id',
               rawData: data,
           });
           const cfg = {
               source: source,
               columns: [{}],
               keyProperty: 'id',
               parentProperty: 'Раздел',
               nodeProperty: 'Раздел@',
               filter: {},
               expandByItemClick: true
           };

           const treeGridViewModel = new treeGrid.ViewModel(cfg);
           let treeControl;

           treeGridViewModel.setItems(new collection.RecordSet({
               rawData: data,
               idProperty: 'id'
           }));

           treeControl = new treeGrid.TreeControl(cfg);
           treeControl.saveOptions(cfg);
           treeControl._children = {
               baseControl: {
                   getViewModel: function() {
                       return treeGridViewModel;
                   },
                  showIndicator() {
                  },
                  hideIndicator() {
                  }
               }
           };

           treeGrid._notify = (eName) => {
              if (eName === 'itemClick') {
                 return false;
              }
           };

           // Initial
           assert.deepEqual(treeGridViewModel.getExpandedItems(), []);

           const fakeEvent = {
               stopPropagation: () => {}
           };

           treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(0).getContents(), {});
           assert.deepEqual(treeGridViewModel.getExpandedItems(), []);

           treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(1).getContents(), {});
           assert.deepEqual(treeGridViewModel.getExpandedItems(), []);

           treeGrid.TreeControl._private.createSourceController = savedMethod;
       });

      it('don\'t toggle node by click on breadcrumbs', async function() {
         const savedMethod = treeGrid.TreeControl._private.createSourceController;
         const data = [
            {id: 0, 'Раздел@': true, "Раздел": null},
            {id: 1, 'Раздел@': false, "Раздел": null},
            {id: 2, 'Раздел@': null, "Раздел": null}
         ];
         const source = new sourceLib.Memory({
            keyProperty: 'id',
            rawData: data,
         });
         const cfg = {
            source: source,
            columns: [{}],
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            filter: {},
            expandByItemClick: true
         };
         const fakeEvent = {
            stopPropagation: () => {}
         };

         const treeGridViewModel = new treeGrid.ViewModel(cfg);
         let treeControl;

         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: data,
            keyProperty: 'id'
         }));

         treeControl = new treeGrid.TreeControl(cfg);
         treeControl.saveOptions(cfg);
         treeControl._children = {
            baseControl: {
               getViewModel: () => treeGridViewModel
            }
         };

         const breadcrumb = new collection.RecordSet({
            rawData: [
               {
                  id: 1,
                  title: 'Путь до его то',
                  'Раздел@': true
               }
            ],
            keyProperty: 'id'
         }).at(0);

         // Initial
         assert.deepEqual(treeGridViewModel.getExpandedItems(), []);
         treeControl._onItemClick(fakeEvent, breadcrumb, {});
         assert.deepEqual(treeGridViewModel.getExpandedItems(), []);

         treeGrid.TreeControl._private.createSourceController = savedMethod;
      });

      it('itemClick sends right args', function() {
         let isEventRaised = false;
         let isParentEventStopped = false;

         const treeControl = correctCreateTreeControl({ readOnly: true });
         const item = {};
         const nativeEvent = {};
         const event = {
            stopPropagation: () => {
               isParentEventStopped = true;
            }
         };
         const columnIndex = 12;
         treeControl._notify = (eName, args) => {
            if (eName === 'itemClick') {
               isEventRaised = true;
               assert.equal(args[0], item);
               assert.equal(args[1], nativeEvent);
               assert.equal(args[2], columnIndex);
               return false;
            }
         };

         treeControl._onItemClick(event, item, nativeEvent, columnIndex);
         assert.isTrue(isEventRaised);
         assert.isTrue(isParentEventStopped);
      });

      it('check deepReload after load', function() {
         let source = new sourceLib.Memory({
            data: [{ id: 0, 'Раздел@': false, "Раздел": null }],
            keyProperty: 'id'
         });
         let cfg = {
            source: source,
            columns: [],
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            expandedItems: [0],
            filter: {}
         };

         let treeControl = correctCreateTreeControl(cfg);

         return new Promise(function(resolve) {
            treeControl._children.baseControl._beforeMount(cfg).addCallback(function(res) {
               assert.isFalse(treeControl._deepReload);
               resolve();
               return res;
            });
         });
      });

      it('_private.getReloadableNodes', function() {
         var source = new sourceLib.Memory({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         });
         var cfg = {
            source: source,
            columns: [],
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
         };

         var treeGridViewModel = new treeGrid.ViewModel(cfg);
         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         }));

         assert.deepEqual(treeGrid.TreeControl._private.getReloadableNodes(treeGridViewModel, 0, 'id', 'Раздел@'), [1]);
      });

      it('_private.beforeReloadCallback', function() {
         function getDefaultCfg() {
            return {
               columns: [],
               keyProperty: 'id',
               parentProperty: 'Раздел',
               nodeProperty: 'Раздел@',
               expandedItems: [null],
               selectedKeys: [1],
               excludedKeys: [2],
               source: new sourceLib.Memory({
                  rawData: getHierarchyData(),
                  keyProperty: 'id'
               })
            };
         }
         let cfg = getDefaultCfg();
         let treeGridViewModel = new treeGrid.ViewModel(cfg);

         let emptyCfg = getDefaultCfg();
         emptyCfg.expandedItems = ['1', '2'];
         let emptyTreeGridViewModel = new treeGrid.ViewModel(emptyCfg);
         let getNodesSourceControllers = () => {
            return new Map([
               [1,
                  {
                     destroy: () => {},
                     hasMoreData: () => {}
                  }
               ]
            ]);
         };
         let self = {
            _deepReload: true,
            _children: {},
            _root: 'root'
         };
         let selfWithBaseControl = {
            _deepReload: true,
            _root: 'root',
            _children: {
               baseControl: {
                  getViewModel: function() {
                     return treeGridViewModel;
                  }
               }
            }
         };
         let selfWithBaseControlAndEmptyModel = {
            _deepReload: true,
            _root: 'root',
            _children: {
               baseControl: {
                  getViewModel: function() {
                     return emptyTreeGridViewModel;
                  }
               }
            }
         };
         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         }));
         treeGridViewModel.setExpandedItems([null]);

         var filter = {};
         treeGrid.TreeControl._private.beforeReloadCallback(self, filter, null, null, cfg);
         assert.equal(filter['Раздел'], self._root);
         assert.deepEqual(filter.entries.get('marked'), ['1']);
         assert.deepEqual(filter.entries.get('excluded'), ['2']);

         filter = {};
         cfg.selectedKeys = [];
         selfWithBaseControl._nodesSourceControllers = getNodesSourceControllers();
         treeGrid.TreeControl._private.beforeReloadCallback(selfWithBaseControl, filter, null, null, cfg);
         assert.equal(filter['Раздел'], self._root);
         assert.isFalse(!!selfWithBaseControl._nodesSourceControllers[1]);
         assert.equal(filter.entries, undefined);

         treeGridViewModel.setExpandedItems([1, 2]);
         filter = {};
         selfWithBaseControl._nodesSourceControllers = getNodesSourceControllers();
         treeGrid.TreeControl._private.beforeReloadCallback(selfWithBaseControl, filter, null, null, cfg);
         assert.deepEqual(filter['Раздел'], ['root', 1, 2]);
         assert.isTrue(selfWithBaseControl._nodesSourceControllers.has(1));

         filter = {};
         treeGrid.TreeControl._private.beforeReloadCallback(selfWithBaseControlAndEmptyModel, filter, null, null, emptyCfg);
         assert.deepEqual(filter['Раздел'], ['root', '1', '2']);
      });

      it('_private.applyReloadedNodes', function() {
         var source = new sourceLib.Memory({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         });
         var cfg = {
            source: source,
            columns: [],
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
         };

         var treeGridViewModel = new treeGrid.ViewModel(cfg);
         var newItems = new collection.RecordSet({
            rawData: [{id: 0, 'Раздел@': false, "Раздел": null}],
            keyProperty: 'id'
         });
         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         }));

         treeGrid.TreeControl._private.applyReloadedNodes(treeGridViewModel, 0, 'id', 'Раздел@', newItems);

         assert.equal(treeGridViewModel.getItems().getCount(), 3);
         assert.deepEqual(treeGridViewModel.getItems().at(0).getRawData(), {id: 0, 'Раздел@': false, "Раздел": null});
      });

      it('_private.nodeChildsIterator', function() {
         var source = new sourceLib.Memory({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         });
         var cfg = {
            source: source,
            columns: [],
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
         };

         var treeGridViewModel = new treeGrid.ViewModel(cfg);
         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         }));
         var nodes = [];
         var lists = [];

         treeGrid.TreeControl._private.nodeChildsIterator(treeGridViewModel, 0, 'Раздел@',
            function(elem) {
               nodes.push(elem.get('id'));
            },
            function(elem) {
               lists.push(elem.get('id'));
            });

         assert.deepEqual(nodes, [1]);
         assert.deepEqual(lists, [2]);
      });
   });
});
