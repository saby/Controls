// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { FlatSelectionStrategy, SelectionController, TreeSelectionStrategy, ISelectionItem } from 'Controls/multiselection';
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

   let controller, model, strategy;

   beforeEach(() => {
      model = new ListViewModel({
         items,
         keyProperty: 'id'
      });

       strategy = new FlatSelectionStrategy({items: model.getDisplay().getItems() });

      controller = new SelectionController({
         model: model.getDisplay(),
         strategy,
         selectedKeys: [],
         excludedKeys: []
      });
   });

   it('updateOptions', () => {
      model =  new ListViewModel({
         items,
         keyProperty: 'id'
      });

      controller.updateOptions({
         model: model.getDisplay(),
         strategyOptions: { items: model.getDisplay().getItems() }
      });

      assert.equal(controller._model, model.getDisplay());
      assert.deepEqual(controller._strategy._items, model.getDisplay().getItems());
   });

   describe('toggleItem', () => {
      it ('toggle', () => {
         const result = controller.toggleItem(1);
         assert.deepEqual(result, { selected: [1], excluded: [] });
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

         const result = controller.toggleItem(2);
         assert.deepEqual(result, { selected: [2], excluded: [] });
      });
   });

   describe('isAllSelected', () => {
      it('not all selected', () => {
         const result = controller.isAllSelected();
         assert.isFalse(result);
      });

      it('all selected not by every item', () => {
         controller = new SelectionController({
            model,
            strategy,
            selectedKeys: [null],
            excludedKeys: []
         });

         const result = controller.isAllSelected(false);
         assert.isTrue(result);
      });
   });

   it('selectAll', () => {
      const result = controller.selectAll();
      assert.deepEqual(result, { selected: [null], excluded: [] });
   });

   it('toggleAll', () => {
      const result = controller.toggleAll();
      assert.deepEqual(result, { selected: [null], excluded: [] });
   });

   it('unselectAll', () => {
      controller.toggleItem(1);
      const result = controller.unselectAll();
      assert.deepEqual(result, { selected: [], excluded: [] });
   });

   it('onCollectionAdd', () => {
      model.setItems(new RecordSet({
         rawData: [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 }
         ],
         keyProperty: 'id'
      }), {});

      controller = new SelectionController({
         model,
         strategy,
         selectedKeys: [1, 2, 3, 4],
         excludedKeys: []
      });

      const addedItems = [model.getItemBySourceKey(1), model.getItemBySourceKey(2)];
      controller.onCollectionAdd(addedItems);

      assert.isTrue(model.getItemBySourceKey(1).isSelected());
      assert.isTrue(model.getItemBySourceKey(2).isSelected());
   });

   it('onCollectionRemove', () => {
      controller.toggleItem(1);

      const expectedResult = {
         selected: [], excluded: []
      };
      const removedItem = {
         getKey: () => 1
      };
      const result = controller.onCollectionRemove([removedItem]);
      assert.deepEqual(result, expectedResult);
   });

   it('with limit', () => {
      controller.setLimit(2);

      let selection = controller.selectAll();
      controller.setSelection(selection);
      assert.equal(controller.getCountOfSelected(), 2);

      selection = controller.toggleItem(3);
       controller.setSelection(selection);
      assert.equal(controller.getCountOfSelected(), 3);
   });

   it('setSelection', () => {
      controller.toggleItem(1);
      controller.setSelection({selected: [1], excluded: []});
      assert.isTrue(model.getItemBySourceKey(1).isSelected());
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

   describe('should work with breadcrumbs', () => {
      const items = new RecordSet({
         rawData: [
             {
               id: 1,
               parent: null,
               nodeType: true,
               title: 'test_node'
            }, {
               id: 2,
               parent: 1,
               nodeType: null,
               title: 'test_leaf'
            },
            {
               id: 3,
               parent: null,
               nodeType: true,
               title: 'test_node'
            }, {
               id: 4,
               parent: 3,
               nodeType: null,
               title: 'test_leaf'
            }
         ],
         keyProperty: 'id'
      });

      const nodesSourceControllers = {
         get(): object {
            return {
               hasMoreData(): boolean { return false; }
            };
         }
      };

      let model, controller, strategy;

      beforeEach(() => {
         model = new SearchGridViewModel({
            items,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'nodeType',
            columns: [{}]
         });

         strategy = new TreeSelectionStrategy({
             items: model.getDisplay().getItems(),
             selectDescendants: false,
             selectAncestors: false,
             rootId: null,
             nodesSourceControllers
         });

         controller = new SelectionController({
            model,
            strategy,
            selectedKeys: [],
            excludedKeys: []
         });
      });

      it('onCollectionAdd', () => {
         model.setItems(items, {});

         controller = new SelectionController({
            model,
            strategy,
            selectedKeys: [1, 3],
            excludedKeys: []
         });

         const addedItems = [model.getItemBySourceKey(1), model.getItemBySourceKey(3)];
         controller.onCollectionAdd(addedItems);

         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         assert.isFalse(model.getItemBySourceKey(2).isSelected());
         assert.isTrue(model.getItemBySourceKey(3).isSelected());
         assert.isFalse(model.getItemBySourceKey(4).isSelected());
      });
   });
});
