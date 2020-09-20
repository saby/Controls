import {Model} from 'Types/entity';
import {IEditableCollection} from 'Controls/_display/interface/IEditableCollection';
import {Collection, CollectionItem} from 'Controls/display';
import {IEditableCollectionItem} from 'Controls/_display/interface/IEditableCollectionItem';

export type TEditableCollection = Collection<Model, TEditableCollectionItem> & IEditableCollection;
export type TEditableCollectionItem = CollectionItem<Model> & IEditableCollectionItem;

export enum CONSTANTS {
    CANCEL = 'Cancel'
}

export type TKey = string | number | null;
