import { mixin } from 'Types/util';
import { ITreeItemOptions, TreeItem, IItemPadding, TMarkerClassName, IGroupNode } from 'Controls/display';
import { IGridRowOptions, GridCell, GridRowMixin, IDisplaySearchValue, IDisplaySearchValueOptions, IGridDataCellOptions, GridItemActionsCell } from 'Controls/gridNew';
import TreeGridCollection from './TreeGridCollection';
import { IColumn } from 'Controls/interface';
import { Model } from 'Types/entity';

export interface IOptions<T extends Model> extends IGridRowOptions<T>, ITreeItemOptions<T>, IDisplaySearchValueOptions {
    owner: TreeGridCollection<T>;
}

export default class TreeGridDataRow<T extends Model = Model>
   extends mixin<TreeItem<any>, GridRowMixin<any>>(TreeItem, GridRowMixin) implements IDisplaySearchValue, IGroupNode {
    readonly '[Controls/_display/grid/Row]': boolean;
    readonly '[Controls/treeGrid:TreeGridDataRow]': boolean;

    readonly '[Controls/_display/IEditableCollectionItem]': boolean = true;
    readonly DisplayItemActions: boolean = true;
    readonly DisplaySearchValue: boolean = true;
    readonly Markable: boolean = true;
    readonly SelectableItem: boolean = true;
    readonly LadderSupport: boolean = true;
    readonly DraggableItem: boolean = true;
    protected _$searchValue: string;
    protected _$hasStickyGroup: boolean;

    constructor(options: IOptions<T>) {
        super(options);
        GridRowMixin.call(this, options);
    }

    // region Expander

    shouldDisplayExpanderBlock(column: GridCell<T, TreeGridDataRow<T>>): boolean {
        const columnIndex = column.getColumnIndex();
        const hasMultiSelect = this._$owner.hasMultiSelectColumn();
        return (columnIndex === 0 && !hasMultiSelect || columnIndex === 1 && hasMultiSelect) &&
            (this._$owner.getExpanderVisibility() === 'hasChildren' ? this._$owner.hasNodeWithChildren() : true);
    }

    // endregion Expander

    // TODO duplicate code with GridRow. Нужно придумать как от него избавиться.
    //  Проблема в том, что mixin не умеет объединять одинаковые методы, а логику Grid мы добавляем через mixin
    // region overrides

    protected _initializeColumns(): void {
        super._initializeColumns();

        if (this._$columns && this.hasItemActionsSeparatedCell()) {
            this._$columnItems.push(new GridItemActionsCell({
                owner: this,
                isFixed: true,
                column: {}
            }));
        }
    }

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

    protected _getColumnFactoryParams(column: IColumn, columnIndex: number): Partial<IGridDataCellOptions<T>> {
        return {
            ...super._getColumnFactoryParams(column, columnIndex),
            searchValue: this._$searchValue
        };
    }

    setSearchValue(searchValue: string): void {
        this._$searchValue = searchValue;
        if (this._$columnItems) {
            this._$columnItems.forEach((cell, cellIndex) => {
                cell.setSearchValue(searchValue);
            });
        }
        this._nextVersion();
    }

    getSearchValue(): string {
        return this._$searchValue;
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

    setHasStickyGroup(hasStickyGroup: boolean): void {
        if (this._$hasStickyGroup !== hasStickyGroup) {
            this._$hasStickyGroup = hasStickyGroup;
            this._nextVersion();
        }
    }

    hasStickyGroup(): boolean {
        return this._$hasStickyGroup;
    }

    // Убираем ExpanderPadding для подуровней TreeGridGroupRow
    shouldDisplayExpanderPadding(tmplExpanderIcon?: string, tmplExpanderSize?: string): boolean {
        const should = super.shouldDisplayExpanderPadding(tmplExpanderIcon, tmplExpanderSize);
        return should && (this._$parent.isRoot() || !(this._$parent as TreeGridDataRow<T>).isGroupNode());
    }

    // endregion overrides

    isGroupNode(): boolean {
        return false;
    }
}

Object.assign(TreeGridDataRow.prototype, {
    '[Controls/treeGrid:TreeGridDataRow]': true,
    '[Controls/_display/grid/Row]': true,
    '[Controls/_display/TreeItem]': true,
    _cellModule: 'Controls/treeGrid:TreeGridDataCell',
    _moduleName: 'Controls/treeGrid:TreeGridDataRow',
    _$searchValue: '',
    _instancePrefix: 'tree-grid-row-',
    _$hasStickyGroup: false
});
