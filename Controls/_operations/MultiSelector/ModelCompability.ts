import cInstance = require('Core/core-instance');
import { Collection, Tree as TreeCollection } from 'Controls/display';
import { relation } from 'Types/entity';
import { Record } from 'Types/entity';
import { RecordSet, List } from 'Types/collection';
// @ts-ignore
import { ListViewModel } from 'Controls/list';
// @ts-ignore
import { ViewModel } from 'Controls/treeGrid';


export function isNode(item: Record, model: ViewModel|TreeCollection, hierarchyRelation: relation.Hierarchy): boolean {
   if (cInstance.instanceOfModule(model, 'Controls/display:Tree')) {
      return model.getItemBySourceKey(item.getKey()).isNode();
   } else {
      return hierarchyRelation ? hierarchyRelation.isNode(item) !== null : false;
   }
};

export function isHasChildren(item: Record, model: ViewModel|TreeCollection, hierarchyRelation: relation.Hierarchy): boolean {
   if (cInstance.instanceOfModule(model, 'Controls/display:Tree')) {
      return model.getItemBySourceKey(item.getKey()).isHasChildren();
   } else {
      return hierarchyRelation ? hierarchyRelation.hasDeclaredChildren(item) !== false : false;
   }
};

export function getParentProperty(model: ViewModel|TreeCollection, hierarchyRelation: relation.Hierarchy): string {
   if (cInstance.instanceOfModule(model, 'Controls/display:Tree')) {
      return model.getParentProperty();
   } else {
      return hierarchyRelation && hierarchyRelation.getParentProperty();
   }
};

export function getItems(model: ListViewModel|Collection): RecordSet|List {
   if (cInstance.instanceOfModule(model, 'Controls/display:Collection')) {
      return model.getCollection();
   } else {
      return model.getItems();
   }
};

export function getChildren(nodeId: Tkey, model: ViewModel|TreeCollection, hierarchyRelation: relation.Hierarchy): Array<Record> {
   let children: Array<Record> = [];

   if (cInstance.instanceOfModule(model, 'Controls/display:Tree')) {
      // Корня может и не быть в коллекции, поэтому ищем сами
      let parentProperty: string = model.getParentProperty();

      model.getCollection().forEach((item) => {
         if (item.get(parentProperty) === nodeId) {
            children.push(item);
         }
      });
   } else if (hierarchyRelation) {
      children = hierarchyRelation.getChildren(nodeId, getItems(model));
   }

   return children;
};
