import Collection, {ItemsFactory} from './Collection';
import ColumnsCollectionItem from './ColumnsCollectionItem';

import {register} from 'Types/di';
import {IOptions as ICollectionItemOptions} from './ColumnsCollectionItem';

export default class ColumnsCollection<
    S,
    T extends ColumnsCollectionItem<S> = ColumnsCollectionItem<S>
    > extends Collection<S, T> {
    protected _$columnProperty: string;
    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return function CollectionItemsFactory(options?: ICollectionItemOptions<S>): T {
            options.columnProperty = this._$columnProperty;
            options.owner = this;
            return superFactory.call(this, options);
        };
    }
}

Object.assign(ColumnsCollection.prototype, {
    '[Controls/_display/ColumnsCollection]': true,
    _moduleName: 'Controls/display:ColumnsCollection',
    _instancePrefix: 'columns-item-',
    _itemModule: 'Controls/display:ColumnsCollectionItem'
});

register('Controls/display:ColumnsCollection', ColumnsCollection, {instantiate: false});
