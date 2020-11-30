import { THeader} from 'Controls/grid';
import GridCollection from './GridCollection';
import GridRow from './GridRow';
import GridHeaderCell from './GridHeaderCell';

export interface IOptions<T> {
    owner: GridCollection<T>;
    header: THeader;
}


export default class GridHeaderRow<T> extends GridRow<T> {
    protected _$header: THeader;
    protected _$hasRowspan: boolean;

    constructor(options?: IOptions<T>) {
        super(options);
        this._$hasRowspan = !!options.header.find((c) => c.startRow > 1 || c.endColumn > 2 || c.rowSpan > 1);
    }


    isSticked(): boolean {
        return this._$owner.isStickyHeader() && this._$owner.isFullGridSupport();
    }

    hasRowspan(): boolean {
        return this._$hasRowspan;
    }

    getContents(): T {
        return 'header' as unknown as T
    }

    getItemClasses(): string {
        return `controls-Grid__header controls-Grid__header_theme-${this._$templateParams.theme}`;
    }

    protected _initializeColumns(): void {
        if (this._$columns) {
            this._$columnItems = [];
            const factory = this._getColumnsFactory();
            this._$columnItems = this._$header.map((column) => factory({
                column,
                startColumn: column.startColumn,
                endColumn: column.endColumn
            }));
        }
    }

    protected _prepareCells(header: THeader): THeaderCells<T> {
        const cells = [];
        const columns = this._$owner.getColumnsConfig();
        if (this._$owner.getMultiSelectVisibility() !== 'hidden') {
            cells.push(new GridHeaderCell({
                headerCell: {},
                owner: this
            }));
        }
        header.forEach((elem, index) => {
            const cell = new GridHeaderCell({
                headerCell: elem,
                owner: this,
                cellPadding: columns[index].cellPadding
            });
            cells.push(cell);
        });
        return cells;
    }
}

Object.assign(GridHeaderRow.prototype, {
    _moduleName: 'Controls/display:GridHeader',
    _instancePrefix: 'grid-header-row-',
    _cellModule: 'Controls/display:GridHeaderCell',
    _$header: null,
    _$hasRowspan: false
});
