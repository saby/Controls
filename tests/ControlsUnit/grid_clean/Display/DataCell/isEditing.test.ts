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
                getMultiSelectVisibility: () => 'hidden'
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
    });

});
