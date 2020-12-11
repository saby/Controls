import Collection from './Collection';
import HeaderRow, {IOptions as IHeaderRowOptions} from './HeaderRow';
import { create } from 'Types/di';

export interface IOptions<T> extends IHeaderRowOptions<T> {}

interface IHeaderBounds {
    row: {start: number, end: number},
    column: {start: number, end: number}
}

export default class Header<T> {
    protected _$owner: Collection<T>;
    protected _$rows: Array<HeaderRow<T>>;
    protected _$headerBounds: IHeaderBounds;

    constructor(options: IOptions<T>) {
        this._$owner = options.owner;
        this._$rows = this._initializeRows(options);
    }

    getBounds(): IHeaderBounds {
        return this._$headerBounds;
    }

    getRow(): HeaderRow<T> {
        return this._$rows[0];
    }

    getRowIndex(row: HeaderRow<T>): number {
        return this._$rows.indexOf(row);
    }

    isMultiline(): boolean {
        return (this._$headerBounds.row.end - this._$headerBounds.row.start) > 1;
    }

    isSticked(): boolean {
        return this._$owner.isStickyHeader() && this._$owner.isFullGridSupport();
    }

    protected _initializeRows(options: IOptions<T>): Array<HeaderRow<T>> {
        this._$headerBounds = this._getGridHeaderBounds(options);
        return this._buildRows(options);
    }

    protected _buildRows(options: IOptions<T>): Array<HeaderRow<T>> {
        const factory = this._getRowsFactory();
        return [new factory(options)];
    }

    protected _getGridHeaderBounds(options: IOptions<T>): IHeaderBounds {
        const bounds: IHeaderBounds = {
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

    protected _getRowsFactory(): new (options: IOptions<T>) => HeaderRow<T> {
        return (options: IOptions<T>) => {
            options.headerModel = this;
            return create(this._rowModule, options as IHeaderRowOptions<T>);
        };
    }
}

Object.assign(Header.prototype, {
    '[Controls/_display/grid/Header]': true,
    _moduleName: 'Controls/display:GridHeader',
    _instancePrefix: 'grid-header-',
    _rowModule: 'Controls/display:GridHeaderRow',
    _cellModule: 'Controls/display:GridHeaderCell'
});
