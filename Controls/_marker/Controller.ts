import { IOptions, TVisibility, Visibility } from './interface';
import { Collection, CollectionItem, TreeItem } from 'Controls/display';
import { Model } from 'Types/entity';
import {CrudEntityKey} from 'Types/source';

/**
 * Контроллер управляющий маркером в списке
 * @class Controls/_marker/Controller
 * @author Панихин К.А.
 * @public
 */
export class Controller {
   private _model: Collection<Model, CollectionItem<Model>>;
   private _markerVisibility: TVisibility;
   private _markedKey: CrudEntityKey;

   constructor(options: IOptions) {
      this._model = options.model;
      this._markerVisibility = options.markerVisibility;
      this._markedKey = options.markedKey;
   }

   /**
    * Обновляет состояние контроллера
    * @param {IOptions} options Новые опции
    * @void
    */
   updateOptions(options: IOptions): void {
      if (this._model !== options.model) {
         this._model = options.model;

         // Мы должны восстановить маркер в новой модели
         this.setMarkedKey(this.getMarkedKey());
      }

      this._markerVisibility = options.markerVisibility;
   }

   /**
    * Применяет переданный ключ
    * @param {CrudEntityKey} key Новый ключ
    * @void
    */
   setMarkedKey(key: CrudEntityKey): void {
      // TODO после перехода на новую модель, удалить _model.setMarkedKey и работать с CollectionItem
      if (this._markedKey !== key) {
         this._model.setMarkedKey(this._markedKey, false);
      }
      this._model.setMarkedKey(key, true);
      this._markedKey = key;
   }

   /**
    * Высчитывает новый ключ маркера
    * @return {CrudEntityKey} Новый ключ
    */
   calculateMarkedKeyForVisible(): CrudEntityKey {
      // TODO удалить этот метод, когда избавимся от onactivated
      let newMarkedKey = this._markedKey;
      const item = this._model.getItemBySourceKey(this._markedKey);
      if (this._markerVisibility === Visibility.Visible && this._model.getCount() && (!item || !item.Markable)) {
         newMarkedKey = this._getFirstItemKey();
      }

      return newMarkedKey;
   }

   /**
    * Возвращает текущий ключ маркера
    * @return {CrudEntityKey} Текущий ключ
    */
   getMarkedKey(): CrudEntityKey {
      return this._markedKey;
   }

   /**
    * Высчитывает ключ следующего элемента
    * @return {CrudEntityKey} Ключ следующего элемента
    */
   getNextMarkedKey(): CrudEntityKey {
      const index = this._model.getIndex(this._model.getItemBySourceKey(this._markedKey));
      const nextMarkedKey = this._calculateNearbyByDirectionItemKey(index + 1, true);
      return nextMarkedKey === null ? this._markedKey : nextMarkedKey;
   }

   /**
    * Высчитывает ключ предыдущего элемента
    * @return {CrudEntityKey} Ключ предыдущего элемента
    */
   getPrevMarkedKey(): CrudEntityKey {
      const index = this._model.getIndex(this._model.getItemBySourceKey(this._markedKey));
      const prevMarkedKey = this._calculateNearbyByDirectionItemKey(index - 1, false);
      return prevMarkedKey === null ? this._markedKey : prevMarkedKey;
   }

   /**
    * Возвращает ключ следующего подходящего для установки маркера элемента
    * по текущему элементу.
    * Если текущий элемент подходит, для установки маркера то возвращает его ключ.
    * @remark
    * Метод необходим для случаев, когда мы пытаемся установить маркер на новый элемент,
    * но мы не знаем, является ли этот элемент Markable
    * @param item
    * @return {CrudEntityKey} Ключ следующего подходящего для установки маркера элемента
    */
   getSuitableMarkedKey(item: CollectionItem<Model>) {
      const contents = item.getContents();
      if (item.Markable) {
         return contents.getKey();
      }
      const index = this._model.getIndex(item);
      const nextMarkedKey = this._calculateNearbyByDirectionItemKey(index + 1, true);
      return nextMarkedKey === null ? this._markedKey : nextMarkedKey;
   }

   /**
    * Обрабатывает удаления элементов из коллекции
    * @remark Возвращает ключ следующего элемента, при его отустствии предыдущего, иначе null
    * @param {number} removedItemsIndex Индекс удаленной записи в коллекции
    * @param {Array<CollectionItem<Model>>} removedItems Удаленные элементы коллекции
    * @return {CrudEntityKey} Новый ключ маркера
    */
   onCollectionRemove(removedItemsIndex: number, removedItems: Array<CollectionItem<Model>>): CrudEntityKey {
      // Событие remove срабатывает также при скрытии элементов.
      // Когда элементы скрываются, например при сворачивании группы, у них сохраняется свое состояние.
      // После скрытия элементов маркер переставляется или сбрасывается,
      // поэтому на скрытых элементах нужно сбросить состояние marked
      removedItems.forEach((item) => item.setMarked(false, true));

      let markedKeyAfterRemove = this._getMarkedKeyAfterRemove(removedItemsIndex);

      // Если свернули узел внутри которого есть маркер, то маркер нужно поставить на узел
      // TODO нужно только для дерева, можно подумать над наследованием
      if (removedItems[0] instanceof TreeItem && this._markedKey !== undefined && this._markedKey !== null) {
         const removeMarkedItem = !!removedItems.find((it) => it.Markable && it.getContents().getKey() === this._markedKey);
         if (removeMarkedItem) {
            const parent = removedItems[0].getParent();
            // На корневой узел ставить маркер нет смысла, т.к. в этом случае должно отработать именно удаление элементов, а не скрытие
            if (parent && parent !== this._model.getRoot() && parent.Markable) {
               const parentItem = parent.getContents();
               if (parentItem ) {
                  markedKeyAfterRemove = parentItem.getKey();
               }
            }
         }
      }

      return markedKeyAfterRemove;
   }

   /**
    * Обрабатывает добавление элементов в коллекцию
    * @param {Array<CollectionItem<Model>>} items Список добавленных элементов
    * @void
    */
   onCollectionAdd(items: Array<CollectionItem<Model>>): void {
      // Если элемент был скрыт, то сработает remove и с элемента уберется выделение,
      // а при показе элемента сработает add и для элемента нужно восстановить выделение,
      // если текущий markedKey указывает на него
      if (this._containsMarkedItem(items)) {
         this.setMarkedKey(this._markedKey);
      }
   }

   /**
    * Обрабатывает замену элементов в коллекции
    * @param {Array<CollectionItem<Model>>} items Список добавленных элементов
    * @void
    */
   onCollectionReplace(items: Array<CollectionItem<Model>>): void {
      // Если Record заменили, например, через метод RecordSet.replace, то в таком случае создается новый
      // CollectionItem без состояния и для него нужно восстановить маркер
      // https://online.sbis.ru/doc/03a1208c-96ef-4641-bda8-fa7c72f6ebfb
      if (this._containsMarkedItem(items)) {
         this.setMarkedKey(this._markedKey);
      }
   }

   /**
    * Обрабатывает замену элементов в коллекции
    * @return {CrudEntityKey} Новый ключ маркера
    */
   onCollectionReset(): CrudEntityKey {
      let newMarkedKey = this._markedKey;
      // при ресете маркер пересчитаем, только когда маркер всегда виден или виден по активации и маркер был до ресета
      const needRecalculateMarker = this._markerVisibility === Visibility.Visible
          || this._markerVisibility === Visibility.OnActivated && this._markedKey !== null && this._markedKey !== undefined;
      if (needRecalculateMarker && this._model.getCount() && !this._model.getItemBySourceKey(this._markedKey)) {
         newMarkedKey = this._getFirstItemKey();
      }
      if (newMarkedKey === this._markedKey) {
         this.setMarkedKey(newMarkedKey);
      }
      return newMarkedKey;
   }

   /**
    * Зануляет все ссылки внутри контроллера
    * @void
    */
   destroy(): void {
      this._model.each((it) => it.setMarked(false, true));
      this._markedKey = null;
      this._markerVisibility = null;
      this._model = null;
   }

   /**
    * @private
    * TODO нужно выпилить этот метод при переписывании моделей. item.getContents() должен возвращать Record
    *  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
    */
   private _getKey(item: CollectionItem<Model>): CrudEntityKey {
      let contents = item.getContents();
      if (item['[Controls/_display/BreadcrumbsItem]'] || item.breadCrumbs) {
         // tslint:disable-next-line
         contents = contents[(contents as any).length - 1];
      }

      // Для GroupItem нет ключа, в contents хранится не Model
      if (item['[Controls/_display/GroupItem]'] || item['[Controls/_display/SearchSeparator]'] || item['[Controls/treeGrid:TreeGridNodeFooterRow]']) {
         return null;
      }

      return contents.getKey();
   }

   /**
    * Возвращает ключ ближайшего следующего элемента, если нет следующего, то предыдущего, а иначе null
    * @param index Индекс элемента, к которому искать ближайший элемент
    * @private
    */
   private _calculateNearbyItemKey(index: number): CrudEntityKey {
      // Считаем ключ следующего элемента
      let newMarkedKey = this._calculateNearbyByDirectionItemKey(index, true);

      // Считаем ключ предыдущего элемента, если следующего нет
      if (newMarkedKey === null) {
         newMarkedKey = this._calculateNearbyByDirectionItemKey(index, false);
      }

      return newMarkedKey;
   }

   /**
    * Возвращает ключ ближайшего элемента в направлении next
    * @param index Индекс элемента, к которому искать ближайший элемент
    * @param next Следующий или предыдущий
    * @private
    */
   private _calculateNearbyByDirectionItemKey(index: number, next: boolean): CrudEntityKey {
      const count = this._model.getCount();
      let item;

      const indexInBounds = (i) => next ? i < count : i >= 0;
      let resIndex = index;
      while (indexInBounds(resIndex)) {
         item = this._model.at(resIndex);
         if (item && item.Markable) { break; }
         resIndex += next ? 1 : -1;
      }

      return item ? this._getKey(item) : null;
   }

   /**
    * Возвращает ключ первого элемента модели
    * @private
    */
   private _getFirstItemKey(): CrudEntityKey {
      if (!this._model.getCount()) {
         return null;
      }

      const firstItem = this._model.getFirstItem();
      if (!firstItem) {
         return null;
      }

      return firstItem.getKey();
   }

   private _getMarkedKeyAfterRemove(removedIndex: number): CrudEntityKey {
      // Если элемент с текущем маркером не удален или маркер не проставлен, то маркер не нужно менять
      const item = this._model.getItemBySourceKey(this._markedKey);
      if (item || this._markedKey === null || this._markedKey === undefined) {
         return this._markedKey;
      }
      return this._calculateNearbyItemKey(removedIndex);
   }

   private _containsMarkedItem(items: Array<CollectionItem<Model>>): boolean {
      return items.some((item) => this._getKey(item) === this._markedKey);
   }
}
