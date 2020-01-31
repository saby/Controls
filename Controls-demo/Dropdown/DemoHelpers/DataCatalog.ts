import {Memory, DataSet, Query} from 'Types/source';
import {Source, Service} from 'Controls/history';
import * as Deferred from 'Core/Deferred';
import entity = require('Types/entity');
import {RecordSet} from 'Types/collection';
import * as memorySourceData from 'Controls-demo/Utils/MemorySourceData';

const departmentsItems = memorySourceData.departments;

const recordData = {
   pinned: {
      _type: 'recordset',
      d: [['1', null, 'TEST_HISTORY_ID_V1']],
      s: [
         { n: 'ObjectId', t: 'Строка' },
         { n: 'ObjectData', t: 'Строка' },
         { n: 'HistoryId', t: 'Строка' }
      ]
   },
   frequent: {
      _type: 'recordset',
      d: [],
      s: [
         { n: 'ObjectId', t: 'Строка' },
         { n: 'ObjectData', t: 'Строка' },
         { n: 'HistoryId', t: 'Строка' }
      ]
   },
   recent: {
      _type: 'recordset',
      d: [],
      s: [
         { n: 'ObjectId', t: 'Строка' },
         { n: 'ObjectData', t: 'Строка' },
         { n: 'HistoryId', t: 'Строка' }
      ]
   }
};
   function _createMemory() {
      var srcData = new DataSet({
         rawData: {
            frequent: _createRecordSet(recordData.frequent),
            pinned: _createRecordSet(recordData.pinned),
            recent: _createRecordSet(recordData.recent)
         },
         keyProperty: 'ObjectId'
      });

      // возвращаем historySource
      var hs = new Source({
         originSource: new Memory({
            keyProperty: 'id',
            data: departmentsItems
         }),

         historySource: new Service({
            historyId: 'TEST_HISTORY_ID',
            pinned: true
         })
      });
      // Заглушка, чтобы демка не ломилась не сервис истории
      hs.historySource.update = function() {
         return {};
      };
      var query = new Query().where({
         $_history: true
      });
      hs.historySource.query = function() {
         var def = new Deferred();
         def.addCallback(function(set) {
            return set;
         });
         def.callback(srcData);
         return def;
      };
      hs.query(query);
      hs.historySource.query();
      return hs;
   };

   function _createRecordSet(data) {
      return new RecordSet({
         rawData: data,
         keyProperty: 'ObjectId',
         adapter: new entity.adapter.Sbis()
      });
   };

export {
   _createMemory
}
