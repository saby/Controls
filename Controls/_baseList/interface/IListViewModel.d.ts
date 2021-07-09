import { IItemAction } from 'Controls/itemActions';
// @ts-ignore
import { Model } from 'Types/entity';

export interface IItemData {
   item: Model;
   itemActions: {
      all: IItemAction[];
      showed: IItemAction[];
   };
}

export interface IListModel {
   getSwipeItem: () => IItemData;
   nextModelVersion: (notUpdatePrefixItemVersion?: boolean, changesType?: string) => void;
   setSwipeItem: (itemData: IItemData) => void;
   setActiveItem: (itemData: IItemData) => void;
   subscribe: (eventName: string, handler: Function) => void;
}
