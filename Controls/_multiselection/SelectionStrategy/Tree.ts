import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');

import { relation, Model } from 'Types/entity';
import { RecordSet } from 'Types/collection';
import { ISelectionObject as ISelection } from 'Controls/interface';
import { Controller as SourceController } from 'Controls/source';
import ISelectionStrategy from './ISelectionStrategy';
import { IEntryPath, ITreeSelectionStrategyOptions, TKeys } from '../interface';
import clone = require('Core/core-clone');
import { CrudEntityKey } from 'Types/source';

/**
 * Стратегия выбора для иерархического списка, для работы с ним как с плоским.
 * Записи не зависимы между собой, выбор родительских узлов никак не отражается на их детей.
 * @class Controls/_multiselection/SelectionStrategy/Tree
 * @control
 * @public
 * @author Панихин К.А.
 */

const FIELD_ENTRY_PATH = 'ENTRY_PATH';
const LEAF = null;

export class TreeSelectionStrategy implements ISelectionStrategy {
   private _hierarchyRelation: relation.Hierarchy;
   private _selectAncestors: boolean;
   private _selectDescendants: boolean;
   private _nodesSourceControllers: Map<string, SourceController>;
   private _rootId: CrudEntityKey;
   private _items: RecordSet;

   constructor(options: ITreeSelectionStrategyOptions) {
      this.update(options);
   }

   update(options: ITreeSelectionStrategyOptions): void {
      this._hierarchyRelation = options.hierarchyRelation;
      this._selectAncestors = options.selectAncestors;
      this._selectDescendants = options.selectDescendants;
      this._nodesSourceControllers = options.nodesSourceControllers;
      this._rootId = options.rootId;
      this._items = options.items;
   }

   setItems(items: RecordSet): void {
      this._items = items;
   }

   select(selection: ISelection, keys: TKeys): ISelection {
      const cloneSelection = clone(selection);

      keys.forEach((key) => {
         const item = this._items.getRecordById(key);

         if (!item || this._isNode(item)) {
            this._selectNode(cloneSelection, key);
         } else {
            this._selectLeaf(cloneSelection, key);
         }
      });

      return cloneSelection;
   }

   unselect(selection: ISelection, keys: TKeys): ISelection {
      const cloneSelection = clone(selection);

      keys.forEach((key) => {
         const item = this._items.getRecordById(key);
         if (!item || this._isNode(item)) {
            this._unselectNode(cloneSelection, key);
         } else {
            this._unselectLeaf(cloneSelection, key);
         }
         if (key !== this._rootId && item && this._selectAncestors) {
            const parentId = this._getParentId(item.getKey());
            this._unselectParentNodes(cloneSelection, parentId);
         }
      });

      if (!cloneSelection.selected.length) {
         cloneSelection.excluded = [];
      }

      return cloneSelection;
   }

   selectAll(selection: ISelection): ISelection {
      const newSelection = this.select(selection, [this._rootId]);
      this._removeChildrenIdsFromSelection(newSelection, this._rootId);

      if (!newSelection.excluded.includes(this._rootId)) {
         newSelection.excluded = ArraySimpleValuesUtil.addSubArray(newSelection.excluded, [this._rootId]);
      }

      return newSelection;
   }

   unselectAll(selection: ISelection): ISelection {
      let cloneSelection = clone(selection);

      if (this._withEntryPath()) {
         cloneSelection = this._unselectAllInRoot(cloneSelection);
      } else {
         cloneSelection.selected.length = 0;
         cloneSelection.excluded.length = 0;
      }

      return cloneSelection;
   }

   toggleAll(selection: ISelection, hasMoreData: boolean): ISelection {
      const childrenIdsInRoot = this._getChildrenIds(this._rootId, this._items, this._hierarchyRelation);
      const rootExcluded = selection.excluded.includes(this._rootId);
      const oldExcludedKeys = selection.excluded.slice();
      const oldSelectedKeys = selection.selected.slice();

      let cloneSelection = clone(selection);
      if (this._isAllSelected(cloneSelection, this._rootId)) {
         cloneSelection = this._unselectAllInRoot(cloneSelection);

         const intersectionKeys = ArraySimpleValuesUtil.getIntersection(childrenIdsInRoot, oldExcludedKeys);
         cloneSelection = this.select(cloneSelection, intersectionKeys);
      } else {
         cloneSelection = this.selectAll(cloneSelection);

         if (hasMoreData) {
            cloneSelection = this.unselect(cloneSelection, oldSelectedKeys);
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
       items?: Model[],
       searchValue?: string
   ): Map<boolean|null, Model[]> {
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
         const itemId: CrudEntityKey = item.getKey();
         const parentId = this._getParentId(itemId);
         const isNode = this._isNode(item);
         let isSelected = !selection.excluded.includes(itemId) && (selection.selected.includes(itemId) ||
             this._isAllSelected(selection, parentId));

         if (this._selectAncestors && isNode) {
            isSelected = this._getStateNode(itemId, isSelected, {
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
               const itemId: CrudEntityKey = selection.selected[index];
               const item = this._items.getRecordById(itemId);

               if (!item || this._isNode(item)) {
                  selectedNodes.push(itemId);
               }

               if (!selection.excluded.includes(itemId)) {
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
                countItemsSelectedInNode = this._getSelectedChildrenCount(nodeKey, selection, this._items, this._hierarchyRelation, this._selectDescendants);
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
         const item = this._items.getRecordById(currentParentId);
         this._unselectNode(selection, currentParentId);
         currentParentId = this._getParentId(item.getKey());
         allChildrenExcluded = this._isAllChildrenExcluded(selection, currentParentId);
      }
   }

   private _getChildrenByEntryPath(nodeId: CrudEntityKey, path: any[] = []): CrudEntityKey[] {
      let result = [];
      let children;
      const childrenMap = new Map();
      path.forEach((pathItem) => {
         if (!childrenMap.has(pathItem.parent)) {
            childrenMap.set(pathItem.parent, [pathItem.id]);
         } else {
            childrenMap.get(pathItem.parent).push(pathItem.id);
         }
      });
      children = childrenMap.get(nodeId) || [];
      childrenMap.delete(nodeId);
      while (children.length) {
         let tempChildren = [];
         result = result.concat(children);
         children.forEach((key: CrudEntityKey): void => {
            if (childrenMap.has(key)) {
               tempChildren = tempChildren.concat(childrenMap.get(key));
               childrenMap.delete(key);
            }
         });
         children = tempChildren;
      }

      return result;
   }

   private _isAllSelectedInRoot(selection: ISelection): boolean {
      return selection.selected.includes(this._rootId) && selection.excluded.includes(this._rootId);
   }

   private _unselectAllInRoot(selection: ISelection): ISelection {
      const rootInExcluded = selection.excluded.includes(this._rootId);

      selection = this.unselect(selection, [this._rootId]);
      this._removeChildrenIdsFromSelection(selection, this._rootId);

      if (rootInExcluded) {
         selection.excluded = ArraySimpleValuesUtil.removeSubArray(selection.excluded, [this._rootId]);
      }

      return selection;
   }

   private _withEntryPath(): boolean {
      return FIELD_ENTRY_PATH in this._items.getMetaData();
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
         this._removeChildes(selection, nodeId, this._items, this._hierarchyRelation);
      }
   }

   private _unselectNode(selection: ISelection, nodeId: CrudEntityKey): void {
      this._unselectLeaf(selection, nodeId);

      if (this._selectDescendants) {
         this._removeChildes(selection, nodeId, this._items, this._hierarchyRelation);
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
      const parentId = this._getParentId(leafId);

      ArraySimpleValuesUtil.removeSubArray(selection.selected, [leafId]);
      if (this._isAllSelected(selection, parentId)) {
         ArraySimpleValuesUtil.addSubArray(selection.excluded, [leafId]);
      }

      if (this._isAllChildrenExcluded(selection, parentId) && this._selectAncestors && parentId !== this._rootId) {
         ArraySimpleValuesUtil.addSubArray(selection.excluded, [parentId]);
         ArraySimpleValuesUtil.removeSubArray(selection.selected, [parentId]);
      }
   }

   private _getParentId(itemId: string|number): CrudEntityKey|undefined {
      const parentProperty: string = this._hierarchyRelation.getParentProperty();
      const item: Model|undefined = this._items.getRecordById(itemId);
      return item && item.get(parentProperty);
   }

   private _mergeEntryPath(selectedKeys: TKeys): TKeys {
      const entryPathObject: Object = {};
      const entryPath: IEntryPath[] = this._items.getMetaData()[FIELD_ENTRY_PATH];
      const selectedKeysWithEntryPath: TKeys = selectedKeys.slice();

      if (entryPath) {
         entryPath.forEach((pathData: IEntryPath) => {
            entryPathObject[pathData.id] = pathData.parent;
         });

         entryPath.forEach((pathData) => {
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
      let hasSelectedParent: boolean = false;
      let hasExcludedParent: boolean = false;
      let currentParentId: CrudEntityKey|undefined = this._getParentId(key);

      while (currentParentId !== null && currentParentId !== undefined) {
         if (selection.selected.includes(currentParentId)) {
            hasSelectedParent = true;
            break;
         } else if (selection.excluded.includes(currentParentId)) {
            hasExcludedParent = true;
            break;
         }

         currentParentId = this._getParentId(currentParentId);
      }

      if (!hasExcludedParent && !currentParentId && selection.selected.includes(null)) {
         hasSelectedParent = true;
      }

      return hasSelectedParent;
   }

   private _getStateNode(itemId: CrudEntityKey, initialState: boolean, selection: ISelection): boolean|null {
      const children = this._getChildren(itemId, this._items, this._hierarchyRelation);
      const entryPath = this._items.getMetaData()[FIELD_ENTRY_PATH];
      const listKeys = initialState ? selection.excluded : selection.selected;
      let stateNode = initialState;
      let countChildrenInList: boolean|number|null = 0;

      for (let index = 0; index < children.length; index++) {
         const child: Model = children[index];
         const childId: CrudEntityKey = child.getKey();
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
      } else if (entryPath) {
         const childrenFromPath = this._getChildrenByEntryPath(itemId, entryPath);
         const hasChildrenInKeys = listKeys.some((key) => childrenFromPath.includes(key));
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
      const childes = this._getChildren(nodeId, this._items, this._hierarchyRelation);

      let result = true;

      if (childes.length) {
         for (const child of childes) {
            if (this._getChildren(child.getKey(), this._items, this._hierarchyRelation).length > 0) {
               result = result && this._isAllChildrenExcluded(selection, child.getKey());
            } else {
               result = result && selection.excluded.includes(child.getKey());
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

   private _removeChildrenIdsFromSelection(selection: ISelection, nodeId: CrudEntityKey): void {
      this._removeChildes(selection, nodeId, this._items, this._hierarchyRelation);
   }

   private _getAllChildren(nodeId: CrudEntityKey, items: RecordSet, hierarchyRelation: relation.Hierarchy): Model[] {
      const children: Model[] = [];

      this._getChildren(nodeId, items, hierarchyRelation).forEach((child) => {
         ArraySimpleValuesUtil.addSubArray(children, [child]);

         if (this._isNode(child)) {
            ArraySimpleValuesUtil.addSubArray(children, this._getAllChildren(child.getKey(), items, hierarchyRelation));
         }
      });

      return children;
   }

   private _getChildrenInEntryPath(parentId: CrudEntityKey, entriesPath: IEntryPath[]): TKeys {
      let children = [];

      entriesPath.forEach((entryPath: IEntryPath) => {
         if (entryPath.parent === parentId) {
            children.push(entryPath.id);
            children = children.concat(this._getChildrenInEntryPath(entryPath.id, entriesPath));
         }
      });

      return children;
   }

   private _getChildrenIds(nodeId: CrudEntityKey, items: RecordSet, hierarchyRelation: relation.Hierarchy): TKeys {
      const entriesPath = items.getMetaData()[FIELD_ENTRY_PATH];
      let childrenIds = this._getAllChildren(nodeId, items, hierarchyRelation).map((child) => {
         return child.getKey();
      });

      if (entriesPath) {
         entriesPath.forEach((entryPath) => {
            if ((childrenIds.includes(entryPath.parent) || nodeId === entryPath.parent) && !childrenIds.includes(entryPath.id)) {
               childrenIds.push(entryPath.id);
               childrenIds = childrenIds.concat(this._getChildrenInEntryPath(entryPath.id, entriesPath));
            }
         });
      }

      return childrenIds;
   }

   private _isHasChildren(item: Model, items: RecordSet, hierarchyRelation: relation.Hierarchy): boolean {
      return hierarchyRelation.hasDeclaredChildren(item) !== false
         || this._getChildren(item.getKey(), items, hierarchyRelation).length > 0;
   }

   private _getSelectedChildrenCount(
      nodeId: CrudEntityKey,
      selection: ISelection,
      items: RecordSet,
      hierarchyRelation: relation.Hierarchy,
      deep?: boolean
   ): number|null {
      const nodeItem = items.getRecordById(nodeId);
      const children = this._getChildren(nodeId, items, hierarchyRelation);
      let selectedChildrenCount = 0;

      if (children.length) {
         let childId;
         let childNodeSelectedCount;

         children.forEach((childItem) => {
            if (selectedChildrenCount !== null) {
               childId = childItem.getKey();

               if (!selection.excluded.includes(childId)) {
                  if (!selection.selected.includes(childId)) {
                     selectedChildrenCount++;
                  }

                  if (this._isNode(childItem) && this._isHasChildren(childItem, items, hierarchyRelation) && deep !== false) {
                     childNodeSelectedCount = this._getSelectedChildrenCount(childId, selection, items, hierarchyRelation);

                     if (childNodeSelectedCount === null) {
                        selectedChildrenCount = null;
                     } else {
                        selectedChildrenCount += childNodeSelectedCount;
                     }
                  }
               }
            }
         });
      } else if (!nodeItem || this._isHasChildren(nodeItem, items, hierarchyRelation)) {
         selectedChildrenCount = null;
      }

      return selectedChildrenCount;
   }

   private _removeChildes(selection: ISelection, nodeId: CrudEntityKey, items: RecordSet, hierarchy: relation.Hierarchy): void {
      const childrenIds: TKeys = this._getChildrenIds(nodeId, items, hierarchy);

      ArraySimpleValuesUtil.removeSubArray(selection.selected, childrenIds);
      ArraySimpleValuesUtil.removeSubArray(selection.excluded, childrenIds);
   }

   private _getChildren(nodeId: CrudEntityKey, items: RecordSet, hierarchyRelation: relation.Hierarchy): Model[] {
      return hierarchyRelation.getChildren(nodeId as any, items) as Model[];
   }

   /**
    * Проверяет что элемент узел или скрытый узел
    * @param item
    * @private
    */
   private _isNode(item: Model): boolean {
      return this._hierarchyRelation.isNode(item) !== LEAF;
   }
}
