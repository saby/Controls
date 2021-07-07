import { IDragPosition, TKey, TPosition } from './interface';
import { SyntheticEvent } from 'Vdom/Vdom';
import { ItemsEntity } from 'Controls/dragnDrop';
import { CollectionItem } from 'Controls/display';
import { Model } from 'Types/entity';
import { ISelectionObject } from 'Controls/interface';

export interface IModel {
   setDraggedItems(draggedItem: TKey, draggedItems: Array<string | number>): void;
   setDragPosition(position: IDragPosition<CollectionItem<Model>>): void;
   resetDraggedItems(): void;

   getItemBySourceKey(key: TKey): CollectionItem<Model>;

   getIndexByKey(key: TKey): number;
   getIndex(item: CollectionItem<Model>): number;
}

/**
 * Контроллер, управляющий состоянием отображением драг'н'дропа в плоском списке
 * @class Controls/_listDragNDrop/FlatController
 * @public
 * @author Панихин К.А.
 */

export default class FlatController {
   protected _draggableItem: CollectionItem<Model>;
   protected _model: IModel;
   private _dragPosition: IDragPosition<CollectionItem<Model>>;
   private _entity: ItemsEntity;
   private _startIndex: number;

   constructor(model: IModel) {
      this._model = model;
   }

   /**
    * Обновляет параметры контроллера
    * @param model
    */
   update(model: IModel): void {
      this._model = model;
   }

   /**
    * Запускает отображение в списке начала драг н дропа.
    * Позволяет отобразить перетаскиеваемый элемент особым образом, отличным от остальных элементов.
    * @param draggedKey - ключ записи, за которую осуществляется перетаскивание
    * @param entity - сущность перемещения, содержит весь список перемещаемых записей
    */
   startDrag(draggedKey: TKey, entity: ItemsEntity): void {
      const draggedItem = this._model.getItemBySourceKey(draggedKey);
      this.setDraggedItems(entity, draggedItem);
   }

   /**
    * Отображает перетаскивание в списке.
    * Позволяет отобразить перетаскиеваемые элементы особым образом, отличным от остальных элементов.
    * @param entity - сущность перемещения, содержит весь список перемещаемых записей
    * @param draggedItem - запись, за которую осуществляется перетаскивание
    */
   setDraggedItems(entity: ItemsEntity, draggedItem: CollectionItem<Model> = null): void {
      this._entity = entity;

      this._draggableItem = draggedItem;
      this._startIndex = this._getIndex(draggedItem);

      const draggableItemKey = !draggedItem ? null : draggedItem.getContents().getKey();
      this._model.setDraggedItems(draggableItemKey, entity.getItems());
   }

   /**
    * Отображает перетаскиваемые сущности в указанной позиции списка
    * @param position - позиция в которой надо отобразить перемещаемые записи
    */
   setDragPosition(position: IDragPosition<CollectionItem<Model>>): void {
      if (this._dragPosition === position) {
         return;
      }

      this._dragPosition = position;
      this._model.setDragPosition(position);
   }

   /**
    * Заканчивает драг'н'дроп в списке. Все записи отображаются обычным образом
    */
   endDrag(): void {
      this._draggableItem = null;
      this._dragPosition = null;
      this._entity = null;
      this._model.resetDraggedItems();
   }

   /**
    * Возвращает true если в данный момент происходит перемещение
    */
   isDragging(): boolean {
      return !!this._entity;
   }

   /**
    * Возвращает true если в данный момент происходит перемещение
    */
   getDragPosition(): IDragPosition<CollectionItem<Model>> {
      return this._dragPosition;
   }

   /**
    * Возвращает сущность перемещаемых записей
    */
   getDragEntity(): ItemsEntity {
      return this._entity;
   }

   /**
    * Рассчитывает итоговую позицию для перемещения
    * @param targetItem - запись, на которую наведен курсор во время перемещения
    * @param position - позиция относительно записи, на которую наведен курсор во время перемещения
    */
   calculateDragPosition(targetItem: CollectionItem<Model>, position?: TPosition): IDragPosition<CollectionItem<Model>> {
      let prevIndex = -1;

      // If you hover on a record that is being dragged, then the position should not change.
      if (this._draggableItem.getContents().getKey() === targetItem.getContents().getKey()) {
         return this._dragPosition;
      }

      if (this._dragPosition) {
         prevIndex = this._dragPosition.index;
      } else if (this._draggableItem) {
         prevIndex = this._startIndex;
      }

      const targetIndex = this._getIndex(targetItem);
      if (prevIndex === -1) {
         position = 'before';
      } else if (targetIndex > prevIndex) {
         position = 'after';
      } else if (targetIndex < prevIndex) {
         position = 'before';
      } else if (targetIndex === prevIndex) {
         position = this._dragPosition.position === 'after' ? 'before' : 'after';
      }

      return {
         index: targetIndex,
         dispItem: targetItem,
         position
      };
   }

   protected _getIndex(item: CollectionItem<Model>): number {
      return this._model.getIndex(item);
   }

   static canStartDragNDrop(
       canStartDragNDropOption: boolean|Function,
       event: SyntheticEvent<MouseEvent>,
       isTouch: boolean
   ): boolean {
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
   static getSelectionForDragNDrop(model: IModel, selection: ISelectionObject, dragKey: TKey): ISelectionObject {
      const allSelected = selection.selected.indexOf(null) !== -1;

      const selected = [...selection.selected];
      if (selected.indexOf(dragKey) === -1 && !allSelected) {
         selected.push(dragKey);
      }

      // TODO по идее элементы должны быть уже упорядочены в multiselection
      //  https://online.sbis.ru/opendoc.html?guid=4a6d3f0f-6eb9-4d35-85ae-683922a57f98
      // Тогда если перетаскиваемый элемент не выбран,
      // то его нужно будет вставить на "свое" место, исходя из его индекса в списке
      this._sortKeys(model, selected);

      const excluded = [...selection.excluded];
      const dragItemIndex = excluded.indexOf(dragKey);
      if (dragItemIndex !== -1) {
         excluded.splice(dragItemIndex, 1);
      }

      return {
         selected,
         excluded,
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
   private static _sortKeys(model: IModel, keys: Array<number|string>): void {
      keys.sort((a, b) => {
         const indexA = model.getIndexByKey(a),
               indexB = model.getIndexByKey(b);
         return indexA > indexB ? 1 : -1;
      });
   }
}
