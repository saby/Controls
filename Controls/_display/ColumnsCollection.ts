import Collection, {ItemsFactory} from './Collection';
import ColumnsCollectionItem from './ColumnsCollectionItem';

import {register} from 'Types/di';
import {IOptions as ICollectionItemOptions} from './ColumnsCollectionItem';

export default class ColumnsCollection<
    S,
    T extends ColumnsCollectionItem<S> = ColumnsCollectionItem<S>
> extends Collection<S, T> {
    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return function CollectionItemsFactory(options?: ICollectionItemOptions<S>): T {
            options.column = this.getCollection().getIndex(options.contents) % 2;
            return superFactory.call(this, options);
        };
    }
}

Object.assign(ColumnsCollection.prototype, {
    '[Controls/_display/ColumnsCollection]': true,
    _moduleName: 'Controls/display:ColumnsCollection',
    _itemModule: 'Controls/display:ColumnsCollectionItem'
});

register('Controls/display:ColumnsCollection', ColumnsCollection, {instantiate: false});
