define('ControlsUnit/Filter/Button/History/testHistorySource',
   [
      'Core/Control',
      'Types/di',
      'Controls/history',
      'Core/Deferred',
      'Types/source',
      'Types/collection',
      'Types/entity',
      'Core/Serializer'
   ],

   function(Control, Di, history, Deferred, source, collection, entity, Serializer) {

      'use strict';

      var items = [
         {id: 'period', value: [1], resetValue: [1]},
         {id: 'state', value: [1], resetValue: [1]},
         {id: 'limit', value: [1], resetValue: '', textValue: 'Due date', visibility: false},
         {id: 'sender', value: '', resetValue: '', visibility: false},
         {id: 'author', value: 'Ivanov K.K.', resetValue: ''},
         {id: 'responsible', value: '', resetValue: '', visibility: false},
         {id: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false},
         {id: 'operation', value: '', resetValue: '', visibility: false},
         {id: 'group', value: [1], resetValue: '', visibility: false},
         {id: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: false},
         {id: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false},
         {id: 'own', value: [2], resetValue: '', textValue: 'On department', visibility: false},
         {id: 'our organisation', value: '', resetValue: '', visibility: false},
         {id: 'document', value: '', resetValue: '', visibility: false},
         {id: 'activity', value: [1], resetValue: '', selectedKeys: [1], visibility: false}
      ];

      var items1 = [
         {id: 'period', value: [3], resetValue: [1], textValue: 'Past month'},
         {id: 'state', value: [1], resetValue: [1]},
         {id: 'limit', value: [1], resetValue: '', textValue: 'Due date', visibility: false},
         {id: 'sender', value: '', resetValue: '', visibility: false},
         {id: 'author', value: 'Ivanov K.K.', textValue: 'Ivanov K.K.', resetValue: ''},
         {id: 'responsible', value: '', resetValue: '', visibility: false},
         {id: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false},
         {id: 'operation', value: '', resetValue: '', visibility: false},
         {id: 'group', value: [1], resetValue: '', visibility: false},
         {id: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: false},
         {id: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false},
         {id: 'own', value: [2], resetValue: '', textValue: 'On department', visibility: false},
         {id: 'our organisation', value: '', resetValue: '', visibility: false},
         {id: 'document', value: '', resetValue: '', visibility: false},
         {id: 'activity', value: [1], resetValue: '', selectedKeys: [1], visibility: false}
      ];

      var items2 = [
         {id: 'period', value: [3], resetValue: [1], textValue: 'Past month'},
         {id: 'state', value: [1], resetValue: [1]},
         {id: 'limit', value: [1], resetValue: '', textValue: 'Due date', visibility: true},
         {id: 'sender', value: '', resetValue: '', textValue: 'Petrov B.B', visibility: true},
         {id: 'author', value: 'Ivanov K.K.', textValue: 'Ivanov K.K.', resetValue: ''},
         {id: 'responsible', value: '', resetValue: '', visibility: false},
         {id: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false},
         {id: 'operation', value: '', resetValue: '', visibility: false},
         {id: 'group', value: [1], resetValue: '', visibility: false},
         {id: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: true},
         {id: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false},
         {id: 'own', value: [2], resetValue: '', textValue: 'On department', visibility: true},
         {id: 'our organisation', value: '', resetValue: '', visibility: false},
         {id: 'document', value: '', resetValue: '', visibility: false},
         {id: 'activity', value: [1], resetValue: '', selectedKeys: [1], visibility: false}
      ];

      var config = {
         originSource: new source.Memory({
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
            {n: 'ObjectId', t: 'Строка'},
            {n: 'ObjectData', t: 'Строка'},
            {n: 'HistoryId', t: 'Строка'}
         ]
      };
      var frequentData = {
         _type: 'recordset',
         d: [
            [
               '6', 'History 6', 'TEST_HISTORY_ID_V1'
            ],
            [
               '4',  'History 4', 'TEST_HISTORY_ID_V1'
            ],
            [
               '9',  'History 9', 'TEST_HISTORY_ID_V1'
            ]
         ],
         s: [
            {n: 'ObjectId', t: 'Строка'},
            {n: 'ObjectData', t: 'Строка'},
            {n: 'HistoryId', t: 'Строка'}
         ]
      };
      var recentData = {
         _type: 'recordset',
         d: [
            [
               '8', JSON.stringify(items2, new Serializer().serialize), 'TEST_HISTORY_ID_2'
            ],
            [
               '5', JSON.stringify(items1, new Serializer().serialize), 'TEST_HISTORY_ID_1'
            ]
         ],
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

      var data = new source.DataSet({
         rawData: {
            frequent: createRecordSet(frequentData),
            pinned: createRecordSet(pinnedData),
            recent: createRecordSet(recentData)
         },
         itemsProperty: '',
         keyProperty: 'ObjectId'
      });

      config.historySource.saveHistory = function() {};

      var histSource = Control.extend({
         constructor: function(cfg) {
            this._recent = cfg.recent;
            this._favorite = cfg.favorite;
         },

         getHistoryId: function() {
            return 'DEMO_HISTORY_ID';
         },

         saveHistory: function() {

         },

         update: function(dataHistory, meta) {
            data = new source.DataSet({
               rawData: {
                  frequent: createRecordSet(frequentData),
                  pinned: createRecordSet(pinnedData),
                  recent: createRecordSet(recentData)
               },
               itemsProperty: '',
               keyProperty: 'ObjectId'
            });
            return Deferred.success(data);
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
