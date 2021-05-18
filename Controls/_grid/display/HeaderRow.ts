import { Model } from 'Types/entity';

import {
    ICellPadding,
    IColumn,
    IColumnSeparatorSizeConfig,
    IHeaderCell,
    TColumnSeparatorSize,
    THeader
} from 'Controls/interface';

import Row, {IOptions as IRowOptions} from './Row';
import Header, {IHeaderBounds} from './Header';
import ItemActionsCell from './ItemActionsCell';
import Cell from './Cell';
import HeaderCell from './HeaderCell';

export interface IOptions<T> extends IRowOptions<T> {
    header: THeader;
    headerModel: Header<T>;
}

export default class HeaderRow<T> extends Row<T> {
    protected _$header: THeader;
    protected _$headerModel: Header<T>;
    protected _$sorting: Array<{[p: string]: string}>;

    constructor(options?: IOptions<T>) {
        super(options);

        // Заголовок будет всегда застикан при отрисовке, когда есть данные вверх
        this._shadowVisibility = this.hasMoreDataUp() ? 'initial' : 'lastVisible';
    }

    getIndex(): number {
        return this._$owner.getRowIndex(this);
    }

    isSticked(): boolean {
        return this._$headerModel.isSticked();
    }

    isMultiline(): boolean {
        return this._$headerModel.isMultiline();
    }

    getContents(): T {
        return 'header' as unknown as T;
    }

    getItemClasses(): string {
        return 'controls-Grid__header';
    }

    getColumnIndex(cell: HeaderCell<T>, takeIntoAccountColspans: boolean = false): number {
        const superIndex = super.getColumnIndex.apply(this, arguments);
        const columnItems = this.getColumns() as HeaderCell<T>[];
        let ladderCells = 0;

        // Ищем индекс ячейки, попутно считаем колспаны предыдущих.
        columnItems.forEach((columnItem, index) => {
            if (columnItem.isLadderCell() && index < superIndex) {
                ladderCells++;
            }
        });

        return superIndex - ladderCells;
    }


    protected _processStickyLadderCells(): void {
        // todo Множественный stickyProperties можно поддержать здесь:
        const stickyLadderProperties = this.getStickyLadderProperties(this._$columns[0]);
        const stickyLadderCellsCount = stickyLadderProperties && stickyLadderProperties.length || 0;

        if (stickyLadderCellsCount === 2) {
            this._$columnItems.splice(1, 0, new HeaderCell({
                column: {},
                isLadderCell: true,
                owner: this,
                backgroundStyle: 'transparent',
                shadowVisibility: 'hidden'
            }));
        }

        if (stickyLadderCellsCount) {
            this._$columnItems = ([
                new HeaderCell({
                    column: {},
                    isLadderCell: true,
                    owner: this,
                    shadowVisibility: 'hidden',
                    backgroundStyle: 'transparent'
                })
            ] as Array<Cell<T, Row<T>>>).concat(this._$columnItems);
        }
    }
    getBounds(): IHeaderBounds {
        return this._$headerModel.getBounds();
    }

    protected _initializeColumns(): void {
        if (this._$header) {
            this._$columnItems = [];
            const factory = this.getColumnsFactory();
            let totalColspan = 0;
            this._$columnItems = this._$header.map((column, index) => {
                const isFixed = (this.isMultiline() ? (column.startColumn - 1) : totalColspan) < this.getStickyColumnsCount();
                totalColspan += (column.endColumn - column.startColumn) || 1;
                return factory({
                    column,
                    isFixed,
                    sorting: this._getSortingBySortingProperty(column.sortingProperty),
                    cellPadding: this._getCellPaddingForHeaderColumn(column, index),
                    columnSeparatorSize: this._getColumnSeparatorSizeForColumn(column, index),
                    shadowVisibility: this.getShadowVisibility()
                });
            });

            this._processStickyLadderCells();
            this._addCheckBoxColumnIfNeed();

            if (this.hasItemActionsSeparatedCell()) {
                this._$columnItems.push(new ItemActionsCell({
                    owner: this,
                    rowspan: this.getBounds().row.end - this.getBounds().row.start,
                    column: {}
                }));
            }
        }
    }

    protected _addCheckBoxColumnIfNeed(): void {
        const factory = this.getColumnsFactory();
        if (this._$owner.hasMultiSelectColumn()) {
            const {start, end} = this._$headerModel.getBounds().row;
            this._$columnItems.unshift(factory({
                column: {
                    startRow: start,
                    endRow: end,
                    startColumn: 1,
                    endColumn: 2
                },
                isFixed: true,
                shadowVisibility: this.getShadowVisibility()
            }));
        }
    }

    protected _getCellPaddingForHeaderColumn(headerColumn: IHeaderCell, columnIndex: number): ICellPadding {
        const columns = this.getColumnsConfig();
        const headerColumnIndex =
            typeof headerColumn.startColumn !== 'undefined' ? headerColumn.startColumn - 1 : columnIndex;
        return columns[headerColumnIndex].cellPadding;
    }

    protected _updateSeparatorSizeInColumns(separatorName: 'Column'): void {
        this._$header.forEach((column, columnIndex) => {
            const multiSelectOffset = this.hasMultiSelectColumn() ? 1 : 0;
            const cell = this._$columnItems[columnIndex + multiSelectOffset];
            cell[`set${separatorName}SeparatorSize`](
                this[`_get${separatorName}SeparatorSizeForColumn`](column, columnIndex)
            );
        });
    }

    protected _getColumnSeparatorSizeForColumn(column: IHeaderCell, columnIndex: number): TColumnSeparatorSize {
        if (columnIndex > 0) {
            const currentColumn = {
                ...column,
                columnSeparatorSize: this._getHeaderColumnSeparatorSize(column, columnIndex)
            } as IColumn;

            const prevColumnIndex = columnIndex - (
                columnIndex > 1 && this._$header[columnIndex - 1].startColumn === column.startColumn ? 2 : 1);

            const previousColumn: IColumn = {
                ...this._$header[prevColumnIndex],
                columnSeparatorSize: this._getHeaderColumnSeparatorSize(this._$header[prevColumnIndex], prevColumnIndex)
            } as IColumn;

            return this._resolveColumnSeparatorSize(currentColumn, previousColumn);
        }
        return null;
    }

    private _getHeaderColumnSeparatorSize(headerColumn: IHeaderCell, columnIndex: number): IColumnSeparatorSizeConfig {
        const columnSeparatorSize: IColumnSeparatorSizeConfig = {};
        const columns = this.getColumnsConfig();
        const columnLeftIndex =
            typeof headerColumn.startColumn !== 'undefined' ? headerColumn.startColumn - 1 : columnIndex;
        const columnRightIndex =
            typeof headerColumn.endColumn !== 'undefined' ? headerColumn.endColumn - 2 : columnIndex;
        const columnLeft = columns[columnLeftIndex];
        const columnRight = columns[columnRightIndex];
        if (columnLeft?.columnSeparatorSize?.hasOwnProperty('left')) {
            columnSeparatorSize.left = columnLeft.columnSeparatorSize.left;
        }
        if (columnRight?.columnSeparatorSize?.hasOwnProperty('right')) {
            columnSeparatorSize.right = columnRight.columnSeparatorSize.right;
        }
        return columnSeparatorSize;
    }

    setSorting(sorting: Array<{[p: string]: string}>): void {
        this._$sorting = sorting;
        this._reinitializeColumns(true);
    }

    private _getSortingBySortingProperty(property: string): string {
        const sorting = this._$sorting;
        let sortingDirection;
        if (sorting && property) {
            sorting.forEach((elem) => {
                if (elem[property]) {
                    sortingDirection = elem[property];
                }
            });
        }
        return sortingDirection;
    }
}

Object.assign(HeaderRow.prototype, {
    '[Controls/_display/grid/HeaderRow]': true,
    _moduleName: 'Controls/grid:GridHeaderRow',
    _instancePrefix: 'grid-header-row-',
    _cellModule: 'Controls/grid:GridHeaderCell',
    _$header: null,
    _$headerModel: null,
    _$sorting: null
});
