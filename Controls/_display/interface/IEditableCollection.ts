import {IEditableCollectionItem} from './IEditableCollectionItem';

export interface IEditableCollection {
    setAddingItem(item: IEditableCollectionItem): void;
    resetAddingItem(): void;
}
