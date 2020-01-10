define([
   'Controls/explorer',
   'Core/Deferred',
   'Types/collection',
   'Types/chain',
   'Controls/dragnDrop',
   'Types/entity',
   'Types/source'
], function(
   explorerMod,
   Deferred,
   collection,
   chain,
   dragnDrop,
   entityLib,
   sourceLib
) {
   function dragEntity(items, dragControlId) {
      var entity = new dragnDrop.ItemsEntity({
         items: items
      });
      entity.dragControlId = dragControlId;
      return entity;
   }

   describe('Controls.Explorer', function() {
      it('_private block', function() {
         var
            dataLoadCallbackArgument = null,
            dataLoadCallback = function(data) {
               dataLoadCallbackArgument = data;
            },
            notify = function() {},
            forceUpdate = function() {},
            updateHeadingPath = () => {
            },
            itemOpenHandlerCalled = false,
            itemOpenHandler = function() {
               itemOpenHandlerCalled = true;
            },
            self = {
               _forceUpdate: forceUpdate,
               _notify: notify,
               _updateHeadingPath: updateHeadingPath,
               _options: {
                  dataLoadCallback: dataLoadCallback,
                  itemOpenHandler: itemOpenHandler
               }
            },
            testRoot = 'testRoot',
            testBreadCrumbs = new collection.RecordSet({
               rawData: [
                  { id: 1, title: 'item1', parent: null },
                  { id: 2, title: 'item2', parent: 1 },
                  { id: 3, title: 'item3', parent: 2 }
               ]
            }),
            testBreadCrumbs2 = new collection.RecordSet({
               rawData: []
            }),
            testData1 = {
               getMetaData: function() {
                  return {};
               }
            },
            testData2 = {
               getMetaData: function() {
                  return {
                     path: testBreadCrumbs
                  };
               }
            },
            testData3 = {
               getMetaData: function() {
                  return {
                     path: testBreadCrumbs2
                  };
               }
            };
         explorerMod.View._private.setRoot(self, testRoot);
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

         explorerMod.View._private.serviceDataLoadCallback(self, null, testData1);
         assert.deepEqual(self._breadCrumbsItems, null, 'Incorrect "breadCrumbsItems"');

         explorerMod.View._private.serviceDataLoadCallback(self, testData1, testData2);
         assert.deepEqual(self._breadCrumbsItems, chain.factory(testBreadCrumbs).toArray(), 'Incorrect "breadCrumbsItems"');

         explorerMod.View._private.serviceDataLoadCallback(self, testData2, testData1);
         assert.deepEqual(self._breadCrumbsItems, null, 'Incorrect "breadCrumbsItems"');

         explorerMod.View._private.serviceDataLoadCallback(self, testData1, testData3);
         assert.deepEqual(self._breadCrumbsItems, null, 'Incorrect "breadCrumbsItems"');
      });

      it('should update subscription on data recordSet on change', function () {
         let
             isSubscribed = false,
             isUnSubscribed = false,
             _updateHeadingPath = () => {},
             subscribe = (eName, fn) => {
                if (eName === 'onCollectionItemChange') {
                   isSubscribed = true;
                   assert.equal(fn, _updateHeadingPath);
                }
             },
             unsubscribe = (eName, fn) => {
                if (eName === 'onCollectionItemChange') {
                   isUnSubscribed = true;
                   assert.equal(fn, _updateHeadingPath);
                }
             },
             self = {
                _updateHeadingPath
             },
             testBreadCrumbs1 = new collection.RecordSet({
                rawData: []
             }),
             testBreadCrumbs2 = new collection.RecordSet({
                rawData: []
             }),
             testDataRecordSet1 = {
                getMetaData: function() {
                   return {
                      path: testBreadCrumbs1
                   };
                },
                getCount() {
                }
             },
             testDataRecordSet2 = {
                getMetaData: function() {
                   return {
                      path: testBreadCrumbs2
                   };
                },
                getCount() {
                }
             },
            assertCase = (_isUnSubscribed, _isSubscribed) => {
               assert.equal(_isUnSubscribed, isUnSubscribed);
               assert.equal(_isSubscribed, isSubscribed);
               isUnSubscribed = isSubscribed = false;
            };

         testBreadCrumbs1.subscribe = subscribe;
         testBreadCrumbs1.unsubscribe = unsubscribe;
         testBreadCrumbs2.subscribe = subscribe;
         testBreadCrumbs2.unsubscribe = unsubscribe;

         explorerMod.View._private.serviceDataLoadCallback(self, null, testDataRecordSet1);
         assertCase(false, true);

         explorerMod.View._private.serviceDataLoadCallback(self, testDataRecordSet1, testDataRecordSet2);
         assertCase(true, true);

         explorerMod.View._private.serviceDataLoadCallback(self, testDataRecordSet2, testDataRecordSet1);
         assertCase(true, true);
      });

      it('_private.canStartDragNDrop', function() {
         var
            explorer = new explorerMod.View({});

         explorer._viewMode = 'table';
         assert.isTrue(explorerMod.View._private.canStartDragNDrop(explorer));
         explorer._viewMode = 'search';
         assert.isFalse(explorerMod.View._private.canStartDragNDrop(explorer));
      });

      it('_private.getRoot', function() {
         var
            cfg = {
               root: 'rootFromOptions'
            },
            explorer = new explorerMod.View(cfg);

         explorer.saveOptions(cfg);
         explorer._root = 'rootFromState';
         assert.equal(explorerMod.View._private.getRoot(explorer, cfg.root), 'rootFromOptions');

         delete cfg.root;
         explorer.saveOptions(cfg);
         assert.equal(explorerMod.View._private.getRoot(explorer, cfg.root), 'rootFromState');
      });

      it('_private.getDataRoot', function() {
         var
            cfg = {
               parentProperty: 'parent',
               root: 'rootFromOptions'
            },
            explorer = new explorerMod.View(cfg);

         explorer.saveOptions(cfg);
         assert.equal(explorerMod.View._private.getDataRoot(explorer), 'rootFromOptions');

         delete cfg.root;
         explorer.saveOptions(cfg);
         explorer._root = 'rootFromState';
         assert.equal(explorerMod.View._private.getDataRoot(explorer), 'rootFromState');

         explorer._breadCrumbsItems = [new entityLib.Model({
            rawData: {
               parent: 'rootFromBreadCrumbs'
            },
            keyProperty: 'id'
         })];
         assert.equal(explorerMod.View._private.getDataRoot(explorer), 'rootFromBreadCrumbs');

         cfg.root = 'rootFromOptions';
         explorer.saveOptions(cfg);
         assert.equal(explorerMod.View._private.getDataRoot(explorer), 'rootFromBreadCrumbs');
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

         explorerMod.View._private.itemsReadyCallback(explorer, items);
         assert.equal(itemsReadyCallbackArgs, items);
         assert.equal(explorer._items, items);
      });

      it('itemsSetCallback', function() {
         let markedKey = '';
         const cfg = {};
         const explorer = new explorerMod.View(cfg);
         explorer.saveOptions(cfg);

         explorer._isGoingBack = true;
         explorer._root = null;
         explorer._restoredMarkedKeys = {
            [null]: { markedKey: 'test' }
         };
         explorer._children = {
            treeControl: {
               setMarkedKey: (key) => markedKey = key
            }
         };

         explorerMod.View._private.itemsSetCallback(explorer);

         assert.strictEqual(markedKey, 'test');
         assert.isFalse(explorer._isGoingBack);

         explorer._isGoingFront = true;
         explorer._root = 'test';
         explorer._restoredMarkedKeys = {
            [null]: { markedKey: 'test' }
         };

         explorerMod.View._private.itemsSetCallback(explorer);

         assert.strictEqual(markedKey, null);
         assert.isFalse(explorer._isGoingFront);
      });

      it('setViewMode', function() {
         var
            cfg = {
               root: 'rootNode',
               viewMode: 'tree',
               virtualScrolling: true
            };
         var newCfg = {
            viewMode: 'search',
            root: 'rootNode',
            virtualScrolling: true
         };
         var newCfg2 = {
            viewMode: 'tile',
            root: 'rootNode',
            virtualScrolling: true
         };
         var instance = new explorerMod.View(cfg);
         var rootChanged = false;

         instance.saveOptions(cfg);

         return instance._beforeMount(cfg)
            .then(() => {
               assert.equal(instance._viewMode, 'tree');
               assert.equal(instance._viewName, explorerMod.View._constants.VIEW_NAMES.tree);
               assert.equal(instance._viewModelConstructor, explorerMod.View._constants.VIEW_MODEL_CONSTRUCTORS.tree);
               assert.isFalse(rootChanged);
               assert.isTrue(instance._virtualScrolling);

               instance._notify = function(eventName) {
                  if (eventName === 'rootChanged') {
                     rootChanged = true;
                  }
               };
               return explorerMod.View._private.setViewMode(instance, newCfg.viewMode, newCfg);
            })
            .then(() => {
               assert.equal(instance._viewMode, 'search');
               assert.equal(instance._viewName, explorerMod.View._constants.VIEW_NAMES.search);
               assert.equal(instance._viewModelConstructor, explorerMod.View._constants.VIEW_MODEL_CONSTRUCTORS.search);
               assert.isFalse(rootChanged);
               assert.isTrue(instance._virtualScrolling);

               instance._breadCrumbsItems = new collection.RecordSet({
                  rawData: [
                     { id: 1, title: 'item1' }
                  ],
                  keyProperty: 'id'
               });
               instance.saveOptions(Object.assign(
                  {},
                  instance._options,
                  {
                     searchStartingWith: 'root',
                     root: 'test',
                     parentProperty: 'id'
                  }
               ));
               instance._viewMode = 'tree';
               return explorerMod.View._private.setViewMode(instance, newCfg.viewMode, newCfg);
            })
            .then(() => {
               assert.isFalse(rootChanged);
               assert.isTrue(instance._virtualScrolling);

               return explorerMod.View._private.setViewMode(instance, newCfg2.viewMode, newCfg2);
            })
            .then(() => {
               assert.equal(instance._viewMode, 'tile');
               assert.equal(instance._viewName, explorerMod.View._constants.VIEW_NAMES.tile);
               assert.equal(instance._viewModelConstructor, explorerMod.View._constants.VIEW_MODEL_CONSTRUCTORS.tile);
               assert.isFalse(rootChanged);
               assert.isFalse(instance._virtualScrolling);
            });
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
         let path = new collection.RecordSet({
            rawData: [
               { id: 1, title: 'item1' }
            ],
            keyProperty: 'id'
         });
         let cfg = {
            items: {
               getMetaData: function() {
                  return { path: path };
               }
            },
            root: 1
         };

         instance._beforeMount(cfg);

         assert.deepEqual({ 1: { markedKey: null } }, instance._restoredMarkedKeys);

         path.clear();
         instance._beforeMount(cfg);
         assert.equal(instance._breadCrumbsItems, null);
      });

      it('_beforeUpdate', function() {
         const cfg = { viewMode: 'tree', root: null };
         const cfg2 = { viewMode: 'search' , root: null };
         const instance = new explorerMod.View(cfg);
         let resetExpandedItemsCalled = false;
         instance._children = {
            treeControl: {
               resetExpandedItems: () => resetExpandedItemsCalled = true
            }
         };

         instance._viewMode = cfg.viewMode;

         instance._beforeUpdate(cfg2);
         assert.isTrue(resetExpandedItemsCalled);

         resetExpandedItemsCalled = false;
         instance._viewMode = cfg2.viewMode;

         instance._beforeUpdate(cfg2);
         assert.isFalse(resetExpandedItemsCalled);

         instance._isGoingFront = true;
         instance.saveOptions(cfg);
         instance._beforeUpdate(cfg2);
         assert.isFalse(instance._isGoingFront);
      });

      it('_onBreadCrumbsClick', function() {
         var
            testBreadCrumbs = new collection.RecordSet({
               rawData: [
                  { id: 1, title: 'item1' },
                  { id: 2, title: 'item2', parent: 1 },
                  { id: 3, title: 'item3', parent: 2 }
               ],
               keyProperty: 'id'
            }),
            instance = new explorerMod.View();
            instance._children = {
               treeControl: {

               }
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

         it('backByPath', function() {
            isNotified = false;

            var
               explorer = new explorerMod.View({});

            explorer._notify = _notify;
            explorer.saveOptions({
               parentProperty: 'parent'
            });
            explorer._breadCrumbsItems = [new entityLib.Model({
               rawData: {
                  id: 2,
                  parent: 1
               },
               keyProperty: 'id'
            })];

            explorerMod.View._private.backByPath(explorer);

            assert.isTrue(isNotified);
            assert.equal(root, 1);
            isNotified = false;

            explorer._breadCrumbsItems.push(new entityLib.Model({
               rawData: {
                  id: 3,
                  parent: 2
               },
               keyProperty: 'id'
            }));

            explorerMod.View._private.backByPath(explorer);

            assert.isTrue(isNotified);
            assert.equal(root, 2);
            isNotified = false;

            explorer._breadCrumbsItems = [];

            explorerMod.View._private.backByPath(explorer);

            assert.isFalse(isNotified);
         });

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

         it('_onItemClick', function() {
            isNotified = false;
            isWeNotified = false;

            var
               explorer = new explorerMod.View({}),
               isEventResultReturns = false,
               cancelEditCalled = false,
               isPropagationStopped = isNotified = isNativeClickEventExists = false;

            explorer.saveOptions({});
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
                  cancelEdit: function() {
                     cancelEditCalled = true;
                  }
               }
            };

            explorer._restoredMarkedKeys = {
               null: {
                  markedKey: null
               }
            };


            isEventResultReturns = explorer._onItemClick({
               stopPropagation: function() {
                  isPropagationStopped = true;
               }
            }, {
               get: function() {
                  return true;
               },
               getId: function() {
                  return 'itemId';
               }
            }, {
               nativeEvent: 123
            }, 3);
            assert.isTrue(isEventResultReturns);
            assert.isTrue(cancelEditCalled);
            assert.deepEqual({
               ...explorer._restoredMarkedKeys,
               itemId: {
                  parent: null,
                  markedKey: null
               }
            }, explorer._restoredMarkedKeys);
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

            explorer._onItemClick({
               stopPropagation: function() {
                  isPropagationStopped = true;
               }
            }, {
               get: function() {
                  return true;
               },
               getId: function() {
                  return 'itemIdOneMore';
               }
            }, {
               nativeEvent: 123
            });
            assert.isTrue(isPropagationStopped);
            // Root wasn't changed
            assert.equal(root, 'itemId');
         });

         it('_onBreadCrumbsClick', function() {
            isNotified = false;

            var
               explorer = new explorerMod.View({});
            explorer.saveOptions({});
            explorer._notify = _notify;
            explorer._children = {
               treeControl: {

               }
            };

            explorer._restoredMarkedKeys = {
               null: {
                  markedKey: null
               },
               itemId: {parent: null, markedKey: null}
            };

            explorer._onBreadCrumbsClick({}, {
               getId: function() {
                  return null;
               }
            });

            assert.deepEqual({
               null: {
                  markedKey: null
               },
            }, explorer._restoredMarkedKeys);

            explorer._restoredMarkedKeys = {
               null: {
                  markedKey: null
               },
               itemId: {parent: null, markedKey: 'itemId1'},
               itemId1: {parent: 'itemId', markedKey: null}
            };
            explorer._root = 'itemId1';

            explorer._onBreadCrumbsClick({}, {
               getId: function() {
                  return 'itemId';
               }
            });

            assert.deepEqual({
               null: {
                  markedKey: null
               },
               itemId: {parent: null, markedKey: 'itemId1'},
            }, explorer._restoredMarkedKeys);

            assert.isTrue(isNotified);
         });

         it('_pathCleaner', function() {
            isNotified = false;

            var
               explorer = new explorerMod.View({});
            explorer.saveOptions({});
            explorer._notify = _notify;
            explorer._children = {
               treeControl: {

               }
            };

            explorer._restoredMarkedKeys = {
               null: {
                  markedKey: null
               },
               itemId: {parent: null, markedKey: 'itemId1'},
               itemId1: {parent: 'itemId', markedKey: 'itemId12'},
               itemId12: {parent: 'itemId1', markedKey: null},
            };
            explorer._root = 'itemId12';
            explorerMod.View._private.pathCleaner(explorer, 'itemId');

            assert.deepEqual({
               itemId: {parent: null, markedKey: "itemId1"},
               null: {markedKey: null}
            }, explorer._restoredMarkedKeys);
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
               })

            explorer = new explorerMod.View(explorerCfg);

            explorer.saveOptions(explorerCfg);
            explorer._beforeMount(explorerCfg);
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
            assert.isTrue(explorerMod.View._private.dragItemsFromRoot(explorer, [1]));

            //item is not from the root
            assert.isFalse(explorerMod.View._private.dragItemsFromRoot(explorer, [2]));

            //item is not from the root and from the root
            assert.isFalse(explorerMod.View._private.dragItemsFromRoot(explorer, [1, 2]));

            //an item that is not in the list.
            assert.isFalse(explorerMod.View._private.dragItemsFromRoot(explorer, [4]));
         });
         it('_dragHighlighter', function() {
            explorer._hoveredBreadCrumb = 2;

            assert.equal(explorer._dragHighlighter(), '');

            explorer._dragOnBreadCrumbs = true;
            assert.equal(explorer._dragHighlighter(1), '');
            assert.equal(explorer._dragHighlighter(2), 'controls-BreadCrumbsView__dropTarget_withoutArrow');
            assert.equal(explorer._dragHighlighter(2, true), 'controls-BreadCrumbsView__dropTarget_withArrow');
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
   });
});
