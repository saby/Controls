import { assert } from 'chai';
import { GridResultsCell } from 'Controls/grid';

const column = { displayProperty: 'col1' };
const resultsColumn = {};

const FIXED_RESULTS_Z_INDEX = 4;
const STICKY_RESULTS_Z_INDEX = 3;

describe('Controls/grid_clean/Display/StickyHeader/ResultsCell/getZIndex', () => {
    function createResultsCell({hasColumnsScroll, isFixed}): GridResultsCell<any> {
        return new GridResultsCell({
            owner: {
                hasMultiSelectColumn: () => false,
                getGridColumnsConfig: () => [column],
                getColumnIndex: () => 0,
                isStickyHeader: () => true,
                hasColumnScroll: () => hasColumnsScroll,
                getMultiSelectVisibility: () => 'hidden',
                getLeftPadding: () => 's',
                getRightPadding: () => 's',
                getColumnsCount: () => 1,
                hasItemActionsSeparatedCell: () => false
            } as any,
            column: resultsColumn,
            isFixed
        });
    }
    it('getZIndex without columnScroll ', () => {
        const gridResultsCell = createResultsCell({hasColumnsScroll: false , isFixed: false});
        const zIndex = gridResultsCell.getZIndex();
        assert.strictEqual(zIndex, FIXED_RESULTS_Z_INDEX);
    });
    it('getZIndex with columnScroll on non-fixed cell', () => {
        const gridResultsCell = createResultsCell({hasColumnsScroll: true , isFixed: false});
        const zIndex = gridResultsCell.getZIndex();
        assert.strictEqual(zIndex, STICKY_RESULTS_Z_INDEX);
    });
    it('getZIndex with columnScroll on fixedCell', () => {
        const gridResultsCell = createResultsCell({hasColumnsScroll: true , isFixed: true});
        const zIndex = gridResultsCell.getZIndex();
        assert.strictEqual(zIndex, FIXED_RESULTS_Z_INDEX);
    });
});
