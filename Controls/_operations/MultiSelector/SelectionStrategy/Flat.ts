import ISelectionStrategy from 'Controls/_operations/MultiSelector/SelectionStrategy/ISelectionStrategy';
import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');
import { getItems } from 'Controls/_operations/MultiSelector/ModelCompability';
import clone = require('Core/core-clone');

import { Collection } from 'Controls/display';
import { ListViewModel } from 'Controls/list';
import { RecordSet, List } from 'Types/collection';
import { TKeySelection as TKey, TKeysSelection as TKeys, ISelectionObject as ISelection } from 'Controls/interface/';

const ALL_SELECTION_VALUE = null;

/**
 * Базовая стратегия выбора в плоском списке.
 * @class Controls/_operations/MultiSelector/SelectionStrategy/Flat
 * @control
 * @private
 * @author Капустин И.А.
 */
export default class FlatSelectionStrategy implements ISelectionStrategy {
   select(selection: ISelection, keys: TKeys): ISelection {
      selection = clone(selection);

      if (this.isAllSelected(selection)) {
         ArraySimpleValuesUtil.removeSubArray(selection.excluded, keys);
      } else {
         ArraySimpleValuesUtil.addSubArray(selection.selected, keys);
      }

      return selection;
   }

   unSelect(selection: ISelection, keys: TKeys): ISelection {
      selection = clone(selection);

      if (this.isAllSelected(selection)) {
         ArraySimpleValuesUtil.addSubArray(selection.excluded, keys);
      } else {
         ArraySimpleValuesUtil.removeSubArray(selection.selected, keys);
      }

      return selection;
   }

   getSelectionForModel(selection: ISelection, model: Collection|ListViewModel, limit: number, keyProperty: string): Map<TKey, boolean> {
      let
         selectionResult: Map<TKey, boolean> = new Map(),
         selectedItemsCount: number = 0,
         isAllSelected: boolean = this.isAllSelected(selection);

      if (limit > 0) {
         limit -= selection.excluded.length;
      }

      getItems(model).forEach((item) => {
         let itemId: TKey = item.get(keyProperty);
         let isSelected: boolean = (!limit || selectedItemsCount < limit) &&
            (selection.selected.includes(itemId) || isAllSelected && !selection.excluded.includes(itemId));

         if (isSelected) {
            selectedItemsCount++;
         }
         if (isSelected !== false) {
            selectionResult.set(itemId, isSelected);
         }
      });

      return selectionResult;
   }

   isAllSelected(selection: ISelection): boolean {
      return selection.selected.includes(ALL_SELECTION_VALUE);
   }

   getCount(selection: ISelection, model: Collection|ListViewModel, limit: number): number|null {
      let countItemsSelected: number|null = null;
      let items: RecordSet|List = getItems(model);
      let itemsCount: number = items.getCount();

      if (this.isAllSelected(selection)) {
         if (this._isAllItemsLoaded(items, limit) && (!limit || itemsCount <= limit)) {
            countItemsSelected = itemsCount - selection.excluded.length;
         } else if (limit) {
            countItemsSelected = limit - selection.excluded.length;
         }
      } else {
         countItemsSelected = selection.selected.length;
      }

      return countItemsSelected;
   }

   private _isAllItemsLoaded(items: RecordSet|List, limit: number): boolean {
      let
         itemsCount: number = items.getCount(),
         more: number|boolean|undefined = items.getMetaData().more,
         hasMore: boolean|undefined = typeof more === 'number' ? more > itemsCount : more;

      return !hasMore || (limit && itemsCount >= limit);
   }
}
