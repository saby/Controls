import {assert} from 'chai';
import {Model} from 'Types/entity';
import {TreeGridCollection, TreeGridGroupDataRow} from 'Controls/treeGridNew';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/treeGrid/display/NodeTypeProperty/TreeGridGroupDataRow/GetItemClasses', () => {
    let groupRow: TreeGridGroupDataRow<Model>;
    const owner = {
        getNavigation: () => {},
        getItems: () => ([groupRow]),
        getCount: () => 1,
        getRootLevel: () => 0
    } as undefined as TreeGridCollection<any>;

    groupRow = new TreeGridGroupDataRow({
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
        columns: [
            { width: '100px' }
        ],
        owner
    });

    it('getItemClasses() should return classes for group item', () => {
        CssClassesAssert.isSame(groupRow.getItemClasses({ theme: 'default' }), [
            'controls-ListView__itemV',
            'controls-Grid__row',
            'controls-Grid__row_undefined_theme-default',
            'controls-ListView__itemV_cursor-pointer',
            'controls-Grid__row_last',
            'controls-ListView__group'].join(' '));
    });
});
