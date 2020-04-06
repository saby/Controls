// @ts-ignore
import {SbisService, DataSet, ICrud} from 'Types/source';
import {OptionsToPropertyMixin} from 'Types/entity';
import CoreExtend = require('Core/core-extend');
import Constants = require('Controls/_history/Constants');
import Deferred = require('Core/Deferred');
import coreClone = require('Core/core-clone');
import DataStorage from './DataStorage';
import LoadPromisesStorage from './LoadPromisesStorage';

var STORAGES_USAGE = {};

var _private = {
   getHistoryDataSource: function (self) {
      if (!self._historyDataSource) {
         self._historyDataSource = new SbisService({
            endpoint: {
               address: '/input-history/service/',
               contract: 'InputHistory'
            }
         });
      }
      return self._historyDataSource;
   },

   callQuery: function(self, method, params) {
      return _private.getHistoryDataSource(self).call(method, params);
   },

   load: function(self) {
      let resultDef;
      if (self._favorite) {
         resultDef = _private.callQuery(self, 'ClientAndUserHistoryList', {
            params: {
               historyId: self._historyId,
               client: { count: Constants.MAX_HISTORY_REPORTS },
               pinned: { count: Constants.MAX_HISTORY_REPORTS },
               recent: { count: Constants.MAX_HISTORY_REPORTS },
               getObjectData: true
            }
         });
      } else {
         resultDef = _private.callQuery(self, 'UnionMultiHistoryIndexesList', {
            params: {
               historyIds: self._historyId ? [self._historyId] : self._historyIds,
               pinned: {count: self._pinned ? Constants.MAX_HISTORY : 0},
               frequent: {count: self._frequent ? (Constants.MAX_HISTORY - Constants.MIN_RECENT) : 0},
               recent: {count: self._recent || Constants.MAX_HISTORY},
               getObjectData: self._dataLoaded
            }
         });
      }
      return resultDef;
   },

   getMethodNameByIdType: function (stringMethod, intMethod, id) {
      return typeof id === 'number' ? intMethod : stringMethod;
   },

   updateFavoriteData: function(self, data, meta) {
      _private.getHistoryDataSource(self).call('UpdateData', {
         history_id: self._historyId || data.get('HistoryId'),
         object_id: data.getId(),
         data: data.get('ObjectData'),
         history_type: Number(meta.isClient)
      });
   },

    deleteItem: function(self, data, meta) {
        return _private.callQuery(self, 'Delete', {
            history_id: self._historyId,
            object_id: data.getId(),
            history_type: Number(meta.isClient)
        });
    },

    updateHistory: function (self, data, meta) {
      if (meta.parentKey) {
         _private.callQuery(self, 'AddHierarchy', {
            history_id: self._historyId,
            parent1: meta.parentKey,
            id: data.id
         });
      } else if (data.ids) {
         _private.callQuery(self, _private.getMethodNameByIdType('AddList', 'AddIntList', data.ids[0]), {
            history_id: self._historyId,
            ids: data.ids,
            history_context: null
         });
      } else {
         var id = data.getId();
         _private.callQuery(self, _private.getMethodNameByIdType('Add', 'AddInt', id), {
            history_id: data.get('HistoryId') || self._historyId,
            id: id,
            history_context: null
         });
      }
   },

   addFromData: function (self, data) {
      return _private.getHistoryDataSource(self).call('AddFromData', {
         history_id: self._historyId,
         data: data
      });
   },

   updatePinned: function (self, data, meta) {
      const id = data.getId();
      const historyId = data.get('HistoryId') || self._historyId;
      if (meta.isClient) {
         _private.callQuery(self, 'PinForClient', {
            history_id: historyId,
            object_id: id,
            data: data.get('ObjectData')
         });
      } else {
         _private.callQuery(self, _private.getMethodNameByIdType('SetPin', 'SetIntPin', id), {
            history_id: historyId,
            id: id,
            history_context: null,
            pin: !!meta['$_pinned']
         });
      }
   },

   incrementUsage: function (self) {
      if (!STORAGES_USAGE[self._historyId]) {
         STORAGES_USAGE[self._historyId] = 0;
      }
      STORAGES_USAGE[self._historyId]++;
   },

   decrementUsage: function (self) {
      STORAGES_USAGE[self._historyId]--;
      if (STORAGES_USAGE[self._historyId] === 0) {
         DataStorage.delete(self._historyId);
      }
   }
};

/**
 * Источник, который работает с <a href="/doc/platform/developmentapl/middleware/input-history-service/">сервисом истории ввода</a>.
 *
 * @class Controls/_history/Service
 * @extends Core/core-extend
 * @implements Types/_source/ICrud
 * @mixes Types/_entity/OptionsToPropertyMixin
 * @public
 * @author Герасимов А.М.
 * @example
 * <pre>
 *    new history.Service({
 *       historyId: 'TEST_HISTORY_ID'
 *    })
 * </pre>
 */

/*
 * Source working with the service of InputHistory
 *
 * @class Controls/_history/Service
 * @extends Core/core-extend
 * @implements Types/_source/ICrud
 * @mixes Types/_entity/OptionsToPropertyMixin
 * @public
 * @author Герасимов А.М.
 * @example
 * <pre>
 *    new historyService({
 *       historyId: 'TEST_HISTORY_ID'
 *    })
 * </pre>
 */

/**
 * @name Controls/_history/Service#historyId
 * @cfg {String} Уникальный идентификатор <a href="/doc/platform/developmentapl/middleware/input-history-service/">сервиса истории</a>.
 */

/*
 * @name Controls/_history/Service#historyId
 * @cfg {String} unique service history identifier
 */

/**
 * @name Controls/_history/Service#historyIds
 * @cfg {Array of String} Уникальные идентификаторы <a href="/doc/platform/developmentapl/middleware/input-history-service/">сервиса истории</a>.
 */

/*
 * @name Controls/_history/Service#historyIds
 * @cfg {Array of String} unique service history identifiers
 */

/**
 * @name Controls/_history/Service#pinned
 * @cfg {Boolean} Загружает закрепленные записи из БЛ.
 * @remark
 * true - Load items
 * false - No load items
 */

/*
 * @name Controls/_history/Service#pinned
 * @cfg {Boolean} Loads pinned items from BL
 * @remark
 * true - Load items
 * false - No load items
 */

/**
 * @name Controls/_history/Service#frequent
 * @cfg {Boolean} Загружает наиболее часто выбираемые записи из БЛ.
 * @remark
 * true - Load items
 * false - No load items
 */

/*
 * @name Controls/_history/Service#frequent
 * @cfg {Boolean} Loads frequent items from BL
 * @remark
 * true - Load items
 * false - No load items
 */

/**
 * @name Controls/_history/Service#recent
 * @cfg {Boolean} Загружает последние записи из БЛ.
 * @remark
 * true - Load items
 * false - No load items
 */

/*
 * @name Controls/_history/Service#recent
 * @cfg {Boolean} Loads recent items from BL
 * @remark
 * true - Load items
 * false - No load items
 */

/**
 * @name Controls/_history/Service#dataLoaded
 * @cfg {Boolean} Записи, загруженные с данными объекта.
 * @remark
 * true - БЛ вернет записи с данными.
 * false - Бл вернет записи без данных.
 */

/*
 * @name Controls/_history/Service#dataLoaded
 * @cfg {Boolean} Items loaded with object data
 * @remark
 * true - BL return items with data
 * false - BL return items without data
 */

var Service = CoreExtend.extend([ICrud, OptionsToPropertyMixin], {
   _historyDataSource: null,
   _historyId: null,
   _historyIds: null,
   _pinned: null,
   _frequent: null,
   _dataLoaded: false,

   constructor: function Memory(cfg) {
      if (!cfg.historyId && !cfg.historyIds) {
         throw new Error('"historyId" not found in options.');
      }
      this._historyId = cfg.historyId;
      this._historyIds = cfg.historyIds;
      this._pinned = cfg.pinned;
      this._frequent = cfg.frequent;
      this._recent = cfg.recent;
      this._favorite = cfg.favorite;
      this._dataLoaded = cfg.dataLoaded;
   },

   update: function (data, meta) {
      if (meta.hasOwnProperty('$_addFromData')) {
         return _private.addFromData(this, data);
      }
      if (meta.hasOwnProperty('$_pinned')) {
         _private.updatePinned(this, data, meta);
      }
      if (meta.hasOwnProperty('$_history')) {
         _private.updateHistory(this, data, meta);
      }
      if (meta.hasOwnProperty('$_favorite')) {
         _private.updateFavoriteData(this, data, meta);
      }

      return {};
   },

   deleteItem: function(data, meta) {
      return _private.deleteItem(this, data, meta);
   },

   query(): Deferred<DataSet> {
      const self = this;
      const historyId = self._historyId;
      const storageDef = LoadPromisesStorage.read(historyId);
      const storageData = DataStorage.read(historyId);
      let resultDef;

      if (storageDef) {
         resultDef = new Deferred();
         // create new deferred, so in the first callback function, the result of the query will be changed
         storageDef.addBoth(() => {
            resultDef.callback(self.getHistory(historyId));
         });
      } else if (!storageDef && !storageData) {
         resultDef = _private.load(this);
         LoadPromisesStorage.write(historyId, resultDef);

         resultDef.addBoth((res) => {
            LoadPromisesStorage.delete(historyId);
            return res;
         });
      } else {
         resultDef = Deferred.success(new DataSet({
            rawData: self.getHistory(historyId)
         }));
      }
      _private.incrementUsage(this);
      return resultDef;
   },

   destroy(id: number|string): Deferred<null> {
      let  result;

      if (id) {
         result = _private.callQuery(this, 'Delete', {
               history_id: this._historyId,
               object_id: id
         });
      } else {
         result = Deferred.success(null);
      }

      _private.decrementUsage(this);
      return result;
   },

   /**
    * Returns a service history identifier
    * @returns {String}
    */
   getHistoryId: function () {
      return this._historyId;
   },

   /**
    * Save new history
    */
   saveHistory: function (historyId, newHistory) {
      DataStorage.write(historyId, coreClone(newHistory));
   },

   /**
    * Returns a set of history items
    * @returns {Object}
    */
   getHistory: function (historyId) {
      return DataStorage.read(historyId);
   }
});

Service._private = _private;
export = Service;
