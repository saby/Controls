define([
   'Controls/operations',
   'Types/collection',
   'Controls/treeGrid',
   'Controls/_operations/MultiSelector/SelectionStrategy/Tree',
   'ControlsUnit/ListData'
], function(
   operations,
   collection,
   treeGrid,
   TreeSelectionStrategy,
   ListData
) {
   'use strict';
   describe('Controls.operations:HierarchySelection', function() {
      function getConfig(config) {
         return Object.assign({
            selectedKeys: [],
            excludedKeys: [],
            keyProperty: ListData.KEY_PROPERTY,
            listModel: getListModel(),
            selectionStrategy: new TreeSelectionStrategy.default({
               selectDescendants: true,
               selectAncestors: true,
               nodesSourceControllers: {}
            })
         }, config || {});
      }

      function getListModel(recordSet) {
         return new treeGrid.ViewModel({columns: [], items: recordSet || allData});
      }

      function getEntryPath() {
         return ListData.getItems().map(function(item) {
            return {
               id: item[ListData.KEY_PROPERTY],
               parent: item[ListData.PARENT_PROPERTY]
            };
         });
      }

      var
         cfg,
         selection,
         selectionInstance,
         hiddenNodeWithChildren,
         allData, flatData, rootData;

      /*
         1
           2
             3 (лист)
             4 (лист)
           5 (лист)
         6 (пустая папка)
         7 (лист)
       */
      beforeEach(function() {
         allData = new collection.RecordSet({
            rawData: ListData.getItems(),
            keyProperty: ListData.KEY_PROPERTY
         });
         flatData = new collection.RecordSet({
            rawData: ListData.getFlatItems(),
            keyProperty: ListData.KEY_PROPERTY
         });
         rootData = new collection.RecordSet({
            rawData: ListData.getRootItems(),
            idProperty: ListData.KEY_PROPERTY
         });
         hiddenNodeWithChildren = new collection.RecordSet({
            rawData: [{
               'id': 1,
               'Раздел': null,
               'Раздел@': false
            }, {
               'id': 2,
               'Раздел': 1,
               'Раздел@': null
            }, {
               'id': 3,
               'Раздел': 1,
               'Раздел@': null
            }],
            keyProperty: 'id'
         });
      });
      afterEach(function() {
         selectionInstance = null;
         cfg = null;
         selection = null;
         allData = null;
         flatData = null;
      });
      it('constructor', function() {
         cfg = getConfig();
         selectionInstance = new operations.HierarchySelection(cfg);
         assert.deepEqual([], selectionInstance.selectedKeys);
         assert.deepEqual([], selectionInstance.excludedKeys);
         assert.equal(0, selectionInstance.getCount());
      });

      describe('select', function() {
         describe('allData', function() {
            it('select one node', function() {
               cfg = getConfig();
               selectionInstance = new operations.HierarchySelection(cfg);
               assert.deepEqual([], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);

               selectionInstance.select([6]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([6], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({6: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(1, selectionInstance.getCount());
            });

            it('select child of excluded node', function() {
               cfg = getConfig({
                  selectedKeys: [1],
                  excludedKeys: [2]
               });
               selectionInstance = new operations.HierarchySelection(cfg);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([1], selectionInstance.selectedKeys);
               assert.deepEqual([2], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 5: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(2, selectionInstance.getCount());

               selectionInstance.select([4]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([1, 4], selectionInstance.selectedKeys);
               assert.deepEqual([2], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 2: null, 4: true, 5: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(3, selectionInstance.getCount());
            });

            it('sequentially select all elements inside node', function() {
               cfg = getConfig();
               selectionInstance = new operations.HierarchySelection(cfg);
               assert.deepEqual([], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               selectionInstance.select([3]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([3], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 2: null, 3: true}, selectionInstance._listModel._model._selectedKeys);
               selectionInstance.select([4]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([3, 4], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 2: null, 3: true, 4: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(2, selectionInstance.getCount());
            });

            it('sequentially select all elements inside root node', function() {
               cfg = getConfig();
               selectionInstance = new operations.HierarchySelection(cfg);
               assert.deepEqual([], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               selectionInstance.select([1]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([1], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: true, 2: true, 3: true, 4: true, 5: true}, selectionInstance._listModel._model._selectedKeys);
               selectionInstance.select([6]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([1, 6], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: true, 2: true, 3: true, 4: true, 5: true, 6: true}, selectionInstance._listModel._model._selectedKeys);
               selectionInstance.select([7]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([1, 6, 7], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(7, selectionInstance.getCount());
            });

            it('select root', function() {
               cfg = getConfig();
               selectionInstance = new operations.HierarchySelection(cfg);
               assert.deepEqual([], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               selectionInstance.select([null]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(null, selectionInstance.getCount());
            });

            it('select root in flat list', function() {
               cfg = getConfig({
                  listModel: getListModel(flatData)
               });
               selectionInstance = new operations.HierarchySelection(cfg);
               selectionInstance.select([null]);
               flatData.setMetaData({ more: 3 });

               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.equal(8, selectionInstance.getCount());

               selectionInstance.unselect([null]);
               selectionInstance.select(['itemNotExist']);
               assert.deepEqual(['itemNotExist'], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.equal(null, selectionInstance.getCount());
            });

            it('select previously excluded child', function() {
               cfg = getConfig({
                  selectedKeys: [null],
                  excludedKeys: [2, 5]
               });
               selectionInstance = new operations.HierarchySelection(cfg);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([2, 5], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 6: true, 7: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(null, selectionInstance.getCount());

               selectionInstance.select([2]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([5], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 2: true, 3: true, 4: true, 6: true, 7: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(null, selectionInstance.getCount());

               selectionInstance.select([5]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(null, selectionInstance.getCount());
            });

            it('select hidden node', function() {
               cfg = getConfig({
                  listModel: getListModel(hiddenNodeWithChildren)
               });
               selectionInstance = new operations.HierarchySelection(cfg);
               assert.deepEqual([], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               selectionInstance.select([1]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([1], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: true, 2: true, 3: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(3, selectionInstance.getCount());
            });

            it('select child of a hidden node', function() {
               cfg = getConfig({
                  listModel: getListModel(hiddenNodeWithChildren)
               });
               selectionInstance = new operations.HierarchySelection(cfg);
               assert.deepEqual([], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               selectionInstance.select([2]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([2], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 2: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(1, selectionInstance.getCount());
            });
         });
      });

      describe('unselect', function() {
         describe('allData', function() {
            it('unselect node', function() {
               cfg = getConfig({
                  selectedKeys: [1]
               });
               selectionInstance = new operations.HierarchySelection(cfg);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([1], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: true, 2: true, 3: true, 4: true, 5: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(5, selectionInstance.getCount());

               selectionInstance.unselect([1]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(0, selectionInstance.getCount());
            });

            it('unselect nested node', function() {
               cfg = getConfig({
                  selectedKeys: [2]
               });
               selectionInstance = new operations.HierarchySelection(cfg);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([2], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 2: true, 3: true, 4: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(3, selectionInstance.getCount());

               selectionInstance.unselect([2]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(0, selectionInstance.getCount());
            });

            it('unselect node with excluded nested children', function() {
               cfg = getConfig({
                  selectedKeys: [1],
                  excludedKeys: [3]
               });
               selectionInstance = new operations.HierarchySelection(cfg);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([1], selectionInstance.selectedKeys);
               assert.deepEqual([3], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 2: null, 4: true, 5: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(4, selectionInstance.getCount());

               selectionInstance.unselect([1]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(0, selectionInstance.getCount());
            });

            it('unselect root with excluded nested children', function() {
               cfg = getConfig({
                  selectedKeys: [null],
                  excludedKeys: [3]
               });
               selectionInstance = new operations.HierarchySelection(cfg);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([3], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 2: null, 4: true, 5: true, 6: true, 7: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(null, selectionInstance.getCount());

               selectionInstance.unselect([null]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(0, selectionInstance.getCount());
            });

            it('unselect child inside selected node', function() {
               cfg = getConfig({
                  selectedKeys: [1]
               });
               selectionInstance = new operations.HierarchySelection(cfg);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([1], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: true, 2: true, 3: true, 4: true, 5: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(5, selectionInstance.getCount());

               selectionInstance.unselect([5]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([1], selectionInstance.selectedKeys);
               assert.deepEqual([5], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 2: true, 3: true, 4: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(4, selectionInstance.getCount());

               selectionInstance.unselect([2]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([1], selectionInstance.selectedKeys);
               assert.deepEqual([5, 2], selectionInstance.excludedKeys);
               assert.deepEqual({1: null}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(1, selectionInstance.getCount());
            });

            it('sequentially unselect all children inside selected root', function() {
               cfg = getConfig({
                  selectedKeys: [null]
               });
               selectionInstance = new operations.HierarchySelection(cfg);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(null, selectionInstance.getCount());

               selectionInstance.unselect([7]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([7], selectionInstance.excludedKeys);
               assert.deepEqual({1: true, 2: true, 3: true, 4: true, 5: true, 6: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(null, selectionInstance.getCount());

               selectionInstance.unselect([6]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([7, 6], selectionInstance.excludedKeys);
               assert.deepEqual({1: true, 2: true, 3: true, 4: true, 5: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(null, selectionInstance.getCount());

               selectionInstance.unselect([5]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([7, 6, 5], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 2: true, 3: true, 4: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(null, selectionInstance.getCount());

               selectionInstance.unselect([4]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([7, 6, 5, 4], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 2: null, 3: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(null, selectionInstance.getCount());

               selectionInstance.unselect([3]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([7, 6, 5, 4, 3], selectionInstance.excludedKeys);
               assert.deepEqual({1: null, 2: null}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(null, selectionInstance.getCount());

               selectionInstance.unselect([2]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([7, 6, 5, 2], selectionInstance.excludedKeys);
               assert.deepEqual({1: null}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(null, selectionInstance.getCount());

               selectionInstance.unselect([1]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([null], selectionInstance.selectedKeys);
               assert.deepEqual([7, 6, 1], selectionInstance.excludedKeys);
               assert.deepEqual({}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(null, selectionInstance.getCount());
            });

            it('unselect removed item', function() {
               cfg = getConfig({
                  selectedKeys: [1]
               });
               selectionInstance = new operations.HierarchySelection(cfg);
               selectionInstance.updateSelectionForRender();

               assert.deepEqual([1], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: true, 2: true, 3: true, 4: true, 5: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(5, selectionInstance.getCount());

               selectionInstance._listModel.getItems().remove(selectionInstance._listModel.getItems().getRecordById(2));
               selectionInstance.unselect([2]);
               selectionInstance.updateSelectionForRender();
               assert.deepEqual([1], selectionInstance.selectedKeys);
               assert.deepEqual([], selectionInstance.excludedKeys);
               assert.deepEqual({1: true, 5: true}, selectionInstance._listModel._model._selectedKeys);
               assert.equal(2, selectionInstance.getCount());
            });
         });
      });

      describe('getSelectedKeysForRender', function() {
         it('duplicate ids', function() {
            let itemsWithDuplicateIds = ListData.getItems();
            itemsWithDuplicateIds.push({
               'id': 1,
               'Раздел': null,
               'Раздел@': true
            });
            cfg = getConfig({
               selectedKeys: [1],
               listModel: getListModel(new collection.RecordSet({
                  rawData: itemsWithDuplicateIds,
                  keyProperty: ListData.KEY_PROPERTY
               }))
            });
            selectionInstance = new operations.HierarchySelection(cfg);
            selectionInstance.updateSelectionForRender();

            assert.deepEqual([1], selectionInstance.selectedKeys);
            assert.deepEqual([], selectionInstance.excludedKeys);
            assert.deepEqual({1: true, 2: true, 3: true, 4: true, 5: true}, selectionInstance._listModel._model._selectedKeys);
         });
      });

      it('everything is selected, but item\'s parent is not in a recordset', function() {
         cfg = getConfig({
            selectedKeys: [null],
            listModel: getListModel(new collection.RecordSet({
               rawData: [{
                  'id': 2,
                  'Раздел': 1,
                  'Раздел@': true
               }],
               keyProperty: 'id'
            }))
         });
         selectionInstance = new operations.HierarchySelection(cfg);
         selectionInstance.updateSelectionForRender();
         assert.deepEqual({ 2: true }, selectionInstance._listModel._model._selectedKeys);
         assert.equal(null, selectionInstance.getCount());
      });

      describe('toggleAll', function() {
         it('selectedKeys with key, that is not from collection + toggleAll', function() {
            cfg = getConfig({
               selectedKeys: [1, 2, 4, 5, 6, 7]
            });
            selectionInstance = new operations.HierarchySelection(cfg);
            selectionInstance.toggleAll();


            assert.deepEqual([null], selectionInstance.selectedKeys);
            assert.deepEqual([null, 1, 6, 7], selectionInstance.excludedKeys);

            selectionInstance.toggleAll();


            assert.deepEqual([1, 6, 7], selectionInstance.selectedKeys);
            assert.deepEqual([], selectionInstance.excludedKeys);
         });

         /* toDo До исправления https://online.sbis.ru/opendoc.html?guid=0606ed47-453c-415e-90b5-51e34037433e
         it('toggleAll with root', function() {
            cfg = getConfig({
               selectedKeys: [1, 4, 6],
               excludedKeys: [2, 5]
            });
            selectionInstance = new operations.HierarchySelection(cfg);
            selectionInstance._listModel._model.setRoot(2);
            selectionInstance.toggleAll();


            // 2 выходит из исключений, а ее дочерний эл-т который был выбран, наоборот.
            assert.deepEqual([1, 6], selectionInstance.selectedKeys);
            assert.deepEqual([5, 4], selectionInstance.excludedKeys);

            selectionInstance.toggleAll();


            // Вернулись к начальному
            assert.deepEqual([1, 6, 4], selectionInstance.selectedKeys);
            assert.deepEqual([5, 2], selectionInstance.excludedKeys);
         });*/

         it('toggle all with id folder, which when cast to a boolean type, returns false', function() {
            let items = [
               {
                  [ListData.KEY_PROPERTY]: 0,
                  [ListData.PARENT_PROPERTY]: null,
                  [ListData.NODE_PROPERTY]: true,
                  [ListData.HAS_CHILDREN_PROPERTY]: true
               }, {
                  [ListData.KEY_PROPERTY]: 1,
                  [ListData.PARENT_PROPERTY]: 0,
                  [ListData.NODE_PROPERTY]: true,
                  [ListData.HAS_CHILDREN_PROPERTY]: false
               }
            ];

            cfg = getConfig({
               selectedKeys: [1],
               listModel: getListModel(new collection.RecordSet({
                  rawData: items,
                  keyProperty: ListData.KEY_PROPERTY
               }))
            });
            selectionInstance = new operations.HierarchySelection(cfg);
            selectionInstance._listModel._model.setRoot(0);
            selectionInstance.toggleAll();
            assert.deepEqual([0], selectionInstance.selectedKeys);
            assert.deepEqual([0, 1], selectionInstance.excludedKeys);

            selectionInstance.toggleAll();
            assert.deepEqual([1], selectionInstance.selectedKeys);
            assert.deepEqual([], selectionInstance.excludedKeys);
         });

         it('selectAll and unselectAll in unselected folder', function() {
            // remove current root from data
            allData.removeAt(0);
            selectionInstance = new operations.HierarchySelection(getConfig());
            selectionInstance._listModel._model.setRoot(1);

            assert.deepEqual([], selectionInstance.selectedKeys);
            assert.deepEqual([], selectionInstance.excludedKeys);

            selectionInstance.selectAll();


            assert.deepEqual([1], selectionInstance.selectedKeys);
            assert.deepEqual([1], selectionInstance.excludedKeys);
            assert.equal(null, selectionInstance.getCount());

            selectionInstance.unselectAll();
            assert.deepEqual([], selectionInstance.selectedKeys);
            assert.deepEqual([], selectionInstance.excludedKeys);
            assert.equal(0, selectionInstance.getCount());
         });

         it('selectAll and unselectAll in selected folder', function() {
            cfg = getConfig({
               selectedKeys: [1]
            });
            selectionInstance = new operations.HierarchySelection(cfg);
            selectionInstance._listModel._model.setRoot(1);

            assert.deepEqual([1], selectionInstance.selectedKeys);
            assert.deepEqual([], selectionInstance.excludedKeys);

            selectionInstance.unselectAll();


            assert.deepEqual([], selectionInstance.selectedKeys);
            assert.deepEqual([], selectionInstance.excludedKeys);
         });

         it('selectAll in root with not loaded selected items', function() {
            cfg = getConfig({
               selectedKeys: [1, 2, 3, 4, 6],
               listModel: getListModel(rootData)
            });

            selectionInstance = new operations.HierarchySelection(cfg);
            selectionInstance._listModel.getItems().setMetaData({
               ENTRY_PATH: getEntryPath()
            });
            selectionInstance.selectAll();

            assert.deepEqual([null], selectionInstance.selectedKeys);
            assert.deepEqual([null], selectionInstance.excludedKeys);
         });
      });

      it('if an item is in selectedKeys, it should get counted even if it is not loaded', function() {
         cfg = getConfig({
            selectedKeys: [8], //item with this key doesn't exist in recordset
         });
         selectionInstance = new operations.HierarchySelection(cfg);
         assert.equal(null, selectionInstance.getCount());
      });



      describe('_getSelectionStatus', function() {
         it('without entry path', function() {
            cfg = getConfig({
               selectedKeys: [4],
               listModel: getListModel(rootData)
            });
            selectionInstance = new operations.HierarchySelection(cfg);
            selectionInstance.updateSelectionForRender();
            assert.isTrue(selectionInstance._listModel._model._selectedKeys[1] === undefined);
         });

         it('with entry path', function() {
            cfg = getConfig({
               selectedKeys: [4],
               listModel: getListModel(rootData)
            });
            selectionInstance = new operations.HierarchySelection(cfg);
            selectionInstance._listModel.getItems().setMetaData({
               ENTRY_PATH: [{
                  id: 4,
                  parent: 2
               }, {
                  id: 2,
                  parent: 1
               }]
            });
            selectionInstance.updateSelectionForRender();

            assert.isTrue(selectionInstance._listModel._model._selectedKeys[1] === null);
         });
      });
   });
});
