import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');

import { RecordSet } from 'Types/collection';
import { TKeySelection as TKey, TKeysSelection as TKeys, ISelectionObject as ISelection } from 'Controls/interface';
import { Record } from 'Types/entity';
import { IFlatSelectionStrategyOptions} from '../interface';
import ISelectionStrategy from './ISelectionStrategy';
import clone = require('Core/core-clone');

const ALL_SELECTION_VALUE = null;

/**
 * Базовая стратегия выбора в плоском списке.
 * @class Controls/_operations/MultiSelector/SelectionStrategy/Flat
 * @control
 * @private
 * @author Герасимов А.М.
 */
export class FlatSelectionStrategy implements ISelectionStrategy {
   private _items: RecordSet;

   constructor(options: IFlatSelectionStrategyOptions) {
      this._items = options.items;
   }

   update(options: IFlatSelectionStrategyOptions): void {
      this._items = options.items;
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
      cloneSelection.excluded[0] = ALL_SELECTION_VALUE;

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
      const cloneSelection = clone(selection);

      if (this._isAllSelected(cloneSelection)) {
         const excludedKeys: TKeys = cloneSelection.excluded.slice();
         this.unselectAll(cloneSelection);
         this.select(cloneSelection, excludedKeys);
      } else {
         const selectedKeys: TKeys = cloneSelection.selected.slice();
         this.selectAll(cloneSelection);
         this.unselect(cloneSelection, selectedKeys);
      }

      return cloneSelection;
   }

   getSelectionForModel(selection: ISelection): Map<boolean|null, Record[]> {
      const selectedItems = new Map([[true, []], [false, []], [null, []]]);
      const isAllSelected: boolean = this._isAllSelected(selection);

      this._items.forEach((item) => {
         const itemId: TKey = item.getId();
         const selected = selection.selected.includes(itemId) || isAllSelected && !selection.excluded.includes(itemId);

         selectedItems.get(selected).push(item);
      });

      return selectedItems;
   }

   getCount(selection: ISelection, hasMoreData: boolean): number|null {
      let countItemsSelected: number|null = null;
      const itemsCount: number = this._items.getCount();

      if (this._isAllSelected(selection)) {
         if (!hasMoreData) {
            countItemsSelected = itemsCount - selection.excluded.length;
         }
      } else {
         countItemsSelected = selection.selected.length;
      }

      return countItemsSelected;
   }

   // TODO что должно вернуться если выбраны все за ислючением одного(скольких-нибудь)
   private _isAllSelected(selection: ISelection): boolean {
      return selection.selected.includes(ALL_SELECTION_VALUE);
   }
}
