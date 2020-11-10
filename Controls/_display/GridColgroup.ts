import { mixin } from 'Types/util';
import { OptionsToPropertyMixin } from 'Types/entity';
import GridCollection from './GridCollection';
import { TColumns } from '../_grid/interface/IColumn';
import GridColgroupCell from './GridColgroupCell';

type TColgroupCells<T> = Array<GridColgroupCell<T>>;

export interface IOptions<T> {
    owner: GridCollection<T>;
}

export default class GridColgroup<T> extends mixin<OptionsToPropertyMixin>(OptionsToPropertyMixin) {
    protected _$owner: GridCollection<T>;
    protected _$cells: TColgroupCells<T>;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
        this._$cells = this._prepareCells(this._$owner.getColumns());
    }

    getBodyClasses(): string {
        return 'controls-Grid__colgroup';
    }

    getCells(): TColgroupCells<T> {
        return this._$cells;
    }

    getCellIndex(cell: GridColgroupCell<T>): number {
        return this._$cells.indexOf(cell);
    }

    getMultiSelectVisibility(): string {
        return this._$owner.getMultiSelectVisibility();
    }

    protected _prepareCells(columns: TColumns): TColgroupCells<T> {
        const cells = [];

        if (this._$owner.getMultiSelectVisibility() !== 'hidden') {
            cells.push(new GridColgroupCell({
                owner: this
            }));
        }

        columns.forEach((elem) => {
            cells.push(new GridColgroupCell({
                owner: this,
                width: elem.width,
                compatibleWidth: elem.compatibleWidth
            }));
        });

        return cells;
    }
}

Object.assign(GridColgroup.prototype, {
    _moduleName: 'Controls/display:GridColgroup',
    _$owner: null
});
