/**
 * Created by kraynovdo on 31.01.2018.
 */
import BaseControl = require('Core/Control');
import template = require('wml!Controls/_filterPopup/History/List');
import Utils = require('Types/util');
import Serializer = require('Core/Serializer');
import * as Merge from 'Core/core-merge';
import * as Clone from 'Core/core-clone';
import {isEqual} from 'Types/object';
import {HistoryUtils} from 'Controls/filter';
import {factory} from 'Types/chain';
import {Constants} from 'Controls/history';
import {convertToSourceDataArray} from 'Controls/_filterPopup/converterFilterStructure';
import 'css!theme?Controls/filterPopup';

var MAX_NUMBER_ITEMS = 5;

   var getPropValue = Utils.object.getPropertyValue.bind(Utils);

   var _private = {
      getSource: function(historyId) {
         return HistoryUtils.getHistorySource({ historyId: historyId });
      },

      getItemId: function(item) {
         let id;
         if (item.hasOwnProperty('id')) {
            id = getPropValue(item, 'id');
         } else {
            id = getPropValue(item, 'name');
         }
         return id;
      },

      setObjectData: function(editItem, data) {
         editItem.set('ObjectData', JSON.stringify(data, new Serializer().serialize));
      },

      getStringHistoryFromItems: function(items, resetValues) {
         var textArr = [];
         factory(items).each(function(elem) {
            var value = getPropValue(elem, 'value'),
               resetValue = resetValues[_private.getItemId(elem)],
               textValue = getPropValue(elem, 'textValue'),
               visibility = getPropValue(elem, 'visibility');

            if (!isEqual(value, resetValue) && (visibility === undefined || visibility) && textValue) {
               textArr.push(textValue);
            }
         });
         return textArr.join(', ');
      },

      mapByField: function(items: Array, field: string): object {
         const result = {};
         let value;

         factory(items).each((item) => {
            value = getPropValue(item, field);

            if (value !== undefined) {
               result[_private.getItemId(item)] = getPropValue(item, field);
            }
         });

         return result;
      },

      onResize: function(self) {
         if (self._options.orientation === 'vertical') {
            var arrowVisibility = self._arrowVisible;
            self._arrowVisible = self._options.items.getCount() > MAX_NUMBER_ITEMS;

            if (arrowVisibility !== self._arrowVisible) {
               self._isMaxHeight = true;
               self._forceUpdate();
            }
         }
      },

       // TODO: Delete with old favorite
       removeRecordFromOldFavorite: function(self, itemData, item) {
         let storage = self._historyStorage;
         if (itemData.globalParams || itemData.isClient) {
            storage = self._historyGlobalStorage;
         }
         let recordIndex = storage.getIndexByValue('id', item.get('ObjectId'));
         if (recordIndex !== -1) {
            storage.removeAt(recordIndex);
         }
         return recordIndex;
      },

      minimizeHistoryItems: function(items) {
         factory(items).each((item) => {
            delete item.caption;
         });
      },

      setLinkTextValue: function(data) {
         data.linkText = _private.getStringHistoryFromItems(data.items, _private.mapByField(data.items, 'resetValue'));
      },

      getEditDialogOptions: function(self, item, historyId, savedTextValue) {
         const history = _private.getSource(historyId).getDataObject(item);
         let items = history.items || history;

         let captionsObject = _private.mapByField(self._options.filterItems, 'caption');
         items = factory(items).map((historyItem) => {
            historyItem.caption = captionsObject[historyItem.id];
            return historyItem;
         }).value();

         return {
            items,
            editedTextValue: savedTextValue || '',
            isClient: history.globalParams === undefined ? !!history.isClient : !!history.globalParams,
            isFavorite: item.get('pinned') || item.get('client')
         };
      },

      deleteFavorite: function(self, data) {
         _private.getSource(self._options.historyId).remove(self._editItem, {
            $_favorite: true, isClient: data.isClient
         });

         // TODO: Delete with old favorite
         let editItemData = _private.getSource(self._options.historyId).getDataObject(self._editItem);
         _private.removeRecordFromOldFavorite(self, editItemData, self._editItem);
         _private.updateOldFavoriteList(self);

         self._children.stickyOpener.close();
         self._notify('historyChanged');
      },

      saveFavorite: function(self, record) {
         let editItemData = _private.getSource(self._options.historyId).getDataObject(self._editItem);
         let ObjectData = Merge(Clone(editItemData), record.getRawData(), {rec: false});
         _private.minimizeHistoryItems(ObjectData.items);
         _private.setLinkTextValue(ObjectData);

         _private.setObjectData(self._editItem, ObjectData);

         // TODO: Delete with old favorite, leave the branch 'else'
         // Удаляем запись из старых списков, ниже добавим в новые, если ее нет
         const index = _private.removeRecordFromOldFavorite(self, editItemData, self._editItem);
         _private.updateOldFavoriteList(self);
         if (index !== -1) {
            // add to history and set pin
            const hSource = _private.getSource(self._options.historyId);
            hSource.update(self._editItem, { $_pinned: !self._editItem.get('pinned') }); // unpin for local history data
            hSource.update(record.getRawData(), { $_addFromData: true }).addCallback((ObjectId) => {
               self._editItem.set('ObjectId', ObjectId);
               hSource.update(self._editItem, {
                  $_pinned: true,
                  isClient: record.get('isClient')
               });
            });
         } else {
            // for new favorite
            _private.getSource(self._options.historyId).update(self._editItem, {
               $_favorite: true,
               isClient: record.get('isClient')
            });
         }
         self._notify('historyChanged');
      },

       // TODO: Delete with old favorite
       updateOldFavoriteList: function(self) {
         self._oldFavoriteList.assign(self._historyStorage.getHistory());
         self._oldFavoriteList.prepend(self._historyGlobalStorage.getHistory());
         _private.convertToNewFormat(self, self._oldFavoriteList, self._options.filterItems);
      },

      updateFavorite(self, item, text, target): void {
         const templateOptions = _private.getEditDialogOptions(self, item, self._options.historyId, text);
         const popupOptions = {
            opener: self,
            target,
            templateOptions,
            targetPoint: {
               vertical: 'bottom',
               horizontal: 'left'
            },
            direction: {
               horizontal: 'left'
            }
         };
         self._children.stickyOpener.open(popupOptions);
      },

       // TODO: Delete with old favorite
       convertToNewFormat: function(self, favoriteList, filterItems) {
         factory(favoriteList).each((favoriteItem) => {
            let data = favoriteItem.get('data');
            favoriteItem.get('data').set('items', convertToSourceDataArray(data.get('filter'),  _private.mapByField(filterItems, 'visibility')));
            data.removeField('filter');
            data.removeField('viewFilter');
         });
      }
   };

   var HistoryList = BaseControl.extend({
      _template: template,
      _historySource: null,
      _isMaxHeight: true,
      _itemsText: null,
      _historyStorage: null,
      _historyGlobalStorage: null,
      _editItem: null,
      _historyCount: null,

      _beforeMount: function(options) {
         if (options.items) {
            this._items = options.items.clone();
         }
         if (options.saveMode === 'favorite') {
             this._historyCount = Constants.MAX_HISTORY_REPORTS;
             this._oldFavoriteList = options.favoriteItems;
             this._historyStorage = options.historyStorage;
             this._historyGlobalStorage = options.historyGlobalStorage;
             _private.convertToNewFormat(this, this._oldFavoriteList, options.filterItems);
             this._items = _private.getSource(options.historyId).getItemsWithOldFavorite(this._oldFavoriteList);
         } else {
            this._historyCount = Constants.MAX_HISTORY;
         }
         this._itemsText = this._getText(this._items, options.filterItems, _private.getSource(options.historyId));
      },

      _beforeUpdate: function(newOptions) {
         if (!isEqual(this._options.items, newOptions.items)) {
            this._items = newOptions.items.clone();
            if (newOptions.saveMode === 'favorite') {
               this._items = _private.getSource(newOptions.historyId).getItemsWithOldFavorite(this._oldFavoriteList);
            }
            this._itemsText = this._getText(newOptions.items, newOptions.filterItems, _private.getSource(newOptions.historyId));
         }
      },

      _onPinClick: function(event, item) {
           _private.getSource(this._options.historyId).update(item, {
               $_pinned: !item.get('pinned')
           });
           this._notify('historyChanged');
      },

      _onFavoriteClick: function(event, item, text) {
         this._editItem = item;
         _private.updateFavorite(this, item, text, event.target);
      },

      _editDialogResult: function(event, data) {
         if (data.action === 'save') {
            _private.saveFavorite(this, data.record);
         } else if (data.action === 'delete') {
            _private.deleteFavorite(this, data);
         }
      },

      _clickHandler: function(event, item) {
         const history = _private.getSource(this._options.historyId).getDataObject(item);
         this._notify('applyHistoryFilter', [history]);
      },

      _afterMount: function() {
         _private.onResize(this);
      },

      _afterUpdate: function() {
         _private.onResize(this);
      },

      _getText: function(items, filterItems, historySource) {
         const itemsText = {};
         // the resetValue is not stored in history, we take it from the current filter items
         const resetValues = _private.mapByField(filterItems, 'resetValue');

         factory(items).each((item, index) => {
            let text = '';
            const history = historySource.getDataObject(item);

            if (history) {
               text = history.linkText || _private.getStringHistoryFromItems(history.items || history, resetValues);
            }
            itemsText[index] = text;
         });
         return itemsText;
      },

      _clickSeparatorHandler: function() {
         this._isMaxHeight = !this._isMaxHeight;
      }
   });

   HistoryList._private = _private;
   export = HistoryList;

