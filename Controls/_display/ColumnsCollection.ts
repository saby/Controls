import Collection, {ItemsFactory} from './Collection';
import ColumnsCollectionItem from './ColumnsCollectionItem';

import {IOptions as ICollectionItemOptions} from './ColumnsCollectionItem';
import ColumnsDragStrategy from './itemsStrategy/ColumnsDrag';
import { IDragPosition } from './interface/IDragPosition';

export default class ColumnsCollection<
    S,
    T extends ColumnsCollectionItem<S> = ColumnsCollectionItem<S>
> extends Collection<S, T> {
    protected _$columnProperty: string;
    protected _dragStrategy: Function = ColumnsDragStrategy;

    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return function CollectionItemsFactory(options?: ICollectionItemOptions<S>): T {
            options.columnProperty = this._$columnProperty;
            options.owner = this;
            return superFactory.call(this, options);
        };
    }
    getColumnProperty(): string {
        return this._$columnProperty;
    }

    setDragPosition(position: IDragPosition<T>): void {
        if (position) {
            const strategy = this.getStrategyInstance(this._dragStrategy) as ColumnsDragStrategy<unknown>;
            const avatarItem = strategy.avatarItem;
            if (avatarItem.getColumn() !== position.dispItem.getColumn()) {
                strategy.avatarItem.setColumn(position.dispItem.getColumn());
            }
        }
        super.setDragPosition(position);
    }
}

Object.assign(ColumnsCollection.prototype, {
    '[Controls/_display/ColumnsCollection]': true,
    _moduleName: 'Controls/display:ColumnsCollection',
    _itemModule: 'Controls/display:ColumnsCollectionItem'
});
