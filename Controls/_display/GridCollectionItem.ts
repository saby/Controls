import CollectionItem, { IOptions as IBaseOptions } from './CollectionItem';
import GridCollection from './GridCollection';
import { register } from 'Types/di';
import GridColumn, { IOptions as IGridColumnOptions, IColumnConfig } from './GridColumn';

export interface IOptions<T> extends IBaseOptions<T> {
    owner: GridCollection<T>;
    columns: IColumnConfig[];
}

export default class GridCollectionItem<T> extends CollectionItem<T> {
    protected _$owner: GridCollection<T>;
    protected _$columns: IColumnConfig[];
    protected _$columnItems: Array<GridColumn<T>>;

    constructor(options?: IOptions<T>) {
        super(options);
        if (this._$columns) {
            const factory = this._getColumnsFactory();
            this._$columnItems = this._$columns.map((column) => factory({ column }));
        }
    }

    getColumns(): Array<GridColumn<T>> {
        return this._$columnItems;
    }

    getColumnsCount(): number {
        return this._$columns.length;
    }

    getColumnIndex(column: IColumnConfig): number {
        return this._$columns.indexOf(column);
    }

    getItemSpacing(): { left: string, right: string, row: string } {
        return {
            left: this._$owner.getLeftSpacing().toLowerCase(),
            right: this._$owner.getRightSpacing().toLowerCase(),
            row: this._$owner.getRowSpacing().toLowerCase()
        };
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

register('Controls/display:GridCollectionItem', GridCollectionItem, {instantiate: false});
