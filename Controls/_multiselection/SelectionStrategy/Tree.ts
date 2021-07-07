import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');

import { Model } from 'Types/entity';
import { ISelectionObject as ISelection } from 'Controls/interface';
import { Controller as SourceController } from 'Controls/source';
import ISelectionStrategy from './ISelectionStrategy';
import { IEntryPathItem, ITreeSelectionStrategyOptions, TKeys } from '../interface';
import clone = require('Core/core-clone');
import { CrudEntityKey } from 'Types/source';
import { TreeChildren, TreeItem } from 'Controls/display';
import { List } from 'Types/collection';

const LEAF = null;

/**
 * Стратегия выбора для иерархического списка.
 * @class Controls/_multiselection/SelectionStrategy/Tree
 * @control
 * @public
 * @author Панихин К.А.
 */
export class TreeSelectionStrategy implements ISelectionStrategy {
   private _selectAncestors: boolean;
   private _selectDescendants: boolean;
   private _nodesSourceControllers: Map<string, SourceController>;
   private _rootId: CrudEntityKey;
   private _items: Array<TreeItem<Model>>;
   private _entryPath: IEntryPathItem[];

   constructor(options: ITreeSelectionStrategyOptions) {
      this.update(options);
   }

   update(options: ITreeSelectionStrategyOptions): void {
      this._selectAncestors = options.selectAncestors;
      this._selectDescendants = options.selectDescendants;
      this._nodesSourceControllers = options.nodesSourceControllers;
      this._rootId = options.rootId;
      this._items = options.items;
      this._entryPath = options.entryPath;
   }

   setItems(items: Array<TreeItem<Model>>): void {
      this._items = items;
   }

   select(selection: ISelection, key: CrudEntityKey): ISelection {
      const item = this._getItem(key);
      if (item && !item.SelectableItem) {
         return selection;
      }

      const cloneSelection = clone(selection);
      if (!item || this._isNode(item)) {
         this._selectNode(cloneSelection, key);
      } else {
         this._selectLeaf(cloneSelection, key);
      }

      return cloneSelection;
   }

   unselect(selection: ISelection, key: CrudEntityKey): ISelection {
      const item = this._getItem(key);
      if (item && !item.SelectableItem) {
         return selection;
      }

      const cloneSelection = clone(selection);
      if (!item || this._isNode(item)) {
         this._unselectNode(cloneSelection, key);
      } else {
         this._unselectLeaf(cloneSelection, key);
      }
      if (key !== this._rootId && item && this._selectAncestors) {
         const parentId = this._getParentKey(this._getKey(item));
         this._unselectParentNodes(cloneSelection, parentId);
      }

      if (!cloneSelection.selected.length) {
         cloneSelection.excluded = [];
      }

      return cloneSelection;
   }

   selectAll(selection: ISelection): ISelection {
      const newSelection = this.select(selection, this._rootId);
      this._removeChildes(newSelection, this._rootId);

      if (!newSelection.excluded.includes(this._rootId)) {
         newSelection.excluded = ArraySimpleValuesUtil.addSubArray(newSelection.excluded, [this._rootId]);
      }

      return newSelection;
   }

   unselectAll(selection: ISelection): ISelection {
      let cloneSelection = clone(selection);

      if (this._entryPath) {
         cloneSelection = this._unselectAllInRoot(cloneSelection);
      } else {
         cloneSelection.selected.length = 0;
         cloneSelection.excluded.length = 0;
      }

      return cloneSelection;
   }

   toggleAll(selection: ISelection, hasMoreData: boolean): ISelection {
      const childrenIdsInRoot = this._getAllChildrenIds(this._rootId);
      const rootExcluded = selection.excluded.includes(this._rootId);
      const oldExcludedKeys = selection.excluded.slice();
      const oldSelectedKeys = selection.selected.slice();

      let cloneSelection = clone(selection);
      if (this._isAllSelected(cloneSelection, this._rootId)) {
         cloneSelection = this._unselectAllInRoot(cloneSelection);

         const intersectionKeys = ArraySimpleValuesUtil.getIntersection(childrenIdsInRoot, oldExcludedKeys);
         intersectionKeys.forEach((key) => cloneSelection = this.select(cloneSelection, key));
      } else {
         cloneSelection = this.selectAll(cloneSelection);

         if (hasMoreData) {
            oldSelectedKeys.forEach((key) => cloneSelection = this.unselect(cloneSelection, key));
         }
      }

      ArraySimpleValuesUtil.addSubArray(cloneSelection.excluded, ArraySimpleValuesUtil.getIntersection(childrenIdsInRoot, oldSelectedKeys));
      ArraySimpleValuesUtil.addSubArray(cloneSelection.selected, ArraySimpleValuesUtil.getIntersection(childrenIdsInRoot, oldExcludedKeys));

      if (rootExcluded) {
         ArraySimpleValuesUtil.removeSubArray(cloneSelection.excluded, [this._rootId]);
      }

      return cloneSelection;
   }

   getSelectionForModel(
       selection: ISelection,
       limit?: number,
       items?: Array<TreeItem<Model>>,
       searchValue?: string
   ): Map<boolean|null, Array<TreeItem<Model>>> {
      const selectedItems = new Map();
      // IE не поддерживает инициализацию конструктором
      selectedItems.set(true, []);
      selectedItems.set(false, []);
      selectedItems.set(null, []);

      const selectedKeysWithEntryPath = this._mergeEntryPath(selection.selected);
      const processingItems = items ? items : this._items;

      let doNotSelectNodes = false;
      if (searchValue) {
         let isOnlyNodesInItems = true;

         processingItems.forEach((item) => {
            if (isOnlyNodesInItems) {
               isOnlyNodesInItems = this._isNode(item);
            }
         });

         doNotSelectNodes = this._isAllSelected(selection, this._rootId) && !isOnlyNodesInItems;
      }

      processingItems.forEach((item) => {
         const key = this._getKey(item);
         const parentId = this._getKey(item.getParent());
         const isNode = this._isNode(item);
         let isSelected = !selection.excluded.includes(key) && (selection.selected.includes(key) ||
             this._isAllSelected(selection, parentId)) || isNode && this._isAllSelected(selection, key);

         if (this._selectAncestors && isNode) {
            isSelected = this._getStateNode(key, isSelected, {
               selected: selectedKeysWithEntryPath,
               excluded: selection.excluded
            });
         }

         if (isSelected && isNode && doNotSelectNodes) {
            isSelected = null;
         }

         selectedItems.get(isSelected).push(item);
      });

      return selectedItems;
   }

   getCount(selection: ISelection, hasMoreData: boolean): number|null {
      let countItemsSelected: number|null = 0;
      let selectedNodes: TKeys = [];

      if (!this._isAllSelected(selection, this._rootId) || !hasMoreData) {
         if (this._selectDescendants) {
            for (let index = 0; index < selection.selected.length; index++) {
               const key = selection.selected[index];
               const item = this._getItem(key);

               if (!item || this._isNode(item)) {
                  selectedNodes.push(key);
               }

               if (!selection.excluded.includes(key)) {
                  countItemsSelected++;
               }
            }
         } else {
            selectedNodes = ArraySimpleValuesUtil.getIntersection(selection.selected, selection.excluded);
            countItemsSelected = selection.selected.length - selectedNodes.length;
         }

         for (let index = 0; index < selectedNodes.length; index++) {
            const nodeKey: CrudEntityKey = selectedNodes[index];
            const nodeSourceController = this._nodesSourceControllers?.get(nodeKey as string);
            let countItemsSelectedInNode;
            if (nodeSourceController?.hasMoreData('down')) {
                countItemsSelectedInNode = null;
            } else {
                countItemsSelectedInNode = this._getSelectedChildrenCount(nodeKey, selection, this._items, this._selectDescendants);
            }

            if (countItemsSelectedInNode === null) {
               countItemsSelected = null;
               break;
            } else {
               countItemsSelected += countItemsSelectedInNode;
            }
         }
      } else if (selection.selected.length) {
         countItemsSelected = null;
      }

      return countItemsSelected;
   }

   isAllSelected(selection: ISelection, hasMoreData: boolean, itemsCount: number, byEveryItem: boolean = true): boolean {
      let isAllSelected;

      if (byEveryItem) {
         isAllSelected = !hasMoreData && itemsCount > 0 && itemsCount === this.getCount(selection, hasMoreData)
            || this._isAllSelectedInRoot(selection) && selection.excluded.length === 1;
      } else {
         isAllSelected = this._isAllSelectedInRoot(selection);
      }

      return isAllSelected;
   }

   private _unselectParentNodes(selection: ISelection, parentId: CrudEntityKey): void {
      let allChildrenExcluded = this._isAllChildrenExcluded(selection, parentId);
      let currentParentId = parentId;
      while (currentParentId !== this._rootId && allChildrenExcluded) {
         this._unselectNode(selection, currentParentId);
         currentParentId = this._getParentKey(currentParentId);
         allChildrenExcluded = this._isAllChildrenExcluded(selection, currentParentId);
      }
   }

   private _isAllSelectedInRoot(selection: ISelection): boolean {
      return selection.selected.includes(this._rootId) && selection.excluded.includes(this._rootId);
   }

   private _unselectAllInRoot(selection: ISelection): ISelection {
      const rootInExcluded = selection.excluded.includes(this._rootId);

      selection = this.unselect(selection, this._rootId);
      this._removeChildes(selection, this._rootId);

      if (rootInExcluded) {
         selection.excluded = ArraySimpleValuesUtil.removeSubArray(selection.excluded, [this._rootId]);
      }

      return selection;
   }

   private _isAllSelected(selection: ISelection, nodeId: CrudEntityKey): boolean {
      if (this._selectDescendants || this._isAllSelectedInRoot(selection)) {
         return selection.selected.includes(nodeId) || !selection.excluded.includes(nodeId) &&
            this._hasSelectedParent(nodeId, selection);
      } else {
         return selection.selected.includes(nodeId) && selection.excluded.includes(nodeId);
      }
   }

   private _selectNode(selection: ISelection, nodeId: CrudEntityKey): void {
      this._selectLeaf(selection, nodeId);

      if (this._selectDescendants) {
         this._removeChildes(selection, nodeId);
      }
   }

   private _unselectNode(selection: ISelection, nodeId: CrudEntityKey): void {
      this._unselectLeaf(selection, nodeId);

      if (this._selectDescendants) {
         this._removeChildes(selection, nodeId);
      }
   }

   private _selectLeaf(selection: ISelection, leafId: string|number): void {
      if (selection.excluded.includes(leafId)) {
         ArraySimpleValuesUtil.removeSubArray(selection.excluded, [leafId]);
      } else {
         ArraySimpleValuesUtil.addSubArray(selection.selected, [leafId]);
      }
   }

   private _unselectLeaf(selection: ISelection, leafId: string|number): void {
      const parentId = this._getParentKey(leafId);

      ArraySimpleValuesUtil.removeSubArray(selection.selected, [leafId]);
      if (this._isAllSelected(selection, parentId)) {
         ArraySimpleValuesUtil.addSubArray(selection.excluded, [leafId]);
      }

      if (this._isAllChildrenExcluded(selection, parentId) && this._selectAncestors && parentId !== this._rootId) {
         ArraySimpleValuesUtil.addSubArray(selection.excluded, [parentId]);
         ArraySimpleValuesUtil.removeSubArray(selection.selected, [parentId]);
      }
   }

   private _getParentKey(key: string|number): CrudEntityKey|undefined {
      const dispItem = this._getItem(key);
      const parent = dispItem?.getParent();
      return parent ? this._getKey(parent) : undefined;
   }

   // TODO после починки юнитов, попробовать переписать. Какая-то дичь
   private _mergeEntryPath(selectedKeys: TKeys): TKeys {
      const entryPathObject: Object = {};
      const selectedKeysWithEntryPath: TKeys = selectedKeys.slice();

      if (this._entryPath) {
         this._entryPath.forEach((pathData) => {
            entryPathObject[pathData.id] = pathData.parent;
         });

         this._entryPath.forEach((pathData) => {
            if (selectedKeys.includes(pathData.id)) {
               for (let keyItem = pathData.parent; entryPathObject[keyItem]; keyItem = entryPathObject[keyItem]) {
                  if (!selectedKeys.includes(keyItem)) {
                     selectedKeysWithEntryPath.push(keyItem);
                  }
               }
            }
         });
      }

      return selectedKeysWithEntryPath;
   }

   private _hasSelectedParent(key: CrudEntityKey, selection: ISelection): boolean {
      let hasSelectedParent = false;
      let hasExcludedParent = false;
      let currentParentId = this._getParentKey(key);

      while (currentParentId !== null && currentParentId !== undefined) {
         if (selection.selected.includes(currentParentId)) {
            hasSelectedParent = true;
            break;
         } else if (selection.excluded.includes(currentParentId)) {
            hasExcludedParent = true;
            break;
         }

         currentParentId = this._getParentKey(currentParentId);
      }

      if (!hasExcludedParent && !currentParentId && selection.selected.includes(null)) {
         hasSelectedParent = true;
      }

      return hasSelectedParent;
   }

   private _getStateNode(key: CrudEntityKey, initialState: boolean, selection: ISelection): boolean|null {
      const children = this._getChildes(key);
      const listKeys = initialState ? selection.excluded : selection.selected;
      let stateNode = initialState;
      let countChildrenInList: boolean|number|null = 0;

      for (let index = 0; index < children.getCount(); index++) {
         const child = children.at(index);
         const childId = this._getKey(child);
         const childInList = listKeys.includes(childId);

         if (this._isNode(child)) {
            const stateChildNode = this._getStateNode(childId, childInList ? !initialState : initialState, selection);

            if (stateChildNode === null) {
               stateNode = null;
               break;
            } else if (stateChildNode !== initialState) {
               countChildrenInList++;
            }
         } else if (childInList) {
            countChildrenInList++;
         }
      }

      if (countChildrenInList > 0) {
         stateNode = null;
      } else if (this._entryPath) {
         const childesFromEntryPath =  this._entryPath
             .filter((item) => item.parent === key)
             .map((item) => item.id);
         const hasChildrenInKeys = listKeys.some((key) => childesFromEntryPath.includes(key));
         if (hasChildrenInKeys) {
            stateNode = null;
         }
      }

      return stateNode;
   }

   /**
    * Проверяем, что все дети данного узла находятся в excluded
    * @param selection
    * @param nodeId
    * @private
    */
   private _isAllChildrenExcluded(selection: ISelection, nodeId: CrudEntityKey): boolean {
      const childes = this._getChildes(nodeId);

      let result = true;

      if (childes.getCount()) {
         for (let i = 0; i < childes.getCount(); i++) {
            const child = childes.at(i);
            const childId = this._getKey(child);
            if (this._getChildes(childId).getCount() > 0) {
               result = result && this._isAllChildrenExcluded(selection, childId);
            } else {
               result = result && selection.excluded.includes(childId);
            }

            if (!result) {
               break;
            }
         }
      } else {
         result = false;
      }

      return result;
   }

   private _getAllChildren(nodeId: CrudEntityKey): Array<TreeItem<Model>> {
      const childes = [];

      this._getChildes(nodeId).each((child) => {
         ArraySimpleValuesUtil.addSubArray(childes, [child]);

         if (this._isNode(child)) {
            ArraySimpleValuesUtil.addSubArray(childes, this._getAllChildren(this._getKey(child)));
         }
      });

      return childes;
   }

   /**
    * Возвращает всех детей данного узла из ENTRY_PATH, включая детей детей узла
    * @param parentId
    * @private
    */
   private _getChildrenIdsInEntryPath(parentId: CrudEntityKey): TKeys {
      const childrenIds = [];

      const childesFromEntryPath = this._entryPath
          .filter((item) => item.parent === parentId)
          .map((item) => {
             childrenIds.concat(this._getChildrenIdsInEntryPath(item.id));
             return item.id;
          });

      childrenIds.concat(childesFromEntryPath);
      return childrenIds;
   }

   /**
    * Возвращает ключи всех детей, включая детей из ENTRY_PATH
    * @param nodeId
    * @private
    */
   private _getAllChildrenIds(nodeId: CrudEntityKey): TKeys {
      let childrenIds = this._getAllChildren(nodeId).map((child) => this._getKey(child));

      if (this._entryPath) {
         this._entryPath.forEach((entryPath) => {
            if ((childrenIds.includes(entryPath.parent) || nodeId === entryPath.parent) && !childrenIds.includes(entryPath.id)) {
               childrenIds.push(entryPath.id);
               childrenIds = childrenIds.concat(this._getChildrenIdsInEntryPath(entryPath.id));
            }
         });
      }

      return childrenIds;
   }

   private _isHasChildren(item: TreeItem<Model>): boolean {
      return item.isHasChildren() || this._getChildes(this._getKey(item)).getCount() > 0;
   }

   private _getSelectedChildrenCount(
      nodeId: CrudEntityKey,
      selection: ISelection,
      items: Array<TreeItem<Model>>,
      deep?: boolean
   ): number|null {
      const nodeItem = items.find((item) => this._getKey(item) === nodeId);
      const children = this._getChildes(nodeId);
      let selectedChildrenCount = 0;

      if (children.getCount()) {
         let childId;
         let childNodeSelectedCount;

         children.each((childItem) => {
            if (selectedChildrenCount !== null) {
               childId = this._getKey(childItem);

               if (!selection.excluded.includes(childId)) {
                  if (!selection.selected.includes(childId)) {
                     selectedChildrenCount++;
                  }

                  if (this._isNode(childItem) && this._isHasChildren(childItem) && deep !== false) {
                     childNodeSelectedCount = this._getSelectedChildrenCount(childId, selection, items);

                     if (childNodeSelectedCount === null) {
                        selectedChildrenCount = null;
                     } else {
                        selectedChildrenCount += childNodeSelectedCount;
                     }
                  }
               }
            }
         });
      } else if (!nodeItem || this._isHasChildren(nodeItem)) {
         selectedChildrenCount = null;
      }

      return selectedChildrenCount;
   }

   private _removeChildes(selection: ISelection, nodeId: CrudEntityKey): void {
      const childrenIds = this._getAllChildrenIds(nodeId);
      ArraySimpleValuesUtil.removeSubArray(selection.selected, childrenIds);
      ArraySimpleValuesUtil.removeSubArray(selection.excluded, childrenIds);
   }

   private _getChildes(nodeId: CrudEntityKey): TreeChildren<Model>|List<TreeItem<Model>> {
      let result;
      const node = this._getItem(nodeId);

      // Значит передали ключ корневого узла
      if (!node) {
         const childes = this._items.filter((item) => this._getKey(item.getParent()) === nodeId);
         result = new List({items: childes});
      } else {
         result = node.getChildren(false);
      }
      return result;
   }

   /**
    * Проверяет что элемент узел или скрытый узел
    * @param item
    * @private
    */
   private _isNode(item: TreeItem<Model>): boolean {
      return item instanceof TreeItem ? item.isNode() !== LEAF : true;
   }

   /**
    * @private
    * TODO нужно выпилить этот метод при переписывании моделей. item.getContents() должен возвращать Record
    *  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
    */
   private _getKey(item: TreeItem<Model>): CrudEntityKey {
      if (!item) {
         return undefined;
      }

      let contents = item.getContents();
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

   private _getItem(key: CrudEntityKey): TreeItem<Model> {
      return this._items.find((item) => this._getKey(item) === key);
   }
}
