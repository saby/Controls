import { CollectionItem, TreeItem } from 'Controls/display';
import { Model } from 'Types/entity';
import { IFlatItemData } from './FlatController';
import { ITreeItemData } from './TreeController';

export type TPosition = 'after'|'before'|'on'
export type TKey = number|string

export interface IDragPosition {
   index: number;
   position: TPosition;
   item: CollectionItem<Model>|TreeItem<Model>;
   data: IFlatItemData|ITreeItemData;
}

export interface IOffset {
   top: number,
   bottom: number
}
