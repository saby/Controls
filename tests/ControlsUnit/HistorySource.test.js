define(
   [
      'Controls/history', // for otladka
      'Types/collection',
      'Types/entity',
      'Core/Deferred',
      'Types/source',
      'Types/util',
      'Core/core-clone',
      'Application/Env'
   ],
   (historyMod, collection, entity, Deferred, sourceLib, util, clone, Env) => {
      describe('History Source', () => {
         let stores;
         const originalGetStore = Env.getStore;
         const originalSetStore = Env.setStore;
         beforeEach(() => {
            Env.getStore = (key) => {
               return stores[key];
            };
            Env.setStore = (key, value) => {
               stores[key] = value;
            };
            stores = {};
         });

         afterEach(() => {
            Env.getStore = originalGetStore;
            Env.setStore = originalSetStore;
         });
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
               hS = hSource._getSourceByMeta(meta, hSource._$historySource, hSource._$originSource);
               assert.equal(hS._$historyId, config.historySource._$historyId);
            });
            it('$_favorite', function() {
               meta = {
                  '$_favorite': true
               };
               hS = hSource._getSourceByMeta(meta, hSource._$historySource, hSource._$originSource);
               assert.equal(hS._$historyId, config.historySource._$historyId);
            });
            it('$_history', function() {
               meta = {
                  '$_history': true
               };
               hS = hSource._getSourceByMeta(meta, hSource._$historySource, hSource._$originSource);
               assert.equal(hS._$historyId, config.historySource._$historyId);
            });
            it('originalSource', function() {
               meta = {};
               hS = hSource._getSourceByMeta(meta, hSource._$historySource, hSource._$originSource);
               assert.equal(!!hS._$historyId, false);
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
               let originHSource = hSource._$historySource;
               let originSource = hSource._$originSource;
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
                     assert.equal(hSource._$history.pinned.getCount(), 1);

                     hSource._$historySource = errorSource;
                     historyDef = hSource.query(query);

                     historyDef.addCallback(function(data) {
                        let records = data.getAll();
                        assert.isFalse(records.at(0).has('pinned'));
                        hSource._$historySource = originHSource;

                        hSource._$originSource = errorSource;
                        historyDef = hSource.query(query);

                        historyDef.addErrback(function(error) {
                           assert.isTrue(error instanceof Error);
                           hSource._$originSource = originSource;
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
               hSource._$history.pinned.add(newHistoryItem);
               hSource._$historyItems = null;
               historyItems = hSource.getItems();
               assert.equal(historyItems.at(0).get('title'), 'Запись 5');
               assert.equal(historyItems.at(1).get('title'), 'Запись 7');
               assert.equal(historyItems.at(3).get('title'), 'Запись 6');
               assert.equal(historyItems.at(8).get('copyOriginalId'), '7_history');
               assert.equal(historyItems.at(8).getId(), '7');
               assert.equal(historyItems.getFormat().getCount(), 10);
               hSource._$history.pinned.removeAt(1);
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
               hSource._$oldItems = new collection.RecordSet({
                  rawData: oldItems,
                  keyProperty: 'id'
               });
               hSource._initHistory(newData, hSource._$oldItems);
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
               hSource._$historyItems = null;
               historyItems = hSource.getItems();
               assert.equal(historyItems.at(1).get('title'), 'Запись 4');
               assert.equal(historyItems.at(2).get('title'), 'Запись 6');
            });
            it('updatePinned', async function() {
               let sandbox = sinon.createSandbox();
               sandbox.stub(hSource, '_getSourceByMeta').returns({
                  update: () => Promise.resolve()
               });
               let meta = {
                  $_pinned: true
               };
               await hSource.update(myItem, meta);
               historyItems = hSource.getItems();
               pinItem = historyItems.at(1);
               assert.equal(pinItem.get('pinned'), true);
               assert.equal(hSource._$history.pinned.at(1).get('ObjectId'), 7);
               assert.equal(hSource._$history.pinned.at(1).get('HistoryId'), 7);
               meta = {
                  $_pinned: false
               };
               await hSource.update(myItem, meta);
               historyItems = hSource.getItems();
               assert.equal(historyItems.at('1').get('pinned'), false);


               sandbox.stub(hSource, '_checkPinnedAmount').returns(false);
               let stub = sandbox.stub(hSource, '_showNotification');

               hSource.update(myItem, meta);
               sinon.assert.calledOnce(stub);

               sandbox.restore();
            });
            it('checkPinnedAmount', function() {
               let list = new collection.RecordSet();

               for (var i = 0; i < historyMod.Constants.MAX_HISTORY; i++) {
                  list.add(new entity.Model());
               }

               assert.isFalse(hSource._checkPinnedAmount(list));

               list.remove(list.at(9));
               assert.isTrue(hSource._checkPinnedAmount(list));
            });
            it('getRawHistoryItem', function() {
               let historyItem = hSource._getRawHistoryItem('123', 'history_id');
               assert.strictEqual(historyItem.getId(), '123');

               historyItem = hSource._getRawHistoryItem(123, 'history_id');
               assert.strictEqual(historyItem.getId(), '123');
            });

            it('getKeyProperty', function() {
               let initSource = new sourceLib.Memory({
                  keyProperty: 'key',
                  data: []
               });
               let self = {
                  _$originSource: initSource
               };
               assert.equal(hSource._getKeyProperty.call(self), 'key');

               self._$originSource = new sourceLib.PrefetchProxy({
                  target: initSource,
                  data: {
                     query: {}
                  }
               });
               assert.equal(hSource._getKeyProperty.call(self), 'key');
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
               assert.equal(hSource._$history.recent.at(0).getId(), '7');

               hSource.update([myItem], meta);
               historyItems = hSource.getItems();
               assert.equal(historyItems.at(3).get('title'), 'Запись 7');
               assert.equal(hSource._$history.recent.at(0).getId(), '7');
               
               let newRecentItem = new entity.Model({
                  rawData: {
                     id: '8'
                  },
                  keyProperty: 'id',
               });
               hSource.update([newRecentItem], meta);
               historyItems = hSource.getItems();
               assert.equal(historyItems.at(3).get('title'), 'Запись 8');

               let pinnedItem = new entity.Model({
                  rawData: {
                     id: '5'
                  },
                  keyProperty: 'id',
               });
               hSource.update([pinnedItem], meta);
               assert.isNotNull(hSource._$historyItems);

               let item = new entity.Model({
                  rawData: {
                     id: 'notInOriginalRecordSet'
                  },
                  keyProperty: 'id',
               });
               hSource.update([item], meta);
               assert.isNull(hSource._$historyItems);
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
            it('prepareItems', (done) => {
               let historySource = new historyMod.Source(config);
               let query = new sourceLib.Query().where({
                  $_history: true
               });
               historySource.query(query).addCallback(() => {
                  let currentItems = historySource.getItems();
                  let newItems = historySource.prepareItems(new collection.RecordSet({
                      rawData: items,
                      keyProperty: 'id'
                  }));
                  assert.notEqual(currentItems, newItems);
                  done();
               });
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
                  let preparedHistory = hSource._prepareHistoryItems.apply({_$originSource: hSource._$originSource}, [newData.getRow().get('frequent'), sourceItems]);
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
                  const oldPinned = hSource._$pinned;
                  const oldHSource = hSource._$historySource;
                  hSource._$pinned = ['1', '2'];
                  hSource._$historySource = {
                     getHistoryId: () => {
                        'TEST_ID';
                     }
                  };
                  let sourceItems = res.getAll();
                  hSource._initHistory(newData, sourceItems);
                  assert.equal(hSource._$history.pinned.getCount(), 3);
                  assert.equal(hSource._$recentCount, 1);
                  hSource._$history.pinned.forEach(function(pinnedItem) {
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
                  hSource._initHistory(newData, sourceItems);
                  assert.equal(hSource._$history.pinned.getCount(), 3);
                  hSource._$pinned = oldPinned;
                  hSource._$historySource = oldHSource;
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
                  let oldPinned = hSource._$pinned;
                  let oldOSource = hSource._$originSource;
                  let oldHSource = hSource._$historySource;
                  let sourceItems = res.getAll();
                  hSource._initHistory(newData, sourceItems);
                  assert.equal(hSource._$history.pinned.getCount(), 1);
                  hSource._$history.pinned.forEach(function(pinnedItem) {
                     assert.isFalse(pinnedItem.getId() == '1');
                     assert.isFalse(pinnedItem.getId() == '9');
                  });
                  hSource._$pinned = oldPinned;
                  hSource._$originSource = oldOSource;
                  hSource._$historySource = oldHSource;
                  done();
               });
            });

            it('_private:getPinnedIds', function() {
               let pinnedIds = hSource._getPinnedIds(hSource._$history.pinned);
               assert.deepEqual(pinnedIds, ['5']);
            });

            it('_private:getFrequentIds', function() {
               let frequentIds = hSource._getFrequentIds(hSource._$history.frequent, ['5']);
               assert.deepEqual(frequentIds, ['6', '4']);
            });

            it('_private:getRecentIds', function() {
               let recentIds = hSource._getRecentIds(hSource._$history.recent, ['5'], ['6', '4']);
               assert.deepEqual(recentIds, ['8']);
            });

            it('_private:getFilterHistory', function() {
               let expectedResult = {
                  pinned: ['5'],
                  frequent: ['6', '4'],
                  recent: ['8']
               };
               let actualResult = hSource._getFilterHistory(hSource._$history);
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
               hSource._$history.recent = createRecordSet(recentFilteredData);
               hSource._$recentCount = 8;
               actualResult = hSource._getFilterHistory(hSource._$history);
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
               hSource._$history.pinned = createRecordSet(pinnedFilteredData);
               hSource._$recentCount = 3;
               actualResult = hSource._getFilterHistory(hSource._$history);
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
               hSource._$history.pinned = createRecordSet(pinnedFilteredData);
               hSource._$recentCount = 2;
               actualResult = hSource._getFilterHistory(hSource._$history);
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

            it('serialization', function() {
               const someConfig = {
                  source: hSource
               };
               const configClone = util.object.clone(someConfig);
               assert.isOk(configClone.source instanceof historyMod.Source);
            });

            it('unpin if not exist', () => {
               let source = new historyMod.Source({
                  originSource: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: items
                  }),
                  historySource: new historyMod.Service({
                     historyId: 'TEST_HISTORY_ID'
                  }),
                  parentProperty: 'parent'
               });
               let itemUnpinned = false;
               const history = {
                  pinned: [1]
               };
               const oldItems = new collection.RecordSet({
                  rawData: [],
                  keyProperty: 'id'
               });
               const newItems = oldItems.clone();
               source._itemNotExist = () => {
                  itemUnpinned = true;
               };
               source._fillItems(history, 'pinned', oldItems, newItems);
               assert.isTrue(itemUnpinned);


               itemUnpinned = false;
               source = new historyMod.Source({
                  unpinIfNotExist: false,
                  originSource: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: items
                  }),
                  historySource: new historyMod.Service({
                     historyId: 'TEST_HISTORY_ID'
                  }),
                  parentProperty: 'parent'
               });
               source._itemNotExist = () => {
                  itemUnpinned = true;
               };
               source._fillItems(history, 'pinned', oldItems, newItems);
               assert.isFalse(itemUnpinned);
            });
         });
      });
   }
);
