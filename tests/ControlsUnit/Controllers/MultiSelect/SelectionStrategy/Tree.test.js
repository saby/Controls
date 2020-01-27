define([
   'Controls/operations',
   'Controls/treeGrid',
   'ControlsUnit/ListData',
   'Types/collection',
   'Types/entity',
], function(operations, treeGrid, ListData, collection, entity) {
   'use strict';

   describe('Controls.operations:TreeSelectionStrategy', function() {
      let
         treeStrategy,
         recordSet, model,
         selection = {
            selected: [],
            excluded: []
         },
         hierarchyRelation = new entity.relation.Hierarchy({
            keyProperty: ListData.KEY_PROPERTY,
            parentProperty: ListData.PARENT_PROPERTY,
            nodeProperty: ListData.NODE_PROPERTY,
            declaredChildrenProperty: ListData.HAS_CHILDREN_PROPERTY
         });

      beforeEach(function() {
         selection = {
            selected: [],
            excluded: []
         };
         recordSet = new collection.RecordSet({
            keyProperty: ListData.KEY_PROPERTY,
            rawData: ListData.getItems()
         });
         model = new treeGrid.ViewModel({columns: [], items: recordSet});
         treeStrategy = new operations.TreeSelectionStrategy({
            selectDescendants: false,
            selectAncestors: false
         });
      });

      it('select', function() {
         let selectResult = treeStrategy.select(selection, [], model, hierarchyRelation);
         assert.deepEqual(selectResult.selected, []);
         assert.deepEqual(selectResult.excluded, []);

         selectResult = treeStrategy.select(selection, [1, 2, 9], model, hierarchyRelation);
         assert.deepEqual(selectResult.selected, [1, 2, 9]);
         assert.deepEqual(selectResult.excluded, []);

         selection.selected = [];
         selection.excluded = [1, 6, 9];
         selectResult = treeStrategy.select(selection, [1, 2, 9], model, hierarchyRelation);
         assert.deepEqual(selectResult.selected, [2]);
         assert.deepEqual(selectResult.excluded, [6]);
      });

      it('unSelect', function() {
         let selectResult = treeStrategy.unSelect(selection, [3, 4], model, hierarchyRelation);
         assert.deepEqual(selectResult.selected, []);
         assert.deepEqual(selectResult.excluded, []);

         // 2 - родитедль 3 и 4
         selection.selected = [2];
         selectResult = treeStrategy.unSelect(selection, [3, 4], model, hierarchyRelation);
         assert.deepEqual(selectResult.selected, [2]);
         assert.deepEqual(selectResult.excluded, []);

         selection.excluded = [2];
         selectResult = treeStrategy.unSelect(selection, [3, 4], model, hierarchyRelation);
         assert.deepEqual(selectResult.selected, [2]);
         assert.deepEqual(selectResult.excluded, [2, 3, 4]);


         selection.selected = [1, 2, 3, 4];
         selection.excluded = [9];
         selectResult = treeStrategy.unSelect(selection, [3, 4, 5], model, hierarchyRelation);
         assert.deepEqual(selectResult.selected, [1, 2]);
         assert.deepEqual(selectResult.excluded, [9]);
      });

      it('isAllSelected', function() {
         assert.isFalse(treeStrategy.isAllSelected(selection, null));

         selection.selected = [null];
         assert.isFalse(treeStrategy.isAllSelected(selection, null));

         selection.excluded = [null];
         assert.isTrue(treeStrategy.isAllSelected(selection, null));

         assert.isFalse(treeStrategy.isAllSelected(selection, 1));

         selection.selected = [1];
         selection.excluded = [1];
         assert.isTrue(treeStrategy.isAllSelected(selection, 1));
      });

      describe('getCount', function() {
         it('without selection', function() {
            assert.equal(treeStrategy.getCount(selection, model, {}, hierarchyRelation), 0);
         });

         it('with selected items', function() {
            selection.selected = [1, 2, 10, 15];
            assert.equal(treeStrategy.getCount(selection, model, {}, hierarchyRelation), 4);
         });

         it('with selected and excluded items', function() {
            selection.selected = [1, 2, 10];
            selection.excluded = [3, 4];
            assert.equal(treeStrategy.getCount(selection, model, {}, hierarchyRelation), 3);
         });

         it('select root', function() {
            selection.selected = [null];
            selection.excluded = [null];
            model.getItems().setMetaData({more: false});
            assert.equal(treeStrategy.getCount(selection, model, {}, hierarchyRelation), 3);
         });

         it('select root with excluded', function() {
            // Дети корня 1,6,7
            selection.selected = [null];
            selection.excluded = [null, 1, 7, 10];
            model.getItems().setMetaData({more: 3});
            assert.equal(treeStrategy.getCount(selection, model, {}, hierarchyRelation), 1);
         });

         it('with not loaded selected root', function() {
            selection.selected = [null];
            selection.excluded = [null];
            assert.equal(treeStrategy.getCount(selection, model, {}, hierarchyRelation), null);
         });

         it('with not loaded node', function() {
            selection.selected = [10];
            selection.excluded = [10];
            assert.equal(treeStrategy.getCount(selection, model, {}, hierarchyRelation), null);
         });
      });

      describe('getSelectionForModel', function() {
         it('without selection', function() {
            let selectionForModel = treeStrategy.getSelectionForModel(selection, model, 0, '', hierarchyRelation);
            assert.deepEqual(selectionForModel, new Map());
         });

         it('with selected items', function() {
            selection.selected = [1, 2, 10];
            let selectionForModel = treeStrategy.getSelectionForModel(selection, model, 0, '', hierarchyRelation);
            assert.deepEqual(selectionForModel, new Map([[1, true], [2, true]]));
         });

         it('with selected and excluded items', function() {
            selection.selected = [1, 4];
            selection.excluded = [4];
            let selectionForModel = treeStrategy.getSelectionForModel(selection, model, 0, '', hierarchyRelation);
            assert.deepEqual(selectionForModel, new Map([[1, true]]));
         });

         it('select root', function() {
            selection.selected = [null];
            selection.excluded = [null];
            let selectionForModel = treeStrategy.getSelectionForModel(selection, model, 0, '', hierarchyRelation);
            assert.deepEqual(selectionForModel, new Map([[1, true], [6, true], [7, true]]));
         });

         it('select root with excluded', function() {
            selection.selected = [null];
            selection.excluded = [null, 6, 7, 10];
            let selectionForModel = treeStrategy.getSelectionForModel(selection, model, 0, '', hierarchyRelation);
            assert.deepEqual(selectionForModel, new Map([[1, true]]));
         });
      });
   });
});
