import { IItemAction } from './IItemAction';

export type ItemActionsSize = 'm' | 'l';

export interface ISwipeConfig {
   itemActionsSize: ItemActionsSize;
   itemActions: {
      all: IItemAction[],
      showed: IItemAction[]
   };
   paddingSize: 's' | 'm' | 'l';
   twoColumns?: boolean;
}
