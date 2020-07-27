// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { spy } from 'sinon';
import { DndTreeController} from 'Controls/listDragNDrop';
import { RecordSet } from 'Types/collection';
import { ItemsEntity } from 'Controls/dragnDrop';
import { TreeViewModel } from 'Controls/treeGrid';

describe('Controls/_listDragNDrop/TreeController', () => {
   let controller, model;

   const items = new RecordSet({
      rawData: [{
         'id': 1,
         'parent': null,
         'node': true
      }, {
         'id': 2,
         'parent': 1,
         'node': true
      }, {
         'id': 3,
         'parent': 1,
         'node': null
      }, {
         'id': 4,
         'parent': 2,
         'node': null
      }, {
         'id': 5,
         'parent': null,
         'node': null
      }, {
         'id': 6,
         'parent': null,
         'node': null
      }],
      keyProperty: 'id'
   });
   const cfg = {
      items,
      keyProperty: 'id',
      parentProperty: 'parent',
      nodeProperty: 'node',
   };

   beforeEach(() => {
      model = new TreeViewModel(cfg);
      controller = new DndTreeController(model);
      controller.startDrag(5, new ItemsEntity( { items: [5] } ));
   });

   it('isInsideDragTargetNode', () => {
      const event = {
         target: {
            getBoundingClientRect() {
               return {
                  top: 50,
                  height: 35
               }
            }
         },
         nativeEvent: {
            pageY: 70
         }
      };
      assert.isFalse(controller.isInsideDragTargetNode({}));
      assert.isTrue(controller.isInsideDragTargetNode(event));

      event.nativeEvent.pageY = 30;
      assert.isFalse(controller.isInsideDragTargetNode(event));

      event.nativeEvent.pageY = 90;
      assert.isFalse(controller.isInsideDragTargetNode(event));
   });

   describe('calculateDragPosition', () => {
      /*it('hover on dragged item', () => {
         let newPosition = controller.calculateDragPosition({ index: 1 });
         assert.isNull(newPosition);

         const position = { index: 0, position: 'on', data: { level: 1} };
         controller.setDragPosition(position);

         newPosition = controller.calculateDragPosition({ index: 1 });
         assert.isNull(newPosition);
      });*/

/*
      describe('hover on node', () => {
         it('not pass position', () => {
            const nodeItemData = model.getItemDataByItem(model.getItemBySourceKey(1));

            const newPosition = controller.calculateDragPosition(nodeItemData);
            assert.deepEqual(newPosition, {
               index: nodeItemData.index,
               position: 'before',
               item: nodeItemData.item,
               data: nodeItemData
            })
         });

         it('before expanded node', () => {
            const nodeItem = model.getItemBySourceKey(1);

            model.toggleExpanded(nodeItem, true);
            const nodeItemData = model.getItemDataByItem(nodeItem);

            assert.isTrue(nodeItemData.isExpanded);

            const newPosition = controller.calculateDragPosition(nodeItemData, 'before');
            assert.deepEqual(newPosition, {
               index: nodeItemData.index,
               position: 'before',
               item: nodeItemData.item,
               data: nodeItemData
            })
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
            const targetNodeData = model.getItemDataByItem(model.getItemBySourceKey(2));
            const newPosition = controller.calculateDragPosition(targetNodeData, 'before');

            assert.deepEqual(newPosition, {
               index: targetNodeData.index,
               position: 'before',
               item: targetNodeData.item,
               data: targetNodeData
            })
         });
      });
*/

   });

   it('calculateDragPositionRelativeNode', () => {
      const calculateDragPositionSpy = spy(controller, 'calculateDragPosition');
      const event = {
         target: {
            getBoundingClientRect() {
               return {
                  top: 50,
                  height: 35
               }
            },
            offsetHeight: 35
         },
         nativeEvent: {
            pageY: 60
         }
      };

      const targetNodeData = model.getItemDataByItem(model.getItemBySourceKey(1));
      controller.calculateDragPositionRelativeNode(targetNodeData, event);

      // undefined - так как startDrag не был вызван
      assert.isTrue(calculateDragPositionSpy.withArgs(targetNodeData, 'before').calledOnce,
         'calculateDragPosition не вызвался или вызвался с неверными параметрами');
   });

   describe('startCountDownForExpandNode', () => {
      let expandNodeCalled = false, nodeItemData;
      const expandNode = function (itemData) {
         assert.equal(itemData, nodeItemData);
         expandNodeCalled = true;
      };

      beforeEach(() => {
         expandNodeCalled = false;
         controller._timeoutForExpand = function(itemData, expandNode) {
            expandNode(itemData);
         };
      });

      it('hover on not node', () => {
         nodeItemData = model.getItemDataByItem(model.getItemBySourceKey(6));
         controller.startCountDownForExpandNode(nodeItemData, expandNode);
         assert.isFalse(expandNodeCalled);
      });

      it('hover on expanded node', () => {
         // раскрыли узел
         const nodeItem = model.getItemBySourceKey(1);
         model.toggleExpanded(nodeItem, true);
         nodeItemData = model.getItemDataByItem(nodeItem);
         assert.isTrue(nodeItemData.isExpanded);

         // навели на развернутый узел
         nodeItemData = model.getItemDataByItem(model.getItemBySourceKey(1));
         controller.startCountDownForExpandNode(nodeItemData, expandNode);
         assert.isFalse(expandNodeCalled);
      });

      it('hover on node', () => {
         nodeItemData = model.getItemDataByItem(model.getItemBySourceKey(1));
         controller.startCountDownForExpandNode(nodeItemData, expandNode);
         assert.isTrue(expandNodeCalled);

         expandNodeCalled = false;

         controller.startCountDownForExpandNode(nodeItemData, expandNode);
         assert.isFalse(expandNodeCalled, 'Hover on same node');
      });

      it('hover on dragged node', () => {
         model = new TreeViewModel(cfg);
         controller = new DndTreeController(model);

         controller.startDrag(1, new ItemsEntity( { items: [5] } ));

         controller.startCountDownForExpandNode(controller._draggingItemData, expandNode);
         assert.isFalse(expandNodeCalled);
      });
   });

   it('stopCountDownForExpandNode', () => {
      controller._timeoutForExpandOnDrag = 5;

      controller.stopCountDownForExpandNode();

      assert.isNull(controller._timeoutForExpandOnDrag);
   });
});
