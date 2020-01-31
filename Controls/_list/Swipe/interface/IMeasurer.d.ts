import { ISwipeConfig } from './ISwipeConfig';
import { IItemAction } from './IItemAction';
import { ISwipeControlOptions } from './ISwipeControl';

export interface IMeasurer {
   getSwipeConfig(
      actions: IItemAction[],
      rowHeight: number,
      actionCaptionPosition: ISwipeControlOptions['actionCaptionPosition'],
      menuButtonVisibility?: 'visible'|'adaptive'
   ): ISwipeConfig;
   needIcon(action: IItemAction, actionCaptionPosition: ISwipeControlOptions['actionCaptionPosition'], hasActionWithIcon?: boolean): boolean;
   needTitle(action: IItemAction, actionCaptionPosition: ISwipeControlOptions['actionCaptionPosition']): boolean;
}
