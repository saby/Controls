import {assert} from 'chai';
import {RecordSet} from 'Types/collection';
import {TreeGridCollection} from 'Controls/treeGrid';

describe('Controls/treeGrid/display/NodeTypeProperty/TreeGridCollection/NodeTypeProperty', () => {
    let collection: TreeGridCollection<any>;
    const recordSet = new RecordSet({
        rawData: [],
        keyProperty: 'id'
    });

    it('Set nodeTypeProperty using setter', () => {
        collection = new TreeGridCollection({
            columns: [],
            collection: recordSet
        });

        assert.equal(collection.getNodeTypeProperty(), undefined);
        assert.strictEqual(collection.getVersion(), 1);

        collection.setNodeTypeProperty('nodeType');

        assert.equal(collection.getNodeTypeProperty(), 'nodeType');
        assert.strictEqual(collection.getVersion(), 2);
    });

    it('Set nodeTypeProperty via constructor', () => {
        collection = new TreeGridCollection({
            nodeTypeProperty: 'nodeType',
            columns: [],
            collection: recordSet
        });
        assert.equal(collection.getNodeTypeProperty(), 'nodeType');
    });
});
