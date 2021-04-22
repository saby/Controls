import {GridDataCell} from 'Controls/grid';
import {CssClassesAssert as cAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/grid_clean/Display/Swipe/Animation/DataCell.test.ts', () => {
    let isAnimatedForSelection;
    const mockedOwner = {
        getHoverBackgroundStyle: () => 'default',
        isDragged: () => false,
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
        isAnimatedForSelection: () => isAnimatedForSelection
    };

    it('.getContentClasses() should contain animation classes when animated', () => {
        const cell = new GridDataCell({
            backgroundStyle: 'custom',
            owner: {
                ...mockedOwner,
                isEditing: () => false,
                getEditingColumnIndex: () => 0
            },
            column: {displayProperty: 'key'}
        });

        isAnimatedForSelection = false;
        cAssert.notInclude(
            cell.getContentClasses('default', 'default'),
            'controls-ListView__item_rightSwipeAnimation'
        );

        isAnimatedForSelection = true;
        cAssert.include(
            cell.getContentClasses('default', 'default'),
            'controls-ListView__item_rightSwipeAnimation'
        );
    });
});
