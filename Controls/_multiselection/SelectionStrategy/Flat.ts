import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');

import { ISelectionObject as ISelection } from 'Controls/interface';
import { Model } from 'Types/entity';
import { IEntryPathItem, IFlatSelectionStrategyOptions, ISelectionModel } from '../interface';
import ISelectionStrategy from './ISelectionStrategy';
import clone = require('Core/core-clone');
import { CrudEntityKey } from 'Types/source';
import { CollectionItem } from 'Controls/display';

const ALL_SELECTION_VALUE = null;

/**
 * Базовая стратегия выбора в плоском списке.
 * @class Controls/_multiselection/SelectionStrategy/Flat
 *
 * @public
 * @author Панихин К.А.
 */
export class FlatSelectionStrategy implements ISelectionStrategy {
   private _model: ISelectionModel;

   constructor(options: IFlatSelectionStrategyOptions) {
      this._model = options.model;
   }

   update(options: IFlatSelectionStrategyOptions): void {
      this._model = options.model;
   }

   // tslint:disable-next-line:no-empty
   setEntryPath(entryPath: IEntryPathItem[]): void {}

   select(selection: ISelection, key: CrudEntityKey): ISelection {
      const cloneSelection = clone(selection);

      if (this._isAllSelected(cloneSelection)) {
         ArraySimpleValuesUtil.removeSubArray(cloneSelection.excluded, [key]);
      } else {
         ArraySimpleValuesUtil.addSubArray(cloneSelection.selected, [key]);
      }

      return cloneSelection;
   }

   unselect(selection: ISelection, key: CrudEntityKey): ISelection {
      const cloneSelection = clone(selection);

      if (this._isAllSelected(cloneSelection)) {
         ArraySimpleValuesUtil.addSubArray(cloneSelection.excluded, [key]);
      } else {
         ArraySimpleValuesUtil.removeSubArray(cloneSelection.selected, [key]);
      }

      return cloneSelection;
   }

   selectAll(selection: ISelection, limit?: number): ISelection {
      const newSelection = {selected: [], excluded: []};

      // если задан лимит, то важно сохранить исключенные записи,
      // чтобы при отметке +10 записей, отметка началась с последней отмеченной записи
      if (limit) {
         newSelection.excluded = clone(selection.excluded);
      }

      newSelection.selected.push(ALL_SELECTION_VALUE);
      return newSelection;
   }

   unselectAll(selection: ISelection): ISelection {
      return {selected: [], excluded: []};
   }

   toggleAll(selection: ISelection, hasMoreData: boolean): ISelection {
      let cloneSelection = clone(selection);

      if (this._isAllSelected(cloneSelection)) {
         const excludedKeys = cloneSelection.excluded.slice();
         cloneSelection = this.unselectAll(cloneSelection);
         excludedKeys.forEach((key) => cloneSelection = this.select(cloneSelection, key));
      } else {
         const selectedKeys = cloneSelection.selected.slice();
         cloneSelection = this.selectAll(cloneSelection);
         selectedKeys.forEach((key) => cloneSelection = this.unselect(cloneSelection, key));
      }

      return cloneSelection;
   }

   getSelectionForModel(
       selection: ISelection,
       limit?: number,
       items?: Array<CollectionItem<Model>>
   ): Map<boolean, Array<CollectionItem<Model>>> {
      let selectedItemsCount = 0;
      const selectedItems = new Map();
      // IE не поддерживает инициализацию конструктором
      selectedItems.set(true, []);
      selectedItems.set(false, []);
      selectedItems.set(null, []);

      const isAllSelected: boolean = this._isAllSelected(selection);

      const handleItem = (item) => {
         if (!item.SelectableItem) {
            return;
         }

         const itemId = this._getKey(item);
         const selected = (!limit || selectedItemsCount < limit)
             && (selection.selected.includes(itemId) || isAllSelected && !selection.excluded.includes(itemId));

         if (selected) {
            selectedItemsCount++;
         }

         selectedItems.get(selected).push(item);
      };

      if (items) {
         items.forEach(handleItem);
      } else {
         this._model.each(handleItem);
      }

      return selectedItems;
   }

   getCount(selection: ISelection, hasMoreData: boolean, limit?: number): number|null {
      let countItemsSelected: number|null = null;
      const itemsCount = this._model.getItems().filter((it) => it.SelectableItem).length;

      if (this._isAllSelected(selection)) {
         if (!hasMoreData && (!limit || itemsCount <= limit)) {
            countItemsSelected = itemsCount - selection.excluded.length;
         } else if (limit) {
            countItemsSelected = limit;
         }
      } else {
         countItemsSelected = selection.selected.length;
      }

      return countItemsSelected;
   }

   isAllSelected(
       selection: ISelection,
       hasMoreData: boolean,
       itemsCount: number,
       byEveryItem: boolean = true
   ): boolean {
      let isAllSelected;

      if (byEveryItem) {
         isAllSelected = this._isAllSelected(selection) && selection.excluded.length === 0
            || !hasMoreData && itemsCount > 0 && itemsCount === this.getCount(selection, hasMoreData);
      } else {
         isAllSelected = this._isAllSelected(selection);
      }

      return isAllSelected;
   }

   /**
    * Проверяет присутствует ли в selected значение "Выбрано все"
    * @param selection
    * @private
    */
   private _isAllSelected(selection: ISelection): boolean {
      return selection.selected.includes(ALL_SELECTION_VALUE);
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
      // @ts-ignore
      if (item['[Controls/_display/BreadcrumbsItem]'] || item.breadCrumbs) {
         contents = contents[(contents as any).length - 1];
      }

      // Для GroupItem нет ключа, в contents хранится не Model
      if (item['[Controls/_display/GroupItem]']) {
         return undefined;
      }

      // у корневого элемента contents=key
      return contents instanceof Object ?  contents.getKey() : contents;
   }
}
