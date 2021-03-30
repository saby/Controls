import {assert} from 'chai';
import {Model} from 'Types/entity';
import {TreeItem} from 'Controls/display';
import {TreeGridCollection, TreeGridDataRow, TreeGridGroupDataRow} from 'Controls/treeGridNew';

describe('Controls/treeGrid/display/NodeTypeProperty/TreeGridDataRow/ShouldDisplayExpanderPadding', () => {
    const owner = {
        getExpanderIcon: () => 'testIcon',
        getExpanderPosition: () => 'default',
        getExpanderSize: () => undefined,
        getExpanderVisibility: () => 'visible'
    } as undefined as TreeGridCollection<any>;

    const root = new TreeItem({
        contents: null,
        owner
    });

    it('should return false when direct parent is TreeGridGroupDataRow', () => {
        const parent = new TreeGridGroupDataRow({
            contents: new Model({
                rawData: {
                    id: 1,
                    nodeType: 'group',
                    parent: null,
                    node: true,
                    hasChildren: true
                },
                keyProperty: 'id'
            }),
            columns: [],
            owner,
            parent: root
        });
        const child = new TreeGridDataRow({
            contents: new Model({
                rawData: {
                    id: 11,
                    nodeType: null,
                    parent: 1,
                    node: true,
                    hasChildren: true
                },
                keyProperty: 'id'
            }),
            columns: [],
            parent,
            owner
        });
        assert.isFalse(child.shouldDisplayExpanderPadding(null, null));
    });

    it('should return true when direct parent is not TreeGridGroupDataRow', () => {
        const parent = new TreeGridDataRow({
            contents: new Model({
                rawData: {
                    id: 11,
                    nodeType: null,
                    parent: null,
                    node: true,
                    hasChildren: true
                },
                keyProperty: 'id'
            }),
            columns: [],
            parent: root,
            owner
        });
        const child = new TreeGridDataRow({
            contents: new Model({
                rawData: {
                    id: 111,
                    nodeType: null,
                    parent: 11,
                    node: true,
                    hasChildren: false
                },
                keyProperty: 'id'
            }),
            columns: [],
            parent,
            owner
        });
        assert.isTrue(child.shouldDisplayExpanderPadding(null, null));
    });
});
