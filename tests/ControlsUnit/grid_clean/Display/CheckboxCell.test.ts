import { assert } from 'chai';
import { GridDataCell, GridDataRow } from 'Controls/grid';
import {CssClassesAssert as cAssert} from './../../CustomAsserts';
import CheckboxCell from 'Controls/_grid/display/CheckboxCell';

describe('Controls/grid_clean/Display/DataCell', () => {
    beforeEach(() => {
    });

    afterEach(() => {
    });

    describe('getWrapperClasses', () => {
        const mockedOwner = {
            getHoverBackgroundStyle: () => 'default',
            isDragged: () => false,
            hasItemActionsSeparatedCell: () => false,
            getTopPadding: () => 'default',
            getBottomPadding: () => 'default',
            getLeftPadding: () => 'default',
            getRightPadding: () => 'default',
            getEditingConfig: () => ({}),
            getColumnIndex: () => 0,
            getColumnsCount: () => 0,
            getMultiSelectVisibility: () => 'hidden',
            hasColumnScroll: () => true,
            isEditing: () => false,
            getEditingBackgroundStyle: () => 'default',
            isActive: () => true,
            hasMultiSelectColumn: () => false
        };

        it('should add background-color class', () => {
            const cell = new CheckboxCell({
                owner: {
                    ...mockedOwner
                },
                column: {displayProperty: 'key'}
            });
            cAssert.include(
                cell.getWrapperClasses('default', null, 'default', true),
                [
                    'controls-background-default'
                ]
            );
        });
    });
});
