import {assert} from "chai";
import {GridCollection, GridEmptyRow} from 'Controls/grid';

describe('Controls/grid_clean/Display/EmptyTemplate/EmptyRow', () => {
    const columns = [
        { displayProperty: 'col1' },
        { displayProperty: 'col2' },
        { displayProperty: 'col3' }
    ];

    it('should not add multiselect column to colspaned empty row', () => {
        const emptyRow = new GridEmptyRow({
            owner: {
                getColumnsConfig: () => columns,
                hasMultiSelectColumn: () => true,
                getStickyColumnsCount: () => {},
                isFullGridSupport: () => true,
                hasItemActionsSeparatedCell: () => false,
                hasColumnScroll: () => false
            } as GridCollection<unknown>,
            rowTemplate: () => 'EMPTY_TEMPLATE'
        });

        const emptyColumns = emptyRow.getColumns();
        assert.equal(emptyColumns.length, 1);
        assert.equal(emptyColumns[0].getColspan(), 4);
    });
});
