import { TreeGridCollection } from 'Controls/treeGridNew';
import { assert } from 'chai';
import { RecordSet } from 'Types/collection';

const RAW_DATA = [
    { key: 1, parent: null, type: true },
    { key: 2, parent: 1, type: true },
    { key: 3, parent: 2, type: null }
];

describe('Controls/treeGrid_clean/Display/TreeCollection', () => {
    it('Restore expandedItems after reset collection', () => {
        const recordSet = new RecordSet({
            rawData: [ { key: 1, parent: null, type: true } ],
            keyProperty: 'key'
        });

        const treeGridCollection = new TreeGridCollection({
            collection: recordSet,
            keyProperty: 'key',
            parentProperty: 'parent',
            nodeProperty: 'type',
            root: null,
            columns: [{}],
            expandedItems: [1]
        });

        recordSet.merge(new RecordSet({
            rawData: RAW_DATA,
            keyProperty: 'key'
        }));
        assert.strictEqual(treeGridCollection.getCount(), 3);
    });
});
