import { assert } from 'chai';
import { GridTableHeaderRow } from 'Controls/grid';

const THEME = 'UnitTests';

describe('Controls/grid_clean/Display/MultiHeader/TableHeaderRow/hasMultiselectColumn', () => {
    const columns = [{}, {}, {}];
    const header = [{}, {}, {}];
    let rowIndex = 0;
    let hasMultiSelectColumn = true;
    const mockedHeaderOwner = {
        getStickyColumnsCount: () => 0,
        hasMultiSelectColumn: () => hasMultiSelectColumn,
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
        isMultiline: () => true,
        isSticked: () => false,
        getRowIndex: () => rowIndex
    };
    it('first row, owner has multiselect column', () => {
        rowIndex = 0;
        hasMultiSelectColumn = true;
        const headerRow = new GridTableHeaderRow({
            header,
            headerModel: mockedHeaderModel,
            columns,
            owner: mockedHeaderOwner
        });
        assert.isTrue(headerRow.hasMultiSelectColumn(), 'first row has the multiselect column if owner does');
    });
    it('first row, owner has no multiselect column', () => {
        rowIndex = 0;
        hasMultiSelectColumn = false;
        const headerRow = new GridTableHeaderRow({
            header,
            headerModel: mockedHeaderModel,
            columns,
            owner: mockedHeaderOwner
        });
        assert.isFalse(headerRow.hasMultiSelectColumn(), 'first row has the multiselect column if owner does not');
    });
    it('second row, owner has no multiselect column', () => {
        rowIndex = 1;
        hasMultiSelectColumn = false;
        const headerRow = new GridTableHeaderRow({
            header,
            headerModel: mockedHeaderModel,
            columns,
            owner: mockedHeaderOwner
        });
        assert.isFalse(headerRow.hasMultiSelectColumn(), 'second row has no multiselect column if owner does not');
    });
    it('first row, owner has multiselect column', () => {
        rowIndex = 1;
        hasMultiSelectColumn = true;
        const headerRow = new GridTableHeaderRow({
            header,
            headerModel: mockedHeaderModel,
            columns,
            owner: mockedHeaderOwner
        });
        assert.isFalse(headerRow.hasMultiSelectColumn(), 'second row has no multiselect column even if owner does');
    });
});
