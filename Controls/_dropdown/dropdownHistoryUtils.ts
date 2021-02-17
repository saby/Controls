import coreInstance = require('Core/core-instance');
import Merge = require('Core/core-merge');
import * as Deferred from 'Core/Deferred';

let HistorySource, HistoryService;

function getMetaHistory() {
   return {
      $_history: true
   };
}

function isHistorySource(source) {
   return coreInstance.instanceOfModule(source, 'Controls/history:Source');
}

function createHistorySource(source, options) {
   return new HistorySource({
      originSource: source,
      historySource: new HistoryService({
         historyId: options.historyId
      }),
      parentProperty: options.parentProperty
   });
}

function getSource(source, options) {
   let historyLoad = new Deferred();
   const historyId = options.historyId;

   if (!historyId || isHistorySource(source)) {
      historyLoad.callback(source);
   } else if (HistorySource && HistoryService) {
      historyLoad.callback(createHistorySource(source, historyId));
   } else {
      require(['Controls/history'], (history) => {
         HistorySource = history.Source;
         HistoryService = history.Service;
         historyLoad.callback(createHistorySource(source, historyId));
      });
   }

   return historyLoad;
}

function getFilter(filter, source) {
   // TODO: Избавиться от проверки, когда будет готово решение задачи https://online.sbis.ru/opendoc.html?guid=e6a1ab89-4b83-41b1-aa5e-87a92e6ff5e7
   if (isHistorySource(source)) {
      return Merge(getMetaHistory(), filter || {});
   }
   return filter;
}

export = {
   getSourceFilter: getFilter,
   isHistorySource: isHistorySource,
   getSource: getSource,
   getMetaHistory: getMetaHistory
};
