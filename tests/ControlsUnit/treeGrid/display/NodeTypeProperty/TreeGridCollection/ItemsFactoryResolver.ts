import {assert} from 'chai';
import {RecordSet} from 'Types/collection';
import {TreeGridCollection, TreeGridDataRow, TreeGridGroupDataRow} from 'Controls/treeGrid';

describe('Controls/treeGrid/display/NodeTypeProperty/TreeGridCollection/ItemsFactoryResolver', () => {
    let collection: TreeGridCollection<any>;
    const recordSet = new RecordSet({
        rawData: [
            {
                id: 1,
                nodeType: 'group',
                parent: null,
                node: true,
                hasChildren: false
            },
            {
                id: 2,
                nodeType: 'wrong',
                parent: null,
                node: true,
                hasChildren: false
            },
            {
                id: 3,
                parent: null,
                node: true,
                hasChildren: false
            }
        ],
        keyProperty: 'id'
    });

    beforeEach(() => {
        collection = new TreeGridCollection({
            nodeTypeProperty: 'nodeType',
            columns: [],
            collection: recordSet
        });
    });

    describe('.items', () => {
        it('First element should be TreeGridGroupDataRow', () => {
            assert.instanceOf(collection.at(0), TreeGridGroupDataRow);
        });

        it('Second element should be TreeGridDataRow', () => {
            assert.instanceOf(collection.at(1), TreeGridDataRow);
        });

        it('Third element should be TreeGridDataRow', () => {
            assert.instanceOf(collection.at(2), TreeGridDataRow);
        });
    });
});
