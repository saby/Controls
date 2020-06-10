import uDimension = require('Controls/Utils/getDimensions');
import { IMarkerModel, IOptions, TVisibility, Visibility, TKey } from './interface';

export class Controller {
   private _model: IMarkerModel;
   private _markerVisibility: TVisibility;
   private _markedKey: TKey;

   constructor(options: IOptions) {
      this._model = options.model;
      this._markerVisibility = options.markerVisibility;
      this.setMarkedKey(options.markedKey);
   }

   /**
    * Обновить состояние контроллера
    * @param options
    * @return {number|string} измененный или нет ключ маркера
    */
   update(options: IOptions): TKey {
      const markerVisibilityChanged = this._markerVisibility !== options.markerVisibility;

      this._model = options.model;
      this._markerVisibility = options.markerVisibility;
      this.setMarkedKey(options.markedKey);

      // если visibility изменили на visible и передали null, то ставим marker на первый элемент
      if (markerVisibilityChanged && this._markerVisibility === Visibility.Visible && this._markedKey === null) {
         this._markedKey = this._setMarkerOnFirstItem();
      }

      return this._markedKey;
   }

   /**
    * Снимает старый маркер и ставит новый
    * Если по переданному ключу не найден элемент, то маркер ставится на первый элемент списка
    * @param key ключ элемента, на который ставится маркер
    * @return {string|number} новый ключ маркера
    */
   setMarkedKey(key: TKey): TKey {
      if (!this._model) {
         return this._markedKey;
      }

      if (key === undefined) {
         this._markedKey = undefined;
         // Чтобы в старой модели сбросить ключ, в новой модели ничего не изменится от этого вызова
         this._model.setMarkedKey(undefined, true);
         return undefined;
      }

      const itemExistsInModel = !!this._model.getItemBySourceKey(key);
      if (this._markedKey === key && itemExistsInModel) {
         return this._markedKey;
      }

      this._model.setMarkedKey(this._markedKey, false);
      if (itemExistsInModel) {
         this._model.setMarkedKey(key, true);
         this._markedKey = key;
      } else {
         switch (this._markerVisibility) {
            case Visibility.OnActivated:
               this._model.setMarkedKey(null, true);
               this._markedKey = null;
               break;
            case Visibility.Visible:
               this._markedKey = this._setMarkerOnFirstItem();
               break;
         }
      }

      return this._markedKey;
   }

   /**
    * Переместить маркер на следующий элемент
    * @return ключ, на который поставлен маркер
    */
   moveMarkerToNext(): TKey {
      const nextItem = this._model.getNextByKey(this._markedKey);
      if (!nextItem) {
         return this._markedKey;
      }

      const nextKey = nextItem.getContents().getKey();
      this.setMarkedKey(nextKey);
      return nextKey;
   }

   /**
    * Переместить маркер на предыдущий элемент
    * @return ключ, на который поставлен маркер
    */
   moveMarkerToPrev(): TKey {
      const prevItem = this._model.getPrevByKey(this._markedKey);
      if (!prevItem) {
         return this._markedKey;
      }

      const prevKey = prevItem.getContents().getKey();
      this.setMarkedKey(prevKey);
      return prevKey;
   }

   /**
    * Обработчк удаления элементов
    * Ставит маркер на следующий элемент, при его отустствии на предыдущий, иначе сбрасывает маркер
    * @param removedItemsIndex
    */
   handleRemoveItems(removedItemsIndex: number): TKey {
      const nextItem = this._model.getNextByIndex(removedItemsIndex);
      const prevItem = this._model.getPrevByIndex(removedItemsIndex);

      if (nextItem) {
         this.setMarkedKey(nextItem.getContents().getKey());
      } else if (prevItem) {
         this.setMarkedKey(prevItem.getContents().getKey());
      } else {
         this.setMarkedKey(undefined);
      }

      return this._markedKey;
   }

   /**
    * Устанавливает маркер на первый элемент, который полностью виден на странице
    * @param items список HTMLElement-ов на странице
    * @param verticalOffset вертикальное смещение скролла
    */
   setMarkerOnFirstVisibleItem(items: HTMLElement[], verticalOffset: number): TKey {
      let firstItemIndex = this._model.getStartIndex();
      firstItemIndex += this._getFirstVisibleItemIndex(items, verticalOffset);
      firstItemIndex = Math.min(firstItemIndex, this._model.getStopIndex());

      const item = this._model.getValidItemForMarker(firstItemIndex);
      if (item) {
         const itemKey = item.getContents().getKey();
         this.setMarkedKey(itemKey);
      } else {
         this.setMarkedKey(undefined);
      }

      return this._markedKey;
   }

   private _setMarkerOnFirstItem(): TKey {
      // если модель пустая, то не на что ставить маркер
      if (!this._model.getCount()) {
         return undefined;
      }

      const firstItem = this._model.getFirstItem();
      if (!firstItem) {
         return undefined;
      }

      this._model.setMarkedKey(firstItem.getKey(), true);
      return firstItem.getKey();
   }

   private _getFirstVisibleItemIndex(items: HTMLElement[], verticalOffset: number): number {
      const itemsCount = items.length;
      let itemsHeight = 0;
      let i = 0;
      if (verticalOffset <= 0) {
         return 0;
      }
      while (itemsHeight < verticalOffset && i < itemsCount) {
         itemsHeight += uDimension(items[i]).height;
         i++;
      }
      return i;
   }
}
