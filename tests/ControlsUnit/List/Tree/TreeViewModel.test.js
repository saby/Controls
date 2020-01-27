define([
   'Controls/treeGrid',
   'Core/core-merge',
   'Types/entity',
   'Types/collection'
], function(
   treeGrid,
   cMerge,
   entity,
   collection
) {
   function MockedDisplayItem(cfg) {
      var
         self = this;
      this._id = cfg.id;
      this._isNode = cfg.isNode;
      this.isNode = function() {
         return this._isNode;
      };
      this.getContents = function() {
         return {
            getId: function() {
               return self._id;
            },
            get: function() {
               return self._isNode;
            }
         };
      };
   }
   /*
      123
         234
            1 (лист)
            2 (лист)
            3 (пустая папка)
      345 (лист)
      456 (лист)
      567 (лист)
   */
   var
      theme = 'default',
      treeData = [
         {
            'id': '123',
            'title': 'Хлеб',
            'price': 50,
            'parent': null,
            'parent@': true,
            'balance': 15
         },
         {
            'id': '234',
            'title': 'Батон',
            'price': 150,
            'parent': '123',
            'parent@': true,
            'balance': 3
         },
         {
            'id': '1',
            'title': 'один',
            'parent': '234',
            'parent@': false
         },
         {
            'id': '2',
            'title': 'два',
            'parent': '234',
            'parent@': false
         },
         {
            'id': '3',
            'title': 'три',
            'parent': '234',
            'parent@': true
         },
         {
            'id': '345',
            'title': 'Масло',
            'price': 100,
            'parent': null,
            'parent@': true,
            'balance': 5
         },
         {
            'id': '456',
            'title': 'Помидор',
            'price': 75,
            'parent': null,
            'parent@': null,
            'balance': 7
         },
         {
            'id': '567',
            'title': 'Капуста китайская',
            'price': 35,
            'parent': null,
            'parent@': null,
            'balance': 2
         }
      ],
      cfg = {
         keyProperty: 'id',
         displayProperty: 'title',
         parentProperty: 'parent',
         nodeProperty: 'parent@',
         items: new collection.RecordSet({
            rawData: treeData,
            keyProperty: 'id'
         })
      };

   describe('Controls.List.Tree.TreeViewModel', function() {
      describe('"_private" block', function() {
         var
            treeViewModel = new treeGrid.TreeViewModel(cfg);

         it('removeNodeFromExpanded', function() {
            var removed = false;
            var self = {
               _expandedItems: ['test']
            };
            self._notify = function(event) {
               if (event === 'onNodeRemoved') {
                  removed = true;
               }
            };
            treeGrid.TreeViewModel._private.removeNodeFromExpanded(self, 'test');

            assert.equal(Object.keys(self._expandedItems).length, 0);
            assert.isTrue(removed);
         });

         it('resetExpandedItems', function() {
            let updated = false;
            treeViewModel._nextModelVersion = function() {
               updated = true;
            };
            treeViewModel.setExpandedItems(['123', '234', '1']);
            assert.equal(treeViewModel.getExpandedItems().length, 3);
            assert.isTrue(updated);
            treeViewModel.resetExpandedItems();
            assert.equal(treeViewModel.getExpandedItems().length, 0);
         });

         it('isVisibleItem', function() {
            var
               item = treeViewModel.getItemById('123', cfg.keyProperty),
               itemChild;
            assert.isTrue(treeGrid.TreeViewModel._private.isVisibleItem.call(treeViewModel.prepareDisplayFilterData(),
               item), 'Invalid value "isVisibleItem(123)".');
            treeViewModel.toggleExpanded(item, true);
            itemChild = treeViewModel.getItemById('234', cfg.keyProperty);
            assert.isTrue(treeGrid.TreeViewModel._private.isVisibleItem.call(treeViewModel.prepareDisplayFilterData(),
               itemChild), 'Invalid value "isVisibleItem(234)".');
            treeViewModel.toggleExpanded(item, false);
            assert.isFalse(treeGrid.TreeViewModel._private.isVisibleItem.call(treeViewModel.prepareDisplayFilterData(),
               itemChild), 'Invalid value "isVisibleItem(234)".');
         });
         it('displayFilter', function() {
            var
               item = treeViewModel.getItemById('123', cfg.keyProperty),
               itemChild;
            assert.isTrue(treeGrid.TreeViewModel._private.displayFilterTree.call(treeViewModel.prepareDisplayFilterData(),
               item.getContents(), 0, item), 'Invalid value "displayFilterTree(123)".');
            treeViewModel.toggleExpanded(item, true);
            itemChild = treeViewModel.getItemById('234', cfg.keyProperty);
            assert.isTrue(treeGrid.TreeViewModel._private.displayFilterTree.call(treeViewModel.prepareDisplayFilterData(),
               itemChild.getContents(), 1, itemChild), 'Invalid value "displayFilterTree(234)".');
            treeViewModel.toggleExpanded(item, false);
            assert.isFalse(treeGrid.TreeViewModel._private.displayFilterTree.call(treeViewModel.prepareDisplayFilterData(),
               itemChild.getContents(), 1, itemChild), 'Invalid value "displayFilterTree(234)".');
         });
         it('getDisplayFilter', function() {
            assert.isTrue(treeGrid.TreeViewModel._private.getDisplayFilter(treeViewModel.getExpandedItems(), treeViewModel._options).length === 1,
               'Invalid filters count prepared by "getDisplayFilter".');
            treeViewModel = new treeGrid.TreeViewModel(cMerge({itemsFilterMethod: function() {return true;}}, cfg));
            assert.isTrue(treeGrid.TreeViewModel._private.getDisplayFilter(treeViewModel.getExpandedItems(), treeViewModel._options).length === 2,
               'Invalid filters count prepared by "getDisplayFilter" with "itemsFilterMethod".');
         });
         it('hasChildItem', function() {
            var
               model = new treeGrid.TreeViewModel(cfg);
            assert.isTrue(treeGrid.TreeViewModel._private.hasChildItem(model, 123), 'Invalid detect child item for item with key "123".');
            assert.isFalse(treeGrid.TreeViewModel._private.hasChildItem(model, 1), 'Invalid detect child item for item with key "1".');
            assert.isFalse(treeGrid.TreeViewModel._private.hasChildItem(model, 1989), 'Invalid detect child item for unknown item.');
         });
         it('shouldDrawExpander', function() {
            var
               testsShouldDrawExpander = [{
                  itemData: {
                     item: {
                        get: function() {
                           return null;
                        }
                     }
                  }
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return null;
                        }
                     }
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return null;
                        }
                     }
                  },
                  expanderIcon: 'none'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return false;
                        }
                     }
                  }
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return false;
                        }
                     }
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return false;
                        }
                     }
                  },
                  expanderIcon: 'none'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     }
                  }
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     }
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     }
                  },
                  expanderIcon: 'none'
               }],
               testsResultShouldDrawExpander = [false, false, false, true, true, false, true, true, false];
            testsShouldDrawExpander.forEach(function(item, i) {
               assert.equal(treeGrid.TreeViewModel._private.shouldDrawExpander(testsShouldDrawExpander[i].itemData, testsShouldDrawExpander[i].expanderIcon),
                  testsResultShouldDrawExpander[i],
                  'Invalid value "shouldDrawExpander(...)" for step ' + i + '.');
            });
         });
          it('shouldDrawExpanderPadding', function() {
              var
                  shouldDrawExpanderPadding = treeGrid.TreeViewModel._private.shouldDrawExpanderPadding;
              assert.isTrue(shouldDrawExpanderPadding({
                  expanderVisibility: 'visible',
                  thereIsChildItem: true
              }, 'node'));
              assert.isTrue(shouldDrawExpanderPadding({
                  expanderVisibility: 'visible',
                  thereIsChildItem: false
              }, 'node'));
              assert.isTrue(shouldDrawExpanderPadding({
                  expanderVisibility: 'hasChildren',
                  thereIsChildItem: true
              }, 'node'));
              assert.isFalse(shouldDrawExpanderPadding({
                  expanderVisibility: 'visible',
                  thereIsChildItem: true
              }, 'none'));
              assert.isFalse(shouldDrawExpanderPadding({
                  expanderVisibility: 'hasChildren',
                  thereIsChildItem: true
              }, 'none'));
              assert.isFalse(shouldDrawExpanderPadding({
                  expanderVisibility: 'hasChildren',
                  thereIsChildItem: false
              }, 'node'));
          });
          it('should redraw list if once folder was deleted', function() {
            var
               rs = new collection.RecordSet({
                  rawData: [
                     {
                        id: 1,
                        parent: null,
                        hasChild: false,
                        type: null
                     }
                  ],
                  keyProperty: 'id'
               }),
               treeViewModel = new treeGrid.TreeViewModel({
                  items: rs,
                  hasChildrenProperty: 'hasChild',
                  expanderVisibility: 'hasChildren',
                  parentProperty: 'parent',
                  keyProperty: 'id',
                  nodeProperty: 'type'
               });
            treeViewModel._thereIsChildItem = true;
            var updated = false;
            treeViewModel._nextModelVersion = function() {
               updated = true;
            };
            treeGrid.TreeViewModel._private.onBeginCollectionChange(treeViewModel);
            assert.isTrue(updated);


         });
         it('getExpanderPaddingClasses', function() {
            let expectation = [
                'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_default_theme-default',
                'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_s_theme-default',
                'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_m_theme-default',
                'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_l_theme-default',
                'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_xl_theme-default',
            ];
            assert.equal(treeGrid.TreeViewModel._private.getExpanderPaddingClasses(undefined, theme), expectation[0]);
            assert.equal(treeGrid.TreeViewModel._private.getExpanderPaddingClasses('s', theme), expectation[1]);
            assert.equal(treeGrid.TreeViewModel._private.getExpanderPaddingClasses('m', theme), expectation[2]);
            assert.equal(treeGrid.TreeViewModel._private.getExpanderPaddingClasses('l', theme), expectation[3]);
            assert.equal(treeGrid.TreeViewModel._private.getExpanderPaddingClasses('xl', theme), expectation[4]);
         });
         it('prepareExpanderClasses', function() {
            var
               testsPrepareExpanderClasses = [{
                  itemData: {
                     item: {
                        get: function() {
                           return false;
                        }
                     }
                  }
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return false;
                        }
                     }
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     }
                  }
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     }
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     }
                  },
                  expanderIcon: 'node'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     }
                  },
                  expanderIcon: 'hiddenNode'
               }],
               testsResultPrepareExpanderClasses = [
                  'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_hiddenNode_default_collapsed_theme-default',
                  'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander_testIcon controls-TreeGrid__row-expander_testIcon_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_testIcon_collapsed_theme-default',
                  'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander_node_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_node_default_collapsed_theme-default',
                  'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander_testIcon controls-TreeGrid__row-expander_testIcon_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_testIcon_collapsed_theme-default',
                  'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander_node controls-TreeGrid__row-expander_node_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_node_default_collapsed_theme-default',
                  'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander_hiddenNode controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_hiddenNode_default_collapsed_theme-default'
               ];
            testsPrepareExpanderClasses.forEach(function(item, i) {
               assert.equal(treeGrid.TreeViewModel._private.prepareExpanderClasses(testsPrepareExpanderClasses[i].itemData, testsPrepareExpanderClasses[i].expanderIcon, undefined, theme),
                  testsResultPrepareExpanderClasses[i],
                  'Invalid value "prepareExpanderClasses(...)" for step ' + i + '.');
            });
         });
      });
      describe('expandedItems', function() {
         it('initialize from options and changing expandedItems', function() {
            var
               baseExpandedItems = [1, 2, 3],
               treeViewModel = new treeGrid.TreeViewModel({
                  expandedItems: baseExpandedItems,
                  items: new collection.RecordSet({
                     rawData: [
                        { id: 1, parent: null, type: true },
                        { id: 2, parent: null, type: true },
                        { id: 3, parent: 2, type: true }
                     ],
                     keyProperty: 'id'
                  }),
                  parentProperty: 'parent',
                  keyProperty: 'id',
                  nodeProperty: 'type'
               }),
               preparedExpandedItems = { 1: true, 2: true, 3: true },
               preparedExpandedAllItems = { null: true };
            assert.deepEqual(baseExpandedItems, treeViewModel.getExpandedItems(), 'Invalid value "_expandedItems".');
            treeViewModel.setExpandedItems([null]);
            assert.deepEqual([null], treeViewModel.getExpandedItems(), 'Invalid value "_expandedItems".');
            treeViewModel.setExpandedItems(baseExpandedItems);
            assert.deepEqual(baseExpandedItems, treeViewModel.getExpandedItems(), 'Invalid value "_expandedItems".');
         });
      });
      describe('public methods', function() {
         var
            treeViewModel = new treeGrid.TreeViewModel(cfg);
         it('getCurrent and toggleExpanded', function() {
            assert.equal(undefined, treeViewModel.getExpandedItems()['123'], 'Invalid value "_expandedItems" before call "toggleExpanded(123, true)".');
            assert.isFalse(treeViewModel.getCurrent().isExpanded, 'Invalid value "getCurrent()" before call "toggleExpanded(123, true)".');

            treeViewModel.toggleExpanded(treeViewModel.getCurrent().dispItem, true);
            assert.isTrue(treeViewModel.getExpandedItems().indexOf('123') !== -1, 'Invalid value "_expandedItems" after call "toggleExpanded(123, true)".');
            assert.isTrue(treeViewModel.getCurrent().isExpanded, 'Invalid value "getCurrent()" after call "toggleExpanded(123, true)".');

            treeViewModel.toggleExpanded(treeViewModel.getCurrent().dispItem, false);
            assert.isTrue(treeViewModel.getExpandedItems().indexOf('123') === -1, 'Invalid value "_expandedItems" after call "toggleExpanded(123, false)".');
            assert.isFalse(treeViewModel.getCurrent().isExpanded, 'Invalid value "getCurrent()" after call "toggleExpanded(123, false)".');

            treeViewModel.toggleExpanded(treeViewModel.getItemById('123', cfg.keyProperty), true);
            treeViewModel.toggleExpanded(treeViewModel.getItemById('234', cfg.keyProperty), true);
            assert.deepEqual(['123', '234'], treeViewModel.getExpandedItems(), 'Invalid value "_expandedItems" after expand "123" and "234".');
            treeViewModel.toggleExpanded(treeViewModel.getItemById('123', cfg.keyProperty), false);
            assert.deepEqual([], treeViewModel.getExpandedItems(), 'Invalid value "_expandedItems" after collapse "123".');
            treeViewModel.toggleExpanded(treeViewModel.getItemById('123', cfg.keyProperty));
            assert.deepEqual(['123'], treeViewModel.getExpandedItems(), 'Invalid value "_expandedItems" after toggle "123".');
            treeViewModel.toggleExpanded(treeViewModel.getItemById('123', cfg.keyProperty));
            assert.deepEqual([], treeViewModel.getExpandedItems(), 'Invalid value "_expandedItems" after toggle "123".');

            treeViewModel.toggleExpanded(treeViewModel.getItemById('123', cfg.keyProperty), true);
            treeViewModel.toggleExpanded(treeViewModel.getItemById('234', cfg.keyProperty), true);
            assert.deepEqual(['123', '234'], treeViewModel.getExpandedItems(), 'Invalid value "_expandedItems" after expand "123" and "234".');
            treeViewModel.setItems(new collection.RecordSet({
               rawData: treeData,
               keyProperty: 'id'
            }));
            assert.deepEqual(['123', '234'], treeViewModel.getExpandedItems(), 'Invalid value "_expandedItems" after setItems.');

            treeViewModel._draggingItemData = {};
            treeViewModel.toggleExpanded(treeViewModel.getItemById('123', cfg.keyProperty), false);
            let dragItemIndexUpdated = false;
            treeViewModel.updateDragItemIndex = function() {
               dragItemIndexUpdated = true;
            }
            treeViewModel.toggleExpanded(treeViewModel.getItemById('123', cfg.keyProperty), true);
            assert.isTrue(dragItemIndexUpdated);
         });

         it('singleExpand toggleExpanded', function() {
            var singleExpangConfig = {
               singleExpand: true,
               keyProperty: 'id',
               displayProperty: 'title',
               parentProperty: 'parent',
               nodeProperty: 'parent@',
               items: new collection.RecordSet({
                  rawData: [
                     {
                        'id': '1',
                        'parent': null,
                        'parent@': true,
                        'title': '1'
                     },
                     {
                        'id': '2',
                        'parent': null,
                        'parent@': true,
                        'title': '2'
                     },
                     {
                        'id': '11',
                        'parent': '1',
                        'parent@': true,
                        'title': '11'
                     },
                     {
                        'id': '21',
                        'parent': '2',
                        'parent@': true,
                        'title': '21'
                     },
                  ],
                  keyProperty: 'id'
               })
            };
            var SETVM = new treeGrid.TreeViewModel(singleExpangConfig);
            SETVM.toggleExpanded(SETVM.getItemById('1', cfg.keyProperty), true);
            assert.deepEqual(['1'], SETVM.getExpandedItems(), 'singleExpand: Invalid value "_expandedItems" after expand 1.');
            SETVM.toggleExpanded(SETVM.getItemById('2', cfg.keyProperty), true);
            assert.deepEqual(['2'], SETVM.getExpandedItems(), 'singleExpand: Invalid value "_expandedItems" after expand 2.');
         });


         it('collapsedItems', function(){
            var treeViewModel = new treeGrid.TreeViewModel(cMerge({
               expandedItems: [null]
            }, cfg));
            assert.deepEqual(treeViewModel._collapsedItems, []);
            treeViewModel.toggleExpanded(treeViewModel.getItemById('123'), false);
            assert.deepEqual(treeViewModel._collapsedItems, ['123']);
         });

         it('nodeFooterVisibilityCallback', function() {
            var
               treeViewModel = new treeGrid.TreeViewModel(cMerge({
                  nodeFooterTemplate: 'footer',
                  nodeFooterVisibilityCallback: function(item) {
                     return item.getId() !== '345';
                  }
               }, cfg));
            treeViewModel.setExpandedItems([null]);
            treeViewModel.setHasMoreStorage({
               123: true,
               234: true
            });
            assert.isFalse(!!treeViewModel.getItemDataByItem(treeViewModel._display.at(0)).nodeFooters.length);
            assert.isFalse(!!treeViewModel.getItemDataByItem(treeViewModel._display.at(1)).nodeFooters.length);
            assert.isTrue(!!treeViewModel.getItemDataByItem(treeViewModel._display.at(2)).nodeFooters.length);
            assert.isTrue(!!treeViewModel.getItemDataByItem(treeViewModel._display.at(3)).nodeFooters.length);
            assert.isTrue(!!treeViewModel.getItemDataByItem(treeViewModel._display.at(4)).nodeFooters.length);
            assert.isFalse(!!treeViewModel.getItemDataByItem(treeViewModel._display.at(5)).nodeFooters.length);
         });

         it('getFirstItem and getLastItem', function() {
            var
               cfg = {
                  items: new collection.RecordSet({
                     rawData: [
                        { id: 1, title: 'item 1', type: null, parent: null },
                        { id: 2, title: 'item 2', type: true, parent: null },
                        { id: 3, title: 'item 3', type: true, parent: null },
                        { id: 21, title: 'item 2-1', type: null, parent: 2 },
                        { id: 31, title: 'item 3-1', type: null, parent: 3 }
                     ],
                     keyProperty: 'id'
                  }),
                  keyProperty: 'id',
                  displayProperty: 'title',
                  parentProperty: 'parent',
                  nodeProperty: 'type'
               },
               model = new treeGrid.TreeViewModel(cfg);
            assert.equal(model.getFirstItem(), model.getItems().at(0));
            assert.equal(model.getLastItem(), model.getItems().at(2));
         });

         it('hasChildren should be true when an item gets added to an empty folder', function() {
            var newItem = new entity.Record({
               rawData: {
                  'id': '4',
                  'title': 'четыре',
                  'parent': '3',
                  'parent@': true
               }
            });
            treeViewModel.setExpandedItems(['123', '234', '3']);
            treeViewModel._editingItemData = {
               item: newItem
            };
            treeViewModel._curIndex = 4;
            assert.isTrue(treeViewModel.getCurrent().hasChildren);
         });

         it('isExpandAll', function() {
            treeViewModel.setExpandedItems(['123', '234', '3']);
            assert.isFalse(treeViewModel.isExpandAll());

            treeViewModel.setExpandedItems([null]);
            assert.isTrue(treeViewModel.isExpandAll());
         });

         it('setExpandedItems', function() {
            treeViewModel.setExpandedItems([]);
            assert.deepEqual([], treeViewModel.getExpandedItems());

            treeViewModel.setExpandedItems([1, 2]);
            assert.deepEqual([1, 2], treeViewModel.getExpandedItems());

            let expanded = treeViewModel.getExpandedItems();
            treeViewModel.setExpandedItems([1, 2]);
            assert.isTrue(expanded === treeViewModel.getExpandedItems());

         });
         it('onCollectionChange', function() {
            var
               removedItems1 = [
                  new MockedDisplayItem({ id: 'mi1', isNode: true }), new MockedDisplayItem({ id: 'mi3', isNode: false })],
               removedItems2 = [
                  new MockedDisplayItem({ id: 'mi2', isNode: true }), new MockedDisplayItem({ id: 'mi4', isNode: false })],
               notifiedOnNodeRemoved = false;
            treeViewModel.setExpandedItems(['mi1', 'mi2']);
            treeViewModel._notify = function(eventName) {
               if (eventName === 'onNodeRemoved') {
                  notifiedOnNodeRemoved = true;
               }
            };
            treeViewModel._onCollectionChange(null, collection.IObservable.ACTION_REMOVE, null, null, removedItems1, null);
            assert.deepEqual(treeViewModel.getExpandedItems(), ['mi2'], 'Invalid value "_expandedItems" after "onCollectionChange".');
            treeViewModel._onCollectionChange(null, collection.IObservable.ACTION_REMOVE, null, null, removedItems2, null);
            assert.deepEqual(treeViewModel.getExpandedItems(), [], 'Invalid value "_expandedItems" after "onCollectionChange".');
            assert.isTrue(notifiedOnNodeRemoved, 'Event "onNodeRemoved" not notified.');
         });
      });

      describe('expanderDisplayMode', function() {
         var

            // rawData without hasChildrenProperty and with child
            rawData_1 = [
               { id: 1, type: true, parent: null, hasChild: null },
               { id: 11, type: true, parent: 1, hasChild: null },
               { id: 2, type: true, parent: null, hasChild: null }
            ],

            // rawData without hasChildrenProperty and without child
            rawData_2 = [
               { id: 1, type: true, parent: null, hasChild: null },
               { id: 2, type: true, parent: null, hasChild: null }
            ],

            // rawData with hasChildrenProperty and with child
            rawData_3 = [
               { id: 1, type: true, parent: null, hasChild: true },
               { id: 2, type: true, parent: null, hasChild: false }
            ],

            // rawData with hasChildrenProperty and without child
            rawData_4 = [
               { id: 1, type: true, parent: null, hasChild: false },
               { id: 11, type: true, parent: 1, hasChild: true },
               { id: 2, type: true, parent: null, hasChild: false }
            ];
         function checkExpanderDisplayMode(params, result) {
            var
               items = new collection.RecordSet({
                  rawData: params.items,
                  keyProperty: 'id'
               }),
               model = new treeGrid.TreeViewModel({
                  items: items,
                  keyProperty: 'id',
                  parentProperty: 'parent',
                  nodeProperty: 'type',
                  expanderDisplayMode: 'adaptive',
                  hasChildrenProperty: params.hasChildrenProperty
               });
            assert.equal(model._thereIsChildItem, result);
         }
         it('Check "adaptive" mode for nodes with children. hasChildrenProperty option is undefined.', function() {
            checkExpanderDisplayMode({
               items: rawData_1
            }, true);
         });
         it('Check "adaptive" mode for nodes without children. hasChildrenProperty option is undefined.', function() {
            checkExpanderDisplayMode({
               items: rawData_2
            }, false);
         });
         it('Check "adaptive" mode for nodes with children. hasChildrenProperty option is set.', function() {
            checkExpanderDisplayMode({
               items: rawData_3,
               hasChildrenProperty: 'hasChild'
            }, true);
         });
         it('Check "adaptive" mode for nodes without children. hasChildrenProperty option is set.', function() {
            checkExpanderDisplayMode({
               items: rawData_4,
               hasChildrenProperty: 'hasChild'
            }, false);
         });
      });

      describe('DragNDrop methods', function() {
         var tvm, dragEntity;

         beforeEach(function() {
            tvm = new treeGrid.TreeViewModel(cfg);
            dragEntity = {
               items: ['123'],
               getItems: function() {
                  return this.items;
               }
            };
         });

         it('setDragEntity', function() {
            tvm.toggleExpanded(tvm.getItemById('123', 'id'), true);
            tvm.toggleExpanded(tvm.getItemById('456', 'id'), true);

            tvm.setDragEntity(dragEntity);
            assert.isFalse(tvm.isExpanded(tvm.getItemById('123', 'id')));
            assert.isTrue(tvm.isExpanded(tvm.getItemById('456', 'id')));
         });

         it('setDragItemData', function() {
            tvm.toggleExpanded(tvm.getItemById('123', 'id'), true);
            tvm.setDragItemData(tvm.getItemDataByItem(tvm.getItemById('123', 'id')));

            assert.isFalse(tvm.getDragItemData().isExpanded);
            assert.isTrue(tvm.getDragItemData().getVersion().indexOf('_LEVEL_1') !== -1);

            tvm.setDragItemData(tvm.getItemDataByItem(tvm.getItemById('234', 'id')));
            assert.isTrue(tvm.getDragItemData().getVersion().indexOf('_LEVEL_2') !== -1);
         });

         describe('setDragTargetPosition', function() {
            var itemData, dragTargetPosition;

            it('on node without prev state', function() {
               //move item 567
               tvm.setDragItemData(tvm.getItemDataByItem(tvm.getItemById('567', 'id')));
               tvm.setDragEntity(dragEntity);

               //move on 123
               itemData = tvm.getItemDataByItem(tvm.getItemById('123', 'id'));
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData);
               tvm.setDragTargetPosition(dragTargetPosition);

               assert.equal(tvm._prevDragTargetPosition.data.key, '567');
               assert.equal(tvm._prevDragTargetPosition.position, 'after');
            });

            it('on node', function() {
               //move item 567
               tvm.setDragItemData(tvm.getItemDataByItem(tvm.getItemById('567', 'id')));
               tvm.setDragEntity(dragEntity);

               //move before 456
               itemData = tvm.getItemDataByItem(tvm.getItemById('456', 'id'));
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData, 'before');
               tvm.setDragTargetPosition(dragTargetPosition);

               //move on 123
               itemData = tvm.getItemDataByItem(tvm.getItemById('123', 'id'));
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData);
               tvm.setDragTargetPosition(dragTargetPosition);

               assert.equal(tvm._prevDragTargetPosition.data.key, '456');
               assert.equal(tvm._prevDragTargetPosition.position, 'before');
            });
         });

         describe('calculateDragTargetPosition', function() {
            var itemData, dragTargetPosition;

            it('not node', function() {
               itemData = tvm.getItemDataByItem(tvm.getItemById('567', 'id'));
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData);
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'before');
            });

            it('on node', function() {
               itemData = tvm.getItemDataByItem(tvm.getItemById('123', 'id'));
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData);
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'on');
            });

            it('before node', function() {
               itemData = tvm.getItemDataByItem(tvm.getItemById('123', 'id'));
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData, 'before');
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'before');
            });

            it('after node', function() {
               itemData = tvm.getItemDataByItem(tvm.getItemById('123', 'id'));
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData, 'after');
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'after');
            });

            it('before expanded node', function() {
               tvm.toggleExpanded(tvm.getItemById('123', 'id'), true);
               itemData = tvm.getItemDataByItem(tvm.getItemById('123', 'id'));
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData, 'before');
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'before');
            });

            it('after expanded node', function() {
               tvm.toggleExpanded(tvm.getItemById('123', 'id'), true);
               itemData = tvm.getItemDataByItem(tvm.getItemById('123', 'id'));
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData, 'after');
               assert.equal(dragTargetPosition, undefined);
            });

            it('move down node', function() {
               //move item 567
               tvm.setDragItemData(tvm.getItemDataByItem(tvm.getItemById('567', 'id')));
               tvm.setDragEntity(dragEntity);

               //move after 123
               itemData = tvm.getItemDataByItem(tvm.getItemById('123', 'id'));
               tvm.setDragTargetPosition(tvm.calculateDragTargetPosition(itemData, 'after'));

               //move on 345
               itemData = tvm.getItemDataByItem(tvm.getItemById('345', 'id'));
               tvm.setDragTargetPosition(tvm.calculateDragTargetPosition(itemData));

               //move before 345
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData, 'before');
               assert.equal(dragTargetPosition, undefined);

               //move after 345
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData, 'after');
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'after');
            });

            it('move up item', function() {
               //move item 567
               tvm.setDragItemData(tvm.getItemDataByItem(tvm.getItemById('567', 'id')));
               tvm.setDragEntity(dragEntity);

               //move before 456
               itemData = tvm.getItemDataByItem(tvm.getItemById('456', 'id'));
               tvm.setDragTargetPosition(tvm.calculateDragTargetPosition(itemData, 'before'));

               //move on 345
               itemData = tvm.getItemDataByItem(tvm.getItemById('345', 'id'));
               tvm.setDragTargetPosition(tvm.calculateDragTargetPosition(itemData));

               //move after 345
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData, 'after');
               assert.equal(dragTargetPosition, undefined);

               //move before 345
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData, 'before');
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'before');
            });

            it('move to draggableItem', function() {
               var
                  prevDragTargetPosition,
                  item = tvm.getItemDataByItem(tvm.getItemById('567', 'id'));

               //start move item 567
               tvm.setDragEntity(dragEntity);
               tvm.setDragItemData(item);

               //move item 567 on item 567
               dragTargetPosition = tvm.calculateDragTargetPosition(item);
               assert.isNull(dragTargetPosition);

               //move item 567 after folder 345
               itemData = tvm.getItemDataByItem(tvm.getItemById('345', 'id'));
               prevDragTargetPosition = tvm.calculateDragTargetPosition(itemData, 'after');
               tvm.setDragTargetPosition(prevDragTargetPosition);
               assert.equal(prevDragTargetPosition.index, itemData.index);
               assert.equal(prevDragTargetPosition.position, 'after');

               //move item 567 on folder 345
               itemData = tvm.getItemDataByItem(tvm.getItemById('345', 'id'));
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData);
               tvm.setDragTargetPosition(dragTargetPosition);
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'on');

               //move item 567 on item 567
               dragTargetPosition = tvm.calculateDragTargetPosition(item);
               assert.equal(prevDragTargetPosition.index, dragTargetPosition.index);
               assert.equal(prevDragTargetPosition.position, dragTargetPosition.position);
            });

            it('move to draggableFolder', function() {
               var item = tvm.getItemDataByItem(tvm.getItemById('123', 'id'));

               //start move folder 123
               tvm.setDragEntity(dragEntity);
               tvm.setDragItemData(item);

               //move folder 123 before folder 345
               itemData = tvm.getItemDataByItem(tvm.getItemById('345', 'id'));
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData, 'before');
               tvm.setDragTargetPosition(dragTargetPosition);
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'before');

               //move folder 123 on folder 123
               itemData = tvm.getItemDataByItem(tvm.getItemById('123', 'id'));
               dragTargetPosition = tvm.calculateDragTargetPosition(itemData);
               assert.isNull(dragTargetPosition);
            });
         });
      });

      describe('setNodeFooterIfNeed', function() {
         let model;

         beforeEach(function() {
            model = new treeGrid.TreeViewModel(cfg);
         });

         it('no hierarchy = no has more footers', function() {
            const itemData = model.getItemDataByItem(model.getItemById('567', 'id'));
            itemData.nodeProperty = undefined;
            itemData.parentProperty = undefined;
            treeGrid.TreeViewModel._private.setNodeFooterIfNeed(model, itemData);
            assert.deepEqual(itemData.nodeFooters, []);
         });
      });
   });
});
