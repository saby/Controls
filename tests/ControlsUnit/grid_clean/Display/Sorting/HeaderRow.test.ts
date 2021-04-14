import { assert } from 'chai';
import { GridHeaderRow } from 'Controls/grid';

describe('Controls/grid_clean/Display/Sorting/HeaderRow', () => {
    it('set sorting on creating', () => {
        const columns = [{}, {}, {}];
        const header = [{sortingProperty: 'test'}, {}, {}];

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
        const sorting = [{ test: 'ASC' }];
        const headerRow = new GridHeaderRow({
            sorting,
            header,
            headerModel: mockedHeaderModel,
            columns,
            owner: mockedHeaderOwner
        });
        assert.equal(headerRow.getColumns()[0].getSorting(), 'ASC');
    });

});
