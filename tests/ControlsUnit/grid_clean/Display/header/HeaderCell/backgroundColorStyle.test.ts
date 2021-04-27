import { Model } from 'Types/entity';
import { GridHeaderRow, GridHeaderCell, IColumn } from 'Controls/grid';
import { CssClassesAssert as cAssert } from '../../../../CustomAsserts';

describe('Controls/grid/Display/header/HeaderCell/backgroundColorStyle', () => {
    let cell: GridHeaderCell<any>;
    let column: IColumn;
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
        isMultiline: () => false,
        getColumnsCount: () => 1,
        getActionsTemplateConfig: () => {},
        hasItemActionsSeparatedCell: () => {},
        getMultiSelectVisibility: () => 'hidden',
        isStickyHeader: () => true,
        getColumnsConfig: () => ([column]),
        getHeaderConfig: () => ([column]),
        hasColumnScroll: () => false
    } as undefined as GridHeaderRow<Model>;

    beforeEach(() => {
        cell = null;
        column = { width: ''};
    });

    describe('backgroundColorStyle has the highest priority', () => {

        // + backgroundStyle!=default
        // + style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'red' });
            cAssert.include(cell.getWrapperClasses('default', 'blue', 'master'),
                'controls-background-blue');
        });

        // + backgroundStyle!=default
        // - style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle!=default, -style!=default, +backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'red' });
            cAssert.include(cell.getWrapperClasses('default', 'blue', undefined),
                'controls-background-blue');
        });

        // - backgroundStyle!=default
        // + style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('-backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column });
            cAssert.include(cell.getWrapperClasses('default', 'blue', 'master'),
                'controls-background-blue');
        });

        // + style=default
        // + backgroundStyle=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle=default, +style=default, +backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'default' });
            cAssert.include(cell.getWrapperClasses('default', 'blue', 'default'),
                'controls-background-blue');
        });
    });

    describe('backgroundStyle has higher priority than style', () => {
        // + backgroundStyle!=default
        // + style!=default
        // - backgroundColorStyle
        // = backgroundStyle
        it('+backgroundStyle!=default, +style!=default, -backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'red' });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'master'),
                'controls-background-red');
        });

        // + backgroundStyle!=default
        // + style=default
        // - backgroundColorStyle
        // = backgroundStyle
        it('+backgroundStyle!=default, +style=default, -backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'red' });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'default'),
                'controls-background-red');
        });
    });

    describe('NON-default style has higher priority than backgroundStyle=default', () => {
        // + backgroundStyle=default
        // + style=default
        // - backgroundColorStyle
        // = backgroundStyle
        it('+backgroundStyle=default, +style=default, -backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'default' });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'default'),
                'controls-background-default');
        });

        // + backgroundStyle=default
        // + style!=default
        // - backgroundColorStyle
        // = style
        it('+backgroundStyle=default, +style=!default, -backgroundColorStyle', () => {
            cell = new GridHeaderCell({ owner, column, backgroundStyle: 'default' });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'master'),
                'controls-background-master');
        });
    });
});
