import {RecordSet} from 'Types/collection';
import {relation} from 'Types/entity';
import {ISelectionObject} from 'Controls/interface';

export interface IHierarchyRemoveStrategyOptions {
    keyProperty?: string;
    parentProperty?: string;
    nodeProperty?: string;
    selection: ISelectionObject;
    silent?: boolean;
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

        HierarchyRemoveStrategy._setEventRaising(false, items, options.silent);
        let item;
        selected.forEach((key) => {
            item = items.getRecordById(key);
            if (item) {
                this._hierarchyRemove(items, options.selection, hierarchy, [item]);
            }
        });
        HierarchyRemoveStrategy._setEventRaising(true, items, options.silent);
    }

    protected _hierarchyRemove(items: RecordSet, selection, hierarchy: relation.Hierarchy, children) {
        let key;
        let isNode;
        children.forEach((item) => {
            key = item.getKey();
            isNode = hierarchy.isNode(item);
            if (isNode !== null && isNode !== undefined) {
                this._hierarchyRemove(items, selection, hierarchy, hierarchy.getChildren(key, items));
                if (!(selection.excluded.includes(key) && selection.selected.includes(key))) {
                    items.remove(item);
                }
            } else {
                items.remove(item);
            }
        });
    }

    private static _setEventRaising(enabled: boolean, items: RecordSet, silent: boolean) {
        if (!silent) {
            items.setEventRaising(enabled, true);
        }
    }
}
