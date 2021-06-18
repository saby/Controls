import {assert} from 'chai';
import {TreeGridCollection, TreeGridGroupDataRow} from 'Controls/treeGrid';
import {Model} from 'Types/entity';
import {IColumn} from "Controls/grid";

describe('Controls/treeGrid/display/NodeTypeProperty/TreeGridGroupDataRow/GetColumns', () => {
    let groupRow: TreeGridGroupDataRow<Model>;
    let multiSelectVisibility: string;
    const columns: IColumn[] = [
        { width: '100px' }
    ];
    const owner = {
        getNavigation: () => {},
        getItems: () => ([groupRow]),
        getCount: () => 1,
        getRootLevel: () => 0,
        getCollectionCount: () => 1,
        getSourceIndexByItem: () => 0,
        isLastItem: () => true,
        isStickyHeader: () => true,
        hasColumnScroll: () => false,
        getColumnsConfig: () => columns,
        hasMultiSelectColumn: () => multiSelectVisibility,
        isFullGridSupport: () => true,
        hasItemActionsSeparatedCell: () => false
    } as undefined as TreeGridCollection<any>;

    function getGroupRow(): TreeGridGroupDataRow<Model> {
        return new TreeGridGroupDataRow({
            rowTemplate: (): string => '',
            rowTemplateOptions: () => ({}),
            isHiddenGroup: false,
            multiSelectVisibility,
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
            isLastItem: true,
            owner
        });
    }

    beforeEach(() => {
        multiSelectVisibility = 'hidden';
    });

    it('multiSelectVisibility=visible, total columns count should be 1', () => {
        multiSelectVisibility = 'visible';
        groupRow = getGroupRow();
        assert.equal(groupRow.getColumnsCount(),1);
    });

    it('multiSelectVisibility=visible, colspan should be 1 / 3', () => {
        multiSelectVisibility = 'visible';
        groupRow = getGroupRow();
        const columns = groupRow.getColumns();
        assert.equal(columns[0].getColspanStyles(), 'grid-column: 1 / 3;');
    });
});
