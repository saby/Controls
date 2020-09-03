import {TEditableItemContents} from '../Types';

export interface IEditableCollectionItem {
    contents: TEditableItemContents;
    setEditing(isEditing: boolean): void;
    isEditing(): boolean;
}
