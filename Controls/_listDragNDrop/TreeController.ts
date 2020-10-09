import FlatController, { IModel } from './FlatController';
import { IOffset, TPosition } from './interface';
import { SyntheticEvent } from 'Vdom/Vdom';
import { IDragPosition, TreeItem } from 'Controls/display';
import { Model } from 'Types/entity';

const DRAG_MAX_OFFSET = 10,
      EXPAND_ON_DRAG_DELAY = 1000;

export interface ITreeModel extends IModel {
   getPrevDragPosition(): IDragPosition<TreeItem<Model>>;
}

/**
 * Контроллер, управляющий состоянием отображением драг'н'дропа в плоском списке
 * @class Controls/_listDragNDrop/TreeController
 * @public
 * @author Панихин К.А.
 */
export default class TreeController extends FlatController {
   protected _model: ITreeModel;
   protected _draggableItem: TreeItem<Model>;
   private _itemOnWhichStartCountDown: TreeItem<Model>;
   private _timeoutForExpandOnDrag: NodeJS.Timeout;

   constructor(model: ITreeModel) {
      super(model);
   }

   /**
    * Проверяет получено ли событие из узла, на который наведен элемент при drag-n-drop
    * @remark
    * Мышь считается внутри узла, если смещение от верха или от низа меньше DRAG_MAX_OFFSET
    * @param event {SyntheticEvent<MouseEvent>} событие клика на узел
    * @param targetElement {EventTarget} элемент на который навели
    */
   isInsideDragTargetNode(event: SyntheticEvent<MouseEvent>, targetElement: EventTarget): boolean {
      const offset = this._calculateOffset(event, targetElement);

      if (offset) {
         if (offset.top > DRAG_MAX_OFFSET && offset.bottom > DRAG_MAX_OFFSET) {
            return true;
         }
      }

      return false;
   }

   /**
    * Рассчитывает итоговую позицию для перемещения относительно папки в иерархическом списке
    * @param targetItem - запись, на которую наведен курсор во время перемещения
    * @param position - позиция относительно записи, на которую наведен курсор во время перемещения
    */
   calculateDragPositionRelativeNode(
       targetItem: TreeItem<Model>,
       event: SyntheticEvent<MouseEvent>,
       targetElement: EventTarget
   ): IDragPosition<TreeItem<Model>> {
      if (this._draggableItem && this._draggableItem === targetItem) {
         return null;
      }

      let dragPosition;

      const offset = this._calculateOffset(event, targetElement);
      if (offset) {
         let position;
         if (offset.top <= DRAG_MAX_OFFSET) {
            position = 'before';
         } else if (offset.bottom <= DRAG_MAX_OFFSET) {
            position = 'after';
         } else {
            position = 'on';
         }
         dragPosition = this.calculateDragPosition(targetItem, position);
      }

      return dragPosition;
   }

   /**
    * Рассчитывает итоговую позицию для перемещения
    * @param targetItem - запись, на которую наведен курсор во время перемещения
    * @param position - позиция относительно записи, на которую наведен курсор во время перемещения
    */
   calculateDragPosition(targetItem: TreeItem<Model>, position: TPosition): IDragPosition<TreeItem<Model>> {
      if (targetItem === null) {
         return super.calculateDragPosition(targetItem, position) as IDragPosition<TreeItem<Model>>;
      }

      // Если перетаскиваем лист на узел, то позиция может быть только 'on'
      // Если нет перетаскиваемого элемента, то значит мы перетаскивам в папку другого реестра
      if (!this._draggableItem || !this._draggableItem.isNode() && targetItem.isNode()) {
         position = 'on';
      }

      let result;

      if (this._draggableItem && this._draggableItem === targetItem) {
         result = this._model.getPrevDragPosition() || null;
      } else if (targetItem.isNode()) {
         result = {
            index: this._getIndex(targetItem),
            position: position ? position : 'on',
            dispItem: targetItem
         };
      } else {
         result = super.calculateDragPosition(targetItem);
      }

      return result;
   }

   startCountDownForExpandNode(item: TreeItem<Model>, expandNode: Function): void {
      if (!this._itemOnWhichStartCountDown && item.isNode()
            && this._draggableItem !== item) {
         this._clearTimeoutForExpandOnDrag();
         this._itemOnWhichStartCountDown = item;
         this._setTimeoutForExpandOnDrag(item, expandNode);
      }
   }

   stopCountDownForExpandNode(): void {
      this._clearTimeoutForExpandOnDrag();
   }

   private _setTimeoutForExpandOnDrag(item: TreeItem<Model>, expandNode: Function): void {
      this._timeoutForExpandOnDrag = this._timeoutForExpand(item, expandNode);
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

   private _calculateOffset(event: SyntheticEvent<MouseEvent>, targetElement: EventTarget): IOffset {
      let result = null;

      if (targetElement) {
         const dragTargetRect = targetElement.getBoundingClientRect();

         result = { top: null, bottom: null };
         result.top = event.nativeEvent.pageY - dragTargetRect.top;
         result.bottom = dragTargetRect.top + dragTargetRect.height - event.nativeEvent.pageY;
      }

      return result;
   }
}
