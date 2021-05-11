import { assert } from 'chai';
import { GridRow, GridResultsCell } from 'Controls/grid';

describe('Controls/grid_clean/Display/Results/ResultsCell/getWrapperStyles', () => {
    let hasColumnScroll;

    const mockResultRow = {
        hasMultiSelectColumn: () => false,
        isFullGridSupport: () => true,
        hasColumnScroll: () => hasColumnScroll
    } as undefined as GridRow<any>;

    beforeEach(() => {
        hasColumnScroll = false;
    });

    it('stickyHeader, no columnScroll', () => {
        const cell = new GridResultsCell({
            column: { width: '' },
            owner: mockResultRow,
            isSticked: true
        });
        assert.equal(cell.getWrapperStyles(), 'z-index: 4;');
    });

    it('stickyHeader, with columnScroll, isFixed', () => {
        hasColumnScroll = true;
        const cell = new GridResultsCell({
            column: { width: '' },
            owner: mockResultRow,
            isFixed: true,
            isSticked: true
        });
        assert.equal(cell.getWrapperStyles(), 'z-index: 4;');
    });

    it('stickyHeader, with columnScroll, not isFixed', () => {
        hasColumnScroll = true;
        const cell = new GridResultsCell({
            column: { width: '' },
            owner: mockResultRow,
            isFixed: false,
            isSticked: true
        });
        assert.equal(cell.getWrapperStyles(), 'z-index: 3;');
    });

    it('not stickyHeader', () => {
        const cell = new GridResultsCell({
            column: { width: '' },
            owner: mockResultRow,
            isSticked: false
        });
        assert.equal(cell.getWrapperStyles(), '');
    });
});
