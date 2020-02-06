import rk = require('i18n!Controls');
import { IMeasurer } from './interface/IMeasurer';
import { IItemAction, ShowType } from './interface/IItemAction';
import { ISwipeConfig, ItemActionsSize } from './interface/ISwipeConfig';
import { ISwipeControlOptions } from './interface/ISwipeControl';
import {getActualActions} from './SwipeUtils';

const breakpoints: Record<
   ISwipeControlOptions['actionCaptionPosition'],
   {
      lowerBound: number;
      upperBound: number;
   }
> = {
   bottom: {
      lowerBound: 46,
      upperBound: 64
   },
   right: {
      lowerBound: 36,
      upperBound: 44
   },
   none: {
      lowerBound: 30,
      upperBound: 38
   }
};

function getItemActionsSize(
   countOfActions: number,
   rowHeight: number,
   actionCaptionPosition: ISwipeControlOptions['actionCaptionPosition']
): {
   itemActionsSize: ItemActionsSize;
   countOfActions: number;
} {
   if (countOfActions === 1) {
      return {
         countOfActions,
         itemActionsSize: 'm'
      };
   }

   const x =
      (rowHeight - (countOfActions - 1)) / countOfActions;

   if (x < breakpoints[actionCaptionPosition].lowerBound) {
      return getItemActionsSize(countOfActions - 1, rowHeight, actionCaptionPosition);
   }
   if (
      x >= breakpoints[actionCaptionPosition].lowerBound &&
      x < breakpoints[actionCaptionPosition].upperBound
   ) {
      return {
         countOfActions,
         itemActionsSize: 'm'
      };
   }
   return {
      countOfActions,
      itemActionsSize: 'l'
   };
}

function getPaddingSize(
   actionCaptionPosition: ISwipeControlOptions['actionCaptionPosition'],
   itemActionsSize: ItemActionsSize
): 's' | 'm' | 'l' {
   switch (actionCaptionPosition) {
      case 'none':
         return 'm';
      case 'right':
         return 'l';
      case 'bottom':
         return itemActionsSize === 'l' ? 'l' : 's';
   }
}

const VerticalMeasurer: IMeasurer = {
   getSwipeConfig(
      actions: IItemAction[],
      rowHeight: number,
      actionCaptionPosition: ISwipeControlOptions['actionCaptionPosition'],
      menuButtonVisibility: 'visible'|'adaptive'
   ): ISwipeConfig {
      let columnsCount = 1;
      let itemActions = getActualActions(actions);

      const {
         itemActionsSize,
         countOfActions
      }: {
         itemActionsSize: ItemActionsSize;
         countOfActions: number;
      } = getItemActionsSize(actions.length, rowHeight, actionCaptionPosition);

      if (countOfActions === 2) {
         if (actions.length > 3) {
            columnsCount = 2;
         }
      }
      if (columnsCount * countOfActions !== actions.length || menuButtonVisibility === 'visible') {
         itemActions = itemActions.slice(0, columnsCount * countOfActions - 1);
         itemActions.push({
            icon: 'icon-SwipeMenu',
            title: rk('Ещё'),
            _isMenu: true,
            showType: ShowType.TOOLBAR
         });
      }

      return {
         itemActionsSize,
         itemActions: {
            all: actions,
            showed: itemActions
         },
         paddingSize: getPaddingSize(actionCaptionPosition, itemActionsSize),
         twoColumns: columnsCount === 2
      };
   },
   needIcon(
      action: IItemAction,
      actionCaptionPosition: ISwipeControlOptions['actionCaptionPosition'],
      hasActionWithIcon: boolean = false
   ): boolean {
      return !!action.icon || (hasActionWithIcon && actionCaptionPosition === 'right');
   },
   needTitle(action: IItemAction, actionCaptionPosition: ISwipeControlOptions['actionCaptionPosition']): boolean {
      return !action.icon || actionCaptionPosition !== 'none' && !!action.title;
   }
};

export default VerticalMeasurer;
