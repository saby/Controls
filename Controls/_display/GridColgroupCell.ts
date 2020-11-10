import {mixin} from 'Types/util';
import {OptionsToPropertyMixin} from 'Types/entity';
import GridColgroup from './GridColgroup';

export interface IOptions<T> {
    owner: GridColgroup<T>;
    width?: string;
    compatibleWidth?: string;
}

const REG_EXP_PIXEL_WIDTH_VALUE = new RegExp('^[0-9]+px$');
const REG_EXP_PERCENT_WIDTH_VALUE = new RegExp('^[0-9]+%$');

export default class GridColgroupCell<T> extends mixin<OptionsToPropertyMixin>(OptionsToPropertyMixin) {
    protected _$owner: GridColgroup<T>;
    protected _$width?: string;
    protected _$compatibleWidth?: string;

    isMultiSelectColumn(): boolean {
        return this._$owner.getMultiSelectVisibility() !== 'hidden' && this._$owner.getCellIndex(this) === 0;
    }

    getWrapperClasses(theme: string): string {
        let wrapperClasses = 'controls-Grid__colgroup-column';

        if (this.isMultiSelectColumn()) {
            wrapperClasses += ` controls-Grid__colgroup-columnMultiSelect_theme-${theme}`;
        }
        return wrapperClasses;
    }

    getWrapperStyles(): string {
        if (this.isMultiSelectColumn()) {
            // Ширина колонки чекбоксов задается через CSS класс
            return '';
        } else {
            return `width: ${this._getColumnWidth()};`;
        }
    }

    _getColumnWidth(): string {
        if (this._$compatibleWidth) {
            return this._$compatibleWidth;
        } else if (!this._$width) {
            return 'auto';
        } else if (GridColgroupCell._isCompatibleWidthValue(this._$width)) {
            return this._$width;
        } else {
            return 'auto';
        }
    }

    private static _isCompatibleWidthValue(value: string): boolean {
        return !!value.match(REG_EXP_PERCENT_WIDTH_VALUE) || !!value.match(REG_EXP_PIXEL_WIDTH_VALUE);
    }
}

Object.assign(GridColgroupCell.prototype, {
    _moduleName: 'Controls/display:GridColgroupCell',
    _instancePrefix: 'grid-colgroup-cell-',
    _$owner: null,
    _$width: null,
    _$compatibleWidth: null
});
