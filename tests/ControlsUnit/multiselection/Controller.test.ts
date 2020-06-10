// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { SelectionController } from 'Controls/multiselection';
import { ListViewModel } from 'Controls/list';
import { RecordSet } from 'Types/collection';
import { spy } from 'sinon';
import { SearchGridViewModel} from 'Controls/treeGrid';

describe('Controls/_multiselection/Controller', () => {
   const items = new RecordSet({
      rawData: [
         { id: 1 },
         { id: 2 },
         { id: 3 }
      ],
      keyProperty: 'id'
   });

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
            get(): object { return []; }
         };
      },
      isAllSelected(): boolean {
         return false;
      }
   };

   let controller, model;

   beforeEach(() => {
      model = new ListViewModel({
         items,
         keyProperty: 'id'
      });

      controller = new SelectionController({
         model,
         strategy,
         selectedKeys: [],
         excludedKeys: []
      });
   });

   describe('update', () => {
      it('model changed', () => {
         model =  new ListViewModel({
            items,
            keyProperty: 'id'
         });

         const setSelectedItemsSpy = spy(model, 'setSelectedItems');

         controller.update({
            model,
            selectedKeys: [],
            excludedKeys: [],
            strategyOptions: {}
         }, false, false);

         assert.isTrue(setSelectedItemsSpy.called);
      });

      it('selection changed', () => {
         const setSelectedItemsSpy = spy(model, 'setSelectedItems');
         controller.update({
            model,
            selectedKeys: [1],
            excludedKeys: [],
            strategyOptions: {}
         }, false, false);
         assert.isTrue(setSelectedItemsSpy.called);
      });
   });

   describe('toggleItem', () => {
      it ('toggle', () => {
         const setSelectedItemsSpy = spy(model, 'setSelectedItems');
         controller.toggleItem(1);
         assert.isTrue(setSelectedItemsSpy.called);
      });

      it('toggle breadcrumbs', () => {
         model = new SearchGridViewModel({
            items: new RecordSet({
               rawData: [{
                  id: 1,
                  parent: null,
                  nodeType: true,
                  title: 'test_node'
               }, {
                  id: 2,
                  parent: 1,
                  nodeType: null,
                  title: 'test_leaf'
               }],
               keyProperty: 'id'
            }),
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'nodeType',
            columns: [{}]
         });
         controller = new SelectionController({
            model,
            strategy,
            selectedKeys: [],
            excludedKeys: []
         });

         const setSelectedItemsSpy = spy(model, 'setSelectedItems');
         controller.toggleItem(2);
         assert.isTrue(setSelectedItemsSpy.called);
      });
   });

   it('clearSelection', () => {
      const setSelectedItemsSpy = spy(model, 'setSelectedItems');
      const result = controller.clearSelection();
      assert.isTrue(setSelectedItemsSpy.called);
      assert.deepEqual(result, {
         selectedKeysDiff: {
            added: [],
            removed: [],
            keys: []
         },
         excludedKeysDiff: {
            added: [],
            removed: [],
            keys: []
         },
         selectedCount: undefined,
         isAllSelected: false
      });
   });

   it('selectAll', () => {
      const setSelectedItemsSpy = spy(model, 'setSelectedItems');
      controller.selectAll();
      assert.isTrue(setSelectedItemsSpy.called);
   });

   it('toggleAll', () => {
      const setSelectedItemsSpy = spy(model, 'setSelectedItems');
      controller.toggleAll();
      assert.isTrue(setSelectedItemsSpy.called);
   });

   it('unselectAll', () => {
      const setSelectedItemsSpy = spy(model, 'setSelectedItems');
      controller.unselectAll();
      assert.isTrue(setSelectedItemsSpy.called);
   });

   it('handleAddItems', () => {
      const setSelectedItemsSpy = spy(model, 'setSelectedItems');
      controller.handleAddItems([]);
      assert.isTrue(setSelectedItemsSpy.called);
   });

   it('handleRemoveItems', () => {
      const setSelectedItemsSpy = spy(model, 'setSelectedItems');
      controller.handleRemoveItems([]);
      assert.isTrue(setSelectedItemsSpy.called);
   });

   it('handleReset', () => {
      controller = new SelectionController({
         model,
         strategy,
         selectedKeys: [null],
         excludedKeys: [null]
      });

      const setSelectedItemsSpy = spy(model, 'setSelectedItems');
      controller.handleReset([], null, true);
      assert.isTrue(setSelectedItemsSpy.called);
   });
});
