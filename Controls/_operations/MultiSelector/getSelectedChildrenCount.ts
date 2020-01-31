import { Tree as TreeCollection } from 'Controls/display';
import { isNode, isHasChildren, getItems, getChildren } from 'Controls/_operations/MultiSelector/ModelCompability';

import { relation, Record } from 'Types/entity';
import { RecordSet, List } from 'Types/collection';
import { ViewModel } from 'Controls/treeGrid';
import { TKeySelection as TKey, TKeysSelection as TKeys, ISelectionObject as ISelection } from 'Controls/interface/';

// Возвращает кол-во выбранных записей в папке, идет в глубь(deep !== false) до первого исключения
export default function getSelectedChildrenCount(nodeId: Tkey, selection: ISelection, model: ViewModel|TreeCollection, hierarchyRelation: relation.Hierarchy, deep: boolean): number|null {
   let countSelectedChildren: number|null = 0;
   let nodeItem: Record = getItems(model).getRecordById(nodeId);
   let children: Array<Record> = getChildren(nodeId, model, hierarchyRelation);

   if (children.length) {
      for (let index = 0; index < children.length; index++) {
         let childItem: Record = children[index];
         let childId: Tkey = childItem.getId();

         if (!selection.excluded.includes(childId)) {
            if (isNode(childItem, model, hierarchyRelation) && isHasChildren(childItem, model, hierarchyRelation) && deep !== false) {
               let countSelectedChildren2: number|null = getSelectedChildrenCount(childId, selection, model, hierarchyRelation);

               if (countSelectedChildren2 === null) {
                  countSelectedChildren = null;
                  break;
               } else {
                  countSelectedChildren += countSelectedChildren2;
               }

               // Если у выбранного узла есть дети и все они в excluded, то сам узел тоже считаем как не выбранный
               if (countSelectedChildren2 !== 0) {
                  countSelectedChildren++;
               }
            } else {
               countSelectedChildren++;
            }
         }
      }
   } else if (!nodeItem || isHasChildren(nodeItem, model, hierarchyRelation)) {
      countSelectedChildren = null;
   }

   return countSelectedChildren;
};
