define(
   [
      'Controls/history',
      'Types/collection',
      'Types/entity',
      'Types/source'
   ],
   (historyMod, collection, entity, sourceLib) => {
      describe('history:FilterSource', () => {
         let items = [
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

         let pinnedData = {
            _type: 'recordset',
            d: [
               ['8', null, 'TEST_HISTORY_ID_V1']
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
               ['1', null, 'TEST_HISTORY_ID_V1'],
               ['2', null, 'TEST_HISTORY_ID_V1'],
               ['3', null, 'TEST_HISTORY_ID_V1'],
               ['4', null, 'TEST_HISTORY_ID_V1'],
               ['5', null, 'TEST_HISTORY_ID_V1'],
               ['6', null, 'TEST_HISTORY_ID_V1'],
               ['7', null, 'TEST_HISTORY_ID_V1'],
               ['8', null, 'TEST_HISTORY_ID_V1'],
               ['9', null, 'TEST_HISTORY_ID_V1'],
               ['10', null, 'TEST_HISTORY_ID_V1']
            ],
            s: [
               { n: 'ObjectId', t: 'Строка' },
               { n: 'ObjectData', t: 'Строка' },
               { n: 'HistoryId', t: 'Строка' }
            ]
         };

         let getItem = (id, objectData, hId) => {
            return new entity.Model({
               rawData: {
                  d: [id, objectData, hId],
                  s: [{
                     n: 'ObjectId',
                     t: 'Строка'
                  },
                     {
                        n: 'ObjectData',
                        t: 'Строка'
                     },
                     {
                        n: 'HistoryId',
                        t: 'Строка'
                     }
                  ]
               },
               adapter: new entity.adapter.Sbis()
            });
         };

         function createRecordSet(data) {
            return new collection.RecordSet({
               rawData: data,
               keyProperty: 'ObjectId',
               adapter: new entity.adapter.Sbis()
            });
         }

         let historyInstance = {
            recent: createRecordSet(recentData),
            pinned: createRecordSet(pinnedData)
         };

         it('fillRecent', () => {
            let itemsRecent = new collection.RecordSet({
               adapter: new entity.adapter.Sbis(),
               keyProperty: 'ObjectId'
            });

            let self = {
               historySource: {
                  _recent: 11
               }
            };
            historyMod.FilterSource._private.fillRecent(self, historyInstance, itemsRecent);

            assert.equal(itemsRecent.getCount(), 9);

            itemsRecent.clear();
            historyInstance.recent.add(getItem('11', null, 'TEST_HISTORY_ID_V1'));
            historyMod.FilterSource._private.fillRecent(self, historyInstance, itemsRecent);
            assert.equal(itemsRecent.getCount(), 9);

            itemsRecent.clear();
            historyInstance.pinned.clear();
            historyMod.FilterSource._private.fillRecent(self, historyInstance, itemsRecent);
            assert.equal(itemsRecent.getCount(), 10);

            itemsRecent.clear();
            historyInstance.recent.removeAt(10);
            historyMod.FilterSource._private.fillRecent(self, historyInstance, itemsRecent);
            assert.equal(itemsRecent.getCount(), 10);

            itemsRecent.clear();
            historyInstance.recent.removeAt(9);
            historyInstance.recent.add(getItem('11', '{}', 'TEST_HISTORY_ID_V1'));
            historyInstance.recent.add(getItem('11', null, 'TEST_HISTORY_ID_V1'));
            historyMod.FilterSource._private.fillRecent(self, historyInstance, itemsRecent);
            assert.equal(itemsRecent.getCount(), 10);

            itemsRecent.clear();
            self.historySource._recent = 5;
            historyMod.FilterSource._private.fillRecent(self, historyInstance, itemsRecent);
            assert.equal(itemsRecent.getCount(), 4);

            itemsRecent.clear();
            historyInstance.pinned.add(getItem('12', '{title: 123}', 'TEST_HISTORY_ID_V1'));
            historyMod.FilterSource._private.fillRecent(self, historyInstance, itemsRecent);
            assert.equal(itemsRecent.getCount(), 3);

            itemsRecent.clear();
            self.historySource._pinned = false;
            historyMod.FilterSource._private.fillRecent(self, historyInstance, itemsRecent);
            assert.equal(itemsRecent.getCount(), 4);
         });

         it('serialize', function() {
            let instValue = new entity.Date();
            let data = {id: '1', value: instValue, resetValue: null};
            JSON.stringify({value: instValue}, historyMod.FilterSource._private.getSerialize().serialize);

            let serializeData = JSON.stringify(data, historyMod.FilterSource._private.getSerialize().serialize);
            let result = JSON.parse(serializeData, historyMod.FilterSource._private.getSerialize().deserialize);
            assert.deepStrictEqual(data, result);
         });

         it('findItem', function() {
            let newItem = {
               configs: undefined,
               items: [1,2,3]
            };
            let historyItems = new  collection.RecordSet({
               rawData: [
                  { ObjectData: JSON.stringify('test') }
               ]
            });
            let result = historyMod.FilterSource._private.findItem({}, historyItems, newItem);
            assert.isNull(result);

            historyItems.add(new entity.Model({
               rawData: {ObjectData: JSON.stringify(newItem, historyMod.FilterSource._private.getSerialize().serialize)}
            }));
            result = historyMod.FilterSource._private.findItem({}, historyItems, newItem);
            assert.isOk(result);

            newItem.items.push(new entity.Date(2019, 5, 1));
            historyItems.add(new entity.Model({
               rawData: {ObjectData: JSON.stringify(newItem, historyMod.FilterSource._private.getSerialize().serialize)}
            }));
            result = historyMod.FilterSource._private.findItem({}, historyItems, newItem);
            assert.isOk(result);
         });

         it('query', function() {
            const query = new sourceLib.Query();
            const sandbox = sinon.createSandbox();
            const filterSource = new historyMod.FilterSource({ historySource: {} });

            query.where({
               '$_history': true
            });

            sandbox.replace(filterSource, 'historySource', {
               query: () => Promise.reject()
            });

            const query1 = filterSource.query(query);
            const query2 = filterSource.query(query);

            assert.isTrue(query1 === query2);
         });

         it('_private::destroy', () => {
            const self = {
               _history: {
                  recent: createRecordSet(recentData)
               }
            };

            assert.equal(self._history.recent.getCount(), 11);

            historyMod.FilterSource._private.destroy(self, '1');
            assert.equal(self._history.recent.getCount(), 10);

            historyMod.FilterSource._private.destroy(self, ['2']);
            assert.equal(self._history.recent.getCount(), 9);

            historyMod.FilterSource._private.destroy(self, 'noDataWithThisKey');
            assert.equal(self._history.recent.getCount(), 9);
         });
      });
   }
);
