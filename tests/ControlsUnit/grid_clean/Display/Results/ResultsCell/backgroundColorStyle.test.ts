import { Model } from 'Types/entity';
import { GridResultsRow, GridResultsCell } from 'Controls/grid';
import { CssClassesAssert as cAssert } from '../../../../CustomAsserts';

describe('Controls/grid/Display/Results/ResultsCell/backgroundColorStyle', () => {
    let cell: GridResultsCell<any>;
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
        hasItemActionsSeparatedCell: () => false,
        getMultiSelectVisibility: () => 'hidden',
        getColumnsCount: () => 1,
        isSticked: () => true,
        hasColumnScroll: () => false
    } as undefined as GridResultsRow<Model>;

    beforeEach(() => {
        cell = null;
    });

    describe('backgroundColorStyle has the highest priority', () => {

        // + backgroundStyle!=default
        // + style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
            cell = new GridResultsCell({ owner, column: { width: ''}, backgroundStyle: 'red' });
            cAssert.include(cell.getWrapperClasses('default', 'blue', 'master'),
                'controls-background-blue');
        });

        // + backgroundStyle!=default
        // - style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle!=default, -style!=default, +backgroundColorStyle', () => {
            cell = new GridResultsCell({ owner, column: { width: ''}, backgroundStyle: 'red' });
            cAssert.include(cell.getWrapperClasses('default', 'blue', undefined),
                'controls-background-blue');
        });

        // - backgroundStyle!=default
        // + style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('-backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
            cell = new GridResultsCell({ owner, column: { width: ''} });
            cAssert.include(cell.getWrapperClasses('default', 'blue', 'master'),
                'controls-background-blue');
        });

        // + style=default
        // + backgroundStyle=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle=default, +style=default, +backgroundColorStyle', () => {
            cell = new GridResultsCell({ owner, column: { width: ''}, backgroundStyle: 'default' });
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
            cell = new GridResultsCell({ owner, column: { width: ''}, backgroundStyle: 'red' });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'master'),
                'controls-background-red');
        });

        // + backgroundStyle!=default
        // + style=default
        // - backgroundColorStyle
        // = backgroundStyle
        it('+backgroundStyle!=default, +style=default, -backgroundColorStyle', () => {
            cell = new GridResultsCell({ owner, column: { width: ''}, backgroundStyle: 'red' });
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
            cell = new GridResultsCell({ owner, column: { width: ''}, backgroundStyle: 'default' });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'default'),
                'controls-background-default');
        });

        // + backgroundStyle=default
        // + style!=default
        // - backgroundColorStyle
        // = style
        it('+backgroundStyle=default, +style=!default, -backgroundColorStyle', () => {
            cell = new GridResultsCell({ owner, column: { width: ''}, backgroundStyle: 'default' });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'master'),
                'controls-background-master');
        });
    });
});
