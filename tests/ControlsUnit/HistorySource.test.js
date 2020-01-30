define(
   [
      'Controls/history', // for otladka
      'Types/collection',
      'Types/entity',
      'Core/Deferred',
      'Types/source',
      'Types/util',
      'Core/core-clone'
   ],
   (historyMod, collection, entity, Deferred, sourceLib, util, clone) => {
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
               ],
               [
                  'idNotExistInData', null, 'TEST_HISTORY_ID_V1'
               ]
            ],
            s: [
               { n: 'ObjectId', t: 'Строка' },
               { n: 'ObjectData', t: 'Строка' },
               { n: 'HistoryId', t: 'Строка' }
            ]
         };
         let frequentData = {
            _type: 'recordset',
            d: [
               [
                  '6', null, 'TEST_HISTORY_ID_V1'
               ],
               [
                  '4', null, 'TEST_HISTORY_ID_V1'
               ],
               [
                  '9', null, 'TEST_HISTORY_ID_V1'
               ]
            ],
            s: [
               { n: 'ObjectId', t: 'Строка' },
               { n: 'ObjectData', t: 'Строка' },
               { n: 'HistoryId', t: 'Строка' }
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

         let data = new sourceLib.DataSet({
            rawData: {
               frequent: createRecordSet(frequentData),
               pinned: createRecordSet(pinnedData),
               recent: createRecordSet(recentData)
            },
            itemsProperty: '',
            keyProperty: 'ObjectId'
         });

         let myItem = new entity.Model({
            rawData: {
               _type: 'record',
               d: ['7', 'Запись 7', '3', null],
               s: [
                  { n: 'id', t: 'Строка' },
                  { n: 'title', t: 'Строка' },
                  { n: 'parent', t: 'Строка' },
                  { n: 'pinned', t: 'Строка' }
               ]
            },
            adapter: new entity.adapter.Sbis(),
            keyProperty: 'id',
            format: [
               { name: 'id', type: 'string' },
               { name: 'title', type: 'string' },
               { name: 'Parent', type: 'string' },
               { name: 'pinned', type: 'string' }
            ]
         });
         let config = {
            originSource: new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            }),
            historySource: new historyMod.Service({
               historyId: 'TEST_HISTORY_ID'
            }),
            parentProperty: 'parent'
         };
         let hSource = new historyMod.Source(config);
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
               hS = historyMod.Source._private.getSourceByMeta(hSource, meta);
               assert.equal(hS._historyId, config.historySource._historyId);
            });
            it('$_favorite', function() {
               meta = {
                  '$_favorite': true
               };
               hS = historyMod.Source._private.getSourceByMeta(hSource, meta);
               assert.equal(hS._historyId, config.historySource._historyId);
            });
            it('$_history', function() {
               meta = {
                  '$_history': true
               };
               hS = historyMod.Source._private.getSourceByMeta(hSource, meta);
               assert.equal(hS._historyId, config.historySource._historyId);
            });
            it('originalSource', function() {
               meta = {};
               hS = historyMod.Source._private.getSourceByMeta(hSource, meta);
               assert.equal(!!hS._historyId, false);
            });
         });

         describe('serialize tests', function() {
            it('clone', function() {
               var sourceClone = util.object.clone(hSource);
               assert.isTrue(sourceClone instanceof historyMod.Source);
            });
         });

         describe('checkHistory', function() {
            it('query', function(done) {
               let query = new sourceLib.Query().where();
               let historyDef = hSource.query(query);
               let originHSource = hSource.historySource;
               let originSource = hSource.originSource;
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
                     assert.equal(hSource._history.pinned.getCount(), 1);

                     hSource.historySource = errorSource;
                     historyDef = hSource.query(query);

                     historyDef.addCallback(function(data) {
                        let records = data.getAll();
                        assert.isFalse(records.at(0).has('pinned'));
                        hSource.historySource = originHSource;

                        hSource.originSource = errorSource;
                        historyDef = hSource.query(query);

                        historyDef.addErrback(function(error) {
                           assert.isTrue(error instanceof Error);
                           hSource.originSource = originSource;
                           done();
                        });
                     });
                  });
               });
            });
            it('getItemsWithHistory', function() {
               let newHistoryItem = new entity.Model({
                  rawData: {
                     d: ['7', null, 'TEST_HISTORY_ID_V1'],
                     s: [
                        { n: 'ObjectId', t: 'Строка'},
                        { n: 'ObjectData', t: 'Строка'},
                        { n: 'HistoryId', t: 'Строка'}
                     ]
                  },
                  adapter: new entity.adapter.Sbis()
               });
               hSource._history.pinned.add(newHistoryItem);
               historyItems = hSource.getItems();
               assert.equal(historyItems.at(0).get('title'), 'Запись 5');
               assert.equal(historyItems.at(1).get('title'), 'Запись 7');
               assert.equal(historyItems.at(3).get('title'), 'Запись 6');
               assert.equal(historyItems.at(8).getId(), '7_history');
               assert.equal(historyItems.getFormat().getCount(), 10);
               hSource._history.pinned.removeAt(1);
            });
            it('getItemsWithHistory number id', function() {
               let newData = new sourceLib.DataSet({
                  rawData: {
                     frequent: createRecordSet(frequentData),
                     pinned: createRecordSet(pinnedData),
                     recent: createRecordSet(recentData)
                  },
                  itemsProperty: '',
                  keyProperty: 'ObjectId'
               });
               let oldItems = [...items];
               oldItems = oldItems.map((item) => {
                  item.id = Number(item.id);
                  return item;
               });
               hSource._oldItems = new collection.RecordSet({
                  rawData: oldItems,
                  keyProperty: 'id'
               });
               historyMod.Source._private.initHistory(hSource, newData, hSource._oldItems);
               historyItems = hSource.getItems();
               assert.equal(historyItems.at(0).get('title'), 'Запись 5');
               assert.equal(historyItems.at(1).get('title'), 'Запись 4');
               assert.equal(historyItems.at(2).get('title'), 'Запись 6');
               assert.equal(historyItems.at(3).get('title'), 'Запись 8');
            });
            it('getItems', function(done) {
               let historyConfig = {
                  originSource: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: items
                  }),
                  historySource: new historyMod.Service({
                     historyId: 'TEST_HISTORY_ID'
                  }),
                  parentProperty: 'parent'
               };
               let historySource = new historyMod.Source(historyConfig);
               assert.isNull(historySource.getItems());

               let query = new sourceLib.Query().where({
                  $_history: true
               });
               historySource.query(query).addCallback(function() {
                  assert.deepStrictEqual(historySource.getItems().getRawData(), items);
                  done();
               });
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

               for (var i = 0; i < historyMod.Constants.MAX_HISTORY; i++) {
                  list.add(new entity.Model());
               }

               assert.isFalse(historyMod.Source._private.checkPinnedAmount(list));

               list.remove(list.at(9));
               assert.isTrue(historyMod.Source._private.checkPinnedAmount(list));
            });
            it('getRawHistoryItem', function() {
               let historyItem = historyMod.Source._private.getRawHistoryItem(hSource, '123', 'history_id');
               assert.strictEqual(historyItem.getId(), '123');

               historyItem = historyMod.Source._private.getRawHistoryItem(hSource, 123, 'history_id');
               assert.strictEqual(historyItem.getId(), '123');
            });

            it('getKeyProperty', function() {
               let initSource = new sourceLib.Memory({
                  keyProperty: 'key',
                  data: []
               });
               let self = {
                  originSource: initSource
               };
               assert.equal(historyMod.Source._private.getKeyProperty(self), 'key');

               self.originSource = new sourceLib.PrefetchProxy({
                  target: initSource,
                  data: {
                     query: {}
                  }
               });
               assert.equal(historyMod.Source._private.getKeyProperty(self), 'key');
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

               hSource.update([myItem], meta);
               historyItems = hSource.getItems();
               assert.equal(historyItems.at(3).get('title'), 'Запись 7');
               assert.equal(hSource._history.recent.at(0).getId(), '7');
            });
            it('updateRecent history not loaded', function() {
               let config2 = clone(config),
                  updatedData,
                  meta = {
                     $_history: true
                  };
               config2.historySource.update = function(data) {
                  updatedData = data;
               };
               let hSource2 = new historyMod.Source(config2);
               hSource2.update(myItem, meta);
               assert.deepEqual(myItem, updatedData);

            });
            it('prepareHistoryItems', function(done) {
               let newData = new sourceLib.DataSet({
                  rawData: {
                     frequent: createRecordSet(frequentData),
                     pinned: createRecordSet(pinnedData),
                     recent: createRecordSet(recentData)
                  },
                  itemsProperty: '',
                  keyProperty: 'ObjectId'
               });
               let memorySource = new sourceLib.Memory({
                  keyProperty: 'id',
                  data: items
               });
               memorySource.query().addCallback(function(res) {
                  let sourceItems = res.getAll();
                  let preparedHistory = historyMod.Source._private.prepareHistoryItems({originSource: hSource.originSource}, newData.getRow().get('frequent'), sourceItems);
                  assert.equal(preparedHistory.getCount(), 2);
                  preparedHistory.forEach(function(historyItem) {
                     assert.isFalse(historyItem.getId() === '9');
                  });
                  done();
               });
            });
            it('initHistory', function(done) {
               let newData = new sourceLib.DataSet({
                  rawData: {
                     frequent: createRecordSet(frequentData),
                     pinned: createRecordSet(pinnedData),
                     recent: createRecordSet(recentData)
                  },
                  itemsProperty: '',
                  keyProperty: 'ObjectId'
               });
               let memorySource = new sourceLib.Memory({
                  keyProperty: 'id',
                  data: items
               });
               memorySource.query().addCallback(function(res) {
                  let self = {
                     _pinned: ['1', '2'],
                     originSource: hSource.originSource,
                     historySource: {
                        getHistoryId: () => {
                           'TEST_ID';
                        }
                     }
                  };
                  let sourceItems = res.getAll();
                  historyMod.Source._private.initHistory(self, newData, sourceItems);
                  assert.equal(self._history.pinned.getCount(), 3);
                  assert.equal(self._recentCount, 1);
                  self._history.pinned.forEach(function(pinnedItem) {
                     assert.isFalse(pinnedItem.getId() === '9');
                  });

                  newData = new sourceLib.DataSet({
                     rawData: {
                        frequent: createRecordSet(frequentData),
                        pinned: createRecordSet(pinnedData),
                        recent: createRecordSet(recentData)
                     },
                     itemsProperty: '',
                     keyProperty: 'ObjectId'
                  });
                  historyMod.Source._private.initHistory(self, newData, sourceItems);
                  assert.equal(self._history.pinned.getCount(), 3);

                  done();
               });
            });

            it('initHistory source no pinned items', function(done) {
               let newData = new sourceLib.DataSet({
                  rawData: {
                     frequent: createRecordSet(frequentData),
                     pinned: createRecordSet(pinnedData),
                     recent: createRecordSet(recentData)
                  },
                  itemsProperty: '',
                  keyProperty: 'ObjectId'
               });
               let itemsWithoutId = items.slice(1);
               let memorySource = new sourceLib.Memory({
                  keyProperty: 'id',
                  data: itemsWithoutId
               });
               memorySource.query().addCallback(function(res) {
                  let self = {
                     _pinned: ['1', '2'],
                     originSource: memorySource,
                     historySource: {
                        getHistoryId: () => {
                           'TEST_ID';
                        }
                     }
                  };
                  let sourceItems = res.getAll();
                  historyMod.Source._private.initHistory(self, newData, sourceItems);
                  assert.equal(self._history.pinned.getCount(), 2);
                  self._history.pinned.forEach(function(pinnedItem) {
                     assert.isFalse(pinnedItem.getId() == '1');
                     assert.isFalse(pinnedItem.getId() == '9');
                  });
                  done();
               });
            });

            it('_private:getPinnedIds', function() {
               let pinnedIds = historyMod.Source._private.getPinnedIds(hSource._history.pinned);
               assert.deepEqual(pinnedIds, ['5']);
            });

            it('_private:getFrequentIds', function() {
               let frequentIds = historyMod.Source._private.getFrequentIds(hSource, hSource._history.frequent, ['5']);
               assert.deepEqual(frequentIds, ['6', '4']);
            });

            it('_private:getRecentIds', function() {
               let recentIds = historyMod.Source._private.getRecentIds(hSource, hSource._history.recent, ['5'], ['6', '4']);
               assert.deepEqual(recentIds, ['7', '8']);
            });

            it('_private:getFilterHistory', function() {
               let expectedResult = {
                  pinned: ['5'],
                  frequent: ['6', '4'],
                  recent: ['7', '8']
               };
               let actualResult = historyMod.Source._private.getFilterHistory(hSource, hSource._history);
               assert.deepEqual(expectedResult, actualResult);

               // 1 pinned + 5 recent
               expectedResult = {
                  pinned: ['5'],
                  frequent: ['6', '4'],
                  recent: ['8', '1', '2', '3', '7']
               };
               let recentFilteredData = {
                  _type: 'recordset',
                  d: [
                     ['8', null, 'TEST_HISTORY_ID_V1'],
                     ['1', null, 'TEST_HISTORY_ID_V1'],
                     ['2', null, 'TEST_HISTORY_ID_V1'],
                     ['3', null, 'TEST_HISTORY_ID_V1'],
                     ['4', null, 'TEST_HISTORY_ID_V1'],
                     ['5', null, 'TEST_HISTORY_ID_V1'],
                     ['6', null, 'TEST_HISTORY_ID_V1'],
                     ['7', null, 'TEST_HISTORY_ID_V1']
                  ],
                  s: [
                     { n: 'ObjectId', t: 'Строка' },
                     { n: 'ObjectData', t: 'Строка' },
                     { n: 'HistoryId', t: 'Строка' }
                  ]
               };
               hSource._history.recent = createRecordSet(recentFilteredData);
               hSource._recentCount = 8;
               actualResult = historyMod.Source._private.getFilterHistory(hSource, hSource._history);
               assert.deepEqual(expectedResult, actualResult);

               // 6 pinned
               expectedResult = {
                  pinned: ['8', '1', '2', '5', '9', '10'],
                  frequent: ['6'],
                  recent: ['3', '4', '7']
               };
               let pinnedFilteredData = {
                  _type: 'recordset',
                  d: [
                     ['8', null, 'TEST_HISTORY_ID_V1'],
                     ['1', null, 'TEST_HISTORY_ID_V1'],
                     ['2', null, 'TEST_HISTORY_ID_V1'],
                     ['5', null, 'TEST_HISTORY_ID_V1'],
                     ['9', null, 'TEST_HISTORY_ID_V1'],
                     ['10', null, 'TEST_HISTORY_ID_V1']
                  ],
                  s: [
                     { n: 'ObjectId', t: 'Строка' },
                     { n: 'ObjectData', t: 'Строка' },
                     { n: 'HistoryId', t: 'Строка' }
                  ]
               };
               hSource._history.pinned = createRecordSet(pinnedFilteredData);
               hSource._recentCount = 3;
               actualResult = historyMod.Source._private.getFilterHistory(hSource, hSource._history);
               assert.deepEqual(expectedResult, actualResult);

               // 8 pinned
               expectedResult = {
                  pinned: ['8', '1', '2', '3', '4', '5', '9', '10'],
                  frequent: [],
                  recent: ['6', '7']
               };
               pinnedFilteredData = {
                  _type: 'recordset',
                  d: [
                     ['8', null, 'TEST_HISTORY_ID_V1'],
                     ['1', null, 'TEST_HISTORY_ID_V1'],
                     ['2', null, 'TEST_HISTORY_ID_V1'],
                     ['3', null, 'TEST_HISTORY_ID_V1'],
                     ['4', null, 'TEST_HISTORY_ID_V1'],
                     ['5', null, 'TEST_HISTORY_ID_V1'],
                     ['9', null, 'TEST_HISTORY_ID_V1'],
                     ['10', null, 'TEST_HISTORY_ID_V1']
                  ],
                  s: [
                     { n: 'ObjectId', t: 'Строка' },
                     { n: 'ObjectData', t: 'Строка' },
                     { n: 'HistoryId', t: 'Строка' }
                  ]
               };
               hSource._history.pinned = createRecordSet(pinnedFilteredData);
               hSource._recentCount = 2;
               actualResult = historyMod.Source._private.getFilterHistory(hSource, hSource._history);
               assert.deepEqual(expectedResult, actualResult);
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
               assert.deepEqual(hSource.getOptions(), { debug: false });
            });
         });
      });
   }
);
