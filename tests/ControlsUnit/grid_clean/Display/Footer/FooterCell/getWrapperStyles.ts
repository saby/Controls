import FooterCell from 'Controls/_grid/display/FooterCell';
import { assert } from 'chai';

describe('Controls/_grid/display/FooterCell', () => {
    const owner = {
        shouldDisplayMarker: () => false,
        hasMultiSelectColumn: () => false,
        hasItemActionsSeparatedCell: () => false,
        getColumnsCount: () => 1,
        getColumnIndex: () => 0,
        hasColumnScroll: () => false,
        getHoverBackgroundStyle: () => '',
        getTopPadding: () => 'null',
        getBottomPadding: () => 'null',
        isEditing: () => false,
        isDragged: () => false,
        getEditingBackgroundStyle: () => 'default',
        isActive: () => false,
        getRowSeparatorSize: () => 's',
        getEditingConfig: () => ({}),
        isFullGridSupport: () => true
    };

    describe('getWrapperStyles', () => {
        it('is single cell', () => {
            const cell = new FooterCell({
                owner,
                isSingleColspanedCell: true,
                column: {startColumn: 1, endColumn: 2}
            });
            assert.equal(cell.getWrapperStyles(), 'grid-column: 1 / 2; ');
            assert.equal(cell.getWrapperStyles(500), 'grid-column: 1 / 2; width: 500px;');
        });

        it('is not single cell', () => {
            const cell = new FooterCell({
                owner,
                isSingleColspanedCell: true,
                column: {startColumn: 1, endColumn: 2}
            });
            assert.equal(cell.getWrapperStyles(), 'grid-column: 1 / 2; ');
            assert.equal(cell.getWrapperStyles(500), 'grid-column: 1 / 2; ');
        });
    });
});
