import {RecordSet} from 'Types/collection';
import {relation} from 'Types/entity';
import {ISelectionObject} from 'Controls/interface';

export interface IHierarchyRemoveStrategyOptions {
    keyProperty?: string;
    parentProperty?: string;
    nodeProperty?: string;
    selection: ISelectionObject;
}

export default class HierarchyRemoveStrategy {
    remove(items: RecordSet, options: IHierarchyRemoveStrategyOptions): void {
        this._removeFromRecordSet(items, options)
    }

    protected _removeFromRecordSet(items: RecordSet, options) {
        const hierarchy = new relation.Hierarchy({
            keyProperty: options.keyProperty,
            parentProperty: options.parentProperty,
            nodeProperty: options.nodeProperty
        });
        const selected = options.selection.selected;

        items.setEventRaising(false, true);
        let item;
        selected.forEach((key) => {
            item = items.getRecordById(key);
            if (item) {
                this._hierarchyRemove(items, options.selection.excluded, hierarchy, [item]);
            }
        });
        items.setEventRaising(true, true);
    }

    protected _hierarchyRemove(items: RecordSet, excluded, hierarchy: relation.Hierarchy, children) {
        let key;
        children.forEach((item) => {
            key = item.getKey();
            if (hierarchy.isNode(item) !== null) {
                this._hierarchyRemove(items, excluded, hierarchy, hierarchy.getChildren(key, items));
                if (!excluded.includes(key)) {
                    items.remove(item);
                }
            } else {
                items.remove(item);
            }
        });
    }
}
