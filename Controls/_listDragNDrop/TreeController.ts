import FlatController, { IFlatItemData, IFlatModel } from './FlatController';
import { IDragPosition, IOffset, TPosition } from './interface';
import { SyntheticEvent } from 'Vdom/Vdom';
import { TreeItem } from 'Controls/display';
import { Model } from 'Types/entity';

const DRAG_MAX_OFFSET = 0.3,
      EXPAND_ON_DRAG_DELAY = 1000;

export interface ITreeModel extends IFlatModel {
   getPrevDragPosition(): IDragPosition;

   calculateDragTargetPosition(itemData: ITreeItemData, position: TPosition): IDragPosition;
   getItemDataByItem(item: TreeItem<Model>);

   getExpandedItems(): Array<object>;
}

export interface ITreeItemData extends IFlatItemData {
   dispItem: TreeItem<Model>;
   nodeProperty: string;
   isExpanded: boolean;
}

export default class TreeController extends FlatController {
   protected _model: ITreeModel;
   protected _draggingItemData: ITreeItemData;
   private _itemOnWhichStartCountDown: ITreeItemData;
   private _timeoutForExpandOnDrag: NodeJS.Timeout;

   constructor(model: ITreeModel) {
      super(model);
   }

   /**
    * Проверяет получено ли событие из узла, на который наведен элемент при drag-n-drop
    * @remark
    * Мышь считается внутри узла, если смещение от верха или от низа меньше DRAG_MAX_OFFSET
    * Если не передать offset, то он будет посчитан
    * @rem
    * @param event {SyntheticEvent<MouseEvent>} событие клика на узел
    * @param offset {IOffset} смещение мышки относительно верха и низа узла
    */
   isInsideDragTargetNode(event: SyntheticEvent<MouseEvent>, offset?: IOffset): boolean {
      if (!offset) {
         offset = this._calculateOffset(event);
      }

      if (offset) {
         if (offset.top > DRAG_MAX_OFFSET && offset.bottom > DRAG_MAX_OFFSET) {
            return true;
         }
      }

      return false;
   }

   calculateDragPositionRelativeNode(itemData: ITreeItemData, event: SyntheticEvent<MouseEvent>): IDragPosition {
      let dragPosition;

      const offset = this._calculateOffset(event);
      const height = event.target.offsetHeight;
      if (offset) {
         if (this._draggingItemData) {
            let position;
            if (offset.top / height < DRAG_MAX_OFFSET) {
               position = 'before';
            } else if (offset.bottom / height < DRAG_MAX_OFFSET) {
               position = 'after';
            } else {
               position = 'on';
            }
            dragPosition = this.calculateDragPosition(itemData, position);
         }
      }

      return dragPosition;
   }

   calculateDragPosition(targetItemData: ITreeItemData, position: TPosition): IDragPosition {
      let result;

      if (position && this._draggingItemData.index !== targetItemData.index) {
         result = {
            index: targetItemData.index,
            position: position,
            item: targetItemData.item,
            data: targetItemData
         };
      } else {
         result = super.calculateDragPosition(targetItemData);
      }

      return result;
   }

   startCountDownForExpandNode(itemData: ITreeItemData, expandNode: Function): void {
      if (!this._itemOnWhichStartCountDown && itemData.dispItem.isNode() && !itemData.isExpanded
            && this._draggingItemData !== itemData) {
         this._clearTimeoutForExpandOnDrag();
         this._itemOnWhichStartCountDown = itemData;
         this._setTimeoutForExpandOnDrag(itemData, expandNode);
      }
   }

   stopCountDownForExpandNode(): void {
      this._clearTimeoutForExpandOnDrag();
   }

   private _setTimeoutForExpandOnDrag(itemData: ITreeItemData, expandNode: Function): void {
      this._timeoutForExpandOnDrag = this._timeoutForExpand(itemData, expandNode);
   }

   private _clearTimeoutForExpandOnDrag(): void {
      if (this._timeoutForExpandOnDrag) {
         clearTimeout(this._timeoutForExpandOnDrag);
         this._timeoutForExpandOnDrag = null;
         this._itemOnWhichStartCountDown = null;
      }
   }

   // вынес, чтобы замокать в unit тесте и не делать паузы в unit-е
   private _timeoutForExpand(itemData: ITreeItemData, expandNode: Function): NodeJS.Timeout {
      return setTimeout(() => {
         expandNode(itemData);
      }, EXPAND_ON_DRAG_DELAY);
   }

   private _calculateDragTargetPosition(itemData: ITreeItemData, position: TPosition): IDragPosition {
      let
         result,
         startPosition,
         afterExpandedNode = position === 'after' && this._model.getExpandedItems().indexOf(itemData.dispItem.getContents().getKey()) !== -1;

      //The position should not change if the record is dragged from the
      //bottom/top to up/down and brought to the bottom/top of the folder.
      const prevDragPosition = this._model.getPrevDragPosition();
      if (prevDragPosition) {
         if (prevDragPosition.index === itemData.index) {
            startPosition = prevDragPosition.position;
         } else {
            startPosition = prevDragPosition.index < itemData.index ? 'before' : 'after';
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

   private _calculateOffset(event: SyntheticEvent<MouseEvent>): IOffset {
      let result = null;

      const dragTarget = event.target;
      if (dragTarget) {
         const dragTargetRect = dragTarget.getBoundingClientRect();

         result = { top: null, bottom: null }
         result.top = event.nativeEvent.pageY - dragTargetRect.top;
         result.bottom = dragTargetRect.top + dragTargetRect.height - event.nativeEvent.pageY;
      }

      return result;
   }
}
