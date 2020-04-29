// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { FlatSelectionStrategy } from 'Controls/multiselection';
import { RecordSet } from 'Types/collection';
import { Model, Record } from 'Types/entity';

describe('Controls/_multiselection/SelectionStrategy/Flat', () => {
   const items = new RecordSet({
      rawData: [
         { id: 1 },
         { id: 2 },
         { id: 3 }
      ],
      keyProperty: 'id'
   });
   const strategy = new FlatSelectionStrategy({ items });

   function compareArrays(actual: Record[], expected: Record[]): boolean {
      if (actual.length !== expected.length) {
         return false;
      }
      for (let i = 0; i < actual.length; i++) {
         if (actual[i].getRawData().id !== expected[i].getRawData().id) {
            return false;
         }
      }
      return true;
   }

   describe('select', () => {
      it('not selected', () => {
         let selection = { selected: [], excluded: [] };
         selection = strategy.select(selection, [2]);
         assert.deepEqual(selection.selected, [2]);
         assert.deepEqual(selection.excluded, []);
      });

      it('selected all, but one', () => {
         let selection = { selected: [null], excluded: [2] };
         selection = strategy.select(selection, [2]);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, []);
      });
   });

   describe('unselect', () => {
      it('selected one', () => {
         let selection = { selected: [2], excluded: [] };
         selection = strategy.unselect(selection, [2]);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);
      });

      it('selected all', () => {
         let selection = { selected: [null], excluded: [] };
         selection = strategy.unselect(selection, [2]);
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
         assert.isTrue(compareArrays(res.get(true), []));
         assert.isTrue(compareArrays(res.get(null), []));
         assert.isTrue(compareArrays(res.get(false), [
            new Record({ rawData: { id: 1 } }),
            new Record({ rawData: { id: 2 } }),
            new Record({ rawData: { id: 3 } })
         ]));
      });

      it('selected one', () => {
         const selection = { selected: [1], excluded: [] };
         const res = strategy.getSelectionForModel(selection);
         assert.isTrue(compareArrays(res.get(true), [ new Record({ rawData: { id: 1 } }) ]));
         assert.isTrue(compareArrays(res.get(null), []));
         assert.isTrue(compareArrays(res.get(false), [
            new Record({ rawData: { id: 2 } }),
            new Record({ rawData: { id: 3 } })
         ]));
      });

      it('selected all, but one', () => {
         const selection = { selected: [null], excluded: [2] };
         const res = strategy.getSelectionForModel(selection);
         assert.isTrue(compareArrays(res.get(true), [
            new Record({ rawData: { id: 1 } }),
            new Record({ rawData: { id: 3 } })
         ]));
         assert.isTrue(compareArrays(res.get(null), []));
         assert.isTrue(compareArrays(res.get(false), [ new Record({ rawData: { id: 2 } }) ]));
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
});
