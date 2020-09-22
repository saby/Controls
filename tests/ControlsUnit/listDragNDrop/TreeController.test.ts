// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { DndTreeController} from 'Controls/listDragNDrop';
import { RecordSet } from 'Types/collection';
import { ItemsEntity } from 'Controls/dragnDrop';
import { TreeViewModel } from 'Controls/tree';

describe('Controls/_listDragNDrop/TreeController', () => {
   let controller, model;

   const items = new RecordSet({
      rawData: [{
         id: 1,
         parent: null,
         node: true
      }, {
         id: 2,
         parent: 1,
         node: true
      }, {
         id: 3,
         parent: 1,
         node: null
      }, {
         id: 4,
         parent: 2,
         node: null
      }, {
         id: 5,
         parent: null,
         node: true
      }, {
         id: 6,
         parent: null,
         node: null
      }],
      keyProperty: 'id'
   });
   const cfg = {
      items,
      keyProperty: 'id',
      parentProperty: 'parent',
      nodeProperty: 'node'
   };

   beforeEach(() => {
      model = new TreeViewModel(cfg);
      controller = new DndTreeController(model);
      controller.startDrag(5, new ItemsEntity( { items: [5] } ));
   });

   it('isInsideDragTargetNode', () => {
      const event = {
         target: {
            getBoundingClientRect(): object {
               return {
                  top: 50,
                  height: 35
               };
            }
         },
         nativeEvent: {
            pageY: 70
         }
      };
      assert.isFalse(controller.isInsideDragTargetNode({}));
      assert.isTrue(controller.isInsideDragTargetNode(event, event.target));

      event.nativeEvent.pageY = 30;
      assert.isFalse(controller.isInsideDragTargetNode(event, event.target));

      event.nativeEvent.pageY = 90;
      assert.isFalse(controller.isInsideDragTargetNode(event, event.target));
   });

   describe('calculateDragPosition', () => {
      it('hover on dragged item', () => {
         const item = model.getItemBySourceKey(5);
         let newPosition = controller.calculateDragPosition(item);
         assert.isNull(newPosition);

         const position = { index: 0, position: 'on', data: { level: 1} };
         controller.setDragPosition(position);

         newPosition = controller.calculateDragPosition(item);
         assert.equal(newPosition.index, 1);
         assert.equal(newPosition.position, 'after');
      });

      it('move to another list', () => {
         const nodeItemData = model.getItemBySourceKey(1);
         const anotherController = new DndTreeController(model);

         const position = anotherController.calculateDragPosition(nodeItemData, 'before');
         assert.deepEqual(position, {
            index: 0,
            position: 'on',
            dispItem: nodeItemData
         });
      });

      describe('hover on node', () => {
         it('not pass position', () => {
            const nodeItemData = model.getItemBySourceKey(1);

            const newPosition = controller.calculateDragPosition(nodeItemData);
            assert.deepEqual(newPosition, {
               index: 0,
               position: 'on',
               dispItem: nodeItemData
            });
         });

         it('before expanded node', () => {
            const nodeItem = model.getItemBySourceKey(1);

            model.toggleExpanded(nodeItem, true);
            const nodeItemData = model.getItemDataByItem(nodeItem);

            assert.isTrue(nodeItemData.isExpanded );

            const newPosition = controller.calculateDragPosition(nodeItem, 'before');
            assert.deepEqual(newPosition, {
               index: nodeItemData.index,
               position: 'before',
               dispItem: nodeItem
            });
         });

         it('was set prevDragPosition', () => {
            // наводим на узел
            const position = { index: 0, position: 'on', data: { level: 1} };
            controller.setDragPosition(position);
            assert.deepEqual(controller.getDragPosition(), position);

            // раскрываем узел, на который навели
            const nodeItem = model.getItemBySourceKey(1);
            model.toggleExpanded(nodeItem, true);
            const nodeItemData = model.getItemDataByItem(nodeItem);
            assert.isTrue(nodeItemData.isExpanded);

            // считаем позицию при наведении на следующий узел
            const targetNodeData = model.getItemBySourceKey(2);
            const newPosition = controller.calculateDragPosition(targetNodeData, 'before');

            assert.deepEqual(newPosition, {
               index: 1,
               position: 'before',
               dispItem: targetNodeData
            });
         });
      });
   });

   describe('calculateDragPositionRelativeNode', () => {
      it('before node', () => {
         const event = {
            target: {
               getBoundingClientRect(): object {
                  return {
                     top: 50,
                     height: 35
                  };
               }
            },
            nativeEvent: {
               pageY: 60
            }
         };

         const targetNodeData = model.getItemBySourceKey(1);
         const position = controller.calculateDragPositionRelativeNode(targetNodeData, event, event.target);

         assert.deepEqual(position, {
            index: 0,
            position: 'before',
            dispItem: targetNodeData
         });
      });
   });

   describe('startCountDownForExpandNode', () => {
      let expandNodeCalled = false, nodeDispItem;
      const expandNode = (itemData) => {
         assert.equal(itemData, nodeDispItem);
         expandNodeCalled = true;
      };

      beforeEach(() => {
         expandNodeCalled = false;
         controller._timeoutForExpand = (itemData, expandNode) => {
            expandNode(itemData);
         };
      });

      it('hover on not node', () => {
         nodeDispItem = model.getItemBySourceKey(6);
         controller.startCountDownForExpandNode(nodeDispItem, expandNode);
         assert.isFalse(expandNodeCalled);
      });

      it('hover on expanded node', () => {
         // раскрыли узел
         nodeDispItem = model.getItemBySourceKey(1);
         model.toggleExpanded(nodeDispItem, true);
         assert.isTrue(model.getItemDataByItem(nodeDispItem).isExpanded);

         // навели на развернутый узел
         controller.startCountDownForExpandNode(nodeDispItem, expandNode);
         assert.isTrue(expandNodeCalled);
      });

      it('hover on node', () => {
         nodeDispItem = model.getItemBySourceKey(1);
         controller.startCountDownForExpandNode(nodeDispItem, expandNode);
         assert.isTrue(expandNodeCalled);
         expandNodeCalled = false;

         controller.startCountDownForExpandNode(nodeDispItem, expandNode);
         assert.isFalse(expandNodeCalled, 'Hover on same node');
      });

      it('hover on dragged node', () => {
         model = new TreeViewModel(cfg);
         controller = new DndTreeController(model);

         controller.startDrag(1, new ItemsEntity( { items: [5] } ));

         controller.startCountDownForExpandNode(controller._draggableItem, expandNode);
         assert.isFalse(expandNodeCalled);
      });
   });

   it('stopCountDownForExpandNode', () => {
      controller._timeoutForExpandOnDrag = 5;

      controller.stopCountDownForExpandNode();

      assert.isNull(controller._timeoutForExpandOnDrag);
   });
});
