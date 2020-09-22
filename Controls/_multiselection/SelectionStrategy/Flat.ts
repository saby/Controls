import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');

import { RecordSet } from 'Types/collection';
import { ISelectionObject as ISelection } from 'Controls/interface';
import { Model } from 'Types/entity';
import { IFlatSelectionStrategyOptions, TKeys} from '../interface';
import ISelectionStrategy from './ISelectionStrategy';
import clone = require('Core/core-clone');
import { CrudEntityKey } from 'Types/source';

const ALL_SELECTION_VALUE = null;

/**
 * Базовая стратегия выбора в плоском списке.
 * @class Controls/_multiselection/SelectionStrategy/Flat
 * @control
 * @public
 * @author Панихин К.А.
 */
export class FlatSelectionStrategy implements ISelectionStrategy {
   private _items: RecordSet;

   constructor(options: IFlatSelectionStrategyOptions) {
      this._items = options.items;
   }

   update(options: IFlatSelectionStrategyOptions): void {
      this._items = options.items;
   }

   setItems(items: RecordSet): void {
      this._items = items;
   }

   select(selection: ISelection, keys: TKeys): ISelection {
      const cloneSelection = clone(selection);

      if (this._isAllSelected(cloneSelection)) {
         ArraySimpleValuesUtil.removeSubArray(cloneSelection.excluded, keys);
      } else {
         ArraySimpleValuesUtil.addSubArray(cloneSelection.selected, keys);
      }

      return cloneSelection;
   }

   unselect(selection: ISelection, keys: TKeys): ISelection {
      const cloneSelection = clone(selection);

      if (this._isAllSelected(cloneSelection)) {
         ArraySimpleValuesUtil.addSubArray(cloneSelection.excluded, keys);
      } else {
         ArraySimpleValuesUtil.removeSubArray(cloneSelection.selected, keys);
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

   /**
    * Remove selection from all items.
    */
   unselectAll(selection: ISelection): ISelection {
      const cloneSelection = clone(selection);

      cloneSelection.selected.length = 0;
      cloneSelection.excluded.length = 0;

      return cloneSelection;
   }

   /**
    * Invert selection.
    */
   toggleAll(selection: ISelection, hasMoreData: boolean): ISelection {
      let cloneSelection = clone(selection);

      if (this._isAllSelected(cloneSelection)) {
         const excludedKeys: TKeys = cloneSelection.excluded.slice();
         cloneSelection = this.unselectAll(cloneSelection);
         cloneSelection = this.select(cloneSelection, excludedKeys);
      } else {
         const selectedKeys: TKeys = cloneSelection.selected.slice();
         cloneSelection = this.selectAll(cloneSelection);
         cloneSelection = this.unselect(cloneSelection, selectedKeys);
      }

      return cloneSelection;
   }

   getSelectionForModel(selection: ISelection, limit?: number, items?: Model[]): Map<boolean|null, Model[]> {
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
         const itemId: CrudEntityKey = item.getKey();
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
      const itemsCount = this._items.getCount();

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
}
