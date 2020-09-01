// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { FlatSelectionStrategy, SelectionController, ISelectionItem } from 'Controls/multiselection';
import { ListViewModel } from 'Controls/list';
import { RecordSet } from 'Types/collection';
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

   const strategy = new FlatSelectionStrategy({items});

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

   it('update', () => {
      model =  new ListViewModel({
         items,
         keyProperty: 'id'
      });

      controller.update({
         model,
         selectedKeys: [1],
         excludedKeys: [1],
         strategyOptions: { items: model.getItems() }
      });

      assert.equal(controller._model, model);
      assert.deepEqual(controller._selectedKeys, [1]);
      assert.deepEqual(controller._excludedKeys, [1]);
      assert.equal(controller._strategy._items, model.getItems());
   });

   describe('toggleItem', () => {
      it ('toggle', () => {
         const expectedResult = {
            isAllSelected: false,
            selectedCount: 1,
            selectedKeysDiff: {
               keys: [1],
               added: [1],
               removed: []
            }, excludedKeysDiff: {
               keys: [],
               added: [],
               removed: []
            }
         };
         const result = controller.toggleItem(1);
         assert.deepEqual(result, expectedResult);
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

         const expectedResult = {
            isAllSelected: false,
            selectedCount: 1,
            selectedKeysDiff: {
               keys: [2],
               added: [2],
               removed: []
            }, excludedKeysDiff: {
               keys: [],
               added: [],
               removed: []
            }
         };

         const result = controller.toggleItem(2);
         assert.deepEqual(result, expectedResult);
      });
   });

   describe('clearSelection', () => {
      it('not empty model', () => {
         controller.toggleItem(1);

         const result = controller.clearSelection();
         assert.deepEqual(result, {
            selectedKeysDiff: {
               added: [],
               removed: [1],
               keys: []
            },
            excludedKeysDiff: {
               added: [],
               removed: [],
               keys: []
            },
            selectedCount: 0,
            isAllSelected: false
         });
         assert.isFalse(model.getItemBySourceKey(1).isSelected());
         assert.isFalse(model.getItemBySourceKey(2).isSelected());
         assert.isFalse(model.getItemBySourceKey(3).isSelected());
      });

      it('clearSelection and empty model', () => {
         model.setItems(new RecordSet({
            rawData: [],
            keyProperty: 'id'
         }));

         const result = controller.clearSelection();
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
            selectedCount: 0,
            isAllSelected: false
         });
      });
   });

   describe('isAllSelected', () => {
      it('not all selected', () => {
         const result = controller.isAllSelected();
         assert.isFalse(result);
      });

      it('all selected not by every item', () => {
         controller.update({
            model,
            selectedKeys: [null],
            excludedKeys: [],
            strategyOptions: { items: model.getItems() }
         });

         const result = controller.isAllSelected(false);
         assert.isTrue(result);
      });
   });

   it('selectAll', () => {
      const expectedResult = {
         isAllSelected: true,
         selectedCount: 3,
         selectedKeysDiff: {
            keys: [null],
            added: [null],
            removed: []
         }, excludedKeysDiff: {
            keys: [],
            added: [],
            removed: []
         }
      };
      const result = controller.selectAll();
      assert.deepEqual(result, expectedResult);
   });

   it('toggleAll', () => {
      const expectedResult = {
         isAllSelected: true,
         selectedCount: 3,
         selectedKeysDiff: {
            keys: [null],
            added: [null],
            removed: []
         }, excludedKeysDiff: {
            keys: [],
            added: [],
            removed: []
         }
      };
      const result = controller.toggleAll();
      assert.deepEqual(result, expectedResult);
   });

   it('unselectAll', () => {
      controller.toggleItem(1);

      const expectedResult = {
         isAllSelected: false,
         selectedCount: 0,
         selectedKeysDiff: {
            keys: [],
            added: [],
            removed: [1]
         }, excludedKeysDiff: {
            keys: [],
            added: [],
            removed: []
         }
      };
      const result = controller.unselectAll();
      assert.deepEqual(result, expectedResult);
   });

   it('handleAddItems', () => {
      model.setItems(new RecordSet({
         rawData: [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 }
         ],
         keyProperty: 'id'
      }));

      controller.update({
         model,
         selectedKeys: [1, 2, 3, 4],
         excludedKeys: [],
         strategyOptions: { items: model.getItems() }
      });

      const addedItems = [model.getItemBySourceKey(1), model.getItemBySourceKey(2)];
      const result = controller.handleAddItems(addedItems);
      assert.deepEqual(result, {
         selectedKeysDiff: {
            added: [],
            removed: [],
            keys: [1, 2, 3, 4]
         },
         excludedKeysDiff: {
            added: [],
            removed: [],
            keys: []
         },
         selectedCount: 4,
         isAllSelected: true
      });

      assert.isTrue(model.getItemBySourceKey(1).isSelected());
      assert.isTrue(model.getItemBySourceKey(2).isSelected());
   });

   it('handleRemoveItems', () => {
      controller.toggleItem(1);

      const expectedResult = {
         isAllSelected: false,
         selectedCount: 0,
         selectedKeysDiff: {
            keys: [],
            added: [],
            removed: [1]
         }, excludedKeysDiff: {
            keys: [],
            added: [],
            removed: []
         }
      };
      const removedItem = {
         getKey: () => 1
      };
      const result = controller.handleRemoveItems([removedItem]);
      assert.deepEqual(result, expectedResult);
   });

   it('with limit', () => {
      controller.setLimit(2);

      let result = controller.selectAll();
      assert.equal(result.selectedCount, 2);

      result = controller.toggleItem(3);
      assert.equal(result.selectedCount, 3);
   });

   it('setSelectedKeys', () => {
      controller.toggleItem(1);
      const result = controller.setSelectedKeys([1], []);

      const expectedResult = {
         isAllSelected: false,
         selectedCount: 1,
         selectedKeysDiff: {
            keys: [1],
            added: [],
            removed: []
         }, excludedKeysDiff: {
            keys: [],
            added: [],
            removed: []
         }
      };

      assert.isTrue(model.getItemBySourceKey(1).isSelected());
      assert.deepEqual(result, expectedResult);
   });

   // При вызове startItemAnimation нужно устанавливать в коллекцию анимацию right-swiped и isSwiped
   it('should right-swipe item on startItemAnimation() method', () => {
      controller.startItemAnimation(1);
      const item1 = model.getItemBySourceKey(1);
      assert.isTrue(item1.isAnimatedForSelection());
   });

   it('method getAnimatedItem() should return right swiped item', () => {
      // @ts-ignore
      const item: CollectionItem<Record> = model.getItemBySourceKey(1);
      let swipedItem: ISelectionItem;

      controller.startItemAnimation(1);
      // @ts-ignore
      swipedItem = controller.getAnimatedItem() as CollectionItem<Record>;
      assert.equal(swipedItem, item, 'right-swiped item has not been found by getAnimatedItem() method');
      controller.stopItemAnimation();

      // @ts-ignore
      swipedItem = controller.getAnimatedItem() as CollectionItem<Record>;
      assert.equal(swipedItem, null, 'Current right-swiped item has not been un-swiped');
   });
});
