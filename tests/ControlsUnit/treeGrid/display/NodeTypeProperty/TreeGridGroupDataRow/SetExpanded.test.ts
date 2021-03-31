import {assert} from 'chai';
import {Model} from 'Types/entity';
import {TreeGridCollection, TreeGridGroupDataRow, TreeGridGroupDataCell} from 'Controls/treeGridNew';

describe('Controls/treeGrid/display/NodeTypeProperty/TreeGridGroupDataRow/SetExpanded', () => {

    const owner = {
        getStickyColumnsCount: () => 0,
        hasMultiSelectColumn: () => false,
        notifyItemChange: () => {},
        hasItemActionsSeparatedCell: () => false
    } as undefined as TreeGridCollection<any>;

    const groupRow = new TreeGridGroupDataRow({
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

    it('setExpanded set expanded state to columns', () => {
        groupRow.getColumns().forEach((column: TreeGridGroupDataCell<Model>) => {
            assert.isFalse(column.isExpanded());
        });

        groupRow.setExpanded(true);
        groupRow.getColumns().forEach((column: TreeGridGroupDataCell<Model>) => {
            assert.isTrue(column.isExpanded());
        });
    });
});
