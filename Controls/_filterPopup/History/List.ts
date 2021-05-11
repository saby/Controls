import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_filterPopup/History/List';
import {Serializer} from 'UI/State';
import { SyntheticEvent } from 'UICommon/Events';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {isEqual} from 'Types/object';
import {factory} from 'Types/chain';
import * as Utils from 'Types/util';
import * as Merge from 'Core/core-merge';
import * as Clone from 'Core/core-clone';
import {HistoryUtils, IFilterItem} from 'Controls/filter';
import {IEditDialogResult, IEditDialogOptions} from './_EditDialog';
import {Constants, FilterSource as FilterHistorySource} from 'Controls/history';
import {StickyOpener} from 'Controls/popup';
import {ISwipeEvent} from 'Controls/listRender';
import 'css!Controls/filterPopup';

const MAX_NUMBER_ITEMS = 5;
const getPropValue = Utils.object.getPropertyValue.bind(Utils);

interface IHistoryListOptions extends IControlOptions{
   items: RecordSet;
   filterItems: IFilterItem[];
   saveMode: 'pinned'|'favorite';
   historyId: string;
   orientation: 'vertical'|'horizontal';
}

type TFilterHistorySource = typeof FilterHistorySource;

interface IHistoryText {
   [key: string]: string;
}

class HistoryList extends Control<IHistoryListOptions> {
   protected _template: TemplateFunction = template;
   protected _items: RecordSet;
   protected _arrowVisible: boolean;
   protected _isMaxHeight: boolean = true;
   protected _itemsText: IHistoryText = null;
   protected _historyCount: number = null;
   protected _swipeItem: Model = null;
   private _editItem: Model = null;
   private _stickyOpener: StickyOpener;

   protected _beforeMount(options: IHistoryListOptions): void {
      if (options.items) {
         this._items = options.items.clone();
      }
      if (options.saveMode === 'favorite') {
          this._historyCount = Constants.MAX_HISTORY_REPORTS;
          this._items = this._getSource(options.historyId).getItems();
      } else {
         this._historyCount = Constants.MAX_HISTORY;
      }
      this._itemsText = this._getText(this._items, options.filterItems, this._getSource(options.historyId));
   }

   protected _beforeUpdate(newOptions: IHistoryListOptions): void {
      if (!isEqual(this._options.items, newOptions.items)) {
         this._items = newOptions.items.clone();
         if (newOptions.saveMode === 'favorite') {
            this._items = this._getSource(newOptions.historyId).getItems();
         }
         this._itemsText = this._getText(newOptions.items,
             newOptions.filterItems, this._getSource(newOptions.historyId));
      }
   }

   protected _afterMount(): void {
      this._onResize();
   }

   protected _afterUpdate(): void {
      this._onResize();
   }

   protected _onPinClick(event: Event, item: Model): void {
        this._getSource(this._options.historyId).update(item, {
            $_pinned: !item.get('pinned')
        });
        this._notify('historyChanged');
   }

   protected _onFavoriteClick(event: Event, item: Model, text: string): void {
      this._editItem = item;
      this._updateFavorite(item, text, event.target);
   }

   protected _editDialogResult(data: IEditDialogResult): void {
      if (data.action === 'save') {
         this._saveFavorite(data.record);
      } else if (data.action === 'delete') {
         this._deleteFavorite(data);
      }
   }

   protected _itemSwipe(event: SyntheticEvent<ISwipeEvent>, item: Model): void {
      const direction = event.nativeEvent.direction;
      if (direction === 'left') {
         this._swipeItem = item;
      } else if (direction === 'right') {
         this._swipeItem = null;
      }
   }

   protected _clickHandler(event: Event, item: Model): void {
      const history = this._getSource(this._options.historyId).getDataObject(item);
      this._notify('applyHistoryFilter', [history]);
   }

   protected _clickSeparatorHandler(): void {
      this._isMaxHeight = !this._isMaxHeight;
      this._notify('controlResize', [], {bubbling: true});
   }

   private _getText(items: RecordSet,
                    filterItems: IFilterItem[],
                    historySource: TFilterHistorySource): IHistoryText {
      const itemsText = {};
      // the resetValue is not stored in history, we take it from the current filter items
      const resetValues = this._mapByField(filterItems, 'resetValue');

      factory(items).each((item, index: number) => {
         let text = '';
         const history = historySource.getDataObject(item);

         if (history) {
            text = history.linkText || this._getStringHistoryFromItems(history.items || history, resetValues);
         }
         itemsText[index] = text;
      });
      return itemsText;
   }

   private _getSource(historyId: string): TFilterHistorySource {
      return HistoryUtils.getHistorySource({ historyId });
   }

   private _getItemId(item: Model | IFilterItem): string {
      let id;
      if (item.hasOwnProperty('id')) {
         id = getPropValue(item, 'id');
      } else {
         id = getPropValue(item, 'name');
      }
      return id;
   }

   private _setObjectData(editItem: Model, data: object): void {
      editItem.set('ObjectData', JSON.stringify(data, new Serializer().serialize));
   }

   private _getStringHistoryFromItems(items: RecordSet, resetValues: object): string {
      const textArr = [];
      let value;
      let resetValue;
      let textValue;
      let visibility;
      factory(items).each((elem) => {
         value = getPropValue(elem, 'value');
         resetValue = resetValues[this._getItemId(elem)];
         textValue = getPropValue(elem, 'textValue');
         visibility = getPropValue(elem, 'visibility');

         if (!isEqual(value, resetValue) && (visibility === undefined || visibility) && textValue) {
            textArr.push(textValue);
         }
      });
      return textArr.join(', ');
   }

   private _mapByField(items: RecordSet|IFilterItem[], field: string): object {
      const result = {};
      let value;

      factory(items).each((item: Model) => {
         value = getPropValue(item, field);

         if (value !== undefined) {
            result[this._getItemId(item)] = getPropValue(item, field);
         }
      });

      return result;
   }

   private _onResize(): void {
      if (this._options.orientation === 'vertical') {
         const arrowVisibility = this._arrowVisible;
         this._arrowVisible = this._options.items.getCount() > MAX_NUMBER_ITEMS;

         if (arrowVisibility !== this._arrowVisible) {
            this._isMaxHeight = true;
            this._forceUpdate();
         }
      }
   }

   private _minimizeHistoryItems(items: IFilterItem[]): void {
      factory(items).each((item) => {
         delete item.caption;
      });
   }

   private _getEditDialogOptions(item: Model, historyId: string, savedTextValue: string): IEditDialogOptions {
      const history = this._getSource(historyId).getDataObject(item);
      let items = (history.items || history) as IFilterItem[];

      const captionsObject = this._mapByField(this._options.filterItems, 'caption');
      items = factory(items).map((historyItem) => {
         historyItem.caption = captionsObject[this._getItemId(historyItem)];
         return historyItem;
      }).value();

      return {
         items,
         editedTextValue: savedTextValue || '',
         isClient: history.globalParams === undefined ? !!history.isClient : !!history.globalParams,
         isFavorite: item.get('pinned') || item.get('client')
      };
   }

   private _deleteFavorite(data: IEditDialogResult): void {
      this._getSource(this._options.historyId).remove(this._editItem, {
         $_favorite: true, isClient: data.isClient
      });

      this._stickyOpener.close();
      this._notify('historyChanged');
   }

   private _saveFavorite(record: Model): void {
      const editItemData = this._getSource(this._options.historyId).getDataObject(this._editItem);
      const ObjectData = Merge(Clone(editItemData), record.getRawData(), {rec: false});
      this._minimizeHistoryItems(ObjectData.items);

      this._setObjectData(this._editItem, ObjectData);
      this._getSource(this._options.historyId).update(this._editItem, {
         $_favorite: true,
         isClient: record.get('isClient')
      });
      this._notify('historyChanged');
   }

   private _updateFavorite(item: Model, text: string, target: EventTarget): void {
      const templateOptions = this._getEditDialogOptions(item, this._options.historyId, text);
      const popupOptions = {
         template: 'Controls/_filterPopup/History/_EditDialog',
         opener: this,
         target,
         closeOnOutsideClick: true,
         targetPoint: {
            vertical: 'bottom',
            horizontal: 'left'
         },
         direction: {
            horizontal: 'left'
         },
         eventHandlers: {
            onResult: this._editDialogResult.bind(this)
         },
         templateOptions
      };
      if (!this._stickyOpener) {
         this._stickyOpener = new StickyOpener();
      }
      this._stickyOpener.open(popupOptions);
   }
}

export default HistoryList;
