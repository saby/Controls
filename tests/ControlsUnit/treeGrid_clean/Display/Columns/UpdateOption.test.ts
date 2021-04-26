import { TreeGridCollection } from 'Controls/treeGrid';
import { assert } from 'chai';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';

const RAW_DATA = [
    { key: 1, parent: null, type: true },
    { key: 2, parent: 1, type: true },
    { key: 3, parent: 2, type: null }
];

describe('Controls/treeGrid_clean/Display/Columns/UpdateOption', () => {
    it('Update columns for collapsed items', () => {
        const recordSet = new RecordSet({
            rawData: [
                { key: 1, parent: null, type: true },
                { key: 2, parent: 1, type: true },
                { key: 3, parent: 2, type: null }
            ],
            keyProperty: 'key'
        });

        const treeGridCollection = new TreeGridCollection({
            collection: recordSet,
            keyProperty: 'key',
            parentProperty: 'parent',
            nodeProperty: 'type',
            root: null,
            columns: [{}, {}, {}],
            expandedItems: [1]
        });

        assert.strictEqual(treeGridCollection.at(1).getColumns().length, 3);

        treeGridCollection.setExpandedItems([]);
        treeGridCollection.setColumns([{}, {}, {}, {}, {}]);
        treeGridCollection.setExpandedItems([1]);
        assert.strictEqual(treeGridCollection.at(1).getColumns().length, 5);
    });
});
