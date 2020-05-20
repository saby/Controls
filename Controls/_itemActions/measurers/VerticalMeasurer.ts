import rk = require('i18n!Controls');
import { ISwipeConfig  } from 'Controls/display';

import { IMeasurer } from '../interface/IMeasurer';
import { IItemAction, TItemActionShowType, TItemActionsSize, TActionCaptionPosition } from '../interface/IItemActions';
import { Utils } from '../Utils';

const breakpoints: Record<
   TActionCaptionPosition,
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
   actionCaptionPosition: TActionCaptionPosition
): {
   itemActionsSize: TItemActionsSize;
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
   actionCaptionPosition: TActionCaptionPosition,
   itemActionsSize: TItemActionsSize
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

export const verticalMeasurer: IMeasurer = {
   getSwipeConfig(
      actions: IItemAction[],
      rowHeight: number,
      actionCaptionPosition: TActionCaptionPosition,
      menuButtonVisibility: 'visible'|'adaptive'
   ): ISwipeConfig {
      let columnsCount = 1;
      let itemActions = Utils.getActualActions(actions);

      const {
         itemActionsSize,
         countOfActions
      }: {
         itemActionsSize: TItemActionsSize;
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
            id: null,
            icon: 'icon-SwipeMenu',
            title: rk('Ещё'),
            _isMenu: true,
            showType: TItemActionShowType.TOOLBAR
         });
      }

      return {
         itemActionsSize,
         itemActions: {
            all: actions,
            showed: itemActions
         },
         paddingSize: getPaddingSize(actionCaptionPosition, itemActionsSize),
         twoColumns: columnsCount === 2,
         needIcon: this.needIcon,
         needTitle: this.needTitle
      };
   },
   needIcon(
      action: IItemAction,
      actionCaptionPosition: TActionCaptionPosition,
      hasActionWithIcon: boolean = false
   ): boolean {
      return !!action.icon || (hasActionWithIcon && actionCaptionPosition === 'right');
   },
   needTitle(action: IItemAction, actionCaptionPosition: TActionCaptionPosition): boolean {
      return !action.icon || actionCaptionPosition !== 'none' && !!action.title;
   }
};
