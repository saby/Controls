import ISelectionStrategy from 'Controls/_operations/MultiSelector/SelectionStrategy/ISelectionStrategy';
import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');
import getSelectedChildrenCount from 'Controls/_operations/MultiSelector/getSelectedChildrenCount';
import removeSelectionChildren from 'Controls/_operations/MultiSelector/removeSelectionChildren';
import { isNode, getParentProperty, getItems, getChildren } from 'Controls/_operations/MultiSelector/ModelCompability';
import clone = require('Core/core-clone');
import { Map } from 'Types/shim';

import { relation, Record } from 'Types/entity';
import { Tree as TreeCollection } from 'Controls/display';
import { ViewModel } from 'Controls/treeGrid';
import { RecordSet } from 'Types/collection';
import { TKeySelection as TKey, TKeysSelection as TKeys, ISelectionObject as ISelection } from 'Controls/interface/';

/**
 * Стратегия выбора для иерархического списка, для работы с ним как с плоским.
 * Записи не зависимы между собой, выбор родительских узлов никак не отражается на их детей.
 * @class Controls/_operations/MultiSelector/SelectionStrategy/Tree
 * @control
 * @private
 * @author Капустин И.А.
 */

interface ITreeSelectionStrategyOptions {
   selectAncestors: boolean;
   selectDescendants: boolean;
   nodesSourceControllers?: Object;
}

interface IEntryPath {
   id: String|number|null;
   parent: String|number|null;
}

const FIELD_ENTRY_PATH = 'ENTRY_PATH';

export default class TreeSelectionStrategy implements ISelectionStrategy {
   protected _options: Object;

   constructor(options: ITreeSelectionStrategyOptions) {
      this._options = options;
   }

   select(selection: ISelection, keys: TKeys, model: TreeCollection|ViewModel, hierarchyRelation: relation.Hierarchy): ISelection {
      selection = clone(selection);

      keys.forEach((key) => {
         let item: Record = getItems(model).getRecordById(key);

         if (!item || isNode(item, model, hierarchyRelation)) {
            this._selectNode(selection, key, model, hierarchyRelation);
         } else {
            this._selectLeaf(selection, key, model, hierarchyRelation);
         }
      });

      return selection;
   }

   unSelect(selection: ISelection, keys: TKeys, model: TreeCollection|ViewModel, hierarchyRelation: relation.Hierarchy): ISelection {
      selection = clone(selection);

      keys.forEach((key) => {
         let item: Record = getItems(model).getRecordById(key);

         if (!item || isNode(item, model, hierarchyRelation)) {
            this._unSelectNode(selection, key, model, hierarchyRelation);
         } else {
            this._unSelectLeaf(selection, key, model, hierarchyRelation);
         }
      });

      return selection;
   }

   getCount(selection: ISelection, model: TreeCollection|ViewModel, limit: number, hierarchyRelation: relation.Hierarchy): number|null {
      let countItemsSelected: number|null = 0;
      let rootId: TKey = this._getRoot(model);
      let selectedNodes: TKeys = [];

      if (!this.isAllSelected(selection, rootId, model, hierarchyRelation) || !model.getHasMoreData()) {
         if (this._options.selectDescendants) {
            let items: RecordSet = getItems(model);

            for (let index = 0; index < selection.selected.length; index++) {
               let itemId: TKey = selection.selected[index];
               let item: Record = items.getRecordById(itemId);

               if (!item || isNode(item, model, hierarchyRelation)) {
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
            let nodeKey: TKey = selectedNodes[index];
            let countItemsSelectedInNode: number|null = getSelectedChildrenCount(
               nodeKey, selection, model, hierarchyRelation, this._options.selectDescendants);

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

   getSelectionForModel(selection: ISelection, model: TreeCollection|ViewModel, limit: number, keyProperty: string, hierarchyRelation: relation.Hierarchy): Map<TKey, boolean> {
      const selectionResult = new Map();
      const selectedKeysWithEntryPath = this._mergeEntryPath(selection.selected, getItems(model));

      getItems(model).forEach((item) => {
         const itemId: TKey = item.getId();
         const parentId = this._getParentId(itemId, model, hierarchyRelation);
         let isSelected = !selection.excluded.includes(itemId) && (selection.selected.includes(itemId) ||
            this.isAllSelected(selection, parentId, model, hierarchyRelation));

         if (this._options.selectAncestors && isNode(item, model, hierarchyRelation)) {
            isSelected = this._getStateNode(itemId, isSelected, {
               selected: selectedKeysWithEntryPath,
               excluded: selection.excluded
            }, model, hierarchyRelation);

            if (!isSelected && (selectedKeysWithEntryPath.includes(itemId))) {
               isSelected = null;
            }
         }

         if (isSelected !== false) {
            selectionResult.set(item.getId(), isSelected);
         }
      });

      return selectionResult;
   }

   isAllSelected(selection: ISelection, nodeId: TKey, model: TreeCollection|ViewModel, hierarchyRelation: relation.Hierarchy): boolean {
      if (this._options.selectDescendants) {
         return selection.selected.includes(nodeId) || !selection.excluded.includes(nodeId) &&
            this._hasSelectedParent(nodeId, selection, model, hierarchyRelation);
      } else {
         return selection.selected.includes(nodeId) && selection.excluded.includes(nodeId);
      }
   }

   protected _selectNode(selection: ISelection, nodeId: Tkey, model: TreeCollection|ViewModel, hierarchyRelation: relation.Hierarchy): void {
      this._selectLeaf(...arguments);

      if (this._options.selectDescendants) {
         removeSelectionChildren(selection, nodeId, model, hierarchyRelation);
      }
   }

   protected _unSelectNode(selection: ISelection, nodeId: Tkey, model: TreeCollection|ViewModel, hierarchyRelation: relation.Hierarchy): void {
      this._unSelectLeaf(...arguments);

      if (this._options.selectDescendants) {
         removeSelectionChildren(selection, nodeId, model, hierarchyRelation);
      }
   }

   private _selectLeaf(selection: ISelection, leafId: string|number): void {
      if (selection.excluded.includes(leafId)) {
         ArraySimpleValuesUtil.removeSubArray(selection.excluded, [leafId]);
      } else {
         ArraySimpleValuesUtil.addSubArray(selection.selected, [leafId]);
      }
   }

   private _unSelectLeaf(selection: ISelection, leafId: string|number, model: TreeCollection|ViewModel, hierarchyRelation: relation.Hierarchy): void {
      let parentId: TKey|undefined = this._getParentId(leafId, model, hierarchyRelation);

      ArraySimpleValuesUtil.removeSubArray(selection.selected, [leafId]);
      if (this.isAllSelected(selection, parentId, model, hierarchyRelation)) {
         ArraySimpleValuesUtil.addSubArray(selection.excluded, [leafId]);
      }
   }

   private _getRoot(model: TreeCollection|ViewModel): TKey {
      return model.getRoot().getContents();
   }

   private _getParentId(itemId: Tkey, model: ViewModel|TreeCollection, hierarchyRelation: relation.Hierarchy): TKey|undefined {
      let parentProperty: string = getParentProperty(model, hierarchyRelation);
      let item: Record|undefined = getItems(model).getRecordById(itemId);

      return item && item.get(parentProperty);
   }

   private _mergeEntryPath(selectedKeys: TKeys, items: RecordSet): TKeys {
      let entryPathObject: Object = {};
      let entryPath: Array<IEntryPath> = items.getMetaData()[FIELD_ENTRY_PATH];
      let selectedKeysWithEntryPath: TKeys = selectedKeys.slice();

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

               if (!selectedKeys.includes(keyItem)) {
                  selectedKeysWithEntryPath.push(keyItem);
               }
            }
         });
      }

      return selectedKeysWithEntryPath;
   }

   private _hasSelectedParent(key: Tkey, selection: ISelection, model: ViewModel|TreeCollection, hierarchyRelation: relation.Hierarchy): boolean {
      let
         hasSelectedParent: boolean = false,
         hasExcludedParent: boolean = false,
         currentParentId: Tkey|undefined = this._getParentId(key, model, hierarchyRelation);

      for (; currentParentId !== null && currentParentId !== undefined; currentParentId = this._getParentId(currentParentId, model, hierarchyRelation)) {
         if (selection.selected.includes(currentParentId)) {
            hasSelectedParent = true;
            break;
         } else if (selection.excluded.includes(currentParentId)) {
            hasExcludedParent = true;
            break;
         }
      }

      if (!hasExcludedParent && !currentParentId && selection.selected.includes(null)) {
         hasSelectedParent = true;
      }

      return hasSelectedParent;
   }

   private _getStateNode(itemId: Tkey, initialState: boolean, selection: ISelection, model: ViewModel|TreeCollection, hierarchyRelation: relation.Hierarchy): boolean|null {
      let stateNode: boolean|null = initialState;
      let sourceController = this._options.nodesSourceControllers.get(itemId);
      let hasMoreData: boolean|void = sourceController ? sourceController.hasMoreData('down') : true;
      let children: Array<Record> = getChildren(itemId, model, hierarchyRelation);
      let listKeys = initialState ? selection.excluded : selection.selected;
      let countChildrenInList: boolean|null = 0;

      for (let index = 0; index < children.length; index++) {
         let child: Record = children[index];
         let childId: Tkey = child.getId();
         let childInList = listKeys.includes(childId);

         if (isNode(child, model, hierarchyRelation)) {
            let stateChildNode = this._getStateNode(childId, childInList ? !initialState : initialState, selection, model, hierarchyRelation);

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
         if (countChildrenInList === children.length && !hasMoreData) {
            stateNode = !stateNode;
         } else {
            stateNode = null;
         }
      }

      return stateNode;
   }
}
