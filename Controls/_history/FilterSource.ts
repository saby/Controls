/**
 * Created by am.gerasimov on 21.03.2018.
 */
import CoreExtend = require('Core/core-extend');
import collection = require('Types/collection');
import Deferred = require('Core/Deferred');
import sourceLib = require('Types/source');
import entity = require('Types/entity');
import Serializer = require('Core/Serializer');
import {factory} from 'Types/chain';
import {isEqual} from 'Types/object';

var historyMetaFields = ['$_favorite', '$_pinned', '$_history', '$_addFromData'];
var DEFAULT_FILTER = '{}';

var _private = {
   isOldPinned: function(data) {
      return !JSON.parse(data, _private.getSerialize().desirialize).hasOwnProperty('linkText');
   },

   deleteOldPinned: function(self, history, query) {
      let toDelete = [];
      const hSource = _private.getSourceByMeta(self, {'$_pinned': true});
      factory(history.pinned).each((pinItem) => {
        if (!pinItem.get('ObjectData') || _private.isOldPinned(pinItem.get('ObjectData'))) {
           toDelete.push(new Promise((resolve) => {
              hSource.deleteItem(pinItem, {}).addCallback(() => {
                 resolve();
              });
           }));
        }
      });

      if (toDelete.length) {
         Promise.all(toDelete).then(() => {
            self.query(query);
         });
      }
      return !toDelete.length;
   },

   getSourceByMeta: function (self, meta) {
      for (var i in meta) {
         if (meta.hasOwnProperty(i)) {
            if (historyMetaFields.indexOf(i) !== -1) {
               return self.historySource;
            }
         }
      }
      return self.originSource;
   },

   deserialize: function (self, data) {
      return JSON.parse(data, this.getSerialize(self).deserialize);
   },

   initHistory: function (self, data) {
      if (data.getRow) {
         var rows = data.getRow();
         var pinned = rows.get('pinned');
         var recent = rows.get('recent');
         var frequent = rows.get('frequent');
         var client = rows.get('client');

         self._history = {
            pinned: pinned,
            recent: recent
         };
         if (client) {
            self._history.client = client;
         } else if (frequent) {
            self._history.frequent = frequent;
         }
      } else {
         self._history = data;
      }
   },

    // TODO Delete with old favorite
   getItemsWithOldFavorite: function(self, history, favorite) {
      let id;
      factory(favorite).each((favoriteItem) => {
         id = favoriteItem.get('id');
         if (!history.pinned.getRecordById(id) && !history.client.getRecordById(id)) {
            let objectData = JSON.stringify(favoriteItem.get('data').getRawData(), _private.getSerialize().serialize);
            let newFormatItem = _private.getRawHistoryItem(self, id, objectData);
            if (objectData.globalParams) {
               history.client.add(newFormatItem);
            } else {
               history.pinned.add(newFormatItem);
            }
         }
      });
      return _private.getItemsWithHistory(self, history);
   },

   getItemsWithHistory: function (self, history) {
      var items = new collection.RecordSet({
         adapter: new entity.adapter.Sbis(),
         keyProperty: 'ObjectId'
      });

      this.addProperty(this, items, 'ObjectId', 'string', '');
      this.addProperty(this, items, 'ObjectData', 'string', '');
      this.addProperty(this, items, 'pinned', 'boolean', false);
      this.addProperty(this, items, 'client', 'boolean', false);

      if (self._history.client) {
         this.fillClient(self, history, items);
         this.fillFavoritePinned(self, history, items);
      }
      if (self.historySource._pinned !== false) {
         this.fillPinned(self, history, items);
      }
      this.fillRecent(self, history, items);

      return items;
   },

   getRawItem: function(item, format) {
      const rawData = {
         d: [
            item.getId(),
            item.get('ObjectData'),
            item.get('HistoryId')
         ],
         s: [
            { n: 'ObjectId', t: 'Строка' },
            { n: 'ObjectData', t: 'Строка' },
            { n: 'HistoryId', t: 'Строка' }
         ]
      };
      return new entity.Model({
         rawData: rawData,
         adapter: item.getAdapter(),
         format: format
      });
   },

   fillItems: function(history, items, historyType, checkCallback) {
      let item;
      let filteredItems = factory(history).filter((element) => {
         return !items.getRecordById(element.getId()) && checkCallback(element);
      }).value();
      filteredItems.forEach((element) => {
         item = _private.getRawItem(element, items.getFormat());
         if (historyType === 'pinned') {
            item.set('pinned', true);
         } else if (historyType === 'client') {
            item.set('client', true);
         }
         items.add(item);
      });
   },

   fillFavoritePinned: function(self, history, items) {
      let isClient;
      _private.fillItems(history.pinned, items, 'pinned', (item) => {
         isClient = history.client.getRecordById(item.getId());

         // TODO Delete item, that pinned before new favorite. Remove after https://online.sbis.ru/opendoc.html?guid=68e3c08e-3064-422e-9d1a-93345171ac39
         let data = item.get('ObjectData');
         return !isClient && !_private.isOldPinned(data) && data !== DEFAULT_FILTER;
      });
   },

   fillPinned: function(self, history, items) {
      _private.fillItems(history.pinned, items, 'pinned', (item) => {
         return item.get('ObjectData') !== DEFAULT_FILTER;
      });
   },

   fillClient: function(self, history, items) {
      _private.fillItems(history.client, items, 'client', (item) => {
         return item.get('ObjectData') !== DEFAULT_FILTER;
      });
   },

   fillRecent: function(self, history, items) {
      let pinnedCount = self.historySource._pinned !== false ? history.pinned.getCount() : 0;
      let maxLength = self.historySource._recent - pinnedCount - 1;
      let currentCount = 0;
      let isPinned;

      _private.fillItems(history.recent, items, 'recent', (item) => {
         isPinned = history.pinned.getRecordById(item.getId());
         if (!isPinned && item.get('ObjectData') !== DEFAULT_FILTER) {
            currentCount++;
         }
         return !isPinned && currentCount <= maxLength && item.get('ObjectData') !== DEFAULT_FILTER;
      });
   },

   addProperty: function (self, record, name, type, defaultValue) {
      if (record.getFormat().getFieldIndex(name) === -1) {
         record.addField({
            name: name,
            type: type,
            defaultValue: defaultValue
         });
      }
   },

   updateFavorite: function(self, data, meta) {
      const hService = _private.getSourceByMeta(self, meta);
      const metaPin = {
         '$_pinned': true,
         isClient: meta.isClient
      };

      if (self._history.client.getRecordById(data.getId()) && !meta.isClient) {
         // Update the local history data so as not to query to the history service
         _private.deleteClient(self, data);
         _private.updatePinned(self, data, metaPin);

         hService.deleteItem(data, { isClient: 1 });
      } else if (meta.isClient) {
         _private.addClient(self, data);
         hService.update(data, { $_pinned: false });
      } else if (!meta.isClient)  {
         _private.updatePinned(self, data, metaPin);
      }

      return hService.update(data, metaPin);
   },

   deleteClient: function(self, item) {
      let client = self._history.client;
      _private.deleteHistoryItem(client, item.getId());
      _private.deleteHistoryItem(self._history.recent, item.getId());
      _private.deleteHistoryItem(self._history.pinned, item.getId());

      self.historySource.saveHistory(self._history);
   },

   addClient: function(self, item) {
      let clientItem = self._history.client.getRecordById(item.getId());
      if (!clientItem) {
         self._history.client.add(_private.getRawHistoryItem(self, item.getId(), item.get('ObjectData'), item.get('HistoryId')));
      } else {
         _private.updateDataItem(clientItem, item.get('ObjectData'));
      }
   },

   updatePinned: function (self, item, meta) {
      const isPinned = !!meta['$_pinned'];
      let pinned = self._history.pinned;
      item.set('pinned', isPinned);

      if (isPinned) {
         let pinItem = pinned.getRecordById(item.getId());
         if (pinItem) {
            _private.updateDataItem(pinItem, item.get('ObjectData'));
         } else {
            pinned.add(this.getRawHistoryItem(self, item.getId(), item.get('ObjectData'), item.get('HistoryId')));
         }
      } else if (!isPinned) {
         pinned.remove(pinned.getRecordById(item.getId()));
      }
      self.historySource.saveHistory(self._history);
   },

   updateDataItem: function(item, ObjectData) {
      item.set('ObjectData', ObjectData);
   },

    deleteHistoryItem: function(history, id) {
       const hItem = history.getRecordById(id);
       if (hItem) {
          history.remove(hItem);
       }
    },

   updateRecent: function (self, item) {
      var id = item.getId();
      var recent = self._history.recent;
      var records;

      _private.deleteHistoryItem(recent, id);

      records = [this.getRawHistoryItem(self, item.getId(), item.get('ObjectData'), item.get('HistoryId'))];
      recent.prepend(records);
      self.historySource.saveHistory(self._history);
   },

   getRawHistoryItem: function (self, id, objectData, hId?) {
      return new entity.Model({
         rawData: {
            d: [id, objectData, hId || self.historySource.getHistoryId()],
            s: [{
                  n: 'ObjectId',
                  t: 'Строка'
               },
               {
                  n: 'ObjectData',
                  t: 'Строка'
               },
               {
                  n: 'HistoryId',
                  t: 'Строка'
               }
            ]
         },
         adapter: self._history.recent.getAdapter()
      });
   },

   findHistoryItem: function (self, data) {
      var history = self._history;

      return this.findItem(self, history.pinned, data) || this.findItem(self, history.recent, data) || null;
   },

   findItem: function (self, items, data) {
      let item = null;
      let objectData;
      const deserialize = _private.getSerialize().deserialize;

      /* В значении фильтра могут быть сложные объекты (record, дата и т.д.)
         При сериализации сложных объектов добавляется id инстанса и два одинаковых объекта сериализуются в разные строки,
         поэтому сравниваем десериализованные объекты */
      const itemData = JSON.parse(JSON.stringify(data, _private.getSerialize().serialize), deserialize);

      items.forEach(function (element) {
         objectData = element.get('ObjectData');
         if (objectData && itemData && isEqual(JSON.parse(objectData, deserialize), itemData)) {
            item = element;
         }
      });
      return item;
   },

   // Serializer при сериализации кэширует инстансы по идентификаторам,
   // и при десериализации, если идентификатор есть в кэше, берёт инстанс оттуда
   // Поэтому, когда применяем фильтр из истории,
   // идентификатор в сериалайзере на клиенте может совпасть с идентификатором сохранённым в истории
   // и мы по итогу получим некорректный результат
   // Для этого всегда создаём новый инстанс Serializer'a
   getSerialize: function () {
      return new Serializer();
   },

   destroy(self, id: number|string): void {
      const recent = self._history && self._history.recent;

      if (recent) {
         _private.deleteHistoryItem(recent, id);
      }
   }
};

/**
 * Объект, который принимает данные из источника истории.
 * @class Controls/_history/FilterSource
 * @extends Core/core-extend
 * @mixes Types/_entity/OptionsToPropertyMixin
 * @control
 * @private
 * @author Герасимов А.М.
 * @category Menu
 * @example
 * <pre>
 *    var source = new filterSource({
 *           originSource: new Memory({
 *               keyProperty: 'id',
 *               data: []
 *           }),
 *           historySource: new historyService({
 *               historyId: 'TEST_FILTER_HISTORY_ID',
 *               dataLoaded: true
 *           })
 *       });
 * </pre>
 */

/*
 * A proxy that works only takes data from the history source
 * @class Controls/_history/FilterSource
 * @extends Core/core-extend
 * @mixes Types/_entity/OptionsToPropertyMixin
 * @control
 * @private
 * @author Герасимов А.М.
 * @category Menu
 * @example
 * <pre>
 *    var source = new filterSource({
 *           originSource: new Memory({
 *               keyProperty: 'id',
 *               data: []
 *           }),
 *           historySource: new historyService({
 *               historyId: 'TEST_FILTER_HISTORY_ID',
 *               dataLoaded: true
 *           })
 *       });
 * </pre>
 */ 

/**
 * @name Controls/_history/FilterSource#originSource
 * @cfg {Source} Источник данных.
 */

/*
 * @name Controls/_history/FilterSource#originSource
 * @cfg {Source} A data source
 */

/**
 * @name Controls/_history/FilterSource#historySource
 * @cfg {Source} Источник, который работает с историей.
 * @see {Controls/_history/Service} Источник, который работает с <a href="/doc/platform/developmentapl/middleware/input-history-service/">сервисом истории ввода</a>.
 */

/*
 * @name Controls/_history/FilterSource#historySource
 * @cfg {Source} A source which work with history
 * @see {Controls/_history/Service} Source working with the service of InputHistory
 */

var Source = CoreExtend.extend([entity.OptionsToPropertyMixin], {
   _history: null,
   _serialize: false,
   '[Types/_source/ICrud]': true,

   constructor: function Memory(cfg) {
      this.originSource = cfg.originSource;
      this.historySource = cfg.historySource;
   },

   create: function (meta) {
      return _private.getSourceByMeta(this, meta).create(meta);
   },

   read: function (key, meta) {
      return _private.getSourceByMeta(this, meta).read(key, meta);
   },

   update: function (data, meta) {
      var self = this;
      var serData, item;

      if (meta.hasOwnProperty('$_pinned')) {
         _private.updatePinned(this, data, meta);
      }
      if (meta.hasOwnProperty('$_history')) {
         _private.updateRecent(this, data);
      }
      if (meta.hasOwnProperty('$_favorite')) {
         _private.updateFavorite(this, data, meta);
      }
      if (meta.hasOwnProperty('$_addFromData')) {
         item = _private.findHistoryItem(self, data);
         if (item) {
            meta = {
               '$_history': true
            };
            _private.updateRecent(this, item);
            _private.getSourceByMeta(this, meta).update(item, meta);
            return Deferred.success(item.getId());
         }

         serData = JSON.stringify(data, _private.getSerialize(this).serialize);

         return _private.getSourceByMeta(this, meta).update(serData, meta).addCallback(function (dataSet) {
            _private.updateRecent(
               self,
               _private.getRawHistoryItem(self, dataSet.getRawData(), serData, item ? item.get('HistoryId') : self.historySource.getHistoryId())
            );
            return dataSet.getRawData();
         });
      }
      return _private.getSourceByMeta(this, meta).update(data, meta);
   },

   remove: function(data, meta) {
      const hService = _private.getSourceByMeta(this, meta);
      if (meta.isClient) {
         _private.deleteClient(this, data);
         hService.deleteItem(data, { isClient: 0 });
      } else {
         _private.updatePinned(this, data, meta);
         _private.deleteHistoryItem(this._history.recent, data.getId());
      }
      hService.deleteItem(data, meta);
   },

   destroy(id: number|string, meta?: object): Deferred<null> {
      if (meta && meta.hasOwnProperty('$_history')) {
         _private.destroy(this, id);
      }

      return _private.getSourceByMeta(this, meta).destroy(id, meta);
   },

   query: function (query) {
      var self = this;
      var where = query.getWhere();
      var newItems;

      if (where && where['$_history'] === true) {
         const prepareHistory = () => {
            newItems = _private.getItemsWithHistory(self, self._history);
            self.historySource.saveHistory(self.historySource.getHistoryId(), self._history);
            self._loadDef.callback(
                new sourceLib.DataSet({
                   rawData: newItems.getRawData(),
                   keyProperty: newItems.getKeyProperty()
                })
            );
         };

          self._loadDef = self._loadDef && !self._loadDef.isReady() ? self._loadDef : new Deferred();
          self.historySource.query().addCallback(function (data) {
              _private.initHistory(self, data);
              if (self._history.client) {  // TODO Delete with old favorite
                  if (_private.deleteOldPinned(self, self._history, query)) {
                     prepareHistory();
                  }
              } else {
                 prepareHistory();
              }
         });
          return self._loadDef;
      }
      return self.originSource.query(query);
   },

   /**
    * Returns a set of items sorted by history
    * @returns {RecordSet}
    */
   getItems: function () {
      return _private.getItemsWithHistory(this, this._history);
   },

   // TODO: Delete with old favorite https://online.sbis.ru/opendoc.html?guid=68e3c08e-3064-422e-9d1a-93345171ac39
   getItemsWithOldFavorite: function(oldFavoriteItems) {
      return _private.getItemsWithOldFavorite(this, this._history, oldFavoriteItems);
   },

   /**
    * Returns a set of recent items
    * @returns {RecordSet}
    */
   getRecent: function () {
      return this._history.recent;
   },

   getPinned() {
      return this._history.pinned;
   },

   /**
    * Returns a deserialized history object
    * @returns {Object}
    */
   getDataObject: function(data) {
      return _private.deserialize(this, data.get('ObjectData'));
   }
});

Source._private = _private;

export = Source;
