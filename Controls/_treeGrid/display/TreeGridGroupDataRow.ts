import TreeGridDataRow, {IOptions as ITreeGridDataRowOptions} from 'Controls/_treeGrid/display/TreeGridDataRow';
import {GridCell, IGridDataCellOptions, IItemTemplateParams} from 'Controls/grid';
import { Model } from 'Types/entity';
import {IColumn} from 'Controls/_grid/interface/IColumn';
import {IGroupNode} from 'Controls/display';

export interface IOptions<T extends Model> extends ITreeGridDataRowOptions<T> {
    isHiddenGroup: boolean;
}

export default class TreeGridGroupDataRow<T extends Model> extends TreeGridDataRow<T> implements IGroupNode {
    '[Controls/treeGrid:TreeGridGroupDataRow]': boolean = true;
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly LadderSupport: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly GroupNodeItem: boolean = true;

    protected _$isHiddenGroup: boolean;

    constructor(options: IOptions<T>) {
        super(options);
    }

    // region overrides

    getItemClasses(params: IItemTemplateParams = { theme: 'default' }): string {
        params.highlightOnHover = false;
        let classes = super.getItemClasses(params);
        classes += ` controls-ListView__group${this.isHiddenGroup() ? 'Hidden' : ''}`;
        return classes;
    }

    setExpanded(expanded: boolean, silent?: boolean): void {
        super.setExpanded(expanded, silent);
        this._reinitializeColumns();
    }

    shouldDisplayExpanderBlock(column: GridCell<T, TreeGridDataRow<T>>): boolean {
        return false;
    }

    isHiddenGroup(): boolean {
        return this._$isHiddenGroup;
    }

    setIsHiddenGroup(isHiddenGroup: boolean): void {
        if (this._$isHiddenGroup !== isHiddenGroup) {
            this._$isHiddenGroup = isHiddenGroup;
            this._nextVersion();
        }
    }

    isSticked(): boolean {
        return this.getOwner().isStickyHeader() && !this.isHiddenGroup();
    }

    protected _getBaseItemClasses(style: string, theme: string): string {
        let itemClasses = 'controls-ListView__itemV';
        if (!this.isHiddenGroup()) {
            itemClasses += ` controls-Grid__row controls-Grid__row_${style}`;
        }
        return itemClasses;
    }

    protected _getColumnFactoryParams(column: IColumn, columnIndex: number): Partial<IGridDataCellOptions<T>> {
        return {
            ...super._getColumnFactoryParams(column, columnIndex),
            isExpanded: this.isExpanded()
        };
    }

    getLevel(): number {
        const level = super.getLevel();
        return level - 1;
    }

    isGroupNode(): boolean {
        return true;
    }

    // endregion overrides
}

Object.assign(TreeGridGroupDataRow.prototype, {
    _cellModule: 'Controls/treeGrid:TreeGridGroupDataCell',
    _moduleName: 'Controls/treeGrid:TreeGridDataRow',
    _$searchValue: '',
    _$isHiddenGroup: false,
    _instancePrefix: 'tree-grid-group-row-'
});
