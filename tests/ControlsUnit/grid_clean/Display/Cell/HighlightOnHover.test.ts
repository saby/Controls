import { Model } from 'Types/entity';
import { GridRow, GridCell } from 'Controls/grid';
import { CssClassesAssert as cAssert } from '../../../CustomAsserts';

describe('Controls/grid/Display/Cell/HighlightOnHover', () => {
    let cell: GridCell<Model, GridRow<Model>>;
    const owner = {
        getHoverBackgroundStyle: () => 'default',
        getTopPadding: () => 'default',
        getBottomPadding: () => 'default',
        getLeftPadding: () => 'default',
        getRightPadding: () => 'default',
        isDragged: () => false,
        getEditingBackgroundStyle: () => 'default',
        isActive: () => false,
        getRowSeparatorSize: () => 's',
        hasMultiSelectColumn: () => false,
        getColumnIndex: () => 1,

        // methods for contentClasses
        getColumnsCount: () => 1,
        getMultiSelectVisibility: () => 'hidden',
        hasItemActionsSeparatedCell: () => false,
        getStickyLadder: () => false,

        // owner methods for _getBackgroundColorWrapperClasses
        getEditingConfig: () => undefined,

        // This setting changes behavior
        isEditing: () => false,
        hasColumnScroll: () => false
    } as undefined as GridRow<Model>;

    beforeEach(() => {
        cell = null;
    });

    describe('getWrapperClasses', () => {
        it('templateHighlightOnHover=false, column.highlightOnHover=true', () => {
            cell = new GridCell({ owner, column: { width: '', highlightOnHover: true} });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'default', false),
                'controls-Grid__row-cell-background-hover-default');
        });

        it('templateHighlightOnHover=true, column.highlightOnHover=false', () => {
            cell = new GridCell({ owner, column: { width: '', highlightOnHover: false} });
            cAssert.notInclude(cell.getWrapperClasses('default', undefined, 'default', true),
                'controls-Grid__row-cell-background-hover-default');
        });

        it('templateHighlightOnHover=true, column.highlightOnHover not defined', () => {
            cell = new GridCell({ owner, column: { width: ''} });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'default', true),
                'controls-Grid__row-cell-background-hover-default');
        });
    });

    describe('getContentClasses', () => {
        it('templateHighlightOnHover=false, column.highlightOnHover=true', () => {
            cell = new GridCell({ owner, column: { width: '', highlightOnHover: true} });
            cAssert.include(cell.getContentClasses('default', undefined, 'default', false),
                'controls-Grid__item_background-hover_default');
        });

        it('templateHighlightOnHover=true, column.highlightOnHover=false', () => {
            cell = new GridCell({ owner, column: { width: '', highlightOnHover: false} });
            cAssert.notInclude(cell.getContentClasses('default', undefined, 'default', true),
                'controls-Grid__item_background-hover_default');
        });

        it('templateHighlightOnHover=true, column.highlightOnHover not defined', () => {
            cell = new GridCell({ owner, column: { width: ''} });
            cAssert.include(cell.getContentClasses('default', undefined, 'default', true),
                'controls-Grid__item_background-hover_default');
        });
    });
});
