import {Model} from 'Types/entity';
import {ICollectionItem} from 'Controls/_display/interface/ICollectionItem';

export interface IEditableCollectionItem<T extends Model = Model> extends ICollectionItem {
    readonly '[Controls/_display/IEditableCollectionItem]': boolean;
    contents: T;

    isAdd: boolean;

    setEditing(isEditing: boolean, editingContents?: Model<T>, silent?: boolean, columnIndex?: number): void;
    acceptChanges(): void;
}
