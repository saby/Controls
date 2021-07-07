define(['Controls/treeGrid',
   'Core/core-instance', 'Types/collection'], function(treeGrid, cInstance, collection) {

   describe('Controls.List.TreeGrid.TreeGridViewModel', function() {
      var
         theme = 'default',
         treeGridViewModel = new treeGrid.ViewModel({theme: theme, columns:[]});
      it('_createModel', function() {
         var
            createdModel = treeGridViewModel._createModel({});
         assert.isTrue(
            cInstance.instanceOfModule(createdModel, 'Controls/tree:TreeViewModel') ||
            cInstance.instanceOfModule(createdModel, 'Controls/_tree/Tree/TreeViewModel'),
         'Invalid type of created model.');
      });
      it('toggleExpanded', function() {
         var
            toggleExpandedCalled = false;
         treeGridViewModel._model.toggleExpanded = function() {
            toggleExpandedCalled = true;
         };
         treeGridViewModel.toggleExpanded();
         assert.isTrue(toggleExpandedCalled, 'Invalid call toggleExpanded on model instance.');
      });

      it('toggleExpanded and ladder', function() {
         var
            initialColumns = [{
               width: '1fr',
               displayProperty: 'title'
            }],
            resultLadderBeforeExpand = {
               0: { date: { ladderLength: 1 } }
            },
            resultLadderAfterExpand = {
               0: { date: { ladderLength: 1 } },
               1: { date: { ladderLength: 3 } },
               2: { date: { } },
               3: { date: { } }
            },
            ladderViewModel = new treeGrid.ViewModel({
               items: new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     { id: 0, title: 'i0', date: '01 янв', parent: null, type: true },
                     { id: 1, title: 'i1', date: '03 янв', parent: 0, type: null },
                     { id: 2, title: 'i2', date: '03 янв', parent: 0, type: null },
                     { id: 3, title: 'i3', date: '03 янв', parent: 0, type: null }
                  ]
               }),
               keyProperty: 'id',
               nodeProperty: 'type',
               parentProperty: 'parent',
               columns: initialColumns,
               ladderProperties: ['date']
            });
         assert.deepEqual(ladderViewModel._ladder.ladder, resultLadderBeforeExpand, 'Incorrect value prepared ladder before expand.');
         ladderViewModel.toggleExpanded(ladderViewModel._model._display.at(0));
         assert.deepEqual(ladderViewModel._ladder.ladder, resultLadderAfterExpand, 'Incorrect value prepared ladder after expand.');
      });
      it('setExpandedItems', function() {
         treeGridViewModel._model._display = {
            setFilter: function() {},
            getCollapsedGroups: () => undefined,
            getKeyProperty: () => 'id',
            getCount: () => 2
         };
         treeGridViewModel.setExpandedItems([]);
         assert.deepEqual([], treeGridViewModel._model._expandedItems);

         treeGridViewModel.setExpandedItems([1, 2]);
         assert.deepEqual([1,2], treeGridViewModel._model._expandedItems);
      });
      it('notify "onNodeRemoved"', function() {
         var
            notifiedOnNodeRemoved = false;
         treeGridViewModel._notify = function(eventName, nodeId) {
            assert.equal(nodeId, 1, 'Invalid argument notify "onNodeRemoved".');
            notifiedOnNodeRemoved = true;
         };
         treeGridViewModel._onNodeRemoved(null, 1);
         assert.isTrue(notifiedOnNodeRemoved, 'Invalid call _notify("onNodeRemoved").');
      });
      it('setRoot', function() {
         var
            setRootCalled = false;
         treeGridViewModel._model.setRoot = function() {
            setRootCalled = true;
         };
         treeGridViewModel.setRoot('testRoot');
         assert.isTrue(setRootCalled, 'Invalid call toggleExpanded on model instance.');
      });

      it('getCurrent', function () {

         var itemTypes = {
            node: 'node',
            hiddenNode: 'hiddenNode',
            item: 'item'
         };

         function checkCellClasses(classes, itemType) {
            assert.isTrue(classes.indexOf('controls-TreeGrid__row-cell_theme-default') !== -1);
            if (itemType === itemTypes.node) {
               assert.isTrue(classes.indexOf('controls-TreeGrid__row-cell__node_theme-default') !== -1);
               assert.isTrue(classes.indexOf('controls-TreeGrid__row-cell__hiddenNode_theme-default') === -1);
               assert.isTrue(classes.indexOf('controls-TreeGrid__row-cell__item_theme-default') === -1);
            }
            if (itemType === itemTypes.hiddenNode) {
               assert.isTrue(classes.indexOf('controls-TreeGrid__row-cell__node_theme-default') === -1);
               assert.isTrue(classes.indexOf('controls-TreeGrid__row-cell__hiddenNode_theme-default') !== -1);
               assert.isTrue(classes.indexOf('controls-TreeGrid__row-cell__item_theme-default') === -1);
            }
            if (itemType === itemTypes.item) {
               assert.isTrue(classes.indexOf('controls-TreeGrid__row-cell__node_theme-default') === -1);
               assert.isTrue(classes.indexOf('controls-TreeGrid__row-cell__hiddenNode_theme-default') === -1);
               assert.isTrue(classes.indexOf('controls-TreeGrid__row-cell__item_theme-default') !== -1);
            }
         }

         function checkCellBackgroundClass(classes, backgroundColorStyle) {
            assert.isTrue(classes.indexOf('controls-Grid__row-cell_background_' + backgroundColorStyle + '_theme-default') !== -1);
         }

         var current,
             initialColumns = [{
                width: '1fr',
                displayProperty: 'title'
             }],
             model = new treeGrid.ViewModel({
                theme: theme,
                items: new collection.RecordSet({
                   keyProperty: 'id',
                   rawData: [
                      {id: 0, title: 'i0', parent: null, type: true},
                      {id: 1, title: 'i1', parent: null, type: false},
                      {id: 2, title: 'i2', parent: null, type: null}
                   ]
                }),
                keyProperty: 'id',
                nodeProperty: 'type',
                parentProperty: 'parent',
                columns: initialColumns
             });
         current = model.getCurrent();
         checkCellClasses(current.getCurrentColumn().classList.base, itemTypes.node);
         checkCellBackgroundClass(current.getCurrentColumn('danger').classList.base, 'danger');

         assert.equal(current.getCurrentColumn().getExpanderClasses, current.getExpanderClasses);
         model.goToNext();

         current = model.getCurrent();
         checkCellClasses(current.getCurrentColumn().classList.base, itemTypes.hiddenNode);
         model.goToNext();

         current = model.getCurrent();
         checkCellClasses(current.getCurrentColumn().classList.base, itemTypes.item);
      });


      it('getLevelIndentClasses', function () {
         var
             initialColumns = [{
                width: '1fr',
                displayProperty: 'title'
             }],
             model = new treeGrid.ViewModel({
                theme: theme,
                items: new collection.RecordSet({
                   keyProperty: 'id',
                   rawData: [
                      {id: 0, title: 'i0', parent: null, type: true},
                      {id: 1, title: 'i1', parent: null, type: false},
                      {id: 2, title: 'i2', parent: null, type: null}
                   ]
                }),
                keyProperty: 'id',
                nodeProperty: 'type',
                parentProperty: 'parent',
                columns: initialColumns
             }),
             current = model.getCurrent(),
             expected = {
                defaultOrNull: 'controls-TreeGrid__row-levelPadding_size_default_theme-default',
                onlyExpander_xs: 'controls-TreeGrid__row-levelPadding_size_xs_theme-default',
                onlyExpander_xl: 'controls-TreeGrid__row-levelPadding_size_xl_theme-default',
                onlyIndent_xxs: 'controls-TreeGrid__row-levelPadding_size_xxs_theme-default',
                onlyIndent_m: 'controls-TreeGrid__row-levelPadding_size_m_theme-default',
                s_m: 'controls-TreeGrid__row-levelPadding_size_m_theme-default',
                l_xl: 'controls-TreeGrid__row-levelPadding_size_xl_theme-default'
             };

         assert.equal(expected.defaultOrNull, current.getLevelIndentClasses({getExpanderSize: () => null}, null, null));

         assert.equal(expected.onlyExpander_xs, current.getLevelIndentClasses({getExpanderSize: () => 'xs'}, 'xs', null));
         assert.equal(expected.onlyExpander_xl, current.getLevelIndentClasses({getExpanderSize: () => 'xl'}, 'xl', null));

         assert.equal(expected.onlyIndent_xxs, current.getLevelIndentClasses({getExpanderSize: () => null}, null, 'xxs'));
         assert.equal(expected.onlyIndent_m, current.getLevelIndentClasses({getExpanderSize: () => null}, null, 'm'));

         assert.equal(expected.s_m, current.getLevelIndentClasses({getExpanderSize: () => 's'}, 's', 'm'));
         assert.equal(expected.l_xl, current.getLevelIndentClasses({getExpanderSize: () => 'l'}, 'l', 'xl'));
      });

      it('check last row with node footer', function() {
         var initialColumns = [{
               width: '1fr',
               displayProperty: 'title'
            }],
            model = new treeGrid.ViewModel({
               theme: theme,
               items: new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     {
                        id: 0, title: 'i0', parent: null, type: true
                     }
                  ]
               }),
               keyProperty: 'id',
               nodeProperty: 'type',
               parentProperty: 'parent',
               columns: initialColumns
            });

         let originFn = treeGrid.ViewModel.superclass.getItemDataByItem;
         treeGrid.ViewModel.superclass.getItemDataByItem = function() {
            return {
               item: {},
               columns: initialColumns,
               nodeFooters: [{key: 0}],
               rowIndex: 1,
               itemPadding: {},
               isLastRow: true,
               getCurrentColumn: function() {
                  return {
                     cellClasses: ''
                  };
               },
               dispItem: {
                  getParent: () => {
                     return {
                        getContents: () => {
                           return {
                              getKey: () => 0
                           };
                        }
                     };
                  }
               },
               columnScroll: true
            };
         };

         assert.isFalse(model.getItemDataByItem.call(model).isLastRow);
         treeGrid.ViewModel.superclass.getItemDataByItem = originFn;
      });

      it('check last row with node footer', function() {
         var initialColumns = [{
               width: '1fr',
               displayProperty: 'title'
            }],
            model = new treeGrid.ViewModel({
               theme: theme,
               items: new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     {
                        id: 0, title: 'i0', parent: null, type: true
                     }
                  ]
               }),
               keyProperty: 'id',
               nodeProperty: 'type',
               parentProperty: 'parent',
               columns: initialColumns
            });

         let originFn = treeGrid.ViewModel.superclass.getItemDataByItem;
         treeGrid.ViewModel.superclass.getItemDataByItem = function() {
            return {
               item: {},
               columns: initialColumns,
               nodeFooters: [{key: 0}],
               rowIndex: 1,
               itemPadding: {},
               isLastRow: true,
               getCurrentColumn: function() {
                  return {
                     cellClasses: ''
                  };
               },
               dispItem: {
                  getParent: () => {
                     return {
                        getContents: () => {
                           return {
                              getKey: () => 0
                           };
                        }
                     };
                  }
               },
               columnScroll: true
            };
         };

         assert.isFalse(model.getItemDataByItem.call(model).isLastRow);
         treeGrid.ViewModel.superclass.getItemDataByItem = originFn;
      });

      it('getFooterStyles', function () {
         var
             initialColumns = [{
                width: '1fr',
                displayProperty: 'title'
             }],
             model = new treeGrid.ViewModel({
                items: new collection.RecordSet({
                   keyProperty: 'id',
                   rawData: [
                      {id: 0, title: 'i0', parent: null, type: true},
                      {id: 1, title: 'i1', parent: null, type: false},
                      {id: 2, title: 'i2', parent: null, type: null}
                   ]
                }),
                keyProperty: 'id',
                nodeProperty: 'type',
                multiSelectVisibility: 'hidden',
                parentProperty: 'parent',
                columns: initialColumns
             });

         model._isFullGridSupport = true;

         assert.equal(model.getFooterStyles(),
             'grid-column-start: 1; grid-column-end: 2;'
         );

         model._options.multiSelectVisibility = 'visible';

         assert.equal(model.getFooterStyles(),
             'grid-column-start: 1; grid-column-end: 3;'
         );
      });

      it('row index for node footer', function() {
         let initialColumns = [{
            width: '1fr',
            displayProperty: 'title'
            }],
             model = new treeGrid.ViewModel({
                items: new collection.RecordSet({
                   idProperty: 'id',
                   rawData: [
                      {id: 0, title: 'i0', parent: null, type: true},
                      {id: 1, title: 'i1', parent: null, type: false},
                      {id: 2, title: 'i2', parent: null, type: null}
                   ]
                }),
                keyProperty: 'id',
                nodeProperty: 'type',
                theme: 'default',
                rowSeparatorSize: 'l',
                parentProperty: 'parent',
                columns: initialColumns,
                columnScroll: true
             });

         let originFn = treeGrid.ViewModel.superclass.getItemDataByItem;
         treeGrid.ViewModel.superclass.getItemDataByItem = function() {
            return {
               item: {},
               columns: initialColumns,
               nodeFooters: [{}],
               rowIndex: 1,
               itemPadding: {},
               getCurrentColumn: function() {
                  return {
                     cellClasses: ''
                  };
               },
               columnScroll: true
            };
         };

         let nodeFooter = model.getItemDataByItem.call(model).nodeFooters[0];
         assert.equal(nodeFooter.rowIndex, 2);
         assert.equal(nodeFooter.colspanStyles, 'grid-column-start: 2; grid-column-end: 4;');

         assert.isTrue(nodeFooter.classes.indexOf('controls-TreeGrid__nodeFooterContent_rowSeparatorSize-null_theme-default') === -1);
         assert.isTrue(nodeFooter.classes.indexOf('controls-TreeGrid__nodeFooterContent_rowSeparatorSize-s_theme-default') === -1);
         assert.isTrue(nodeFooter.classes.indexOf('controls-TreeGrid__nodeFooterContent_rowSeparatorSize-l_theme-default') !== -1);

         treeGrid.ViewModel.superclass.getItemDataByItem = originFn;
      });

      it('node footer classes', function() {
         let initialColumns = [{
                width: '1fr',
                displayProperty: 'title'
             }],
             model = new treeGrid.ViewModel({
                items: new collection.RecordSet({
                   idProperty: 'id',
                   rawData: [
                      {id: 0, title: 'i0', parent: null, type: true},
                      {id: 1, title: 'i1', parent: null, type: false},
                      {id: 2, title: 'i2', parent: null, type: null}
                   ]
                }),
                keyProperty: 'id',
                nodeProperty: 'type',
                theme: 'default',
                rowSeparatorSize: 'l',
                parentProperty: 'parent',
                columns: initialColumns,
                columnScroll: true,
                stickyColumnsCount: 1
             });

         let originFn = treeGrid.ViewModel.superclass.getItemDataByItem;
         treeGrid.ViewModel.superclass.getItemDataByItem = function() {
            return {
               item: {},
               columns: initialColumns,
               nodeFooters: [{}],
               rowIndex: 1,
               itemPadding: {},
               getCurrentColumn: function() {
                  return {
                     cellClasses: ''
                  };
               },
               columnScroll: true
            };
         };

         let nodeFooter = model.getItemDataByItem.call(model).nodeFooters[0];
         assert.isTrue(nodeFooter.getColumnClasses(0).indexOf('controls-Grid_columnScroll__fixed') !== -1);
         assert.isTrue(nodeFooter.getColumnClasses(0, { colspan: false }).indexOf('controls-Grid_columnScroll__fixed') !== -1);
         assert.equal(nodeFooter.classes, nodeFooter.getColumnClasses(0));

         treeGrid.ViewModel.superclass.getItemDataByItem = originFn;
      });

      it('calcRowIndex', function () {
         var
             initialColumns = [{
                width: '1fr',
                displayProperty: 'title'
             }],
             model = new treeGrid.ViewModel({
                items: new collection.RecordSet({
                   keyProperty: 'id',
                   rawData: [
                      {id: 0, title: 'i0', parent: null, type: true},
                      {id: 1, title: 'i1', parent: null, type: false},
                      {id: 2, title: 'i2', parent: null, type: null}
                   ]
                }),
                keyProperty: 'id',
                nodeProperty: 'type',
                parentProperty: 'parent',
                columns: initialColumns
             }),
             current = model.getCurrent();

         assert.equal(model._calcRowIndex(current), 0);

      });

      it('setExpandedItems', function() {

         treeGridViewModel._model._expandedItems = null;

         treeGridViewModel._model.setExpandedItems = function(expandedItems) {
            treeGridViewModel._model._expandedItems = expandedItems;
         };

         treeGridViewModel.setExpandedItems({
            '123': true,
            '234': true
         });
         assert.deepEqual({
            '123': true,
            '234': true
         }, treeGridViewModel._model._expandedItems);

         treeGridViewModel.setExpandedItems({});
         assert.deepEqual({}, treeGridViewModel._model._expandedItems);

      });
      it('_private.getExpandedItems should return keys of expanded nodes (alse if expanded)', function () {
         const
             model = new treeGrid.ViewModel({
                items: new collection.RecordSet({
                   keyProperty: 'id',
                   rawData: [
                      {id: 0, title: 'i0', parent: null, type: true},
                      {id: 1, title: 'i1', parent: null, type: false},
                      {id: 2, title: 'i2', parent: null, type: null}
                   ]
                }),
                keyProperty: 'id',
                nodeProperty: 'type',
                parentProperty: 'parent',
                expandedItems: [null],
                columns: [{}]
             });

         // Return origin if has no display
         assert.deepEqual(
             model._model.getExpandedItems(),
             treeGrid.ViewModel._private.getExpandedItems(null, model._model.getExpandedItems(), model._options.nodeProperty)
         );

         assert.deepEqual(
             [0, 1],
             treeGrid.ViewModel._private.getExpandedItems(model.getDisplay(), model._model.getExpandedItems(), model._options.nodeProperty)
         );
      });

      it('getResultsPosition with setHasMoreData', function() {
         let initialColumns = [{
            width: '1fr',
            displayProperty: 'title'
         }];

         let treeGridView = new treeGrid.ViewModel({
            items: new collection.RecordSet({
               idProperty: 'id',
               rawData: [
                  { id: 0, title: 'i0', date: '01 янв', parent: null, type: true },
               ]
            }),
            keyProperty: 'id',
            nodeProperty: 'type',
            parentProperty: 'parent',
            columns: initialColumns,
            resultsPosition: 'top'
         });

         assert.equal(undefined, treeGridView.getResultsPosition());
         treeGridView.setHasMoreData(true);
         assert.equal('top', treeGridView.getResultsPosition());
         treeGridView.setHasMoreData(false);
         assert.equal(undefined, treeGridView.getResultsPosition());
      });

      it('isDrawResults()', function() {

         let initialColumns = [{
            width: '1fr',
            displayProperty: 'title'
         }];

         let
            ladderViewModel = new treeGrid.ViewModel({
               items: new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     { id: 0, title: 'i0', date: '01 янв', parent: null, type: true },
                     { id: 1, title: 'i1', date: '03 янв', parent: 0, type: null },
                     { id: 2, title: 'i2', date: '03 янв', parent: 0, type: null },
                     { id: 3, title: 'i3', date: '03 янв', parent: 0, type: null },
                     { id: 4, title: 'i4', date: '01 янв', parent: null, type: true },
                  ]
               }),
               keyProperty: 'id',
               nodeProperty: 'type',
               parentProperty: 'parent',
               columns: initialColumns,
               ladderProperties: ['date']
            });


         ladderViewModel.getItems = () => ladderViewModel._model.getItems();
         ladderViewModel.getDisplay = () => ({
            getRoot: () => ({
               getContents: () => null
            }),
            getCount: () => undefined
         });
         assert.isTrue(ladderViewModel.isDrawResults());
         ladderViewModel.getItems().removeAt(4);
         assert.isFalse(ladderViewModel.isDrawResults());
         ladderViewModel.getDisplay = () => null;
         assert.equal(undefined, ladderViewModel.isDrawResults());
         ladderViewModel._options.resultsVisibility = 'visible';
         assert.isTrue(ladderViewModel.isDrawResults());
      });

      it('itemData and columnData should have same methods that use in expander template', function() {
         let initialColumns = [{
            width: '1fr',
            displayProperty: 'title'
         }];

         let model = new treeGrid.ViewModel({
            items: new collection.RecordSet({
               idProperty: 'id',
               rawData: [
                  { id: 0, title: 'i0', date: '01 янв', parent: null, type: true },
               ]
            }),
            keyProperty: 'id',
            nodeProperty: 'type',
            parentProperty: 'parent',
            columns: initialColumns,
            resultsPosition: 'top'
         });

         const itemData = model.getCurrent();
         const columnData = itemData.getCurrentColumn();

         assert.isNumber(itemData.key);
         assert.equal(itemData.key, columnData.key);

         assert.isDefined(itemData.dispItem);
         assert.equal(itemData.dispItem, columnData.dispItem);

         assert.isFunction(itemData.getExpanderClasses);
         assert.equal(itemData.getExpanderClasses, columnData.getExpanderClasses);

         assert.isFunction(itemData.getExpanderSize);
         assert.equal(itemData.getExpanderSize, columnData.getExpanderSize);
      });
   });
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

});
