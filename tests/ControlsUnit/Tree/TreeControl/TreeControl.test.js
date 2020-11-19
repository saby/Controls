define([
   'Controls/tree',
   'Controls/treeGrid',
   'Controls/list',
   'Core/Deferred',
   'Core/core-merge',
   'Core/core-instance',
   'Env/Env',
   'Types/collection',
   'Types/source',
   'Controls/Application/SettingsController',
   'Controls/listDragNDrop',
   'Controls/source',
   'Controls/dataSource'
], function(
   tree,
   treeGrid,
   listMod,
   Deferred,
   cMerge,
   cInstance,
   Env,
   collection,
   sourceLib,
   SettingsController,
   listDragNDrop,
   cSource,
   dataSource
) {
   function correctCreateTreeControl(cfg, returnCreatePromise) {
      var
         treeControl,
         baseControl,
         treeBeforeUpdate,
         cfgBaseControl,
         cfgTreeControl = cMerge(cfg, {
            viewModelConstructor: treeGrid.ViewModel
         }),
         createPromise;
      cfgTreeControl = Object.assign(tree.TreeControl.getDefaultOptions(), cfgTreeControl);
      treeControl = new tree.TreeControl(cfgTreeControl);
      treeControl.saveOptions(cfgTreeControl);
      treeControl._beforeMount(cfgTreeControl);
      cfgBaseControl = cMerge(cfgTreeControl, {
         beforeReloadCallback: treeControl._beforeReloadCallback,
         afterReloadCallback: treeControl._afterReloadCallback
      });
      baseControl = new listMod.BaseControl(cfgBaseControl);
      baseControl.saveOptions(cfgBaseControl);
      baseControl.cancelEdit = function() {};
      createPromise = baseControl._beforeMount(cfgBaseControl);
      treeControl._children = {
         baseControl: baseControl
      };
      treeBeforeUpdate = treeControl._beforeUpdate;
      treeControl._beforeUpdate = function() {
         treeBeforeUpdate.apply(treeControl, arguments);
         baseControl._beforeUpdate(treeControl._options);
      };

      if (returnCreatePromise) {
         return {
            treeControl,
            createPromise
         };
      } else {
         return treeControl;
      }
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

   describe('Controls.tree.TreeControl', function() {
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
         const treeInst = new tree.TreeControl({viewModelConstructor: treeGrid.ViewModel});
         tree.TreeControl._private.afterReloadCallback(treeInst);
      });
      it('TreeControl._private.toggleExpanded', async function() {
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
               },
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 10,
                     page: 0,
                     hasMore: true
                  }
               }
            });
         var isSourceControllerUsed = false;

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
               getRoot: function() {},
               getCount:function(){
                  return 2;
               },
               setHasMoreStorage: function() {},
               getHasMoreStorage: function() {return {
                  '1': false
               }},
               appendItems: function() {},
               mergeItems: function() {},
               getItemBySourceKey: () => undefined
            };
         };

         treeControl._children.baseControl.getVirtualScroll = function(){
            return {
               ItemsCount: 0,
               updateItemsIndexesOnToggle: function() {
               }
            };
         };
         const originLoad = treeControl._children.baseControl.getSourceController().load;
         treeControl._children.baseControl.getSourceController().load = function() {
            isSourceControllerUsed = true;
            return originLoad.apply(this, arguments);
         };

         treeControl._children.baseControl.getSourceController().hasMoreData = function() {
            return false;
         };

         treeControl._children.baseControl.getSourceController().hasLoaded = function(key) {
            return key === 1;
         };
         // Test
         await tree.TreeControl._private.toggleExpanded(treeControl, {
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

         await tree.TreeControl._private.toggleExpanded(treeControl, {
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
         }), cfg);
         model.setMarkedKey(1);
         tree.TreeControl._private.expandMarkedItem(treeControl);
         model.setMarkedKey(2);
         tree.TreeControl._private.expandMarkedItem(treeControl);
         model.setMarkedKey(3);
         tree.TreeControl._private.expandMarkedItem(treeControl);
         assert.deepEqual(toggleExpandedStack, [1, 2]);
      });

      it('_private.getTargetRow', () => {
         const event = {
            target: {
               getBoundingClientRect() {
                  return {
                     top: 50,
                     height: 35
                  };
               },
               classList: {
                  contains: () => false
               },
               parentNode: {
                  classList: {
                     contains: (style) => style === 'controls-ListView__itemV'
                  }
               }
            },
            nativeEvent: {
               pageY: 60
            }
         };

         const target = tree.TreeControl._private.getTargetRow(event);
         assert.equal(event.target, target);
      });

      it('_private.shouldLoadChildren', async function() {
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
            createResult = correctCreateTreeControl({
               columns: [],
               parentProperty: 'parent',
               nodeProperty: 'nodeType',
               hasChildrenProperty: 'hasChildren',
               source: source,
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 10,
                     page: 0,
                     hasMore: true
                  }
               }
            }, true),
            shouldLoadChildrenResult = {
               'node_has_loaded_children': false,
               'node_has_unloaded_children': true,
               'node_has_no_children': false
            };

         await createResult.createPromise;

         for (const nodeKey in shouldLoadChildrenResult) {
            const
                expectedResult = shouldLoadChildrenResult[nodeKey];
            assert.strictEqual(
                tree.TreeControl._private.shouldLoadChildren(createResult.treeControl, nodeKey),
                expectedResult,
                '_private.shouldLoadChildren returns unexpected result for ' + nodeKey
            );
         }
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
            originalCreateSourceController = tree.TreeControl._private.createSourceController,
            originalShouldLoadChildren = tree.TreeControl._private.shouldLoadChildren,
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

         tree.TreeControl._private.createSourceController = function() {
            return {
               load: function() {
                  loadedDataFromServer = true;
                  return Deferred.success([]);
               },
               hasMoreData: function () {
                  return false;
               }
            };
         };

         tree.TreeControl._private.shouldLoadChildren = function() {
            return false;
         };

         model.toggleExpanded = function(item, expanded) {
            expandedCorrectItem = item === fakeDispItem;
            expandedCorrectState = expanded === true;
         };

         tree.TreeControl._private.toggleExpanded(treeControl, fakeDispItem);

         tree.TreeControl._private.createSourceController = originalCreateSourceController;
         tree.TreeControl._private.shouldLoadChildren = originalShouldLoadChildren;

         assert.isFalse(loadedDataFromServer);
         assert.isTrue(expandedCorrectItem);
         assert.isTrue(expandedCorrectState);
      });

      it('_private.isDeepReload', function() {
         assert.isFalse(!!tree.TreeControl._private.isDeepReload({}, false));
         assert.isTrue(!!tree.TreeControl._private.isDeepReload({}, true));

         assert.isTrue(!!tree.TreeControl._private.isDeepReload({ deepReload: true }, false));
         assert.isFalse(!!tree.TreeControl._private.isDeepReload({ deepReload: false}, false));
      });

      it('TreeControl.reload', async function() {
         var createControlResult = correctCreateTreeControl({
               columns: [],
               source: new sourceLib.Memory({
                  data: [],
                  keyProperty: 'id'
               })
            }, true);
         var vmHasMoreStorage = null;

         //viewmodel moch
         createControlResult.treeControl._children.baseControl.getViewModel = function() {
            return {
               setHasMoreStorage: function (hms) {
                  vmHasMoreStorage = hms;
               },
               getHasMoreStorage: () => {
                  return {};
               },
               getExpandedItems: function() {
                  return [1];
               },
               isExpandAll: function() {
                  return false;
               },
               resetExpandedItems: function() {

               },
               getRoot: function() {},
               getItems: function() {
                  return {
                     at: function () {}
                  };
               },
               getItemBySourceKey: () => undefined
            };
         };

         await createControlResult.createPromise;
         await createControlResult.treeControl.reload();
         assert.deepEqual({1: false}, vmHasMoreStorage);
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
         var beforeReloadCallbackOriginal = tree.TreeControl._private.beforeReloadCallback;
         var reloadFilter;
         var beforeReloadCallback = function() {
            var filter = arguments[0];
            beforeReloadCallbackOriginal(treeControl, filter, null, null, treeControl._options);
            reloadFilter = filter;
         };

         // Mock TreeViewModel and TreeControl
         treeControl._updatedRoot = true;
         treeControl._children.baseControl._options.beforeReloadCallback = beforeReloadCallback;

         treeViewModel._model._display = {
            setFilter: () => {},
            destroy: () => {},
            getCollapsedGroups: () => undefined,
            getKeyProperty: () => 'id',
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
            unsubscribe: () => {},
            getCount: () => 2,
            getItemBySourceKey: () => undefined
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
               treeControl._afterUpdate({filter: {}, source: source});
               setTimeout(function() {
                  assert.deepEqual([], treeViewModel.getExpandedItems());
                  assert.equal(12, treeControl._root);
                  assert.isTrue(isNeedForceUpdate);
                  treeControl._beforeUpdate({root: treeControl._root});
                  assert.isTrue(resetExpandedItemsCalled);
                  resolve();
               }, 20);
            }, 10);
         });
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
            getCollapsedGroups: () => undefined,
            unsubscribe: () => {},
            destroy: () => {},
            getKeyProperty: () => 'id',
            setRoot: (root) => {
               treeViewModel._model._root = root;
            },
            getRoot: () => treeViewModel._model._root,
            getCount: () => 1,
            getItemBySourceKey: () => undefined
         };

         treeControl._needResetExpandedItems = true;
         tree.TreeControl._private.afterReloadCallback(treeControl, treeControl._options);
         assert.deepEqual([], treeViewModel.getExpandedItems());
         assert.deepEqual({}, treeViewModel.getHasMoreStorage());
      });

      it('_private.getHasMoreData', function() {
         const self = {};
         const sourceController = {
            hasMoreData: (direction, root) => {
               return root ? undefined : true;
            }
         };

         assert.isTrue(tree.TreeControl._private.getHasMoreData(self, sourceController));
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
         treeControl._children.baseControl.getSourceController()._updateQueryPropertiesByItems(items);

         // Mock TreeViewModel and TreeControl

         treeViewModel._model._display = {
            setFilter: () => undefined,
            setRoot: (root) => {
               treeViewModel._model._root = root;
            },
            getCollapsedGroups: () => undefined,
            getKeyProperty: () => 'id',
            unsubscribe: () => {},
            destroy: () => {},
            getRoot: () => treeViewModel._model._root,
            getExpandedItems: () => [1, 2],
            getItems: () => items,
            getCount: () => 2,
            getItemBySourceKey: () => undefined
         };
         treeControl._deepReload = true;

         tree.TreeControl._private.afterReloadCallback(treeControl, treeControl._options, items);

         assert.deepEqual(treeViewModel.getHasMoreStorage(), {
            '1': true,
            '2': false
         });

         treeControl._deepReload = false;
         treeControl._options.deepReload = true;

         tree.TreeControl._private.afterReloadCallback(treeControl, treeControl._options, items);

         assert.deepEqual(treeViewModel.getHasMoreStorage(), {
            '1': true,
            '2': false
         });

         tree.TreeControl._private.afterReloadCallback(treeControl, treeControl._options);

         assert.deepEqual(treeViewModel.getHasMoreStorage(), {
            '1': true,
            '2': false
         });
         items.setMetaData({more: true});
         treeControl._children.baseControl.getSourceController()._navigationController = null;
         treeControl._children.baseControl.getSourceController()._updateQueryPropertiesByItems(items);
         tree.TreeControl._private.afterReloadCallback(treeControl, treeControl._options, items);
         assert.deepEqual(treeViewModel.getHasMoreStorage(), {
            '1': false,
            '2': false
         });
      });

      describe('List navigation', function() {
         var stubScrollToItem;

         before(function() {
            stubScrollToItem = sinon.stub(listMod.BaseControl._private, 'scrollToItem');
            stubScrollToItem.callsFake(function() {
               // mock function working with DOM
            });
         });

         after(function() {
            stubScrollToItem.restore();
            stubScrollToItem = undefined;
         });

         it('by keys', function(done) {
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
                  columns: [],
                  viewModelConstructor: treeGrid.ViewModel,
                  navigation: {
                     source: 'page',
                     sourceConfig: {
                        pageSize: 2,
                        page: 0,
                        hasMore: false
                     }
                  }
               },
               lnTreeControl = correctCreateTreeControl(lnCfg),
               treeGridViewModel = lnTreeControl._children.baseControl.getViewModel();

            setTimeout(async function() {
               assert.deepEqual([], treeGridViewModel._model._expandedItems);

               await lnTreeControl._children.baseControl.setMarkedKey(1);

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
               }, 10);
            }, 10);
         });
      });
      it('TreeControl._beforeUpdate name of property', function() {
         return new Promise((resolve, reject) => {
            var
               source = new sourceLib.Memory({
                  data: [
                     { id: 1, type: true, parentKey: null },
                     { id: 2, type: true, parentKey: null },
                     { id: 11, type: null, parentKey: 1 }
                  ],
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
            setTimeout(() => {
               treeControl._beforeUpdate({
                  root: 'testRoot',
                  parentProperty: 'parentKey',
                  nodeProperty: 'itemType',
                  hasChildrenProperty: 'hasChildren'
               });
               try {
                  assert.equal(treeGridViewModel._options.parentProperty, 'parentKey');
                  assert.equal(treeGridViewModel._model._options.parentProperty, 'parentKey');
                  assert.equal(treeGridViewModel._model._display.getParentProperty(), 'parentKey');
                  assert.equal(treeGridViewModel._options.nodeProperty, 'itemType');
                  assert.equal(treeGridViewModel._model._options.nodeProperty, 'itemType');
                  assert.equal(treeGridViewModel._options.hasChildrenProperty, 'hasChildren');
                  assert.equal(treeGridViewModel._model._options.hasChildrenProperty, 'hasChildren');
                  resolve();
               } catch (e) {
                  reject(e);
               }
            }, 10);
         });
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
            config = {
               columns: [],
               source: source,
               items: new collection.RecordSet({
                  rawData: [],
                  keyProperty: 'id'
               }),
               keyProperty: 'id',
               parentProperty: 'parent'
            },
            treeControl = correctCreateTreeControl(config),
            treeGridViewModel = treeControl._children.baseControl.getViewModel(),
            reloadOriginal = treeControl._children.baseControl.reload;


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
            },
            unsubscribe: () => {},
            destroy: () => {},
            getChildren: function() {
               return {
                  getCount() {
                     return null;
                  }
               };
            },
            getCollection: function () {
               return new collection.RecordSet({
                  rawData: [],
                  idProperty: 'id'
               });
            },
            getItemBySourceItem: function () {
               return null;
            },
            getItemBySourceKey: function () {
               return null;
            },
            getCollapsedGroups: () => undefined,
            getKeyProperty: () => 'id',
            getCount() {
               return null;
            }
         };
         treeGridViewModel.setExpandedItems(['testRoot']);

         return new Promise(function(resolve, reject) {
            treeControl._children.baseControl._options.beforeReloadCallback = function(filter) {
               treeControl._beforeReloadCallback(filter, null, null, treeControl._options);
               filterOnOptionChange = filter;
            };
            treeControl._children.baseControl._sourceController._loadPromise.promise.addCallback(function(result) {
               treeControl._children.baseControl.reload().addCallback(function(res) {
                  const configClone = {...config};
                  configClone.root = 'testRoot';
                  treeControl._beforeUpdate(configClone);
                  treeControl._options.root = 'testRoot';
                  try {
                     assert.deepEqual(treeGridViewModel.getExpandedItems(), []);
                  } catch (e) {
                     reject(e);
                  }

                  let afterUpdatePromise = treeControl._afterUpdate({root: null, filter: {}, source: source});
                  treeControl._children.baseControl._afterUpdate({});
                  afterUpdatePromise.then(function() {
                     try {
                        assert.isTrue(reloadCalled, 'Invalid call "reload" after call "_beforeUpdate" and apply new "root".');
                        assert.isTrue(setRootCalled, 'Invalid call "setRoot" after call "_beforeUpdate" and apply new "root".');
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

      describe('_beforeUpdate', () => {

         it('_afterReloadCallback called after data loaded by sourceController', async () => {
            const source = new sourceLib.Memory();
            const items = new collection.RecordSet({
               rawData: [],
               idProperty: 'id'
            });
            const sourceController = new dataSource.NewSourceController({
               source: 'id'
            });
            sourceController.setItems(items);
            let cfg = {
               columns: [],
               source,
               sourceController,
               root: 'test'
            };
            let afterReloadCallbackCalled = false;
            const treeCreateObject = correctCreateTreeControl(cfg, true);
            const treeControl = treeCreateObject.treeControl;
            await treeControl.createPromise;

            cfg = {...cfg};
            cfg.source = new sourceLib.Memory();
            cfg.afterReloadCallback = () => {
               afterReloadCallbackCalled = true;
            };
            treeControl.saveOptions(cfg);
            treeControl._beforeUpdate(cfg);
            assert.isTrue(afterReloadCallbackCalled);
         });

      });

      it('TreeControl._private.prepareHasMoreStorage', function() {
         const sourceController = new dataSource.NewSourceController({
            source: new sourceLib.Memory(),
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 2,
                  page: 0,
                  hasMore: true
               }
            }
         });
         const recordSet = new collection.RecordSet({});
         const moreDataRecordSet = new collection.RecordSet({
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
         recordSet.setMetaData({ more: moreDataRecordSet });
         sourceController._updateQueryPropertiesByItems(recordSet);
         const hasMoreResult = {
            1: true,
            2: false
         };
         assert.deepEqual(hasMoreResult, tree.TreeControl._private.prepareHasMoreStorage(sourceController, [1, 2]),
            'Invalid value returned from "prepareHasMoreStorage(sourceControllers)".');
      });

      it('TreeControl._private.loadMore', async function () {
         var
             setHasMoreCalled = false,
             mergeItemsCalled = false,
             isIndicatorHasBeenShown = false,
             isIndicatorHasBeenHidden = false,
             dataLoadCallbackCalled = false,
             loadNodeId,
             loadMoreDirection,
             mockedTreeControlInstance = {
                _options: {
                   filter: {
                      testParam: 11101989
                   },
                   dataLoadCallback: function () {
                      dataLoadCallbackCalled = true;
                   },
                   sorting: [{'test': 'ASC'}],
                   parentProperty: 'parent',
                   uniqueKeys: true
                },
                _children: {
                   baseControl: {
                      getViewModel: function () {
                         return {
                            setHasMoreStorage: function () {
                               setHasMoreCalled = true;
                            },
                            mergeItems: function () {
                               mergeItemsCalled = true;
                            },
                            getExpandedItems: () => []
                         };
                      },
                      showIndicator() {
                         isIndicatorHasBeenShown = true;
                      },
                      hideIndicator() {
                         isIndicatorHasBeenHidden = true;
                      },
                      getSourceController() {
                         return {
                            load: (direction, key) => {
                               loadNodeId = key;
                               loadMoreDirection = direction;
                               return Promise.resolve(new collection.RecordSet());
                            }
                         };
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
         await tree.TreeControl._private.loadMore(mockedTreeControlInstance, dispItem);
         assert.deepEqual({
                testParam: 11101989
             }, mockedTreeControlInstance._options.filter,
             'Invalid value "filter" after call "TreeControl._private.loadMore(...)".');
         assert.isTrue(setHasMoreCalled, 'Invalid call "setHasMore" by "TreeControl._private.loadMore(...)".');
         assert.isTrue(mergeItemsCalled, 'Invalid call "mergeItemsCalled" by "TreeControl._private.loadMore(...)".');
         assert.isTrue(dataLoadCallbackCalled, 'Invalid call "dataLoadCallbackCalled" by "TreeControl._private.loadMore(...)".');
         assert.isTrue(isIndicatorHasBeenShown);
         assert.isTrue(isIndicatorHasBeenHidden);
         assert.equal(loadNodeId, 1);
         assert.equal(loadMoreDirection, 'down');
      });
      describe('EditInPlace', function() {
         it('cancelEdit on change root', function() {
            var
                cfg = {
                   columns: [],
                   source: new sourceLib.Memory(),
                   items: new collection.RecordSet({
                      rawData: [],
                      idProperty: 'id'
                   }),
                   root: 'test'
                },
               treeControl = correctCreateTreeControl(cfg),
               cancelEditCalled = false;
            treeControl._children.baseControl.cancelEdit = function() {
               cancelEditCalled = true;
            };

            let cfgClone = {...cfg};
            cfgClone.root = 'test2';
            treeControl.isEditing = () => true;
            treeControl._beforeUpdate(cfgClone);
            assert.isTrue(cancelEditCalled);

            treeControl = correctCreateTreeControl({...cfg, editingConfig: undefined});
            cancelEditCalled = false;

            cfgClone = {...cfg, editingConfig: undefined};
            cfgClone.root = 'test3';
            treeControl._beforeUpdate(cfgClone);
            assert.isFalse(cancelEditCalled);
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
      it('Expand all', function() {
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
         return new Promise(function(resolve, reject) {
            setTimeout(function () {
               try {
                  assert.deepEqual([null], treeGridViewModel._model._expandedItems);
                  assert.deepEqual([], treeGridViewModel._model._collapsedItems);
                  treeGridViewModel.toggleExpanded(treeGridViewModel._model._display.at(0));
               } catch(e) {
                  reject(e);
               }
               setTimeout(function() {
                  try {
                     assert.deepEqual([null], treeGridViewModel._model._expandedItems);
                     assert.deepEqual([1], treeGridViewModel._model._collapsedItems);
                     resolve();
                  } catch(e) {
                     reject(e);
                  }
               }, 10);
            }, 10);
         });
      });

      it('expandedItems bindind 1', function(done){
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
         var createObject = correctCreateTreeControl(_cfg, true);
         var treeControl1 = createObject.treeControl;

         createObject.createPromise.then(() => {
            var treeGridViewModel1 = treeControl1._children.baseControl.getViewModel();
            assert.deepEqual([1], treeGridViewModel1._model._expandedItems,'wrong expandedItems');
            treeControl1.toggleExpanded(1);
            treeControl1._beforeUpdate(_cfg);
            setTimeout(()=>{
               assert.deepEqual([], treeControl1._children.baseControl.getViewModel()._model._expandedItems,'wrong expandedItems after _breforeUpdate');
               done();
            }, 10);
         });
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
            savedMethod = tree.TreeControl._private.toggleExpanded,
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
               nativeEvent: {
                  buttons: 1,
                  button: 0
               },
               stopImmediatePropagation: function(){}
            },
            treeControl = new tree.TreeControl(cfg),
            treeGridViewModel = new treeGrid.ViewModel(cfg);
         treeControl.saveOptions(cfg);
         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: rawData,
            keyProperty: 'id'
         }), cfg);

         treeControl._children = {
            baseControl: {
               getViewModel: function() {
                  return treeGridViewModel;
               },
               setMarkedKey(key) { treeGridViewModel._model._markedKey = key; }
            }
         };

         tree.TreeControl._private.toggleExpanded = function(){};

         treeControl._mouseDownExpanderKey = 1;
         treeControl._onExpanderMouseUp(e, 1, treeGridViewModel.at(0));
         assert.deepEqual(1, treeGridViewModel._model._markedKey);

         treeControl._mouseDownExpanderKey = 2;
         treeControl._onExpanderMouseUp(e, 2, treeGridViewModel.at(1));
         assert.deepEqual(2, treeGridViewModel._model._markedKey);

         tree.TreeControl._private.toggleExpanded = savedMethod;
      });

      it('markItemByExpanderClick false', function() {

         var
            savedMethod = tree.TreeControl._private.toggleExpanded,
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
               nativeEvent: {
                  buttons: 1,
                  button: 0
               },
               stopImmediatePropagation: function(){}
            },
            treeControl = new tree.TreeControl(cfg),
            treeGridViewModel = new treeGrid.ViewModel(cfg),
            expectedMarkedKey = 1;
         treeControl.saveOptions(cfg);
         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: rawData,
            keyProperty: 'id'
         }), cfg);

         treeControl._children = {
            baseControl: {
               getViewModel: function() {
                  return treeGridViewModel;
               },
               setMarkedKey(key) {
                  assert.equal(key, expectedMarkedKey);
               }
            }
         };

         tree.TreeControl._private.toggleExpanded = function(){};

         treeControl._mouseDownExpanderKey = 0;
         treeControl._onExpanderMouseUp(e, 0, treeGridViewModel.at(0));

         treeControl._mouseDownExpanderKey = 1;
         treeControl._onExpanderMouseUp(e, 1, treeGridViewModel.at(1));

         tree.TreeControl._private.toggleExpanded = savedMethod;
      });

      it('reloadItem', async function() {
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

         const createResult = correctCreateTreeControl(cfg, true);
         await createResult.createPromise;
         const treeControl = createResult.treeControl;
         const viewModel = treeControl._children.baseControl.getViewModel();


         viewModel.setItems(new collection.RecordSet({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         }), cfg);

         var oldItems = viewModel.getItems();
         assert.deepEqual(oldItems.getRawData(), getHierarchyData());

         await treeControl.reloadItem(0, {}, 'depth');

         const newItems = viewModel.getItems();
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
             {}
         );

         viewModel.setExpandedItems([0]);
         await treeControl.reloadItem(0, {}, 'depth');
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
         );
      });

      it('toggle node by click', async function() {
         let
             isIndicatorHasBeenShown = false,
             isIndicatorHasBeenHidden = false,
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
                expandByItemClick: true,
                navigation: {
                   source: 'page',
                   sourceConfig: {
                      pageSize: 10,
                      page: 0,
                      hasMore: true
                   }
                }
             },
             treeGridViewModel = new treeGrid.ViewModel(cfg),
             treeControl,
             sourceController = new dataSource.NewSourceController(cfg);

         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: data,
            keyProperty: 'id'
         }), cfg);

         treeControl = new tree.TreeControl(cfg);
         treeControl.saveOptions(cfg);
         treeControl._children = {
            baseControl: {
               _options: {markerVisibility: 'hidden'},
               getViewModel: function() {
                  return treeGridViewModel;
               },
               showIndicator() {
                  isIndicatorHasBeenShown = true;
               },
               hideIndicator() {
                  isIndicatorHasBeenHidden = true;
               },
               getSourceController: () => sourceController
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
         await treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(0).getContents(), {}, undefined, true);
         assertTestCaseResult([0]);

         await treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(1).getContents(), {}, undefined, true);
         assertTestCaseResult([0, 1]);

         // Leaf
         await treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(2).getContents(), {}, undefined, true);
         assertTestCaseResult([0, 1], false);

         // Closing. Child items loaded
         await treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(0).getContents(), {}, undefined, true);
         assertTestCaseResult([1], false);

         await treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(1).getContents(), {}, undefined, true);
         assertTestCaseResult([], false);

         await treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(2).getContents(), {}, undefined, true);
         assertTestCaseResult([], false);

         // Expanding. Child items loaded
         await treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(0).getContents(), {}, undefined, true);
         assertTestCaseResult([0], false);

         await treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(1).getContents(), {}, undefined, true);
         assertTestCaseResult([0, 1], false);

         await treeControl._onItemClick(fakeEvent, treeGridViewModel.getDisplay().at(2).getContents(), {}, undefined, true);
         assertTestCaseResult([0, 1], false);
      });


       it('don\'t toggle node by click if handler returns false', async function() {
           const savedMethod = tree.TreeControl._private.createSourceController;
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
           }), cfg);

           treeControl = new tree.TreeControl(cfg);
           treeControl.saveOptions(cfg);
           treeControl._children = {
               baseControl: {
                   getViewModel: function() {
                       return treeGridViewModel;
                   },
                  showIndicator() {
                  },
                  hideIndicator() {
                  },
                  getSourceController() {
                     return new dataSource.NewSourceController({
                        source: new sourceLib.Memory()
                     });
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

           tree.TreeControl._private.createSourceController = savedMethod;
       });

      it('don\'t toggle node by click on breadcrumbs', async function() {
         const savedMethod = tree.TreeControl._private.createSourceController;
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
         }), cfg);

         treeControl = new tree.TreeControl(cfg);
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

         tree.TreeControl._private.createSourceController = savedMethod;
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
         }), cfg);

         assert.deepEqual(tree.TreeControl._private.getReloadableNodes(treeGridViewModel, 0, 'id', 'Раздел@'), [1]);
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
                  },
                  getSourceController: () => {
                     return {
                        setExpandedItems: () => {}
                     };
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
                  },
                  getSourceController: () => {
                     return {
                        setExpandedItems: () => {}
                     };
                  }
               }
            }
         };
         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         }), cfg);
         treeGridViewModel.setExpandedItems([null]);

         var filter = {};

         filter = {};
         cfg.selectedKeys = [];
         selfWithBaseControl._nodesSourceControllers = getNodesSourceControllers();
         tree.TreeControl._private.beforeReloadCallback(selfWithBaseControl, filter, null, null, cfg);
         assert.isFalse(!!selfWithBaseControl._nodesSourceControllers[1]);

         treeGridViewModel.setExpandedItems([1, 2]);
         filter = {};
         selfWithBaseControl._nodesSourceControllers = getNodesSourceControllers();
         tree.TreeControl._private.beforeReloadCallback(selfWithBaseControl, filter, null, null, cfg);
         assert.isTrue(selfWithBaseControl._nodesSourceControllers.has(1));
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
         }), cfg);

         tree.TreeControl._private.applyReloadedNodes(treeGridViewModel, 0, 'id', 'Раздел@', newItems);

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
         }), cfg);
         var nodes = [];
         var lists = [];

         tree.TreeControl._private.nodeChildsIterator(treeGridViewModel, 0, 'Раздел@',
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
