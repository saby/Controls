import {Record} from 'Types/entity';
import {IEditableCollection} from './interfaces/IEditableCollection';
import {Collection, CollectionItem} from '../display';
import {IEditableCollectionItem} from './interfaces/IEditableCollectionItem';

export type TEditableItemContents = Record;
export type TEditableCollection = Collection<TEditableItemContents> & IEditableCollection;
export type TEditableCollectionItem = CollectionItem<TEditableItemContents> & IEditableCollectionItem;
export enum CONSTANTS {
    CANCEL= 'Cancel'
}
