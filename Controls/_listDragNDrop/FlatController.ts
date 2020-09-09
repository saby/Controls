import { IDragPosition, ISelection, TKey, TPosition } from './interface';
import { SyntheticEvent } from 'Vdom/Vdom';

export default class FlatController {
   protected _draggingItem;
   private _dragPosition;
   private _entity;

   constructor(protected _model, private _canStartDragNDropOption) {}

   update(model, canStartDragNDropOption: boolean|Function) {
      this._model = model;
      this._canStartDragNDropOption = canStartDragNDropOption;
   }

   set draggingItem(val) { this._draggingItem = val; }
   get dragEntity() { return this._entity; }

   startDrag(entity): void {
      this.setDraggedItems(entity, this._draggingItem.dispItem)
   }

   setDraggedItems(entity, draggedItem = null): void {
      this._entity = entity;

      // TODO dnd наверное нужно изменить draggingItem. Но учесть что из startDrag он и может придти
      draggedItem = draggedItem
         ? this._model.getItemDataByItem(draggedItem)
         : this._model.getItemDataByItem(this._draggingItem.dispItem);

      this._model.setDraggedItems(draggedItem, entity);
      // TODO dnd если что тут порядок другой и это по идее должно влиять. Меняется модель до того как проставилось 2-ое
      /*this._model.setDragEntity(dragObject.entity);
      this._model.setDragItemData(this._listViewModel.getItemDataByItem(this._draggingItem.dispItem));*/
   }

   setDragPosition(position: IDragPosition): void {
      this._dragPosition = position;
      this._model.setDragPosition(position);
   }

   endDrag(): void {
      this._draggingItem = null;
      this._dragPosition = null;
      this._entity = null;
      this._model.resetDraggedItems();
   }

   isDragging(): boolean {
      return !!this._entity;
   }

   getDragPosition(): IDragPosition {
      return this._dragPosition;
   }

   canStartDragNDrop(event: SyntheticEvent<MouseEvent>, isTouch: boolean): boolean {
      return (!this._canStartDragNDropOption || typeof this._canStartDragNDropOption === 'function' && this._canStartDragNDropOption())
         && !event.nativeEvent.button && !event.target.closest('.controls-DragNDrop__notDraggable') && !isTouch;
   }

   calculateDragPosition(target, position?: TPosition): IDragPosition {
      let prevIndex = -1;

      //If you hover on a record that is being dragged, then the position should not change.
      if (this._draggingItem && this._draggingItem.index === target.index) {
         return null;
      }

      if (this._dragPosition) {
         prevIndex = this._dragPosition.index;
      } else if (this._draggingItem) {
         prevIndex = this._draggingItem.index;
      }

      if (prevIndex === -1) {
         position = 'before';
      } else if (target.index > prevIndex) {
         position = 'after';
      } else if (target.index < prevIndex) {
         position = 'before';
      } else if (target.index === prevIndex) {
         position = this._dragPosition.position === 'after' ? 'before' : 'after';
      }

      return {
         index: target.index,
         item: target.item,
         data: target,
         position: position
      };
   }

   /**
    * Возвращает выбранные элементы, где
    * в выбранные добавлен элемент, за который начали drag-n-drop, если он отсутствовал,
    * выбранные элементы отсортированы по порядку их следования в модели(по индексам перед началом drag-n-drop),
    * из исключенных элементов удален элемент, за который начали drag-n-drop, если он присутствовал
    *
    * @param selection
    * @param dragKey
    */
   getSelectionForDragNDrop(selection: ISelection, dragKey: TKey): ISelection {
      const allSelected = selection.selected.indexOf(null) !== -1;

      const selected = [...selection.selected];
      if (selected.indexOf(dragKey) === -1 && !allSelected) {
         selected.push(dragKey);
      }
      this._sortKeys(selected);

      const excluded = [...selection.excluded];
      const dragItemIndex = excluded.indexOf(dragKey);
      if (dragItemIndex !== -1) {
         excluded.splice(dragItemIndex, 1);
      }

      return {
         selected: selected,
         excluded: excluded,
         recursive: false
      };
   }

   /**
    * Сортировать список ключей элементов
    * Ключи сортируются по порядку, в котором они идут в списке
    * @param keys
    * @private
    */
   private _sortKeys(keys: Array<number|string>): void {
      keys.sort((a, b) => {
         const indexA = this._model.getIndexByKey(a),
            indexB = this._model.getIndexByKey(b);
         return indexA > indexB ? 1 : -1
      });
   }
}