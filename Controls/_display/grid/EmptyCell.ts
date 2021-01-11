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
    getWrapperClasses(theme: string, backgroundColorStyle: string = 'default', style: string = 'default', highlightOnHover?: boolean): string {
        let classes;

        if (this._$isFullColspan) {
            classes = '';
        } else if (this.isMultiSelectColumn()) {
            classes = `controls-GridView__emptyTemplate__checkBoxCell ` +
                `controls-Grid__row-cell-editing_theme-${theme} ` +
                `controls-Grid__row-cell-background-editing_${backgroundColorStyle}_theme-${theme} `
        } else {
            classes = super.getWrapperClasses(theme, backgroundColorStyle, style, highlightOnHover) +
                ` controls-Grid__row-cell-background-editing_default_theme-${theme}`
        }

        return classes;
    }
    getContentClasses(theme: string, topSpacing: string = 'default', bottomSpacing: string = 'default'): string {
        let classes;

        if (this._$isFullColspan) {
            classes = `controls-ListView__empty`
                + ` controls-ListView__empty_theme-${theme}`
                + ` controls-ListView__empty_topSpacing_${topSpacing}_theme-${theme}`
                + ` controls-ListView__empty_bottomSpacing_${bottomSpacing}_theme-${theme}`;
        } else if (this.isMultiSelectColumn()) {
            classes = '';
        } else {
            classes = this._getContentPaddingClasses(theme)
                + ` controls-Grid__row-cell__content`
                + ` controls-GridView__emptyTemplate__cell`
                + ` controls-Grid__row-cell-editing_theme-${theme}`
                + ` controls-Grid__row-cell__content_baseline_default_theme-${theme}`
                + ` controls-Grid__row-cell-background-editing_default_theme-${theme}`;
        }

        return classes;
    }
}

Object.assign(EmptyCell.prototype, {
    '[Controls/_display/grid/EmptyCell]': true,
    _moduleName: 'Controls/display:GridEmptyCell',
    _instancePrefix: 'grid-empty-cell-',
    _$isFullColspan: false
});
