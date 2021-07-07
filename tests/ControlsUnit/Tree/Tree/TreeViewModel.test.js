define([
   'Controls/tree',
   'Controls/treeGrid',
   'Core/core-merge',
   'Types/entity',
   'Types/collection',
    'ControlsUnit/CustomAsserts'
], function(
   tree,
   treeGrid,
   cMerge,
   entity,
   collection,
   cAssert
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

   describe('Controls.Tree.Tree.TreeViewModel', function() {
      describe('"_private" block', function() {
         var
            treeViewModel = new tree.TreeViewModel(cfg);

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
            tree.TreeViewModel._private.removeNodeFromExpanded(self, 'test');

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
            assert.isTrue(tree.TreeViewModel._private.isVisibleItem.call(treeViewModel.prepareDisplayFilterData(),
               item), 'Invalid value "isVisibleItem(123)".');
            treeViewModel.toggleExpanded(item, true);
            itemChild = treeViewModel.getItemById('234', cfg.keyProperty);
            assert.isTrue(tree.TreeViewModel._private.isVisibleItem.call(treeViewModel.prepareDisplayFilterData(),
               itemChild), 'Invalid value "isVisibleItem(234)".');
            treeViewModel.toggleExpanded(item, false);
            assert.isFalse(tree.TreeViewModel._private.isVisibleItem.call(treeViewModel.prepareDisplayFilterData(),
               itemChild), 'Invalid value "isVisibleItem(234)".');
         });
         it('displayFilter', function() {
            var
               item = treeViewModel.getItemById('123', cfg.keyProperty),
               itemChild;
            assert.isTrue(tree.TreeViewModel._private.displayFilterTree.call(treeViewModel.prepareDisplayFilterData(),
               item.getContents(), 0, item), 'Invalid value "displayFilterTree(123)".');
            treeViewModel.toggleExpanded(item, true);
            itemChild = treeViewModel.getItemById('234', cfg.keyProperty);
            assert.isTrue(tree.TreeViewModel._private.displayFilterTree.call(treeViewModel.prepareDisplayFilterData(),
               itemChild.getContents(), 1, itemChild), 'Invalid value "displayFilterTree(234)".');
            treeViewModel.toggleExpanded(item, false);
            assert.isFalse(tree.TreeViewModel._private.displayFilterTree.call(treeViewModel.prepareDisplayFilterData(),
               itemChild.getContents(), 1, itemChild), 'Invalid value "displayFilterTree(234)".');
         });
         it('getDisplayFilter', function() {
            assert.isTrue(tree.TreeViewModel._private.getDisplayFilter(treeViewModel.getExpandedItems(), treeViewModel._options).length === 1,
               'Invalid filters count prepared by "getDisplayFilter".');
            treeViewModel = new tree.TreeViewModel(cMerge({itemsFilterMethod: function() {return true;}}, cfg));
            assert.isTrue(tree.TreeViewModel._private.getDisplayFilter(treeViewModel.getExpandedItems(), treeViewModel._options).length === 2,
               'Invalid filters count prepared by "getDisplayFilter" with "itemsFilterMethod".');
         });
         it('hasChildItem', function() {
            var
               model = new tree.TreeViewModel(cfg);
            assert.isTrue(tree.TreeViewModel._private.hasChildItem(model, 123), 'Invalid detect child item for item with key "123".');
            assert.isFalse(tree.TreeViewModel._private.hasChildItem(model, 1), 'Invalid detect child item for item with key "1".');
            assert.isFalse(tree.TreeViewModel._private.hasChildItem(model, 1989), 'Invalid detect child item for unknown item.');
         });
         it('shouldDrawExpander', function() {
            var
               testsShouldDrawExpander = [{
                  itemData: {
                     item: {
                        get: function() {
                           return null;
                        }
                     },
                     getExpanderIcon: () => undefined
                  }
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return null;
                        }
                     },
                     getExpanderIcon: () => 'testIcon'
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return null;
                        }
                     },
                     getExpanderIcon: () => 'none'
                  },
                  expanderIcon: 'none'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return false;
                        }
                     },
                     getExpanderIcon: () => undefined
                  }
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return false;
                        }
                     },
                     getExpanderIcon: () => 'testIcon'
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return false;
                        }
                     },
                     getExpanderIcon: () => 'none'
                  },
                  expanderIcon: 'none'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     },
                     getExpanderIcon: () => undefined
                  }
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     },
                     getExpanderIcon: () => 'testIcon'
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     },
                     getExpanderIcon: () => 'none'
                  },
                  expanderIcon: 'none'
               }],
               testsResultShouldDrawExpander = [false, false, false, true, true, false, true, true, false];
            testsShouldDrawExpander.forEach(function(item, i) {
               assert.equal(tree.TreeViewModel._private.shouldDrawExpander(testsShouldDrawExpander[i].itemData, testsShouldDrawExpander[i].expanderIcon),
                  testsResultShouldDrawExpander[i],
                  'Invalid value "shouldDrawExpander(...)" for step ' + i + '.');
            });
         });
          it('shouldDrawExpanderPadding', function() {
              var
                  shouldDrawExpanderPadding = tree.TreeViewModel._private.shouldDrawExpanderPadding;
              assert.isTrue(shouldDrawExpanderPadding({
                  getExpanderIcon: () => 'node',
                  getExpanderSize: () => undefined,
                  expanderVisibility: 'visible',
                  thereIsChildItem: true
              }, 'node', undefined));
              assert.isTrue(shouldDrawExpanderPadding({
                  getExpanderIcon: () => 'node',
                  getExpanderSize: () => undefined,
                  expanderVisibility: 'visible',
                  thereIsChildItem: false
              }, 'node', undefined));
              assert.isTrue(shouldDrawExpanderPadding({
                  getExpanderIcon: () => 'node',
                  getExpanderSize: () => undefined,
                  expanderVisibility: 'hasChildren',
                  thereIsChildItem: true
              }, 'node', undefined));
              assert.isFalse(shouldDrawExpanderPadding({
                  getExpanderIcon: () => 'none',
                  getExpanderSize: () => undefined,
                  expanderVisibility: 'visible',
                  thereIsChildItem: true
              }, 'none', undefined));
              assert.isFalse(shouldDrawExpanderPadding({
                  getExpanderIcon: () => 'none',
                  getExpanderSize: () => undefined,
                  expanderVisibility: 'hasChildren',
                  thereIsChildItem: true
              }, 'none', undefined));
              assert.isFalse(shouldDrawExpanderPadding({
                  getExpanderIcon: () => 'node',
                  getExpanderSize: () => undefined,
                  expanderVisibility: 'hasChildren',
                  thereIsChildItem: false
              }, 'node', undefined));
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
               treeViewModel = new tree.TreeViewModel({
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
             tree.TreeViewModel._private.onBeginCollectionChange(treeViewModel);
            assert.isTrue(updated);
         });
         it('determinePresenceChildItem after setExpanderVisibility', function() {
            var
               rs = new collection.RecordSet({
                  rawData: [
                     {
                        key: 1,
                        parent: null,
                        hasChildren: false,
                        type: null
                     },
                     {
                        key: 2,
                        parent: null,
                        hasChildren: true,
                        type: true
                     }
                  ],
                  keyProperty: 'key'
               }),
               treeViewModel = new tree.TreeViewModel({
                  items: rs,
                  hasChildrenProperty: 'hasChildren',
                  expanderVisibility: 'visibly',
                  parentProperty: 'parent',
                  keyProperty: 'id',
                  nodeProperty: 'type'
               });
            assert.isFalse(treeViewModel._thereIsChildItem);
            treeViewModel.setExpanderVisibility('hasChildren');
            assert.isTrue(treeViewModel._thereIsChildItem);
         });
         it('getExpanderPaddingClasses', function() {
            let expectation = [
                'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_default_theme-default',
                'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_s_theme-default',
                'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_m_theme-default',
                'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_l_theme-default',
                'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_xl_theme-default',
            ];
            assert.equal(tree.TreeViewModel._private.getExpanderPaddingClasses({theme, getExpanderSize: () => undefined}, undefined), expectation[0]);
            assert.equal(tree.TreeViewModel._private.getExpanderPaddingClasses({theme, getExpanderSize: () => 's'}, 's'), expectation[1]);
            assert.equal(tree.TreeViewModel._private.getExpanderPaddingClasses({theme, getExpanderSize: () => 'm'}, 'm'), expectation[2]);
            assert.equal(tree.TreeViewModel._private.getExpanderPaddingClasses({theme, getExpanderSize: () => 'l'}, 'l'), expectation[3]);
            assert.equal(tree.TreeViewModel._private.getExpanderPaddingClasses({theme, getExpanderSize: () => 'xl'}, 'xl'), expectation[4]);
         });
         it('getExpanderClasses', function() {
            var
               itemPadding = {
                  top: 'default',
                  bottom: 'default'
                },
               testsPrepareExpanderClasses = [{
                  itemData: {
                     theme,
                     item: {
                        get: function() {
                           return false;
                        }
                     },
                     getExpanderIcon: () => undefined,
                     getExpanderSize: () => undefined,
                     itemPadding
                  }
               }, {
                  itemData: {
                     theme,
                     item: {
                        get: function() {
                           return false;
                        }
                     },
                     itemPadding,
                     getExpanderIcon: () => 'testIcon',
                     getExpanderSize: () => undefined,
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     theme,
                     item: {
                        get: function () {
                           return true;
                        }
                     },
                     itemPadding,
                     getExpanderIcon: () => undefined,
                     getExpanderSize: () => undefined,
                  }
               }, {
                  itemData: {
                     theme,
                     item: {
                        get: function() {
                           return true;
                        }
                     },
                     itemPadding,
                     getExpanderIcon: () => 'testIcon',
                     getExpanderSize: () => undefined,
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     theme,
                     item: {
                        get: function () {
                           return true;
                        }
                     },
                     itemPadding,
                     getExpanderIcon: () => 'node',
                     getExpanderSize: () => undefined,
                  },
                  expanderIcon: 'node'
               }, {
                  itemData: {
                     theme,
                     item: {
                        get: function() {
                           return true;
                        }
                     },
                     itemPadding,
                     getExpanderIcon: () => 'hiddenNode',
                     getExpanderSize: () => undefined,
                  },
                  expanderIcon: 'hiddenNode'
               }],
               testsResultPrepareExpanderClasses = [
                  'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_hiddenNode_default_collapsed_theme-default',
                  'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander_testIcon controls-TreeGrid__row-expander_testIcon_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_testIcon_collapsed_theme-default',
                  'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander_node_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_node_default_collapsed_theme-default',
                  'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander_testIcon controls-TreeGrid__row-expander_testIcon_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_testIcon_collapsed_theme-default',
                  'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander_node controls-TreeGrid__row-expander_node_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_node_default_collapsed_theme-default',
                  'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander_hiddenNode controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_hiddenNode_default_collapsed_theme-default'
               ];
            testsPrepareExpanderClasses.forEach(function(item, i) {
               cAssert.CssClassesAssert.include(
                   tree.TreeViewModel._private.getExpanderClasses(testsPrepareExpanderClasses[i].itemData, testsPrepareExpanderClasses[i].expanderIcon, undefined),
                   testsResultPrepareExpanderClasses[i],
                   'Invalid value "getExpanderClasses(...)" for step ' + i + '.'
               );
            });
         });
         it('getItemDataByItem', function() {
            const originFn = tree.TreeViewModel.superclass.getItemDataByItem;
             tree.TreeViewModel.superclass.getItemDataByItem = function() {
               return {
                  item: {},
                  getCurrentColumn: function() {
                     return {
                        classList: {
                           base: ''
                        }
                     };
                  }
               };
            };
            treeViewModel = new tree.TreeViewModel(cfg);
            const itemData = treeViewModel.getCurrent();
            assert.isTrue(!!itemData.getLevelIndentClasses);
             tree.TreeViewModel.superclass.getItemDataByItem = originFn;
         });
      });
      describe('expandedItems', function() {
         it('initialize from options and changing expandedItems', function() {
            var
               baseExpandedItems = [1, 2, 3],
               treeViewModel = new tree.TreeViewModel({
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
            treeViewModel = new tree.TreeViewModel(cfg);
         it('setRoot', function() {
            let model = new tree.TreeViewModel(cMerge({}, cfg));
            model.setRoot('testRoot');
            assert.equal(model._options.root, 'testRoot');
         });
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
            var SETVM = new tree.TreeViewModel(singleExpangConfig);
            SETVM.toggleExpanded(SETVM.getItemById('1', cfg.keyProperty), true);
            assert.deepEqual(['1'], SETVM.getExpandedItems(), 'singleExpand: Invalid value "_expandedItems" after expand 1.');
            SETVM.toggleExpanded(SETVM.getItemById('2', cfg.keyProperty), true);
            assert.deepEqual(['2'], SETVM.getExpandedItems(), 'singleExpand: Invalid value "_expandedItems" after expand 2.');
         });


         it('collapsedItems', function(){
            var treeViewModel = new tree.TreeViewModel(cMerge({
               expandedItems: [null]
            }, cfg));
            assert.deepEqual(treeViewModel._collapsedItems, []);
            treeViewModel.toggleExpanded(treeViewModel.getItemById('123'), false);
            assert.deepEqual(treeViewModel._collapsedItems, ['123']);
         });

         it('nodeFooterVisibilityCallback', function() {
            var
               treeViewModel = new tree.TreeViewModel(cMerge({
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
               model = new tree.TreeViewModel(cfg);
            assert.equal(model.getFirstItem(), model.getItems().at(0));
            assert.equal(model.getLastItem(), model.getItems().at(2));
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

      // TODO: Удалить #rea_1179794968
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
               model = new tree.TreeViewModel({
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
            tvm = new tree.TreeViewModel(cfg);
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
            assert.include(tvm.getDragItemData().getVersion(), '_LEVEL_1');

            tvm.setDragItemData(tvm.getItemDataByItem(tvm.getItemById('234', 'id')));
            assert.include(tvm.getDragItemData().getVersion(), '_LEVEL_2');
         });

         describe('setDragTargetPosition', function() {
            var itemData, dragTargetPosition;

               it('on node without prev state', function() {
                  //move item 567
                  tvm.setDragItemData(tvm.getItemDataByItem(tvm.getItemById('567', 'id')));
                  tvm.setDragEntity(dragEntity);

                  //move on 123
                  itemData = tvm.getItemDataByItem(tvm.getItemById('123', 'id'));
                  tvm.setDragTargetPosition({
                     index: 0,
                     position: 'on'
                  });

                  assert.equal(tvm._prevDragTargetPosition.dispItem.getContents().getKey(), '567');
                  assert.equal(tvm._prevDragTargetPosition.position, 'after');
               });

            it('on node', function() {
               //move item 567
               tvm.setDragItemData(tvm.getItemDataByItem(tvm.getItemById('567', 'id')));
               tvm.setDragEntity(dragEntity);

               //move before 456
               itemData = tvm.getItemDataByItem(tvm.getItemById('456', 'id'));
               tvm.setDragTargetPosition({
                  index: 1,
                  position: 'before',
                  dispItem: {
                     getLevel: () => 1,
                     getContents: () => {
                        return {
                           getKey: () => 456
                        };
                     }
                  }
               });

               //move on 123
               itemData = tvm.getItemDataByItem(tvm.getItemById('123', 'id'));
               tvm.setDragTargetPosition({
                  index: 0,
                  position: 'on'
               });

               assert.equal(tvm._prevDragTargetPosition.dispItem.getContents().getKey(), '456');
               assert.equal(tvm._prevDragTargetPosition.position, 'before');
            });
         });
      });

      describe('setNodeFooterIfNeed', function() {
         let model;

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

         beforeEach(function() {
            model = new tree.TreeViewModel(cfg);
         });

         it('no hierarchy = no has more footers', function() {
            const itemData = model.getItemDataByItem(model.getItemById('567', 'id'));
            itemData.nodeProperty = undefined;
            itemData.parentProperty = undefined;
            tree.TreeViewModel._private.setNodeFooterIfNeed(model, itemData);
            assert.deepEqual(itemData.nodeFooters, []);
         });

         it('try to get node footers for item that not exists in record set', function() {
            model.setExpandedItems(['123', '234']);
            const itemModel = model.getItemById('234', 'id');
            const itemData = model.getItemDataByItem(itemModel);
            model._items.remove(itemModel.getContents());
            tree.TreeViewModel._private.setNodeFooterIfNeed(model, itemData);
         });
      });
   });
});
