import Collection, {ItemsFactory} from './Collection';
import ColumnsCollectionItem from './ColumnsCollectionItem';

import {IOptions as ICollectionItemOptions} from './ColumnsCollectionItem';
import {ItemsEntity} from '../dragnDrop';
import ColumnsDragStrategy from './itemsStrategy/ColumnsDrag';
import {IDragPosition} from '../_listDragNDrop/interface';

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
    getColumnProperty(): string {
        return this._$columnProperty;
    }

    // region Drag-N-Drop

    setDraggedItems(draggedItem: T, dragEntity: ItemsEntity): void {
        // TODO dnd когда будет выполнен полный переход на новую модель,
        // то можно будет передать только нужные параметры(ключ аватара и список перетаскиваемых ключей)
        const avatarKey = draggedItem.getContents().getKey();
        const avatarStartIndex = this.getIndexByKey(avatarKey);

        this.appendStrategy(ColumnsDragStrategy, {
            draggedItemsKeys: dragEntity.getItems(),
            avatarItemKey: avatarKey,
            avatarIndex: avatarStartIndex
        });
    }

    setDragPosition(position: IDragPosition): void {
        const strategy = this.getStrategyInstance(ColumnsDragStrategy) as ColumnsDragStrategy<unknown>;
        if (strategy && position) {
            // TODO dnd в старой модели передается куда вставлять относительно этого индекса
            strategy.avatarIndex = position.index;
            this.nextVersion();
        }
    }

    resetDraggedItems(): void {
        this.removeStrategy(ColumnsDragStrategy);
    }

    // endregion
}

Object.assign(ColumnsCollection.prototype, {
    '[Controls/_display/ColumnsCollection]': true,
    _moduleName: 'Controls/display:ColumnsCollection',
    _itemModule: 'Controls/display:ColumnsCollectionItem'
});

