import { TemplateFunction } from 'UI/Base';
import {mixin} from 'Types/util';
import EmptyRow from './EmptyRow';
import Cell, {IOptions as ICellOptions} from './Cell';
import CellCompatibility from './compatibility/DataCell';

export interface IOptions<T> extends ICellOptions<T> {
    owner: EmptyRow<T>;
    template?: TemplateFunction;
    isFullColspan?: boolean;
}

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:EmptyColumnTemplate';

export default class EmptyCell<T> extends mixin<Cell<T, EmptyRow<T>>, CellCompatibility>(Cell, CellCompatibility) {
    protected _$isFullColspan: boolean;

    getTemplate(): TemplateFunction|string {
        return this._$column.template || DEFAULT_CELL_TEMPLATE;
    }
    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', highlightOnHover: boolean): string {
        return this._$isFullColspan ? '' : `${super.getWrapperClasses(theme, backgroundColorStyle, style, highlightOnHover)}` +
            ` controls-Grid__row-cell-background-editing_default_theme-${theme}`;
    }
    getContentClasses(theme: string, topSpacing: string = 'default', bottomSpacing: string = 'default'): string {
        if (this._$isFullColspan) {
            return `controls-ListView__empty`
                + ` controls-ListView__empty_theme-${theme}`
                + ` controls-ListView__empty_topSpacing_${topSpacing}_theme-${theme}`
                + ` controls-ListView__empty_bottomSpacing_${bottomSpacing}_theme-${theme}`;
        }
        return `${this._getContentPaddingClasses(theme)}`
            + ` controls-Grid__row-cell__content`
            + ` controls-GridView__emptyTemplate__cell`
            + ` controls-Grid__row-cell-editing_theme-${theme}`
            + ` controls-Grid__row-cell__content_baseline_default_theme-${theme}`
            + ` controls-Grid__row-cell-background-editing_default_theme-${theme}`;
    }
}

Object.assign(EmptyCell.prototype, {
    '[Controls/_display/grid/EmptyCell]': true,
    _moduleName: 'Controls/display:GridEmptyCell',
    _instancePrefix: 'grid-empty-cell-',
    _$isFullColspan: false
});
