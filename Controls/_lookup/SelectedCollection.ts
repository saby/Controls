import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import template = require('wml!Controls/_lookup/SelectedCollection/SelectedCollection');
import ItemTemplate = require('wml!Controls/_lookup/SelectedCollection/ItemTemplate');
import chain = require('Types/chain');
import {EventUtils} from 'UI/Events';
import selectedCollectionUtils = require('Controls/_lookup/SelectedCollection/Utils');
import ContentTemplate = require('wml!Controls/_lookup/SelectedCollection/_ContentTemplate');
import CrossTemplate = require('wml!Controls/_lookup/SelectedCollection/_CrossTemplate');
import CounterTemplate = require('wml!Controls/_lookup/SelectedCollection/CounterTemplate');
import {SyntheticEvent} from 'Vdom/Vdom';
import { Model } from 'Types/entity';
import {RecordSet} from 'Types/collection';
import { Sticky, IStickyPopupOptions } from 'Controls/popup';

const JS_CLASS_CAPTION_ITEM = '.js-controls-SelectedCollection__item__caption';
const JS_CLASS_CROSS_ITEM = '.js-controls-SelectedCollection__item__cross';

export interface ISelectedCollectionOptions extends IControlOptions{
   displayProperty: string;
   items: RecordSet;
   maxVisibleItems: number;
   itemTemplate: TemplateFunction;
}

interface ISelectedCollectionChildren {
   infoBoxLink: HTMLElement;
}
/**
 * Контрол, отображающий коллекцию элементов.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_lookup.less">переменные тем оформления</a>
 *
 * @class Controls/_lookup/SelectedCollection
 * @extends Core/Control
 *
 * @public
 * @author Герасимов А.М.
 */
/*
 * Control, that display collection of items.
 *
 * @class Controls/_lookup/SelectedCollection
 * @extends Core/Control
 *
 * @author Герасимов А.М.
 */
class SelectedCollection extends Control<ISelectedCollectionOptions, number> {
   protected _template: TemplateFunction = template;
   protected _visibleItems: Model[] = null;
   protected _notifyHandler: (event: SyntheticEvent, eventName: string) => void = EventUtils.tmplNotify;
   protected _getItemMaxWidth: Function = selectedCollectionUtils.getItemMaxWidth;
   protected _getItemOrder: Function = selectedCollectionUtils.getItemOrder;
   protected _counterWidth: number = 0;
   protected _contentTemplate: TemplateFunction = ContentTemplate;
   protected _crossTemplate: TemplateFunction = CrossTemplate;
   protected _counterTemplate: TemplateFunction = CounterTemplate;
   protected _children: ISelectedCollectionChildren;
   protected _infoBoxStickyId: string = null;

   protected _beforeMount(options: IControlOptions): void {
      this._clickCallbackPopup = this._clickCallbackPopup.bind(this);
      this._visibleItems = this._getVisibleItems(options.items, options.maxVisibleItems);
      this._counterWidth = options._counterWidth || 0;
   }

   protected _beforeUpdate(newOptions): void {
      const itemsCount: number = newOptions.items.getCount();
      this._visibleItems = this._getVisibleItems(newOptions.items, newOptions.maxVisibleItems);

      if (this._isShowCounter(itemsCount, newOptions.maxVisibleItems)) {
         this._counterWidth = newOptions._counterWidth ||
                              this._getCounterWidth(itemsCount, newOptions.readOnly, newOptions.itemsLayout);
      } else if (this._infoBoxStickyId) {
         this._notify('closeInfoBox');
         Sticky.closePopup(this._infoBoxStickyId);
      }
   }

   protected _afterMount(): void {
      const itemsCount: number = this._options.items.getCount();

      if (this._isShowCounter(itemsCount, this._options.maxVisibleItems) && !this._counterWidth) {
         this._counterWidth = this._counterWidth ||
                              this._getCounterWidth(itemsCount, this._options.readOnly, this._options.itemsLayout);
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
         this._notify(eventName, [item, event.nativeEvent]);
      }
   }

   protected _clickCallbackPopup(eventType: string, item: Model): void {
      if (eventType === 'crossClick') {
         this._notify('crossClick', [item]);
      } else if (eventType === 'itemClick') {
         this._notify('itemClick', [item]);
      }
   }

   protected _openInfoBox(): void {
      const config: IStickyPopupOptions = {
         target: this._children.infoBoxLink,
         opener: this,
         closeOnOutsideClick: true,
         actionOnScroll: 'close',
         width: this._container.offsetWidth,
         template: 'Controls/lookupPopup:Collection',
         direction: {
            vertical: 'bottom',
            horizontal: 'right'
         },
         targetPoint: {
            vertical: 'bottom',
            horizontal: 'left'
         },
         templateOptions: {
            items: this._options.items.clone(),
            readOnly: this._options.readOnly,
            displayProperty: this._options.displayProperty,
            itemTemplate: this._options.itemTemplate,
            clickCallback: this._clickCallbackPopup
         },
         eventHandlers: {
            onClose: () => {
               this._notify('closeInfoBox', []);
               this._infoBoxStickyId = null;
            }
         }
      };

      this._notify('openInfoBox', [config]);

      return Sticky.openPopup(config).then((popupId) => {
         this._infoBoxStickyId = popupId;
      });
   }

   private _getVisibleItems(items: RecordSet, maxVisibleItems: number): Model[]  {
      const startIndex = Math.max(maxVisibleItems ? items.getCount() - maxVisibleItems : 0, 0);
      const resultItems = [];

      items.each((item, index) => {
         if (index >= startIndex) {
            resultItems.push(item);
         }
      });

      return resultItems;
   }

   private _getCounterWidth(itemsCount: number, readOnly: boolean, itemsLayout: String): number {
      // in mode read only and single line, counter does not affect the collection
      if (readOnly && itemsLayout === 'oneRow') {
         return 0;
      }

      return selectedCollectionUtils.getCounterWidth(itemsCount, this._options.theme);
   }

   private _isShowCounter(itemsCount: number, maxVisibleItems: number): boolean {
      return itemsCount > maxVisibleItems;
   }

   static _theme: string[] = ['Controls/lookup'];

   static getDefaultOptions(): Object {
        return {
            itemTemplate: ItemTemplate,
            itemsLayout: 'default'
        };
    }
}

export default SelectedCollection;
