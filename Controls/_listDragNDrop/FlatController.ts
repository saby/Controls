import { IDragPosition, TKey, TPosition } from './interface';
import { SyntheticEvent } from 'Vdom/Vdom';
import { ItemsEntity } from 'Controls/dragnDrop';
import { CollectionItem } from 'Controls/display';
import { Model } from 'Types/entity';
import { ISelectionObject } from 'Controls/interface';

export interface IFlatModel {
   setDraggedItems(dragItemData, dragEntity: ItemsEntity): void;
   setDragPosition(position: IDragPosition): void;
   resetDraggedItems(): void;

   getItemDataByItem(item: CollectionItem<Model>): any;
   getItemBySourceKey(key: TKey): CollectionItem<Model>;

   getIndexByKey(key: TKey): number;
}

export interface IFlatItemData {
   isDragging: boolean;
   index: number;
   item: Model;
   key: TKey;
   dispItem: CollectionItem<Model>;
}

export default class FlatController {
   protected _draggingItemData: IFlatItemData;
   protected _model: IFlatModel;
   private _dragPosition: IDragPosition;
   private _entity: ItemsEntity;

   constructor(model: IFlatModel) {
      this._model = model;
   }

   update(model: IFlatModel): void {
      this._model = model;
   }

   startDrag(draggedKey: TKey, entity: ItemsEntity): void {
      const draggedItem = this._model.getItemBySourceKey(draggedKey);
      this.setDraggedItems(entity, draggedItem);
   }

   setDraggedItems(entity: ItemsEntity, draggedItem: CollectionItem<Model> = null): void {
      this._entity = entity;

      // TODO нужно доработать совместимость между старой и новой моделями.
      //  Сейчас drag-n-drop в новой модели поддерживает только перетаскивание элемента в другой список.
      //  Например, Задачи/В работе в режиме плитки перетаскивание в папку.
      if (draggedItem) {
         if (this._model.getItemDataByItem) {
            this._draggingItemData = this._model.getItemDataByItem(draggedItem);
            // это перетаскиваемый элемент, поэтому чтобы на него навесился нужный css класс isDragging = true
            this._draggingItemData.isDragging = true;
         } else {
            this._model.setDraggedItems(draggedItem, entity);
            return;
         }
      }

      this._model.setDraggedItems(this._draggingItemData, entity);
   }

   setDragPosition(position: IDragPosition): void {
      this._dragPosition = position;
      this._model.setDragPosition(position);
   }

   endDrag(): void {
      this._draggingItemData = null;
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

   getDragEntity(): ItemsEntity {
      return this._entity;
   }

   getDraggedItemData(): IFlatItemData {
      return this._draggingItemData;
   }

   calculateDragPosition(targetItemData: IFlatItemData, position?: TPosition): IDragPosition {
      let prevIndex = -1;

      // If you hover on a record that is being dragged, then the position should not change.
      if (this._draggingItemData && this._draggingItemData.index === targetItemData.index) {
         return null;
      }

      if (this._dragPosition) {
         prevIndex = this._dragPosition.index;
      } else if (this._draggingItemData) {
         prevIndex = this._draggingItemData.index;
      }

      if (prevIndex === -1) {
         position = 'before';
      } else if (targetItemData.index > prevIndex) {
         position = 'after';
      } else if (targetItemData.index < prevIndex) {
         position = 'before';
      } else if (targetItemData.index === prevIndex) {
         position = this._dragPosition.position === 'after' ? 'before' : 'after';
      }

      return {
         index: targetItemData.index,
         item: targetItemData.item,
         data: targetItemData,
         position: position
      };
   }

   static canStartDragNDrop(canStartDragNDropOption: boolean|Function, event: SyntheticEvent<MouseEvent>, isTouch: boolean): boolean {
      return (!canStartDragNDropOption || typeof canStartDragNDropOption === 'function' && canStartDragNDropOption())
         && !event.nativeEvent.button && !event.target.closest('.controls-DragNDrop__notDraggable') && !isTouch;
   }

   /**
    * Возвращает выбранные элементы, где
    * в выбранные добавлен элемент, за который начали drag-n-drop, если он отсутствовал,
    * выбранные элементы отсортированы по порядку их следования в модели(по индексам перед началом drag-n-drop),
    * из исключенных элементов удален элемент, за который начали drag-n-drop, если он присутствовал
    *
    * @param model
    * @param selection
    * @param dragKey
    */
   static getSelectionForDragNDrop(model: IFlatModel, selection: ISelectionObject, dragKey: TKey): ISelectionObject {
      const allSelected = selection.selected.indexOf(null) !== -1;

      const selected = [...selection.selected];
      if (selected.indexOf(dragKey) === -1 && !allSelected) {
         selected.push(dragKey);
      }

      // TODO по идее элементы должны быть уже упорядочены в multiselection https://online.sbis.ru/opendoc.html?guid=4a6d3f0f-6eb9-4d35-85ae-683922a57f98
      // Тогда если перетаскиваемый элемент не выбран, то его нужно будет вставить на "свое" место, исходя из его индекса в списке
      this._sortKeys(model, selected);

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
    * @param model
    * @param keys
    * @private
    */
   private static _sortKeys(model: IFlatModel, keys: Array<number|string>): void {
      keys.sort((a, b) => {
         const indexA = model.getIndexByKey(a),
            indexB = model.getIndexByKey(b);
         return indexA > indexB ? 1 : -1;
      });
   }
}
