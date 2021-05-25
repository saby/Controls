import {assert} from 'chai';
import {TreeGridCollection} from 'Controls/treeGrid';
import {RecordSet} from 'Types/collection';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/treeGrid/display/NodeTypeProperty/TreeGridGroupDataRow/IsHiddenGroup', () => {
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
                parent: 1,
                node: true,
                hasChildren: false
            },
            {
                id: 3,
                parent: 1,
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

    it('should mark the only group as hidden', () => {
        assert.isTrue(collection.at(0).isHiddenGroup());
    });

    it('getItemClasses', () => {
        const itemClasses = collection.at(0).getItemClasses({
            style: 'default'
        });
        CssClassesAssert.include(itemClasses, 'controls-ListView__groupHidden');
        CssClassesAssert.notInclude(itemClasses, [
            'controls-ListView__group', 'controls-ListView__group',
            'controls-Grid__row', 'controls-Grid__row_default']);
    });
});
