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
      if (this._draggingItemData.key === itemData.key) {
         return null;
      }

      let dragPosition;

      const offset = this._calculateOffset(event);
      if (offset) {
         let position;
         if (offset.top <= DRAG_MAX_OFFSET) {
            position = 'before';
         } else if (offset.bottom <= DRAG_MAX_OFFSET) {
            position = 'after';
         } else {
            position = 'on';
         }
         dragPosition = this.calculateDragPosition(itemData, position);
      }

      return dragPosition;
   }

   calculateDragPosition(targetItemData: ITreeItemData, position: TPosition): IDragPosition {
      // Если перетаскиваем лист на узел, то позиция может быть только 'on'
      if (!this._draggingItemData.dispItem.isNode() && targetItemData.dispItem.isNode()) {
         position = 'on';
      }

      let result;

      if (this._draggingItemData && this._draggingItemData.index === targetItemData.index) {
         result = this._model.getPrevDragPosition() || null;
      } else if (targetItemData.dispItem.isNode()) {
         result = {
            index: targetItemData.index,
            position: position ? position : 'on',
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

   private _calculateOffset(event: SyntheticEvent<MouseEvent>): IOffset {
      let result = null;

      const dragTarget = this._getTargetRow(event);
      if (dragTarget) {
         const dragTargetRect = dragTarget.getBoundingClientRect();

         result = { top: null, bottom: null };
         result.top = event.nativeEvent.pageY - dragTargetRect.top;
         result.bottom = dragTargetRect.top + dragTargetRect.height - event.nativeEvent.pageY;
      }

      return result;
   }

   /**
    * Получаем по event.target строку списка
    * @param event
    * @private
    * @remark это нужно для того, чтобы когда event.target это содержимое строки, которое по высоте меньше 20 px,
    *  то проверка на 10px сверху и снизу сработает неправильно и нельзя будет навести на узел(position='on')
    */
   private _getTargetRow(event: SyntheticEvent<MouseEvent>): EventTarget {
      if (!event.target || !event.target.classList || !event.target.parentNode || !event.target.parentNode.classList) {
         return event.target;
      }

      const startTarget = event.target;
      let target = startTarget;

      while (!target.parentNode.classList.contains('controls-ListView__itemV')) {
         target = target.parentNode;

         // Условие выхода из цикла, когда controls-ListView__itemV не нашелся в родительских блоках
         if (!target.classList || !target.parentNode || !target.parentNode.classList
             || target.classList.contains('controls-BaseControl')) {
            target = startTarget;
            break;
         }
      }

      return target;
   }
}
