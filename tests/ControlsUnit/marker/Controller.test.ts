// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { MarkerController } from 'Controls/marker';
import { ListViewModel } from 'Controls/list';
import { RecordSet } from 'Types/collection';
import { SearchGridViewModel } from 'Controls/treeGrid';

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

      it('null', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: null});

         const result = controller.calculateMarkedKeyForVisible();
         assert.strictEqual(result, 1);
      });

      it('undefined', () => {
         controller = new MarkerController({model, markerVisibility: 'onactivated', markedKey: undefined});

         const result = controller.calculateMarkedKeyForVisible();
         assert.strictEqual(result, null);
      });

      it('not exist item by key', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 4});

         const result = controller.calculateMarkedKeyForVisible();
         assert.equal(result, 1);
      });

      it('not exists item and onActivated visibility', () => {
         controller = new MarkerController({model, markerVisibility: 'onactivated', markedKey: 4});

         const result = controller.calculateMarkedKeyForVisible();
         assert.equal(result, null);
      });

      it('onactivated', () => {
         controller = new MarkerController({model, markerVisibility: 'onactivated', markedKey: 3});

         let result = controller.calculateMarkedKeyForVisible();
         assert.equal(result, 3);

         controller.setMarkedKey(result);
         assert.isTrue(model.getItemBySourceKey(3).isMarked());

         // markedKey не должен сброситсья, если список пустой
         model.setItems(new RecordSet({
            rawData: [],
            keyProperty: 'id'
         }));

         controller.updateOptions({model, markerVisibility: 'onactivated'});
         result = controller.calculateMarkedKeyForVisible();
         assert.equal(result, 3);

         model.setItems(new RecordSet({
            rawData: [
               {id: 1},
               {id: 2}
            ],
            keyProperty: 'id'
         }));

         controller.updateOptions({model, markerVisibility: 'onactivated'});
         result = controller.calculateMarkedKeyForVisible();
         assert.equal(result, null);
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

      it('markerVisibility = onactivated and not exists item with marked key', () => {
         controller = new MarkerController({model, markerVisibility: 'onactivated', markedKey: 1});
         model.setItems(new RecordSet({
            rawData: [
               {id: 2},
               {id: 3}
            ],
            keyProperty: 'id'
         }));

         const result = controller.calculateMarkedKeyForVisible();
         assert.equal(result, null);
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

      it('not exists marked item', () => {
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

      const controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});
      let result = controller.calculateMarkedKeyForVisible();
      controller.setMarkedKey(result);
      assert.equal(controller.getMarkedKey(), 2);

      result = controller.getNextMarkedKey();
      assert.equal(result, 3);

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
   });
});
