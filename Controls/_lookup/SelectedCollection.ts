import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls/_lookup/SelectedCollection/SelectedCollection');
import ItemTemplate = require('wml!Controls/_lookup/SelectedCollection/ItemTemplate');
import chain = require('Types/chain');
import tmplNotify = require('Controls/Utils/tmplNotify');
import selectedCollectionUtils = require('Controls/_lookup/SelectedCollection/Utils');
import ContentTemplate = require('wml!Controls/_lookup/SelectedCollection/_ContentTemplate');
import CrossTemplate = require('wml!Controls/_lookup/SelectedCollection/_CrossTemplate');
import CounterTemplate = require('wml!Controls/_lookup/SelectedCollection/CounterTemplate');
import {SyntheticEvent} from 'Vdom/Vdom';
import { Model } from 'Types/entity';

/**
 * Контрол, отображающий коллекцию элементов.
 *
 * @class Controls/_lookup/SelectedCollection
 * @extends Core/Control
 * @mixes Controls/_lookup/SelectedCollection/SelectedCollectionStyles
 * @control
 * @public
 * @author Капустин И.А.
 */
/*
 * Control, that display collection of items.
 *
 * @class Controls/_lookup/SelectedCollection
 * @extends Core/Control
 * @mixes Controls/_lookup/SelectedCollection/SelectedCollectionStyles
 * @control
 * @author Kapustin I.A.
 */


const
   JS_CLASS_CAPTION_ITEM = '.js-controls-SelectedCollection__item__caption',
   JS_CLASS_CROSS_ITEM = '.js-controls-SelectedCollection__item__cross';

class SelectedCollection extends Control {
   protected _template: TemplateFunction = template;
   protected _visibleItems = null;
   protected _notifyHandler = tmplNotify;
   protected _counterWidth: number = 0;
   protected _contentTemplate: TemplateFunction = ContentTemplate;
   protected _crossTemplate: TemplateFunction = CrossTemplate;
   protected _counterTemplate: TemplateFunction = CounterTemplate;

   static _theme: string[] = ['Controls/lookup'];
   static getDefaultOptions(): Object {
      return {
         itemTemplate: ItemTemplate,
         itemsLayout: 'default'
      };
   }

   protected _beforeMount(options): void {
      this._getItemMaxWidth = selectedCollectionUtils.getItemMaxWidth;
      this._clickCallbackPopup = this._clickCallbackPopup.bind(this);
      this._visibleItems = this._getVisibleItems(options.items, options.maxVisibleItems);
      this._counterWidth = options._counterWidth || 0;
   }

   protected _beforeUpdate(newOptions): void {
      let itemsCount: number = newOptions.items.getCount();
      this._visibleItems = this._getVisibleItems(newOptions.items, newOptions.maxVisibleItems);

      if (this._isShowCounter(itemsCount, newOptions.maxVisibleItems)) {
         this._counterWidth = newOptions._counterWidth || this._getCounterWidth(itemsCount, newOptions.readOnly, newOptions.itemsLayout);
      } else if (this._children.infoBox && this._children.infoBox.isOpened()) {
         this._notify('closeInfoBox');
      }
   }

   protected _afterMount(): void {
      let itemsCount: number = this._options.items.getCount();

      if (this._isShowCounter(itemsCount, this._options.maxVisibleItems) && !this._counterWidth) {
         this._counterWidth = this._counterWidth || this._getCounterWidth(itemsCount, this._options.readOnly, this._options.itemsLayout);

         if (this._counterWidth) {
            this._forceUpdate();
         }
      }
   }

   protected _itemClick(event: SyntheticEvent, item: Model): void {
      let eventName: string;

      if (event.target.closest(JS_CLASS_CAPTION_ITEM)) {
         eventName = 'itemClick';
      } else if (event.target.closest(JS_CLASS_CROSS_ITEM)) {
         eventName = 'crossClick';
      }

      if (eventName) {
         event.stopPropagation();
         this._notify(eventName, [item]);
      }
   }

   protected _clickCallbackPopup(eventType: SyntheticEvent, item: Model): void {
      if (eventType === 'crossClick') {
         this._notify('crossClick', [item]);
      } else if (eventType === 'itemClick') {
         this._notify('itemClick', [item]);
      }
   }

   protected _openInfoBox(): void {
      let config: Object = {
         target: this._children.infoBoxLink,
         opener: this,
         width: this._container.offsetWidth,
         templateOptions: {
            items: this._options.items.clone(),
            readOnly: this._options.readOnly,
            displayProperty: this._options.displayProperty,
            itemTemplate: this._options.itemTemplate,
            clickCallback: this._clickCallbackPopup
         }
      };

      this._notify('openInfoBox', [config]);
      this._children.infoBox.open(config);
   }

   private _getVisibleItems(items, maxVisibleItems: number): Array<Model> {
      let itemsInArray: Model = chain.factory(items).value();
      let indexFirstVisibleItem: number = Math.max(maxVisibleItems ? items.getCount() - maxVisibleItems : 0, 0);

      return itemsInArray.slice(indexFirstVisibleItem);
   }

   private _getCounterWidth(itemsCount, readOnly: boolean, itemsLayout: String): number {
      // in mode read only and single line, counter does not affect the collection
      if (readOnly && itemsLayout === 'oneRow') {
         return 0;
      }

      return selectedCollectionUtils.getCounterWidth(itemsCount);
   }

   private _isShowCounter(itemsCount: number, maxVisibleItems: number): boolean {
      return itemsCount > maxVisibleItems;
   }
}

export default SelectedCollection;
