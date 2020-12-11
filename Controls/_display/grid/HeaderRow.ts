import {THeader} from 'Controls/grid';
import Row, {IOptions as IRowOptions} from './Row';
import Header from './Header';

export interface IOptions<T> extends IRowOptions<T> {
    header: THeader;
    headerModel: Header<T>
}


export default class HeaderRow<T> extends Row<T> {
    protected _$header: THeader;
    protected _$headerModel: Header<T>;

    constructor(options?: IOptions<T>) {
        super(options);
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
        return 'header' as unknown as T
    }

    getItemClasses(params): string {
        return `controls-Grid__header controls-Grid__header_theme-${params.theme}`;
    }

    protected _initializeColumns(): void {
        if (this._$header) {
            this._$columnItems = [];
            const factory = this._getColumnsFactory();
            this._$columnItems = this._$header.map((column) => factory({
                column
            }));
            this._addCheckBoxColumnIfNeed();
        }
    }

    protected _addCheckBoxColumnIfNeed(): void {
        const factory = this._getColumnsFactory();
        if (this._$owner.needMultiSelectColumn()) {
            const {start, end} = this._$headerModel.getBounds().row;
            this._$columnItems.unshift(factory({
                column: {
                    startRow: start,
                    endRow: end
                }
            }));
        }
    }
}

Object.assign(HeaderRow.prototype, {
    '[Controls/_display/grid/HeaderRow]': true,
    _moduleName: 'Controls/display:GridHeaderRow',
    _instancePrefix: 'grid-header-row-',
    _cellModule: 'Controls/display:GridHeaderCell',
    _$header: null,
    _$headerModel: null
});
