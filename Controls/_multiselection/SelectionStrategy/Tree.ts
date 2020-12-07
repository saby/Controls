import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');

import { Model } from 'Types/entity';
import { ISelectionObject as ISelection } from 'Controls/interface';
import { Controller as SourceController } from 'Controls/source';
import ISelectionStrategy from './ISelectionStrategy';
import { IEntryPathItem, ITreeSelectionStrategyOptions, TKeys } from '../interface';
// нет замены
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import clone = require('Core/core-clone');
import { CrudEntityKey } from 'Types/source';
import { Tree, TreeItem } from 'Controls/display';
import BreadcrumbsItem from 'Controls/_display/BreadcrumbsItem';

const LEAF = null;

/**
 * Стратегия выбора для иерархического списка.
 * @class Controls/_multiselection/SelectionStrategy/Tree
 *
 * @public
 * @author Панихин К.А.
 */
export class TreeSelectionStrategy implements ISelectionStrategy {
   private _selectAncestors: boolean;
   private _selectDescendants: boolean;
   // удаляем по задаче https://online.sbis.ru/opendoc.html?guid=51cfa21a-f2ca-436d-b600-da3b22ccb7f2
   // tslint:disable-next-line:ban-ts-ignore
   // @ts-ignore
   private _rootId: CrudEntityKey;
   private _model: Tree<Model, TreeItem<Model>>;
   private _entryPath: IEntryPathItem[];

   constructor(options: ITreeSelectionStrategyOptions) {
      this.update(options);
   }

   update(options: ITreeSelectionStrategyOptions): void {
      this._selectAncestors = options.selectAncestors;
      this._selectDescendants = options.selectDescendants;
      this._rootId = options.rootId;
      this._model = options.model;
      this._entryPath = options.entryPath;
   }

   setEntryPath(entryPath: IEntryPathItem[]): void {
      this._entryPath = entryPath;
   }

   select(selection: ISelection, key: CrudEntityKey): ISelection {
      const item = this._getItem(key);

      const cloneSelection = clone(selection);
      if (!item || this._isNode(item)) {
         this._selectNode(cloneSelection, item);
      } else {
         this._selectLeaf(cloneSelection, key);
      }

      return cloneSelection;
   }

   unselect(selection: ISelection, key: CrudEntityKey): ISelection {
      const item = this._getItem(key);

      const cloneSelection = clone(selection);
      if (!item) {
         ArraySimpleValuesUtil.removeSubArray(cloneSelection.selected, [key]);
         if (this._isAllSelectedInRoot(selection)) {
            ArraySimpleValuesUtil.addSubArray(cloneSelection.excluded, [key]);
         }
      } else if (this._isNode(item)) {
         this._unselectNode(cloneSelection, item);
      } else {
         this._unselectLeaf(cloneSelection, item);
      }
      if (key !== this._rootId && item && this._selectAncestors) {
         this._unselectParentNodes(cloneSelection, item.getParent());
      }

      if (!cloneSelection.selected.length) {
         cloneSelection.excluded = [];
      }

      return cloneSelection;
   }

   selectAll(selection: ISelection): ISelection {
      const newSelection = this.select(selection, this._rootId);
      this._removeChildes(newSelection, this._getRoot());

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
      const childrenIdsInRoot = this._getAllChildrenIds(this._getRoot());
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

      ArraySimpleValuesUtil.addSubArray(
          cloneSelection.excluded,
          ArraySimpleValuesUtil.getIntersection(childrenIdsInRoot, oldSelectedKeys)
      );
      ArraySimpleValuesUtil.addSubArray(
          cloneSelection.selected,
          ArraySimpleValuesUtil.getIntersection(childrenIdsInRoot, oldExcludedKeys)
      );

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

      let doNotSelectNodes = false;
      if (searchValue) {
         let isOnlyNodesInItems = true;

         if (items) {
            items.forEach((item) => {
               if (isOnlyNodesInItems && item.SelectableItem) {
                  isOnlyNodesInItems = this._isNode(item);
               }
            });
         } else {
            this._model.each((item) => {
               // Скипаем элементы, которые нельзя выбрать, т.к. например группа испортит значение isOnlyNodesInItems
               if (isOnlyNodesInItems && item.SelectableItem) {
                  isOnlyNodesInItems = this._isNode(item);
               }
            });
         }

         doNotSelectNodes = this._isAllSelected(selection, this._rootId) && !isOnlyNodesInItems;
      }

      const handleItem = (item) => {
         if (!item.SelectableItem) {
            return;
         }

         const key = this._getKey(item);
         const parentId = this._getKey(item.getParent());
         const isNode = this._isNode(item);
         let isSelected = !selection.excluded.includes(key) && (selection.selected.includes(key) ||
             this._isAllSelected(selection, parentId)) || isNode && this._isAllSelected(selection, key);

         if (this._selectAncestors && isNode) {
            isSelected = this._getStateNode(item, isSelected, {
               selected: selectedKeysWithEntryPath,
               excluded: selection.excluded
            });
         }

         if (isSelected && isNode && doNotSelectNodes) {
            isSelected = null;
         }

         selectedItems.get(isSelected).push(item);
      };

      if (items) {
         items.forEach(handleItem);
      } else {
         this._model.each(handleItem);
      }

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
            const nodeKey = selectedNodes[index];
            let countItemsSelectedInNode;
            if (this._model.getHasMoreStorage()[nodeKey]) {
                countItemsSelectedInNode = null;
            } else {
               const countChildes = this._selectDescendants || this._isAllSelectedInRoot(selection);
               const node = this._getItem(nodeKey);
               countItemsSelectedInNode = this._getSelectedChildrenCount(node, selection, countChildes);
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

   isAllSelected(selection: ISelection,
                 hasMoreData: boolean,
                 itemsCount: number,
                 byEveryItem: boolean = true): boolean {
      let isAllSelected;

      if (byEveryItem) {
         isAllSelected = !hasMoreData && itemsCount > 0 && itemsCount === this.getCount(selection, hasMoreData)
            || this._isAllSelectedInRoot(selection) && selection.excluded.length === 1;
      } else {
         isAllSelected = this._isAllSelectedInRoot(selection);
      }

      return isAllSelected;
   }

   private _unselectParentNodes(selection: ISelection, item: TreeItem<Model>): void {
      let allChildrenExcluded = this._isAllChildrenExcluded(selection, item);
      let currentParent = item;
      while (currentParent && allChildrenExcluded) {
         this._unselectNode(selection, currentParent);
         currentParent = currentParent.getParent();
         allChildrenExcluded = this._isAllChildrenExcluded(selection, currentParent);
      }
   }

   private _isAllSelectedInRoot(selection: ISelection): boolean {
      return selection.selected.includes(this._rootId) && selection.excluded.includes(this._rootId);
   }

   private _unselectAllInRoot(selection: ISelection): ISelection {
      const rootInExcluded = selection.excluded.includes(this._rootId);

      let resSelection = selection;
      resSelection = this.unselect(resSelection, this._rootId);
      this._removeChildes(resSelection, this._getRoot());

      if (rootInExcluded) {
         resSelection.excluded = ArraySimpleValuesUtil.removeSubArray(resSelection.excluded, [this._rootId]);
      }

      return resSelection;
   }

   private _isAllSelected(selection: ISelection, nodeId: CrudEntityKey): boolean {
      if (this._selectDescendants || this._isAllSelectedInRoot(selection)) {
         return selection.selected.includes(nodeId) || !selection.excluded.includes(nodeId) &&
            this._hasSelectedParent(nodeId, selection);
      } else {
         return selection.selected.includes(nodeId) && selection.excluded.includes(nodeId);
      }
   }

   private _selectNode(selection: ISelection, node: TreeItem<Model>): void {
      this._selectLeaf(selection, this._getKey(node));

      if (this._selectDescendants) {
         this._removeChildes(selection, node);
      }
   }

   private _unselectNode(selection: ISelection, node: TreeItem<Model>): void {
      this._unselectLeaf(selection, node);

      if (this._selectDescendants) {
         this._removeChildes(selection, node);
      }
   }

   private _selectLeaf(selection: ISelection, leafId: string|number): void {
      if (selection.excluded.includes(leafId)) {
         ArraySimpleValuesUtil.removeSubArray(selection.excluded, [leafId]);
      } else {
         ArraySimpleValuesUtil.addSubArray(selection.selected, [leafId]);
      }
   }

   private _unselectLeaf(selection: ISelection, item: TreeItem<Model>): void {
      const parent = item.getParent();
      const parentId = this._getKey(parent);
      const itemId = this._getKey(item);

      ArraySimpleValuesUtil.removeSubArray(selection.selected, [itemId]);
      if (this._isAllSelected(selection, parentId)) {
         ArraySimpleValuesUtil.addSubArray(selection.excluded, [itemId]);
      }

      if (this._isAllChildrenExcluded(selection, parent) && this._selectAncestors && parentId !== this._rootId) {
         ArraySimpleValuesUtil.addSubArray(selection.excluded, [parentId]);
         ArraySimpleValuesUtil.removeSubArray(selection.selected, [parentId]);
      }
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

   private _getStateNode(node: TreeItem<Model>, initialState: boolean, selection: ISelection): boolean|null {
      const children = node.getChildren(false);
      const listKeys = initialState ? selection.excluded : selection.selected;
      let stateNode = initialState;
      let countChildrenInList: boolean|number|null = 0;

      for (let index = 0; index < children.getCount(); index++) {
         const child = children.at(index);
         const childId = this._getKey(child);
         const childInList = listKeys.includes(childId);

         if (this._isNode(child)) {
            const stateChildNode = this._getStateNode(child, childInList ? !initialState : initialState, selection);

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
         const nodeKey = this._getKey(node);
         const childesFromEntryPath =  this._entryPath
             .filter((item) => item.parent === nodeKey)
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
    * @param node
    * @private
    */
   private _isAllChildrenExcluded(selection: ISelection, node: TreeItem<Model>): boolean {
      if (!node) {
         return false;
      }

      const childes = node.getChildren(false);

      let result = true;

      if (childes.getCount()) {
         for (let i = 0; i < childes.getCount(); i++) {
            const child = childes.at(i);
            const childId = this._getKey(child);
            if (child.getChildren(false).getCount() > 0) {
               result = result && this._isAllChildrenExcluded(selection, child);
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

   private _getAllChildren(node: TreeItem<Model>): Array<TreeItem<Model>> {
      const childes = [];

      node.getChildren(false).each((child) => {
         ArraySimpleValuesUtil.addSubArray(childes, [child]);

         if (this._isNode(child)) {
            ArraySimpleValuesUtil.addSubArray(childes, this._getAllChildren(child));
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
    * @param node
    * @private
    */
   private _getAllChildrenIds(node: TreeItem<Model>): TKeys {
      let childrenIds = this._getAllChildren(node).map((child) => this._getKey(child));

      if (this._entryPath) {
         const nodeId = this._getKey(node);
         this._entryPath.forEach((entryPath) => {
            if ((childrenIds.includes(entryPath.parent) || nodeId === entryPath.parent)
                && !childrenIds.includes(entryPath.id)) {
               childrenIds.push(entryPath.id);
               childrenIds = childrenIds.concat(this._getChildrenIdsInEntryPath(entryPath.id));
            }
         });
      }

      return childrenIds;
   }

   private _isHasChildren(item: TreeItem<Model>): boolean {
      return item.isHasChildren() || item.getChildren(false).getCount() > 0;
   }

   private _getSelectedChildrenCount(node: TreeItem<Model>, selection: ISelection, deep: boolean): number|null {
      if (!node) {
         return 0;
      }

      const children = node.getChildren(false);
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

                  if (this._isNode(childItem) && this._isHasChildren(childItem)) {
                     childNodeSelectedCount = this._getSelectedChildrenCount(childItem, selection, deep);

                     if (childNodeSelectedCount === null) {
                        selectedChildrenCount = null;
                     } else {
                        selectedChildrenCount += childNodeSelectedCount;
                     }
                  }
               }
            }
         });
      } else if (!node || this._isHasChildren(node)) {
         selectedChildrenCount = null;
      }

      return selectedChildrenCount;
   }

   private _removeChildes(selection: ISelection, node: TreeItem<Model>): void {
      const childrenIds = this._getAllChildrenIds(node);
      ArraySimpleValuesUtil.removeSubArray(selection.selected, childrenIds);
      ArraySimpleValuesUtil.removeSubArray(selection.excluded, childrenIds);
   }

   /**
    * Проверяет что элемент узел или скрытый узел
    * @param item
    * @private
    */
   private _isNode(item: TreeItem<Model>|BreadcrumbsItem<Model>): boolean {
      if (item instanceof TreeItem) {
         return item.isNode() !== LEAF;
      } else if (item instanceof BreadcrumbsItem) {
         return true;
      }
      return false;
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
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      if (item['[Controls/_display/BreadcrumbsItem]'] || item.breadCrumbs) {
         // tslint:disable-next-line
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
      if (key === this._rootId) {
         return this._getRoot();
      } else {
         return this._model.getItemBySourceKey(key);
      }
   }

   private _getRoot(): TreeItem<Model> {
      // getRoot возвращает самый верхний узел и его нельзя получить с помощью getItemBySourceKey
      return this._model.getItemBySourceKey(this._rootId) || this._model.getRoot();
   }

   private _getParentKey(key: CrudEntityKey): CrudEntityKey {
      const item = this._model.getItemBySourceKey(key);
      if (!item) {
         return undefined;
      }

      const parent = item.getParent();
      return this._getKey(parent);
   }
}
