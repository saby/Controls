import { assert } from 'chai';
import ItemActionsCell from "Controls/_gridNew/display/ItemActionsCell";

describe('Controls/_gridNew/display/ItemActionsCell', () => {
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

    it('getWrapperStyles', () => {
        const cell = new ItemActionsCell({
            owner,
            column: {}
        });
        assert.equal(cell.getWrapperStyles(), 'width: 0px; min-width: 0px; max-width: 0px; padding: 0px; z-index: 2;');
    });
});
