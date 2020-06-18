import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');
import { isEqual } from 'Types/object';
import { TKeySelection as TKey, TKeysSelection as TKeys, ISelectionObject as ISelection } from 'Controls/interface';
import { Record } from 'Types/entity';
import { CollectionItem } from 'Controls/display';
import { default as ISelectionStrategy } from './SelectionStrategy/ISelectionStrategy';
import {
   ISelectionControllerOptions,
   ISelectionControllerResult,
   ISelectionDifference,
   ISelectionModel
} from './interface';
import clone = require('Core/core-clone');

/**
 * @class Controls/_multiselector/SelectionController
 * @author Авраменко А.С.
 * @private
 */
export class Controller {
   private _model: ISelectionModel;
   private _selectedKeys: TKeys = [];
   private _excludedKeys: TKeys = [];
   private _strategy: ISelectionStrategy;

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

      this._updateModel(this._selection);
   }

   /**
    * Обновить состояние контроллера
    * @param options
    * @param itemsChanged RecordSet в модели был изменен
    */
   update(options: ISelectionControllerOptions, itemsChanged: boolean): ISelectionControllerResult {
      const modelChanged = options.model !== this._model;
      const selectionChanged = this._isSelectionChanged(options.selectedKeys, options.excludedKeys);
      this._strategy.update(options.strategyOptions);

      if (modelChanged) {
         this._model = options.model;
      }

      const oldSelection = clone(this._selection);
      if (selectionChanged) {
         this._selectedKeys = options.selectedKeys.slice();
         this._excludedKeys = options.excludedKeys.slice();
      }

      if (selectionChanged || modelChanged || itemsChanged) {
         this._updateModel(this._selection);
      }

      return this._getResult(oldSelection, this._selection);
   }

   clearSelection(): ISelectionControllerResult {
      const oldSelection = clone(this._selection);
      this._clearSelection();
      this._updateModel(this._selection);
      return this._getResult(oldSelection, this._selection);
   }

   /**
    * Проверяет, что было выбраны все записи.
    * @param byEveryItem true - проверять выбранность каждого элемента по отдельности. Иначе проверка происходит по наличию единого признака выбранности всех элементов.
    */
   isAllSelected(byEveryItem: boolean): boolean {
      return this._strategy.isAllSelected(this._selection, this._model.getHasMoreData(), this._model.getCount(), byEveryItem);
   }

   toggleItem(key: TKey): ISelectionControllerResult {
      const status = this._getItemStatus(key);
      let newSelection;

      if (status === true || status === null) {
         newSelection = this._strategy.unselect(this._selection, [key]);
      } else {
         newSelection = this._strategy.select(this._selection, [key]);
      }

      this._updateModel(newSelection);
      const result = this._getResult(this._selection, newSelection);
      this._selection = newSelection;
      return result;
   }

   selectAll(): ISelectionControllerResult {
      const newSelection = this._strategy.selectAll(this._selection);
      this._updateModel(newSelection);
      const result = this._getResult(this._selection, newSelection);
      this._selection = newSelection;
      return result;
   }

   toggleAll(): ISelectionControllerResult {
      const newSelection = this._strategy.toggleAll(this._selection, this._model.getHasMoreData());

      this._updateModel(newSelection);
      const result = this._getResult(this._selection, newSelection);
      this._selection = newSelection;
      return result;
   }

   unselectAll(): ISelectionControllerResult {
      const newSelection = this._strategy.unselectAll(this._selection);

      this._updateModel(newSelection);
      const result = this._getResult(this._selection, newSelection);
      this._selection = newSelection;
      return result;   }

   handleAddItems(addedItems: Record[]): ISelectionControllerResult {
      // TODO для улучшения производительности обрабатывать только изменившиеся элементы
      this._updateModel(this._selection);
      return {
         selectedKeysDiff: { keys: [], added: [], removed: [] },
         excludedKeysDiff: { keys: [], added: [], removed: [] },
         selectedCount: this._getCount(this._selection),
         isAllSelected: this._strategy.isAllSelected(this._selection, this._model.getHasMoreData(), this._model.getCount())
      };
   }

   handleRemoveItems(removedItems: Array<CollectionItem<Record>>): ISelectionControllerResult {
      const oldSelection = clone(this._selection);
      this._remove(this._getItemsKeys(removedItems));

      // TODO для улучшения производительности обрабатывать только изменившиеся элементы
      this._updateModel(this._selection);
      return this._getResult(oldSelection, this._selection);
   }

   handleReset(newItems: Record[], prevRootId: TKey, rootChanged: boolean): ISelectionControllerResult {
      const oldSelection = clone(this._selection);

      // если у нас изменился корень и этот корень выбран, то это значит, что мы зашли в него нажали Выбрать все
      // и вышли в родительский узел, по стандартам элементы должны стать невыбранными
      if (rootChanged && this._selectedKeys.includes(prevRootId) && this._excludedKeys.includes(prevRootId)) {
         this._clearSelection();
         this._updateModel(this._selection);
      }

      return this._getResult(oldSelection, this._selection);
   }

   private _clearSelection(): void {
      this._selectedKeys = [];
      this._excludedKeys = [];
   }

   private _remove(keys: TKeys): void {
      this._excludedKeys = ArraySimpleValuesUtil.removeSubArray(this._excludedKeys.slice(), keys);
      this._selectedKeys = ArraySimpleValuesUtil.removeSubArray(this._selectedKeys.slice(), keys);
   }

   private _getItemStatus(key: TKey): boolean {
      return this._model.getItemBySourceKey(key).isSelected();
   }

   private _getCount(selection?: ISelection): number | null {
      return this._strategy.getCount(selection || this._selection, this._model.getHasMoreData());
   }

   private _getItemsKeys(items: Array<CollectionItem<Record>>): TKeys {
      return items.map((item) => item.getContents ? item.getContents().getId() : item.getId());
   }

   private _isSelectionChanged(selectedKeys: TKeys, excludedKeys: TKeys): boolean {
      return !isEqual(selectedKeys, this._selectedKeys) || !isEqual(excludedKeys, this._excludedKeys);
   }

   private _getResult(oldSelection: ISelection, newSelection: ISelection): ISelectionControllerResult {
      const
         selectionCount = this._getCount(newSelection),
         oldSelectedKeys = oldSelection.selected,
         oldExcludedKeys = oldSelection.excluded,
         // selectionCount будет равен нулю, если в списке не отмечено ни одного элемента
         // или после выделения всех записей через "отметить всё", пользователь руками снял чекбоксы со всех записей
         newSelectedKeys = selectionCount === 0 ? [] : newSelection.selected,
         newExcludedKeys = selectionCount === 0 ? [] : newSelection.excluded,
         selectedKeysDiff = ArraySimpleValuesUtil.getArrayDifference(oldSelectedKeys, newSelectedKeys),
         excludedKeysDiff = ArraySimpleValuesUtil.getArrayDifference(oldExcludedKeys, newExcludedKeys);

      const selectedDifference: ISelectionDifference = {
         keys: newSelectedKeys,
         added: selectedKeysDiff.added,
         removed: selectedKeysDiff.removed
      };

      const excludedDifference: ISelectionDifference = {
         keys: newExcludedKeys,
         added: excludedKeysDiff.added,
         removed: excludedKeysDiff.removed
      };

      return {
         selectedKeysDiff: selectedDifference,
         excludedKeysDiff: excludedDifference,
         selectedCount: selectionCount,
         isAllSelected: this._strategy.isAllSelected(newSelection, this._model.getHasMoreData(), this._model.getCount())
      };
   }

   private _updateModel(selection: ISelection): void {
      const selectionForModel = this._strategy.getSelectionForModel(selection);
      this._model.setSelectedItems(selectionForModel.get(true), true);
      this._model.setSelectedItems(selectionForModel.get(false), false);
      this._model.setSelectedItems(selectionForModel.get(null), null);
   }
}
