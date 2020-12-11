import TreeGridDataRow from 'Controls/_treeGridNew/display/TreeGridDataRow';
import { GridDataCell } from 'Controls/display';

export default class TreeGridDataCell<T> extends GridDataCell<T, TreeGridDataRow<T>> {
    readonly '[Controls/treeGrid:TreeGridDataCell]': boolean;

    protected _$owner: TreeGridDataRow<T>;

    protected getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        let classes = super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover);

        if (!this._$owner.needMultiSelectColumn() && this.isFirstColumn()) {
            classes += ` controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}_theme-${theme}`;
        }

        return classes;
    }

    protected _getWrapperBaseClasses(theme: string, style: string, templateHighlightOnHover: boolean): string {
        let classes = super._getWrapperBaseClasses(theme, style, templateHighlightOnHover);
        classes += ` controls-TreeGrid__row-cell_theme-${theme} controls-TreeGrid__row-cell_${style || 'default'}_theme-${theme}`;

        if (this._$owner.isNode()) {
            classes += ` controls-TreeGrid__row-cell__node_theme-${theme}`;
        } else if (this._$owner.isNode() === false) {
            classes += ` controls-TreeGrid__row-cell__hiddenNode_theme-${theme}`;
        } else {
            classes += ` controls-TreeGrid__row-cell__item_theme-${theme}`;
        }

        return classes;
    }

    protected _getContentPaddingClasses(theme: string): string {
        let classes = super._getContentPaddingClasses(theme);

        // если текущая колонка первая и для нее не задан мультиселект, то убираем левый отступ
        const hasMultiSelect = this._$owner.needMultiSelectColumn();
        if (this.isFirstColumn() && !hasMultiSelect || this.getColumnIndex() === 1 && hasMultiSelect) {
            classes += ' controls-TreeGrid__row-cell__firstColumn__contentSpacing_null';
        }

        return classes;
    }
}

Object.assign(TreeGridDataCell.prototype, {
    '[Controls/treeGrid:TreeGridDataCell]': true,
    _moduleName: 'Controls/treeGrid:TreeGridDataCell',
    _instancePrefix: 'tree-grid-data-cell-'
});
