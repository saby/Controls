import { mixin } from 'Types/util';
import { OptionsToPropertyMixin } from 'Types/entity';
import { THeader} from 'Controls/grid';
import GridCollection from './GridCollection';
import GridHeaderCell from './GridHeaderCell';

export interface IOptions<T> {
    owner: GridCollection<T>;
    header: THeader;
}

type THeaderCells<T> = Array<GridHeaderCell<T>>;

export default class GridHeader<T> extends mixin<OptionsToPropertyMixin>(OptionsToPropertyMixin) {
    protected _$owner: GridCollection<T>;
    protected _$cells: THeaderCells<T>;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
        this._$cells = this._prepareCells(options.header);
    }

    getBodyClasses(theme: string): string {
        return `controls-Grid__header controls-Grid__header_theme-${theme}`;
    }

    getCells(): THeaderCells<T> {
        return this._$cells;
    }

    getCellIndex(cell: GridHeaderCell<T>): number {
        return this._$cells.indexOf(cell);
    }

    getColumnsCount(): number {
        return this._$cells.length;
    }

    getTopPadding(): string {
        return this._$owner.getTopPadding().toLowerCase();
    }

    getBottomPadding(): string {
        return this._$owner.getBottomPadding().toLowerCase();
    }

    getLeftPadding(): string {
        return this._$owner.getLeftPadding().toLowerCase();
    }

    getRightPadding(): string {
        return this._$owner.getRightPadding().toLowerCase();
    }

    getMultiSelectVisibility(): string {
        return this._$owner.getMultiSelectVisibility();
    }

    isStickyHeader(): boolean {
        return this._$owner.isStickyHeader();
    }

    protected _prepareCells(header: THeader): THeaderCells<T> {
        const cells = [];
        if (this._$owner.getMultiSelectVisibility()) {
            cells.push(new GridHeaderCell({
                headerCell: {},
                owner: this
            }));
        }
        header.forEach((elem) => {
            const cell = new GridHeaderCell({
                headerCell: elem,
                owner: this
            });
            cells.push(cell);
        });
        return cells;
    }
}

Object.assign(GridHeader.prototype, {
    _moduleName: 'Controls/display:GridHeader',
    _$owner: null
});
