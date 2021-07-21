import {GridDataCell, ICellPadding, IGridDataCellOptions} from 'Controls/grid';
import { isFullGridSupport } from 'Controls/display';
import TreeGridDataRow from './TreeGridDataRow';
import { Model } from 'Types/entity';

export interface ITreeGridDataCellOptions<T extends Model> extends IGridDataCellOptions<T> {
    isDragTargetNode?: boolean;
}

export default class TreeGridDataCell<T extends Model> extends GridDataCell<T, TreeGridDataRow<T>> {
    readonly '[Controls/treeGrid:TreeGridDataCell]': boolean;

    protected _$owner: TreeGridDataRow<T>;

    private _$isDragTargetNode: boolean;

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover?: boolean, templateHoverBackgroundStyle?: string): string {
        let classes = super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover);

        if (this._$owner.isDragTargetNode()) {
            classes += ' controls-TreeGridView__dragTargetNode';
            if (this.isFirstColumn()) {
                classes += ' controls-TreeGridView__dragTargetNode_first';
            }

            if (this.isLastColumn()) {
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
        }

        return classes;
    }

    getContentClasses(theme: string, backgroundColorStyle: string = this._$column.backgroundColorStyle, cursor: string = 'pointer', templateHighlightOnHover: boolean = true, tmplIsEditable: boolean = true): string {
        let classes = super.getContentClasses(theme, backgroundColorStyle, cursor, templateHighlightOnHover, tmplIsEditable);

        if (!this._$owner.hasMultiSelectColumn() && this.isFirstColumn() && isFullGridSupport()) {
            classes += ` controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}`;
        }
        return classes;
    }

    isDragTargetNode(): boolean {
        return this._$isDragTargetNode;
    }

    setDragTargetNode(isTarget: boolean): void {
        if (this._$isDragTargetNode !== isTarget) {
            this._$isDragTargetNode = isTarget;
            this._nextVersion();
        }
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
}

Object.assign(TreeGridDataCell.prototype, {
    '[Controls/treeGrid:TreeGridDataCell]': true,
    _moduleName: 'Controls/treeGrid:TreeGridDataCell',
    _instancePrefix: 'tree-grid-data-cell-',
    _$isDragTargetNode: false
});
