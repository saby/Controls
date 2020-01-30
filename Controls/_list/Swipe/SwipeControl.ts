import rk = require('i18n!Controls');
import Control = require('Core/Control');
import * as template from 'wml!Controls/_list/Swipe/SwipeControl';
import {TouchContextField} from 'Controls/context';
import aUtil = require('Controls/_list/ItemActions/Utils/Actions');
import 'css!theme?Controls/list';
import { IMeasurer } from './interface/IMeasurer';
import { IItemAction, ShowType } from './interface/IItemAction';
import { ISwipeConfig } from './interface/ISwipeConfig';
import {
   ISwipeContext,
   ISwipeControlOptions,
   ISwipeEvent
} from './interface/ISwipeControl';
import { PickOptionalProperties} from 'Controls/Utils/Types';
// @ts-ignore
import { descriptor } from 'Types/entity';
import { IItemData, IListModel } from 'Controls/_list/interface/IListViewModel';
import HorizontalMeasurer from 'Controls/_list/Swipe/HorizontalMeasurer';
import VerticalMeasurer from 'Controls/_list/Swipe/VerticalMeasurer';

import * as swipeTemplate from 'wml!Controls/_list/Swipe/resources/SwipeTemplate';

let displayLib: typeof import('Controls/display');

const MEASURER_NAMES: Record<ISwipeControlOptions['actionAlignment'], IMeasurer> = {
   horizontal: HorizontalMeasurer,
   vertical: VerticalMeasurer
};

export default class SwipeControl extends Control {
   protected _options: ISwipeControlOptions;
   private _template: Function = template;
   private _measurer: IMeasurer;
   private _swipeConfig: ISwipeConfig;
   private _animationState: 'close' | 'open' = 'close';
   private _actionAlignment: 'horizontal' | 'vertical';
   private _swipeTemplate = swipeTemplate;
   private _currentItemData: IItemData | null = null;
   private _isActual: boolean = false;

   constructor(options: ISwipeControlOptions) {
      super(options);
      this._needTitle = this._needTitle.bind(this);
      this._needIcon = this._needIcon.bind(this);
   }

   private _listSwipe(
      event: Event,
      itemData: IItemData,
      childEvent: ISwipeEvent
   ): void {
      const itemActions = this._options.useNewModel ? itemData.getActions() : itemData.itemActions;
      if (childEvent.nativeEvent.direction === 'left' && (itemActions || this._options.showEditArrow)) {
         this._initSwipe(this._options.listModel, itemData, childEvent);
      } else {
         this.closeSwipe(true);
      }
   }

   private _onAnimationEnd(): void {
      if (this._animationState === 'close') {
         this._notifyAndResetSwipe();
      }
   }

   private _needIcon(
      action: IItemAction,
      actionCaptionPosition: ISwipeControlOptions['actionCaptionPosition'],
      hasShowedItemActionWithIcon: boolean
   ): boolean {
      return this._measurer.needIcon(action, actionCaptionPosition, hasShowedItemActionWithIcon);
   }

   private _needTitle(
      action: IItemAction,
      actionCaptionPosition: ISwipeControlOptions['actionCaptionPosition']
   ): boolean {
      return this._measurer.needTitle(action, actionCaptionPosition);
   }

   private _notifyAndResetSwipe(): void {
      this._swipeConfig = null;
      this._currentItemData = null;
      this._notify('closeSwipe', [this._options.listModel.getSwipeItem()]);
      if (this._options.useNewModel) {
         displayLib.ItemActionsController.setSwipeItem(this._options.listModel, null);
         displayLib.ItemActionsController.setActiveItem(this._options.listModel, null);
      } else {
         this._options.listModel.setSwipeItem(null);
         this._options.listModel.setActiveItem(null);
      }
   }

   private _updateModel(newOptions: ISwipeControlOptions): void {
      this.closeSwipe();
      if (newOptions.useNewModel) {
         newOptions.listModel.subscribe('onCollectionChange', (event, action, changedItems) => {
            const changedProperty = changedItems && changedItems.properties;
            this._onListChange(event, `newModelUpdated - ${changedProperty}`, action);
         });
      } else {
         newOptions.listModel.subscribe('onListChange', this._onListChange.bind(this));
      }
   }

   private _onListChange(event, changesType, action): void {
      if (changesType !== 'itemActionsUpdated' && action !== 'ch' || changesType === 'newModelUpdated - editing') {
         this.closeSwipe();
      } else if (changesType === 'itemActionsUpdated') {

         // TODO: KINGO
         // Если обновились операции над записью, то запоминаем, что они не актуальны
         this._isActual = false;
      }
   }
   private _getActionsHeight(target: HTMLElement): number {
      const listItem = target.closest('.controls-ListView__itemV');

      /**
       * Sometimes an item is larger that the area available for actions (e.g. a tile with a title) and the user can accidentally swipe outside of the actions container.
       * So we can't use closest to find a container.
       */
      if (
         listItem.classList.contains(
            'js-controls-SwipeControl__actionsContainer'
         )
      ) {
         return listItem.clientHeight;
      } else {
         return listItem.querySelector(
            '.js-controls-SwipeControl__actionsContainer'
         ).clientHeight;
      }
   }

   private _needHorizontalRecalc(swipeConfig: ISwipeConfig): boolean {
      return (swipeConfig.itemActions.showed && swipeConfig.itemActions.showed.length === 1 && swipeConfig.itemActions.all.length > 1);
   }

   private _setMeasurer(actionAlignment: 'horizontal' | 'vertical' = 'horizontal'): void {
      this._actionAlignment = actionAlignment;
      this._measurer = MEASURER_NAMES[actionAlignment];
   }

   private _prepareTwoColumns(showedActions): Array {
      return [[showedActions[0],showedActions[1]],
              [showedActions[2],showedActions[3]]];
   }
   private editArrowHandler(item): void {
      this._notify('editArrowClick', [item]);
   }
   private _updateActionsOnCurrentItem(): void {
      this._setMeasurer(this._options.actionAlignment);

      const itemActions = this._options.useNewModel
         ? (this._currentItemData.getActions().all ? this._currentItemData.getActions().all : [])
         : (this._currentItemData.itemActions ? this._currentItemData.itemActions.all : []);


      if (this._options.showEditArrow) {
         if (!this._options.editArrowVisibilityCallback || this._options.editArrowVisibilityCallback(this._currentItemData.actionsItem)){
            let editArrow = {
               id: 'view',
               icon: 'icon-Forward',
               title: rk('Просмотреть'),
               showType: ShowType.TOOLBAR,
               handler: this.editArrowHandler.bind(this)
            };
            itemActions = [editArrow, ...itemActions];
         }
      }

      this._swipeConfig = this._measurer.getSwipeConfig(
          itemActions,
          this._actionsHeight,
          this._options.actionCaptionPosition
      );
      if (this._needHorizontalRecalc(this._swipeConfig)) {
         this._setMeasurer('horizontal');
         this._swipeConfig = this._measurer.getSwipeConfig(
             itemActions,
             this._actionsHeight,
             this._options.actionCaptionPosition
         );
      }
      const actionsItem = this._options.useNewModel ? this._currentItemData : this._currentItemData.actionsItem;
      if (this._options.useNewModel) {
         displayLib.ItemActionsController.setActionsToItem(
            this._options.listModel,
            actionsItem.getContents().getId(),
            this._swipeConfig.itemActions
         );
      } else {
         this._options.listModel.setItemActions(actionsItem, this._swipeConfig.itemActions);
      }
      if (this._swipeConfig.twoColumns) {
         this._swipeConfig.twoColumnsActions = this._prepareTwoColumns(this._swipeConfig.itemActions.showed);
      }

      //TODO: KINGO
      // после обновления _swipeConfig становится актуальным.
      this._isActual = true;
   }
   private _initSwipe(
      listModel: IListModel,
      itemData: IItemData,
      childEvent: ISwipeEvent
   ): void {
      this._actionsHeight = this._getActionsHeight(childEvent.target);
      if (this._options.useNewModel) {
         const key = itemData.getContents().getId();
         displayLib.ItemActionsController.setSwipeItem(listModel, itemData.getContents().getId());
         displayLib.ItemActionsController.setActiveItem(listModel, key);
      } else {
         listModel.setSwipeItem(itemData);
         listModel.setActiveItem(itemData);
      }

      //TODO: KINGO
      // запоминаем текущий активный элемент, чтобы мы могли обновить опции на немпри необходимости
      this._currentItemData = itemData;

      if (this._options.itemActionsPosition !== 'outside') {
         this._updateActionsOnCurrentItem();
      }
      this._animationState = 'open';
   }

   private _onItemActionsClick(
      event: Event,
      action: IItemAction,
      itemData: IItemData
   ): void {
      aUtil.itemActionsClick(this, event, action, itemData, this._options.listModel, false);
   }

   private _listClick(): void {
      this.closeSwipe();
   }

   private _listDeactivated(): void {
      this.closeSwipe();
   }

   async _beforeMount(newOptions: ISwipeControlOptions): Promise<void> {
      this._updateModel(newOptions);
      this._setMeasurer(newOptions.actionAlignment);
      if (newOptions.useNewModel) {
         displayLib = require('Controls/display');
         return import('Controls/listRender').then((listRender) => {
            this._swipeTemplate = listRender.swipeTemplate;
         });
      }
   }

   _beforeUpdate(
      newOptions: ISwipeControlOptions,
      context: ISwipeContext
   ): void {
      if (
         this._swipeConfig &&
         context &&
         context.isTouch &&
         !context.isTouch.isTouch
      ) {
         this.closeSwipe();
      }
      if (
         newOptions.itemActions &&
         this._options.itemActions !== newOptions.itemActions
      ) {
         this.closeSwipe();
      }
      if (
         newOptions.listModel &&
         this._options.listModel !== newOptions.listModel
      ) {
         this._updateModel(newOptions);
      }

      if (this._options.actionAlignment !== newOptions.actionAlignment) {
         this._setMeasurer(newOptions.actionAlignment);
      }
      if (!this._isActual && this._currentItemData) {

         // TODO: KINGO
         // Если текущие данные не актуальны, и у нас есть свайпнутая запись,
         // то получаем из модели актуальную itemData для текущего элемента, и пересчитываем _swipeConfig для него
         this._currentItemData = this._options.listModel.getItemDataByItem(this._currentItemData.dispItem);
         this._updateActionsOnCurrentItem();
      }
   }

   _beforeUnmount(): void {
      this._swipeConfig = null;
      this._measurer = null;
      this._actionAlignment = null;
      this._currentItemData = null;
   }

   closeSwipe(withAnimation: boolean = false): void {
      if (this._animationState === 'open') {
         this._animationState = 'close';
         if (withAnimation && !this._options.useNewModel) {
            this._options.listModel.nextModelVersion();
         } else {
            this._notifyAndResetSwipe();
         }
      }
   }

   static getOptionTypes(): Record<keyof ISwipeControlOptions, object> {
      return {
         listModel: descriptor(Object).required(),
         /**
          * TODO: itemActions should be required, but it would break lists without them because SwipeControl always gets created.
          * Make SwipeControl async after this: https://online.sbis.ru/opendoc.html?guid=515423be-194b-4655-aba9-bba005c2e5c6
          */
         itemActions: descriptor(Array),
         itemActionsPosition: descriptor(String).oneOf(['inside', 'outside', 'custom']),
         actionAlignment: descriptor(String).oneOf(['horizontal', 'vertical']),
         actionCaptionPosition: descriptor(String).oneOf(['right', 'bottom', 'none'])
      };
   }

   static contextTypes(): ISwipeContext {
      return {
         isTouch: TouchContextField
      };
   }

   static getDefaultOptions(): PickOptionalProperties<ISwipeControlOptions> {
      return {
         itemActionsPosition: 'inside',
         actionAlignment: 'horizontal',
         actionCaptionPosition: 'none'
      };
   }
}
