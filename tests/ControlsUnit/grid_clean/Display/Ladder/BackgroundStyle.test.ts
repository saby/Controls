import {GridDataCell} from 'Controls/gridNew';
import {CssClassesAssert as cAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/grid_clean/Display/DataCell/BackgroundStyle.test.ts', () => {

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
        getMultiSelectVisibility: () => 'hidden'
    };

    it('.getContentClasses() should contain background-color classes when hiddenForLadder', () => {
        const cell = new GridDataCell({
            backgroundStyle: 'custom',
            owner: {
                ...mockedOwner,
                isEditing: () => false,
                getEditingColumnIndex: () => 0
            },
            column: {displayProperty: 'key'}
        });

        cAssert.notInclude(
            cell.getContentClasses('default', 'default'),
            'controls-background-custom_theme-default'
        );

        cell.setHiddenForLadder(true);
        cAssert.include(
            cell.getContentClasses('default', 'default'),
            'controls-background-custom_theme-default'
        );
    });
});
