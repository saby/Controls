import Collection, { ItemsFactory, IOptions as IBaseOptions } from './Collection';
import { register } from 'Types/di';
import GridCollectionItem, { IOptions as IGridCollectionItemOptions } from './GridCollectionItem';
import { IColumnConfig } from './GridColumn';

export interface IOptions<
    S,
    T extends GridCollectionItem<S> = GridCollectionItem<S>
> extends IBaseOptions<S, T> {
    columns: IColumnConfig[];
}

export default class GridCollection<
    S,
    T extends GridCollectionItem<S> = GridCollectionItem<S>
> extends Collection<S, T> {
    protected _$columns: IColumnConfig[];

    getColumns(): IColumnConfig[] {
        return this._$columns;
    }

    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return function CollectionItemsFactory(options?: IGridCollectionItemOptions<S>): T {
            options.columns = this._$columns;
            return superFactory.call(this, options);
        };
    }
}

Object.assign(GridCollection.prototype, {
    '[Controls/_display/GridCollection]': true,
    _moduleName: 'Controls/display:GridCollection',
    _itemModule: 'Controls/display:GridCollectionItem',
    _$columns: null
});

register('Controls/display:GridCollection', GridCollection, {instantiate: false});
