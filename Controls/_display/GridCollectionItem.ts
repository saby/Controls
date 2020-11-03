import CollectionItem, { IOptions as IBaseOptions } from './CollectionItem';
import GridCollection from './GridCollection';
import GridColumn, { IOptions as IGridColumnOptions } from './GridColumn';
import { IColumn, TColumns } from 'Controls/grid';

interface ILadder {}

export interface IOptions<T> extends IBaseOptions<T> {
    owner: GridCollection<T>;
    columns: TColumns;
}

export default class GridCollectionItem<T> extends CollectionItem<T> {
    protected _$owner: GridCollection<T>;
    protected _$columns: TColumns;
    protected _$columnItems: Array<GridColumn<T>>;

    constructor(options?: IOptions<T>) {
        super(options);
        const addMultiSelectColumn = this.getMultiSelectVisibility() !== 'hidden';
        if (this._$columns) {
            const factory = this._getColumnsFactory();
            this._$columnItems = this._$columns.map((column) => factory({ column }));
            if (addMultiSelectColumn) {
                this._$columnItems = [
                    factory({ column: {} as IColumn })
                ].concat(this._$columnItems);
            }
        }
    }

    getColumns(): Array<GridColumn<T>> {
        return this._$columnItems;
    }

    getColumnsCount(): number {
        return this._$columnItems.length;
    }

    getColumnIndex(column: GridColumn<T>): number {
        return this._$columnItems.indexOf(column);
    }

    getTopPadding(): string {
        return this._$owner.getTopPadding().toLowerCase();
    }

    getBottomPadding(): string {
        return this._$owner.getBottomPadding().toLowerCase();
    }

    getLeftPadding(): string {
        return this._$owner.getLeftPadding().toLowerCase();
    }

    getRightPadding(): string {
        return this._$owner.getRightPadding().toLowerCase();
    }

    getItemSpacing(): { left: string, right: string, row: string } {
        return {
            left: this._$owner.getLeftPadding().toLowerCase(),
            right: this._$owner.getRightPadding().toLowerCase(),
            row: this._$owner.getTopPadding().toLowerCase()
        };
    }

    getLadderWrapperClasses(ladderProperty: string): string {
        let ladderWrapperClasses = 'controls-Grid__row-cell__ladder-content';
        const ladder = this._$owner.getLadder(this);
        if (ladder && ladder[ladderProperty].ladderLength < 1) {
            ladderWrapperClasses += ' controls-Grid__row-cell__ladder-content_hiddenForLadder';
        }
        return ladderWrapperClasses;
    }

    // region overrides

    setMarked(marked: boolean, silent?: boolean): void {
        const changed = marked !== this.isMarked();
        super.setMarked(marked, silent);
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

    // endregion

    protected _redrawColumns(target: 'first'|'last'|'all'): void {
        switch (target) {
            case 'first':
                this._$columnItems[0].nextVersion();
                break;
            case 'last':
                this._$columnItems[this.getColumnsCount() - 1].nextVersion();
                break;
            case 'all':
                this._$columnItems.forEach((column) => column.nextVersion());
                break;
        }
    }

    protected _getColumnsFactory(): (options: Partial<IGridColumnOptions<T>>) => GridColumn<T> {
        return (options) => {
            options.owner = this;
            return new GridColumn(options as IGridColumnOptions<T>);
        };
    }
}

Object.assign(GridCollectionItem.prototype, {
    '[Controls/_display/GridCollectionItem]': true,
    _moduleName: 'Controls/display:GridCollectionItem',
    _instancePrefix: 'grid-item-',
    _$columns: null,
    _$columnItems: null
});
