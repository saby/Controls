import { assert } from 'chai';
import { FlatSelectionStrategy } from 'Controls/multiselection';
import { RecordSet } from 'Types/collection';

describe('Controls/_multiselection/SelectionStrategy/Flat', () => {
   const items = new RecordSet({
      rawData: [
         { id: 1 },
         { id: 2 },
         { id: 3 }
      ]
   });
   const strategy = new FlatSelectionStrategy({ items });

   describe('select', () => {
      it('not selected', () => {
         const selection = { selected: [], excluded: [] };
         strategy.select(selection, [2]);
         assert.deepEqual(selection.selected, [2]);
         assert.deepEqual(selection.excluded, []);
      });

      it('selected all, but one', () => {
         const selection = { selected: [null], excluded: [null, 2] };
         strategy.select(selection, [2]);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null]);
      });
   });

   describe('unselect', () => {
      it('selected one', () => {
         const selection = { selected: [2], excluded: [] };
         strategy.unselect(selection, [2]);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);
      });

      it('selected all', () => {
         const selection = { selected: [null], excluded: [null] };
         strategy.select(selection, [2]);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null, 2]);
      });
   });

   describe('selectAll', () => {
      it('not selected', () => {
         const selection = { selected: [], excluded: [] };
         strategy.selectAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null]);
      });

      it('selected one', () => {
         const selection = { selected: [1], excluded: [] };
         strategy.selectAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null]);
      });

      it('selected all, but one', () => {
         const selection = { selected: [null], excluded: [null, 2] };
         strategy.selectAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null]);
      });
   });

   describe('unselectAll', () => {
      it('selected one', () => {
         const selection = { selected: [1], excluded: [] };
         strategy.unselectAll(selection);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);
      });

      it('selected all, but one', () => {
         const selection = { selected: [null], excluded: [null, 2] };
         strategy.unselectAll(selection);
         assert.deepEqual(selection.selected, []);
         assert.deepEqual(selection.excluded, []);
      });
   });

   describe('toggleAll', () => {
      it('not selected', () => {
         const selection = { selected: [], excluded: [] };
         strategy.selectAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null]);
      });

      it('selected one', () => {
         const selection = { selected: [1], excluded: [] };
         strategy.selectAll(selection);
         assert.deepEqual(selection.selected, [null]);
         assert.deepEqual(selection.excluded, [null, 1]);
      });

      it('selected all, but one', () => {
         const selection = { selected: [null], excluded: [null, 2] };
         strategy.selectAll(selection);
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
         assert.deepEqual(res.get(false), [ { id: 1 }, { id: 2 }, { id: 3 } ]);
      });

      it('selected one', () => {
         const selection = { selected: [1], excluded: [] };
         const res = strategy.getSelectionForModel(selection);
         assert.deepEqual(res.get(true), [ { id: 1 } ]);
         assert.deepEqual(res.get(null), []);
         assert.deepEqual(res.get(false), [ { id: 2 }, { id: 3 } ]);
      });

      it('selected all, but one', () => {
         const selection = { selected: [null], excluded: [null, 2] };
         const res = strategy.getSelectionForModel(selection);
         assert.deepEqual(res.get(true), [{ id: 1 }, { id: 3 } ]);
         assert.deepEqual(res.get(null), []);
         assert.deepEqual(res.get(false), [ { id: 2 } ]);
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
         const selection = { selected: [null], excluded: [null, 2] };
         const count = strategy.getCount(selection, false);
         assert.equal(count, 2);
      });

      it('selected all, but one and has more data', () => {
         const selection = { selected: [null], excluded: [null, 2] };
         const count = strategy.getCount(selection, true);
         assert.equal(count, null);
      });
   });
});
