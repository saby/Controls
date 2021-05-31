import {assert} from 'chai';
import {TreeGridCollection} from 'Controls/treeGrid';
import {RecordSet} from 'Types/collection';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/treeGrid/display/NodeTypeProperty/TreeGridGroupDataRow/IsHiddenGroup', () => {
    function getRecordSet(): RecordSet {
        return new RecordSet({
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
                    parent: 1,
                    node: null
                }
            ],
            keyProperty: 'id'
        });
    }

    function getCollection(options?: any): TreeGridCollection<any, any> {
        return new TreeGridCollection({
            ...options,
            nodeTypeProperty: 'nodeType',
            columns: [],
            collection: options?.collection || getRecordSet()
        });
    }

    it('the only group should not be hidden +groupNodeVisibility=undefined, +singleGroupNode=undefined', () => {
        assert.isFalse(getCollection().at(0).isHiddenGroup());
    });

    it('the only group should not be hidden, +groupNodeVisibility=visible, +singleGroupNode=true', () => {
        const recordSet = getRecordSet();
        recordSet.setMetaData({
            singleGroupNode: true
        });
        const collection = getCollection({
            groupNodeVisibility: 'visible',
            collection: recordSet
        });
        assert.isFalse(collection.at(0).isHiddenGroup());
    });

    it('the only group should not be hidden, +groupNodeVisibility=hasdata, +singleGroupNode=false', () => {
        const recordSet = getRecordSet();
        recordSet.setMetaData({
            singleGroupNode: false
        });
        const collection = getCollection({
            groupNodeVisibility: 'hasdata',
            collection: recordSet
        });
        assert.isFalse(collection.at(0).isHiddenGroup());
    });

    it('the only group should be hidden, +groupNodeVisibility=hasdata, +singleGroupNode=true', () => {
        const recordSet = getRecordSet();
        recordSet.setMetaData({
            singleGroupNode: true
        });
        const collection = getCollection({
            groupNodeVisibility: 'hasdata',
            collection: recordSet
        });
        assert.isTrue(collection.at(0).isHiddenGroup());
    });

    it('should change group visibility on append', () => {
        const recordSet = getRecordSet();
        recordSet.setMetaData({
            singleGroupNode: true
        });
        const collection = getCollection({
            groupNodeVisibility: 'hasdata',
            collection: recordSet
        });
        assert.isTrue(collection.at(0).isHiddenGroup());

        const newItems = new RecordSet({
            rawData: [
                {
                    id: 3,
                    nodeType: 'group',
                    parent: null,
                    node: true,
                    hasChildren: false
                },
                {
                    id: 4,
                    parent: 3,
                    node: null
                }
            ]
        });

        recordSet.setMetaData({
            singleGroupNode: false
        });
        recordSet.append(newItems);

        assert.isFalse(collection.at(0).isHiddenGroup());
    });

    it('should change group visibility on delete', () => {
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
                    parent: 1,
                    node: null
                },
                {
                    id: 3,
                    nodeType: 'group',
                    parent: null,
                    node: true,
                    hasChildren: false
                },
                {
                    id: 4,
                    parent: 3,
                    node: null
                }
            ],
            keyProperty: 'id'
        });
        recordSet.setMetaData({
            singleGroupNode: false
        });

        const collection = getCollection({
            groupNodeVisibility: 'hasdata',
            collection: recordSet
        });
        assert.isFalse(collection.at(0).isHiddenGroup());

        recordSet.removeAt(3);
        recordSet.setMetaData({
            singleGroupNode: true
        });
        recordSet.removeAt(2);

        assert.isTrue(collection.at(0).isHiddenGroup());
    });

    it('getItemClasses', () => {
        const recordSet = getRecordSet();
        recordSet.setMetaData({
            singleGroupNode: true
        });
        const collection = getCollection({
            groupNodeVisibility: 'hasdata',
            collection: recordSet
        });
        const itemClasses = collection.at(0).getItemClasses({
            style: 'default'
        });
        CssClassesAssert.include(itemClasses, 'controls-ListView__groupHidden');
        CssClassesAssert.notInclude(itemClasses, [
            'controls-ListView__group', 'controls-ListView__group',
            'controls-Grid__row', 'controls-Grid__row_default']);
    });
});
