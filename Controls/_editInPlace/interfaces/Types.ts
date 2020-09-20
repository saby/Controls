import {Record} from 'Types/entity';
import {IEditableCollection} from './IEditableCollection';
import {Collection, CollectionItem} from 'Controls/display';
import {IEditableCollectionItem} from './IEditableCollectionItem';

export type TEditableCollection = Collection<Record> & IEditableCollection;
export type TEditableCollectionItem = CollectionItem<Record> & IEditableCollectionItem<Record>;
export enum CONSTANTS {
    CANCEL= 'Cancel'
}
