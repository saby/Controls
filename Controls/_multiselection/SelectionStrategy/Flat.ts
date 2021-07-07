import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');

import { ISelectionObject as ISelection } from 'Controls/interface';
import { Model } from 'Types/entity';
import { IFlatSelectionStrategyOptions } from '../interface';
import ISelectionStrategy from './ISelectionStrategy';
import clone = require('Core/core-clone');
import { CrudEntityKey } from 'Types/source';
import { CollectionItem } from 'Controls/display';

const ALL_SELECTION_VALUE = null;

/**
 * Базовая стратегия выбора в плоском списке.
 * @class Controls/_multiselection/SelectionStrategy/Flat
 * @control
 * @public
 * @author Панихин К.А.
 */
export class FlatSelectionStrategy implements ISelectionStrategy {
   private _items: Array<CollectionItem<Model>>;

   constructor(options: IFlatSelectionStrategyOptions) {
      this._items = options.items;
   }

   update(options: IFlatSelectionStrategyOptions): void {
      this._items = options.items;
   }

   setItems(items: Array<CollectionItem<Model>>): void {
      this._items = items;
   }

   select(selection: ISelection, key: CrudEntityKey): ISelection {
      if (!this._getItem(key).SelectableItem) {
         return selection;
      }

      const cloneSelection = clone(selection);

      if (this._isAllSelected(cloneSelection)) {
         ArraySimpleValuesUtil.removeSubArray(cloneSelection.excluded, [key]);
      } else {
         ArraySimpleValuesUtil.addSubArray(cloneSelection.selected, [key]);
      }

      return cloneSelection;
   }

   unselect(selection: ISelection, key: CrudEntityKey): ISelection {
      if (!this._getItem(key).SelectableItem) {
         return selection;
      }

      const cloneSelection = clone(selection);

      if (this._isAllSelected(cloneSelection)) {
         ArraySimpleValuesUtil.addSubArray(cloneSelection.excluded, [key]);
      } else {
         ArraySimpleValuesUtil.removeSubArray(cloneSelection.selected, [key]);
      }

      return cloneSelection;
   }

   selectAll(selection: ISelection): ISelection {
      const cloneSelection = clone(selection);

      cloneSelection.selected.length = 0;
      cloneSelection.excluded.length = 0;
      cloneSelection.selected[0] = ALL_SELECTION_VALUE;

      return cloneSelection;
   }

   unselectAll(selection: ISelection): ISelection {
      const cloneSelection = clone(selection);

      cloneSelection.selected.length = 0;
      cloneSelection.excluded.length = 0;

      return cloneSelection;
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

      if (limit > 0) {
         limit -= selection.excluded.length;
      }

      const isAllSelected: boolean = this._isAllSelected(selection);

      const processingItems = items ? items : this._items;
      processingItems.forEach((item) => {
         const itemId: CrudEntityKey = item.getContents().getKey();
         const selected = (!limit || selectedItemsCount < limit)
            && (selection.selected.includes(itemId) || isAllSelected && !selection.excluded.includes(itemId));

         if (selected) {
            selectedItemsCount++;
         }

         selectedItems.get(selected).push(item);
      });

      return selectedItems;
   }

   getCount(selection: ISelection, hasMoreData: boolean, limit?: number): number|null {
      let countItemsSelected: number|null = null;
      const itemsCount = this._items.length;

      if (this._isAllSelected(selection)) {
         if (!hasMoreData && (!limit || itemsCount <= limit)) {
            countItemsSelected = itemsCount - selection.excluded.length;
         } else if (limit) {
            countItemsSelected = limit - selection.excluded.length;
         }
      } else {
         countItemsSelected = selection.selected.length;
      }

      return countItemsSelected;
   }

   isAllSelected(selection: ISelection, hasMoreData: boolean, itemsCount: number, byEveryItem: boolean = true): boolean {
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

   private _getItem(key: CrudEntityKey): CollectionItem<Model> {
      return this._items.find((item) => item.getContents().getKey() === key);
   }
}
