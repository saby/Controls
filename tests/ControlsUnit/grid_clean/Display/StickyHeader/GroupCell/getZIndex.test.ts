import { assert } from 'chai';
import { GridGroupCell } from 'Controls/grid';

const column = { displayProperty: 'col1' };

const TEST_Z_INDEX = 3;

describe('Controls/grid_clean/Display/StickyHeader/GroupCell/getZIndex', () => {
    it('getZIndex returns value from options ', () => {
        const gridGroupCell = new GridGroupCell({
            owner: {
                hasMultiSelectColumn: () => false,
                getGridColumnsConfig: () => [column],
                getColumnIndex: () => 0,
                isStickyHeader: () => true,
                getMultiSelectVisibility: () => 'hidden',
                getLeftPadding: () => 's',
                getRightPadding: () => 's',
                getColumnsCount: () => 1,
                hasItemActionsSeparatedCell: () => false
            } as any,
            columns: [column],
            column,
            zIndex: TEST_Z_INDEX
        });
        const zIndex = gridGroupCell.getZIndex();
        assert.strictEqual(zIndex, TEST_Z_INDEX);
    });
});
