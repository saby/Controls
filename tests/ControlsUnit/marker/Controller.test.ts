// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { MarkerController } from 'Controls/marker';
import { ListViewModel } from 'Controls/list';
import { RecordSet } from 'Types/collection';
import { SearchGridViewModel } from 'Controls/treeGrid';
import { Tree } from 'Controls/display';
import * as ListData from 'ControlsUnit/ListData';
import { Model } from 'Types/entity';

describe('Controls/marker/Controller', () => {
   let controller, model, items;

   beforeEach(() => {
      items = new RecordSet({
         rawData: [
            {id: 1},
            {id: 2},
            {id: 3}
         ],
         keyProperty: 'id'
      });
      model = new ListViewModel({
         items
      });
      controller = new MarkerController({ model, markerVisibility: 'visible', markedKey: undefined });
   });

   describe('updateOptions', () => {
      it('change options', () => {
          controller.updateOptions({
              model, markerVisibility: 'onactivated'
          });

          assert.equal(controller._model, model);
          assert.equal(controller._markerVisibility, 'onactivated');
          model.each((item) => assert.isFalse(item.isMarked()));
      });

      it('model changed', () => {
         const newModel = new ListViewModel({
            items
         });
         controller.setMarkedKey(1);
         controller.updateOptions({
            model: newModel, markerVisibility: 'onactivated'
         });

         assert.equal(controller._model, newModel);
         assert.equal(controller._markerVisibility, 'onactivated');
         assert.isTrue(newModel.getItemBySourceKey(1).isMarked());
         assert.isFalse(newModel.getItemBySourceKey(2).isMarked());
         assert.isFalse(newModel.getItemBySourceKey(3).isMarked());

         assert.equal(newModel.getVersion(), 1);
         assert.equal(newModel.getItemBySourceKey(1).getVersion(), 1);
         assert.equal(newModel.getItemBySourceKey(2).getVersion(), 0);
         assert.equal(newModel.getItemBySourceKey(3).getVersion(), 0);
      });
   });

   describe('setMarkedKey', () => {
      it('same key', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 1});
         model.setItems(new RecordSet({
             rawData: [
                 {id: 1},
                 {id: 2},
                 {id: 3}
             ],
             keyProperty: 'id'
         }));

         assert.equal(model.getVersion(), 2);
         assert.isFalse(model.getItemBySourceKey(1).isMarked());

         controller.setMarkedKey(1);
         // Проверяем что маркер переставился на новый элемент
         assert.isTrue(model.getItemBySourceKey(1).isMarked());
         assert.isFalse(model.getItemBySourceKey(2).isMarked());
         assert.isFalse(model.getItemBySourceKey(3).isMarked());

         // Проверяем что версия изменилась один раз
         assert.equal(model.getVersion(), 3);
         assert.equal(model.getItemBySourceKey(1).getVersion(), 1);
         assert.equal(model.getItemBySourceKey(2).getVersion(), 0);
         assert.equal(model.getItemBySourceKey(3).getVersion(), 0);
      });

      it('another key', () => {
         assert.equal(model.getVersion(), 0);
         assert.isFalse(model.getItemBySourceKey(1).isMarked());

         controller.setMarkedKey(1);
         assert.isTrue(model.getItemBySourceKey(1).isMarked());
         assert.isFalse(model.getItemBySourceKey(2).isMarked());
         assert.isFalse(model.getItemBySourceKey(3).isMarked());

         // Проверяем что версия изменилась один раз
         assert.equal(model.getVersion(), 1);
         assert.equal(model.getItemBySourceKey(1).getVersion(), 1);
         assert.equal(model.getItemBySourceKey(2).getVersion(), 0);
         assert.equal(model.getItemBySourceKey(3).getVersion(), 0);

         controller.setMarkedKey(2);
         assert.isFalse(model.getItemBySourceKey(1).isMarked());
         assert.isTrue(model.getItemBySourceKey(2).isMarked());

         // Проверяем что версия изменилась один раз
         assert.equal(model.getVersion(), 3);
         assert.equal(model.getItemBySourceKey(1).getVersion(), 2);
         assert.equal(model.getItemBySourceKey(2).getVersion(), 1);
         assert.equal(model.getItemBySourceKey(3).getVersion(), 0);
      });
   });

   describe('calculateMarkedKeyForVisible', () => {
      it('same key', () => {
          controller.setMarkedKey(2);
          const result = controller.calculateMarkedKeyForVisible();
          assert.equal(result, 2);
      });

      it('same key which not exists in model', () => {
         controller.setMarkedKey(4);
         const result = controller.calculateMarkedKeyForVisible();
         assert.equal(result, 1);
      });

      it('not exist item by key', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 4});

         const result = controller.calculateMarkedKeyForVisible();
         assert.equal(result, 1);
      });

      it('markerVisibility = onactivated', () => {
         controller = new MarkerController({model, markerVisibility: 'onactivated', markedKey: 4});
         const result = controller.calculateMarkedKeyForVisible();
         assert.equal(result, 4);
      });

      it('markerVisibility = visible and not exists item with marked key', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 1});
         model.setItems(new RecordSet({
            rawData: [
               {id: 2},
               {id: 3}
            ],
            keyProperty: 'id'
         }));

         const result = controller.calculateMarkedKeyForVisible();
         assert.equal(result, 2);
      });
   });

   it('getNextMarkedKey', () => {
      controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

      const result = controller.getNextMarkedKey();
      assert.equal(result, 3);
   });

   it('getPrevMarkedKey', () => {
      controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

      const result = controller.getPrevMarkedKey();
      assert.equal(result, 1);
   });

   it('getSuitableMarkedKey', () => {
      controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});
      const item = model.at(0);
      const result = controller.getSuitableMarkedKey(item);
      assert.equal(result, 1);
   });

   describe('onCollectionRemove', () => {
      it('exists current marked item', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

         const item = model.getItemBySourceKey(1);
         model.getCollection().remove(item.getContents());

         const result = controller.onCollectionRemove(0, [item]);
         assert.equal(result, 2);
         assert.isFalse(item.isMarked());
      });

      it('exists next item', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

         const item = model.getItemBySourceKey(2);
         model.getCollection().remove(item.getContents());

         const result = controller.onCollectionRemove(1, [item]);
         assert.equal(result, 3);
         assert.isFalse(item.isMarked());
      });

      it('exists prev item, but not next', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

         const item = model.getItemBySourceKey(3);
         model.getCollection().remove(item.getContents());

         const result = controller.onCollectionRemove(2, [item]);
         assert.equal(result, 2);
         assert.isFalse(item.isMarked());
      });

      it('not exists next and prev', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

         const removedItems = [];
         for (let i = 0; i < 3; i++) {
            const item = model.getItemBySourceKey(i + 1);
            model.getCollection().remove(item.getContents());
            removedItems.push(item);
         }

         const result = controller.onCollectionRemove(0, removedItems);
         assert.equal(result, null);
         removedItems.forEach((item) => assert.isFalse(item.isMarked()));
      });

      describe('collapse node', () => {
         beforeEach(() => {
            model = new Tree({
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

            controller = new MarkerController({ model, markerVisibility: 'visible', markedKey: undefined });
         });

         it('was not set marker', () => {
            const newMarkedKey = controller.onCollectionRemove(0, [model.getItemBySourceKey(1)]);
            assert.equal(newMarkedKey, undefined);
         });

         it('collapse node with marker', () => {
            controller.setMarkedKey(2);
            const newMarkedKey = controller.onCollectionRemove(0, [model.getItemBySourceKey(2)]);
            assert.equal(newMarkedKey, 1);
         });

         it('collapse node with marker at depth of several nodes', () => {
            controller.setMarkedKey(3);
            const newMarkedKey = controller.onCollectionRemove(0, [model.getItemBySourceKey(2), model.getItemBySourceKey(3), model.getItemBySourceKey(4), model.getItemBySourceKey(5)]);
            assert.equal(newMarkedKey, 1);
         });

         it('collapse node without marker', () => {
            controller.setMarkedKey(5);
            const newMarkedKey = controller.onCollectionRemove(0, [model.getItemBySourceKey(3), model.getItemBySourceKey(4)]);
            assert.equal(newMarkedKey, 5);
         });

         it('remove item with parent = root node', () => {
            controller.setMarkedKey(6);
            const removedItem = model.getItemBySourceKey(6);
            model.getCollection().remove(removedItem.getContents());
            const newMarkedKey = controller.onCollectionRemove(0, [removedItem]);
            assert.equal(newMarkedKey, 1);
         });
      });
   });

   describe('onCollectionAdd', () => {
      it('restore marker', () => {
         controller.setMarkedKey(1);
         assert.isTrue(model.getItemBySourceKey(1).isMarked());

         model.setItems(new RecordSet({
            rawData: [
               {id: 1},
               {id: 2},
               {id: 3}
            ],
            keyProperty: 'id'
         }));
         assert.isFalse(model.getItemBySourceKey(1).isMarked());

         assert.equal(model.getVersion(), 3);
         controller.onCollectionAdd([model.getItemBySourceKey(1)]);
         assert.isTrue(model.getItemBySourceKey(1).isMarked());
         assert.isFalse(model.getItemBySourceKey(2).isMarked());
         assert.isFalse(model.getItemBySourceKey(3).isMarked());
         assert.equal(model.getVersion(), 4);
      });
   });

   describe('onCollectionReplace', () => {
      it('restore marker', () => {
         controller.setMarkedKey(1);
         assert.isTrue(model.getItemBySourceKey(1).isMarked());

         model.setItems(new RecordSet({
            rawData: [
               {id: 1},
               {id: 2},
               {id: 3}
            ],
            keyProperty: 'id'
         }));
         assert.isFalse(model.getItemBySourceKey(1).isMarked());

         assert.equal(model.getVersion(), 3);
         controller.onCollectionReplace([model.getItemBySourceKey(1)]);
         assert.isTrue(model.getItemBySourceKey(1).isMarked());
         assert.isFalse(model.getItemBySourceKey(2).isMarked());
         assert.isFalse(model.getItemBySourceKey(3).isMarked());
         assert.equal(model.getVersion(), 4);
      });
   });

   describe('onCollectionReset', () => {
      it('exists marked item', () => {
         controller.setMarkedKey(1);
         assert.isTrue(model.getItemBySourceKey(1).isMarked());

         model.setItems(new RecordSet({
            rawData: [
               {id: 1},
               {id: 2},
               {id: 3}
            ],
            keyProperty: 'id'
         }));
         assert.isFalse(model.getItemBySourceKey(1).isMarked());

         assert.equal(model.getVersion(), 3);
         const newMarkedKey = controller.onCollectionReset();
         assert.equal(newMarkedKey, 1);
         assert.isTrue(model.getItemBySourceKey(1).isMarked());
         assert.isFalse(model.getItemBySourceKey(2).isMarked());
         assert.isFalse(model.getItemBySourceKey(3).isMarked());
         assert.equal(model.getVersion(), 4);
      });

      it('not exists marked item, visible', () => {
         controller.setMarkedKey(1);
         assert.isTrue(model.getItemBySourceKey(1).isMarked());

         model.setItems(new RecordSet({
            rawData: [
               {id: 2},
               {id: 3}
            ],
            keyProperty: 'id'
         }));

         assert.equal(model.getVersion(), 3);
         const newMarkedKey = controller.onCollectionReset();
         assert.equal(newMarkedKey, 2);
         assert.isFalse(model.getItemBySourceKey(2).isMarked());
         assert.isFalse(model.getItemBySourceKey(3).isMarked());
         assert.equal(model.getVersion(), 3);
      });

      it('not exists marked item, onactivated and was set marker before reset', () => {
         const ctrl = new MarkerController({ model, markerVisibility: 'onactivated', markedKey: undefined });
         ctrl.setMarkedKey(1);
         assert.isTrue(model.getItemBySourceKey(1).isMarked());

         model.setItems(new RecordSet({
            rawData: [
               {id: 2},
               {id: 3}
            ],
            keyProperty: 'id'
         }));

         const newMarkedKey = ctrl.onCollectionReset();
         assert.equal(newMarkedKey, 2);
         assert.isFalse(model.getItemBySourceKey(2).isMarked());
         assert.isFalse(model.getItemBySourceKey(3).isMarked());
      });

      it('not exists marked item, onactivated and was not set marker before reset', () => {
         const ctrl = new MarkerController({ model, markerVisibility: 'onactivated', markedKey: null });
         model.setItems(new RecordSet({
            rawData: [
               {id: 2},
               {id: 3}
            ],
            keyProperty: 'id'
         }));

         const newMarkedKey = ctrl.onCollectionReset();
         assert.isNull(newMarkedKey);
         assert.isFalse(model.getItemBySourceKey(2).isMarked());
         assert.isFalse(model.getItemBySourceKey(3).isMarked());
      });
   });

   it('destroy', () => {
      controller.setMarkedKey(1);
      assert.isTrue(model.getItemBySourceKey(1).isMarked());

      controller.destroy();
      assert.isFalse(model.getItemBySourceKey(1).isMarked());
      assert.isFalse(model.getItemBySourceKey(2).isMarked());
      assert.isFalse(model.getItemBySourceKey(3).isMarked());
   });

   it('should work with breadcrumbs', () => {
      const items = new RecordSet({
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
         }],
         keyProperty: 'id'
      });

      const model = new SearchGridViewModel({
         items,
         keyProperty: 'id',
         parentProperty: 'parent',
         nodeProperty: 'nodeType',
         columns: [{}]
      });

      const controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 1});
      let result = controller.calculateMarkedKeyForVisible();
      controller.setMarkedKey(result);
      assert.equal(controller.getMarkedKey(), 2);

      result = controller.getNextMarkedKey();
      assert.equal(result, 4);

      result = controller.getPrevMarkedKey();
      assert.equal(result, 1);

      controller.setMarkedKey(4);
      result = controller.calculateMarkedKeyForVisible();
      assert.equal(result, 4);

      controller.setMarkedKey(3);

      const breadcrumbItem = model.getItemBySourceKey(3);
      items.remove(breadcrumbItem.getContents()[0]);

      result = controller.onCollectionRemove(2, [breadcrumbItem]);
      assert.equal(result, 2);
      assert.isFalse(breadcrumbItem.isMarked());

      controller.setMarkedKey(2);
      result = controller.onCollectionRemove(2, [model.getItemBySourceKey(2)]);
      assert.equal(result, 2);
   });
});
