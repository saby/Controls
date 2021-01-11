import { assert } from 'chai';
import { Model as EntityModel, Model } from 'Types/entity';

import { GridCollection, GridDataCell, GridDataRow, TColspanCallback } from 'Controls/display';
import { IColumn } from 'Controls/grid';

describe('Controls/display/GridDataCell', () => {
    let owner: GridDataRow<Model>;
    let cell: GridDataCell<Model, GridDataRow<Model>>;
    let multiSelectVisibility: string;
    let columnIndex: number;
    let columnsCount: number;
    let column: IColumn;
    let editArrowIsVisible: boolean;

    function initCell(): GridDataCell<Model, GridDataRow<Model>> {
        cell = new GridDataCell<Model, GridDataRow<Model>>({
            owner,
            column
        });
        return cell;
    }

    beforeEach(() => {
        column = {
            width: '1px'
        };
        multiSelectVisibility = 'hidden';
        columnIndex = 0;
        columnsCount = 4;
        editArrowIsVisible = false;
        owner = {
            getColumnIndex(): number {
                return columnIndex;
            },
            editArrowIsVisible(): boolean {
                return editArrowIsVisible;
            },
            getContents(): Model {
                return {} as undefined as Model;
            }
        } as Partial<GridDataRow<Model>> as undefined as GridDataRow<Model>;
    });

    // region Аспект "Кнопка редактирования"

    describe('editArrow', () => {
        it('shouldDisplayEditArrow should return true for first column', () => {
            editArrowIsVisible = true;
            assert.isTrue(initCell().shouldDisplayEditArrow());
        });
        it('shouldDisplayEditArrow should not return true for non-first column', () => {
            editArrowIsVisible = true;
            columnIndex = 3;
            assert.isFalse(initCell().shouldDisplayEditArrow());
        });
    });

    // endregion

    describe('ColumnSeparatorSize', () => {
        let columns: IColumn[];
        let hasMultiSelectColumn: boolean;
        let stickyColumnsCount: number;
        let hasItemActionsSeparatedCell: boolean;
        let hasColumnScroll: boolean;

        function getGridRow(): GridDataRow<Model> {
            const owner: GridCollection<Model> = {
                hasMultiSelectColumn: () => hasMultiSelectColumn,
                getStickyColumnsCount: () => stickyColumnsCount,
                getColumnsConfig: () => columns,
                hasItemActionsSeparatedCell: () => hasItemActionsSeparatedCell,
                hasColumnScroll: () => hasColumnScroll,
                getHoverBackgroundStyle: () => 'default',
                getTopPadding: () => 'null',
                getBottomPadding: () => 'null',
                isEditing: () => false,
                isDragging: () => false,
                getEditingBackgroundStyle: () => 'default',
                isActive: () => false,
                getRowSeparatorSize: () => 's'
            } as undefined as GridCollection<Model>;
            return new GridDataRow({
                columns,
                owner,
                colspanCallback: ((item: EntityModel, column: IColumn, columnIndex: number, isEditing: boolean) => {
                    return null; // number | 'end'
                }) as TColspanCallback
            });
        }

        beforeEach(() => {
            hasMultiSelectColumn = false;
            stickyColumnsCount = 0;
            hasItemActionsSeparatedCell = false;
            hasColumnScroll = false;
            columns = [{ width: '1px'}, { width: '1px'}, { width: '1px'}, { width: '1px'}];
        });

        it('should add columnSeparatorSize based on grid\'s columnSeparatorSize', () => {
            const row = getGridRow();
            row.setColumnSeparatorSize('s');
            cell = row.getColumns()[1] as GridDataCell<Model, GridDataRow<Model>>;;
            const wrapperClasses = cell.getWrapperClasses('default', 'default', 'default', true);
            assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s_theme-default');
        });

        it('should add columnSeparatorSize based on current column\'s left columnSeparatorSize', () => {
            columns[1].columnSeparatorSize = {left: 's', right: null};
            const row = getGridRow();
            cell = row.getColumns()[1] as GridDataCell<Model, GridDataRow<Model>>;;
            const wrapperClasses = cell.getWrapperClasses('default', 'default', 'default', true);
            assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s_theme-default');
        });

        it('should add columnSeparatorSize based on previous column\'s right columnSeparatorSize config', () => {
            columns[1].columnSeparatorSize = {left: null, right: 's'};
            const row = getGridRow();
            let wrapperClasses: string;
            cell = row.getColumns()[1] as GridDataCell<Model, GridDataRow<Model>>;
            wrapperClasses = cell.getWrapperClasses('default', 'default', 'default', true);
            assert.notInclude(wrapperClasses, 'controls-Grid__columnSeparator_size-s_theme-default');

            cell = row.getColumns()[2] as GridDataCell<Model, GridDataRow<Model>>;
            wrapperClasses = cell.getWrapperClasses('default', 'default', 'default', true);
            assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s_theme-default');
        });

        it('should add columnSeparatorSize based on grid\'s columnSeparatorSize when multiSelect', () => {
            hasMultiSelectColumn = true;
            const row = getGridRow();
            row.setColumnSeparatorSize('s');
            cell = row.getColumns()[2] as GridDataCell<Model, GridDataRow<Model>>;
            const wrapperClasses = cell.getWrapperClasses('default', 'default', 'default', true);
            assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s_theme-default');
        });

        it('should add columnSeparatorSize based on current column config when multiSelect', () => {
            hasMultiSelectColumn = true;
            columns[1].columnSeparatorSize = {left: 's', right: null};
            const row = getGridRow();
            cell = row.getColumns()[2] as GridDataCell<Model, GridDataRow<Model>>;
            const wrapperClasses = cell.getWrapperClasses('default', 'default', 'default', true);
            assert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s_theme-default');
        });

    });
});
