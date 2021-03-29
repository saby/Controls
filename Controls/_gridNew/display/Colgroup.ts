import { mixin } from 'Types/util';
import { OptionsToPropertyMixin, VersionableMixin } from 'Types/entity';

import { TColumns } from 'Controls/interface';

import Collection from './Collection';
import ColgroupCell from './ColgroupCell';

type TColgroupCells<T> = Array<ColgroupCell<T>>;

export interface IOptions<T> {
    owner: Collection<T>;
}

export default class Colgroup<T> extends mixin<
    OptionsToPropertyMixin,
    VersionableMixin
>(
    OptionsToPropertyMixin,
    VersionableMixin
) {
    protected _$owner: Collection<T>;
    protected _$cells: TColgroupCells<T>;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
        this._$cells = this._prepareCells(this._$owner.getColumnsConfig());
    }

    getBodyClasses(): string {
        return 'controls-Grid__colgroup';
    }

    getCells(): TColgroupCells<T> {
        return this._$cells;
    }

    getCellIndex(cell: ColgroupCell<T>): number {
        return this._$cells.indexOf(cell);
    }

    getMultiSelectVisibility(): string {
        return this._$owner.getMultiSelectVisibility();
    }

    setMultiSelectVisibility(newVisibility: string) {
        // TODO: Можно переделать на чесное обновление, не критично.
        this.reBuild();
    }

    hasMultiSelectColumn(): boolean {
        return this._$owner.hasMultiSelectColumn();
    }

    reBuild(): void {
        this._$cells = this._prepareCells(this._$owner.getColumnsConfig());
        this._nextVersion();
    }

    setColumns(newColumns: TColumns): void {
        // TODO: Можно переделать на чесное обновление, не критично.
        this.reBuild();
    }

    protected _prepareCells(columns: TColumns): TColgroupCells<T> {
        const cells = [];

        if (this.hasMultiSelectColumn()) {
            cells.push(new ColgroupCell({
                owner: this
            }));
        }

        columns.forEach((elem) => {
            cells.push(new ColgroupCell({
                owner: this,
                width: elem.width,
                compatibleWidth: elem.compatibleWidth
            }));
        });

        return cells;
    }
}

Object.assign(Colgroup.prototype, {
    '[Controls/_display/grid/Colgroup]': true,
    _moduleName: 'Controls/display:GridColgroup',
    _instancePrefix: 'grid-colgroup',
    _$owner: null
});
