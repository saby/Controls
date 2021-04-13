import { assert } from 'chai';
import { GridDataCell } from 'Controls/grid';
import { CssClassesAssert as cAssert } from './../../../CustomAsserts';

describe('Controls/grid_clean/Display/DataCell/textOverflow', () => {
    let editArrowIsVisible: boolean;

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
        editArrowIsVisible: () => editArrowIsVisible,
        getDefaultDisplayValue: () => 'value',
        getContents: () => ({ key: 'key'}),
    };

    beforeEach(() => {
        editArrowIsVisible = false;
    })

    describe('getTextOverflowClasses', () => {

        it('should add correct classes when textOverflow', () => {
            const cell = new GridDataCell({
                owner: mockedOwner,
                column: {displayProperty: 'key', textOverflow: 'ellipsis'}
            });
            cAssert.include(cell.getTextOverflowClasses(), ['controls-Grid__cell_ellipsis']);
        });

        it('should add correct classes when not textOverflow', () => {
            const cell = new GridDataCell({
                owner: mockedOwner,
                column: {displayProperty: 'key'}
            });
            cAssert.notInclude(cell.getTextOverflowClasses(), ['controls-Grid__cell_ellipsis']);
        });

        it('should add classes for editArrow placing when textOverflow and editArrow', () => {
            editArrowIsVisible = true;
            const cell = new GridDataCell({
                owner: mockedOwner,
                column: {displayProperty: 'key', textOverflow: 'ellipsis'}
            });
            cAssert.include(cell.getTextOverflowClasses(), [
                'controls-Grid__editArrow-cellContent',
                'controls-Grid__editArrow-overflow-ellipsis'
            ]);
        });

        it('should not add classes for editArrow placing when textOverflow and not editArrow', () => {
            const cell = new GridDataCell({
                owner: mockedOwner,
                column: {displayProperty: 'key', textOverflow: 'ellipsis'}
            });
            cAssert.notInclude(cell.getTextOverflowClasses(), [
                'controls-Grid__editArrow-cellContent',
                'controls-Grid__editArrow-overflow-ellipsis'
            ]);
        });
    });

    describe('getTextOverflowTitle', () => {
        it('should return title when textOverflow and not custom template and not tooltipProperty', () => {
            const cell = new GridDataCell({
                owner: mockedOwner,
                column: {displayProperty: 'key', textOverflow: 'ellipsis'}
            });
            assert.equal('key', cell.getTextOverflowTitle());
        });
        it('should not return title when textOverflow and custom template', () => {
            const cell = new GridDataCell({
                owner: mockedOwner,
                column: {displayProperty: 'key', textOverflow: 'ellipsis', template: {}}
            });
            assert.isEmpty(cell.getTextOverflowTitle());
        });
        it('should not return title when textOverflow and tooltipProperty', () => {
            const cell = new GridDataCell({
                owner: mockedOwner,
                column: {displayProperty: 'key', textOverflow: 'ellipsis', tooltipProperty: 'tooltip'}
            });
            assert.isEmpty(cell.getTextOverflowTitle());
        });
    });
});
