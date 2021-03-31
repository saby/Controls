import { assert } from 'chai';
import { GridHeaderCell } from 'Controls/gridNew';

const column = { displayProperty: 'col1' };
const headerColumn = {};

const FIXED_HEADER_Z_INDEX = 4;
const STICKY_HEADER_Z_INDEX = 3;

describe('Controls/grid_clean/Display/StickyHeader/HeaderCell/getZIndex', () => {
    function createHeaderCell({hasColumnsScroll, isFixed}): GridHeaderCell<any> {
        return new GridHeaderCell({
            owner: {
                hasMultiSelectColumn: () => false,
                getColumnsConfig: () => [column],
                getHeaderConfig: () => [headerColumn],
                getColumnIndex: () => 0,
                isMultiline: () => false,
                isStickyHeader: () => true,
                hasColumnScroll: () => hasColumnsScroll,
                getMultiSelectVisibility: () => 'hidden',
                getLeftPadding: () => 's',
                getRightPadding: () => 's',
                getColumnsCount: () => 1,
                hasItemActionsSeparatedCell: () => false
            } as any,
            column: headerColumn,
            isFixed
        });
    }
    it('getZIndex without columnScroll ', () => {
        const gridHeaderCell = createHeaderCell({hasColumnsScroll: false , isFixed: false});
        const zIndex = gridHeaderCell.getZIndex();
        assert.strictEqual(zIndex, FIXED_HEADER_Z_INDEX);
    });
    it('getZIndex with columnScroll on non-fixed cell', () => {
        const gridHeaderCell = createHeaderCell({hasColumnsScroll: true , isFixed: false});
        const zIndex = gridHeaderCell.getZIndex();
        assert.strictEqual(zIndex, STICKY_HEADER_Z_INDEX);
    });
    it('getZIndex with columnScroll on fixedCell', () => {
        const gridHeaderCell = createHeaderCell({hasColumnsScroll: true , isFixed: true});
        const zIndex = gridHeaderCell.getZIndex();
        assert.strictEqual(zIndex, FIXED_HEADER_Z_INDEX);
    });
});
