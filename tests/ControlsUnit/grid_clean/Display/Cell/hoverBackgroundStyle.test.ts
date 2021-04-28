import { Model } from 'Types/entity';
import { GridRow, GridCell } from 'Controls/grid';
import { CssClassesAssert as cAssert } from '../../../CustomAsserts';

describe('Controls/grid/Display/Cell/background/hoverBackgroundStyle', () => {
    let cell: GridCell<Model, GridRow<Model>>;
    let hoverBackgroundStyle: string;
    const owner = {
        getHoverBackgroundStyle: () => hoverBackgroundStyle,
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

        // owner methods for _getBackgroundColorWrapperClasses
        getEditingConfig: () => undefined,

        // This setting changes behavior
        isEditing: () => false,
        hasColumnScroll: () => false
    } as undefined as GridRow<Model>;

    beforeEach(() => {
        cell = null;
        hoverBackgroundStyle = 'default';
    });

    describe('not Editing', () => {
        it('highlightOnHover=false', () => {
            cell = new GridCell({ owner, column: { width: ''} });
            cAssert.notInclude(cell.getWrapperClasses('default', undefined, 'default', false),
                'controls-Grid__row-cell-background-hover-default');
        });

        it('-templateHoverBackgroundStyle, +hoverBackgroundStyle', () => {
            cell = new GridCell({ owner, column: { width: ''} });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'default', true),
                'controls-Grid__row-cell-background-hover-default');
        });

        it('+templateHoverBackgroundStyle, +hoverBackgroundStyle', () => {
            cell = new GridCell({ owner, column: { width: ''} });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'default', true, 'custom'),
                'controls-Grid__row-cell-background-hover-custom');
        });
    });
});
