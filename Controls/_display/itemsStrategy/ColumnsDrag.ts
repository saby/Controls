import {Model} from 'Types/entity';
import CollectionItem from '../CollectionItem';
import ColumnsCollectionItem from '../ColumnsCollectionItem';
import GroupItem from '../GroupItem';
import Drag from './Drag';

/**
 * Стратегия для премещения элементов, относящихся к определённой колонке ColumnsCollection.
 * При создании аватара элемента использует ту же колонку, в которой начался Drag-n-Drop;
 */
export default class ColumnsDrag<S extends Model, T extends CollectionItem<S> = ColumnsCollectionItem<S>>
    extends Drag<S, T> {
    protected _createAvatarItem(): T {
        const protoItem = this.source.items.find((item) =>
            !(item instanceof GroupItem) && item.getContents().getKey() === this._options.avatarItemKey
        );
        // @ts-ignore
        return this._createColumnsItem(protoItem?.getContents(), (protoItem as ColumnsCollectionItem<S>)?.getColumn());
    }

    private _createColumnsItem(contents: S, column?: number): T {
        const item = this.options.display.createItem({
            contents,
            column
        }) as unknown as T;
        item.setDragged(true, true);
        return item;
    }
}
