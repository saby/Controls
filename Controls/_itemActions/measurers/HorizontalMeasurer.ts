import rk = require('i18n!Controls');
import {DOMUtil} from 'Controls/sizeUtils';

import { IMeasurer } from '../interface/IMeasurer';
import {
   IItemAction,
   TItemActionShowType,
   TItemActionsSize,
   TActionCaptionPosition
} from '../interface/IItemAction';
import { IShownItemAction } from '../interface/IItemActionsContainer';
import { MeasurerUtils } from './MeasurerUtils';
import { ISwipeActionTemplateConfig } from '../interface/ISwipeActionTemplateConfig';

import * as SwipeActionTemplate from 'wml!Controls/_itemActions/resources/templates/SwipeAction';

const MAX_ACTIONS_COUNT = 3;
const HEIGHT_LOWER_BOUND_WITH_TITLE = 58;
const HEIGHT_LOWER_BOUND_WITHOUT_TITLE = 38;

type ActionCaptionPosition = Exclude<TActionCaptionPosition, 'right'>;

class HorizontalMeasurer implements IMeasurer {
   private constructor() { }

   getSwipeConfig(
      actions: IItemAction[],
      rowWidth: number,
      rowHeight: number,
      actionCaptionPosition: ActionCaptionPosition,
      menuButtonVisibility: 'visible'|'adaptive',
      theme: string
   ): ISwipeActionTemplateConfig {
      const actualActions: IItemAction[] = MeasurerUtils.getActualActions(actions);
      let visibleActions: IItemAction[] = [];
      const actionTemplateConfig = this._getActionTemplateConfig(rowHeight, actionCaptionPosition, theme);

      if (actualActions.length) {
         visibleActions = HorizontalMeasurer._calculateVisibleActions(
             actualActions,
             menuButtonVisibility,
             rowWidth,
             actionTemplateConfig,
             theme
         );
      }

      return {
         itemActionsSize: actionTemplateConfig.itemActionsSize,
         itemActions: {
            all: actions,
            showed: visibleActions
         },
         paddingSize: actionTemplateConfig.paddingSize,
         needIcon: actionTemplateConfig.needIcon,
         needTitle: actionTemplateConfig.needTitle
      };
   }

   needIcon(
      action: IItemAction,
      actionCaptionPosition: ActionCaptionPosition,
      hasActionWithIcon: boolean = false
   ): boolean {
      return !!action.icon || (hasActionWithIcon && actionCaptionPosition !== 'none');
   }

   needTitle(action: IItemAction, actionCaptionPosition: ActionCaptionPosition): boolean {
      return !action.icon || (actionCaptionPosition !== 'none' && !!action.title);
   }

   /**
    * Возвращает конфиг для шаблона swipeAction, необходимый для измерения ширины опций записи
    * @param rowHeight
    * @param actionCaptionPosition
    * @param theme
    * @private
    */
   private _getActionTemplateConfig(
       rowHeight: number,
       actionCaptionPosition: ActionCaptionPosition,
       theme: string
   ): ISwipeActionTemplateConfig {
      return {
         itemActionsSize: HorizontalMeasurer._getItemActionsSize(rowHeight, actionCaptionPosition),
         paddingSize: 'm',
         needIcon: this.needIcon,
         needTitle: this.needTitle,
         actionCaptionPosition,
         actionAlignment: 'horizontal',
         theme
      };
   }

   private static instance: HorizontalMeasurer;

   static getInstance(): HorizontalMeasurer {
      if (!HorizontalMeasurer.instance) {
         HorizontalMeasurer.instance = new HorizontalMeasurer();
      }

      return HorizontalMeasurer.instance;
   }

   /**
    * Возвращает кнопку Ещё
    * @private
    */
   private static _getMenuItemAction(): IShownItemAction {
      return {
         id: null,
         icon: 'icon-SwipeMenu',
         title: rk('Ещё'),
         isMenu: true,
         showType: TItemActionShowType.TOOLBAR
      };
   }

   /**
    * Вычисляет горизонтальный размер одной опции свайпа.
    * @param itemAction видимая по свайпу опция записи
    * @param templateConfig настройки шаблона для виртуальной отрисовки ItemAction
    */
   private static _calculateActionSize(itemAction: IItemAction, templateConfig: ISwipeActionTemplateConfig): number {
      return this._calculateActionsSizes([itemAction], templateConfig)[0];
   }

   /**
    * Вычисляет горизонтальные размеры опций свайпа с учётом размеров блока, в который они завёрнуты.
    * @param itemActions видимые по свайпу опции записи
    * @param templateConfig настройки шаблона для виртуальной отрисовки ItemAction
    */
   private static _calculateActionsSizes(itemActions: IItemAction[],
                                         templateConfig: ISwipeActionTemplateConfig): number[] {

      // Если в доступных для показа опциях есть те, у которых есть иконки, ставим соответствующий параметр в конфиг
      if (itemActions.some((action: IItemAction) => !!action.icon)) {
         templateConfig.hasActionWithIcon = true;
      }
      const itemsHtml = itemActions.map((action) => SwipeActionTemplate({
         ...templateConfig,
         action
      }));
      return DOMUtil.getElementsWidth(itemsHtml, 'controls-Swipe__action', true);
   }

   /**
    * Запрашивает горизонтальные размеры и возвращает на их основе массив видимых опций свайпа
    * @param actions все опции свайпа
    * @param menuButtonVisibility Видимость кнопки ещё
    * @param rowWidth ширина контейнера для отображения опций свайпа
    * @param templateConfig настройки шаблона для виртуальной отрисовки ItemAction
    * @param theme
    */
   private static _calculateVisibleActions(
       actions: IItemAction[],
       menuButtonVisibility: 'visible'|'adaptive',
       rowWidth: number,
       templateConfig: ISwipeActionTemplateConfig,
       theme: string): IItemAction[] {

      // По стандарту, показываем не более трёх опций в свайпе.
      // Кроме всего прочего, это позволит не производить слишком много вычислений с DOM
      const itemActions = actions.slice(0, MAX_ACTIONS_COUNT);
      const itemActionsContainerWidth = DOMUtil.getWidthForCssClass(`controls-Swipe_horizontal_theme-${theme}`);
      const itemActionsSizes = this._calculateActionsSizes(itemActions, templateConfig);
      let availableWidth = rowWidth - itemActionsContainerWidth;
      let menuItemAction: IItemAction;
      let menuActionSize = 0;
      let visibleActions = [];

      // Если всего было передано лишь 3 опции или меньше, и видимость кнопки "ещё" не "visible",
      // то сначала считаем без учёта её ширины, иначе расчёт будет некорректным и даже
      // в случае, когда все опции записи должны бы по своей ширине уместиться в контейнер им может добавляться
      // кнопка "ещё"
      if (menuButtonVisibility !== 'visible' && itemActions.length === actions.length) {
         visibleActions = this._fillVisibleActions(itemActions, itemActionsSizes, availableWidth);
      }

      // Если кнопка "ещё" всё-таки нужна, то считаем, учитывая её ширину
      if (menuButtonVisibility === 'visible' || visibleActions.length < itemActions.length) {
         menuItemAction = HorizontalMeasurer._getMenuItemAction();
         menuActionSize = this._calculateActionSize(menuItemAction, templateConfig);
         availableWidth -= menuActionSize;
         visibleActions = this._fillVisibleActions(itemActions, itemActionsSizes, availableWidth);
         visibleActions.push(menuItemAction);
      }

      return visibleActions;
   }

   /**
    * Вычисляет на основе горизонтальных размеров видимые опции свайпа
    * @param itemActions
    * @param itemActionsSizes
    * @param maxWidth
    * @private
    */
   private static _fillVisibleActions(itemActions: IItemAction[], itemActionsSizes: number[], maxWidth: number)
       : IItemAction[] {
      const visibleActions: IItemAction[] = [];
      let currentWidth: number = maxWidth;
      itemActions.every((action, index) => {
         currentWidth -= itemActionsSizes[index];
         if (currentWidth < 0) {
            return false;
         }
         visibleActions.push(action);
         return true;
      });
      return visibleActions;
   }

   private static _getItemActionsSize(
       rowHeight: number,
       actionCaptionPosition: ActionCaptionPosition
   ): TItemActionsSize {
      if (actionCaptionPosition !== 'none') {
         return rowHeight < HEIGHT_LOWER_BOUND_WITH_TITLE ? 'm' : 'l';
      } else {
         return rowHeight < HEIGHT_LOWER_BOUND_WITHOUT_TITLE ? 'm' : 'l';
      }
   }
}

export const horizontalMeasurer = HorizontalMeasurer.getInstance();
