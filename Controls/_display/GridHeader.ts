import GridCollection from './GridCollection';
import GridHeaderRow, {IOptions as IGridHeaderRowOptions} from './GridHeaderRow';
import { create } from 'Types/di';

export interface IOptions<T> extends IGridHeaderRowOptions<T> {}

interface IGridHeaderBounds {
    row: {start: number, end: number},
    column: {start: number, end: number}
}

export default class GridHeader<T> {
    protected _$owner: GridCollection<T>;
    protected _$rows: Array<GridHeaderRow<T>>;
    protected _$gridHeaderBounds: IGridHeaderBounds;

    constructor(options: IOptions<T>) {
        this._$owner = options.owner;
        this._$rows = this._initializeRows(options);
    }

    getBounds(): IGridHeaderBounds {
        return this._$gridHeaderBounds;
    }

    getRow(): GridHeaderRow<T> {
        return this._$rows[0];
    }

    getRowIndex(row: GridHeaderRow<T>): number {
        return this._$rows.indexOf(row);
    }

    isMultiline(): boolean {
        return (this._$gridHeaderBounds.row.end - this._$gridHeaderBounds.row.start) > 1;
    }

    isSticked(): boolean {
        return this._$owner.isStickyHeader() && this._$owner.isFullGridSupport();
    }

    protected _initializeRows(options: IOptions<T>): Array<GridHeaderRow<T>> {
        this._$gridHeaderBounds = this._getGridHeaderBounds(options);
        return this._buildRows(options);
    }

    protected _buildRows(options: IOptions<T>): Array<GridHeaderRow<T>> {
        const factory = this._getRowsFactory();
        return [new factory(options)];
    }

    protected _getGridHeaderBounds(options: IOptions<T>): IGridHeaderBounds {
        const bounds: IGridHeaderBounds = {
            row: {start: Number.MAX_VALUE, end: Number.MIN_VALUE},
            column: {start: 1, end: options.columns.length + 1}
        };

        for (let i = 0; i < options.header.length; i++) {
            if (typeof options.header[i].startRow === 'number') {
                bounds.row.start = Math.min(options.header[i].startRow, bounds.row.start);
            } else {
                // Одноуровневая шапка либо невалидная конфигурация шапки
                bounds.row.start = 1;
                bounds.row.end = 2;
                break;
            }

            if (typeof options.header[i].endRow === 'number') {
                bounds.row.end = Math.max(options.header[i].endRow, bounds.row.end);
            } else {
                // Одноуровневая шапка либо невалидная конфигурация шапки
                bounds.row.start = 1;
                bounds.row.end = 2;
                break;
            }
        }
        return bounds;
    }

    protected _getRowsFactory(): new (options: IOptions<T>) => GridHeaderRow<T> {
        return (options: IOptions<T>) => {
            options.headerModel = this;
            return create(this._rowModule, options as IGridHeaderRowOptions<T>);
        };
    }
}

Object.assign(GridHeader.prototype, {
    _moduleName: 'Controls/display:GridHeader',
    _instancePrefix: 'grid-header-',
    _rowModule: 'Controls/display:GridHeaderRow',
    _cellModule: 'Controls/display:GridHeaderCell'
});
