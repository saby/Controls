define(
   [
      'Controls/History/Source',
      'Controls/History/Service', // for otladka
      'Types/collection',
      'Types/entity',
      'Core/Deferred',
      'Types/source',
      'Controls/History/Constants',
      'Types/util',
   ],
   (historySource, historyService, collection, entity, Deferred, sourceLib, Constants, util) => {
      describe('History Source', () => {
         let items = [
            {
               id: '1',
               title: 'Запись 1',
               parent: null,
               '@parent': false
            },
            {
               id: '2',
               title: 'Запись 2',
               parent: null,
               '@parent': false
            },
            {
               id: '3',
               title: 'Запись 3',
               parent: null,
               '@parent': true,
               icon: 'icon-medium icon-Doge icon-primary'
            },
            {
               id: '4',
               title: 'Запись 4',
               parent: null,
               '@parent': false
            },
            {
               id: '5',
               title: 'Запись 5',
               parent: null,
               '@parent': false
            },
            {
               id: '6',
               title: 'Запись 6',
               parent: null,
               '@parent': false
            },
            {
               id: '7',
               title: 'Запись 7',
               parent: '3',
               '@parent': false
            },
            {
               id: '8',
               title: 'Запись 8',
               parent: null,
               '@parent': false
            }
         ];

         let pinnedData = {
            _type: 'recordset',
            d: [
               [
                  '5', null, 'TEST_HISTORY_ID_V1'
               ]
            ],
            s: [
               {n: 'ObjectId', t: 'Строка'},
               {n: 'ObjectData', t: 'Строка'},
               {n: 'HistoryId', t: 'Строка'}
            ]
         };
         let frequentData = {
            _type: 'recordset',
            d: [
               [
                  '6', null, 'TEST_HISTORY_ID_V1'
               ],
               [
                  '4',  null, 'TEST_HISTORY_ID_V1'
               ],
               [
                  '9',  null, 'TEST_HISTORY_ID_V1'
               ]
            ],
            s: [
               {n: 'ObjectId', t: 'Строка'},
               {n: 'ObjectData', t: 'Строка'},
               {n: 'HistoryId', t: 'Строка'}
            ]
         };
         let recentData = {
            _type: 'recordset',
            d: [
               [
                  '8', null, 'TEST_HISTORY_ID_V1'
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
               idProperty: 'ObjectId',
               adapter: new entity.adapter.Sbis()
            });
         }

         let data = new sourceLib.DataSet({
            rawData: {
               frequent: createRecordSet(frequentData),
               pinned: createRecordSet(pinnedData),
               recent: createRecordSet(recentData)
            },
            itemsProperty: '',
            idProperty: 'ObjectId'
         });

         let myItem = new entity.Model({
            rawData: {
               _type: 'record',
               d: ['7', 'Запись 7', '3', null],
               s: [
                  {n: 'id', t: 'Строка'},
                  {n: 'title', t: 'Строка'},
                  {n: 'parent', t: 'Строка'},
                  {n: 'pinned', t: 'Строка'}
               ]
            },
            adapter: new entity.adapter.Sbis(),
            idProperty: 'id',
            format: [
               {name: 'id', type: 'string'},
               {name: 'title', type: 'string'},
               {name: 'Parent', type: 'string'},
               {name: 'pinned', type: 'string'}
            ]
         });
         let config = {
            originSource: new sourceLib.Memory({
               idProperty: 'id',
               data: items
            }),
            historySource: new historyService({
               historyId: 'TEST_HISTORY_ID'
            }),
            parentProperty: 'parent'
         };
         let hSource = new historySource(config);
         let testId, meta, hS, historyItems, pinItem;

         // overload history source method query, it must return items to test
         config.historySource.query = function() {
            let def = new Deferred();
            def.addCallback(function(set) {
               return set;
            });
            def.callback(data);
            return def;
         };

         config.historySource.saveHistory = () => {};

         describe('getSourceByMeta', function() {
            it('$_pinned', function() {
               meta = {
                  '$_pinned': true
               };
               hS = historySource._private.getSourceByMeta(hSource, meta);
               assert.equal(hS._historyId, config.historySource._historyId);
            });
            it('$_favorite', function() {
               meta = {
                  '$_favorite': true
               };
               hS = historySource._private.getSourceByMeta(hSource, meta);
               assert.equal(hS._historyId, config.historySource._historyId);
            });
            it('$_history', function() {
               meta = {
                  '$_history': true
               };
               hS = historySource._private.getSourceByMeta(hSource, meta);
               assert.equal(hS._historyId, config.historySource._historyId);
            });
            it('originalSource', function() {
               meta = {};
               hS = historySource._private.getSourceByMeta(hSource, meta);
               assert.equal(!!hS._historyId, false);
            });
         });
   
         describe('serialize tests', function() {
            it('clone', function() {
               var sourceClone = util.object.clone(hSource);
               assert.isTrue(sourceClone instanceof historySource);
            });
         });
         
         describe('checkHistory', function() {
            it('query', function(done) {
               let query = new sourceLib.Query().where();
               let historyDef = hSource.query(query);
               let originHSource = hSource.historySource;
               var errorSource = {
                  query: function() {
                     return Deferred.fail(new Error('testError'));
                  }
               };

               historyDef.addCallback(function(data) {
                  let records = data.getAll();
                  assert.isFalse(records.at(0).has('pinned'));
   
                  query = new sourceLib.Query().where({
                     $_history: true
                  });
                  historyDef = hSource.query(query);
                  historyDef.addCallback(function(data) {
                     let records = data.getAll();
                     assert.isTrue(records.at(0).get('pinned'));
   
                     hSource.historySource = errorSource;
                     historyDef = hSource.query(query);
   
                     historyDef.addCallback(function(data) {
                        let records = data.getAll();
                        assert.isFalse(records.at(0).has('pinned'));
                        hSource.historySource = originHSource;
                        done();
                     });
                  });
               });
            });
            it('getItemsWithHistory', function() {
               historyItems = hSource.getItems();
               assert.equal(historyItems.at(0).get('title'), 'Запись 5');
               assert.equal(historyItems.at(1).get('title'), 'Запись 4');
               assert.equal(historyItems.at(3).get('title'), 'Запись 8');
            });
            it('check alphabet', function() {
               historyItems = hSource.getItems();
               assert.equal(historyItems.at(1).get('title'), 'Запись 4');
               assert.equal(historyItems.at(2).get('title'), 'Запись 6');
            });
            it('updatePinned', function() {
               let meta = {
                  $_pinned: true
               };
               hSource.update(myItem, meta);
               historyItems = hSource.getItems();
               pinItem = historyItems.at(1);
               assert.equal(pinItem.get('pinned'), true);
               assert.equal(hSource._history.pinned.at(1).get('ObjectId'), 7);
               assert.equal(hSource._history.pinned.at(1).get('HistoryId'), 7);
               meta = {
                  $_pinned: false
               };
               hSource.update(myItem, meta);
               historyItems = hSource.getItems();
               assert.equal(historyItems.at('1').get('pinned'), false);
            });
            it('checkPinnedAmount', function() {
               let list = new collection.RecordSet();

               for (var i = 0; i < Constants.MAX_HISTORY; i++) {
                  list.add(new entity.Model());
               }

               assert.isFalse(historySource._private.checkPinnedAmount(list));

               list.remove(list.at(9));
               assert.isTrue(historySource._private.checkPinnedAmount(list));
            });
            it('updateRecent', function() {
               let meta = {
                  $_history: true
               };
               hSource.update(myItem, meta);
               historyItems = hSource.getItems();
               assert.equal(historyItems.at(3).get('title'), 'Запись 7');
               hSource.update(myItem, meta);
               historyItems = hSource.getItems();
               assert.equal(hSource._history.recent.at(0).getId(), '7');
            });
            it('prepareHistoryBySourceItems', function(done){
               let newData = new sourceLib.DataSet({
                  rawData: {
                     frequent: createRecordSet(frequentData),
                     pinned: createRecordSet(pinnedData),
                     recent: createRecordSet(recentData)
                  },
                  itemsProperty: '',
                  idProperty: 'ObjectId'
               });
               let memorySource = new sourceLib.Memory({
                  idProperty: 'id',
                  data: items
               });
               memorySource.query().addCallback(function(res) {
                  let sourceItems = res.getAll();
                  let preparedHistory = historySource._private.prepareHistoryBySourceItems(null, newData.getRow(), sourceItems);
                  assert.equal(preparedHistory.get('frequent').getCount(), 2);
                  preparedHistory.get('frequent').forEach(function(historyItem){
                     assert.isFalse(historyItem.getId()=='9');
                  });
                  done();
               })
            });
         });
         describe('check source original methods', function() {
            it('create', function() {
               hSource.create({
                  id: '666',
                  title: 'Запись 666',
                  parent: null,
                  '@parent': false
               }).addCallback(function(item) {
                  assert.equal(item.get('title'), 'Запись 666');
               });
            });
            it('read', function() {
               hSource.read(9).addCallback(function(item) {
                  assert.equal(item.get('title'), 'Запись 666');
               });
            });
            it('destroy', function() {
               hSource.destroy(8).addCallback(function(isDestroyed) {
                  assert.equal(isDestroyed, true);
               }).addErrback(function(error) {
                  // throw error
                  assert.equal(error, true);
               });
            });
            it('getOptions', function() {
               assert.deepEqual(hSource.getOptions(), {debug: false});
            });
         });
      });
   });
