import { assert } from 'chai';
import { GridDataCell, GridDataRow } from 'Controls/gridNew';
import {CssClassesAssert as cAssert} from './../../CustomAsserts';

describe('Controls/grid_clean/Display/DataCell', () => {
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
                    'controls-Grid__row-cell_editing-mode-single-cell_theme-default',
                    'controls-Grid__row-cell_single-cell_editable_theme-default'
                ]
            );

            cAssert.notInclude(
                cell.getContentClasses('default', 'default'),
                'controls-Grid__row-cell_single-cell_editing_theme-default'
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
                'controls-Grid__row-cell_single-cell_editing_theme-default'
            );
        });
    });

});
