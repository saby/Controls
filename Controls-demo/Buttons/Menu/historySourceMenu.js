define('Controls-demo/Buttons/Menu/historySourceMenu',
   [
      'Controls/history',
      'Core/Deferred',
      'Types/collection',
      'Types/entity',
      'Types/source'
   ],

   function(history, Deferred, collection, entity, source) {

      'use strict';

      var hierarchyItems = [
         {id: 1, title: 'Task in development', parent: null},
         {id: 2, title: 'Error in development', parent: null},
         {id: 3, title: 'Commission', parent: null},
         {id: 4, title: 'Assignment', parent: null},
         {id: 5, title: 'Coordination', '@parent': true},
         {id: 6, title: 'Development', '@parent': true},
         {id: 7, title: 'Assignment for accounting', parent: null},
         {id: 8, title: 'Assignment for delivery', parent: null},
         {id: 9, title: 'Assignment for logisticians', parent: null}
      ];

      var coordSub = ['Coordination', 'Negotiate the discount', 'Harmonization of price changes', 'Approval of participation in trading',
         'Matching the layout', 'Matching the layout of the mobile application', 'Harmonization of the standard', 'Harmonization of themes',
         'Harmonization of the mobile application standard', 'Coordination of the change in a limited period',
         'Harmonization of the change of the contract template'];

      var devSub = ['The task in development', 'Merge request', 'Error in development',
         'Run on the test bench', 'Harmonization of changes in the database', 'Changing the operation rule',
         'Creating (changing) a printed form', 'The task of developing a standard component (test)', 'Code review',
         'Service update', 'Run on the working', 'Adding / changing a sample application code',
         'Component development (test)', 'Release report', 'Acceptance of the project (functional testing)'
      ];

      function prepareItems() {
         if (hierarchyItems[4].parent !== null) {
            hierarchyItems[4].parent = null;
            for (var i = 0; i < coordSub.length; i++) {
               hierarchyItems.push({
                  id: i + 10,
                  title: coordSub[i],
                  parent: 5,
                  '@parent': false
               });
            }
            hierarchyItems[5].parent = null;
            for (var j = 0; j < devSub.length; j++) {
               hierarchyItems.push({
                  id: j + 22,
                  title: devSub[j],
                  parent: 6,
                  '@parent': false
               });
            }
         }
         return hierarchyItems;
      }

      var pinnedData = {
         _type: 'recordset',
         d: [],
         s: [
            {n: 'ObjectId', t: 'Строка'},
            {n: 'ObjectData', t: 'Строка'},
            {n: 'HistoryId', t: 'Строка'}
         ]
      };
      var frequentData = {
         _type: 'recordset',
         d: [],
         s: [
            {n: 'ObjectId', t: 'Строка'},
            {n: 'ObjectData', t: 'Строка'},
            {n: 'HistoryId', t: 'Строка'}
         ]
      };
      var recentData = {
         _type: 'recordset',
         d: [],
         s: [
            {n: 'ObjectId', t: 'Строка'},
            {n: 'ObjectData', t: 'Строка'},
            {n: 'HistoryId', t: 'Строка'}
         ]
      };

      function createRecordSet(data) {
         return new collection.RecordSet({
            rawData: data,
            keyProperty: 'ObjectId',
            adapter: new entity.adapter.Sbis()
         });
      }

      function createDataSet(frData, pinData, recData) {
         return new source.DataSet({
            rawData: {
               frequent: createRecordSet(frData),
               pinned: createRecordSet(pinData),
               recent: createRecordSet(recData)
            },
            itemsProperty: '',
            keyProperty: 'ObjectId'
         });
      }

      function createMemory() {
         var srcData = createDataSet(frequentData, pinnedData, recentData);
         var hs = new history.Source({
            originSource: new source.Memory({
               keyProperty: 'id',
               data: prepareItems()
            }),
            historySource: new history.Service({
               historyIds: ['TEST_HISTORY_ID'],
               pinned: true
            }),
            parentProperty: 'parent',
            nodeProperty: '@parent'
         });
         var query = new source.Query().where({
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

         // Заглушка, чтобы демка не ломилась не сервис истории
         hs.historySource.update = function(item, meta) {
            var pinned = srcData.getRow().get('pinned');
            var recent = srcData.getRow().get('recent');
            var historyItem;
            if (meta['$_pinned']) {
               historyItem = new entity.Model({
                  rawData: {
                     d: [String(item.getId()), item.getId()],
                     s: [{ n: 'ObjectId', t: 'Строка' },
                        { n: 'HistoryId', t: 'Строка' }]
                  },
                  adapter: pinned.getAdapter()
               });
               pinned.append([historyItem]);
            } else if (meta['$_pinned'] === false) {
               pinned.remove(pinned.getRecordById(item.getId()));
            } else if (meta['$_history'] && !recent.getRecordById(item.getId())) {
               historyItem = new entity.Model({
                  rawData: {
                     d: [String(item.getId()), item.getId()],
                     s: [{ n: 'ObjectId', t: 'Строка' },
                        { n: 'HistoryId', t: 'Строка' }]
                  },
                  adapter: pinned.getAdapter()
               });
               recent.prepend([historyItem]);
            }
            srcData = createDataSet(frequentData, pinned.getRawData(), recentData);
            return {};
         };
         hs.historySource.query();
         return hs;
      }

      return {
         createMemory: createMemory
      };
   });
