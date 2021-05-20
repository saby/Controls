import { GridCell } from 'Controls/grid';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/grid_clean/Display/MultiSelectPosition/Cell', () => {
    it('getContentClasses', () => {
        const owner = {
            getHoverBackgroundStyle: () => 'default',
            getMultiSelectVisibility: () => 'onhover',
            getLeftPadding: () => 's',
            getRightPadding: () => 's',
            getTopPadding: () => 's',
            getBottomPadding: () => 's',
            hasMultiSelectColumn: () => false,
            getColumnIndex: () => 0,
            getColumnsCount: () => 1,
            hasItemActionsSeparatedCell: () => false,
            getEditingConfig: () => null,
            isDragged: () => false,
            getStickyLadder: () => false
        };
        const cell = new GridCell({
            owner,
            column: {}
        });
        const cellContentClasses = cell.getContentClasses();
        CssClassesAssert.include(cellContentClasses, 'controls-Grid__cell_spacingFirstCol_s');
    });
});
