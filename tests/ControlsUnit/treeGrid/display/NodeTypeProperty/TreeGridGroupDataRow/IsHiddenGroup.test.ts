import {assert} from 'chai';
import {TreeGridCollection} from 'Controls/treeGrid';
import {RecordSet} from 'Types/collection';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/treeGrid/display/NodeTypeProperty/TreeGridGroupDataRow/IsHiddenGroup', () => {
    let recordSet: RecordSet;

    function getCollection(): TreeGridCollection {
        return new TreeGridCollection({
            nodeTypeProperty: 'nodeType',
            columns: [],
            collection: recordSet
        });
    }

    beforeEach(() => {
        recordSet = new RecordSet({
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
    });

    it('should mark the only group as hidden', () => {
        assert.isTrue(getCollection().at(0).isHiddenGroup());
    });

    it('should change group visibility on append', () => {
        const collection = getCollection();
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

        recordSet.append(newItems);

        assert.isFalse(collection.at(0).isHiddenGroup());
    });

    it('should change group visibility on delete', () => {
        recordSet = new RecordSet({
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
        const collection = getCollection();
        assert.isFalse(collection.at(0).isHiddenGroup());

        recordSet.removeAt(3);

        assert.isFalse(collection.at(0).isHiddenGroup());

        recordSet.removeAt(2);

        assert.isTrue(collection.at(0).isHiddenGroup());
    });

    it('getItemClasses', () => {
        const itemClasses = getCollection().at(0).getItemClasses({
            style: 'default'
        });
        CssClassesAssert.include(itemClasses, 'controls-ListView__groupHidden');
        CssClassesAssert.notInclude(itemClasses, [
            'controls-ListView__group', 'controls-ListView__group',
            'controls-Grid__row', 'controls-Grid__row_default']);
    });
});
