// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { FlatSelectionStrategy, SelectionController, TreeSelectionStrategy, ISelectionItem } from 'Controls/multiselection';
import { ListViewModel } from 'Controls/list';
import { RecordSet } from 'Types/collection';
import { SearchGridViewModel} from 'Controls/treeGrid';
import { Collection, CollectionItem, Tree } from 'Controls/display';
import { Model } from 'Types/entity';
import * as ListData from 'ControlsUnit/ListData';

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

      strategy = new FlatSelectionStrategy({model: model.getDisplay() });

      controller = new SelectionController({
         model: model.getDisplay(),
         strategy,
         filter: {},
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
         strategyOptions: { model: model.getDisplay() }
      });

      assert.equal(controller._model, model.getDisplay());
      assert.deepEqual(controller._strategy._model, model.getDisplay());
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
            model: model.getDisplay(),
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
            model: model.getDisplay(),
            strategy,
            selectedKeys: [null],
            excludedKeys: []
         });

         const result = controller.isAllSelected(false);
         assert.isTrue(result);
      });

      it('is all selected in new selection', () => {
         const result = controller.isAllSelected(true, {selected: [null], excluded: []});
         assert.isTrue(result);
      });
   });

   it('selectAll', () => {
      let result = controller.selectAll();
      assert.deepEqual(result, { selected: [null], excluded: [] });

      controller.setSelection({ selected: [null], excluded: [3] });
      controller.updateOptions({
         model: model.getDisplay(),
         strategy,
         filter: {searchValue: 'a'},
         strategyOptions: {
            model: model.getDisplay()
         }
      });

      result = controller.selectAll();
      assert.deepEqual(result, { selected: [null], excluded: [] });
   });

   it('toggleAll', () => {
      let result = controller.toggleAll();
      assert.deepEqual(result, { selected: [null], excluded: [] });

      controller.setSelection({ selected: [3], excluded: [] });
      controller.updateOptions({
         model: model.getDisplay(),
         strategy,
         filter: {searchValue: 'a'},
         strategyOptions: {
            model: model.getDisplay()
         }
      });

      result = controller.toggleAll();
      assert.deepEqual(result, { selected: [null], excluded: [3] });

      controller.setSelection({ selected: [], excluded: [] });
      controller.setSelection({ selected: [2222], excluded: [] });
      controller.updateOptions({
         model: model.getDisplay(),
         strategy,
         filter: {searchValue: 'aф'},
         strategyOptions: {
            model: model.getDisplay()
         }
      });

      result = controller.toggleAll();
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
         model: model.getDisplay(),
         strategy,
         selectedKeys: [1, 2, 3, 4],
         excludedKeys: []
      });

      let addedItems = [model.getItemBySourceKey(1), model.getItemBySourceKey(2)];
      controller.onCollectionAdd(addedItems);

      assert.isTrue(model.getItemBySourceKey(1).isSelected());
      assert.isTrue(model.getItemBySourceKey(2).isSelected());

      // проверяем что не проставим селекшин для новых элементов, если уперлись в лимит
      controller.setLimit(3);
      model.setItems(new RecordSet({
         rawData: [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 }
         ],
         keyProperty: 'id'
      }), {});
      model.getItemBySourceKey(1).setSelected(true);
      model.getItemBySourceKey(2).setSelected(true);

      controller.onCollectionAdd([model.getItemBySourceKey(3), model.getItemBySourceKey(4)]);

      assert.isTrue(model.getItemBySourceKey(3).isSelected());
      assert.isFalse(model.getItemBySourceKey(4).isSelected());
   });

   describe('onCollectionRemove', () => {
      it('remove item', () => {
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

      it('remove all', () => {
         model.setItems(new RecordSet({
            rawData: [],
            keyProperty: 'id'
         }), {});

         const result = controller.onCollectionRemove([]);
         assert.deepEqual(result, {selected: [], excluded: []});
      });
   });

   it('onCollectionReset', () => {
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

      strategy = new TreeSelectionStrategy({
         model,
         selectDescendants: true,
         selectAncestors: true,
         rootId: null,
         entryPath: [],
         selectionType: 'all'
      });

      controller = new SelectionController({
         model,
         strategy,
         selectedKeys: [1, 8],
         excludedKeys: []
      });

      controller.onCollectionReset([{id: 8, parent: 6}]);

      assert.isTrue(model.getItemBySourceKey(1).isSelected());
      assert.isNull(model.getItemBySourceKey(6).isSelected());
   });

   it ('getCountOfSelected', () => {
      const result = controller.toggleItem(3);
      assert.equal(controller.getCountOfSelected(result), 1);
      controller.setSelection(result);
      assert.equal(controller.getCountOfSelected(), 1);
   });

   describe('readonly checkboxes', () => {
      const readonlyItems = new RecordSet({
         rawData: [
            { id: 1, checkboxState: true },
            { id: 2, checkboxState: false },
            { id: 3, checkboxState: null }
         ],
         keyProperty: 'id'
      });
      let readonlyModel, controllerWithReadonly;

      beforeEach(() => {
         readonlyModel = new Collection({
            keyProperty: 'id',
            collection: readonlyItems,
            multiSelectAccessibilityProperty: 'checkboxState'
         });

         controllerWithReadonly = new SelectionController({
            model: readonlyModel,
            strategy: new FlatSelectionStrategy({
               model: readonlyModel
            }),
            selectedKeys: [],
            excludedKeys: []
         });
      });

      it('toggleItem', () => {
         let result = controllerWithReadonly.toggleItem(1);
         assert.deepEqual(result, { selected: [1], excluded: [] });

         result = controllerWithReadonly.toggleItem(2);
         assert.deepEqual(result, { selected: [], excluded: [] });

         result = controllerWithReadonly.toggleItem(3);
         assert.deepEqual(result, { selected: [], excluded: [] });
      });

      describe('setSelection', () => {
         it('all are selected', () => {
            controllerWithReadonly.setSelection({selected: [null], excluded: []});
            assert.isTrue(readonlyModel.getItemBySourceKey(1).isSelected());
            assert.isFalse(readonlyModel.getItemBySourceKey(2).isSelected());
            assert.isFalse(readonlyModel.getItemBySourceKey(3).isSelected());
         });

         it('readonly selected', () => {
            controllerWithReadonly.setSelection({selected: [2], excluded: []});
            assert.isFalse(readonlyModel.getItemBySourceKey(1).isSelected());
            assert.isTrue(readonlyModel.getItemBySourceKey(2).isSelected());
            assert.isFalse(readonlyModel.getItemBySourceKey(3).isSelected());
         });
      });
   });

   it('with limit', () => {
      controller.setLimit(1);

      let result = controller.selectAll();
      assert.deepEqual(result, {selected: [null], excluded: []});
      controller.setSelection(result);
      assert.equal(controller.getCountOfSelected(), 1);
      assert.isTrue(model.getItemBySourceKey(1).isSelected());
      assert.isFalse(model.getItemBySourceKey(2).isSelected());
      assert.isFalse(model.getItemBySourceKey(3).isSelected());

      result = controller.toggleItem(3);
      assert.deepEqual(result, {selected: [null], excluded: [2]});
      controller.setSelection(result);
      assert.equal(controller.getCountOfSelected(), 2);
      assert.isTrue(model.getItemBySourceKey(1).isSelected());
      assert.isFalse(model.getItemBySourceKey(2).isSelected());
      assert.isTrue(model.getItemBySourceKey(3).isSelected());
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

   it('skip not selectable items', () => {
      const items = new RecordSet({
         rawData: [
            {id: 1, group: 1},
            {id: 2, group: 2},
            {id: 3, group: 1},
            {id: 4, group: 3}
         ],
         keyProperty: 'id'
      });
      const display = new Collection({
         collection: items,
         group: (item) => item.get('group')
      });

      const newController = new SelectionController({
         model: display,
         strategy: new FlatSelectionStrategy({model: display }),
         selectedKeys: [null],
         excludedKeys: []
      });

      // всего элементов учитывая группы 7, но выбрать можно только 4
      assert.equal(display.getCount(), 7);
      assert.equal(newController.getCountOfSelected(), 4);

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
             model: model.getDisplay(),
             selectDescendants: false,
             selectAncestors: false,
             rootId: null,
             selectionType: 'all'
         });

         controller = new SelectionController({
            model: model.getDisplay(),
            strategy,
            selectedKeys: [],
            excludedKeys: []
         });
      });

      it('onCollectionAdd', () => {
         model.setItems(items, {});

         controller = new SelectionController({
            model: model.getDisplay(),
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

      it('getSelectionForModel', () => {
         controller = new SelectionController({
            model: model.getDisplay(),
            strategy,
            selectedKeys: [],
            excludedKeys: [],
            searchValue: 'asdas'
         });
         controller.setSelection({ selected: [null], excluded: [null] });
         assert.isNull(model.getItemBySourceKey(1).isSelected());
         assert.isTrue(model.getItemBySourceKey(2).isSelected());
         assert.isNull(model.getItemBySourceKey(3).isSelected());
         assert.isTrue(model.getItemBySourceKey(4).isSelected());
      });
   });
});
