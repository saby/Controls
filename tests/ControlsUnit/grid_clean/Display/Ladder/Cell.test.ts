import {CssClassesAssert as cAssert} from 'ControlsUnit/CustomAsserts';
import Cell from 'Controls/_grid/display/Cell';

describe('Controls/grid_clean/Display/Ladder/Cell', () => {

    const mockedOwner = {
        getHoverBackgroundStyle: () => 'default',
        isDragged: () => false,
        getStickyLadder: () => false,
        hasItemActionsSeparatedCell: () => false,
        getTopPadding: () => 'default',
        getBottomPadding: () => 'default',
        getLeftPadding: () => 'default',
        getRightPadding: () => 'default',
        getEditingConfig: () => ({
            mode: 'cell'
        }),
        getColumnIndex: () => 0,
        getColumnsCount: () => 0,
        getMultiSelectVisibility: () => 'hidden',
        hasMultiSelectColumn: () => false,
        isAnimatedForSelection: () => false
    };

    it('.getContentClasses()', () => {
        const cell = new Cell({
            owner: mockedOwner,
            column: {displayProperty: 'key'}
        });

        cAssert.notInclude(
            cell.getContentClasses('default', 'default'),
            'controls-Grid__row-cell__content_ladderHeader'
        );

        mockedOwner.getStickyLadder = () => true;
        cAssert.include(
            cell.getContentClasses('default', 'default'),
            'controls-Grid__row-cell__content_ladderHeader'
        );
    });
});
