// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { RecordSet } from 'Types/collection';
import { TreeViewModel } from 'Controls/tree';
import {TreeStrategy} from 'Controls/listDragNDrop';

function equalPosition(pos1, pos2): boolean {
   assert.equal(pos1.index, pos2.index, 'Индексы разные');
   assert.equal(pos1.position, pos2.position, 'Позиции разные');
   assert.isTrue(pos1.dispItem === pos2.dispItem, 'Итемы разные');
}

describe('Controls/_listDragNDrop/strategies/TreeStrategy', () => {
   /*
      1
         2
            4
         3
      5
      6
    */
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
   let model;
   let strategy;

   beforeEach(() => {
      model = new TreeViewModel(cfg);
   });

   describe('calculatePosition', () => {
      it('hover on dragged item', () => {
         const item = model.getItemBySourceKey(5);

         strategy = new TreeStrategy(model, item);
         const newPosition = strategy.calculatePosition({targetItem: item});
         assert.isNull(newPosition);
      });

      it('before node', () => {
          strategy = new TreeStrategy(model, model.getItemBySourceKey(1));

          const targetItem = model.getItemBySourceKey(5);
          const mouseOffsetInTargetItem = {top: 5, bottom: 25};
          const currentPosition = { index: 0, position: 'on', dispItem: targetItem };
          const position = strategy.calculatePosition({targetItem, currentPosition, mouseOffsetInTargetItem });

          equalPosition(position, {
              index: 1,
              position: 'before',
              dispItem: targetItem
          });
      });

      describe('drag on node', () => {
         it('drag node before node', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(1));

            const targetNode = model.getItemBySourceKey(5);
            const mouseOffsetInTargetItem = {top: 5, bottom: 20};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 1,
               position: 'before',
               dispItem: targetNode
            });
         });

         it('drag node after node', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(1));

            const targetNode = model.getItemBySourceKey(5);
            const mouseOffsetInTargetItem = {top: 20, bottom: 5};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 1,
               position: 'after',
               dispItem: targetNode
            });
         });

         it('drag node before leaf', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(1));

            const targetNode = model.getItemBySourceKey(6);
            const mouseOffsetInTargetItem = {top: 5, bottom: 20};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 2,
               position: 'after',
               dispItem: targetNode
            });
         });

         it('drag node after leaf', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(1));

            const targetNode = model.getItemBySourceKey(6);
            const mouseOffsetInTargetItem = {top: 20, bottom: 5};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 2,
               position: 'after',
               dispItem: targetNode
            });
         });

         it('drag node on node', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(1));

            const targetNode = model.getItemBySourceKey(5);
            const mouseOffsetInTargetItem = {top: 12, bottom: 12};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 1,
               position: 'on',
               dispItem: targetNode
            });
         });

         it('drag leaf on node', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(6));

            const targetNode = model.getItemBySourceKey(1);
            const mouseOffsetInTargetItem = {top: 12, bottom: 13};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 0,
               position: 'on',
               dispItem: targetNode
            });
         });

         it('drag leaf before node', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(6));

            const targetNode = model.getItemBySourceKey(1);
            const mouseOffsetInTargetItem = {top: 5, bottom: 20};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 0,
               position: 'before',
               dispItem: targetNode
            });
         });

         it('drag leaf after node', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(6));

            const targetNode = model.getItemBySourceKey(1);
            const mouseOffsetInTargetItem = {top: 20, bottom: 5};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 0,
               position: 'after',
               dispItem: targetNode
            });
         });
      });

      describe('drag tiles', () => {
         beforeEach(() => {
            model['[Controls/_tile/TreeTileViewModel]'] = true;
         });

         it('drag node before node', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(1));

            const targetNode = model.getItemBySourceKey(5);
            const mouseOffsetInTargetItem = {top: 5, bottom: 20};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 1,
               position: 'before',
               dispItem: targetNode
            });
         });

         it('drag node after node', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(1));

            const targetNode = model.getItemBySourceKey(5);
            const mouseOffsetInTargetItem = {top: 20, bottom: 5};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 1,
               position: 'after',
               dispItem: targetNode
            });
         });

         it('drag node before leaf', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(1));

            const targetNode = model.getItemBySourceKey(6);
            const mouseOffsetInTargetItem = {top: 5, bottom: 20};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 0,
               position: 'before',
               dispItem: model.getItemBySourceKey(1)
            });
         });

         it('drag node after leaf', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(1));

            const targetNode = model.getItemBySourceKey(6);
            const mouseOffsetInTargetItem = {top: 20, bottom: 5};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 0,
               position: 'before',
               dispItem: model.getItemBySourceKey(1)
            });
         });

         it('drag node on node', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(1));

            const targetNode = model.getItemBySourceKey(5);
            const mouseOffsetInTargetItem = {top: 12, bottom: 12};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 1,
               position: 'on',
               dispItem: targetNode
            });
         });

         it('drag leaf on node', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(6));

            const targetNode = model.getItemBySourceKey(1);
            const mouseOffsetInTargetItem = {top: 12, bottom: 13};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 0,
               position: 'on',
               dispItem: targetNode
            });
         });

         it('drag leaf before node', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(6));

            const targetNode = model.getItemBySourceKey(1);
            const mouseOffsetInTargetItem = {top: 5, bottom: 20};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 0,
               position: 'on',
               dispItem: targetNode
            });
         });

         it('drag leaf after node', () => {
            strategy = new TreeStrategy(model, model.getItemBySourceKey(6));

            const targetNode = model.getItemBySourceKey(1);
            const mouseOffsetInTargetItem = {top: 20, bottom: 5};

            const newPosition = strategy.calculatePosition({targetItem: targetNode, mouseOffsetInTargetItem });
            equalPosition(newPosition, {
               index: 0,
               position: 'on',
               dispItem: targetNode
            });
         });
      });
   });
});
