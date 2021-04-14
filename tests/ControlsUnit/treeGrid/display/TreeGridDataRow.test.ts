import { assert } from 'chai';
import {RecordSet} from "Types/collection";
import {TreeGridCollection, TreeGridDataRow} from "Controls/treeGrid";

describe('Controls/treeGrid/Display/TreeGridDataRow', () => {
    const recordSet = new RecordSet({
        rawData: [
            {
                id: 1,
                parent: null,
                node: true,
                hasChildren: true
            },
            {
                id: 2,
                parent: 1,
                node: false,
                hasChildren: false
            }
        ],
        keyProperty: 'id'
    });

    describe('isLastItem', () => {
        it('should ignore TreeGridNodeFooterRow item from collection', () => {
            const treeGridCollection = new TreeGridCollection({
                collection: recordSet,
                root: null,
                keyProperty: 'id',
                parentProperty: 'parent',
                nodeProperty: 'node',
                hasChildrenProperty: 'hasChildren',
                columns: [{width: '1px'}],
                expandedItems: [null]
            });
            // Длина всех элементов в коллекции = 4 (Две ноды и к ним два футера)
            assert.equal(treeGridCollection.getItems().length, 4);
            assert.isTrue((treeGridCollection.at(1) as TreeGridDataRow).isLastItem());
        });
    });
});
