import {assert} from "chai";
import {GridCollection, GridEmptyRow} from 'Controls/gridNew';

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
                isFullGridSupport: () => true
            } as GridCollection<unknown>,
            emptyTemplate: () => 'EMPTY_TEMPLATE'
        });

        const emptyColumns = emptyRow.getColumns();
        assert.equal(emptyColumns.length, 1);
        assert.equal(emptyColumns[0].getColspan(), 'grid-column: 1 / 5;')
    });
});
