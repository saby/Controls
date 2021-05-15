import { assert } from 'chai';
import { GridDataCell } from 'Controls/grid';
import {CssClassesAssert as cAssert} from './../../../CustomAsserts';

describe('Controls/grid_clean/Display/DataCell/isEditing', () => {
    beforeEach(() => {
    });

    afterEach(() => {
    });

    describe('single editable cell', () => {
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
                hasMultiSelectColumn: () => false,
                isAnimatedForSelection: () => false
        };

        it('.getContentClasses() for editable', () => {
            const cell = new GridDataCell({
                owner: {
                    ...mockedOwner,
                    isEditing: () => false,
                    getEditingColumnIndex: () => 0
                },
                column: {displayProperty: 'key'}
            });
            cAssert.include(
                cell.getContentClasses('default', 'default'),
                [
                    'controls-Grid__row-cell_editing-mode-single-cell',
                    'controls-Grid__row-cell_single-cell_editable'
                ]
            );

            cAssert.notInclude(
                cell.getContentClasses('default', 'default'),
                'controls-Grid__row-cell_single-cell_editing'
            );
        });

        it('.getContentClasses() for last editable column', () => {
            const cell = new GridDataCell({
                owner: {
                    ...mockedOwner,
                    getColumnsCount: () => 1,
                    isEditing: () => false,
                    getEditingColumnIndex: () => 0
                },
                column: {displayProperty: 'key'}
            });
            cAssert.include(
                cell.getContentClasses('default', 'default'),
                'controls-Grid__row-cell_editing-mode-single-cell_last'
            );
        });

        it('.getContentClasses() for editing', () => {
            const cell = new GridDataCell({
                owner: {
                    ...mockedOwner,
                    isEditing: () => true,
                    getEditingColumnIndex: () => 0
                },
                column: {displayProperty: 'key'}
            });
            cAssert.include(
                cell.getContentClasses('default', 'default'),
                'controls-Grid__row-cell_single-cell_editing'
            );
        });

        it('.getContentClasses() for editing', () => {
            const cell = new GridDataCell({
                owner: {
                    ...mockedOwner,
                    isEditing: () => true,
                    getEditingColumnIndex: () => 0,
                    hasColumnScroll: () => true,
                    getEditingBackgroundStyle: () => 'default',
                    isActive: () => false,
                    hasMultiSelectColumn: () => false,
                    shouldDisplayMarker: () => false
                },
                column: {displayProperty: 'key'}
            });
            cAssert.include(
                cell.getWrapperClasses('default', 'default'),
                'controls-background-default'
            );
        });
    });

});
