define('Controls-demo/Input/Dropdown//historySourceDropdown',
   [
      'Core/Control',
      'WS.Data/Source/Memory',
      'Controls/History/Service',
      'Core/Deferred',
      'WS.Data/Source/DataSet',
      'WS.Data/Collection/RecordSet',
      'WS.Data/Adapter/Sbis',
      'WS.Data/Query/Query',
      'Controls/History/Source'
   ],

   function(Control, Memory, HistoryService, Deferred, DataSet, RecordSet, SbisAdapter, Query, HistorySource) {
      'use strict';

      var items = [
         { id: 1, title: 'admin.sbis.ru' },
         { id: 2, title: 'cloud.sbis.ru' },
         { id: 3, title: 'genie.sbis.ru' },
         { id: 4, title: 'my.sbis.ru' },
         { id: 5, title: 'online.sbis.ru' },
         { id: 6, title: 'sbis.ru' },
         { id: 7, title: 'tensor.ru' },
         { id: 8, title: 'wi.sbis.ru' },
         { id: 9, title: 'dev-online.sbis.ru' },
         { id: 10, title: 'fix-online.sbis.ru' }
      ];
      var recentData = {
         _type: 'recordset',
         d: [],
         s: [
            { n: 'ObjectId', t: 'Строка' },
            { n: 'ObjectData', t: 'Строка' },
            { n: 'HistoryId', t: 'Строка' }
         ]
      };
      var pinnedData = {
         _type: 'recordset',
         d: [
            [7]
         ],
         s: [
            { n: 'ObjectId', t: 'Строка' },
            { n: 'ObjectData', t: 'Строка' },
            { n: 'HistoryId', t: 'Строка' }
         ]
      };

      function createRecordSet(data) {
         return new RecordSet({
            rawData: data,
            idProperty: 'ObjectId',
            adapter: new SbisAdapter()
         });
      }

      function createMemory() {
         var srcData = new DataSet({
            rawData: {
               frequent: createRecordSet(),
               pinned: createRecordSet(pinnedData),
               recent: createRecordSet(recentData)
            },
            itemsProperty: '',
            idProperty: 'ObjectId'
         });
         var hs = new HistorySource({
            originSource: new Memory({
               idProperty: 'id',
               data: items
            }),
            historySource: new HistoryService({
               historyIds: ['TEST_HISTORY_ID_DROPDOWN'],
               pinned: true
            })
         });
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
      }

      return {
         createMemory: createMemory
      };
   });
