import rk = require('i18n!Controls');

import { IMeasurer } from '../interface/IMeasurer';
import { IItemAction, TItemActionShowType, TItemActionsSize, TActionCaptionPosition } from '../interface/IItemAction';
import { MeasurerUtils } from './MeasurerUtils';
import {ISwipeActionTemplateConfig} from '../interface/ISwipeActionTemplateConfig';

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
   countOfActionsInColumn: number;
} {
   if (countOfActions === 1) {
      return {
         countOfActionsInColumn: countOfActions,
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
         countOfActionsInColumn: countOfActions,
         itemActionsSize: 'm'
      };
   }
   return {
      countOfActionsInColumn: countOfActions,
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
      rowWidth: number,
      rowHeight: number,
      actionCaptionPosition: TActionCaptionPosition,
      menuButtonVisibility: 'visible'|'adaptive',
      theme: string
   ): ISwipeActionTemplateConfig {
      let columnsCount = 1;
      let itemActions = MeasurerUtils.getActualActions(actions);

      const {
         itemActionsSize,
         countOfActionsInColumn
      }: {
         itemActionsSize: TItemActionsSize;
         countOfActionsInColumn: number;
      } = getItemActionsSize(actions.length, rowHeight, actionCaptionPosition);

      if (countOfActionsInColumn === 2 && itemActions.length > 3) {
         columnsCount = 2;
      }
      if (columnsCount * countOfActionsInColumn !== actions.length || menuButtonVisibility === 'visible') {
         itemActions = itemActions.slice(0, columnsCount * countOfActionsInColumn - 1);
         itemActions.push({
            id: null,
            icon: 'icon-SwipeMenu',
            title: rk('Ещё'),
            isMenu: true,
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
