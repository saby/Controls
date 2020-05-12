define('Controls-demo/FilterView/resources/hierarchyHistoryMemory', [
      'Core/Deferred',
      'Types/source',
      'Controls/history',
      'Types/entity',
      'Types/collection'
   ],

   function(Deferred, source, history, entity, collection) {

      'use strict';

      var recentData = {
         _type: 'recordset',
         d: [],
         s: [
            { n: 'ObjectId', t: 'Строка' },
            { n: 'HistoryId', t: 'Строка' }
         ]
      };

      var pinnedData = {
         _type: 'recordset',
         d: [],
         s: [
            { n: 'ObjectId', t: 'Строка' },
            { n: 'HistoryId', t: 'Строка' }
         ]
      };

      function createRecordSet(data) {
         return new collection.RecordSet({
            rawData: data,
            idProperty: 'ObjectId',
            adapter: new entity.adapter.Sbis()
         });
      }

      function getSrcData() {
         return new source.DataSet({
            rawData: {
               frequent: createRecordSet(),
               pinned: createRecordSet(pinnedData),
               recent: createRecordSet(recentData)
            },
            itemsProperty: '',
            idProperty: 'ObjectId'
         });
      }

      var FilterViewMemory = history.Source.extend({

         constructor: function(options) {
            options.historySource.query = function() {
               var def = new Deferred();
               def.addCallback(function(set) {
                  return set;
               });
               def.callback(getSrcData());
               return def;
            };
            options.historySource.update = function(updateData) {
               //
            };
            FilterViewMemory.superclass.constructor.apply(this, arguments);
         },

         query: function(queryInst) {
            var resultDeferred = new Deferred();
            var superQuery = FilterViewMemory.superclass.query.apply(this, arguments);
            var self = this;

            superQuery.addCallback(function(dataSet) {
               var getAll = dataSet.getAll.bind(dataSet);
               var originAll = getAll();
               var originAllMeta = originAll.getMetaData();
               var moreResult = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{
                     id: 'Приход',
                     nav_result: true
                  }, {
                     id: 'Расход',
                     nav_result: false
                  }]
               });

               dataSet.getAll = function() {
                  var resultAll = getAll();
                  resultAll.setMetaData({more: moreResult});
                  return resultAll;
               };
               resultDeferred.callback(dataSet);
               return dataSet;
            });

            return resultDeferred;
         },

         getModel: function() {
            return this.originSource.getModel();
         },

         destroyHistory: function() {
            recentData.d = [];
            pinnedData.d = [];
         }

      });

      return FilterViewMemory;
   });
