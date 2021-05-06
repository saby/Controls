import {assert} from 'chai';
import {Model} from 'Types/entity';
import {TreeGridCollection, TreeGridGroupDataRow, TreeGridGroupDataCell} from 'Controls/treeGrid';

describe('Controls/treeGrid/display/NodeTypeProperty/TreeGridGroupDataRow/SetExpanded', () => {

    const owner = {
        getStickyColumnsCount: () => 0,
        hasMultiSelectColumn: () => false,
        notifyItemChange: () => {},
        hasItemActionsSeparatedCell: () => false,
        isFullGridSupport: () => true,
        hasColumnScroll: () => false
    } as undefined as TreeGridCollection<any>;

    const columns = [
        { width: '100px' }
    ];
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
        columns,
        owner: {
            ...owner,
            getColumnsConfig: () => columns
        }
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
