import {mixin} from 'Types/util';
import {OptionsToPropertyMixin} from 'Types/entity';
import Colgroup from './Colgroup';

export interface IOptions<T> {
    owner: Colgroup<T>;
    width?: string;
    compatibleWidth?: string;
}

const REG_EXP_PIXEL_WIDTH_VALUE = new RegExp('^[0-9]+px$');
const REG_EXP_PERCENT_WIDTH_VALUE = new RegExp('^[0-9]+%$');

export default class ColgroupCell<T> extends mixin<OptionsToPropertyMixin>(OptionsToPropertyMixin) {
    protected _$owner: Colgroup<T>;
    protected _$width?: string;
    protected _$compatibleWidth?: string;

    isMultiSelectColumn(): boolean {
        return this._$owner.hasMultiSelectColumn() && this._$owner.getCellIndex(this) === 0;
    }

    getBodyClasses(theme: string): string {
        let bodyClasses = 'controls-Grid__colgroup-column';

        if (this.isMultiSelectColumn()) {
            bodyClasses += ` controls-Grid__colgroup-columnMultiSelect_theme-${theme}`;
        }
        return bodyClasses;
    }

    getBodyStyles(): string {
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
        } else if (ColgroupCell._isCompatibleWidthValue(this._$width)) {
            return this._$width;
        } else {
            return 'auto';
        }
    }

    getKey(): string {
        if (this._$owner.getMultiSelectVisibility() !== 'hidden') {
            if (this.isMultiSelectColumn()) {
                return '-1';
            } else {
                return `${this._$owner.getCellIndex(this) - 1}_${this._getColumnWidth()}`;
            }
        } else {
            return `${this._$owner.getCellIndex(this)}_${this._getColumnWidth()}`;
        }
    }

    private static _isCompatibleWidthValue(value: string): boolean {
        return !!value.match(REG_EXP_PERCENT_WIDTH_VALUE) || !!value.match(REG_EXP_PIXEL_WIDTH_VALUE);
    }
}

Object.assign(ColgroupCell.prototype, {
    '[Controls/_display/grid/ColgroupCell]': true,
    _moduleName: 'Controls/display:GridColgroupCell',
    _instancePrefix: 'grid-colgroup-cell-',
    _$owner: null,
    _$width: null,
    _$compatibleWidth: null
});
