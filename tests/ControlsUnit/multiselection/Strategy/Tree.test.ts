/* tslint:disable:object-literal-key-quotes no-string-literal */
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { TreeSelectionStrategy } from 'Controls/multiselection';
import { Model } from 'Types/entity';
import * as ListData from 'ControlsUnit/ListData';
import { RecordSet } from 'Types/collection';
import { Tree, TreeItem } from 'Controls/display';

describe('Controls/_multiselection/SelectionStrategy/Tree', () => {
   const model = new Tree({
      collection: new RecordSet({
         keyProperty: ListData.KEY_PROPERTY,
         rawData: ListData.getItems()
      }),
      root: new Model({ rawData: { id: null }, keyProperty: ListData.KEY_PROPERTY }),
      keyProperty: ListData.KEY_PROPERTY,
      parentProperty: ListData.PARENT_PROPERTY,
      nodeProperty: ListData.NODE_PROPERTY,
      hasChildrenProperty: ListData.HAS_CHILDREN_PROPERTY
   });

   const strategy = new TreeSelectionStrategy({
      selectDescendants: false,
      selectAncestors: false,
      rootId: null,
      model: model
   });

   const strategyWithDescendantsAndAncestors = new TreeSelectionStrategy({
      selectDescendants: true,
      selectAncestors: true,
      rootId: null,
      model: model
   });

   function toArray(array: TreeItem<Model>[]): object[] {
      function toObj(el: TreeItem<Model>): object {
         return {
            id: el.getContents().getRawData().id,
            Раздел: el.getContents().getRawData().Раздел,
            'Раздел@': el.getContents().getRawData()['Раздел@'],
            'Раздел$': el.getContents().getRawData()['Раздел$']
         };
      }
      return array.map((el) => toObj(el)).sort((e1, e2) => e1.id < e2.id ? -1 : 1);
   }

   beforeEach(() => {
      strategy._rootId = null;
      strategyWithDescendantsAndAncestors._rootId = null;
   });

   describe('select', () => {
      it('not selected', () => {
         let selection = { selected: [], excluded: [] };
         selection = strategy.select(selection, 6);
         assert.deepEqual(selection.selected, [6]);
         assert.deepEqual(selection.excluded, []);

         selection = { selected: [], excluded: [] };
         selection = strategy.select(selection, 1);
         assert.deepEqual(selection.selected, [1]);
         assert.deepEqual(selection.excluded, []);

         selection = { selected: [], excluded: [] };
         selection = strategy.select(selection, 2);
         assert.deepEqual(selection.selected, [2]);
         assert.deepEqual(selection.excluded, []);

         selection = { selected: [], excluded: [2] };
         selection = strategy.select(selection, 2);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);
      });

      it('has selected', () => {
         let selection = { selected: [3, 4], excluded: [] };
         selection = strategyWithDescendantsAndAncestors.select(selection, 2);
         assert.deepEqual(selection.selected, [2]);
         assert.deepEqual(selection.excluded, []);

         selection = { selected: [3, 4], excluded: [] };
         selection = strategy.select(selection, 2);
         assert.deepEqual(selection.selected, [3, 4, 2]);
         assert.deepEqual(selection.excluded, []);
      });
   });

   describe('unselect', () => {
      it('selected node', () => {
         // выбран узел, в котором выбраны дети
         let selection = { selected: [2, 3], excluded: [] };
         selection = strategy.unselect(selection, 2);
         assert.deepEqual(selection.selected, [3]);
         assert.deepEqual(selection.excluded, []);

         // выбран узел, в котором выбраны дети
         selection = { selected: [2, 3], excluded: [] };
         selection = strategyWithDescendantsAndAncestors.unselect(selection, 2);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);

         // выбран узел, в котором исключены дети
         selection = { selected: [2], excluded: [3] };
         selection = strategyWithDescendantsAndAncestors.unselect(selection, 2);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);

         // выбран узел, в котором исключены дети
         selection = { selected: [2], excluded: [3] };
         selection = strategy.unselect(selection, 2);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);

         // выбран узел без родителей и детей
         selection = { selected: [6], excluded: [] };
         selection = strategy.unselect(selection, 6);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);

         // выбран узел со всеми детьми
         selection = { selected: [2], excluded: [] };
         selection = strategyWithDescendantsAndAncestors.unselect(selection, 3);
         assert.deepEqual(selection.selected, [2]);
         assert.deepEqual(selection.excluded, [3]);

         // снимаем выбор с последнего ребенка
         selection = { selected: [2], excluded: [3] };
         selection = strategyWithDescendantsAndAncestors.unselect(selection, 4);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);

         // при снятии выбора с последнего выбранного ребенка, снимаем выбор со всех родителей
         selection = { selected: [1, 2], excluded: [3, 5] };
         selection = strategyWithDescendantsAndAncestors.unselect(selection, 4);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);
      });

      it('selected all', () => {
         let selection = { selected: [null], excluded: [null] };
         selection = strategyWithDescendantsAndAncestors.unselect(selection, 4);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null, 4]);
      });

      it('unselect child', () => {
         // Снять выбор с последнего ближнего ребенка, но ребенок невыбранного ребенка выбран
         let selection = { selected: [1, 3], excluded: [4] };
         selection = strategyWithDescendantsAndAncestors.unselect(selection, 5);
         assert.deepEqual(selection.selected, [1, 3]);
         assert.deepEqual(selection.excluded, [4, 5]);

         // Снять выбор с ребенка ребенка (проверка рекурсивной проверки выбранных детей)
         selection = strategyWithDescendantsAndAncestors.unselect(selection, 3);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);
      });
   });

   describe('selectAll', () => {
      it('not selected', () => {
         // выбрали все в корневом узле
         let selection = { selected: [], excluded: [] };
         selection = strategy.selectAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null]);

         // провалились в узел 2 и выбрали все
         strategy._rootId = 2;
         selection = { selected: [], excluded: [] };
         selection = strategy.selectAll(selection);
         assert.deepEqual(selection.selected, [2]);
         assert.deepEqual(selection.excluded, [2]);
      });

      it('selected one', () => {
         let selection = { selected: [1], excluded: [] };
         selection = strategy.selectAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null]);
      });

      it('selected all, but one', () => {
         let selection = { selected: [null], excluded: [null, 2] };
         selection = strategy.selectAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null]);
      });
   });

   describe('unselectAll', () => {
      it('without ENTRY_PATH', () => {
         let selection = { selected: [1, 6], excluded: [3, 5] };
         selection = strategy.unselectAll(selection);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);
      });

      it('with ENTRY_PATH', () => {
         // если есть ENTRY_PATH то удаляется только текущий корень и его дети
         strategy._entryPath = [];
         strategy._rootId = 2;
         let selection = { selected: [2, 5], excluded: [2, 3] };
         selection = strategy.unselectAll(selection);
         assert.deepEqual(selection.selected, [5]);
         assert.deepEqual(selection.excluded, []);
      });
   });

   describe('toggleAll', () => {
      it('selected current node', () => {
         strategy._rootId = 2;
         let selection = { selected: [2], excluded: [2] };
         selection = strategy.toggleAll(selection);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);
      });

      it('selected some items', () => {
         let selection = { selected: [1, 5], excluded: [] };
         selection = strategy.toggleAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null, 1, 5]);
      });

      it('selected all, but few', () => {
         let selection = { selected: [null], excluded: [null, 2] };
         selection = strategy.toggleAll(selection);
         assert.deepEqual(selection.selected, [2]);
         assert.deepEqual(selection.excluded, []);
      });

      it('toggleAll after select all by one', () => {
         let selection = { selected: [1, 2, 3, 4, 5, 6, 7], excluded: [] };

         selection = strategy.unselect(selection, 2);

         assert.deepEqual(selection.selected, [1, 3, 4, 5, 6, 7]);
         assert.deepEqual(selection.excluded, []);

         selection = strategy.toggleAll(selection);

         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null, 1, 3, 4, 5, 6, 7]);
      });

      it('selected not loaded item', () => {
         let selection = { selected: [20], excluded: [] };
         selection = strategy.toggleAll(selection, true);

         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null, 20]);
      });
   });

   describe('getSelectionForModel', () => {
      it('not selected', () => {
         const selection = { selected: [], excluded: [] };
         const res = strategy.getSelectionForModel(selection);
         assert.deepEqual(toArray(res.get(true)), []);
         assert.deepEqual(toArray(res.get(null)), []);
         assert.deepEqual(toArray(res.get(false)), ListData.getItems());
      });

      it('selected one', () => {
         // выбрали только лист и выбрались все его родители
         let selection = { selected: [3], excluded: [] };
         let res = strategyWithDescendantsAndAncestors.getSelectionForModel(selection);
         assert.deepEqual(toArray(res.get(true)), [ ListData.getItems()[2] ]);
         assert.deepEqual(toArray(res.get(null)), [ ListData.getItems()[0], ListData.getItems()[1]]);
         assert.deepEqual(toArray(res.get(false)), ListData.getItems().filter((it) => ![1, 2, 3].includes(it.id)) );

         // выбрали лист и выбрался только он
         selection = { selected: [3], excluded: [] };
         res = strategy.getSelectionForModel(selection);
         assert.deepEqual(toArray(res.get(true)), [ ListData.getItems()[2] ]);
         assert.deepEqual(toArray(res.get(null)), [ ]);
         assert.deepEqual(toArray(res.get(false)), ListData.getItems().filter((it) => it.id !== 3) );

         // выбрали узел с родителями и с детьми, выбрался узел, дети и родители
         selection = { selected: [2], excluded: [] };
         res = strategyWithDescendantsAndAncestors.getSelectionForModel(selection);
         assert.deepEqual(toArray(res.get(true)), ListData.getItems().filter((it) => [2, 3, 4].includes(it.id)) );
         assert.deepEqual(toArray(res.get(null)), [ ListData.getItems()[0] ]);
         assert.deepEqual(toArray(res.get(false)), ListData.getItems().filter((it) => ![1, 2, 3, 4].includes(it.id)) );

         // выбрали узел с родителями и с детьми, выбрался только узел
         selection = { selected: [2], excluded: [] };
         res = strategy.getSelectionForModel(selection);
         assert.deepEqual(toArray(res.get(true)), [ ListData.getItems()[1] ] );
         assert.deepEqual(toArray(res.get(null)), [ ]);
         assert.deepEqual(toArray(res.get(false)), ListData.getItems().filter((it) => it.id !== 2) );

         // выбрали узел с родителями и с детьми и некоторые дети исключены
         selection = { selected: [2], excluded: [3] };
         res = strategyWithDescendantsAndAncestors.getSelectionForModel(selection);
         assert.deepEqual(toArray(res.get(true)), [ ListData.getItems()[3] ] );
         assert.deepEqual(toArray(res.get(null)), [ ListData.getItems()[0], ListData.getItems()[1] ]);
         assert.deepEqual(toArray(res.get(false)), ListData.getItems().filter((it) => ![1, 2, 4].includes(it.id)) );
      });

      it('selected all, but one', () => {
         const selection = { selected: [null], excluded: [null, 2] };
         const res = strategy.getSelectionForModel(selection);
         assert.deepEqual(toArray(res.get(true)), ListData.getItems().filter((it) => ![2, 3, 4].includes(it.id)) );
         assert.deepEqual(toArray(res.get(null)), [ ]);
         assert.deepEqual(toArray(res.get(false)), ListData.getItems().filter((it) => [2, 3, 4].includes(it.id)) );
      });

      it('selected unloaded item', () => {
          const treeStrategyWithRootItems = new TreeSelectionStrategy({
              selectDescendants: true,
              selectAncestors: true,
              rootId: null,
              model: model
          });
          const entryPath = [
              {parent: 6, id: 10},
              {parent: 6, id: 11}
          ];
          const selection = {
             selected: [10],
             excluded: []
          };
          treeStrategyWithRootItems._entryPath = entryPath;
          const result = treeStrategyWithRootItems.getSelectionForModel(selection);
          const unselectedKeys = toArray(result.get(false)).map((resultItem) => {
             return resultItem.id;
          });
          const hasSelectedItems = !!result.get(true).length;
          const nullStateKeys = toArray(result.get(null)).map((resultItem) => {
              return resultItem.id;
          });
          assert.deepEqual(unselectedKeys, [1, 2, 3, 4, 5, 7]);
          assert.isFalse(hasSelectedItems);
          assert.deepEqual(nullStateKeys, [6]);
      });

      it('selected node use selectAll and go to parent node', () => {
         const selection = {selected: [1], excluded: [1]};
         const res = strategy.getSelectionForModel(selection);
         assert.deepEqual(toArray(res.get(true)), ListData.getItems().filter((it) => [1, 2, 5].includes(it.id)) );
         assert.deepEqual(toArray(res.get(null)), [ ]);
         assert.deepEqual(toArray(res.get(false)), ListData.getItems().filter((it) => ![1, 2, 5].includes(it.id)) );
      });
   });

   describe('getCount', () => {
      it('not selected', () => {
         const selection = { selected: [], excluded: [] };
         const count = strategy.getCount(selection, false);
         const countWithDescAndAnc = strategyWithDescendantsAndAncestors.getCount(selection, false);
         assert.equal(count, 0);
         assert.equal(countWithDescAndAnc, 0);
      });

      it('selected one', () => {
         const selection = { selected: [2], excluded: [] };
         const count = strategy.getCount(selection, false);
         const countWithDescAndAnc = strategyWithDescendantsAndAncestors.getCount(selection, false);
         assert.equal(count, 1);
         assert.equal(countWithDescAndAnc, 3);
      });

      it('selected one and has more data', () => {
         const selection = { selected: [1], excluded: [] };
         const count = strategy.getCount(selection, true);
         const countWithDescAndAnc = strategyWithDescendantsAndAncestors.getCount(selection, true);
         assert.equal(count, 1);
         assert.equal(countWithDescAndAnc, 5);
      });

      it('selected all, but one', () => {
         const selection = { selected: [null], excluded: [null, 2] };
         const count = strategy.getCount(selection, false);
         const countWithDescAndAnc = strategyWithDescendantsAndAncestors.getCount(selection, false);
         assert.equal(count, 4);
         assert.equal(countWithDescAndAnc, 4);
      });

      it('selected all, but one and has more data', () => {
         const selection = { selected: [null], excluded: [null, 2] };
         const count = strategy.getCount(selection, true);
         const countWithDescAndAnc = strategyWithDescendantsAndAncestors.getCount(selection, true);
         assert.equal(count, null);
         assert.equal(countWithDescAndAnc, null);
      });

      it('selected node with more data', () => {
         const selection = {selected: [6], excluded: []};
         model.setHasMoreStorage({
            6: true
         });
         const treeStrategyWithNodesMoreData = new TreeSelectionStrategy({
             selectAncestors: true,
             selectDescendants: true,
             rootId: null,
             model: model
         });
         assert.isNull(treeStrategyWithNodesMoreData.getCount(selection, false));
      });

      it('selected node', () => {
         const selection = {selected: [1], excluded: []};
         const count = strategy.getCount(selection, false);
         const countWithDescAndAnc = strategyWithDescendantsAndAncestors.getCount(selection, false);
         assert.equal(count, 1);
         assert.equal(countWithDescAndAnc, 5);
      });

      it('selected all', () => {
         const selection = { selected: [null], excluded: [null] };
         const count = strategy.getCount(selection, false);
         const countWithDescAndAnc = strategyWithDescendantsAndAncestors.getCount(selection, false);
         assert.equal(count, 7);
         assert.equal(countWithDescAndAnc, 7);
      });
   });

   describe('cases of go inside node and out it', () => {
      it('select node and go inside it', () => {
         let selection = { selected: [], excluded: [] };
         selection = strategyWithDescendantsAndAncestors.select(selection, 2);
         strategyWithDescendantsAndAncestors._rootId = 2;
         const res = strategyWithDescendantsAndAncestors.getSelectionForModel(selection);
         assert.deepEqual(toArray(res.get(true)), ListData.getItems().filter((it) => [2, 3, 4].includes(it.id)) );
         assert.deepEqual(toArray(res.get(null)), [ ListData.getItems()[0] ]);
         assert.deepEqual(toArray(res.get(false)), ListData.getItems().filter((it) => ![1, 2, 3, 4].includes(it.id)) );
      });

      it('select leaf being inside node and go out it', () => {
         let selection = { selected: [], excluded: [] };
         strategyWithDescendantsAndAncestors._rootId = 1;
         selection = strategyWithDescendantsAndAncestors.select(selection, 5);
         strategyWithDescendantsAndAncestors._rootId = null;
         const res = strategyWithDescendantsAndAncestors.getSelectionForModel(selection);
         assert.deepEqual(toArray(res.get(true)), [ ListData.getItems()[4] ] );
         assert.deepEqual(toArray(res.get(null)), [ ListData.getItems()[0] ]);
         assert.deepEqual(toArray(res.get(false)), ListData.getItems().filter((it) => ![1, 5].includes(it.id)) );
      });
   });

   describe('isAllSelected', () => {
      it('all selected', () => {
         const selection = { selected: [null], excluded: [null] };
         assert.isTrue(strategy.isAllSelected(selection, false, 7));
         assert.isTrue(strategy.isAllSelected(selection, false, 7, false));

      });

      it ('all selected and one excluded', () => {
         const selection = { selected: [null], excluded: [null, 2] };
         assert.isFalse(strategy.isAllSelected(selection, false, 7));
         assert.isTrue(strategy.isAllSelected(selection, false, 7, false));
      });

      it ('selected current root', () => {
         const selection = { selected: [5], excluded: [5] };
         strategy.update({
            selectDescendants: false,
            selectAncestors: false,
            rootId: 5,
            model: model
         });
         assert.isTrue(strategy.isAllSelected(selection, false, 7));
         assert.isTrue(strategy.isAllSelected(selection, true, 7, false));
      });

      it ('selected by one all elements', () => {
         const selection = { selected: [1, 2, 3, 4, 5, 6, 7], excluded: [] };
         assert.isTrue(strategy.isAllSelected(selection, false, 7));
         assert.isFalse(strategy.isAllSelected(selection, true, 7, false));
      });

      it ('selected by one all elements and has more data', () => {
         const selection = { selected: [1, 2, 3, 4, 5, 6, 7], excluded: [] };
         assert.isFalse(strategy.isAllSelected(selection, true, 7));
         assert.isFalse(strategy.isAllSelected(selection, true, 7, false));
      });

      it('empty model', () => {
         const strategy = new TreeSelectionStrategy({
            selectDescendants: false,
            selectAncestors: false,
            rootId: null,
            model: model
         });
         const selection = { selected: [], excluded: [] };
         assert.isFalse(strategy.isAllSelected(selection, false, 0, true));
      });
   });
});
