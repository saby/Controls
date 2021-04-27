import { Model } from 'Types/entity';
import { GridFooterRow, GridFooterCell } from 'Controls/grid';
import { CssClassesAssert as cAssert } from '../../../../CustomAsserts';

describe('Controls/grid/Display/Footer/FooterCell/backgroundColorStyle', () => {
    let cell: GridFooterCell<any>;
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
        hasColumnScroll: () => false,
        getActionsTemplateConfig: () => {},
        getMultiSelectVisibility: () => 'hidden',
        getColumnsCount: () => 1,
        hasItemActionsSeparatedCell: () => {}
    } as undefined as GridFooterRow<Model>;

    beforeEach(() => {
        cell = null;
    });

    describe('backgroundColorStyle has the highest priority', () => {

        // + backgroundStyle!=default
        // + style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'red' });
            cAssert.include(cell.getWrapperClasses('default', 'blue', 'master', false),
                'controls-background-blue');
        });

        // + backgroundStyle!=default
        // - style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle!=default, -style!=default, +backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'red' });
            cAssert.include(cell.getWrapperClasses('default', 'blue', undefined, false),
                'controls-background-blue');
        });

        // - backgroundStyle!=default
        // + style!=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('-backgroundStyle!=default, +style!=default, +backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''} });
            cAssert.include(cell.getWrapperClasses('default', 'blue', 'master', false),
                'controls-background-blue');
        });

        // + style=default
        // + backgroundStyle=default
        // + backgroundColorStyle
        // = backgroundColorStyle
        it('+backgroundStyle=default, +style=default, +backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'default' });
            cAssert.include(cell.getWrapperClasses('default', 'blue', 'default', false),
                'controls-background-blue');
        });
    });

    describe('backgroundStyle has higher priority than style', () => {
        // + backgroundStyle!=default
        // + style!=default
        // - backgroundColorStyle
        // = backgroundStyle
        it('+backgroundStyle!=default, +style!=default, -backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'red' });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'master', false),
                'controls-background-red');
        });

        // + backgroundStyle!=default
        // + style=default
        // - backgroundColorStyle
        // = backgroundStyle
        it('+backgroundStyle!=default, +style=default, -backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'red' });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'default', false),
                'controls-background-red');
        });
    });

    describe('NON-default style has higher priority than backgroundStyle=default', () => {
        // + backgroundStyle=default
        // + style=default
        // - backgroundColorStyle
        // = backgroundStyle
        it('+backgroundStyle=default, +style=default, -backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'default' });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'default', false),
                'controls-background-default');
        });

        // + backgroundStyle=default
        // + style!=default
        // - backgroundColorStyle
        // = style
        it('+backgroundStyle=default, +style=!default, -backgroundColorStyle', () => {
            cell = new GridFooterCell({ owner, column: { width: ''}, backgroundStyle: 'default' });
            cAssert.include(cell.getWrapperClasses('default', undefined, 'master', false),
                'controls-background-master');
        });
    });
});
