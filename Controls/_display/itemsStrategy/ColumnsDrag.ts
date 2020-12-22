import {Model} from 'Types/entity';
import ColumnsCollectionItem from '../ColumnsCollectionItem';
import Drag from './Drag';

/**
 * Стратегия для премещения элементов, относящихся к определённой колонке ColumnsCollection.
 * При создании аватара элемента использует ту же колонку, в которой начался Drag-n-Drop;
 */
export default class ColumnsDrag<S extends Model, T extends ColumnsCollectionItem<S> = ColumnsCollectionItem<S>>
    extends Drag<S, T> {
    protected _createAvatarItem(): T {
        const protoItem = this._getProtoItem();
        return this._createColumnsItem(protoItem, protoItem?.getColumn());
    }

    private _createColumnsItem(protoItem: T, column?: number): T {
        const item = this.options.display.createItem({
            contents: protoItem?.getContents(),
            column
        });
        item.setDragged(true, true);
        item.setMarked(protoItem?.isMarked(), true);
        item.setSelected(protoItem?.isSelected(), true);
        return item;
    }
}
