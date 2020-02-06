import { IItemAction } from './IItemAction';
import { IListModel } from 'Controls/_list/interface/IListViewModel';
import {IContextMenuConfig} from 'Controls/_list/interface/IList';

export type ItemActionsPosition = 'inside' | 'outside' | 'custom';

export interface ISwipeEvent extends Event {
   target: HTMLElement;
   nativeEvent: {
      direction: 'left' | 'right' | 'top' | 'bottom';
   };
}

export interface ISwipeContext {
   isTouch: {
      isTouch: boolean;
   };
}

export interface ISwipeControlOptions {
   listModel: IListModel;
   itemActions: IItemAction[];
   contextMenuConfig?: IContextMenuConfig;
   itemActionsPosition?: ItemActionsPosition;
   actionAlignment?: 'horizontal' | 'vertical';
   actionCaptionPosition?: 'right' | 'bottom' | 'none';
}
