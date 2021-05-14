import {GridGroupRow, GridGroupCell, GridItemActionsCell} from 'Controls/grid';
import {assert} from 'chai';

describe('Controls/grid_clean/Display/GroupRow', () => {
    it('split group on two parts for column scroll: fixed and scrollable', () => {
        const mockedCollection = {
            getColumnsConfig: () => [{}, {}, {}, {}, {}],
            getStickyColumnsCount: () => 2,
            isFullGridSupport: () => true,
            hasMultiSelectColumn: () => false,
            hasColumnScroll: () => true,
            hasItemActionsSeparatedCell: () => true,
            isStickyHeader: () => false,
            hasHeader: () => false,
            getResultsPosition: () => undefined
        };

        const groupRow = new GridGroupRow({
            owner: mockedCollection,
            columns: mockedCollection.getColumnsConfig()
        });

        assert.equal(groupRow.getColumns().length, 3);

        assert.instanceOf(groupRow.getColumns()[0], GridGroupCell);
        assert.equal(groupRow.getColumns()[0].getColspan(), 2);

        assert.instanceOf(groupRow.getColumns()[1], GridGroupCell);
        assert.equal(groupRow.getColumns()[1].getColspan(), 3);

        assert.instanceOf(groupRow.getColumns()[2], GridItemActionsCell);
    });
});
