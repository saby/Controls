import {IColumn, THeader} from 'Controls/grid';
import {GridCollection, GridHeader, TColspanCallback} from 'Controls/grid';
import {Model as EntityModel, Model} from 'Types/entity';
import {assert} from 'chai';
import { CssClassesAssert as cAssert } from '../../../../CustomAsserts';

describe('Controls/grid_clean/Display/header/HeaderCell/ColumnSeparatorSize', () => {
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

        // Header cells map:
        // | 0 | 1 |__ 2 __| 5 |
        // |   |   | 3 | 4 |   |
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
        cAssert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s');
    });

    it('should add separatorClass according to the column left columnSeparatorSize config', () => {
        columns[1].columnSeparatorSize = {left: 's', right: null};
        const cells = getGridHeader().getRow().getColumns();
        const wrapperClasses = cells[1].getWrapperClasses('default', 'default', 'default', false);
        cAssert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s');
    });

    it('should add separatorClass according to the previous column right columnSeparatorSize config', () => {
        columns[1].columnSeparatorSize = {left: null, right: 's'};
        const cells = getGridHeader().getRow().getColumns();
        const wrapperClasses = cells[2].getWrapperClasses('default', 'default', 'default', false);
        cAssert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s');
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
            cAssert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s',
                `column at index ${index} should include separator`);
        });
        [1, 5].forEach((index) => {
            wrapperClasses = cells[index].getWrapperClasses('default', 'default', 'default', false);
            cAssert.notInclude(wrapperClasses, 'controls-Grid__columnSeparator_size-s',
                `column at index ${index} should not include separator`);
        });
    });

    it('Only column settings + only right = add separators before 2, 3, 5', () => {
        columns[1].columnSeparatorSize = {right: 's'};
        columns[3].columnSeparatorSize = {right: 's'};
        const headerModel = getGridHeader();
        const cells = headerModel.getRow().getColumns();

        let wrapperClasses: string;
        [2, 3, 5].forEach((index) => {
            wrapperClasses = cells[index].getWrapperClasses('default', 'default', 'default', false);
            cAssert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s',
                `column at index ${index} should include separator`);
        });
        [1, 4].forEach((index) => {
            wrapperClasses = cells[index].getWrapperClasses('default', 'default', 'default', false);
            cAssert.notInclude(wrapperClasses, 'controls-Grid__columnSeparator_size-s',
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
            cAssert.include(wrapperClasses, 'controls-Grid__columnSeparator_size-s',
                `column at index ${index} should include separator`);
        });
        [0, 4].forEach((index) => {
            wrapperClasses = cells[index].getWrapperClasses('default', 'default', 'default', false);
            cAssert.notInclude(wrapperClasses, 'controls-Grid__columnSeparator_size-s',
                `column at index ${index} should not include separator`);
        });
    });
});
