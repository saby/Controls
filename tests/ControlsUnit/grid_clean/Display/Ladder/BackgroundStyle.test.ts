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
            mode: 'default'
        }),
        getColumnIndex: () => 0,
        getColumnsCount: () => 0,
        getMultiSelectVisibility: () => 'hidden',
        hasColumnScroll: () => true,
        getEditingBackgroundStyle: () => 'default',
        isActive: () => true,
        hasMultiSelectColumn: () => false,
        shouldDisplayMarker: () => false
    };

    it('.getWrapperClasses() should contain background-color classes when hiddenForLadder', () => {
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
            cell.getWrapperClasses('default', 'default', 'default', false),
            'controls-background-custom'
        );

        cell.setHiddenForLadder(true);
        cAssert.include(
            cell.getWrapperClasses('default', 'default', 'default', false),
            'controls-background-custom'
        );
    });
});
