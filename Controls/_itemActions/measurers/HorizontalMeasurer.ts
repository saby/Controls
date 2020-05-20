import rk = require('i18n!Controls');
import { ISwipeConfig } from 'Controls/display';

import { IMeasurer } from '../interface/IMeasurer';
import { IItemAction, TItemActionShowType, TItemActionsSize, TActionCaptionPosition } from '../interface/IItemActions';
import { Utils } from '../Utils';

const MAX_ACTIONS_COUNT = 3;
const HEIGHT_LOWER_BOUND_WITH_TITLE = 58;
const HEIGHT_LOWER_BOUND_WITHOUT_TITLE = 38;

type ActionCaptionPosition = Exclude<TActionCaptionPosition, 'right'>;

function getItemActionsSize(
   rowHeight: number,
   actionCaptionPosition: ActionCaptionPosition
): TItemActionsSize {
   if (actionCaptionPosition !== 'none') {
      return rowHeight < HEIGHT_LOWER_BOUND_WITH_TITLE ? 'm' : 'l';
   } else {
      return rowHeight < HEIGHT_LOWER_BOUND_WITHOUT_TITLE ? 'm' : 'l';
   }
}

export const horizontalMeasurer: IMeasurer = {
   getSwipeConfig(
      actions: IItemAction[],
      rowHeight: number,
      actionCaptionPosition: ActionCaptionPosition,
      menuButtonVisibility?: 'visible'|'adaptive'
   ): ISwipeConfig {

      let itemActions = Utils.getActualActions(actions);

      if (itemActions.length > MAX_ACTIONS_COUNT || menuButtonVisibility === 'visible') {
         itemActions = itemActions.slice(0, MAX_ACTIONS_COUNT);
         itemActions.push({
            id: null,
            icon: 'icon-SwipeMenu',
            title: rk('Ещё'),
            _isMenu: true,
            showType: TItemActionShowType.TOOLBAR
         });
      }

      return {
         itemActionsSize: getItemActionsSize(rowHeight, actionCaptionPosition),
         itemActions: {
            all: actions,
            showed: itemActions
         },
         paddingSize: 'm',
         needIcon: this.needIcon,
         needTitle: this.needTitle
      };
   },
   needIcon(
      action: IItemAction,
      actionCaptionPosition: ActionCaptionPosition,
      hasActionWithIcon: boolean = false
   ): boolean {
      return !!action.icon || (hasActionWithIcon && actionCaptionPosition !== 'none');
   },
   needTitle(action: IItemAction, actionCaptionPosition: ActionCaptionPosition): boolean {
      return !action.icon || (actionCaptionPosition !== 'none' && !!action.title);
   }
};
