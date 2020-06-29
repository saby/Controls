import FlatController, { IFlatItemData, IFlatModel } from './FlatController';
import { IDragPosition, IOffset, TPosition } from './interface';
import { SyntheticEvent } from 'Vdom/Vdom';
import { TreeItem } from 'Controls/display';
import { Model } from 'Types/entity';

const DRAG_MAX_OFFSET = 10,
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
   protected _draggingItemData: TreeItem<Model>;
   private _itemOnWhichStartCountDown: TreeItem<Model>;
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

   /**
    * itemData для старой модели работает в режиме совместимости с новой TreeItem<Model>
    * @param itemData
    * @param event
    */
   calculateDragPositionRelativeNode(itemData: TreeItem<Model>, event: SyntheticEvent<MouseEvent>): IDragPosition {
      let dragPosition;

      const offset = this._calculateOffset(event);
      if (offset) {
         if (this._draggingItemData && !this.isInsideDragTargetNode(event, offset)) {
            const position = offset.top < DRAG_MAX_OFFSET ? 'before' : 'after';
            dragPosition = this.calculateDragPosition(itemData, position);
         }
      }

      return dragPosition;
   }

   calculateDragPosition(targetItemData: TreeItem<Model>, position: TPosition): IDragPosition {
      let result;

      const draggingKey = this._draggingItemData.getContents().getKey();
      const draggingIndex =  this._model.getIndexByKey(draggingKey);

      const targetContents = targetItemData.getContents();
      const targetKey = targetContents.getKey();
      const targetIndex =  this._model.getIndexByKey(targetKey);

      if (this._draggingItemData && draggingIndex === targetIndex) {
         result = this._model.getPrevDragPosition() || null;
      } else if (targetItemData.isNode()) {
         if (position === 'after' || position === 'before') {
            result = this._calculateDragTargetPosition(targetItemData, targetIndex, position);
         } else {
            result = {
               index: targetIndex,
               position: 'on',
               item: targetContents,
               data: targetItemData
            };
         }
      } else {
         result = super.calculateDragPosition(targetItemData);
      }

      return result;
   }

   startCountDownForExpandNode(itemData: TreeItem<Model>, expandNode: Function): void {
      if (!this._itemOnWhichStartCountDown && itemData.isNode() && !this._isItemExpanded(itemData)
            && this._itemOnWhichStartCountDown !== itemData) {
         this._clearTimeoutForExpandOnDrag();
         this._itemOnWhichStartCountDown = itemData;
         this._setTimeoutForExpandOnDrag(itemData, expandNode);
      }
   }

   stopCountDownForExpandNode(): void {
      this._clearTimeoutForExpandOnDrag();
   }

   private _isItemExpanded(itemData) {
      return typeof itemData.isExpanded === "function" ? itemData.isExpanded() : itemData.isExpanded;
   }

   private _setTimeoutForExpandOnDrag(itemData: TreeItem<Model>, expandNode: Function): void {
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
   private _timeoutForExpand(itemData: TreeItem<Model>, expandNode: Function): NodeJS.Timeout {
      return setTimeout(() => {
         expandNode(itemData);
      }, EXPAND_ON_DRAG_DELAY);
   }

   private _calculateDragTargetPosition(targetItemData: TreeItem<Model>, targetIndex: number, position: TPosition): IDragPosition {
      const targetContents = targetItemData.getContents();
      const targetKey = targetContents.getKey();

      let
         result,
         startPosition,
         afterExpandedNode = position === 'after' && this._model.getExpandedItems().indexOf(targetKey) !== -1;

      //The position should not change if the record is dragged from the
      //bottom/top to up/down and brought to the bottom/top of the folder.
      const prevDragPosition = this._model.getPrevDragPosition();
      if (prevDragPosition) {
         if (prevDragPosition.index === targetIndex) {
            startPosition = prevDragPosition.position;
         } else {
            startPosition = prevDragPosition.index < targetIndex ? 'before' : 'after';
         }
      }

      if (position !== startPosition && !afterExpandedNode) {
         result = {
            index: targetIndex,
            item: targetContents,
            data: targetItemData,
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
