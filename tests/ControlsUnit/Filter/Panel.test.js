define(
   [
      'Controls/filterPopup',
      'Controls/filter',
      'Controls/_filterPopup/DetailPanel',
      'Controls/history',
      'Types/collection',
      'Core/core-clone',
      'Core/Deferred',
      'Env/Env',
      'UI/Utils'
   ],
   function(filterPopup, filter, FilterPopupDetailPanel, history, collection, Clone, Deferred, Env, Utils) {
      describe('FilterPanelVDom', function() {
         var template = 'tmpl!Controls-demo/Layouts/SearchLayout/FilterButtonTemplate/filterItemsTemplate';
         var config = {},
            items = [
               {
                  id: 'list',
                  value: 1,
                  resetValue: 1,
                  visibility: true
               },
               {
                  id: 'text',
                  value: '123',
                  resetValue: '',
                  visibility: true
               },
               {
                  id: 'bool',
                  value: true,
                  resetValue: false,
                  visibility: false
               }
            ];
         config.items = items;
         config.itemTemplate = template;
         config.additionalTemplate = template;

         function getFilterPanel(FPconfig) {
            var panel2 = new FilterPopupDetailPanel.default(FPconfig);
            panel2._items = FPconfig.items;
            panel2.saveOptions(FPconfig);
            return panel2;
         }

         it('Init', function() {
            var panel = getFilterPanel(config);
            panel._beforeMount(config);
            assert.deepEqual(panel._items, config.items);
            assert.isTrue(panel._isChanged);
         });

         it('Init::historyItems', function(done) {
            let isServerSide = Env.constants.isServerSide;
            Env.constants.isServerSide = false;
            var config2 = {
               items: items,
               historyId: 'TEST_PANEL_HISTORY_ID'
            };
            var panel2 = getFilterPanel(config2);
            panel2._loadHistoryItems('TEST_PANEL_HISTORY_ID', false).addCallback(function(items) {
               assert.isOk(filter.HistoryUtils.getHistorySource({historyId: 'TEST_PANEL_HISTORY_ID'})._history);
               assert.isFalse(filter.HistoryUtils.getHistorySource({historyId: 'TEST_PANEL_HISTORY_ID'}).historySource._$favorite);
               assert.equal(items.getCount(), 2);
               Env.constants.isServerSide = isServerSide;
               done();
            });
         });

         it('historySaveMode', () => {
            const cfg = Clone(config);
            cfg.orientation = 'vertical';
            cfg.historySaveMode = 'favorite';
            let filterPanel = getFilterPanel(cfg);
            filterPanel._beforeMount(cfg);
            assert.isTrue(filterPanel._historySaveMode === 'favorite');
         });

         it('Init::historyItems isReportPanel', function() {
            let historyConfig = {
               historyId: 'TEST_REPORT_PANEL_HISTORY_ID',
               recent: 'MAX_HISTORY_REPORTS',
               pinned: false
            };
            let hSource = filter.HistoryUtils.getHistorySource(historyConfig);
            assert.strictEqual(hSource.historySource._$recent, history.Constants.MAX_HISTORY_REPORTS + 1);
         });

         it('Init::historyItems fail loading', function(done) {
            var config2 = {
               items: items,
               historyId: 'TEST_PANEL_HISTORY_ID'
            };
            var panel2 = getFilterPanel(config2);
            let hUtilsLoader = filter.HistoryUtils.loadHistoryItems;
            filter.HistoryUtils.loadHistoryItems = () => { return new Deferred.fail(); };
            panel2._loadHistoryItems('TEST_PANEL_HISTORY_ID').addCallback(function() {
               assert.equal(panel2._historyItems.getCount(), 0);
               done();
            });
            filter.HistoryUtils.loadHistoryItems = hUtilsLoader;
         });

         it('before update', function() {
            var panel = getFilterPanel(config);
            panel._beforeMount(config);
            panel._items[2].visibility = false;
            panel._beforeUpdate(config);
            assert.isTrue(panel._isChanged);
            assert.isTrue(panel._hasAdditionalParams);
         });

         it('getKeyProperty', () => {
            var panel = getFilterPanel(config);
            const id = panel._getKeyProperty(items);
            const newItems = [{
               name: 'test',
               value: 1,
               resetValue: null
            },
            {
               name: 'test1',
               value: 2,
               resetValue: 3
            }
            ];
            const name = panel._getKeyProperty(newItems);
            assert.isTrue(id === 'id');
            assert.isTrue(name === 'name');
         });

         it('before update new items', function() {
            let newConfig = Clone(config);
            newConfig.items[2].visibility = true;
            var panel = getFilterPanel(newConfig);
            panel._beforeMount(newConfig);
            assert.isFalse(panel._hasAdditionalParams);

            newConfig = Clone(newConfig);
            newConfig.items[2].visibility = false;
            panel._beforeUpdate(newConfig);
            assert.isTrue(panel._hasAdditionalParams);
         });

         it('apply', async function() {
            const panel = getFilterPanel(config);
            let isNotifyClose = false;
            let isHistoryApplyEventFired = false;
            let filter;

            panel._notify = (e, args, eCfg) => {
               if (e === 'close') {
                  isNotifyClose = true;
               } else if (e === 'sendResult') {
                  filter = args[0].filter;
               } else if (e === 'historyApply') {
                  isHistoryApplyEventFired = true;
               }
               if (eCfg) {
                  assert.isTrue(eCfg.bubbling);
               }
            };
            panel._beforeMount(config);
            panel._children = {
               formController: {
                  submit: () => Deferred.success([true])
               }
            };
            panel._applyFilter();
            assert.isFalse(isNotifyClose);
            assert.isFalse(isHistoryApplyEventFired);
            panel._children = {
               formController: {
                  submit: () => Deferred.success([false])
               }
            };
            await panel._applyFilter();
            assert.deepEqual({ text: '123' }, filter);
            assert.isTrue(isNotifyClose);
            assert.isFalse(isHistoryApplyEventFired);

            const event = {};
            const historyItems = config.items;
            panel._applyFilter(event, config.items, historyItems);
            assert.isTrue(isHistoryApplyEventFired);
         });

         it('_applyHistoryFilter', function() {
            var panel = getFilterPanel(config),
               isNotifyClose, filter, items, isValidated = false;
            panel._notify = (e, args) => {
               if (e == 'sendResult') {
                  filter = args[0].filter;
                  items = args[0].items;
               } else if (e == 'close') {
                  isNotifyClose = true;
               }
            };
            panel._beforeMount(config);
            panel._children = { formController: { submit: ()=>{isValidated = true; return Deferred.success([])} } };
            var historyItems = [
               {
                  id: 'text',
                  value: '123',
                  visibility: true
               },
               {
                  id: 'bool',
                  value: true,
                  visibility: true
               },
               {
                  id: 'test',
                  value: false,
                  visibility: true
               }
            ];
            panel._applyHistoryFilter('applyHistoryFilter', historyItems);
            assert.deepEqual({ text: '123', bool: true, test: false }, filter);
            assert.deepEqual({ id: 'test', value: false, visibility: true }, items[2]);
            assert.isFalse(isValidated);
            assert.isTrue(isNotifyClose);
         });

         it('_resetFilter', function() {
            const changedItems = [
               {
                  id: 'list',
                  value: 5,
                  resetValue: 1,
                  textValue: 'listValue'
               },
               {
                  id: 'text',
                  value: '123',
                  resetValue: '',
                  visibility: true,
                  textValue: null
               },
               {
                  id: 'bool',
                  value: true,
                  resetValue: false,
                  visibility: false
               },
               {
                  id: 'reseted',
                  value: 'reset'
               }
            ];
            const resetedItems = [
               {
                  id: 'list',
                  value: 1,
                  resetValue: 1,
                  textValue: ''
               },
               {
                  id: 'text',
                  value: '',
                  resetValue: '',
                  visibility: false,
                  textValue: null
               },
               {
                  id: 'bool',
                  value: false,
                  resetValue: false,
                  visibility: false
               },
               {
                  id: 'reseted',
                  value: 'reset'
               }
            ];
            let itemsChangedResult;
            let panel2 = getFilterPanel({ items: changedItems });
            panel2._notify = (event, data) => {
               if (event === 'itemsChanged') {
                  itemsChangedResult = data[0];
               }
            };
            panel2._resetFilter();
            assert.deepStrictEqual({'reseted': 'reset'}, panel2._getFilter(panel2._items));
            assert.deepStrictEqual(panel2._items, resetedItems);
            assert.deepStrictEqual(itemsChangedResult, resetedItems);
            assert.isFalse(panel2._isChanged);
         });

         it('isChangeValue', function() {
            var panel = getFilterPanel(config);
            panel._resetFilter();
            assert.isFalse(panel._isChangedValue(panel._items));
            panel._items.push(
               {
                  id: 'reseted',
                  value: 'reset'
               });
            panel._resetFilter();
            assert.isFalse(panel._isChangedValue(panel._items));
         });

         it('without add params', function() {
            var panel = getFilterPanel(config);
            panel._beforeMount(config);
            panel._items[2].visibility = true;
            assert.isFalse(panel._hasAddParams(panel._items));
         });

         it('recordSet', function() {
            var rs = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: items
               }),
               options = {};
            options.items = rs;
            options.additionalTemplate = template;
            var panel2 = new FilterPopupDetailPanel.default(options);
            panel2._beforeMount(options);
            panel2._beforeUpdate(options);
            assert.isTrue(panel2._isChanged);
            assert.isTrue(panel2._hasAdditionalParams);
         });

         it('valueChanged, visibilityChanged', function() {
            var panel = getFilterPanel(config);
            var itemsChangedEventFired = false;

            panel._notify = () => {
               itemsChangedEventFired = true;
            };
            panel._beforeMount(config);
            var newItems = Clone(items);
            newItems[0].value = 'testValue2';
            panel._itemsChangedHandler('itemsChanged', newItems);

            assert.deepEqual(panel._items[0].value, 'testValue2');
            assert.isTrue(itemsChangedEventFired);
         });

         it('resolveItems', function() {
            var panel = getFilterPanel(config);
            var items = ['test'];
            var options = {
               items: items
            };

            panel._resolveItems(options);
            assert.isTrue(options.items !== panel._items);
            assert.equal(panel._items[0], 'test');

            var stubLoggerError = sinon.stub(Utils.Logger, 'error');

            assert.throws(() => {
               panel._resolveItems({});
            }, 'Controls/filterPopup:Panel::items option is required');
            stubLoggerError.restore();
         });

         describe('Check history', function() {
            let panel = getFilterPanel(config), historyItems;
            beforeEach(function() {
               panel._items = [
                  {
                     id: 'Methods',
                     value: '123',
                     resetValue: '',
                     visibility: true,
                     textValue: null
                  },
                  {
                     id: 'Faces',
                     value: true,
                     resetValue: false,
                     visibility: false
                  }
               ];
               historyItems = new collection.RecordSet({
                  rawData: [
                     { ObjectData: null },
                     { ObjectData: JSON.stringify([
                           {
                              id: 'Methods',
                              value: '',
                              resetValue: '',
                              visibility: true,
                              textValue: '123'
                           },
                           {
                              id: 'Faces',
                              value: true,
                              resetValue: true,
                              visibility: false
                           }
                        ])
                     },
                     { ObjectData: null },
                     { ObjectData: JSON.stringify([
                           {
                              id: 'Methods',
                              value: '1234',
                              resetValue: '',
                              visibility: true,
                              textValue: '123'
                           },
                           {
                              id: 'Faces',
                              value: true,
                              resetValue: true,
                              visibility: false
                           }
                        ])
                     },
                     { ObjectData: null },
                     { ObjectData: JSON.stringify([
                           {
                              id: 'Methods',
                              value: '1234',
                              resetValue: '',
                              textValue: ''
                           },
                           {
                              id: 'Faces',
                              value: true,
                              resetValue: true
                           }
                        ])
                     },
                     { ObjectData: JSON.stringify([
                           {
                              id: 'Methods',
                              value: '1234',
                              resetValue: '',
                              textValue: null
                           },
                           {
                              id: 'Faces',
                              value: true,
                              resetValue: true
                           }
                        ])
                     }
                  ]
               });
            });

            it('filterHistoryItems', function() {
               assert.equal(panel._filterHistoryItems(historyItems).getCount(), 1);
            });

            it('getFilter', () => {
               const items = [
                  {
                     id: 'list',
                     value: 5,
                     resetValue: 1,
                     textValue: 'listValue'
                  },
                  {
                     name: 'text',
                     value: '123',
                     resetValue: '',
                     visibility: true,
                     textValue: null
                  },
                  {
                     name: 'bool',
                     value: true,
                     resetValue: false,
                     visibility: false
                  },
                  {
                     id: 'object',
                     value: {},
                     resetValue: null
                  }
               ];
               assert.deepEqual(panel._getFilter(items), {
                  list: 5,
                  text: '123',
                  object: {}
               });
            });

            it('_reloadHistoryItems', function() {
               if (Env.constants.isServerSide) { return; }
               filter.HistoryUtils.getHistorySource({historyId: 'TEST_RELOAD_ITEMS_HISTORY_ID'}).getItems = () => {
                  return historyItems;
               };
               panel._reloadHistoryItems(self, 'TEST_RELOAD_ITEMS_HISTORY_ID');
               assert.equal(self._historyItems.getCount(), 1);
            });
         });

         it('_prepareItems', function() {
            var panel = getFilterPanel(config);
            var changeItems = [
                  {
                     id: 'list',
                     value: 1,
                     resetValue: 1,
                     visibility: true
                  },
                  {
                     id: 'text',
                     value: '123',
                     resetValue: '',
                     visibility: true
                  },
                  {
                     id: 'bool',
                     value: true,
                     resetValue: false,
                     visibility: false
                  },
                  {
                     id: 'testObject',
                     value: {},
                     resetValue: {},
                     visibility: true
                  }
               ],
               resetItems = [
                  {
                     id: 'list',
                     value: 1,
                     resetValue: 1,
                     visibility: false
                  },
                  {
                     id: 'text',
                     value: '123',
                     resetValue: '',
                     visibility: true
                  },
                  {
                     id: 'bool',
                     value: true,
                     resetValue: false,
                     visibility: false
                  },
                  {
                     id: 'testObject',
                     value: {},
                     resetValue: {},
                     visibility: false
                  }
               ];
            assert.deepEqual(panel._prepareItems(changeItems), resetItems);
         });

         it('_prepareItems without resetValue', function() {
            var panel = getFilterPanel(config);
            var changeItems = [
                  {
                     id: 'list',
                     value: 1,
                     visibility: true
                  },
                  {
                     id: 'text',
                     value: '123',
                     visibility: true
                  },
                  {
                     id: 'bool',
                     value: false,
                     visibility: true
                  },
                  {
                     id: 'testObject',
                     value: [],
                     visibility: true
                  }
               ],
               resetItems = [
                  {
                     id: 'list',
                     value: 1,
                     visibility: true
                  },
                  {
                     id: 'text',
                     value: '123',
                     visibility: true
                  },
                  {
                     id: 'bool',
                     value: false,
                     visibility: false
                  },
                  {
                     id: 'testObject',
                     value: [],
                     visibility: false
                  }
               ];
            assert.deepEqual(panel._prepareItems(changeItems), resetItems);
         });

         it('_historyItemsChanged', function() {
            if (Env.constants.isServerSide) { return; }
            var newConfig = Object.assign({}, config);
            newConfig.historyId = 'TEST_HISTORY_ID';
            var panel = getFilterPanel(config);
            panel._loadHistoryItems = (historyId) => {assert.equal(historyId, 'TEST_PANEL_HISTORY_ID')};
            panel._historyItemsChanged();
         });

         it('_isPassedValidation', function() {
            var panel = getFilterPanel(config);
            var validationResult = [null];
            assert.isTrue(panel._isPassedValidation(validationResult));

            validationResult = [null, 'Дата заполнена некорректно'];
            assert.isFalse(panel._isPassedValidation(validationResult));

            validationResult = ['Дата заполнена некорректно', null];
            assert.isFalse(panel._isPassedValidation(validationResult));
         });
      });
   }
);
