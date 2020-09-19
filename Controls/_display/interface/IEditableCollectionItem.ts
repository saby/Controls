import {Model} from 'Types/entity';

export interface IEditableCollectionItem<T extends Model = Model> {
    readonly '[Controls/_display/IEditableCollectionItem]': boolean;
    contents: T;

    isAdd: boolean;
    addPosition?: 'top' | 'bottom';

    setEditing(isEditing: boolean, editingContents?: Model<T>, silent?: boolean): void;
    acceptChanges(): void;
}
