// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { SelectionController } from 'Controls/multiselection';

describe('Controls/_multiselection/Controller', () => {
   const model = {
      items: [],
      flag: false,
      setSelectedItems(): void {
         this.flag = true;
      },
      getHasMoreData(): boolean { return false; },
      getCollection(): number[] { return this.items; },
      getItemBySourceKey(): object {
         return {
            isSelected(): boolean { return false; }
         };
      }
   };

   const strategy = {
      unselect(): object { return { selected: [], excluded: [] }; },
      select(): object { return { selected: [], excluded: [] }; },
      update(): object { return { selected: [], excluded: [] }; },
      selectAll(): object { return { selected: [], excluded: [] }; },
      toggleAll(): object { return { selected: [], excluded: [] }; },
      unselectAll(): object { return { selected: [], excluded: [] }; },
      getCount(): void {},
      getSelectionForModel(): object {
         return {
            get(): object { return {}; }
         };
      }
   };

   let controller;

   beforeEach(() => {
      model.items = [];
      model.flag = false;
      controller = new SelectionController({
         model,
         strategy,
         selectedKeys: [],
         excludedKeys: []
      });
   });

   it('constructor', () => {
      controller = new SelectionController({
         model,
         strategy,
         selectedKeys: [],
         excludedKeys: []
      });
      assert.equal(model.flag, true);
   });

   describe('update', () => {
      it('model changed', () => {
         controller.update({
            model: {
               items: [],
               flag: false,
               setSelectedItems(): void { this.flag = true; },
               getHasMoreData(): boolean { return false; },
               getCollection(): number[] { return this.items; },
               getItemBySourceKey(): object {
                  return {
                     isSelected(): boolean {
                        return false;
                     }
                  };
               }
            },
            selectedKeys: [],
            excludedKeys: [],
            strategyOptions: {}
         });
         assert.equal(controller._model.flag, true);
      });

      it('items changed', () => {
         model.items = [1];
         controller.update({
            model,
            selectedKeys: [],
            excludedKeys: [],
            strategyOptions: {}
         });
         assert.equal(controller._model.flag, true);
      });

      it('selection changed', () => {
         controller.update({
            model,
            selectedKeys: [1],
            excludedKeys: [],
            strategyOptions: {}
         });
         assert.equal(controller._model.flag, true);
      });
   });

   it('toggleItem', () => {
      controller.toggleItem(1);
      assert.equal(model.flag, true);
   });

   it('selectAll', () => {
      controller.selectAll();
      assert.equal(model.flag, true);
   });

   it('toggleAll', () => {
      controller.toggleAll();
      assert.equal(model.flag, true);
   });

   it('unselectAll', () => {
      controller.unselectAll();
      assert.equal(model.flag, true);
   });

   it('handleAddItems', () => {
      controller.handleAddItems([]);
      assert.equal(model.flag, true);
   });

   it('handleRemoveItems', () => {
      controller.handleRemoveItems([]); // TODO add args
      assert.equal(model.flag, true);
   });

   it('handleReset', () => {
      controller.handleReset([]);
      assert.equal(model.flag, true);
   });
});
