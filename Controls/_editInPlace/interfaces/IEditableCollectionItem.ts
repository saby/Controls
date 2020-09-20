import {Record} from 'Types/entity';

export interface IEditableCollectionItem<T extends Record = Record> {
    contents: Record;
    setEditing(isEditing: boolean): void;
    isEditing(): boolean;
}
