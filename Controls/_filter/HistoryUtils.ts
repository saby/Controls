import {Service as HistoryService, FilterSource as HistorySource, Constants} from 'Controls/history';
import {factory} from 'Types/chain';
import * as CoreClone from 'Core/core-clone';

import {CrudWrapper} from 'Controls/dataSource';
import {factory as CollectionFactory} from 'Types/collection';
import entity = require('Types/entity');
import collection = require('Types/collection');
import sourceLib = require('Types/source');
import Env = require('Env/Env');
import Di = require('Types/di');
import coreInstance = require('Core/core-instance');

var HISTORY_SOURCE = {};

function destroyHistorySource(historyId) {
   HISTORY_SOURCE[historyId].destroy({}, {
      '$_history': true
   });
   HISTORY_SOURCE[historyId] = null;
}

function createHistorySource(cfg) {
   var historySourceData = {
      historyId: cfg.historyId,
      pinned: true,

      /* A record about resets filters is stored in the history, but it is not necessary to display it in the history list.
         We request one more record, so that the number of records remains equal to 10 */
      recent: (Constants[cfg.recent] || Constants.MAX_HISTORY) + 1,
      favorite: cfg.favorite,
      dataLoaded: true
   };
   return new HistorySource({
      originSource: new sourceLib.Memory({
         keyProperty: 'id',
         data: []
      }),
      historySource: Di.isRegistered('demoSourceHistory') ? Di.resolve('demoSourceHistory', historySourceData)
         : new HistoryService(historySourceData)
   });
}

function getHistorySource(cfg) {
   if (Env.constants.isServerSide) {
      return createHistorySource(cfg);
   } else {
      HISTORY_SOURCE[cfg.historyId] = HISTORY_SOURCE[cfg.historyId] || createHistorySource(cfg);
   }
   return HISTORY_SOURCE[cfg.historyId];
}

function loadHistoryItems(historyConfig) {
   const source = getHistorySource(historyConfig);
   const crudWrapper = new CrudWrapper({source});
   return crudWrapper.query({
      filter: {
         $_history: true
      }
   }).then((items) => {
      return new collection.RecordSet({
         rawData: items.getRawData(),
         adapter: new entity.adapter.Sbis()
      });
   });
}

function isHistorySource(source) {
   return coreInstance.instanceOfModule(source, 'Controls/history:Source');
}

function deleteHistorySourceFromConfig(initConfig, sourceField) {
   let configs = CoreClone(initConfig);
   factory(configs).each((config) => {
      if (isHistorySource(config[sourceField])) {
         delete config[sourceField];
      }
   });
   return configs;
}

function createRecordSet(items, sourceRecordSet) {
   return items.value(CollectionFactory.recordSet, {
      adapter: sourceRecordSet.getAdapter(),
      keyProperty: sourceRecordSet.getKeyProperty(),
      format: sourceRecordSet.getFormat(),
      model: sourceRecordSet.getModel(),
      metaData: sourceRecordSet.getMetaData()
   });
}

function getUniqItems(items1, items2, keyProperty) {
   const resultItems = items1.clone();
   resultItems.prepend(items2);

   let uniqItems = factory(resultItems).filter((item, index) => {
      if (resultItems.getIndexByValue(keyProperty, item.get(keyProperty)) === index) {
         return item;
      }
   });
   return createRecordSet(uniqItems, items1);
}

function prependNewItems(oldItems, newItems, sourceController, keyProperty) {
   const allCount = oldItems.getCount();
   let uniqItems = getUniqItems(oldItems, newItems, keyProperty);

   if (sourceController && sourceController.hasMoreData('down')) {
      uniqItems = factory(uniqItems).first(allCount);
      uniqItems = createRecordSet(uniqItems, oldItems);
   }
   return uniqItems;
}

function getItemsWithHistory(oldItems, newItems, sourceController, source, keyProperty) {
   let itemsWithHistory;
   const resultItems = prependNewItems(oldItems, newItems, sourceController, keyProperty);
   if (isHistorySource(source)) {
      itemsWithHistory = source.prepareItems(resultItems);
   } else {
      itemsWithHistory = resultItems;
   }
   return itemsWithHistory;
}

export {
   loadHistoryItems,
   getHistorySource,
   destroyHistorySource,
   isHistorySource,
   getItemsWithHistory,
   getUniqItems,
   deleteHistorySourceFromConfig
};
