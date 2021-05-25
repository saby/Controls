import { assert } from 'chai';
import {GridItemActionsCell} from 'Controls/grid';

describe('Controls/_grid/display/ItemActionsCell', () => {
    let hasVisibleActions: boolean;
    let isEditing: boolean;
    let cell: GridItemActionsCell;

    const owner = {
        DisplayItemActions: true,
        shouldDisplayMarker: () => false,
        hasVisibleActions: () => hasVisibleActions,
        hasMultiSelectColumn: () => false,
        hasItemActionsSeparatedCell: () => false,
        getColumnsCount: () => 1,
        getColumnIndex: () => 0,
        hasColumnScroll: () => false,
        getHoverBackgroundStyle: () => '',
        getTopPadding: () => 'null',
        getBottomPadding: () => 'null',
        isEditing: () => isEditing,
        isDragged: () => false,
        getEditingBackgroundStyle: () => 'default',
        isActive: () => false,
        getRowSeparatorSize: () => 's',
        getEditingConfig: () => ({}),
        isFullGridSupport: () => true
    };

    beforeEach(() => {
        hasVisibleActions = false;
        isEditing = false;
        owner.DisplayItemActions = true;
        cell = new GridItemActionsCell({
            owner,
            column: {}
        });
    });

    it('getWrapperStyles', () => {
        assert.equal(cell.getWrapperStyles(), 'width: 0px; min-width: 0px; max-width: 0px; padding: 0px; z-index: 2;');
    });

    it('+DataCell, -isEditing, -hasVisibleActions = don\'t display itemActions', () => {
        assert.isFalse(cell.shouldDisplayItemActions());
    });

    it('-DataCell, +hasVisibleActions = don\'t display itemActions', () => {
        hasVisibleActions = true;
        owner.DisplayItemActions = false;
        assert.isFalse(cell.shouldDisplayItemActions());
    });

    it('+DataCell, -isEditing, +hasVisibleActions = display itemActions', () => {
        hasVisibleActions = true;
        assert.isTrue(cell.shouldDisplayItemActions());
    });

    it('+DataCell, +isEditing, -hasVisibleActions = display itemActions', () => {
        isEditing = true;
        assert.isTrue(cell.shouldDisplayItemActions());
    });
});
