define('Controls-demo/Filter/Button/panelOptions/HistorySourceDemo',
   [
      'UI/Base',
      'Types/di',
      'Controls/history',
      'Core/Deferred',
      'Types/source',
      'Types/collection',
      'Types/entity',
      'UI/State'
   ],

   function(Base, Di, history, Deferred, sourceLib, collection, entity, uiState) {
      'use strict';

      var items = [
         {
            name: 'period',
            value: [1],
            resetValue: [1],
            source: new sourceLib.Memory({
               data: [
                  { key: 1, title: 'All time' },
                  { key: 2, title: 'Today' },
                  { key: 3, title: 'Past month' },
                  { key: 4, title: 'Past 6 months' },
                  { key: 5, title: 'Past year' }
               ],
               keyProperty: 'key'
            })
         },
         {
            name: 'state',
            value: [1],
            resetValue: [1],
            source: new sourceLib.Memory({
               data: [
                  { key: 1, title: 'All states' },
                  { key: 2, title: 'In progress' },
                  { key: 3, title: 'Done' },
                  { key: 4, title: 'Not done' },
                  { key: 5, title: 'Deleted' }
               ],
               keyProperty: 'key'
            })
         },
         {
            name: 'limit',
            value: [1],
            resetValue: [1],
            textValue: 'Due date',
            visibility: false,
            source: new sourceLib.Memory({
               keyProperty: 'key',
               data: [
                  { key: 1, title: 'Due date' },
                  { key: 2, title: 'Overdue' }
               ]
            })
         },
         {
            name: 'sender', value: '', resetValue: '', visibility: false
         },
         { name: 'author', value: 'Ivanov K.K.', resetValue: '' },
         {
            name: 'responsible', value: '', resetValue: '', visibility: false
         },
         {
            name: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false
         },
         {
            name: 'operation', value: '', resetValue: '', visibility: false
         },
         {
            name: 'group',
            value: [1],
            resetValue: '',
            visibility: false,
            source: new sourceLib.Memory({
               keyProperty: 'key',
               data: [
                  { key: 1, title: 'My' },
                  { key: 2, title: 'My department' }
               ]
            })

         },
         {
            name: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: false
         },
         {
            name: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false
         },
         {
            name: 'own',
            value: [2],
            resetValue: '',
            textValue: 'On department',
            visibility: false,
            source: new sourceLib.Memory({
               keyProperty: 'key',
               data: [
                  { key: 1, title: 'On me' },
                  { key: 2, title: 'On department' }
               ]
            })
         },
         {
            name: 'our organisation', value: '', resetValue: '', visibility: false
         },
         {
            name: 'document', value: '', resetValue: '', visibility: false
         },
         {
            name: 'activity', value: [1], resetValue: '', selectedKeys: [1], visibility: false
         }
      ];

      var items1 = [
         {
            name: 'period',
            value: [1],
            resetValue: [1],
            source: new sourceLib.Memory({
               data: [
                  { key: 1, title: 'All time' },
                  { key: 2, title: 'Today' },
                  { key: 3, title: 'Past month' },
                  { key: 4, title: 'Past 6 months' },
                  { key: 5, title: 'Past year' }
               ],
               keyProperty: 'key'
            })
         },
         {
            name: 'state',
            value: [1],
            resetValue: [1],
            source: new sourceLib.Memory({
               data: [
                  { key: 1, title: 'All states' },
                  { key: 2, title: 'In progress' },
                  { key: 3, title: 'Done' },
                  { key: 4, title: 'Not done' },
                  { key: 5, title: 'Deleted' }
               ],
               keyProperty: 'key'
            })
         },
         {
            name: 'limit',
            value: [1],
            resetValue: [1],
            textValue: 'Due date',
            visibility: false,
            source: new sourceLib.Memory({
               keyProperty: 'key',
               data: [
                  { key: 1, title: 'Due date' },
                  { key: 2, title: 'Overdue' }
               ]
            })
         },
         {
            name: 'sender', value: '', resetValue: '', visibility: false
         },
         {
            name: 'author',
            value: 'Ivanov K.K.',
            textValue: 'Author: Ivanov K.K.',
            resetValue: '',
            templateItem: 'wml!Controls-demo/Filter/Button/resources/itemTemplate/author'
         },
         {
            name: 'responsible', value: '', resetValue: '', visibility: false
         },
         {
            name: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false
         },
         {
            name: 'operation', value: '', resetValue: '', visibility: false
         },
         {
            name: 'group',
            value: [1],
            resetValue: '',
            visibility: false,
            source: new sourceLib.Memory({
               keyProperty: 'key',
               data: [
                  { key: 1, title: 'My' },
                  { key: 2, title: 'My department' }
               ]
            })
         },
         {
            name: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: false
         },
         {
            name: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false
         },
         {
            name: 'own',
            value: [2],
            resetValue: '',
            textValue: 'On department',
            visibility: false,
            source: new sourceLib.Memory({
               keyProperty: 'key',
               data: [
                  { key: 1, title: 'On me' },
                  { key: 2, title: 'On department' }
               ]
            })
         },
         {
            name: 'our organisation', value: '', resetValue: '', visibility: false
         },
         {
            name: 'document', value: '', resetValue: '', visibility: false
         },
         {
            name: 'activity',
            value: [1],
            resetValue: [1],
            visibility: false,
            source: new sourceLib.Memory({
               keyProperty: 'key',
               data: [
                  { key: 1, title: 'Activity for the last month' },
                  { key: 2, title: 'Activity for the last quarter' },
                  { key: 3, title: 'Activity for the last year' }
               ]
            })
         }
      ];

      var items2 = [
         {
            name: 'period',
            value: [1],
            resetValue: [1],
            source: new sourceLib.Memory({
               data: [
                  { key: 1, title: 'All time' },
                  { key: 2, title: 'Today' },
                  { key: 3, title: 'Past month' },
                  { key: 4, title: 'Past 6 months' },
                  { key: 5, title: 'Past year' }
               ],
               keyProperty: 'key'
            })
         },
         {
            name: 'state',
            value: [1],
            resetValue: [1],
            source: new sourceLib.Memory({
               data: [
                  { key: 1, title: 'All states' },
                  { key: 2, title: 'In progress' },
                  { key: 3, title: 'Done' },
                  { key: 4, title: 'Not done' },
                  { key: 5, title: 'Deleted' }
               ],
               keyProperty: 'key'
            })
         },
         {
            name: 'limit',
            value: [1],
            resetValue: '',
            textValue: 'Due date',
            visibility: true,
            source: new sourceLib.Memory({
               keyProperty: 'key',
               data: [
                  { key: 1, title: 'Due date' },
                  { key: 2, title: 'Overdue' }
               ]
            })
         },
         {
            name: 'sender', value: '', resetValue: '', textValue: 'Petrov B.B', visibility: true
         },
         {
            name: 'author',
            value: 'Ivanov K.K.',
            textValue: 'Author: Ivanov K.K.',
            resetValue: '',
            templateItem: 'wml!Controls-demo/Filter/Button/resources/itemTemplate/author'
         },
         {
            name: 'responsible', value: '', resetValue: '', visibility: false
         },
         {
            name: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false
         },
         {
            name: 'operation', value: '', resetValue: '', visibility: false
         },
         {
            name: 'group',
            value: [1],
            resetValue: [1],
            visibility: false,
            source: new sourceLib.Memory({
               keyProperty: 'key',
               data: [
                  { key: 1, title: 'My' },
                  { key: 2, title: 'My department' }
               ]
            })
         },
         {
            name: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: true
         },
         {
            name: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false
         },
         {
            name: 'own',
            value: [2],
            resetValue: '',
            textValue: 'On department',
            visibility: true,
            source: new sourceLib.Memory({
               keyProperty: 'key',
               data: [
                  { key: 1, title: 'On me' },
                  { key: 2, title: 'On department' }
               ]
            })
         },
         {
            name: 'our organisation', value: '', resetValue: '', visibility: false
         },
         {
            name: 'document', value: '', resetValue: '', visibility: false
         },
         {
            name: 'activity',
            value: [1],
            resetValue: [1],
            visibility: false,
            source: new sourceLib.Memory({
               keyProperty: 'key',
               data: [
                  { key: 1, title: 'Activity for the last month' },
                  { key: 2, title: 'Activity for the last quarter' },
                  { key: 3, title: 'Activity for the last year' }
               ]
            })
         }
      ];

      var config = {
         originSource: new sourceLib.Memory({
            keyProperty: 'id',
            data: items
         }),
         historySource: new history.Service({
            historyId: 'DEMO_HISTORY_ID'
         }),
         parentProperty: 'parent'
      };

      var pinnedData = {
         _type: 'recordset',
         d: [

         ],
         s: [
            { n: 'ObjectId', t: 'Строка' },
            { n: 'ObjectData', t: 'Строка' },
            { n: 'HistoryId', t: 'Строка' }
         ]
      };
      var frequentData = {
         _type: 'recordset',
         d: [
            [
               '6', 'History 6', 'TEST_HISTORY_ID_V1'
            ],
            [
               '4', 'History 4', 'TEST_HISTORY_ID_V1'
            ],
            [
               '9', 'History 9', 'TEST_HISTORY_ID_V1'
            ]
         ],
         s: [
            { n: 'ObjectId', t: 'Строка' },
            { n: 'ObjectData', t: 'Строка' },
            { n: 'HistoryId', t: 'Строка' }
         ]
      };
      var recentData = {
         _type: 'recordset',
         d: [
            [
               '8', JSON.stringify(items2, new uiState.Serializer().serialize), 'TEST_HISTORY_ID_2'
            ],
            [
               '5', JSON.stringify(items1, new uiState.Serializer().serialize), 'TEST_HISTORY_ID_1'
            ]
         ],
         s: [
            { n: 'ObjectId', t: 'Строка' },
            { n: 'ObjectData', t: 'Строка' },
            { n: 'HistoryId', t: 'Строка' }
         ]
      };

      function createRecordSet(data) {
         return new collection.RecordSet({
            rawData: data,
            keyProperty: 'ObjectId',
            adapter: new entity.adapter.Sbis()
         });
      }

      var data = new sourceLib.DataSet({
         rawData: {
            frequent: createRecordSet(frequentData),
            pinned: createRecordSet(pinnedData),
            recent: createRecordSet(recentData)
         },
         itemsProperty: '',
         keyProperty: 'ObjectId'
      });

      config.historySource.saveHistory = function() {};

      var histSource = Base.Control.extend({
         constructor: function(cfg) {
            this._recent = cfg.recent;
         },

         getHistoryId: function() {
            return 'DEMO_HISTORY_ID';
         },

         saveHistory: function() {

         },

         update: function(dataHistory, meta) {
            data = new sourceLib.DataSet({
               rawData: {
                  frequent: createRecordSet(frequentData),
                  pinned: createRecordSet(pinnedData),
                  recent: createRecordSet(recentData)
               },
               itemsProperty: '',
               keyProperty: 'ObjectId'
            });
            return {};
         },

         query: function() {
            var def = new Deferred();
            def.addCallback(function(set) {
               return set;
            });
            def.callback(data);
            return def;
         }
      });

      Di.register('demoSourceHistory', histSource);

      return histSource;
   });
