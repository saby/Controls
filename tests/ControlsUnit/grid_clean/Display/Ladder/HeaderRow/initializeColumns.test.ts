import { assert } from 'chai';
import { GridHeaderRow } from 'Controls/grid';

describe('Controls/grid_clean/Display/Ladder/HeaderRow/initializeColumns', () => {
    describe('Add cells for sticky ladder  in correct places', () => {
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

        it('single sticky property', () => {
            columns = [{stickyProperty: ['first']}, {}, {}];
            const headerRow = new GridHeaderRow({
                header,
                headerModel: mockedHeaderModel,
                columns,
                owner: mockedHeaderOwner
            });
            assert.equal(headerRow.getColumns()[0]._$isLadderCell, true);
        });
        it('two sticky properties', () => {
            columns = [{stickyProperty: ['first', 'second']}, {}, {}];
            const headerRow = new GridHeaderRow({
                header,
                headerModel: mockedHeaderModel,
                columns,
                owner: mockedHeaderOwner
            });
            assert.equal(headerRow.getColumns()[0]._$isLadderCell, true);
            assert.equal(headerRow.getColumns()[2]._$isLadderCell, true);
        });
    });

});
