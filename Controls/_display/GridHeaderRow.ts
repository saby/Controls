import {THeader} from 'Controls/grid';
import GridRow, {IOptions as IGridRowOptions} from './GridRow';
import GridHeader from './GridHeader';

export interface IOptions<T> extends IGridRowOptions<T> {
    header: THeader;
    headerModel: GridHeader<T>
}


export default class GridHeaderRow<T> extends GridRow<T> {
    protected _$header: THeader;
    protected _$headerModel: GridHeader<T>;

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
        if (this._$owner.getMultiSelectVisibility() !== 'hidden') {
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

Object.assign(GridHeaderRow.prototype, {
    _moduleName: 'Controls/display:GridHeaderRow',
    _instancePrefix: 'grid-header-row-',
    _cellModule: 'Controls/display:GridHeaderCell',
    _$header: null,
    _$headerModel: null
});
