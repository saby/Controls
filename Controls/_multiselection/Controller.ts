import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');
import { ISelectionObject as ISelection } from 'Controls/interface';
import { Model } from 'Types/entity';
import { CollectionItem } from 'Controls/display';
import ISelectionStrategy from './SelectionStrategy/ISelectionStrategy';
import {
   ISelectionControllerOptions,
   IKeysDifference,
   ISelectionItem,
   ISelectionModel,
   TKeys,
   ISelectionDifference, IEntryPathItem
} from './interface';
import { CrudEntityKey } from 'Types/source';
import clone = require('Core/core-clone');
import { isEqual } from 'Types/object';

/**
 * Контроллер множественного выбора
 * @class Controls/_multiselection/Controller
 * @author Панихин К.А.
 * @public
 */
export class Controller {
   private _model: ISelectionModel;
   private _selectedKeys: TKeys = [];
   private _excludedKeys: TKeys = [];
   private _strategy: ISelectionStrategy;
   private _limit: number = 0;
   private _searchValue: string;
   private _filter: any;
   private _filterChanged: boolean;
   private _lastCheckedKey: CrudEntityKey;

   private get _selection(): ISelection {
      return {
         selected: this._selectedKeys,
         excluded: this._excludedKeys
      };
   }
   private set _selection(selection: ISelection): void {
      this._selectedKeys = selection.selected;
      this._excludedKeys = selection.excluded;
   }

   constructor(options: ISelectionControllerOptions) {
      this._model = options.model;
      this._selectedKeys = options.selectedKeys.slice();
      this._excludedKeys = options.excludedKeys.slice();
      this._strategy = options.strategy;
      this._searchValue = options.searchValue;
      this._filter = options.filter;
   }

   /**
    * Обновляет состояние контроллера
    * @param {ISelectionControllerOptions} options Новые опции
    * @void
    */
   updateOptions(options: ISelectionControllerOptions): void {
      this._strategy.update(options.strategyOptions);
      this._searchValue = options.searchValue;

      if (!isEqual(this._filter, options.filter)) {
         this._filter = options.filter;
         this._filterChanged = true;
      }

      if (this._model !== options.model) {
         this._model = options.model;
         this.setSelection(this.getSelection());
      }
   }

   /**
    * Возвращает текущий выбор элементов
    * @return {ISelection} Текущий выбор элементов
    */
   getSelection(): ISelection {
      return this._selection;
   }

   /**
    * Проставляет выбранные элементы в модели
    * @void
    */
   setSelection(selection: ISelection): void {
      // Если сбросили выбор, значит закончили "сессию" выбора и нас не интересует последнее изменение фильтра
      if (!selection.selected.length && !selection.excluded.length) {
         this._filterChanged = false;
         this._strategy.reset();
      }

      this._selection = selection;
      this._updateModel(selection);
   }

   /**
    * Возвращает массив выбранных элементов (без учета сортировки, фильтрации и группировки).
    * @return {Array.<Controls/_display/CollectionItem>}
    */
   getSelectedItems(): Array<CollectionItem<Model>> {
      const items = this._model.getItems();
      const result = [];
      for (let i = items.length - 1; i >= 0; i--) {
         if (items[i].isSelected()) {
            result.push(items[i]);
         }
      }
      return result;
   }

   /**
    * Установливает ограничение на количество единоразово выбранных записей
    * @param {number} limit Ограничение
    * @void
    * @public
    */
   setLimit(limit: number|undefined): void {
      if (!(limit === undefined)) {
         this._limit = limit;
      }
   }

   /**
    * Возвращает ограничение на количество единоразово выбранных записей
    * @param {number} limit Ограничение
    * @void
    * @public
    */
   getLimit(): number {
      return this._limit;
   }

   /**
    * Увеличивает лимит на указанное количество
    * @param {number} count Количество
    * @void
    * @public
    */
   increaseLimitByCount(count: number): number {
      return this._limit += count;
   }

   /**
    * Возвращается разнице между новым выбором newSelection и текущим
    * @param {ISelection} newSelection новый выбранные элементы
    * @return {ISelectionDifference}
    */
   getSelectionDifference(newSelection: ISelection): ISelectionDifference {
      const oldSelectedKeys = this._selection.selected;
      const oldExcludedKeys = this._selection.excluded;
      const newSelectedKeys = newSelection.selected;
      const newExcludedKeys = newSelection.excluded;
      const selectedKeysDiff = ArraySimpleValuesUtil.getArrayDifference(oldSelectedKeys, newSelectedKeys);
      const excludedKeysDiff = ArraySimpleValuesUtil.getArrayDifference(oldExcludedKeys, newExcludedKeys);

      const selectedKeysDifference: IKeysDifference = {
         keys: newSelectedKeys,
         added: selectedKeysDiff.added,
         removed: selectedKeysDiff.removed
      };

      const excludedKeysDifference: IKeysDifference = {
         keys: newExcludedKeys,
         added: excludedKeysDiff.added,
         removed: excludedKeysDiff.removed
      };

      return { selectedKeysDifference, excludedKeysDifference };
   }

   /**
    * Возвращает количество выбранных элементов
    * @param {ISelection} selection Список выбранных записей, по которому посчитаем кол-во выбранных элементов.
    * Если не передан то будет считать по состоянию контроллера
    */
   getCountOfSelected(selection?: ISelection): number|null {
      return this._strategy.getCount(selection || this._selection, this._model.getHasMoreData(), this._limit);
   }

   /**
    * Проверяет, что были выбраны все записи.
    * @param {boolean} [byEveryItem = true] true - проверять выбранность каждого элемента по отдельности.
    *  false - проверка происходит по наличию единого признака выбранности всех элементов.
    * @param {ISelection} selection Список выбранных записей, по которому посчитаем признак isAllSelected.
    * @param {CrudEntityKey} rootId Корень, в котором считать признак isAllSelected.
    * @return {ISelection}
    */
   isAllSelected(byEveryItem: boolean = true, selection?: ISelection, rootId?: CrudEntityKey): boolean {
      return this._strategy.isAllSelected(
         selection || this._selection,
         this._model.getHasMoreData(),
         this._model.getCount(),
         byEveryItem,
         rootId
      );
   }

   /**
    * Переключает состояние выбранности элемента
    * @param {CrudEntityKey} key Ключ элемента
    * @return {ISelection}
    */
   toggleItem(key: CrudEntityKey): ISelection {
      const item = this._model.getItemBySourceKey(key);
      if (!item.SelectableItem || item.isReadonlyCheckbox()) {
         return this._selection;
      }
      const status = item.isSelected();
      let newSelection;

      if (status === true || status === null) {
         newSelection = this._strategy.unselect(this._selection, key, this._searchValue);
         if (this._limit) {
            this._limit--;
         }
      } else {
         if (this._limit) {
            newSelection = this._increaseLimit(key);
         }

         if (newSelection) {
            newSelection = this._strategy.select(newSelection, key);
         } else {
            newSelection = this._strategy.select(this._selection, key);
         }
      }

      this._lastCheckedKey = key;
      return newSelection;
   }

   /**
    * Выбирает все элементы
    * @return {ISelection}
    */
   selectAll(): ISelection {
      const initSelection = this._filterChanged ? {selected: [], excluded: []} : this._selection;
      return this._strategy.selectAll(initSelection, this._limit);
   }

   /**
    * Переключает состояние выбранности у всех элементов
    * @return {ISelection}
    */
   toggleAll(): ISelection {
      const initSelection = this._filterChanged ? this._removeFilteredItemKeys(this._selection) : this._selection;
      return this._strategy.toggleAll(initSelection, this._model.getHasMoreData());
   }

   /**
    * Снимает выбор со всех элементов
    * @return {ISelection}
    */
   unselectAll(): ISelection {
      return this._strategy.unselectAll(this._selection);
   }

   /**
    * Выбирает элементы с переданного ключа до предыдущего выбранного
    * @return {ISelection}
    */
   selectRange(key: CrudEntityKey): ISelection {
      if (key === this._lastCheckedKey) {
         return this._selection;
      }

      let newSelection;

      if (!this._lastCheckedKey) {
         newSelection =  this.toggleItem(key);
      } else {
         const firstIndex = this._model.getIndexByKey(key);
         const secondIndex = this._model.getIndexByKey(this._lastCheckedKey);
         const sliceStart = secondIndex > firstIndex ? firstIndex : secondIndex;
         const sliceEnd = sliceStart === secondIndex ? firstIndex + 1 : secondIndex + 1;
         const items = this._model.getItems().slice(sliceStart, sliceEnd);

         newSelection = this._strategy.selectRange(items);
      }
      return newSelection;
   }

   /**
    * Обрабатывает удаление элементов из коллекции
    * @param {Array<CollectionItem<Model>>} removedItems Удаленные элементы
    * @return {ISelection}
    */
   onCollectionRemove(removedItems: Array<CollectionItem<Model>>): ISelection {
      if (this._model.getCollection().getCount()) {
         let keys = this._getItemsKeys(removedItems);
         // Событие remove еще срабатывает при скрытии элементов, нас интересует именно удаление
         keys = keys.filter((key) => !this._model.getCollection().getRecordById(key));

         const selected = ArraySimpleValuesUtil.removeSubArray(this._selectedKeys.slice(), keys);
         const excluded = ArraySimpleValuesUtil.removeSubArray(this._excludedKeys.slice(), keys);

         return { selected, excluded };
      } else {
         // Если удалили все записи, то и выбирать нечего
         return { selected: [], excluded: [] };
      }
   }

   /**
    * Обрабатывает сброс элементов в списке
    * @return {ISelection|void}
    */
   onCollectionReset(entryPath: IEntryPathItem[]): ISelection|void {
      if (this._model.getCount() === 0 && this.isAllSelected()) {
         return { selected: [], excluded: [] };
      }

      this._strategy.setEntryPath(entryPath);

      this._updateModel(this._selection);
   }

   /**
    * Обрабатывает добавление новых элементов в коллекцию
    * @param {Array<CollectionItem<Model>>} newItems Новые элементы
    * @void
    */
   onCollectionReplace(newItems: Array<CollectionItem<Model>>): void {
      this._updateModel(this._selection, false, newItems);
   }

   /**
    * Обрабатывает добавление новых элементов в коллекцию
    * @param {Array<CollectionItem<Model>>} addedItems Новые элементы
    * @void
    */
   onCollectionAdd(addedItems: Array<CollectionItem<Model>>): void {
      // Если задан лимит, то обрабатывать добавленные элементы нужно, если до добавления их было меньше лимита
      if (this._limit && (this._model.getCount() - addedItems.length) > this._limit) {
         return;
      }
      this._updateModel(this._selection, false, addedItems.filter((it) => it.SelectableItem));
   }

   // region rightSwipe

   /**
    * Устанавливает текущее состояние анимации записи в false
    * @void
    */
   stopItemAnimation(): void {
      this._setAnimatedItem(null);
   }

   /**
    * Получает текущий анимированный элемент.
    * @void
    */
   getAnimatedItem(): ISelectionItem {
      return this._model.find((item) => !!item.isAnimatedForSelection && item.isAnimatedForSelection());
   }

   /**
    * Активирует анимацию записи
    * @param itemKey
    * @void
    */
   startItemAnimation(itemKey: CrudEntityKey): void {
      this._setAnimatedItem(itemKey);
   }

   /**
    * Уничтожает все ссылки
    * @void
    */
   destroy(): void {
      this._model = null;
      this._strategy = null;
      this._selectedKeys = null;
      this._excludedKeys = null;
      this._limit = null;
      this._searchValue = null;
      this._filter = null;
   }

   /**
    * Устанавливает текущее состояние анимации записи по её ключу
    * @param key
    * @private
    */
   private _setAnimatedItem(key: CrudEntityKey): void {
      const oldSwipeItem = this.getAnimatedItem();
      const newSwipeItem = this._model.getItemBySourceKey(key);

      if (oldSwipeItem) {
         oldSwipeItem.setAnimatedForSelection(false);
      }
      if (newSwipeItem) {
         newSwipeItem.setAnimatedForSelection(true);
      }
   }

   // endregion

   private _removeFilteredItemKeys(selection: ISelection): ISelection {
      return {
         selected: selection.selected.filter((key) => !!this._model.getItemBySourceKey(key)),
         excluded: selection.excluded.filter((key) => !!this._model.getItemBySourceKey(key))
      };
   }

   private _getItemsKeys(items: Array<CollectionItem<Model>>): TKeys {
      return items
          .filter((it) => it.SelectableItem)
          .map((item) => this._getKey(item));
   }

   /**
    * Увеличивает лимит на количество выбранных записей, все предыдущие невыбранные записи при этом попадают в исключение
    * @private
    * @param toggledItemKey
    */
   private _increaseLimit(toggledItemKey: CrudEntityKey): ISelection {
      const newSelection = clone(this._selection);
      let selectedItemsCount = 0;
      const limit = this._limit ? this._limit : 0;

      let stopIncreasing = false;
      this._model.each((item) => {
         if (stopIncreasing) {
            return;
         }

         if (selectedItemsCount < limit && item.isSelected() !== false) {
            selectedItemsCount++;
         } else {
            const key = this._getKey(item);
            if (toggledItemKey === key) {
               selectedItemsCount++;
               this._limit++;
               stopIncreasing = true;
            } else if (!newSelection.excluded.includes(key)) {
               newSelection.excluded.push(key);
            }
         }
      });

      return newSelection;
   }

   private _updateModel(selection: ISelection, silent: boolean = false, items?: Array<CollectionItem<Model>>): void {
      let limit = this._limit;
      // Если есть лимит, то при обработке дозагруженных элементов мы должны обработать не все записи,
      // а только то кол-во, которое не хватает до лимита
      if (this._limit && items) {
         let countSelectedItems = 0;
         this._model.each((it) => it.isSelected() ? countSelectedItems++ : null);
         limit = limit - countSelectedItems;
      }

      const selectionForModel = this._strategy.getSelectionForModel(selection, limit, items, this._searchValue);

      // TODO думаю лучше будет занотифаить об изменении один раз после всех вызовов (сейчас нотифай в каждом)
      selectionForModel.forEach((selectedItems, selected) => {
         for (let i = selectedItems.length - 1; i >= 0; i--) {
            if (selectedItems[i].isSelected() !== selected) {
               selectedItems[i].setSelected(selected, silent);
            }
         }
      });
   }

   /**
    * @private
    * TODO нужно выпилить этот метод при переписывании моделей. item.getContents() должен возвращать Record
    *  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
    */
   private _getKey(item: CollectionItem<Model>): CrudEntityKey {
      if (!item) {
         return undefined;
      }

      let contents = item.getContents();
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      /*if (item['[Controls/_display/BreadcrumbsItem]'] || item.breadCrumbs) {
         // tslint:disable-next-line
         contents = contents[(contents as any).length - 1];
      }*/

      return contents instanceof Object ?  contents.getKey() : contents;
   }
}
