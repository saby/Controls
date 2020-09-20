import {Model} from 'Types/entity';

export interface IEditableCollectionItem<S = any, T extends Model<S> = Model<S>> {
    readonly '[Controls/_display/IEditableCollectionItem]': boolean;
    contents: T;
    isAdd: boolean;
    addPosition?: 'top' | 'bottom';

    setEditing(editing: boolean, editingContents?: T, silent?: boolean): void;
    getEditingContents(): T;
    acceptEditing(): void;
}
