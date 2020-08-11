define(
   [
      'Controls/filter',
      'Types/source',
      'Core/core-clone',
      'Types/collection',
      'Controls/history',
      'Types/entity',
      'Core/Deferred',
      'Application/Env'
   ],
   function(filterMod, sourceLib, Clone, collection, history, entity, Deferred, Env) {
      describe('FastFilterVDom', function() {
         var items = [
            [{ key: 0, title: 'все страны' },
               { key: 1, title: 'Россия' },
               { key: 2, title: 'США' },
               { key: 3, title: 'Великобритания' }
            ],

            [{ key: 0, title: 'все жанры' },
               { key: 1, title: 'фантастика' },
               { key: 2, title: 'фэнтези' },
               { key: 3, title: 'мистика' }
            ]
         ];
         var source = [
            {
               id: 'first',
               value: 'Россия',
               resetValue: 'все страны',
               textValue: '',
               properties: {
                  keyProperty: 'title',
                  displayProperty: 'title',
                  source: new sourceLib.Memory({
                     data: items[0],
                     keyProperty: 'key'
                  })
               }
            },
            {
               id: 'second',
               resetValue: 'фэнтези',
               value: 'фэнтези',
               textValue: '',
               properties: {
                  source: new sourceLib.Memory({
                     data: items[1],
                     keyProperty: 'key'
                  }),
                  keyProperty: 'title',
                  displayProperty: 'title'
               }
            },
            {
               id: 'third',
               value: 0,
               resetValue: 0,
               textValue: '',
               properties: {
                  keyProperty: 'key',
                  displayProperty: 'title',
                  filter: {
                     key: 0
                  },
                  source: new sourceLib.Memory({
                     data: items[0],
                     keyProperty: 'key'
                  })
               }
            },
            {
               id: 'fourth',
               value: 'все страны',
               resetValue: 'все страны',
               textValue: '',
               properties: {
                  keyProperty: 'title',
                  displayProperty: 'title',
                  source: new sourceLib.Memory({
                     data: items[0],
                     keyProperty: 'key'
                  }),
                  navigation: {view: 'page', source: 'page', sourceConfig: {pageSize: 2, page: 0, hasMore: false}}
               }
            }
         ];

         var config = {};
         config.source = new sourceLib.Memory({
            keyProperty: 'id',
            data: source
         });

         let configItems = {
            items: [{
               id: 'first',
               value: ['Россия'],
               resetValue: ['все страны'],
               textValue: '',
               properties: {
                  keyProperty: 'title',
                  displayProperty: 'title',
                  multiSelect: true,
                  source: new sourceLib.Memory({
                     data: items[0],
                     keyProperty: 'key'
                  })
               }}
            ]
         };

         var getFastFilter = function(configFastFilter) {
            var fastFilter = new filterMod.Fast(configFastFilter);
            fastFilter.saveOptions(configFastFilter);
            return fastFilter;
         };

         var getFastFilterWithItems = function(config) {
            var fastFilter = new filterMod.Fast(config);
            fastFilter._beforeMount(config);
            fastFilter._configs[0]._items = new collection.RecordSet({
               rawData: Clone(items[0]),
               keyProperty: 'title'
            });
            fastFilter.lastOpenIndex = 0;
            fastFilter._children.DropdownOpener = {
               close: setTrue.bind(this, assert),
               open: setTrue.bind(this, assert)
            };
            return fastFilter;
         };

         var fastData = new filterMod.Fast(config);
         var isFilterChanged;

         var configWithItems = {};
         configWithItems.items = source;
         var fastDataItems = new filterMod.Fast(configWithItems);
         fastDataItems._beforeMount(configWithItems);

         fastData._notify = (e, args) => {
            if (e == 'filterChanged') {
               isFilterChanged = true;
            }
         };
         fastData._beforeMount(config);
         fastData._children.DropdownOpener = {
            close: setTrue.bind(this, assert),
            open: setTrue.bind(this, assert)
         };

         it('_selectorOpenCallback', () => {
            let fastFilter = getFastFilterWithItems(configItems);
            const items = fastFilter._selectorOpenCallback();
            assert.isTrue(items instanceof collection.List);
         });

         it('_beforeMount', function(done) {
            let fastFilter = getFastFilter(configItems);
            let receivedItems = [{
               id: 'first',
               value: ['Россия'],
               resetValue: ['все страны'],
               textValue: '',
               properties: {
                  keyProperty: 'title',
                  displayProperty: 'title'
               }}
            ];
            let receivedState = {
               configs: [{_items: new collection.RecordSet({
                  keyProperty: 'key',
                  rawData: items[0]
               })}],
               items: new collection.List({
                  items: receivedItems
               })
            };
            let optionsItems = {
               items: [{
                  id: 'first',
                  value: ['Россия'],
                  resetValue: ['все страны'],
                  textValue: '',
                  properties: {
                     keyProperty: 'title',
                     displayProperty: 'title',
                     source: new sourceLib.Memory({
                        data: items[0],
                        keyProperty: 'key'
                     })
                  }}
               ]
            };
            fastFilter._beforeMount(optionsItems, {}, receivedState);
            assert.isOk(fastFilter._configs[0]._sourceController);
            assert.isFalse(fastFilter._hasSelectorTemplate);

            let receivedStateSelector = Clone(receivedState);
            receivedStateSelector.configs[0].selectorTemplate = 'new template';
            fastFilter._beforeMount(optionsItems, {}, receivedStateSelector);
            assert.isTrue(fastFilter._hasSelectorTemplate);

            let receivedStateHistory = Clone(receivedState);
            receivedStateSelector.configs[0]._source = null;
            fastFilter._beforeMount(optionsItems, {}, receivedStateHistory);
            assert.isTrue(fastFilter._configs[0]._needQuery);

            receivedStateSelector = Clone(receivedState);
            let optionsSource = {source: new sourceLib.Memory({
                  keyProperty: 'id',
                  items: [{
                     id: 'first',
                     value: ['Россия'],
                     resetValue: ['все страны'],
                     textValue: '',
                     properties: {
                        keyProperty: 'title',
                        displayProperty: 'title',
                        source: new sourceLib.Memory({
                           data: items[0],
                           keyProperty: 'key'
                        })
                     }}
                  ]
               })};
            fastFilter._beforeMount(optionsSource, {}, receivedStateSelector);
            assert.isOk(fastFilter._configs[0]._sourceController);
            assert.isFalse(fastFilter._hasSelectorTemplate);

            fastFilter._hasSelectorTemplate = undefined;
            let optionsItemsSelector = Clone(optionsItems);
            optionsItemsSelector.items[0].properties.selectorTemplate = 'new template';
            fastFilter._beforeMount(optionsItemsSelector);
            assert.isTrue(fastFilter._hasSelectorTemplate);

            fastFilter._hasSelectorTemplate = undefined;
            let sourceOptions = Clone(source);
            sourceOptions[0].properties.selectorTemplate = 'new template';
            fastFilter._beforeMount({source: new sourceLib.Memory({
               data: sourceOptions,
               keyProperty: 'id'
            })}).addCallback(function() {
               assert.isTrue(fastFilter._hasSelectorTemplate);
               done();
            });
         });

         it('beforeUpdate new items property not changed', function(done) {
            var fastFilter = getFastFilter(configWithItems);
            fastFilter._beforeMount(configWithItems).addCallback(function(result) {
               assert.isTrue(!!result.configs);
               assert.equal(Object.keys(result.configs).length, Object.keys(fastFilter._configs).length);
               var newConfigItems = Clone(configWithItems);
               newConfigItems.items[0].value = 'США';
               fastFilter._beforeUpdate(newConfigItems);
               assert.equal(fastFilter._items.at(0).value, 'США');

               fastFilter._configs[0].selectorTemplate = 'new template';
               fastFilter._hasSelectorTemplate = null;
               fastFilter._beforeUpdate(newConfigItems);
               assert.isTrue(fastFilter._hasSelectorTemplate);
               done();
            });
         });

         it('beforeUpdate new items property changed', function(done) {
            var fastFilter = getFastFilter(configWithItems);
            fastFilter._beforeMount(configWithItems);
            var newConfigItems = Clone(configWithItems);
            newConfigItems.items[0].value = 'США';
            newConfigItems.items[0].properties.navigation = {view: 'page', source: 'page', sourceConfig: {pageSize: 2, page: 0, hasMore: false}};
            fastFilter._beforeUpdate(newConfigItems).addCallback(function() {
               assert.equal(fastFilter._items.at(0).value, 'США');
               done();
            });
         });

         it('beforeUpdate new source', function(done) {
            var fastFilter = getFastFilter(config),
               newConfigSource = Clone(config),
               newSource = Clone(source);
            fastFilter._beforeMount(config);
            newSource[0].value = 'США';
            newConfigSource.source = new sourceLib.Memory({
               keyProperty: 'id',
               data: newSource
            });
            fastFilter._beforeUpdate(newConfigSource).addCallback(function() {
               assert.equal(fastFilter._items.at(0).get('value'), 'США');
               done();
            });
         });

         it('load config', function(done) {
            filterMod.Fast._private.reload(fastData).addCallback(function() {
               filterMod.Fast._private.loadItems(fastData, fastData._items.at(0), 0).addCallback(function() {
                  assert.deepEqual(fastData._configs[0]._items.getRawData(), items[0]);
                  done();
               });
            });
         });

         it('load config from items', function(done) {
            filterMod.Fast._private.reload(fastDataItems).addCallback(function(result) {
               assert.isTrue(!!result.configs);
               assert.equal(Object.keys(result.configs).length, Object.keys(fastData._configs).length);
               filterMod.Fast._private.loadItems(fastData, fastData._items.at(0), 0).addCallback(function() {
                  assert.deepEqual(fastData._configs[0]._items.getRawData(), items[0]);
                  done();
               });
            });
         });

         it('load config from items with filter', function(done) {
            filterMod.Fast._private.reload(fastDataItems).addCallback(function() {
               filterMod.Fast._private.loadItems(fastData, fastData._items.at(2), 0).addCallback(function() {
                  assert.deepEqual(fastData._configs[0]._items.getRawData(), [{ key: 0, title: 'все страны' }]);
                  done();
               });
            });
         });

         it('load config from items with navigation', function(done) {
            filterMod.Fast._private.reload(fastDataItems).addCallback(function() {
               filterMod.Fast._private.loadItems(fastData, fastData._items.at(3), 0).addCallback(function() {
                  assert.equal(fastData._configs[0]._items.getCount(), 2);
                  done();
               });
            });
         });

         it('loadItems with setted text', function() {
            filterMod.Fast._private.loadItems(fastData, fastData._items.at(0), 0);
            assert.strictEqual(fastData._configs[0].text, 'Россия');
         });

         it('loadItems call while loading', function() {
            return new Promise(function(resolve) {
               var sourceController;
               filterMod.Fast._private.loadItems(fastData, fastData._items.at(0), 0);
               sourceController = fastData._configs[0]._sourceController;

               filterMod.Fast._private.loadItems(fastData, fastData._items.at(0), 0);
               assert.isFalse(sourceController === fastData._configs[0]._sourceController);
               resolve();
            });
         });

         it('reload call while loading', function() {
            return new Promise(function(resolve) {
               let isCanceled = false;
               fastData._loadDeferred = new Deferred({
                  cancelCallback: () => {isCanceled = true}
               });

               filterMod.Fast._private.reload(fastData);
               assert.isTrue(isCanceled);
               resolve();
            });
         });

         it('get filter', function(done) {
            filterMod.Fast._private.reload(fastData).addCallback(function() {
               filterMod.Fast._private.loadItems(fastData, fastData._items.at(0), 0).addCallback(function() {
                  var result = filterMod.Fast._private.getFilter(fastData._items);
                  assert.deepEqual(result, { 'first': fastData._items.at(0).get('value') });
                  done();
               });
            });
         });

         it('notifyChanges', function() {
            var fastFilter = getFastFilter(config);
            var itemsChanges = { id: '1', value: '1', resetValue: '2' };
            fastFilter._notify = function(e, data) {
               if (e === 'filterChanged') {
                  assert.deepEqual(data[0], { 1: '1' });
               } else if (e === 'itemsChanged') {
                  assert.deepEqual(data[0], [itemsChanges]);
               }
            };
            filterMod.Fast._private.notifyChanges(fastFilter, [itemsChanges]);
         });

         it('setValue', function() {
            let fastData2 = getFastFilterWithItems(configItems);
            filterMod.Fast._private.setValue(fastData2, ['Россия', 'Великобритания']);
            assert.deepEqual(fastData2._items.at(0).value, ['Россия', 'Великобритания']);

            const fastConfig = {
               items: [{
                  id: 'first',
                  value: 'Россия',
                  resetValue: ['все страны'],
                  textValue: '',
                  properties: {
                     keyProperty: 'title',
                     displayProperty: 'title',
                     multiSelect: false,
                     source: new sourceLib.Memory({
                        data: items[0],
                        keyProperty: 'key'
                     })
                  }}
               ]
            };
            fastData2 = getFastFilterWithItems(fastConfig);
            filterMod.Fast._private.setValue(fastData2, ['все страны']);
            assert.deepEqual(fastData2._items.at(0).value, ['все страны']);

            filterMod.Fast._private.setValue(fastData2, []);
            assert.deepEqual(fastData2._items.at(0).value, ['все страны']);
         });

         it('onResult footerClick', function() {
            let closed = false;
            let fastFilter = getFastFilter(configWithItems);
            fastFilter._children = { DropdownOpener: { close: ()=> {closed = true;} } };
            fastFilter._beforeMount(configWithItems);
            fastFilter._onResult({}, 'footerClick');
            assert.isTrue(closed);
         });

         it('onResult itemClick', function(done) {
            filterMod.Fast._private.reload(fastData).addCallback(function() {
               filterMod.Fast._private.loadItems(fastData, fastData._items.at(0), 0).addCallback(function() {
                  fastData.lastOpenIndex = 0;
                  isFilterChanged = false;
                  fastData._onResult(null, 'itemClick', fastData._configs[0]._items.at(2));
                  assert.isTrue(isFilterChanged);
                  assert.equal(items[0][2].title, 'США');
                  done();
               });
            });
         });

         it('onResult applyClick', function() {
            let fastData2 = getFastFilterWithItems(configItems);
            let selectedItems = [
               { key: 1, title: 'Россия' },
               { key: 3, title: 'Великобритания' }
            ];
            fastData2._onResult(null, 'applyClick', selectedItems);
            assert.deepEqual(fastData2._items.at(0).value, ['Россия', 'Великобритания']);

            fastData2._onResult(null, 'applyClick',  []);
            assert.deepEqual(fastData2._items.at(0).value, ['все страны']);
         });

         it('onResult selectorResult', function() {
            let fastData2 = getFastFilterWithItems(configItems);
            let selectedItems = new collection.RecordSet({
               keyProperty: 'key',
               rawData: [
                  { key: 1, title: 'Россия' },
                  { key: 5, title: 'Франция' }
               ]
            });
            fastData2._afterSelectorOpenCallback([]);
            fastData2._onResult(null, 'selectorResult', selectedItems);
            assert.deepEqual(fastData2._items.at(0).value, ['Россия', 'Франция']);
            assert.deepEqual(fastData2._configs[0]._items.getCount(), 5);
            assert.deepEqual(fastData2._configs[0]._items.at(0).getRawData(), { key: 5, title: 'Франция' });
         });

         it('onResult selectorResult selectorCallback', function() {
            let fastData2 = getFastFilterWithItems(configItems);
            fastData2._notify = (event, data) => {
               if (event === 'selectorCallback') {
                  data[1].at(0).set({key: 11, title: 'Китай'});
               }
            };
            let selectedItems = new collection.RecordSet({
               keyProperty: 'key',
               rawData: [
                  { key: 1, title: 'Россия' },
                  { key: 5, title: 'Франция' }
               ]
            });
            fastData2._afterSelectorOpenCallback([]);
            fastData2._onSelectorTemplateResult('selectorResult', selectedItems);
            assert.deepEqual(fastData2._items.at(0).value, ['Китай', 'Франция']);
            assert.deepEqual(fastData2._configs[0]._items.getCount(), 6);
            assert.deepEqual(fastData2._configs[0]._items.at(0).getRawData(), { key: 11, title: 'Китай' });
         });

         it('_onResult selectorDialogOpened', () => {
            let instance = getFastFilterWithItems(configItems);
            let opened = true;
            let notifyFire = false;
            instance._children.DropdownOpener = {
               close: () => { opened = false }
            };
            instance._notify = () => {
               notifyFire = true;
            };
            instance._onResult(null, 'selectorDialogOpened', []);
            assert.isFalse(notifyFire);
            assert.isFalse(opened);
         });

         it('_onSelectorTemplateResult', function() {
            let fastData2 = getFastFilterWithItems(configItems);
            let selectedItems = new collection.RecordSet({
               keyProperty: 'key',
               rawData: [
                  { key: 1, title: 'Россия' },
                  { key: 5, title: 'Франция' }
               ]
            });
            fastData2._afterSelectorOpenCallback([]);
            fastData2._onSelectorTemplateResult('event', selectedItems);
            assert.deepEqual(fastData2._items.at(0).value, ['Россия', 'Франция']);
            assert.deepEqual(fastData2._configs[0]._items.getCount(), 5);
            assert.deepEqual(fastData2._configs[0]._items.at(0).getRawData(), { key: 5, title: 'Франция' });
         });

         it('selectItems', function() {
            let configMultiSelect = {
               items: [{
                  id: 'first',
                  value: [1],
                  resetValue: [0],
                  textValue: '',
                  properties: {
                     keyProperty: 'key',
                     displayProperty: 'title',
                     emptyText: 'Все',
                     multiSelect: true,
                     source: new sourceLib.Memory({
                        data: items[0],
                        keyProperty: 'key'
                     })
                  }}
               ]
            };
            let fastData2 = getFastFilterWithItems(configMultiSelect);

            // multi selection
            filterMod.Fast._private.selectItems.call(fastData2, [
               { key: 1, title: 'Россия' },
               { key: 2, title: 'США' },
               { key: 3, title: 'Великобритания' }]);
            assert.deepEqual(fastData2._items.at(0).value, [1, 2, 3]);

            // single selection
            configMultiSelect.items[0].properties.multiSelect = false;
            fastData2 = getFastFilterWithItems(configMultiSelect);
            filterMod.Fast._private.selectItems.call(fastData2, [{ key: 3, title: 'Великобритания' }]);
            assert.deepEqual(fastData2._items.at(0).value, 3);

            // empty selection
            fastData2 = getFastFilterWithItems(configMultiSelect);
            filterMod.Fast._private.selectItems.call(fastData2, []);
            assert.deepEqual(fastData2._items.at(0).value, [0]);

            // empty selection with key = null
            fastData2 = getFastFilterWithItems(configMultiSelect);
            filterMod.Fast._private.selectItems.call(fastData2, [{key: null}]);
            assert.deepEqual(fastData2._items.at(0).value, [0]);

            // resetValue selection
            configMultiSelect.items[0].resetValue = 0;
            fastData2 = getFastFilterWithItems(configMultiSelect);
            fastData2._configs[0].multiSelect = true;
            filterMod.Fast._private.selectItems.call(fastData2, [{ key: 0, title: 'все страны' }]);
            assert.deepEqual(fastData2._items.at(0).value, 0);
         });

         it('setText', function(done) {
            filterMod.Fast._private.reload(fastData).addCallback(function() {
               filterMod.Fast._private.loadItems(fastData, fastData._items.at(0), 0).addCallback(function(items) {
                  fastData._setText();
                  assert.equal(fastData._configs[0].text, 'США');
                  assert.equal(fastData._configs[1].text, 'фэнтези');
                  assert.equal(fastData._configs[2].text, 'все страны');
                  assert.equal(fastData._configs[3].text, 'все страны');
                  done();
               });
            });
         });

         it('setText multiSelect', function() {
            let configMultiSelect = Clone(config);
            configMultiSelect.items = [{
               id: 'first',
               value: ['Россия'],
               resetValue: ['все страны'],
               textValue: '',
               properties: {
                  keyProperty: 'title',
                  displayProperty: 'title',
                  source: new sourceLib.Memory({
                     data: items[0],
                     keyProperty: 'key'
                  })
               }
            }];
            let fastDataMultiSelect = new filterMod.Fast(configMultiSelect);
            fastDataMultiSelect._beforeMount(configMultiSelect);
            fastDataMultiSelect._configs[0]._items = items[0];
            fastDataMultiSelect._setText();
            assert.equal(fastDataMultiSelect._configs[0].text, 'Россия');
            assert.equal(fastDataMultiSelect._configs[0].title, 'Россия');
            assert.equal(fastDataMultiSelect._configs[0].hasMoreText, '');

            configMultiSelect.items[0].value = ['Россия', 'Великобритания'];
            fastDataMultiSelect._beforeMount(configMultiSelect);
            fastDataMultiSelect._configs[0]._items = items[0];
            fastDataMultiSelect._setText();
            assert.equal(fastDataMultiSelect._configs[0].text, 'Россия');
            assert.equal(fastDataMultiSelect._configs[0].title, 'Россия, Великобритания');
            assert.equal(fastDataMultiSelect._configs[0].hasMoreText, ', еще 1');
         });

         it('reset', function(done) {
            filterMod.Fast._private.reload(fastData).addCallback(function() {
               filterMod.Fast._private.loadItems(fastData, fastData._items.at(0), 0).addCallback(function() {
                  let isOpened = false, closed = false;
                  fastData.lastOpenIndex = 0;
                  fastData._children = {DropdownOpener: {isOpened: () => {return isOpened;}, close: () => {closed = true;}}};
                  fastData._reset(null, fastData._items.at(0), 0);
                  assert.equal(fastData._items.at(0).get('resetValue'), 'все страны');
                  assert.isFalse(closed);

                  isOpened = true;
                  fastData._reset(null, fastData._items.at(0), 0);
                  assert.equal(fastData._items.at(0).get('resetValue'), 'все страны');
                  assert.isTrue(closed);
                  done();
               });
            });
         });

         it('open dropdown', function() {
            let fastFilter = new filterMod.Fast(config);
            fastFilter._options.theme = 'default';
            let expectedConfig, isOpened, isLoading = false;
            fastFilter._children = {
               DropdownOpener: { open: (openerConfig) => {expectedConfig = openerConfig; isOpened = true;} },
               selectorOpener: {}
            };
            fastFilter._container = {children: []};
            fastFilter._configs = [{_items: new collection.RecordSet({
                  keyProperty: 'key',
                  rawData: items[0]
               }),
               _source: 'targetSource',
               _sourceController: { hasMoreData: () => {}, isLoading: () => {return isLoading}, getNavigation: () => {} }}];
            fastFilter._items = new collection.RecordSet({
               rawData: configItems.items,
               keyProperty: 'title'
            });
            fastFilter._open('itemClick', fastFilter._configs[0]._items, 0);
            assert.deepStrictEqual(expectedConfig.fittingMode, {
               horizontal: 'overflow',
               vertical: 'adaptive'
            });
            assert.isOk(expectedConfig.templateOptions.source);
            assert.deepStrictEqual(expectedConfig.templateOptions.selectorItems, fastFilter._configs[0]._items);
            assert.strictEqual(expectedConfig.templateOptions.selectedKeys[0], 'Россия');
            assert.isTrue(isOpened);
            assert.equal(expectedConfig.templateOptions.dropdownClassName, 'controls-FastFilter_width-popup_theme-default');
            assert.isOk(expectedConfig.templateOptions.selectorOpener);

            isOpened = false;
            isLoading = true;
            fastFilter._open('itemClick', fastFilter._configs[0]._items, 0);
            assert.isFalse(isOpened);
         });

         it('open dropdown _needQuery', function() {
            let fastFilter = new filterMod.Fast(config);
            let opened = false;
            fastFilter._children = {
               DropdownOpener: { open: () => {opened = true;} }
            };
            fastFilter._container = {children: []};
            fastFilter._configs = [{_items: new collection.RecordSet({
                  keyProperty: 'key',
                  rawData: items[0]
               }),
               _source: 'targetSource',
               _sourceController: { hasMoreData: () => {}, isLoading: () => {}, getNavigation: () => {} },
               _needQuery: true
            }];
            fastFilter._items = new collection.RecordSet({
               rawData: configItems.items,
               keyProperty: 'title'
            });
            fastFilter._open('itemClick', fastFilter._configs[0]._items, 0);
            assert.isFalse(opened);

         });

         it('_private::itemsPropertiesChanged', function() {
            let oldItems = Clone(source);
            let newItems = Clone(source);
            let newItems2 = Clone(source);
            let newItems3 = Clone(source);
            let result;

            newItems[0].properties.navigation = {page: 2};
            result = filterMod.Fast._private.isNeedReload(oldItems, newItems);
            assert.isTrue(result);

            result = filterMod.Fast._private.isNeedReload(oldItems, newItems2);
            assert.isFalse(result);

            newItems3.splice(0, 1);
            result = filterMod.Fast._private.isNeedReload(oldItems, newItems3);
            assert.isTrue(result);
         });

         it('_private::getItemPopupConfig', function() {
            var properties = {
               displayProperty: 'text',
               keyProperty: 'key',
               itemTemplate: 'newItemTemplate',
               itemTemplateProperty: 'myTemplate',
               headerTemplate: 'headerTemplateText',
               footerTemplate: 'footerTemplateText',
               emptyText: 'empty text',
               multiSelect: false,
               selectorTemplate: 'selectorTemplate'
            };
            var result = filterMod.Fast._private.getItemPopupConfig(properties);
            const resultProps = {...properties};
            resultProps.footerContentTemplate = resultProps.footerTemplate;
            delete resultProps.footerTemplate;
            assert.deepEqual(result, resultProps);
         });

         it('_private::prepareItems', function() {
            var self = {};
            var items = [{ properties: { source: new history.Source({}) } }];
            filterMod.Fast._private.prepareItems(self, items);
            assert.isTrue(self._items.at(0).properties.source instanceof history.Source);
         });

         it('_private::getNewItems', function() {
            let fastData2 = getFastFilterWithItems(configItems);
            let selectedItems = new collection.RecordSet({
               keyProperty: 'key',
               rawData: [
                  { key: 1, title: 'Россия' },
                  { key: 2, title: 'США' },
                  { key: 5, title: 'Франция' }
               ]
            });
            let result = filterMod.Fast._private.getNewItems(fastData2._configs[0], selectedItems);
            assert.deepEqual(result[0], selectedItems.at(2));
         });

         it('_needShowCross', function() {
            var item = {value: 'test1', resetValue: 'test2'};
            var fastFilter = getFastFilter(config);
            assert.isTrue(fastFilter._needShowCross(item));
            item = {value: 'test1'};
            assert.isFalse(fastFilter._needShowCross(item));
            item = {value: ['test1'], resetValue: ['test1']};
            assert.isFalse(fastFilter._needShowCross(item));
         });

         it('_beforeUpdate loadNewItems by key', function(done) {
            var fastFilter = getFastFilter(configWithItems);
            fastFilter._beforeMount(configWithItems).addCallback(function(result) {
               assert.isTrue(!!result.configs);
               assert.equal(Object.keys(result.configs).length, Object.keys(fastFilter._configs).length);
               var newConfigItems = Clone(configWithItems);
               newConfigItems.items[3].value = null;
               fastFilter._configs[3].emptyText = 'Не выбрано';
               fastFilter._beforeUpdate(newConfigItems);
               assert.equal(fastFilter._items.at(3).value, null);
               assert.equal(fastFilter._items.at(3).textValue, 'Не выбрано');

               let isCallback = false;
               newConfigItems = Clone(configWithItems);
               newConfigItems.items[3].value = 'Великобритания';
               newConfigItems.items[3].properties.dataLoadCallback = () => {isCallback = true};
               fastFilter._beforeUpdate(newConfigItems).addCallback(function() {
                  assert.equal(fastFilter._items.at(3).value, 'Великобритания');
                  assert.isTrue(isCallback);
                  done();
               });
            });
         });

         it('_beforeUpdate reload new items by key', function(done) {
            var fastFilter = getFastFilter(configWithItems);
            fastFilter._beforeMount(configWithItems).addCallback(function(result) {
               let newConfigItems = Clone(configWithItems);
               newConfigItems.items[3].value = undefined;
               newConfigItems.items[2].properties.filter = {};
               fastFilter._beforeUpdate(newConfigItems).addCallback(function() {
                  assert.equal(fastFilter._configs[3]._items.getCount(), 2);

                  newConfigItems.items[3].value = 'Великобритания';
                  newConfigItems.items[3].properties.filter = {key: 1};
                  fastFilter._beforeUpdate(newConfigItems).addCallback(function() {
                     assert.equal(fastFilter._items.at(3).value, 'Великобритания');
                     assert.equal(fastFilter._configs[3]._items.getCount(), 1);
                     assert.deepEqual(fastFilter._items.at(3).properties.filter, {key: 1});
                     done();
                  });
               });
            });
         });

         describe('history', () => {
            let historySource, historyConfig;
            let fastFilter;
            const originalGetStore = Env.getStore;
            const originalSetStore = Env.setStore;
            beforeEach(function() {
               Env.getStore = (key) => {
                  return stores[key];
               };
               Env.setStore = (key, value) => {
                  stores[key] = value;
               };
               stores = {};
               historySource = new history.Source({
                  originSource: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: items[0]
                  }),
                  historySource: new history.Service({
                     historyId: 'TEST_HISTORY_ID_FAST_FILTER'
                  })
               });
               historySource._$historySource._$historyDataSource = () => {
                  return new Deferred.success();
               };
               historySource.getItems = () => {
                  return new collection.RecordSet({
                     keyProperty: 'id',
                     rawData: [{id: 1}]
                  });
               };
               historyConfig = {
                  items: [{
                     id: 'first',
                     value: 'Россия',
                     resetValue: 'все страны',
                     textValue: '',
                     properties: {
                        keyProperty: 'title',
                        displayProperty: 'title',
                        source: historySource
                     }
                  }]
               };
               fastFilter = getFastFilter(historyConfig);

            });
            it('_private::updateHistory', function(done) {
               fastFilter._beforeMount(historyConfig).addCallback(function(result) {
                  assert.isOk(result.configs);
                  assert.equal(Object.keys(result.configs).length, Object.keys(fastFilter._configs).length);

                  let selectedItems = [new entity.Model({
                     keyProperty: 'key',
                     rawData: { key: 1, title: 'Россия' }
                  })];
                  filterMod.Fast._private.updateHistory(fastFilter._configs[0], selectedItems);
                  assert.strictEqual(fastFilter._configs[0]._items.getCount(), 1);
                  done();
               });
            });

            it('_private::onSelectorResult', function(done) {
               fastFilter._beforeMount(historyConfig).addCallback(function(result) {
                  assert.isOk(result.configs);
                  assert.equal(Object.keys(result.configs).length, Object.keys(fastFilter._configs).length);

                  filterMod.Fast._private.onSelectorResult(fastFilter._configs[0], [new entity.Model({
                     keyProperty: 'key',
                     rawData: { key: 1, title: 'Россия' }
                  })]);
                  assert.strictEqual(fastFilter._configs[0]._items.getCount(), 1);

                  fastFilter._configs[0].keyProperty = 'id';
                  filterMod.Fast._private.onSelectorResult(fastFilter._configs[0], [new entity.Model({
                     keyProperty: 'key',
                     rawData: { key: 5, title: 'Китай' }
                  })]);
                  assert.isNull(fastFilter._configs[0]._sourceController);
                  assert.strictEqual(fastFilter._configs[0]._items.getCount(), 2);
                  done();
               });
            });

            it('_private::loadItemsFromSource withHistory', function(done) {
               let actualFilter;
               fastFilter._sourceController = { load: function(filter) {
                  actualFilter = filter;
                  return Deferred.success();
               } };
               filterMod.Fast._private.loadItemsFromSource(fastFilter, {filter: {}, source: historySource}).addCallback(function() {
                  assert.deepEqual(actualFilter, {$_history: true});

                  filterMod.Fast._private.loadItemsFromSource(fastFilter, {filter: {}, source: historySource}, false).addCallback(function() {
                     assert.deepEqual(actualFilter, {});
                     done();
                  });
               });
            });

            it('_private:reload', function(done) {
               filterMod.Fast._private.prepareItems(fastFilter, historyConfig.items);
               fastFilter._configs = {};
               filterMod.Fast._private.reload(fastFilter).addCallback((receivedState) => {
                  assert.isUndefined(receivedState.configs[0]._source);

                  assert.isOk(fastFilter._configs[0]._source);
                  done();
               });
            });
            afterEach(function() {
               Env.getStore = originalGetStore;
               Env.setStore = originalSetStore;
            });
         });

         function setTrue(assert) {
            assert.equal(true, true);
         }
      });
   }
);
