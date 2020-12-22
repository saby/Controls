import { Model } from 'Types/entity';
import Drag from 'Controls/_display/itemsStrategy/Drag';
import { IDragPosition } from 'Controls/_display/interface/IDragPosition';
import TreeItem from 'Controls/_display/TreeItem';

/**
 * Стратегия для премещения элементов в дереве.
 */
export default class TreeDrag<S extends Model = Model, T extends TreeItem<S> = TreeItem<S>> extends Drag<S, T> {
   setPosition(newPosition: IDragPosition<T>): void {
      super.setPosition(newPosition);

      const newParent = this._getParentForDraggableItem(newPosition);
      this.avatarItem.setParent(newParent);
   }

   protected _createItem(protoItem: T): T {
      const item = super._createItem(protoItem);
      if (item && protoItem) {
         item.setParent(protoItem.getParent());
      }
      return item;
   }

   private _getParentForDraggableItem(newPosition: IDragPosition<T>): T {
      let parent;

      const targetItem = newPosition.dispItem;
      const relativePosition = newPosition.position;
      if (targetItem.isNode()) {
         if (relativePosition === 'before' || relativePosition === 'after' && !targetItem.isExpanded()) {
            parent = targetItem.getParent();
         } else if (relativePosition === 'after' && targetItem.isExpanded()) {
            parent = targetItem;
         } else {
            // relativePosition = 'on'
            parent = this.avatarItem.getParent();
         }
      } else {
         parent = targetItem.getParent();
      }

      return parent;
   }
}
