import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');
import getChildrenIds from 'Controls/_operations/MultiSelector/getChildrenIds';

import { relation } from 'Types/entity';
import { Tree as TreeCollection } from 'Controls/display';
// @ts-ignore
import { ViewModel } from 'Controls/treeGrid';
// @ts-ignore
import { TKeysSelection as TKeys, ISelectionObject as ISelection } from 'Controls/interface/';

export default function removeSelectionChildren(selection: ISelection, nodeId: Tkey, model: ViewModel|TreeCollection, hierarchyRelation: relation.Hierarchy): void {
   let childrenIds: TKeys = getChildrenIds(nodeId, model, hierarchyRelation);

   ArraySimpleValuesUtil.removeSubArray(selection.selected, childrenIds);
   ArraySimpleValuesUtil.removeSubArray(selection.excluded, childrenIds);
};
