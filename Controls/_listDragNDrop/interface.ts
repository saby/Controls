import { CollectionItem, TreeItem } from 'Controls/display';
import { Model } from 'Types/entity';

export type TPosition = 'after'|'before'|'on'
export type TKey = number|string

export interface IDragPosition {
   index: number;
   position: TPosition;
   item: Model;
   data: CollectionItem<Model>|TreeItem<Model>;
}

export interface IOffset {
   top: number,
   bottom: number
}
