import { CollectionItem} from 'Controls/display';
import { Model } from 'Types/entity';

export type TPosition = 'after'|'before'|'on';
export type TKey = number|string;

export interface IDragPosition<T> {
   index: number;
   position: TPosition;
   dispItem: T;
}

export interface IOffset {
   top: number;
   bottom: number;
}
