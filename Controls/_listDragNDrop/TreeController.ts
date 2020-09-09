import FlatController from './FlatController';
import { IDragPosition, TPosition } from './interface';

export default class TreeController extends FlatController {
   constructor(model, canStartDragNDropOption) {
      super(model, canStartDragNDropOption);
   }

   calculateDragPosition(target, position: TPosition): IDragPosition {
      let result;

      //If you hover over the dragged item, and the current position is on the folder,
      //then you need to return the position that was before the folder.
      if (this._draggingItem && this._draggingItem.index === target.index) {
         result = this._model._prevDragTargetPosition || null;
      } else if (target.dispItem.isNode()) {
         if (position === 'after' || position === 'before') {
            result = this._calculateDragTargetPosition(target, position);
         } else {
            result = {
               index: target.index,
               position: 'on',
               item: target.item,
               data: target
            };
         }
      } else {
         result = super.calculateDragPosition(target);
      }

      return result;
   }

   private _calculateDragTargetPosition(itemData, position) {
      let
         result,
         startPosition,
         afterExpandedNode = position === 'after' && this._model._expandedItems.indexOf(itemData.dispItem.getContents().getKey()) !== -1;

      //The position should not change if the record is dragged from the
      //bottom/top to up/down and brought to the bottom/top of the folder.
      if (this._model._prevDragTargetPosition) {
         if (this._model._prevDragTargetPosition.index === itemData.index) {
            startPosition = this._model._prevDragTargetPosition.position;
         } else {
            startPosition = this._model._prevDragTargetPosition.index < itemData.index ? 'before' : 'after';
         }
      }

      if (position !== startPosition && !afterExpandedNode) {
         result = {
            index: itemData.index,
            item: itemData.item,
            data: itemData,
            position: position
         };
      }

      return result;
   }
}