import { mixin } from 'Types/util';
import { IGridRowOptions, GridCell, GridRowMixin, ITreeItemOptions, TreeItem, IItemPadding } from 'Controls/display';
import TreeGridCollection from './TreeGridCollection';
import { TMarkerClassName } from 'Controls/grid';
import { Model } from 'Types/entity';

export interface IOptions<T extends Model> extends IGridRowOptions<T>, ITreeItemOptions<T> {
    owner: TreeGridCollection<T>;
}

export default class TreeGridDataRow<T extends Model>
   extends mixin<TreeItem<any>, GridRowMixin<any>>(TreeItem, GridRowMixin) {
    readonly '[Controls/_display/grid/Row]': boolean;
    readonly '[Controls/treeGrid:TreeGridDataRow]': boolean;

    readonly '[Controls/_display/IEditableCollectionItem]': boolean = true;
    readonly Markable: boolean = true;
    readonly SelectableItem: boolean = true;
    readonly LadderSupport: boolean = true;
    readonly DraggableItem: boolean = true;

    constructor(options: IOptions<T>) {
        super(options);
        GridRowMixin.call(this, options);
    }

    // region Expander

    shouldDisplayExpanderBlock(column: GridCell<T, TreeGridDataRow<T>>): boolean {
        const columnIndex = column.getColumnIndex();
        const hasMultiSelect = this._$owner.hasMultiSelectColumn();
        return columnIndex === 0 && !hasMultiSelect || columnIndex === 1 && hasMultiSelect;
    }

    // endregion Expander

    // TODO duplicate code with GridRow. Нужно придумать как от него избавиться.
    //  Проблема в том, что mixin не умеет объединять одинаковые методы, а логику Grid мы добавляем через mixin
    // region overrides

    setMultiSelectVisibility(multiSelectVisibility: string): boolean {
        const isChangedMultiSelectVisibility = super.setMultiSelectVisibility(multiSelectVisibility);
        if (isChangedMultiSelectVisibility) {
            this._reinitializeColumns();
        }
        return isChangedMultiSelectVisibility;
    }

    setEditing(editing: boolean, editingContents?: T, silent?: boolean): void {
        super.setEditing(editing, editingContents, silent);
        const colspanCallback = this._$owner.getColspanCallback();
        if (colspanCallback) {
            this._reinitializeColumns();
        }
    }

    setRowSeparatorSize(rowSeparatorSize: string): boolean {
        const changed = super.setRowSeparatorSize(rowSeparatorSize);
        if (changed && this._$columnItems) {
            this._updateSeparatorSizeInColumns('Row');
        }
        return changed;
    }

    getMarkerClasses(
       theme: string,
       style: string = 'default',
       markerClassName: TMarkerClassName = 'default',
       itemPadding: IItemPadding = {},
       markerPosition: 'left' | 'right' = 'left'
    ): string {
        let classes = `controls-GridView__itemV_marker controls-GridView__itemV_marker_theme-${theme} `;
        classes += `controls-GridView__itemV_marker-${style}_theme-${theme} `;
        classes += `controls-GridView__itemV_marker-${style}_rowSpacingBottom-${itemPadding.bottom}_theme-${theme} `;
        classes += `controls-GridView__itemV_marker-${style}_rowSpacingTop-${itemPadding.top}_theme-${theme} `;
        classes += `controls-ListView__itemV_marker_${(markerClassName === 'default') ? 'default' : ('padding-' + (itemPadding.top || 'l') + '_' + markerClassName)} `;
        classes += `controls-ListView__itemV_marker-${markerPosition} `;
        return classes;
    }

    setMarked(marked: boolean, silent?: boolean): void {
        const changed = marked !== this.isMarked();
        super.setMarked(marked, silent);
        if (changed) {
            this._redrawColumns('first');
        }
    }

    setSelected(selected: boolean|null, silent?: boolean): void {
        const changed = this._$selected !== selected;
        super.setSelected(selected, silent);
        if (changed) {
            this._redrawColumns('first');
        }
    }

    setActive(active: boolean, silent?: boolean): void {
        const changed = active !== this.isActive();
        super.setActive(active, silent);
        if (changed) {
            this._redrawColumns('all');
        }
    }

    // endregion overrides
}

Object.assign(TreeGridDataRow.prototype, {
    '[Controls/treeGrid:TreeGridDataRow]': true,
    '[Controls/_display/grid/Row]': true,
    _cellModule: 'Controls/treeGrid:TreeGridDataCell',
    _moduleName: 'Controls/treeGrid:TreeGridDataRow',
    _instancePrefix: 'tree-grid-row-'
});
