import { assert } from 'chai';
import { GridHeaderCell } from 'Controls/grid';
import {CssClassesAssert as cAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/grid_clean/Display/HeaderCell', () => {
    describe('Controls/grid_clean/Display/HeaderCell/getColspanStyles', () => {
        it('checkbox cell', () => {
            const cell = new GridHeaderCell({
                column: {},
                owner: {
                    hasMultiSelectColumn: () => true,
                    getHeaderConfig: () => [{}, {}],
                    isFullGridSupport: () => true
                }
            });
            assert.equal(cell.getColspanStyles(), 'grid-column: 1 / 2;');
        });
    });

    describe('Controls/grid_clean/Display/HeaderCell/getWrapperClasses', () => {
        let hasColumnScroll;

        const headerConfig = [{}, {}];
        const columnsConfig = [{}, {}];
        const cell = new GridHeaderCell({
            column: headerConfig[0],
            owner: {
                hasMultiSelectColumn: () => false,
                getHeaderConfig: () => headerConfig,
                isFullGridSupport: () => true,
                hasColumnScroll: () => hasColumnScroll,
                getLeftPadding: () => 'default',
                getRightPadding: () => 'default',
                getColumnIndex: () => 0,
                isMultiline: () => false,
                getColumnsCount: () => 2,
                hasItemActionsSeparatedCell: () => false,
                isStickyHeader: () => false,
                getColumnsConfig: () => columnsConfig
            }
        });

        it('without column scroll', () => {
            hasColumnScroll = false;
            cAssert.include(cell.getWrapperClasses(), 'controls-Grid__header-cell_min-width');
        });

        it('with column scroll', () => {
            hasColumnScroll = true;
            cAssert.notInclude(cell.getWrapperClasses(), 'controls-Grid__header-cell_min-width');
        });
    });
});
