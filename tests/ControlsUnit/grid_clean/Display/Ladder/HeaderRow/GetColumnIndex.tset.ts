import { assert } from 'chai';
import { GridHeaderRow, GridHeaderCell } from 'Controls/grid';

describe('Controls/grid_clean/Display/Ladder/HeaderRow/GetColumnIndex', () => {
    let columns = [{}, {}, {}];
    const header = [{}, {}, {}];

    const mockedHeaderOwner = {
        getStickyColumnsCount: () => 0,
        hasMultiSelectColumn: () => false,
        getColumnsConfig: () => columns,
        getHeaderConfig: () => header,
        hasItemActionsSeparatedCell: () => false,
        getLeftPadding: () => 's',
        getRightPadding: () => 's',
        isStickyHeader: () => false,
        hasColumnScroll: () => false,
        isSticked: () => false
    };

    const mockedHeaderModel = {
        isMultiline: () => false,
        isSticked: () => false
    };

    it('first not-ladder cell must have index 0', () => {
        columns = [{stickyProperty: ['first']}, {}, {}];
        const headerRow = new GridHeaderRow({
            header,
            headerModel: mockedHeaderModel,
            columns,
            owner: mockedHeaderOwner
        });
        const firstHeaderCell = headerRow.getColumns()[1] as GridHeaderCell<unknown>;
        assert.equal(headerRow.getColumnIndex(firstHeaderCell), 0);
    });
});
