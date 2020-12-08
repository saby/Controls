// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { FlatSelectionStrategy } from 'Controls/multiselection';
import { RecordSet } from 'Types/collection';
import { Model, Model } from 'Types/entity';
import { Collection, CollectionItem } from 'Controls/display';

describe('Controls/_multiselection/SelectionStrategy/Flat', () => {
   const items = new RecordSet({
      rawData: [
         { id: 1 },
         { id: 2 },
         { id: 3 }
      ],
      keyProperty: 'id'
   });

   const model = new Collection({collection: items, keyProperty: 'id'});

   const strategy = new FlatSelectionStrategy({ model: model });

   describe('select', () => {
      it('not selected', () => {
         let selection = { selected: [], excluded: [] };
         selection = strategy.select(selection, 2);
         assert.deepEqual(selection.selected, [2]);
         assert.deepEqual(selection.excluded, []);
      });

      it('selected all, but one', () => {
         let selection = { selected: [null], excluded: [2] };
         selection = strategy.select(selection, 2);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, []);
      });
   });

   describe('unselect', () => {
      it('selected one', () => {
         let selection = { selected: [2], excluded: [] };
         selection = strategy.unselect(selection, 2);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);
      });

      it('selected all', () => {
         let selection = { selected: [null], excluded: [] };
         selection = strategy.unselect(selection, 2);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [2]);
      });
   });

   describe('selectAll', () => {
      it('not selected', () => {
         let selection = { selected: [], excluded: [] };
         selection = strategy.selectAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, []);
      });

      it('selected one', () => {
         let selection = { selected: [1], excluded: [] };
         selection = strategy.selectAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, []);
      });

      it('selected all, but one', () => {
         let selection = { selected: [null], excluded: [2] };
         selection = strategy.selectAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, []);
      });

      it('with limit', () => {
         let selection = { selected: [null], excluded: [2] };
         selection = strategy.selectAll(selection, 5);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [2]);
      });
   });

   describe('unselectAll', () => {
      it('selected one', () => {
         let selection = { selected: [1], excluded: [] };
         selection = strategy.unselectAll(selection);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);
      });

      it('selected all, but one', () => {
         let selection = { selected: [null], excluded: [2] };
         selection = strategy.unselectAll(selection);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);
      });
   });

   describe('toggleAll', () => {
      it('not selected', () => {
         let selection = { selected: [], excluded: [] };
         selection = strategy.toggleAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, []);
      });

      it('selected one', () => {
         let selection = { selected: [1], excluded: [] };
         selection = strategy.toggleAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [1]);
      });

      it('selected all, but one', () => {
         let selection = { selected: [null], excluded: [2] };
         selection = strategy.toggleAll(selection);
         assert.deepEqual(selection.selected, [2]);
         assert.deepEqual(selection.excluded, []);
      });
   });

   describe('getSelectionForModel', () => {
      it('not selected', () => {
         const selection = { selected: [], excluded: [] };
         const res = strategy.getSelectionForModel(selection);
         assert.deepEqual(res.get(true), []);
         assert.deepEqual(res.get(null), []);
         assert.deepEqual(res.get(false), [
             model.getItemBySourceKey(1),
             model.getItemBySourceKey(2),
             model.getItemBySourceKey(3)
         ]);
      });

      it('selected one', () => {
         const selection = { selected: [1], excluded: [] };
         const res = strategy.getSelectionForModel(selection);
         assert.deepEqual(res.get(true), [ model.getItemBySourceKey(1) ]);
         assert.deepEqual(res.get(null), []);
         assert.deepEqual(res.get(false), [
             model.getItemBySourceKey(2),
             model.getItemBySourceKey(3)
         ]);
      });

      it('selected all, but one', () => {
         const selection = { selected: [null], excluded: [2] };
         const res = strategy.getSelectionForModel(selection);
         assert.deepEqual(res.get(true), [
             model.getItemBySourceKey(1),
             model.getItemBySourceKey(3)
         ]);
         assert.deepEqual(res.get(null), []);
         assert.deepEqual(res.get(false), [ model.getItemBySourceKey(2) ]);
      });
   });

   describe('getCount', () => {
      it('not selected', () => {
         const selection = { selected: [], excluded: [] };
         const count = strategy.getCount(selection, false);
         assert.equal(count, 0);
      });

      it('selected one', () => {
         const selection = { selected: [1], excluded: [] };
         const count = strategy.getCount(selection, false);
         assert.equal(count, 1);
      });

      it('selected one and has more data', () => {
         const selection = { selected: [1], excluded: [] };
         const count = strategy.getCount(selection, true);
         assert.equal(count, 1);
      });

      it('selected all, but one', () => {
         const selection = { selected: [null], excluded: [2] };
         const count = strategy.getCount(selection, false);
         assert.equal(count, 2);
      });

      it('selected all, but one and has more data', () => {
         const selection = { selected: [null], excluded: [2] };
         const count = strategy.getCount(selection, true);
         assert.equal(count, null);
      });
   });

   describe('isAllSelected', () => {
      it('not empty model', () => {
         let selection = { selected: [null], excluded: [] };
         assert.isTrue(strategy.isAllSelected(selection, false, 3));

         selection = { selected: [null], excluded: [5] };
         assert.isFalse(strategy.isAllSelected(selection, false, 3));

         selection = { selected: [1, 2, 3], excluded: [] };
         assert.isFalse(strategy.isAllSelected(selection, true, 3));

         selection = { selected: [1, 2, 3], excluded: [] };
         assert.isTrue(strategy.isAllSelected(selection, false, 3));

         selection = { selected: [], excluded: [] };
         assert.isFalse(strategy.isAllSelected(selection, false, 3, false));

         selection = { selected: [null], excluded: [] };
         assert.isTrue(strategy.isAllSelected(selection, false, 3, false));

         selection = { selected: [null, 2], excluded: [3] };
         assert.isTrue(strategy.isAllSelected(selection, false, 3, false));
      });

      it('empty model', () => {
         const strategy = new FlatSelectionStrategy({
            items: new Collection({collection: new RecordSet(), keyProperty: 'id'})
         });

         const selection = { selected: [], excluded: [] };
         assert.isFalse(strategy.isAllSelected(selection, false, 0, true));
      });
   });
});
