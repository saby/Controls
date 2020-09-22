// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { spy } from 'sinon';
import { DndFlatController } from 'Controls/listDragNDrop';
import { ListViewModel } from 'Controls/list';
import { RecordSet } from 'Types/collection';
import { ItemsEntity } from 'Controls/dragnDrop';
import { Collection } from 'Controls/display';

describe('Controls/_listDragNDrop/FlatController', () => {
   let controller, model;

   const items = new RecordSet({
      rawData: [
         { id: 1 },
         { id: 2 },
         { id: 3 }
      ],
      keyProperty: 'id'
   });
   const cfg = {
      items,
      keyProperty: 'id'
   };

   beforeEach(() => {
      model = new ListViewModel(cfg);
      controller = new DndFlatController(model);
   });

   it('startDrag', () => {
      const entity = new ItemsEntity( { items: [1] } );
      const setDraggedItemsSpy = spy(controller, 'setDraggedItems');

      controller.startDrag(1, entity);

      assert.isTrue(setDraggedItemsSpy.withArgs(entity, model.getItemBySourceKey(1)).calledOnce,
         'setDraggedItems не вызвался или вызвался с неверными параметрами');
   });

   describe('setDraggedItems', () => {
      it ('not pass draggedItem', () => {
         const modelSetDraggedItemsSpy = spy(model, 'setDraggedItems');
         controller.setDraggedItems(new ItemsEntity({items: [1]}));

         // undefined - так как startDrag не был вызван
         assert.isTrue(modelSetDraggedItemsSpy.withArgs(null, [1]).calledOnce,
            'setDraggedItems не вызвался или вызвался с неверными параметрами');
      });

      it ('pass draggedItem', () => {
         const draggedItem = model.getItemBySourceKey(1);
         const entity = new ItemsEntity( { items: [1] } );

         let modelSetDraggedItemsCalled = false;
         model.setDraggedItems = (draggedItemKey, e) => {
            assert.equal(draggedItemKey, 1);
            assert.deepEqual(e, [1]);
            modelSetDraggedItemsCalled = true;
         };

         controller.setDraggedItems(entity, draggedItem);

         assert.isTrue(modelSetDraggedItemsCalled);
         assert.equal(controller.getDragEntity(), entity);
      });

      it('new model', () => {
         const model = new Collection({
            collection: items
         });
         const controller = new DndFlatController(model);

         const draggedItem = model.getItemBySourceKey(1);
         const entity = new ItemsEntity( { items: [1] } );

         let modelSetDraggedItemsCalled = false;
         model.setDraggedItems = (draggedItemKey, draggedItemsKeys) => {
            assert.equal(draggedItemKey, 1);
            assert.deepEqual(draggedItemsKeys, [1]);
            modelSetDraggedItemsCalled = true;
         };

         controller.setDraggedItems(entity, draggedItem);

         assert.isTrue(modelSetDraggedItemsCalled);
      });
   });

   it('setDragPosition', () => {
      const dragPosition = {
         index: 0,
         position: 'before'
      };

      const modelSetDragPositionSpy = spy(model, 'setDragPosition');

      controller.setDragPosition(dragPosition);

      assert.equal(controller.getDragPosition(), dragPosition);
      assert.isTrue(modelSetDragPositionSpy.withArgs(dragPosition).calledOnce,
         'setDragPosition не вызвался или вызвался с неверным параметром');
   });

   it('endDrag', () => {
      const modelResetDraggedItemsCalled = spy(model, 'resetDraggedItems');

      controller.endDrag();

      assert.isTrue(modelResetDraggedItemsCalled.calledOnce);
      assert.isNull(controller.getDragPosition());
      assert.isNull(controller.getDragEntity());
      assert.isNull(controller._draggableItem);
   });

   describe('calculateDragPosition', () => {
      beforeEach(() => {
         const entity = new ItemsEntity( { items: [1] } );
         controller.startDrag(1, entity);
      });

      it('hover on dragged item', () => {
         const dragPosition = controller.calculateDragPosition(model.getItemBySourceKey(1));
         assert.isUndefined(dragPosition);
      });

      it ('first calculate position', () => {
         let newPosition = controller.calculateDragPosition(model.getItemBySourceKey(3));
         assert.equal(newPosition.index, 2);
         assert.equal(newPosition.position, 'after');

         newPosition = controller.calculateDragPosition(model.getItemBySourceKey(2));
         assert.equal(newPosition.index, 1);
         assert.equal(newPosition.position, 'after');
      });

      it ('position was set before it', () => {
         const setPosition = {
            index: 1,
            position: 'after'
         };
         controller.setDragPosition(setPosition);
         assert.equal(controller.getDragPosition(), setPosition);

         let newPosition = controller.calculateDragPosition(model.getItemBySourceKey(3));
         assert.equal(newPosition.index, 2);
         assert.equal(newPosition.position, 'after');

         newPosition = controller.calculateDragPosition(model.getItemBySourceKey(2));
         assert.equal(newPosition.index, 1);
         assert.equal(newPosition.position, 'before');

         newPosition = controller.calculateDragPosition(model.getItemBySourceKey(1));
         assert.deepEqual(newPosition, { index: 1, position: 'after' });
      });
   });

   it('canStartDragNDrop', () => {
      const canStartDragNDrop = () => true,
            event = {
               nativeEvent: {
                  button: undefined
               },
               target: {
                  closest(cssClass) {
                     assert.equal(cssClass, '.controls-DragNDrop__notDraggable');
                     return false;
                  }
               }
            };

      assert.isTrue(DndFlatController.canStartDragNDrop(canStartDragNDrop, event, false));
      assert.isTrue(DndFlatController.canStartDragNDrop(false, event, false));
      assert.isFalse(DndFlatController.canStartDragNDrop(canStartDragNDrop, event, true));
      assert.isFalse(DndFlatController.canStartDragNDrop(true, event, false));

      event.nativeEvent.button = {};
      assert.isFalse(DndFlatController.canStartDragNDrop(canStartDragNDrop, event, false));
   });

   describe('getSelectionForDragNDrop', () => {
      it('selected all', () => {
         let result = DndFlatController.getSelectionForDragNDrop(model, { selected: [null], excluded: [] }, 1);
         assert.deepEqual(result, {
            selected: [null],
            excluded: [],
            recursive: false
         });

         result = DndFlatController.getSelectionForDragNDrop(model, { selected: [null], excluded: [1] }, 1);
         assert.deepEqual(result, {
            selected: [null],
            excluded: [],
            recursive: false
         }, 'Потащили за исключенный ключ, он должен удалиться из excluded');

         result = DndFlatController.getSelectionForDragNDrop(model, { selected: [null], excluded: [1] }, 2);
         assert.deepEqual(result, {
            selected: [null],
            excluded: [1],
            recursive: false
         });
      });

      it('not selected all', () => {
         let result = DndFlatController.getSelectionForDragNDrop(model, { selected: [1], excluded: [] }, 1);
         assert.deepEqual(result, {
            selected: [1],
            excluded: [],
            recursive: false
         });

         result = DndFlatController.getSelectionForDragNDrop(model, { selected: [2], excluded: [] }, 1);
         assert.deepEqual(result, {
            selected: [1, 2],
            excluded: [],
            recursive: false
         }, 'dragKey добавился в selected и selected отсортирован');

         result = DndFlatController.getSelectionForDragNDrop(model, { selected: [3, 1], excluded: [] }, 2);
         assert.deepEqual(result, {
            selected: [1, 2, 3],
            excluded: [],
            recursive: false
         }, 'dragKey добавился в selected и selected отсортирован');
      });
   });
});
