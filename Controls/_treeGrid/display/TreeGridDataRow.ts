import { mixin } from 'Types/util';
import { ITreeItemOptions, TreeItem, IItemPadding, TMarkerClassName, IGroupNode } from 'Controls/display';
import {IGridRowOptions, GridCell, GridRowMixin, IDisplaySearchValue, IDisplaySearchValueOptions, TColumns} from 'Controls/grid';
import TreeGridCollection from './TreeGridCollection';
import { IColumn, IInitializeColumnsOptions } from 'Controls/grid';
import { Model } from 'Types/entity';
import TreeCheckboxCell from './TreeCheckboxCell';
import {ITreeGridDataCellOptions} from './TreeGridDataCell';

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
    readonly EnumerableItem: boolean = true;
    readonly EdgeRowSeparatorItem: boolean = true;
    readonly LadderSupport: boolean = true;
    readonly DraggableItem: boolean = true;
    protected _$searchValue: string;
    protected _$hasStickyGroup: boolean;

    constructor(options: IOptions<T>) {
        super(options);
        GridRowMixin.call(this, options);
    }

    setGridColumnsConfig(columns: TColumns): void {
        this.setColumnsConfig(columns);
    }

    // region Expander

    shouldDisplayExpanderBlock(column: GridCell<T, TreeGridDataRow<T>>): boolean {
        const displayExpanderBlock = super.shouldDisplayExpanderBlock();
        const columnIndex = column.getColumnIndex();
        const hasMultiSelect = this.hasMultiSelectColumn();
        const isFirstDataColumn = columnIndex === 0 && !hasMultiSelect || columnIndex === 1 && hasMultiSelect;
        return displayExpanderBlock && isFirstDataColumn;
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

    setEditing(editing: boolean, editingContents?: T, silent?: boolean, columnIndex?: number): void {
        super.setEditing(editing, editingContents, silent, columnIndex);
        this.setRowTemplate(editing ? this._$owner.getItemEditorTemplate() : undefined);
        const colspanCallback = this._$owner.getColspanCallback();
        if (colspanCallback || this.getEditingConfig()?.mode === 'cell') {
            this._reinitializeColumns(true);
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
       itemPadding: IItemPadding = {}
    ): string {
        let classes = 'controls-GridView__itemV_marker ';
        classes += `controls-GridView__itemV_marker-${style} `;
        classes += `controls-GridView__itemV_marker-${style}_rowSpacingBottom-${itemPadding.bottom} `;
        classes += `controls-GridView__itemV_marker-${style}_rowSpacingTop-${itemPadding.top} `;
        classes += 'controls-ListView__itemV_marker_';
        if (markerClassName === 'default') {
            classes += 'height ';
            classes += 'controls-GridView__itemV_marker_vertical-position-top ';
        } else {
            classes += `${'padding-' + (itemPadding.top || this.getTopPadding() || 'l') + '_' + markerClassName} `;
        }
        classes += `controls-ListView__itemV_marker-${this.getMarkerPosition()} `;
        return classes;
    }

    setMarked(marked: boolean, silent?: boolean): void {
        const changed = marked !== this.isMarked();
        super.setMarked(marked, silent);
        if (changed) {
            this._redrawColumns('first');
        }
    }

    setDragTargetNode(isTarget: boolean): void {
        const changed = isTarget !== this.isDragTargetNode();
        super.setDragTargetNode(isTarget);
        if (changed) {
            this.getColumns().forEach((it) => {
                if (it['[Controls/treeGrid:TreeGridDataCell]']) {
                    it.setDragTargetNode(isTarget);
                }
            });
        }
    }

    protected _getColumnFactoryParams(column: IColumn, columnIndex: number): Partial<ITreeGridDataCellOptions<T>> {
        return {
            ...super._getColumnFactoryParams(column, columnIndex),
            searchValue: this._$searchValue,
            isDragTargetNode: this.isDragTargetNode()
        };
    }

    setSearchValue(searchValue: string): void {
        this._$searchValue = searchValue;
        if (this._$columnItems) {
            this._$columnItems.forEach((cell, cellIndex) => {
                if (cell.DisplaySearchValue) {
                    cell.setSearchValue(searchValue);
                }
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
        return should && (this._$parent.isRoot() || !(this._$parent as TreeGridDataRow<T>).GroupNodeItem);
    }

    // endregion overrides

    isGroupNode(): boolean {
        return false;
    }

    protected _initializeColumns(options?: IInitializeColumnsOptions): void {
        super._initializeColumns({
            colspanStrategy: 'skipColumns',
            extensionCellsConstructors: {
                multiSelectCell: TreeCheckboxCell
            },
            ...options
        });
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
