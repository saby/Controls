define([
   'Controls/tree',
   'Controls/treeGridOld',
   'Controls/list',
   'Core/Deferred',
   'Core/core-merge',
   'Core/core-instance',
   'Env/Env',
   'Types/collection',
   'Types/source',
   'Controls/Application/SettingsController',
   'Controls/listDragNDrop',
   'Controls/dataSource',
   'ControlsUnit/CustomAsserts',
   'Types/entity'
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
   dataSource,
   asserts,
   entity
) {
   function correctCreateTreeControl(cfg, returnCreatePromise) {
      var
         treeControl,
         createPromise,
         cfgTreeControl = cfg;

      if (!cfg.hasOwnProperty('viewModelConstructor')) {
         cfgTreeControl = cMerge(cfg, {
            viewModelConstructor: treeGrid.ViewModel
         });
      }

      cfgTreeControl = Object.assign(tree.TreeControl.getDefaultOptions(), cfgTreeControl);
      // Костыль с получением данных из источника по приватному полю
      // Т.к. сейчас все тесты ожидают построение по источнику, а не по sourceController'у
      // Единственный способ оживить массово тесты
      if (cfgTreeControl.source && !cfgTreeControl.sourceController) {
         cfgTreeControl.sourceController = new dataSource.NewSourceController({
            source: cfgTreeControl.source,
            navigation: cfgTreeControl.navigation,
            expandedItems: cfgTreeControl.expandedItems,
            root: cfgTreeControl.root,
            keyProperty: cfgTreeControl.keyProperty || (cfgTreeControl.source && cfgTreeControl.source.getKeyProperty())
         });

         if (cfgTreeControl.source._$data) {
            cfgTreeControl.sourceController.setItems(new collection.RecordSet({
               rawData: cfgTreeControl.source._$data
            }));
         }
      }
      treeControl = new tree.TreeControl(cfgTreeControl);
      treeControl._children = {};
      treeControl.saveOptions(cfgTreeControl);
      createPromise = treeControl._beforeMount(cfgTreeControl);

      if (returnCreatePromise) {
         return {
            treeControl,
            createPromise
         };
      } else {
         return treeControl;
      }
   }

   async function correctCreateTreeControlAsync(cfg) {
      let cloneCfg = {...cfg};
      if (cloneCfg.source) {
         cloneCfg.sourceController = new dataSource.NewSourceController({
            source: cloneCfg.source,
            navigation: cloneCfg.navigation,
            expandedItems: cloneCfg.expandedItems,
            parentProperty: cloneCfg.parentProperty,
            root: cloneCfg.root,
            keyProperty: cloneCfg.keyProperty || (cloneCfg.source && cloneCfg.source.getKeyProperty()),
            dataLoadCallback: cloneCfg.dataLoadCallback
         });

         await cloneCfg.sourceController.reload();
      }
      const createResult = correctCreateTreeControl(cloneCfg, true);
      await createResult.createPromise;
      return createResult.treeControl;
   }

   function getHierarchyData() {
      return [
         {id: 0, 'Раздел@': true, "Раздел": null},
         {id: 1, 'Раздел@': false, "Раздел": 0},
         {id: 2, 'Раздел@': null, "Раздел": 0},
         {id: 3, 'Раздел@': null, "Раздел": 1},
         {id: 4, 'Раздел@': null, "Раздел": null}
      ];
   }

   describe('Controls.tree.TreeControl', function() {
      it('TreeControl creating with expandedItems', async function() {
         let loadResult;
         const treeControlConfig = {
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
               loadResult = items;
            }
         };
         await correctCreateTreeControlAsync(treeControlConfig);
         assert.deepEqual(loadResult.getRawData(), [{
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
         treeControl._listViewModel = {
            getExpandedItems: function() {
               return [1];
            },
            setExpandedItems: function() {},
            setCollapsedItems: function() {},
            toggleExpanded: function(){},
            isExpandAll: function() {
               return false;
            },
            resetExpandedItems: function() {},
            isExpanded: function() {
               return false;
            },
            getChildren: function() {
               return [{
                  getContents: () => ({
                     getKey: () => 1
                  })
               }];
            },
            getIndexByKey: function() {

            },
            getRoot: function() {},
            getCount: function(){
               return 2;
            },
            setHasMoreStorage: function() {},
            getHasMoreStorage: function() {return {
               '1': false
            }},
            appendItems: function() {},
            mergeItems: function() {},
            getItemBySourceKey: () => ({
               setExpanded: () => null,
               isRoot: () => false
            }),
            getCollection: () => new collection.RecordSet(),
            getChildrenByRecordSet: () => false
         };
         treeControl._expandController.updateOptions({model: treeControl._listViewModel});

         treeControl.getVirtualScroll = function(){
            return {
               ItemsCount: 0,
               updateItemsIndexesOnToggle: function() {
               }
            };
         };
         const originLoad = treeControl.getSourceController().load;
         treeControl.getSourceController().load = function() {
            isSourceControllerUsed = true;
            return originLoad.apply(this, arguments);
         };

         treeControl.getSourceController().hasMoreData = function() {
            return false;
         };

         treeControl.getSourceController().hasLoaded = function(key) {
            return key === 1;
         };
         // Test
         await tree.TreeControl._private.toggleExpanded(treeControl, {
            getContents: () => ({
               getKey: () => 1
            }),
            isRoot: () => false,
            isExpanded: () => false
         });
         assert.isFalse(isSourceControllerUsed);
         assert.isFalse(nodeLoadCallbackCalled);

         await tree.TreeControl._private.toggleExpanded(treeControl, {
            getContents: () => ({
               getKey: () => 2
            }),
            isRoot: function() {
               return false;
            },
            isExpanded: () => false
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
               markerVisiblity: 'visible'
            },
            treeControl = correctCreateTreeControl(cfg);
         treeControl.toggleExpanded = function(key) {
            toggleExpandedStack.push(key);
         };
         var model = treeControl.getViewModel();
         model.setItems(new collection.RecordSet({
            rawData: rawData,
            keyProperty: 'key'
         }), cfg);
         treeControl.setMarkedKey(1);
         tree.TreeControl._private.expandMarkedItem(treeControl);
         treeControl.setMarkedKey(2);
         tree.TreeControl._private.expandMarkedItem(treeControl);
         treeControl.setMarkedKey(3);
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

         const treeControl = {
            _listViewModel: {}
         };
         const target = tree.TreeControl._private.getTargetRow(treeControl, event);
         assert.equal(event.target, target);
      });

      it('_private.shouldLoadChildren', async function() {
         let treeControl;
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
         const treeControlConfig = {
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
         };
         const shouldLoadChildrenResult = {
            'node_has_loaded_children': false,
            'node_has_unloaded_children': true,
            'node_has_no_children': false
         };

         treeControl = await correctCreateTreeControlAsync(treeControlConfig);

         for (const nodeKey in shouldLoadChildrenResult) {
            const
                expectedResult = shouldLoadChildrenResult[nodeKey];
            assert.strictEqual(
                tree.TreeControl._private.shouldLoadChildren(treeControl, nodeKey),
                expectedResult,
                '_private.shouldLoadChildren returns unexpected result for ' + nodeKey
            );
         }
      });

      it('_private.shouldLoadChildren without navigation', async function() {
         let treeControl;
         const
             source = new sourceLib.Memory({
                keyProperty: 'id',
                data: [
                   {
                      id: 'leaf',
                      parent: 'node',
                      nodeType: null,
                      hasChildren: false
                   },

                   {
                      id: 'node',
                      parent: null,
                      nodeType: true,
                      hasChildren: false
                   }
                ],
                filter: function() {
                   return true;
                }
             });
         const treeControlConfig = {
            columns: [],
            parentProperty: 'parent',
            nodeProperty: 'nodeType',
            hasChildrenProperty: 'hasChildren',
            source: source
         };

         treeControl = await correctCreateTreeControlAsync(treeControlConfig);
         assert.isFalse(tree.TreeControl._private.shouldLoadChildren(treeControl, 'node'));
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
            fakeDispItem = {
               getContents: function() {
                  return {
                     getKey: function() {
                        return 1;
                     }
                  };
               },
               isRoot: function() {
                  return false;
               },
               isExpanded: () => false
            };

         let loadedDataFromServer = false;

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

         tree.TreeControl._private.toggleExpanded(treeControl, fakeDispItem);

         tree.TreeControl._private.createSourceController = originalCreateSourceController;
         tree.TreeControl._private.shouldLoadChildren = originalShouldLoadChildren;

         assert.isFalse(loadedDataFromServer);
         assert.isTrue(treeControl._expandController.isItemExpanded(fakeDispItem.getContents().getKey()));
      });

      // it('TreeControl.reload', async function() {
      //    var createControlResult = correctCreateTreeControl({
      //         parentProperty: '',
      //         columns: [],
      //          source: new sourceLib.Memory({
      //             data: [],
      //             keyProperty: 'id'
      //          })
      //       }, true);
      //    var vmHasMoreStorage = null;
      //
      //    //viewmodel moch
      //    createControlResult.treeControl._listViewModel = {
      //          setHasMoreStorage: function (hms) {
      //             vmHasMoreStorage = hms;
      //          },
      //          getHasMoreStorage: () => {
      //             return {};
      //          },
      //          getExpandedItems: function() {
      //             return [1];
      //          },
      //          isExpandAll: function() {
      //             return false;
      //          },
      //          resetExpandedItems: function() {
      //
      //          },
      //          getRoot: function() {},
      //          getItems: function() {
      //             return {
      //                at: function () {}
      //             };
      //          },
      //          getItemBySourceKey: () => undefined
      //    };
      //
      //    await createControlResult.createPromise;
      //    await createControlResult.treeControl.reload();
      //    assert.deepEqual({1: false}, vmHasMoreStorage);
      // });

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
         const treeViewModel = treeControl.getViewModel();

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
         treeControl._afterReloadCallback(treeControl._options);
         assert.deepEqual([], treeViewModel.getExpandedItems());
         assert.deepEqual({}, treeViewModel.getHasMoreStorage());
      });

      // it('TreeControl.afterReloadCallback created source controller with multi root navigation', function () {
      //    const source = new sourceLib.Memory({
      //       data: [],
      //       idProperty: 'id'
      //    });
      //    const treeControl = correctCreateTreeControl({
      //       columns: [],
      //       root: null,
      //       parentProperty: 'testParentProperty',
      //       nodeProperty: '@parent',
      //       source: source,
      //       expandedItems: [1, 2],
      //       navigation: {
      //          source: 'page',
      //          sourceConfig: {
      //             pageSize: 10,
      //             page: 0,
      //             hasMore: true
      //          }
      //       }
      //    });
      //    const treeViewModel = treeControl.getViewModel();
      //    const moreDataRs = new collection.RecordSet({
      //       keyProperty: 'id',
      //       rawData: [
      //          {
      //             id: 1,
      //             nav_result: true
      //          },
      //          {
      //             id: 2,
      //             nav_result: false
      //          }
      //       ]
      //    });
      //    const items = new collection.RecordSet({
      //       keyProperty: 'id',
      //       rawData: [
      //          {
      //             'id': 1,
      //             '@parent': true
      //          },
      //          {
      //             'id': 2,
      //             '@parent': true
      //          },
      //          {
      //             'id': 3,
      //             '@parent': false
      //          }
      //       ]
      //    });
      //    items.setMetaData({ more: moreDataRs });
      //    treeControl.getSourceController()._updateQueryPropertiesByItems(items);
      //
      //    // Mock TreeViewModel and TreeControl
      //
      //    treeViewModel._model._display = {
      //       setFilter: () => undefined,
      //       setRoot: (root) => {
      //          treeViewModel._model._root = root;
      //       },
      //       getCollapsedGroups: () => undefined,
      //       getKeyProperty: () => 'id',
      //       unsubscribe: () => {},
      //       destroy: () => {},
      //       getRoot: () => treeViewModel._model._root,
      //       getExpandedItems: () => [1, 2],
      //       getItems: () => items,
      //       getCount: () => 2,
      //       getItemBySourceKey: () => undefined
      //    };
      //    treeControl._deepReload = true;
      //
      //    treeControl._afterReloadCallback(treeControl._options, items);
      //
      //    assert.deepEqual(treeViewModel.getHasMoreStorage(), {
      //       '1': true,
      //       '2': false
      //    });
      //
      //    treeControl._deepReload = false;
      //    treeControl._options.deepReload = true;
      //
      //    tree.TreeControl._private.afterReloadCallback(treeControl, treeControl._options, items);
      //
      //    assert.deepEqual(treeViewModel.getHasMoreStorage(), {
      //       '1': true,
      //       '2': false
      //    });
      //
      //    tree.TreeControl._private.afterReloadCallback(treeControl, treeControl._options);
      //
      //    assert.deepEqual(treeViewModel.getHasMoreStorage(), {
      //       '1': true,
      //       '2': false
      //    });
      //    items.setMetaData({more: true});
      //    treeControl.getSourceController()._navigationController = null;
      //    treeControl.getSourceController()._updateQueryPropertiesByItems(items);
      //    tree.TreeControl._private.afterReloadCallback(treeControl, treeControl._options, items);
      //    assert.deepEqual(treeViewModel.getHasMoreStorage(), {
      //       '1': false,
      //       '2': false
      //    });
      // });

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

         it('by keys', async function() {
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
               lnTreeControl = await correctCreateTreeControlAsync(lnCfg);

            assert.deepEqual([], lnTreeControl._expandController.getExpandedItems());

            await lnTreeControl.setMarkedKey(1);

            return new Promise((resolve) => {
               setTimeout(async function() {
                  assert.deepEqual([], lnTreeControl._expandController.getExpandedItems());

                  await lnTreeControl.setMarkedKey(1);

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
                     assert.deepEqual([1], lnTreeControl._expandController.getExpandedItems());

                     lnTreeControl._onTreeViewKeyDown({
                        stopImmediatePropagation: function() {
                           stopImmediateCalled = true;
                        },
                        target: {closest() { return false; }},
                        nativeEvent: {
                           keyCode: Env.constants.key.left
                        }
                     });
                     assert.deepEqual([], lnTreeControl._expandController.getExpandedItems());

                     assert.isTrue(stopImmediateCalled, 'Invalid value "stopImmediateCalled"');
                     resolve();
                  }, 10);
               }, 10);
            });
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
               treeGridViewModel = treeControl.getViewModel();
            setTimeout(() => {
               treeControl._beforeUpdate({
                  viewModelConstructor: treeControl._options.viewModelConstructor,
                  root: 'testRoot',
                  parentProperty: 'parentKey',
                  nodeProperty: 'itemType',
                   multiSelectVisibility: 'hidden',
                   selectedKeys: [],
                   excludedKeys: [],
                   selectionType: 'all',
                  hasChildrenProperty: 'hasChildren',
                  source: source
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
         it('saving sorting', async function() {
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
               sorting: [1],
               selectedKeys: [],
               excludedKeys: []
            };
            var cfg1 = {...cfg, propStorageId: '1'};
            cfg1.sorting = [2];
            var treeControl = await correctCreateTreeControlAsync(({...cfg}));
            treeControl.saveOptions(cfg);
            treeControl._beforeUpdate(cfg);
            assert.isFalse(saveConfigCalled);
            treeControl._beforeUpdate({...cfg, sorting: [3]});
            assert.isFalse(saveConfigCalled);
            treeControl._beforeUpdate(cfg1);
            assert.isTrue(saveConfigCalled);

         });
      });

      describe('_beforeUpdate', () => {
         it('_beforeUpdate with new expandedItems', async () => {
            let options = {
               expandedItems: [],
               keyProperty: 'id',
               source: new sourceLib.Memory()
            };
            const treeControl = await correctCreateTreeControlAsync(options);
            delete treeControl._expandController._options.loader;

            options = {...treeControl._options};
            options.expandedItems = ['testId'];
            treeControl._beforeUpdate(options);
            assert.deepStrictEqual(treeControl._options.sourceController.getExpandedItems(), ['testId']);
         });

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
               root: 'test',
               keyProperty: 'id',
               selectionType: 'all'
            };
            let afterReloadCallbackCalled = false;
            const treeCreateObject = correctCreateTreeControl(cfg, true);
            const treeControl = treeCreateObject.treeControl;
            await treeControl.createPromise;

            cfg = {...cfg};
            cfg.source = new sourceLib.Memory();
            treeControl.saveOptions(cfg);
            treeControl._afterReloadCallback = () => {
                afterReloadCallbackCalled = true;
            };
            treeControl._beforeUpdate(cfg);
            await sourceController.reload();
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

      it('TreeControl._private.loadNodeChildren', async function () {
         let dataLoadCallbackCalled = false;
         const options = {
            filter: {
               testParam: 11101989
            },
            dataLoadCallback: function () {
               dataLoadCallbackCalled = true;
            },
            sorting: [{'test': 'ASC'}],
            parentProperty: 'parent',
            uniqueKeys: true,
            source: new sourceLib.Memory()
         };
         options.sourceController = new dataSource.NewSourceController({...options});
         options.sourceController.setItems(new collection.RecordSet());
         var
             hasMore = false,
             isIndicatorHasBeenShown = false,
             isIndicatorHasBeenHidden = false,
             loadNodeId,
             loadMoreDirection,
             mockedTreeControlInstance = {
                _options: options,
                _expandController: {
                   getExpandedItems: () => ([1])
                },
                _listViewModel: {
                   setHasMoreStorage: function (hasMoreStorage) {
                      hasMore = hasMoreStorage;
                   },
                   getExpandedItems: () => [1],
                   getCollection: () => new collection.RecordSet()
                },
                showIndicator() {
                   isIndicatorHasBeenShown = true;
                },
                hideIndicator() {
                   isIndicatorHasBeenHidden = true;
                },
                stopBatchAdding() {
                },
                getSourceController() {
                   return {
                      load: (direction, key) => {
                         loadNodeId = key;
                         loadMoreDirection = direction;
                         return options.sourceController.load(direction, key);
                      },
                      hasMoreData: () => true
                   };
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
         await tree.TreeControl._private.loadNodeChildren(mockedTreeControlInstance, dispItem.getContents().getId());
         assert.deepEqual({
                testParam: 11101989
             }, mockedTreeControlInstance._options.filter,
             'Invalid value "filter" after call "TreeControl._private.loadNodeChildren(...)".');
         assert.deepEqual(hasMore, {1: true});
         assert.isTrue(dataLoadCallbackCalled, 'Invalid call "dataLoadCallbackCalled" by "TreeControl._private.loadNodeChildren(...)".');
         assert.isTrue(isIndicatorHasBeenShown);
         assert.isTrue(isIndicatorHasBeenHidden);
         assert.equal(loadNodeId, 1);
         assert.equal(loadMoreDirection, 'down');
      });

      describe('EditInPlace', function() {
         it('cancelEdit on change root', async function () {
            const options = {
               columns: [],
               source: new sourceLib.Memory(),
               items: new collection.RecordSet({
                  rawData: [],
                  idProperty: 'id'
               }),
               root: 'test',
               selectionType: 'all',
               selectedKeys: [],
               excludedKeys: [],
               keyProperty: 'id'
            };
            const newOptions1 = {
               ...options,
               root: 'test2'
            };
            const newOptions2 = {
               ...options,
               root: 'test3'
            };
            let cancelEditCalled = false;
            const treeControl = await correctCreateTreeControlAsync({...options, editingConfig: undefined});
            treeControl.cancelEdit = () => {
               cancelEditCalled = true;
            };

            treeControl.isEditing = () => true;
            treeControl._beforeUpdate({ ...newOptions1, viewModelConstructor: treeControl._viewModelConstructor });
            assert.isTrue(cancelEditCalled);
            cancelEditCalled = false;
            treeControl.saveOptions({ ...newOptions1, viewModelConstructor: treeControl._viewModelConstructor });

            treeControl.isEditing = () => false;
            treeControl._beforeUpdate({ ...newOptions2, viewModelConstructor: treeControl._viewModelConstructor });
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
               }),
                keyProperty: 'id'
            });
         treeControl.reload();
         assert.deepEqual([2246, 452815, 457244, 471641], treeControl.getViewModel().getExpandedItems());
      });
      it('Expand all', async function() {
         const treeControlConfig = {
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
         };
         const treeControl = await correctCreateTreeControlAsync(treeControlConfig);
         const treeGridViewModel = treeControl.getViewModel();

         assert.deepEqual([null], treeGridViewModel._model._expandedItems);
         assert.deepEqual([], treeGridViewModel._model._collapsedItems);

         treeGridViewModel.toggleExpanded(treeGridViewModel._model._display.at(0));
         assert.deepEqual([null], treeGridViewModel._model._expandedItems);
         assert.deepEqual([1], treeGridViewModel._model._collapsedItems);
      });

      it('expandedItems binding 2', async function(){
         const _cfg = {
            source: new sourceLib.Memory({
               data: [
                  { id: 1, type: true, parent: null },
                  { id: 2, type: true, parent: null },
                  { id: 11, type: null, parent: 1 }
               ],
               keyProperty: 'id'
            }),
            columns: [],
            selectionType: 'all',
            selectedKeys: [],
            excludedKeys: [],
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'type',
         };
         const treeControl = await correctCreateTreeControlAsync(_cfg);
         const treeGridViewModel1 = treeControl.getViewModel();

         assert.deepEqual([], treeGridViewModel1._model._expandedItems, 'wrong expandedItems');

         await treeControl.toggleExpanded(1);
         treeControl._beforeUpdate({..._cfg, viewModelConstructor: treeControl._viewModelConstructor});
         assert.deepEqual([1], treeGridViewModel1._model._expandedItems, 'wrong expandedItems after _breforeUpdate');
      });

      it('collapsedItems bindind', async function(){
         //collapsedItems задана, и после обновления контрола, должна соответствовать начальной опции
         const _cfg = {
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
            collapsedItems: [],
            selectionType: 'all',
            selectedKeys: [],
            excludedKeys: []
         };
         const treeControl = await correctCreateTreeControlAsync(_cfg);
         const treeGridViewModel1 = treeControl.getViewModel();

         assert.deepEqual([], treeGridViewModel1._model._collapsedItems, 'wrong collapsedItems');

         await treeControl.toggleExpanded(1);
         treeControl._beforeUpdate({ ..._cfg, viewModelConstructor: treeControl._viewModelConstructor });
         assert.deepEqual([], treeControl.getViewModel()._model._collapsedItems,'wrong collapsedItems after _breforeUpdate');
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
            sourceController = new dataSource.NewSourceController({
               source: source,
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
         sourceController.setItems(new collection.RecordSet({
            rawData: rawData,
            keyProperty: 'id'
         }))
         treeControl.saveOptions(cfg);
         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: rawData,
            keyProperty: 'id'
         }), cfg);

         treeControl._listViewModel = treeGridViewModel;
         treeControl.setMarkedKey = (key) => { treeGridViewModel._model._markedKey = key; };
         treeControl.isLoading = () => false;

         tree.TreeControl._private.toggleExpanded = function(){};

         treeControl._mouseDownExpanderKey = 1;
         treeControl._onExpanderMouseUp(e.nativeEvent, 1, treeGridViewModel.at(0));
         assert.deepEqual(1, treeGridViewModel._model._markedKey);

         treeControl._mouseDownExpanderKey = 2;
         treeControl._onExpanderMouseUp(e.nativeEvent, 2, treeGridViewModel.at(1));
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
               },
               isLoading: () => false
            }
         };

         tree.TreeControl._private.toggleExpanded = function(){};

         treeControl._mouseDownExpanderKey = 0;
         treeControl._onExpanderMouseUp(e.nativeEvent, 0, treeGridViewModel.at(0));

         treeControl._mouseDownExpanderKey = 1;
         treeControl._onExpanderMouseUp(e.nativeEvent, 1, treeGridViewModel.at(1));

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

         const treeControl = await correctCreateTreeControlAsync(cfg);
         const viewModel = treeControl.getViewModel();


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
                markerVisibility: 'hidden',
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
         treeControl._beforeMount(cfg);
         treeControl.saveOptions(cfg);

         treeControl._listViewModel = treeGridViewModel;
         treeControl._expandController.updateOptions({model: treeGridViewModel});
         treeControl.showIndicator = () => {
            isIndicatorHasBeenShown = true;
         };
         treeControl.hideIndicator = () => {
            isIndicatorHasBeenHidden = true;
         };
         treeControl.getSourceController = () => sourceController;

         // Initial
         assert.deepEqual(treeGridViewModel.getExpandedItems(), []);

         const fakeEvent = {
            stopPropagation: () => {
            },
            isStopped: () => {

            }
         };

         const originalEvent = {
            target: { closest: () => {} }
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
         await treeControl._notifyItemClick([fakeEvent, treeGridViewModel.getDisplay().at(0).getContents(), originalEvent, undefined], true);
         assertTestCaseResult([0]);

         await treeControl._notifyItemClick([fakeEvent, treeGridViewModel.getDisplay().at(1).getContents(), originalEvent, undefined], true);
         assertTestCaseResult([0, 1]);

         // Leaf
         await treeControl._notifyItemClick([fakeEvent, treeGridViewModel.getDisplay().at(2).getContents(), originalEvent, undefined], true);
         assertTestCaseResult([0, 1], false);

         // Closing. Child items loaded
         await treeControl._notifyItemClick([fakeEvent, treeGridViewModel.getDisplay().at(0).getContents(), originalEvent, undefined], true);
         assertTestCaseResult([1], false);

         await treeControl._notifyItemClick([fakeEvent, treeGridViewModel.getDisplay().at(1).getContents(), originalEvent, undefined], true);
         assertTestCaseResult([], false);

         await treeControl._notifyItemClick([fakeEvent, treeGridViewModel.getDisplay().at(2).getContents(), originalEvent, undefined], true);
         assertTestCaseResult([], false);

         // Expanding. Child items loaded
         await treeControl._notifyItemClick([fakeEvent, treeGridViewModel.getDisplay().at(0).getContents(), originalEvent, undefined], true);
         assertTestCaseResult([0], false);

         await treeControl._notifyItemClick([fakeEvent, treeGridViewModel.getDisplay().at(1).getContents(), originalEvent, undefined], true);
         assertTestCaseResult([0, 1], false);

         await treeControl._notifyItemClick([fakeEvent, treeGridViewModel.getDisplay().at(2).getContents(), originalEvent, undefined], true);
         assertTestCaseResult([0, 1], false);
      });


      it('don\'t toggle node by click if handler returns false', async function() {
         const savedMethod = tree.TreeControl._private.createSourceController;
         const data = [
            {id: 0, 'Раздел@': true, Раздел: null},
            {id: 1, 'Раздел@': false, Раздел: null},
            {id: 2, 'Раздел@': null, Раздел: null}
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
         treeControl._beforeMount(cfg);
         treeControl.saveOptions(cfg);
         treeControl._listViewModel = treeGridViewModel;
         treeControl.getSourceController = () => {
            return new dataSource.NewSourceController({
               source: new sourceLib.Memory()
            });
         };

         treeGrid._notify = (eName) => {
            if (eName === 'itemClick') {
               return false;
            }
         };

         // Initial
         assert.deepEqual(treeGridViewModel.getExpandedItems(), []);

         const fakeEvent = {
            stopPropagation: () => {},
            isStopped: () => {}
         };
         const origin = {
            target: {
               closest: () => {}
            }
         };

         treeControl._notifyItemClick([fakeEvent, treeGridViewModel.getDisplay().at(0).getContents(), origin]);
         assert.deepEqual(treeGridViewModel.getExpandedItems(), []);

         treeControl._notifyItemClick([fakeEvent, treeGridViewModel.getDisplay().at(1).getContents(), origin]);
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
            stopPropagation: () => {},
            isStopped: () => false
         };

         const treeGridViewModel = new treeGrid.ViewModel(cfg);
         let treeControl;

         treeGridViewModel.setItems(new collection.RecordSet({
            rawData: data,
            keyProperty: 'id'
         }), cfg);

         treeControl = new tree.TreeControl(cfg);
         treeControl.saveOptions(cfg);
         treeControl._listViewModel = treeGridViewModel;

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
         treeControl._notifyItemClick([fakeEvent, breadcrumb, {
            target: { closest: () => {} }
         }]);
         assert.deepEqual(treeGridViewModel.getExpandedItems(), []);

         tree.TreeControl._private.createSourceController = savedMethod;
      });

      it('itemClick sends right args', function() {
         let isEventRaised = false;

          const data = new collection.RecordSet({
              rawData: [{ id: 1 }],
              keyProperty: 'id'
          });

          const treeControl = correctCreateTreeControl({
              source: new sourceLib.Memory({
                  data,
                  keyProperty: 'id'
              }),
              readOnly: true,
              keyProperty: 'id'
          });
          const item = data.at(0);
         const nativeEvent = {
            target: { closest: () => {} }
         };
         const event = {
            stopPropagation: () => {},
            isStopped: () => false
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

         treeControl._notifyItemClick([event, item, nativeEvent, columnIndex]);
         assert.isTrue(isEventRaised);
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

         tree.TreeControl._private.applyReloadedNodes({_options: {}}, treeGridViewModel, 0, 'id', 'Раздел@', newItems);
         treeGridViewModel.getItems().merge(newItems, {remove: false, inject: true}); // эмуляция работы sourceController'a
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

      it('goToNext, goToPrev', async function() {
         const rs = new collection.RecordSet({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         });
         const source = new sourceLib.Memory({
            rawData: getHierarchyData(),
            keyProperty: 'id',
            filter: () => true
         });

         // 0
         // |-1
         // | |-3
         // |-2
         // 4
         const cfg = {
            source: source,
            columns: [],
            keyProperty: 'id',
            useNewModel: true,
            viewModelConstructor: 'Controls/display:Tree',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            markerMoveMode: 'leaves',
            expandedItems: [],
            markedKey: 4
         };
         const treeControl = await correctCreateTreeControlAsync(cfg);
         treeControl.showIndicator = () => {};
         treeControl.hideIndicator = () => {};
         let newCfg = {...treeControl._options};
         treeControl._notify = (event, args) => {
            if (event === 'expandedItemsChanged') {
               newCfg.expandedItems = args[0];
            }
            if (event === 'markedKeyChanged') {
               newCfg.markedKey = args[0];
            }
         };
         treeControl.getViewModel().setCollection(rs);
         treeControl._afterReloadCallback(cfg, rs);
         treeControl._afterMount();
         assert.equal(treeControl._markedLeaf, 'last');
         await treeControl.goToPrev();
         treeControl._beforeUpdate(newCfg);
         treeControl.saveOptions(newCfg);
         assert.equal(treeControl._markedLeaf, 'middle');
         await treeControl.goToPrev();
         treeControl._beforeUpdate(newCfg);
         treeControl.saveOptions(newCfg);
         assert.equal(treeControl._markedLeaf, 'first');
         await treeControl.goToNext();
         treeControl._beforeUpdate(newCfg);
         treeControl.saveOptions(newCfg);
         assert.equal(treeControl._markedLeaf, 'middle');
         await treeControl.goToNext();
         treeControl._beforeUpdate(newCfg);
         treeControl.saveOptions(newCfg);
         assert.equal(treeControl._markedLeaf, 'last');
      });

      describe('_notifyItemClick', async () => {
         const source = new sourceLib.Memory({
            rawData: getHierarchyData(),
            keyProperty: 'id',
            filter: () => true
         });

         // 0
         // |-1
         // | |-3
         // |-2
         // 4
         const cfg = {
            source: source,
            columns: [],
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            markerMoveMode: 'leaves',
            expandedItems: [],
            markedKey: 4
         };
         const treeControl = await correctCreateTreeControlAsync(cfg);

         it('not should notify itemActivate when click on expander', () => {
            const event = {
               target: {
                  closest: (s) => {
                     return s === '.js-controls-Tree__row-expander';
                  }
               },
               stopImmediatePropagation: () => null
            };
            const spyNotify = sinon.spy(treeControl._notify);

            const item = treeControl._listViewModel.getItemBySourceKey(0);
            treeControl._onItemClick({isStopped: () => false, isBubbling: () => false, stopImmediatePropagation: () => null}, item, event);
            assert.isFalse(spyNotify.withArgs('itemActivate').called);
         });
      });

      describe('resetExpandedItems', async () => {
         const source = new sourceLib.Memory({
            rawData: getHierarchyData(),
            keyProperty: 'id',
            filter: () => true
         });

         // 0
         // |-1
         // | |-3
         // |-2
         // 4
         const cfg = {
            source: source,
            columns: [],
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            expandedItems: [null]
         };
         const treeControl = await correctCreateTreeControlAsync(cfg);

         it('not should resetExpandedItems if expanded all', () => {
            treeControl.resetExpandedItems();
            const expandedItems = treeControl.getViewModel().getExpandedItems();
            assert.deepEqual(expandedItems, [null]);
         });
      });

      describe('toggleExpanded', () => {
         const items = new collection.RecordSet({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         });

         // 0
         // |-1
         // | |-3
         // |-2
         // 4
         const cfg = {
            items,
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            useNewModel: true,
            viewModelConstructor: 'Controls/display:Tree',
            selectedKeys: [],
            excludedKeys: []
         };
         let treeControl, model, notifySpy;

         beforeEach(async() => {
            treeControl = await correctCreateTreeControlAsync(cfg);
            notifySpy = sinon.spy(treeControl, '_notify');
            model = treeControl.getViewModel();

            treeControl._sourceController = {
               setExpandedItems: () => null,
               getExpandedItems: () => null,
               getState: () => {
                  return {};
               },
               updateOptions: () => null,
               hasLoaded: () => true,
               getKeyProperty: () => 'id',
               hasMoreData: () => false,
               isLoading: () => false,
               isDeepReload: () => false,
               wasResetExpandedItems: () => false
            };
         });

         it('expanded items is [null]', async() => {
            treeControl._beforeUpdate({...cfg, expandedItems: [null]});

            await treeControl.toggleExpanded(0);
            assert.isFalse(model.getItemBySourceKey(0).isExpanded());

            await treeControl.toggleExpanded(0);
            assert.isTrue(model.getItemBySourceKey(0).isExpanded());
         });

         it('check expandedItems and collapsedItems options', async() => {
            treeControl._expandController.setExpandedItems([0]);
            treeControl.saveOptions({...cfg, expandedItems: [0], collapsedItems: []});
            notifySpy.resetHistory();
            await treeControl.toggleExpanded(0);

            assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[]]).called);
            assert.isTrue(notifySpy.withArgs('collapsedItemsChanged', [[]]).called);

            treeControl._expandController.setCollapsedItems([0]);
            treeControl.saveOptions({...cfg, expandedItems: [], collapsedItems: [0]});
            notifySpy.resetHistory();
            await treeControl.toggleExpanded(0);

            assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[0]]).called);
            assert.isTrue(notifySpy.withArgs('collapsedItemsChanged', [[]]).called);

            treeControl._expandController.setExpandedItems([null]);
            treeControl._expandController.setCollapsedItems([]);
            treeControl.saveOptions({...cfg, expandedItems: [null], collapsedItems: []});
            notifySpy.resetHistory();
            await treeControl.toggleExpanded(0);

            assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[null]]).called);
            assert.isTrue(notifySpy.withArgs('collapsedItemsChanged', [[0, 1]]).called);

            treeControl._expandController.setExpandedItems([null]);
            treeControl._expandController.setCollapsedItems([0]);
            treeControl.saveOptions({...cfg, expandedItems: [null], collapsedItems: [0]});
            notifySpy.resetHistory();
            await treeControl.toggleExpanded(0);

            assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[null]]).called);
            assert.isTrue(notifySpy.withArgs('collapsedItemsChanged', [[]]).called);
         });

         it('remove child keys from expanded items', async () => {
            treeControl._expandController.setExpandedItems([0, 1]);
            treeControl.saveOptions({...cfg, expandedItems: [0, 1], collapsedItems: []});
            notifySpy.resetHistory();
            await treeControl.toggleExpanded(0);
            assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[]]).called);
         });

         it('reset flag _needResetExpandedItems', async () => {
            const source = new sourceLib.Memory({
               rawData: getHierarchyData(),
               keyProperty: 'id',
               filter: () => true
            });

            treeControl._beforeUpdate({...cfg, root: null, expandedItems: [1], source });
            treeControl.saveOptions({...cfg, root: null, expandedItems: [1], source });
            treeControl._beforeUpdate({...cfg, root: 0, expandedItems: [1], source });
            await treeControl.toggleExpanded(2);
            treeControl._beforeUpdate({...cfg, root: 0, expandedItems: [1, 2], source });
            assert.deepEqual(treeControl._expandController.getExpandedItems(), [1, 2]);
         });
      });

      describe('_getFooterClasses', () => {
         const items = new collection.RecordSet({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         });

         // 0
         // |-1
         // | |-3
         // |-2
         // 4
         const cfg = {
            items,
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            useNewModel: true,
            viewModelConstructor: 'Controls/display:Tree',
            selectedKeys: [],
            excludedKeys: []
         };
         let treeControl;

         it('expanderIcon is none', () => {
            const options = {...cfg, expanderIcon: 'none'};
            treeControl = correctCreateTreeControl(options);
            asserts.CssClassesAssert.notInclude(treeControl._getFooterClasses(options), 'controls-TreeGridView__footer__expanderPadding-default');
         });

         it('expanderVisibility is hasChildren', () => {
            const options = {...cfg, expanderVisibility: 'hasChildren'};
            treeControl = correctCreateTreeControl(options);
            asserts.CssClassesAssert.include(treeControl._getFooterClasses(options), 'controls-TreeGridView__footer__expanderPadding-default');
         });

         it('expanderVisibility is visible', () => {
            const options = {...cfg, expanderVisibility: 'visible'};
            treeControl = correctCreateTreeControl(options);
            asserts.CssClassesAssert.include(treeControl._getFooterClasses(options), 'controls-TreeGridView__footer__expanderPadding-default');
         });

         it('expanderVisibility is visible and not has node', () => {
            const items = new collection.RecordSet({
               rawData: [{id: 1, 'Раздел@': null, "Раздел": null}],
               keyProperty: 'id'
            });
            const options = {...cfg, expanderVisibility: 'visible', items};
            treeControl = correctCreateTreeControl(options);
            asserts.CssClassesAssert.notInclude(treeControl._getFooterClasses(options), 'controls-TreeGridView__footer__expanderPadding-default');
         });
      });

      describe('expandedItems', () => {
         const source = new sourceLib.Memory({
            data: getHierarchyData(),
            keyProperty: 'id',
            filter: () => true
         });

         // 0
         // |-1
         // | |-3
         // |-2
         // 4
         const cfg = {
            source,
            filter: {},
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 20,
                  page: 0,
                  hasMore: false
               }
            },
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            useNewModel: true,
            columns: [],
            viewModelConstructor: 'Controls/treeGrid:TreeGridCollection',
            selectedKeys: [],
            excludedKeys: []
         };
         let treeControl, notifySpy;

         describe('expandedItems is [null]', () => {
            beforeEach(async() => {
               treeControl = await correctCreateTreeControlAsync({...cfg, expandedItems: [null]});
               notifySpy = sinon.spy(treeControl, '_notify');
            });

            it('remove node, expandedItems and collapsed items are not changed', () => {
               const rs = treeControl.getViewModel().getCollection();
               rs.remove(rs.getRecordById(1));
               assert.isFalse(notifySpy.withArgs('expandedItemsChanged').called);
               assert.isFalse(notifySpy.withArgs('collapsedItemsChanged').called);
            });

            it('remove node when set collapsedItems', async () => {
               treeControl = await correctCreateTreeControlAsync({...cfg, expandedItems: [null], collapsedItems: [1]});
               notifySpy = sinon.spy(treeControl, '_notify');

               const rs = treeControl.getViewModel().getCollection();
               rs.remove(rs.getRecordById(1));
               assert.isFalse(notifySpy.withArgs('expandedItemsChanged').called);
               assert.isTrue(notifySpy.withArgs('collapsedItemsChanged', [[]]).called);
            });
         });

         describe('expanded specific items', () => {
            beforeEach(async() => {
               treeControl = await correctCreateTreeControlAsync({...cfg, expandedItems: [0, 1]});
               notifySpy = sinon.spy(treeControl, '_notify');
            });

            it('remove node, expandedItems is changed', () => {
               const rs = treeControl.getViewModel().getCollection();
               rs.remove(rs.getRecordById(1));
               assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[0]]).called);
               assert.isFalse(notifySpy.withArgs('collapsedItemsChanged').called);
            });
         });

         describe('_beforeUpdate', () => {
            beforeEach(async() => {
               treeControl = await correctCreateTreeControlAsync({...cfg, expandedItems: [], collapsedItems: []});
               treeControl._expandController._options.loader = null;
            });

            it('expandedItems', () => {
               const methodSpy = sinon.spy(treeControl._expandController, 'setExpandedItems');
               treeControl._beforeUpdate({...cfg, expandedItems: [1]});
               assert.isTrue(methodSpy.withArgs([1]).called);
            });

            it('collapsedItems', () => {
               const methodSpy = sinon.spy(treeControl._expandController, 'setCollapsedItems');
               treeControl._beforeUpdate({...cfg, collapsedItems: [1]});
               assert.isTrue(methodSpy.withArgs([1]).called);
            });
         });

         it('remove from expanded items all childs of collapsed node', async () => {
            const source = new sourceLib.Memory({
               data: [
                  {id: 0, 'Раздел@': true, "Раздел": null},
                  {id: 1, 'Раздел@': false, "Раздел": 0},
                  {id: 2, 'Раздел@': false, "Раздел": 1},
                  {id: 3, 'Раздел@': false, "Раздел": 2},
                  {id: 4, 'Раздел@': false, "Раздел": 3},
                  {id: 5, 'Раздел@': false, "Раздел": 4},
               ],
               keyProperty: 'id',
               filter: () => true
            });
            treeControl = await correctCreateTreeControlAsync({...cfg, source, expandedItems: [0, 1, 2, 3, 4, 5]});
            notifySpy = sinon.spy(treeControl, '_notify');

            await treeControl.toggleExpanded(0);

            assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[]]).called);
         });
      });

      describe('hasMoreStorage', () => {
         const source = new sourceLib.Memory({
            data: getHierarchyData(),
            keyProperty: 'id',
            filter: () => true
         });

         // 0
         // |-1
         // | |-3
         // |-2
         // 4
         const cfg = {
            source,
            filter: {},
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 20,
                  page: 0,
                  hasMore: false
               }
            },
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            useNewModel: true,
            columns: [],
            viewModelConstructor: 'Controls/treeGrid:TreeGridCollection',
            selectedKeys: [],
            excludedKeys: [],
            expandedItems: [null]
         };
         let treeControl;

         beforeEach(async() => {
            treeControl = await correctCreateTreeControlAsync(cfg);
         });

         it('set has more for nodes and hidden nodes', async() => {
            const methodSpy = sinon.spy(treeControl.getViewModel(), 'setHasMoreStorage');
            await treeControl.reload();
            assert.isTrue(methodSpy.withArgs({0: false, 1: false}).called);
         });
      });
   });
});
