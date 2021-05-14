import { GridDataCell } from 'Controls/grid';
import {IEditingConfig, isFullGridSupport} from 'Controls/display';
import TreeGridDataRow from './TreeGridDataRow';
import { Model } from 'Types/entity';

export default class TreeGridDataCell<T extends Model> extends GridDataCell<T, TreeGridDataRow<T>> {
    readonly '[Controls/treeGrid:TreeGridDataCell]': boolean;

    protected _$owner: TreeGridDataRow<T>;

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover?: boolean, templateHoverBackgroundStyle?: string): string {
        let classes = super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover);

        if (!this._$owner.hasMultiSelectColumn() && this.isFirstColumn() && isFullGridSupport()) {
            classes += ` controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}`;
        }

        if (this._$owner.isDragTargetNode()) {
            classes += ' controls-TreeGridView__dragTargetNode';
            if (this.isFirstColumn()) {
                classes += ' controls-TreeGridView__dragTargetNode_first';
            } else if (this.isLastColumn()) {
                classes += ' controls-TreeGridView__dragTargetNode_last';
            }

            // controls-Grid__no-rowSeparator перебивает стили dragTargetNode
            classes = classes.replace('controls-Grid__no-rowSeparator', '');
        }

        return classes;
    }

    getRelativeCellWrapperClasses(theme: string): string {
        let classes = super.getRelativeCellWrapperClasses(theme);

        if (!isFullGridSupport()) {
            classes = 'controls-TreeGridView__row-cell_innerWrapper ' + classes;

            if (!this._$owner.hasMultiSelectColumn() && this.isFirstColumn()) {
                classes += ` controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}`;
            }
        }

        return classes;
    }

    protected _getWrapperBaseClasses(theme: string, style: string, templateHighlightOnHover: boolean): string {
        let classes = super._getWrapperBaseClasses(theme, style, templateHighlightOnHover);
        classes += ` controls-TreeGrid__row-cell controls-TreeGrid__row-cell_${style || 'default'}`;

        if (this._$owner.isNode()) {
            classes += ' controls-TreeGrid__row-cell__node';
        } else if (this._$owner.isNode() === false) {
            classes += ' controls-TreeGrid__row-cell__hiddenNode';
        } else {
            classes += ' controls-TreeGrid__row-cell__item';
        }

        return classes;
    }

    protected _getHorizontalPaddingClasses(theme: string): string {
        let classes = super._getHorizontalPaddingClasses(theme);

        // если текущая колонка первая и для нее не задан мультиселект, то убираем левый отступ
        const hasMultiSelect = this._$owner.hasMultiSelectColumn();
        if (this.isFirstColumn() && !hasMultiSelect || this.getColumnIndex() === 1 && hasMultiSelect) {
            classes += ' controls-TreeGrid__row-cell__firstColumn__contentSpacing_null';
        }

        return classes;
    }

    getEditingConfig(): IEditingConfig {
        return this._$owner.getEditingConfig();
    }
}

Object.assign(TreeGridDataCell.prototype, {
    '[Controls/treeGrid:TreeGridDataCell]': true,
    _moduleName: 'Controls/treeGrid:TreeGridDataCell',
    _instancePrefix: 'tree-grid-data-cell-'
});
