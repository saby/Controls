define(['Controls/_filter/Controller', 'Core/Deferred', 'Types/entity', 'Controls/_filter/HistoryUtils', 'Env/Env', 'Types/collection'], function(Filter, Deferred, entity, HistoryUtils, Env, collection) {

   describe('Controls.Filter.Controller', function () {

      it('_beforeMount', function() {
         var filterLayout = new Filter();
         var items = [{
            id: 'testKey',
            value: 'testValue',
            textValue: 'testText',
            resetValue: ''
         }, {
            id: 'testKey2',
            value: 'testValue',
            textValue: 'testText2',
            resetValue: ''
         }];
         var fastItems = [{
            id: 'testKey',
            value: 'testValue',
            textValue: 'test',
            resetValue: ''
         }];
         var historyUpdated = false;
         var sandbox = sinon.createSandbox();
         filterLayout._beforeMount({ filterButtonSource: items, fastFilterSource: fastItems });
         assert.deepEqual(filterLayout._filterButtonItems[0].textValue, 'testText');
         assert.deepEqual(filterLayout._filterButtonItems[1].textValue, 'testText2');

         return new Promise(function(resolve) {
            sandbox.replace(Filter._private, 'processHistoryOnItemsChanged', () => {
               historyUpdated = true;
            });
            filterLayout._beforeMount({ filterButtonSource: items, fastFilterSource: fastItems, historyId: 'TEST_HISTORY_ID', historyItems: []}).addCallback(function(items) {
               assert.deepEqual(items, []);
               assert.isFalse(historyUpdated);

               filterLayout._beforeMount({ filterButtonSource: items, fastFilterSource: fastItems, historyId: 'TEST_HISTORY_ID', historyItems: [], prefetchParams: {}}).addCallback((res) => {
                  assert.isFalse(historyUpdated);

                  filterLayout._beforeMount({ filterButtonSource: items, fastFilterSource: fastItems, historyId: 'TEST_HISTORY_ID', historyItems: ['testHistoryItem'], prefetchParams: {}}).addCallback(() => {
                     assert.isTrue(historyUpdated);
                     sandbox.restore();
                     resolve();
                  });
                  return res;
               });
               return items;
            });
         });
      });

      it('_beforeMount::receivedState', function() {
         var filterLayout = new Filter();
         var items = [{
            id: 'testKey',
            value: 'testValue',
            textValue: 'testText',
            resetValue: ''
         }, {
            id: 'testKey2',
            value: 'testValue',
            textValue: 'testText2',
            resetValue: ''
         }];
         var receivedItems = [{
            id: 'testKey',
            value: 'historyValue',
            textValue: 'historyText'
         }, {
            id: 'testKey2',
            value: 'testValue',
            textValue: 'testText2'
         }];
         var fastItems = [];
         filterLayout._beforeMount({ filterButtonSource: items, fastFilterSource: fastItems }, {}, receivedItems);
         assert.deepEqual(filterLayout._filterButtonItems[0].textValue, 'historyText');
         assert.deepEqual(filterLayout._filterButtonItems[1].textValue, 'testText2');
         assert.deepEqual(filterLayout._filter, {testKey: 'historyValue', testKey2: 'testValue'});

         filterLayout._beforeMount({ filterButtonSource: items, fastFilterSource: fastItems, prefetchParams: {}, historyItems: [] }, {}, receivedItems);
         assert.isTrue(filterLayout._isFilterChanged);
      });

      it('_beforeUpdate new items', function () {
         var filterLayout = new Filter();
         filterLayout.saveOptions({filterButtonSource: []});
         var items = [{
            id: 'testKey',
            value: 'testValue',
            resetValue: ''
         }];
         filterLayout._beforeUpdate({ filterButtonSource: items });
         assert.deepEqual(filterLayout._filterButtonItems, items);
         assert.deepEqual(filterLayout._filter, {testKey: 'testValue'});
      });

      it('_beforeUpdate new filterButtonItems and fastFilterItems', function () {
         let filterLayout = new Filter();
         filterLayout.saveOptions({filterButtonSource: []});
         let buttonItems = [{
            id: 'testKey',
            value: 'testValue',
            textValue: 'testText',
            resetValue: ''
         }, {
            id: 'testKey2',
            value: 'testValue',
            textValue: 'testText2',
            resetValue: ''
         }];
         let fastItems = [{
            id: 'testKey',
            value: 'testValue',
            textValue: 'test',
            resetValue: ''
         }];
         let expectedButtonItems = [{
            id: 'testKey',
            value: 'testValue',
            isFast: true,
            textValue: 'testText',
            resetValue: ''
         }, {
            id: 'testKey2',
            value: 'testValue',
            textValue: 'testText2',
            resetValue: ''
         }];

         let expectedFastItems = [{
            id: 'testKey',
            value: 'testValue',
            textValue: 'test',
            resetValue: ''
         }];
         filterLayout._beforeUpdate({ filterButtonSource: buttonItems, fastFilterSource: fastItems });
         assert.deepEqual(filterLayout._filterButtonItems, expectedButtonItems);
         assert.deepEqual(filterLayout._fastFilterItems, expectedFastItems);
         assert.deepEqual(filterLayout._filter, {testKey: 'testValue', testKey2: 'testValue'});

         fastItems = [];
         filterLayout.saveOptions({filterButtonSource: buttonItems, fastFilterSource: fastItems});
         let newButtonItems = [{
            id: 'testKey',
            value: 'testValue3',
            textValue: 'testText',
            resetValue: ''
         }, {
            id: 'testKey2',
            value: '',
            textValue: '',
            resetValue: ''
         }];
         expectedButtonItems = [{
            id: 'testKey',
            isFast: true,
            value: 'testValue3',
            textValue: 'testText',
            resetValue: ''
         }, {
            id: 'testKey2',
            value: '',
            textValue: '',
            resetValue: ''
         }];
         filterLayout._beforeUpdate({filterButtonSource: newButtonItems, fastFilterSource: fastItems});
         assert.deepEqual(filterLayout._filterButtonItems, expectedButtonItems);
         assert.deepEqual(filterLayout._fastFilterItems, expectedFastItems);
         assert.deepEqual(filterLayout._filter, {testKey: 'testValue', testKey2: ''});

         filterLayout.saveOptions({filterButtonSource: buttonItems, fastFilterSource: fastItems});
         let newFastItems = [{
            id: 'testKey',
            value: 'testValueFast',
            textValue: '',
            resetValue: ''
         }];
         expectedFastItems = [{
            id: 'testKey',
            value: 'testValueFast',
            textValue: '',
            resetValue: ''
         }];
         filterLayout._beforeUpdate({filterButtonSource: buttonItems, fastFilterSource: newFastItems});
         assert.deepEqual(filterLayout._filterButtonItems, expectedButtonItems);
         assert.deepEqual(filterLayout._fastFilterItems, expectedFastItems);
         assert.deepEqual(filterLayout._filter, {testKey: 'testValueFast', testKey2: ''});
      });

      it('_beforeUpdate new historyId', function () {
         var filterLayout = new Filter();
         filterLayout.saveOptions({historyId: 'HISTORY_ID'});
         filterLayout._crudWrapper = 'history_loader';
         filterLayout._beforeUpdate({ historyId: 'UPDATED_HISTORY_ID' });
         assert.isNull(filterLayout._crudWrapper);
      });

      it('_itemsChanged', function () {
         var filterLayout = new Filter();
         var items = [{
            id: 'testKey',
            value: 'testValue',
            resetValue: ''
         }];
         var filterChangedNotifyed = false;
         filterLayout._notify = function() {
            filterChangedNotifyed = true;
         };
         filterLayout._options.filter = {testKey2: 'testValue2'};
         filterLayout._filter = {testKey: 'testValue2'};
         filterLayout._itemsChanged(null, items);
         assert.deepEqual(filterLayout._filter, {testKey: 'testValue'});
         assert.isTrue(filterChangedNotifyed);
         assert.isTrue(!filterLayout._changedFilterItems);

         var sandbox = sinon.createSandbox();
         var history = {
            data: {
               items: []
            }
         };
         var itemFromHistoryDeleted = false;
         filterLayout._filter = {testKey: 'testValue2', PrefetchSessionId: 'test'};
         filterLayout._options.prefetchParams = {};
         filterLayout._options.historyId = 'test';
         sandbox.replace(Filter._private, 'getHistoryByItems', function() {
            return history;
         });
         sandbox.replace(Filter._private, 'deleteCurrentFilterFromHistory', function() {
            itemFromHistoryDeleted = true;
         });

         filterLayout._itemsChanged(null, items);
         assert.deepEqual(filterLayout._filter, {testKey: 'testValue'});

         history = {
            data: {
               items: [],
               prefetchParams: {
                  PrefetchSessionId: 'test'
               }
            },
            item: new entity.Model({
               rawData: {
                  id: 'test'
               },
               keyProperty: 'id'
            })
         };

         filterLayout._itemsChanged(null, items);
         assert.deepEqual(filterLayout._filter, {testKey: 'testValue'});
         assert.isTrue(itemFromHistoryDeleted);
         sandbox.restore();
      });

      it('_private.getItemsByOption::array', function () {
         var opt = [{
            id: 'testId',
            value: '',
            resetValue: ''
         }];

         var items = Filter._private.getItemsByOption(opt);

         assert.deepEqual(items, opt);
         assert.isFalse(items === opt);
      });

      it('_private.processPrefetchOnItemsChanged', () => {
         const sandbox = sinon.createSandbox();
         const self = {};
         let historyItemDestroyed = false;
         let historyItems = null;
         let appliedItems;

         self._filter = {
            PrefetchSessionId: 'testId',
            testFilterFilter: 'testValue'
         };
         sandbox.replace(Filter._private, 'getHistoryByItems', function(filterInst, historyId, hItems) {
            appliedItems = hItems;
            return historyItems;
         });

         assert.deepEqual(Filter._private.processPrefetchOnItemsChanged(self, {}), { testFilterFilter: 'testValue' });

         historyItems = {
            data: {
               items: [],
               prefetchParams: {
                  PrefetchSessionId: 'testId'
               }
            },
            item: {
               getId: () => 'test'
            },
            index: 1
         };

         sandbox.replace(HistoryUtils, 'getHistorySource', function() {
            return {
               destroy: () => {
                  historyItemDestroyed = true;
               }
            };
         });

         assert.deepEqual(Filter._private.processPrefetchOnItemsChanged(self, {}), {
            PrefetchSessionId: 'testId',
            testFilterFilter: 'testValue'
         });
         assert.isTrue(historyItemDestroyed);


         self._filter = {
            PrefetchSessionId: 'testId',
            testFilterFilter: 'testValue'
         };
         historyItemDestroyed = false;
         assert.deepEqual(Filter._private.processPrefetchOnItemsChanged(self, {}, historyItems), {
            PrefetchSessionId: 'testId',
            testFilterFilter: 'testValue'
         });
         assert.isFalse(historyItemDestroyed);
         assert.deepEqual(historyItems, appliedItems);

         sandbox.restore();
      });

      it('_private.getItemsByOption::function', function () {
         var opt = [{
            id: 'testId',
            value: '',
            resetValue: ''
         }];

         var returnOptFunc = function() {
            return [{
               id: 'testId',
               value: '',
               resetValue: ''
            }];
         };

         var items = Filter._private.getItemsByOption(returnOptFunc);
         assert.deepEqual(items, opt);
      });

      it('_private.getItemsByOption::array with history', function () {
         var opt = [{
            id: 'testId',
            value: '',
            resetValue: ''
         }];
         var history = [{
            id: 'testId',
            value: 'testValue',
            resetValue: ''
         }];
         var items = Filter._private.getItemsByOption(opt, history);
         assert.deepEqual(items, history);
         assert.isFalse(items === opt);
      });

      it('_private.getItemsByOption::function with history', function () {
         var returnOptFunc = function(history) {
            return [{
               id: 'testId',
               value: history[0].value,
               resetValue: ''
            }];
         };
         var history = [{
            id: 'testId',
            value: 'testValue',
            resetValue: ''
         }];
         var items = Filter._private.getItemsByOption(returnOptFunc, history);
         assert.deepEqual(items, history);
      });

      it('_private.getFilterByItems(filterButtonItems)', function () {
         var fbItems = [{
            id: 'testId',
            value: '',
            resetValue: ''
         }, {
            id: 'testId2',
            value: 'testValue',
            resetValue: ''
         }, {
            id: 'testId3',
            value: '',
            resetValue: '',
            visibility: false
         }, {
            id: 'testId4',
            value: 'testValue',
            resetValue: ''
         }];

         var filter = Filter._private.getFilterByItems(fbItems);
         assert.deepEqual(filter, {testId: '', testId2: 'testValue', testId4: 'testValue'});
      });

      it('_private.getFilterByItems(fastFilterItems)', function () {
         var fastFilterItems = [{
            id: 'testId',
            value: undefined,
            resetValue: ''
         }, {
            id: 'testId2',
            value: 'testValue',
            resetValue: ''
         }];
         var filter = Filter._private.getFilterByItems(null, fastFilterItems);
         assert.deepEqual(filter, {testId2: 'testValue'});
      });

      it('_private.getFilterByItems(filterButtonItems, fastFilterItems)', function () {
         var fastFilterItems = [{
            id: 'testId',
            value: undefined,
            resetValue: ''
         }, {
            id: 'testId2',
            value: 'testValue',
            resetValue: ''
         }];

         var fbItems = [{
            id: 'testId2',
            value: '',
            resetValue: ''
         }, {
            id: 'testId3',
            value: 'testValue',
            resetValue: ''
         }];

         var filter = Filter._private.getFilterByItems(fbItems, fastFilterItems);
         assert.deepEqual(filter, {testId2: 'testValue', testId3: 'testValue'});
      });

      it('_filterChanged', function() {
         let filterLayout = new Filter();
         let filterChangedNotifyed = false;
         let resultFilter = {test: 'test'};
         let propagationStopped = false;

         filterLayout._notify = () => {
            filterChangedNotifyed = true;
         };

         filterLayout._filterChanged({stopPropagation: () => {propagationStopped = true}}, {...resultFilter});

         assert.deepEqual(filterLayout._filter, resultFilter);
         assert.isTrue(filterChangedNotifyed);
         assert.isTrue(propagationStopped);
      });

      it('_private.updateFilterItems', function() {
         var self = {};

         var fastFilterItems = [{
            id: 'testId',
            value: '',
            resetValue: ''
         }, {
            id: 'testId2',
            value: 'testValue',
            resetValue: ''
         }];

         var fbItems = [{
            id: 'testId2',
            value: '',
            resetValue: ''
         }, {
            id: 'testId3',
            value: 'testValue',
            resetValue: ''
         }];

         var newItems = [{
            id: 'testId2',
            value: '123',
            resetValue: ''
         }];

         self._filterButtonItems = fbItems;
         self._fastFilterItems = fastFilterItems;
         Filter._private.updateFilterItems(self, newItems);

         assert.isTrue(self._filterButtonItems !== fbItems, 'FilterButton items must be changed');
         assert.isTrue(self._fastFilterItems !== fastFilterItems, 'FastFilter items items must be changed');
         assert.equal(self._fastFilterItems[1].value, '123');
         assert.equal(self._filterButtonItems[0].value, '123');
      });

      it('minimize filter items', function() {
         var items = [{
            id: 'testId',
            value: '',
            textValue: '',
            source: [],
            resetValue: ''
         }, {
            id: 'testId2',
            value: 'testValue',
            textValue: '',
            resetValue: '',
            keys: ['1', '2', '3'],
            visibility: false
         }, {
            id: 'testId3',
            value: 'testValue2',
            textValue: 'textTextValue',
            resetValue: ''
         }, {
            id: 'testId4',
            value: 'testValue4',
            textValue: 'textTextValue',
            resetValue: '',
            visibility: true
         }, {
            id: 'testId5',
            value: 'testValue5',
            textValue: null,
            resetValue: 'resetValue',
            visibility: true
         }];
         var minItems = Filter._private.minimizeFilterItems(items);
         assert.deepEqual(minItems, [{
            id: 'testId',
            value: '',
            textValue: '',
         }, {
            id: 'testId2',
            value: 'testValue',
            visibility: false
         }, {
            id: 'testId3',
            value: 'testValue2',
            textValue: 'textTextValue',
         }, {
            id: 'testId4',
            value: 'testValue4',
            textValue: 'textTextValue',
            visibility: true
         }, {
            id: 'testId5',
            visibility: false
         }]);
      });

      it('setFilterButtonItems', function() {
         var fastFilterItems = [{
            id: 'testId',
            value: '',
            resetValue: ''
         }, {
            id: 'testId2',
            value: 'testValue',
            textValue: 'test2',
            resetValue: ''
         }];

         var fbItems = [{
            id: 'testId2',
            value: '',
            textValue: 'test2',
            resetValue: ''
         }, {
            id: 'testId3',
            value: 'testValue',
            resetValue: ''
         }];
         Filter._private.setFilterButtonItems(fbItems, fastFilterItems);
         assert.deepEqual(fbItems, [{
            id: 'testId2',
            value: '',
            textValue: 'test2',
            resetValue: '',
            isFast: true
         }, {
            id: 'testId3',
            value: 'testValue',
            resetValue: ''
         }]);
      });

      it('prepareHistoryItems', function() {
         var fastFilterItems = [{
            id: 'testId',
            value: '',
            resetValue: ''
         }, {
            id: 'testId2',
            value: 'testValue',
            textValue: 'test2',
            resetValue: ''
         }];

         var fbItems = [{
            id: 'testId2',
            value: '',
            textValue: '',
            resetValue: ''
         }, {
            id: 'testId3',
            value: 'testValue',
            resetValue: ''
         }, {
            id: 'testId4',
            value: 'testValue',
            resetValue: '',
            textValue: 'textValue4'
         }];
         var historyItems = Filter._private.prepareHistoryItems(fbItems);
         assert.deepEqual(historyItems, [{
            id: 'testId2',
            value: '',
            textValue: ''
         }, {
            id: 'testId3'
         }, {
            id: 'testId4',
            value: 'testValue',
            textValue: 'textValue4'
         }]);
         historyItems = Filter._private.prepareHistoryItems(fbItems, fastFilterItems);
         assert.deepEqual(historyItems, [{
            id: 'testId2',
            value: '',
            textValue: ''
         }, {
            id: 'testId3'
         }, {
            id: 'testId4',
            value: 'testValue',
            textValue: 'textValue4'
         }]);

         var saveToHistoryItems = [{
            id: 'testId2',
            value: '',
            resetValue: '',
            doNotSaveToHistory: true
         }, {
            id: 'testId3',
            value: 'testValue3',
            resetValue: ''
         }, {
            id: 'testId4',
            value: 'testValue4',
            resetValue: ''
         }, {
            id: 'testId5',
            value: 'testValue4',
            resetValue: '',
            doNotSaveToHistory: true
         }];

         historyItems = Filter._private.prepareHistoryItems(saveToHistoryItems, fastFilterItems);
         assert.deepEqual(historyItems, [{ id: 'testId3' }, { id: 'testId4' }]);

      });

      it('_private.isFilterChanged', function() {
         var fastFilterItems = [{
            id: 'testId',
            value: '',
            resetValue: ''
         }, {
            id: 'testId2',
            value: 'testValue',
            textValue: 'test2',
            resetValue: ''
         }];

         var filterButtonItems = [{
            id: 'testId2',
            value: 'testValue',
            textValue: 'test2',
            resetValue: ''
         }, {
            id: 'testId3',
            value: 'testValue',
            resetValue: ''
         }, {
            id: 'testId4',
            value: '',
            resetValue: ''
         }];
         assert.isTrue(Filter._private.isFilterChanged(filterButtonItems, fastFilterItems));
         fastFilterItems = [{
            id: 'testId',
            value: '',
            resetValue: ''
         }, {
            id: 'testId2',
            value: 'testValue',
            resetValue: ''
         }];

         filterButtonItems = [{
            id: 'testId2',
            value: 'testValue',
            resetValue: ''
         }, {
            id: 'testId3',
            value: 'testValue',
            resetValue: ''
         }, {
            id: 'testId4',
            value: '',
            resetValue: ''
         }];
         assert.isFalse(Filter._private.isFilterChanged(filterButtonItems, fastFilterItems));

         fastFilterItems = [{
            id: 'testId',
            value: '',
            resetValue: ''
         }, {
            id: 'testId2',
            value: 'testValue',
            textValue: 'test2',
            resetValue: ''
         }];

         filterButtonItems = [{
            id: 'testId2',
            value: 'testValue',
            textValue: '',
            resetValue: ''
         }, {
            id: 'testId3',
            value: 'testValue',
            resetValue: ''
         }, {
            id: 'testId4',
            value: '',
            resetValue: ''
         }];
         assert.isTrue(Filter._private.isFilterChanged(filterButtonItems, fastFilterItems));
      });

      it('_private.getHistoryData', function() {
         var fastFilterItems = [{
            id: 'testId2',
            value: 'testValue',
            textValue: 'test2',
            resetValue: ''
         }];

         var filterButtonItems = [{
            id: 'testId2',
            value: 'testValue',
            textValue: 'test2',
            resetValue: ''
         }];
         assert.deepEqual(Filter._private.getHistoryData(filterButtonItems, fastFilterItems).items, [{
            id: 'testId2',
            value: 'testValue',
            textValue: 'test2',
         }]);
         let filterButtonItems2 = [{
            id: 'testId2',
            value: 'testValue',
            textValue: 'test2',
            resetValue: 'testValue'
         }];
         assert.deepEqual(Filter._private.getHistoryData(filterButtonItems2), {});
         filterButtonItems2 = [{
            id: 'testId2',
            value: 'testValue',
            textValue: 'test2',
            resetTextValue: 'test2'
         }];
         assert.deepEqual(Filter._private.getHistoryData(filterButtonItems2).items, [{
            id: 'testId2',
            value: 'testValue',
         }]);
      });

      it('_private.getHistoryItems', function() {
         const self = {};
         const sandbox = sinon.createSandbox();
         const historyItems = new collection.List({
            items: [
               new entity.Model({
                  rawData: {
                     ObjectData: null
                  }
               })
            ]
         });

         return new Promise(function(resolve) {
            Filter._private.getHistoryItems({}, 'TEST_HISTORY_ID').addCallback(function(history) {
               assert.deepEqual(history.length, 15);

               self._crudWrapper = { query: () => Deferred.fail() };
               Filter._private.getHistoryItems(self, 'TEST_HISTORY_ID').addCallback(function(hItems) {
                  assert.equal(hItems.length, 0);

                  sandbox.replace(HistoryUtils, 'getHistorySource', () => {
                     return {
                        getItems: () => historyItems,
                        getDataObject: () => null,
                        getPinned: () => new collection.List(),
                        getRecent: () => historyItems
                     };
                  });
                  self._crudWrapper = { query: () => Promise.resolve(new collection.RecordSet()) };

                  Filter._private.getHistoryItems(self, 'TEST_HISTORY_ID').addCallback(function(histItems) {
                     assert.equal(histItems.length, 0);
                     sandbox.restore();
                     resolve();
                  });
               });
            });
         });
      });

      it('_private.updateHistory', function(done) {
         if (Env.constants.isServerSide) { return done(); }
         const fastFilterItems = [];
         const filterButtonItems = [];
         let self = {};
         let historySaveEventFired = false;
         self._notify = function(eventName) {
            if (eventName === 'historySave') {
               historySaveEventFired = true;
            }
         };
         Filter._private.addToHistory(self, filterButtonItems, fastFilterItems, 'TEST_HISTORY_ID_2');
         assert.isOk(self._sourceController);
         Filter._private.addToHistory(self, filterButtonItems, fastFilterItems, 'TEST_HISTORY_ID');
         assert.isTrue(historySaveEventFired);
         Filter._private.getHistoryItems({}, 'TEST_HISTORY_ID').addCallback(function(items) {
            assert.deepEqual(items, {});
            done();
         });
      });

      it('_private.minimizeItem', function() {
         let filterButtonItem = {
            id: 'testId4',
            value: 'testValue4',
            textValue: 'textTextValue',
            resetValue: '',
            visibility: true
         };
         let expectedMinItem = {
            id: 'testId4',
            value: 'testValue4',
            textValue: 'textTextValue',
            visibility: true
         };
         assert.deepStrictEqual(Filter._private.minimizeItem(filterButtonItem), expectedMinItem);

         filterButtonItem = {
            name: 'testId4',
            value: 'testValue4',
            textValue: 'textTextValue',
            resetValue: '',
            visibility: true,
            viewMode: 'basic'
         };
         expectedMinItem = {
            name: 'testId4',
            value: 'testValue4',
            textValue: 'textTextValue',
            visibility: true,
            viewMode: 'basic'
         };
         assert.deepStrictEqual(Filter._private.minimizeItem(filterButtonItem), expectedMinItem);

         filterButtonItem = {
            name: 'testId4',
            value: 'testValue4',
            resetValue: 'testValue4',
            visibility: true,
            viewMode: 'basic'
         };
         expectedMinItem = {
            name: 'testId4',
            visibility: false,
            viewMode: 'basic'
         };
         assert.deepStrictEqual(Filter._private.minimizeItem(filterButtonItem), expectedMinItem);

         filterButtonItem = {
            name: 'testId4',
            value: 'testValue4',
            visibility: true,
            viewMode: 'basic'
         };
         expectedMinItem = {
            name: 'testId4',
            value: 'testValue4',
            visibility: false,
            viewMode: 'basic'
         };
         assert.deepStrictEqual(Filter._private.minimizeItem(filterButtonItem), expectedMinItem);
      });

      it('applyItemsToFilter', function() {
         var
            self = {},
            filter = {
               testId: 'testValue'
            },
            filter1 = {
               testId: [123]
            },
            filterButtonItems = [{
               id: 'testId',
               value: 'testValue1',
               textValue: 'test1',
               resetValue: ''
            }], filterButtonItems1 = [{
               id: 'testId',
               value: [],
               textValue: undefined,
               resetValue: []
            }];

         Filter._private.applyItemsToFilter(self, filter, filterButtonItems, []);
         assert.equal(self._filter.testId, filterButtonItems[0].value);

         self = {};

         Filter._private.applyItemsToFilter(self, filter1, filterButtonItems1, []);
         assert.equal(self._filter.testId, filterButtonItems1[0].value);
      });

      it('updateFilterHistory', function(done) {
         if (Env.constants.isServerSide) { return done(); }
         let fastFilterItems = [],
            filterButtonItems = [{name: 'testName', value: 'testValue'}];
         Filter.updateFilterHistory({historyId: 'TEST_HISTORY_ID', filterButtonItems: filterButtonItems, fastFilterItems: fastFilterItems});
         Filter._private.getHistoryItems({}, 'TEST_HISTORY_ID')
            .addCallback(function(items) {
               assert.deepEqual(items, [{name: 'testName', value: 'testValue'}]);
               done();
            }).addErrback((error) => {
            throw new Error(error);
         });

         let errorCathed = false;
         try {
            Filter.updateFilterHistory({filterButtonItems: filterButtonItems, fastFilterItems: fastFilterItems});
         } catch (error) {
            errorCathed = true;
         }
         assert.isTrue(errorCathed);

      });

      it('getHistoryByItems', function() {
         const sandbox = sinon.createSandbox();
         const historyItems = new collection.List({
            items: [
               new entity.Model({
                  rawData: {
                     ObjectData: null
                  }
               }),
               new entity.Model({
                  rawData: {
                     ObjectData: [{
                        id: 'testId', value: 'testValue', resetValue: 'testResetValue', textValue: '', anyField1: 'anyValue1'
                     }]
                  }
               }),
               new entity.Model({
                  rawData: {
                     ObjectData: {
                        items: [{ id: 'testId2', value: 'testValuePinned', resetValue: 'testResetValuePinned', textValue: '', anyField1: 'anyValue2' }],
                        isClient: false
                     },
                     pinned: 'true'
                  }
               }),
               new entity.Model({
                  rawData: {
                     ObjectData: {
                        items: [{ id: 'testId3', value: 'testValueClient', resetValue: 'testResetValueClient', textValue: '', anyField1: 'anyValue3' }],
                        isClient: true
                     },
                     client: 'true'
                  }
               })
            ]
         });
         let filterItems = [{id: 'testId', value: 'testValue', resetValue: 'testResetValue', textValue: '', anyField2: 'anyValue2'}];
         sandbox.replace(HistoryUtils, 'getHistorySource', () => {
            return {
               getItems: () => historyItems,
               getDataObject: (data) => data.get('ObjectData')
            };
         });
         let self = {};
         assert.equal(Filter._private.getHistoryByItems(self, 'testId', filterItems).index, 1);

         filterItems = [{id: 'testId2', value: 'testValuePinned', resetValue: 'testResetValuePinned', textValue: '', anyField1: 'anyValue2'}]
         assert.isNull(Filter._private.getHistoryByItems(self, 'testId', filterItems), 'item cannot be deleted from pinned');
         assert.isFalse(self._updateMeta.isClient);

         filterItems = [{id: 'testId3', value: 'testValueClient', resetValue: 'testResetValueClient', textValue: '', anyField1: 'anyValue3'}]
         assert.isNull(Filter._private.getHistoryByItems(self, 'testId', filterItems), 'item cannot be deleted from clint');
         assert.isTrue(self._updateMeta.isClient);
         sandbox.restore();
      });

      it('getCalculatedFilter', function() {
         const sandbox = sinon.createSandbox();
         let filterButtonItems = [{id: 'testId', value: 'testValue', resetValue: 'testResetValue', textValue: ''}];
         let historyItems = [{id: 'testId', value: 'testValueFromHistory', textValue: 'testTextValueFromHistory'}];
         let prefetchParams = {
            prefetchMethod: 'testMethod'
         };
         let resultFilter = {
            testId: 'testValueFromHistory',
            prefetchMethod: 'testMethod',
            PrefetchSessionId: 'testId'
         };

         return new Promise(function(resolve, reject) {
            sandbox.replace(Filter._private, 'getHistoryByItems', () => {
               return {
                  data: {
                     items: [],
                     prefetchParams: {
                        PrefetchSessionId: 'testId'
                     }
                  }
               };
            });
            Filter.getCalculatedFilter({
               filterButtonSource: filterButtonItems,
               historyItems: historyItems,
               prefetchParams: prefetchParams,
               historyId: 'TEST_HISTORY_ID'
            }).addCallback(function(result) {
               assert.equal(filterButtonItems[0].value, 'testValue');
               assert.equal(filterButtonItems[0].textValue, '');
               assert.equal(result.filterButtonItems[0].value, 'testValueFromHistory');
               assert.equal(result.filterButtonItems[0].textValue, 'testTextValueFromHistory');
               assert.deepEqual(result.filter, resultFilter);
               sandbox.restore();
               resolve();
            }).addErrback(function(error) {
               reject(error);
            });
         });
      });

      it('resetPrefetch', function() {
         const controller = new Filter();
         const filter = {
            testField: 'testValue',
            PrefetchSessionId: 'test'
         };
         const sandbox = sinon.createSandbox();

         let isDeletedFromHistory = false;
         let historyItems = null;

         sandbox.replace(Filter._private, 'getHistoryItems', () => Promise.resolve());
         sandbox.replace(Filter._private, 'getHistoryByItems', () => historyItems);
         sandbox.replace(Filter._private, 'deleteFromHistory', () => isDeletedFromHistory = true);

         controller._filter = filter;
         controller._notify = () => {};

         return new Promise((resolve) => {
            controller.resetPrefetch().then(() => {
               assert.isTrue(controller._filter !== filter);
               assert.deepEqual(controller._filter, {testField: 'testValue'});
               assert.isFalse(isDeletedFromHistory);

               historyItems = ['testItem'];
               controller.resetPrefetch().then(() => {
                  assert.deepEqual(controller._filter, {testField: 'testValue'});
                  assert.isTrue(isDeletedFromHistory);

                  sandbox.restore();
                  resolve();
               });
            });
         });
      });
   });

});
