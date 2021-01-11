import { assert } from 'chai';
import { GridHeaderRow } from 'Controls/display';

const THEME = 'UnitTests';

describe('Controls/grid_clean/Display/HeaderRow', () => {
    describe('Controls/grid_clean/Display/HeaderRow/Spacing', () => {
        it('Padding set in owner', () => {
            const columns = [{}, {}, {}];
            const header = [{}, {}, {}];

            const mockedHeaderOwner = {
                getStickyColumnsCount: () => 0,
                hasMultiSelectColumn: () => false,
                getColumnsConfig: () => columns,
                getHeaderConfig: () => header,
                hasItemActionsSeparatedCell: () => false,
                getLeftPadding: () => 's',
                getRightPadding: () => 's',
                isStickyHeader: () => false,
                hasColumnScroll: () => false
            };

            const mockedHeaderModel = {
                isMultiline: () => false
            }

            const headerRow = new GridHeaderRow({
                header,
                headerModel: mockedHeaderModel,
                columns,
                owner: mockedHeaderOwner
            });
            const columnItems = headerRow.getColumns();
            assert.strictEqual(columnItems.length, 3);

            assert.isTrue(columnItems[0].getWrapperClasses(THEME).indexOf(`controls-Grid__cell_spacingFirstCol_s_theme-${THEME}`) !== -1);
            assert.isFalse(columnItems[0].getWrapperClasses(THEME).indexOf(`controls-Grid__cell_spacingLeft`) !== -1);
            assert.isFalse(columnItems[0].getWrapperClasses(THEME).indexOf(`controls-Grid__cell_spacingLastCol`) !== -1);
            assert.isTrue(columnItems[0].getWrapperClasses(THEME).indexOf(`controls-Grid__cell_spacingRight_s_theme-${THEME}`) !== -1);

            assert.isFalse(columnItems[1].getWrapperClasses(THEME).indexOf(`controls-Grid__cell_spacingFirstCol`) !== -1);
            assert.isTrue(columnItems[1].getWrapperClasses(THEME).indexOf(`controls-Grid__cell_spacingLeft_s_theme-${THEME}`) !== -1);
            assert.isFalse(columnItems[1].getWrapperClasses(THEME).indexOf(`controls-Grid__cell_spacingLastCol`) !== -1);
            assert.isTrue(columnItems[1].getWrapperClasses(THEME).indexOf(`controls-Grid__cell_spacingRight_s_theme-${THEME}`) !== -1);

            assert.isFalse(columnItems[2].getWrapperClasses(THEME).indexOf(`controls-Grid__cell_spacingFirstCol`) !== -1);
            assert.isTrue(columnItems[2].getWrapperClasses(THEME).indexOf(`controls-Grid__cell_spacingLeft_s_theme-${THEME}`) !== -1);
            assert.isTrue(columnItems[2].getWrapperClasses(THEME).indexOf(`controls-Grid__cell_spacingLastCol_s_theme-${THEME}`) !== -1);
            assert.isFalse(columnItems[2].getWrapperClasses(THEME).indexOf(`controls-Grid__cell_spacingRight`) !== -1);
        });

        it('Padding set in columns', () => {
            const columns = [{
                cellPadding: {
                    left: 'l',
                    right: 'l'
                }
            }, {
                cellPadding: {
                    left: 'xl',
                    right: 'xl'
                }
            }, {
                cellPadding: {
                    left: 'xs',
                    right: 'xs'
                }
            }];
            const header = [{}, {}, {}];

            const mockedHeaderOwner = {
                getStickyColumnsCount: () => 0,
                hasMultiSelectColumn: () => false,
                getColumnsConfig: () => columns,
                getHeaderConfig: () => header,
                hasItemActionsSeparatedCell: () => false,
                getLeftPadding: () => 's',
                getRightPadding: () => 's',
                isStickyHeader: () => false,
                hasColumnScroll: () => false
            };

            const mockedHeaderModel = {
                isMultiline: () => false
            }

            const headerRow = new GridHeaderRow({
                header,
                headerModel: mockedHeaderModel,
                columns,
                owner: mockedHeaderOwner
            });
            const columnItems = headerRow.getColumns();
            assert.strictEqual(columnItems.length, 3);

            assert.include(columnItems[0].getWrapperClasses(THEME), `controls-Grid__cell_spacingFirstCol_s_theme-${THEME}`);
            assert.notInclude(columnItems[0].getWrapperClasses(THEME), `controls-Grid__cell_spacingLeft`);
            assert.notInclude(columnItems[0].getWrapperClasses(THEME), `controls-Grid__cell_spacingLastCol`);
            assert.include(columnItems[0].getWrapperClasses(THEME), `controls-Grid__cell_spacingRight_l_theme-${THEME}`);

            assert.notInclude(columnItems[1].getWrapperClasses(THEME), `controls-Grid__cell_spacingFirstCol`);
            assert.include(columnItems[1].getWrapperClasses(THEME), `controls-Grid__cell_spacingLeft_xl_theme-${THEME}`);
            assert.notInclude(columnItems[1].getWrapperClasses(THEME), `controls-Grid__cell_spacingLastCol`);
            assert.include(columnItems[1].getWrapperClasses(THEME), `controls-Grid__cell_spacingRight_xl_theme-${THEME}`);

            assert.notInclude(columnItems[2].getWrapperClasses(THEME), `controls-Grid__cell_spacingFirstCol`);
            assert.include(columnItems[2].getWrapperClasses(THEME), `controls-Grid__cell_spacingLeft_xs_theme-${THEME}`);
            assert.include(columnItems[2].getWrapperClasses(THEME), `controls-Grid__cell_spacingLastCol_s_theme-${THEME}`);
            assert.notInclude(columnItems[2].getWrapperClasses(THEME), `controls-Grid__cell_spacingRight`);
        });
        it('Padding set default value', () => {
            const columns = [{}, {}, {}];
            const header = [{}, {}, {}];

            const mockedHeaderOwner = {
                getStickyColumnsCount: () => 0,
                hasMultiSelectColumn: () => false,
                getColumnsConfig: () => columns,
                getHeaderConfig: () => header,
                hasItemActionsSeparatedCell: () => false,
                getLeftPadding: () => 'default',
                getRightPadding: () => 'default',
                isStickyHeader: () => false,
                hasColumnScroll: () => false
            };

            const mockedHeaderModel = {
                isMultiline: () => false
            }

            const headerRow = new GridHeaderRow({
                header,
                headerModel: mockedHeaderModel,
                columns,
                owner: mockedHeaderOwner
            });
            const columnItems = headerRow.getColumns();
            assert.strictEqual(columnItems.length, 3);

            assert.include(columnItems[0].getWrapperClasses(THEME), `controls-Grid__cell_spacingFirstCol_default_theme-${THEME}`);
            assert.notInclude(columnItems[0].getWrapperClasses(THEME), `controls-Grid__cell_spacingLeft`);
            assert.notInclude(columnItems[0].getWrapperClasses(THEME), `controls-Grid__cell_spacingLastCol`);
            assert.include(columnItems[0].getWrapperClasses(THEME), `controls-Grid__cell_spacingRight_theme-${THEME}`);

            assert.notInclude(columnItems[1].getWrapperClasses(THEME), `controls-Grid__cell_spacingFirstCol`);
            assert.include(columnItems[1].getWrapperClasses(THEME),`controls-Grid__cell_spacingLeft_theme-${THEME}`);
            assert.notInclude(columnItems[1].getWrapperClasses(THEME), `controls-Grid__cell_spacingLastCol`);
            assert.include(columnItems[1].getWrapperClasses(THEME), `controls-Grid__cell_spacingRight_theme-${THEME}`);

            assert.notInclude(columnItems[2].getWrapperClasses(THEME), `controls-Grid__cell_spacingFirstCol`);
            assert.include(columnItems[2].getWrapperClasses(THEME), `controls-Grid__cell_spacingLeft_theme-${THEME}`);
            assert.include(columnItems[2].getWrapperClasses(THEME), `controls-Grid__cell_spacingLastCol_default_theme-${THEME}`);
            assert.notInclude(columnItems[2].getWrapperClasses(THEME), `controls-Grid__cell_spacingRight`);
        });
    });

    describe('Controls/grid_clean/Display/HeaderRow/MultilineHeader', () => {
        it('Simple multiline cells', () => {
            const columns = [{}, {}, {}];

            /* |             |   Two columns                                                |
               |  Two rows   |   --------------------------------------------------------   |
               |             |   Second row, first column   |   Second row, second column   | */
            const header = [
                { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2, caption: 'Two rows' },
                { startRow: 1, endRow: 2, startColumn: 2, endColumn: 4, caption: 'Two columns'},
                { startRow: 2, endRow: 3, startColumn: 2, endColumn: 3, caption: 'Second row, first column' },
                { startRow: 1, endRow: 3, startColumn: 3, endColumn: 4, caption: 'Second row, second column' }];

            const mockedHeaderOwner = {
                getStickyColumnsCount: () => 0,
                hasMultiSelectColumn: () => false,
                getColumnsConfig: () => columns,
                getHeaderConfig: () => header,
                hasItemActionsSeparatedCell: () => false,
                getLeftPadding: () => 's',
                getRightPadding: () => 's',
                isStickyHeader: () => false,
                hasColumnScroll: () => false
            };

            const mockedHeaderModel = {
                isMultiline: () => true,
                getBounds: () => {
                    return {
                        column: {
                            start: 1,
                            end: 4
                        },
                        row: {
                            start: 1,
                            end: 3
                        }
                    }
                }
            }

            const headerRow = new GridHeaderRow({
                header,
                headerModel: mockedHeaderModel,
                columns,
                owner: mockedHeaderOwner
            });
            const columnItems = headerRow.getColumns();
            assert.strictEqual(columnItems.length, 4);

            assert.isFalse(columnItems[0].isLastColumn());
            assert.isTrue(columnItems[1].isLastColumn());
            assert.isFalse(columnItems[2].isLastColumn());
            assert.isTrue(columnItems[3].isLastColumn());
        });

        it('Difficult multiline cells', () => {
            const columns = [{}, {}, {}, {}];

            /* |             |   Two columns                                                |                 |
               |  Two rows   |   --------------------------------------------------------   |   Two rows,     |
               |             |   Second row, first column   |   Second row, second column   |   last column   | */
            const header = [
                { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2, caption: 'Two rows' },
                { startRow: 1, endRow: 2, startColumn: 2, endColumn: 4, caption: 'Two columns'},
                { startRow: 2, endRow: 3, startColumn: 2, endColumn: 3, caption: 'Second row, first column' },
                { startRow: 1, endRow: 3, startColumn: 3, endColumn: 4, caption: 'Second row, second column' },
                { startRow: 1, endRow: 3, startColumn: 4, endColumn: 5, caption: 'Two rows, last column' }];

            const mockedHeaderOwner = {
                getStickyColumnsCount: () => 0,
                hasMultiSelectColumn: () => false,
                getColumnsConfig: () => columns,
                getHeaderConfig: () => header,
                hasItemActionsSeparatedCell: () => false,
                getLeftPadding: () => 's',
                getRightPadding: () => 's',
                isStickyHeader: () => false,
                hasColumnScroll: () => false
            };

            const mockedHeaderModel = {
                isMultiline: () => true,
                getBounds: () => {
                    return {
                        column: {
                            start: 1,
                            end: 5
                        },
                        row: {
                            start: 1,
                            end: 3
                        }
                    }
                }
            }

            const headerRow = new GridHeaderRow({
                header,
                headerModel: mockedHeaderModel,
                columns,
                owner: mockedHeaderOwner
            });
            const columnItems = headerRow.getColumns();
            assert.strictEqual(columnItems.length, 5);

            assert.isFalse(columnItems[0].isLastColumn());
            assert.isFalse(columnItems[1].isLastColumn());
            assert.isFalse(columnItems[2].isLastColumn());
            assert.isFalse(columnItems[3].isLastColumn());
            assert.isTrue(columnItems[4].isLastColumn());
        });

        it('Difficult multiline cells with multiSelect', () => {
            const columns = [{}, {}, {}, {}];

            /* |             |   Two columns                                                |                 |
               |  Two rows   |   --------------------------------------------------------   |   Two rows,     |
               |             |   Second row, first column   |   Second row, second column   |   last column   | */
            const header = [
                { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2, caption: 'Two rows' },
                { startRow: 1, endRow: 2, startColumn: 2, endColumn: 4, caption: 'Two columns'},
                { startRow: 2, endRow: 3, startColumn: 2, endColumn: 3, caption: 'Second row, first column' },
                { startRow: 1, endRow: 3, startColumn: 3, endColumn: 4, caption: 'Second row, second column' },
                { startRow: 1, endRow: 3, startColumn: 4, endColumn: 5, caption: 'Two rows, last column' }];

            const mockedHeaderOwner = {
                getStickyColumnsCount: () => 0,
                hasMultiSelectColumn: () => true,
                getColumnsConfig: () => columns,
                getHeaderConfig: () => header,
                hasItemActionsSeparatedCell: () => false,
                getLeftPadding: () => 's',
                getRightPadding: () => 's',
                isStickyHeader: () => false,
                hasColumnScroll: () => false
            };

            const mockedHeaderModel = {
                isMultiline: () => true,
                getBounds: () => {
                    return {
                        column: {
                            start: 1,
                            end: 5
                        },
                        row: {
                            start: 1,
                            end: 3
                        }
                    }
                }
            }

            const headerRow = new GridHeaderRow({
                header,
                headerModel: mockedHeaderModel,
                columns,
                owner: mockedHeaderOwner
            });
            const columnItems = headerRow.getColumns();
            assert.strictEqual(columnItems.length, 6);

            assert.isFalse(columnItems[0].isLastColumn());
            assert.isFalse(columnItems[1].isLastColumn());
            assert.isFalse(columnItems[2].isLastColumn());
            assert.isFalse(columnItems[3].isLastColumn());
            assert.isFalse(columnItems[4].isLastColumn());
            assert.isTrue(columnItems[5].isLastColumn());
        });
    });
});
