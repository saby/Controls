import { assert } from 'chai';
import {Model as EntityModel, Model} from 'Types/entity';
import {
    GridCollection,
    GridHeader,
    GridHeaderCell,
    TColspanCallback
} from 'Controls/display';
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { THeader } from 'Controls/_grid/interface/IHeaderCell';

describe('Controls/display:HeaderCell', () => {
    describe('align and valign', () => {

        it('should use values from header if it exist', () => {
            const headerColumnConfig = {
                align: 'right',
                valign: 'bottom'
            };
            const cell = new GridHeaderCell({
                owner: {
                    getColumnsConfig: () => [{}],
                    getHeaderConfig: () => [headerColumnConfig],
                    hasMultiSelectColumn: () => false
                },
                column: headerColumnConfig,
            });
            assert.equal('right', cell.getAlign());
            assert.equal('bottom', cell.getVAlign());
        });

        it('should use values from columns if values on header not exist', () => {
            const headerColumnConfig = {};
            const cell = new GridHeaderCell({
                owner: {
                    getColumnsConfig: () => [{
                        align: 'right',
                        valign: 'bottom'
                    }],
                    getHeaderConfig: () => [headerColumnConfig],
                    hasMultiSelectColumn: () => false
                },
                column: headerColumnConfig,
            });
            assert.equal('right', cell.getAlign());
            assert.equal('bottom', cell.getVAlign());
        });

        it('should set valign center on row spanned cell if value on cell config not exists', () => {
            const headerColumnConfig = {
                startRow: 1,
                endRow: 3
            };
            const cell = new GridHeaderCell({
                owner: {
                    getColumnsConfig: () => [{
                        align: 'right',
                        valign: 'bottom'
                    }],
                    getHeaderConfig: () => [headerColumnConfig],
                    hasMultiSelectColumn: () => false
                },
                column: headerColumnConfig,
            });
            assert.equal('right', cell.getAlign());
            assert.equal('center', cell.getVAlign());
        });

        it('should set align center on colspanned cell if value on cell config not exists', () => {
            const headerColumnConfig = {
                startColumn: 1,
                endColumn: 3
            };
            const cell = new GridHeaderCell({
                owner: {
                    getColumnsConfig: () => [{
                        align: 'right',
                        valign: 'bottom'
                    }],
                    getHeaderConfig: () => [headerColumnConfig],
                    hasMultiSelectColumn: () => false
                },
                column: headerColumnConfig,
            });
            assert.equal('center', cell.getAlign());
            assert.equal('bottom', cell.getVAlign());
        });
    });

    describe('ColumnSeparatorSize', () => {
        let columns: IColumn[];
        let hasMultiSelectColumn: boolean;
        let stickyColumnsCount: number;
        let hasItemActionsSeparatedCell: boolean;
        let hasColumnScroll: boolean;
        let header: THeader;

        function getGridHeader(): GridHeader<Model> {
            const owner: GridCollection<Model> = {
                getHeaderConfig: () => header,
                hasMultiSelectColumn: () => hasMultiSelectColumn,
                getStickyColumnsCount: () => stickyColumnsCount,
                getColumnsConfig: () => columns,
                hasItemActionsSeparatedCell: () => hasItemActionsSeparatedCell,
                hasColumnScroll: () => hasColumnScroll,
                getHoverBackgroundStyle: () => 'default',
                getTopPadding: () => 'null',
                getBottomPadding: () => 'null',
                getLeftPadding: () => 'null',
                getRightPadding: () => 'null',
                isEditing: () => false,
                isDragging: () => false,
                getEditingBackgroundStyle: () => 'default',
                isActive: () => false,
                getRowSeparatorSize: () => 's',
                isStickyHeader: () => false
            } as undefined as GridCollection<Model>;
            return new GridHeader({
                header,
                columns,
                owner,
                headerModel: undefined,
                colspanCallback: ((item: EntityModel, column: IColumn, columnIndex: number, isEditing: boolean) => {
                    return null; // number | 'end'
                }) as TColspanCallback
            });
        }

        beforeEach('', () => {
            hasMultiSelectColumn = false;
            stickyColumnsCount = 0;
            hasItemActionsSeparatedCell = false;
            hasColumnScroll = false;
            columns = [{ width: '1px'}, { width: '1px'}, { width: '1px'}, { width: '1px'}, { width: '1px'}];
            header = [
                { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2},
                { startRow: 1, endRow: 3, startColumn: 2, endColumn: 3},
                { startRow: 1, endRow: 2, startColumn: 3, endColumn: 5},
                { startRow: 2, endRow: 3, startColumn: 3, endColumn: 4},
                { startRow: 2, endRow: 3, startColumn: 4, endColumn: 5},
                { startRow: 1, endRow: 3, startColumn: 5, endColumn: 6}
            ];
        });
        it('should add separatorClass according to default separatorSize', () => {
            const headerModel = getGridHeader();
            headerModel.setColumnSeparatorSize('s');
            const cells = headerModel.getRow().getColumns();
            const wrapperClasses = cells[1].getWrapperClasses('default', 'default', 'default', false);
            assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s_theme-default');
        });

        it('should add separatorClass according to the column left columnSeparatorSize config', () => {
            columns[1].columnSeparatorSize = {left: 's', right: null};
            const cells = getGridHeader().getRow().getColumns();
            const wrapperClasses = cells[1].getWrapperClasses('default', 'default', 'default', false);
            assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s_theme-default');
        });

        it('should add separatorClass according to the previous column right columnSeparatorSize config', () => {
            columns[1].columnSeparatorSize = {left: null, right: 's'};
            const cells = getGridHeader().getRow().getColumns();
            const wrapperClasses = cells[2].getWrapperClasses('default', 'default', 'default', false);
            assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s_theme-default');
        });

        it('should add separatorClass to the correct column when multiselect', () => {
            columns[2].columnSeparatorSize = {right: null};
            columns[3].columnSeparatorSize = {left: null};
            hasMultiSelectColumn = true;
            const headerModel = getGridHeader();
            headerModel.setColumnSeparatorSize('s');
            const cells = headerModel.getRow().getColumns();
            let wrapperClasses: string;
            [2, 3, 4, 6].forEach((index) => {
                wrapperClasses = cells[index].getWrapperClasses('default', 'default', 'default', false);
                assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s_theme-default',
                    `column at index ${index} should include separator`);
            });
            [1, 5].forEach((index) => {
                wrapperClasses = cells[index].getWrapperClasses('default', 'default', 'default', false);
                assert.notInclude(wrapperClasses, 'controls-Grid__columnSeparator_size-s_theme-default',
                    `column at index ${index} should not include separator`);
            });
        });

        it('should add separatorClass to the correct column when no multiselect', () => {
            columns[2].columnSeparatorSize = {right: null};
            columns[3].columnSeparatorSize = {left: null};
            const headerModel = getGridHeader();
            headerModel.setColumnSeparatorSize('s');
            const cells = headerModel.getRow().getColumns();
            let wrapperClasses: string;
            [1, 2, 3, 5].forEach((index) => {
                wrapperClasses = cells[index].getWrapperClasses('default', 'default', 'default', false);
                assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s_theme-default',
                    `column at index ${index} should include separator`);
            });
            [0, 4].forEach((index) => {
                wrapperClasses = cells[index].getWrapperClasses('default', 'default', 'default', false);
                assert.notInclude(wrapperClasses, 'controls-Grid__columnSeparator_size-s_theme-default',
                    `column at index ${index} should not include separator`);
            });
        });
    });
});
