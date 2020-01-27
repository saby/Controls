define(
   [
      'Controls/filter',
      'Core/core-clone',
      'Types/source',
      'Types/collection',
      'Controls/history',
      'Core/Deferred',
      'Core/nativeExtensions'
   ],
   function(filter, Clone, sourceLib, collection, history, Deferred) {
      describe('Filter:View', function() {

         let defaultItems = [
            [
               {id: 1, title: 'My'},
               {id: 2, title: 'My department'}
            ],

            [
               {id: 1, title: 'In any state'},
               {id: 2, title: 'In progress'},
               {id: 3, title: 'Completed'},
               {
                  id: 4,
                  title: 'Completed positive'
               },
               {
                  id: 5,
                  title: 'Completed negative'
               },
               {id: 6, title: 'Deleted'},
               {id: 7, title: 'Drafts'}
            ]
         ];

         let defaultSource = [
            {
               name: 'document',
               value: null,
               resetValue: null,
               textValue: '',
               emptyText: 'All documents',
               editorOptions: {
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: defaultItems[0]
                  }),
                  displayProperty: 'title',
                  keyProperty: 'id'
               },
               viewMode: 'frequent'
            }, {
               name: 'state',
               value: [1],
               resetValue: [null],
               textValue: '',
               emptyText: 'all state',
               editorOptions: {
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: defaultItems[1]
                  }),
                  displayProperty: 'title',
                  keyProperty: 'id',
                  multiSelect: true
               },
               viewMode: 'frequent'
            },
            {name: 'author', value: 'Ivanov K.K.', textValue: 'Author: Ivanov K.K.', resetValue: '', viewMode: 'basic', editorOptions: {}},
            {name: 'sender', value: '', resetValue: '', viewMode: 'extended', visibility: false},
            {name: 'responsible', value: '', resetValue: '', viewMode: 'extended', visibility: false}
         ];

         let defaultConfig = {
            source: defaultSource
         };

         let getView = function (config) {
            let view = new filter.View();
            view.saveOptions(config);
            return view;
         };

         let getItems = function (items) {
            return new collection.RecordSet({
               keyProperty: 'id',
               rawData: items
            });
         };

         it('_beforeMount from receivedState', function() {
            let view = getView(defaultConfig);
            let receivedState = {
               configs: {
                  document: {
                     items: getItems(Clone(defaultItems[0])),
                     displayProperty: 'title',
                     keyProperty: 'id'},
                  state: {
                     items: getItems(Clone(defaultItems[1])),
                     displayProperty: 'title',
                     keyProperty: 'id',
                     multiSelect: true}
               }
            };
            let expectedDisplayText = {
               document: {},
               state: {text: 'In any state', title: 'In any state', hasMoreText: ''}
            };
            view._beforeMount(defaultConfig, {}, receivedState);

            assert.deepStrictEqual(view._displayText, expectedDisplayText);
            assert.strictEqual(view._filterText, 'Author: Ivanov K.K.');
            assert.isOk(view._configs.document.sourceController);
            assert.isOk(view._configs.state.sourceController);
            assert.isFalse(view._hasSelectorTemplate);

            receivedState.configs.document.selectorTemplate = 'New Template';
            view._beforeMount(defaultConfig, {}, receivedState);
            assert.isTrue(view._hasSelectorTemplate);
         });

         it('_beforeMount from options', function(done) {
            let view = getView(defaultConfig);
            let expectedDisplayText = {
               document: {},
               state: {text: 'In any state', title: 'In any state', hasMoreText: ''}
            };
            view._beforeMount(defaultConfig).addCallback(function() {
               assert.deepStrictEqual(view._displayText, expectedDisplayText);
               assert.strictEqual(view._filterText, 'Author: Ivanov K.K.');
               assert.isOk(view._configs.document.sourceController);
               assert.isOk(view._configs.state.sourceController);
               done();
            });
         });

         it('_beforeUpdate', function(done) {
            let view = getView(defaultConfig);
            view._beforeUpdate(defaultConfig);

            let expectedDisplayText = {
               document: {text: 'My', title: 'My', hasMoreText: ''},
               state: {text: 'In any state', title: 'In any state', hasMoreText: ''}
            };

            let newConfig = Clone(defaultConfig);
            newConfig.source[0].value = 1;
            newConfig.source[0].editorOptions.source = new sourceLib.Memory({
               keyProperty: 'id',
               data: Clone(defaultItems[0])
            });
            view._configs = {};
            view._displayText = {};

            //isNeedReload = true
            view._beforeUpdate(newConfig).addCallback(function() {
               assert.deepStrictEqual(view._displayText, expectedDisplayText);

               newConfig = Clone(defaultConfig);
               newConfig.source[0].value = 2;
               newConfig.source[1].value = [5];
               expectedDisplayText = {
                  document: {text: 'My department', title: 'My department', hasMoreText: ''},
                  state: {text: 'Completed negative', title: 'Completed negative', hasMoreText: ''}
               };

               //isNeedReload = false
               view._beforeUpdate(newConfig);
               assert.deepStrictEqual(view._displayText, expectedDisplayText);

               newConfig = Clone(defaultConfig);
               newConfig.source[0].viewMode = 'basic';
               newConfig.source[2].viewMode = 'frequent';
               newConfig.source[2].editorOptions.source = new sourceLib.Memory({
                  keyProperty: 'id',
                  data: defaultItems[0]
               });

               //isNeedReload = true
               view._beforeUpdate(newConfig).addCallback(function() {
                  assert.equal(Object.keys(view._configs).length, 2);
                  done();
               });
            });
         });

         it('_beforeUpdate new items length', function() {
            let view = getView(defaultConfig);
            view._beforeUpdate(defaultConfig);

            let expectedDisplayText = {
               document: {text: 'My', title: 'My', hasMoreText: ''}
            };

            let newConfig = Clone(defaultConfig);
            newConfig.source[0].value = 1;
            newConfig.source[0].editorOptions.source = new sourceLib.Memory({
               keyProperty: 'id',
               data: Clone(defaultItems[0])
            });
            view._configs = {};
            view._displayText = {};
            newConfig.source.splice(1,1);
            view._beforeUpdate(newConfig).addCallback(() => {
               assert.deepStrictEqual(view._displayText, expectedDisplayText);
            });
         });

         it('_private:reload check configs', function(done) {
            let view = getView(defaultConfig);
            view._source = defaultConfig.source;
            view._displayText = {};
            view._configs = {
               document: {
                  items: Clone(defaultItems[1]),
                  displayProperty: 'title',
                  keyProperty: 'id',
                  sourceController: 'old sourceController'},
               state: {}
            };
            filter.View._private.reload(view).addCallback(() => {
               assert.equal(view._configs.document.items.getCount(), 2);
               done();
            });
            assert.equal(view._configs.document.items.length, 7);
         });

         it ('_private.clearConfigs', function() {
            let source = Clone(defaultSource);
            source.splice(1, 1); // delete 'state' item
            let configs = {
               document: {
                  displayProperty: 'title',
                  keyProperty: 'id'
               },
               state: {
                  displayProperty: 'title',
                  keyProperty: 'id'
               }
            };
            filter.View._private.clearConfigs(source, configs);
            assert.isOk(configs['document']);
            assert.isNotOk(configs['state']);
         });

         it('_private:isNeedReload', function() {
            let oldItems = defaultConfig.source;
            let newItems = Clone(defaultConfig.source);

            let result = filter.View._private.isNeedReload(oldItems, newItems);
            assert.isFalse(result);

            newItems[0].viewMode = 'basic';
            result = filter.View._private.isNeedReload(oldItems, newItems);
            assert.isFalse(result);

            newItems[2].viewMode = 'frequent';
            result = filter.View._private.isNeedReload(oldItems, newItems);
            assert.isTrue(result);
         });

         it('openDetailPanel', function() {
            let view = getView(defaultConfig),
               popupOptions;
            view._children = {
               StickyOpener: { open: (options) => {popupOptions = options;}, isOpened: () => {return false;} }
            };
            view._container = {};
            view._options.detailPanelTemplateName = 'detailPanelTemplateName.wml';
            view._source = defaultConfig.source;

            view.openDetailPanel();

            assert.strictEqual(popupOptions.template, 'detailPanelTemplateName.wml');
            assert.strictEqual(popupOptions.templateOptions.items.length, 5);

            view._options.detailPanelTemplateName = null;
            view.openDetailPanel();
         });

         it('_openPanel', function() {
            let view = getView(defaultConfig),
               popupOptions, filterClassName = '';
            let event = {
               currentTarget: {
                  getElementsByClassName: () => [filterClassName]
               }
            };
            view._children = {
               StickyOpener: { open: (options) => {popupOptions = options;}, isOpened: () => {return false;} }
            };
            view._container = {
               0: 'filter_container',
            };
            view._options.panelTemplateName = 'panelTemplateName.wml';
            view._source = defaultConfig.source;
            view._configs = {
               document: {
                  items: Clone(defaultItems[0]),
                  displayProperty: 'title',
                  keyProperty: 'id'},
               state: {
                  items: Clone(defaultItems[1]),
                  displayProperty: 'title',
                  keyProperty: 'id',
                  multiSelect: true}
            };
            view._openPanel();

            assert.strictEqual(popupOptions.template, 'panelTemplateName.wml');
            assert.strictEqual(popupOptions.templateOptions.items.getCount(), 2);
            assert.strictEqual(popupOptions.className, 'controls-FilterView-SimplePanel__buttonTarget-popup');

            filterClassName = 'div_second_filter';
            view._openPanel(event, 'second_filter');
            assert.strictEqual(popupOptions.target, 'div_second_filter');
            assert.strictEqual(popupOptions.className, 'controls-FilterView-SimplePanel-popup');

            view._openPanel('click');
            assert.deepStrictEqual(popupOptions.target, 'filter_container');
         });

         it('_needShowFastFilter', () => {
            let view = getView({});
            let source = Clone(defaultSource);
            source[0].viewMode = 'basic';
            source[1].viewMode = 'basic';

            assert.isTrue(view._needShowFastFilter(defaultSource));
            assert.isFalse(view._needShowFastFilter(source));
         });

         it('_open', function() {
            let view = getView(defaultConfig),
               popupOptions,
               isOpened = true;
            view._children = {
               StickyOpener: { open: (options) => {popupOptions = options;}, isOpened: () => {return isOpened;} }
            };
            view._container = {};

            view._open();
            assert.strictEqual(popupOptions, undefined);

            isOpened = false;
            view._open([1, 2, 4], {template: 'templateName'});

            assert.strictEqual(popupOptions.template, 'templateName');
            assert.strictEqual(popupOptions.actionOnScroll, 'close');
            assert.deepStrictEqual(popupOptions.templateOptions.items, [1, 2, 4]);
         });

         it('_isFastReseted', function() {
            let view = getView(defaultConfig);
            view._source = defaultConfig.source;

            let isFastReseted = view._isFastReseted();
            assert.isFalse(isFastReseted);

            view._source = Clone(defaultConfig.source);
            view._source[1].value = view._source[1].resetValue;
            isFastReseted = view._isFastReseted();
            assert.isTrue(isFastReseted);
         });

         it('_reset', function() {
            let view = getView(defaultConfig),
               isOpened = true, closed,
               filterChanged, itemsChanged;
            view._children = {
               StickyOpener: { isOpened: () => {return isOpened;}, close: () => {closed = true;} }
            };
            view._notify = (event, data) => {
              if (event === 'filterChanged') {
                 filterChanged = data[0];
              } else if (event === 'itemsChanged') {
                 itemsChanged = data[0];
              }
            };
            view._displayText = {};
            view._source = Clone(defaultConfig.source);
            view._configs = {
               document: {
                  items: Clone(defaultItems[0]),
                  displayProperty: 'title',
                  keyProperty: 'id'},
               state: {
                  items: Clone(defaultItems[1]),
                  displayProperty: 'title',
                  keyProperty: 'id',
                  multiSelect: true}
            };
            let item = view._source[1];
            view._reset('clearClick', item);
            assert.deepStrictEqual(item.value, [null]);
            assert.isTrue(closed);

            isOpened = false;
            item = view._source[1];
            view._reset('clearClick', item);
            assert.deepStrictEqual(item.value, [null]);
            assert.deepStrictEqual(filterChanged, {'author': 'Ivanov K.K.'});
            assert.deepStrictEqual(view._displayText, {document: {}, state: {}});

            item = view._source[0];
            view._displayText = {};
            view._reset('clearClick', item);
            assert.deepStrictEqual(item.value, null);
            assert.deepStrictEqual(view._displayText, {document: {}, state: {}});
         });

         it('_resetFilterText', function() {
            let view = getView(defaultConfig),
               isOpened = true, closed,
               filterChanged, itemsChanged;
            view._children = {
               StickyOpener: { isOpened: () => {return isOpened;}, close: () => {closed = true;} }
            };
            view._notify = (event, data) => {
               if (event === 'filterChanged') {
                  filterChanged = data[0];
               } else if (event === 'itemsChanged') {
                  itemsChanged = data[0];
               }
            };
            view._displayText = {};
            view._source = Clone(defaultConfig.source);
            view._configs = {
               document: {
                  items: getItems(Clone(defaultItems[0])),
                  displayProperty: 'title',
                  keyProperty: 'id'},
               state: {
                  items: getItems(Clone(defaultItems[1])),
                  displayProperty: 'title',
                  keyProperty: 'id',
                  multiSelect: true}
            };
            view._resetFilterText();
            assert.isTrue(closed);
            assert.strictEqual(view._source[2].value, '');
            assert.deepStrictEqual(filterChanged, {state: [1]});
            assert.deepStrictEqual(view._displayText, {document: {}, state: {text: 'In any state', title: 'In any state', hasMoreText: ''}});

            view._source.push({
               name: 'date',
               value: [new Date(2019, 5, 1), new Date(2019, 5, 31)],
               resetValue: [new Date(2019, 7, 1), new Date(2019, 7, 31)],
               editorOptions: {
                  option1: '1',
                  option2: '2'
               },
               type: 'dateRange',
               viewMode: 'basic'
            });
            closed = false;
            view._resetFilterText();
            assert.isTrue(closed);
            assert.strictEqual(view._source[2].value, '');
            assert.deepStrictEqual(view._source[5].value, [new Date(2019, 5, 1), new Date(2019, 5, 31)]);
         });

         it('_rangeValueChangedHandler', () => {
            let source = [...defaultSource];
            let dateItem = {
               name: 'date',
               value: [new Date(2019, 7, 1), new Date(2019, 7, 31)],
               resetValue: [new Date(2019, 7, 1), new Date(2019, 7, 31)],
               editorOptions: {
                  option1: '1',
                  option2: '2'
               },
               type: 'dateRange',
               viewMode: 'basic'
            };
            source.push(dateItem);
            let view = getView(source),
               newFilter;
            view._notify = (event, data) => {
               if (event === 'filterChanged') {
                  newFilter = data[0];
               }
            };
            view._source = source;
            view._dateRangeItem = dateItem;
            view._rangeValueChangedHandler('rangeChanged', new Date(2019, 6, 1), new Date(2019, 6, 31));
            assert.deepStrictEqual(filter.View._private.getDateRangeItem(view._source).value, [new Date(2019, 6, 1), new Date(2019, 6, 31)]);
            assert.deepStrictEqual(newFilter, {
               date: [new Date(2019, 6, 1), new Date(2019, 6, 31)],
               author: 'Ivanov K.K.',
               state: [1]
            });
         });

         it('_rangeTextChangedHandler', () => {
            let source = [...defaultSource];
            let dateItem = {
               name: 'date',
               value: [new Date(2019, 7, 1), new Date(2019, 7, 31)],
               resetValue: [new Date(2019, 7, 1), new Date(2019, 7, 31)],
               editorOptions: {
                  option1: '1',
                  option2: '2'
               },
               type: 'dateRange',
               viewMode: 'basic'
            };
            source.push(dateItem);
            let view = getView(source);
            view._source = source;
            view._dateRangeItem = dateItem;
            view._rangeTextChangedHandler('rangeChanged', 'Date textValue');
            assert.deepStrictEqual(filter.View._private.getDateRangeItem(view._source).textValue, 'Date textValue');
         });

         it('_private:getDateRangeItem', () => {
            let source = [...defaultSource];
            let dateItem = {
               name: 'date',
               value: [new Date(2019, 7, 1), new Date(2019, 7, 31)],
               resetValue: [new Date(2019, 7, 1), new Date(2019, 7, 31)],
               editorOptions: {
                  option1: '1',
                  option2: '2'
               },
               type: 'dateRange',
               viewMode: 'basic'
            };
            source.push(dateItem);
            let item = filter.View._private.getDateRangeItem(source);
            assert.deepStrictEqual(item, dateItem)
         });

         it('_private:updateText filterText', function() {
            let source = [
               {name: 'date', type: 'dateRange', value: [new Date(2019, 7, 1), new Date(2019, 7, 31)], textValue: "July'19", resetValue: [new Date(2019, 6, 1), new Date(2019, 6, 31)], viewMode: 'basic'},
               {name: 'author', value: 'Ivanov K.K.', textValue: 'Author: Ivanov K.K.', resetValue: '', viewMode: 'basic'},
               {name: 'sender', value: 'Vasiliev A.A.', textValue: 'Sender: Vasiliev A.A.', resetValue: '', viewMode: 'extended', visibility: false},
               {name: 'responsible', value: 'test_extended', resetValue: '', textValue: 'test_extended', viewMode: 'extended', visibility: true},
               {name: 'frequent', value: 'test_frequent', textValue: 'test_frequent', resetValue: '', viewMode: 'frequent'}
            ];
            let self = {};
            filter.View._private.updateText(self, source, {});
            assert.strictEqual(self._filterText, 'Author: Ivanov K.K., test_extended');
         });

         it('_private:getFastText', function() {
            let config = {
               displayProperty: 'title',
               keyProperty: 'id',
               emptyText: 'empty text',
               emptyKey: 'empty',
               items: new collection.RecordSet({
                  rawData: [
                     {id: null, title: 'Reset'},
                     {id: '1', title: 'Record 1'},
                     {id: '2', title: 'Record 2'},
                     {id: '3', title: 'Record 3'}
                  ]
               })
            };
            let display = filter.View._private.getFastText(config, [null]);
            assert.strictEqual(display.text, 'Reset');

            display = filter.View._private.getFastText(config, ['empty']);
            assert.strictEqual(display.text, 'empty text');
         });

         it('_private:getKeysUnloadedItems', function() {
            let config = {
               displayProperty: 'title',
               keyProperty: 'id',
               emptyText: 'empty text',
               emptyKey: 'empty',
               items: new collection.RecordSet({
                  rawData: [
                     {id: '1', title: 'Record 1'},
                     {id: '2', title: 'Record 2'},
                     {id: '3', title: 'Record 3'}
                  ]
               })
            };
            let keys = filter.View._private.getKeysUnloadedItems(config, null);
            assert.strictEqual(keys[0], null);

            keys = filter.View._private.getKeysUnloadedItems(config, 'empty');
            assert.isFalse(!!keys.length);
         });

         it('_private:resolveItems', function() {
            let date = new Date();
            date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_TIME);
            let self = {};
            filter.View._private.resolveItems(self, [date]);
            assert.strictEqual(self._source[0].getSQLSerializationMode(), date.getSQLSerializationMode());
         });

         it('_private:resolveItems check _hasResetValues', function() {
            let self = {};
            let items = [
               {name: '1', value: '', resetValue: null},
               {name: '2', value: '', resetValue: undefined}
            ];
            filter.View._private.resolveItems(self, items);
            assert.isTrue(self._hasResetValues);

            items = [
               {name: '1', value: ''},
               {name: '2', value: ''}
            ];
            filter.View._private.resolveItems(self, items);
            assert.isFalse(self._hasResetValues);
         });

         it('_private:getFolderIds', function() {
            const items = new collection.RecordSet({
               rawData: [
                  {key: '1', title: 'In any state', node: true, parent: null},
                  {key: '2', title: 'In progress', node: false, parent: 1},
                  {key: '3', title: 'Completed', node: false, parent: 1},
                  {key: '4', title: 'Completed positive', node: true, parent: 1},
                  {key: '5', title: 'Completed positive', node: true}
               ],
               keyProperty: 'key'
            });
            const folders = filter.View._private.getFolderIds({
               items: items,
               nodeProperty: 'node',
               parentProperty: 'parent',
               keyProperty: 'key'
            });
            assert.deepStrictEqual(folders, ['1', '5']);
         });

         it('_private:loadSelectedItems', function(done) {
            let source = [...defaultSource];
            source[1].value = [1];
            source[1].editorOptions.dataLoadCallback = () => {isDataLoad = true};
            let isDataLoad;
            let configs = {
               document: {
                  items: new collection.RecordSet({
                     rawData: Clone(defaultItems[0]),
                     keyProperty: 'id'
                  }),
                  source: source[0].editorOptions.source,
                  emptyText: 'All documents',
                  emptyKey: null,
                  displayProperty: 'title',
                  keyProperty: 'id'},
               state: {
                  items: new collection.RecordSet({
                     rawData: defaultItems[1].slice(1),
                     keyProperty: 'id'
                  }),
                  source: source[1].editorOptions.source,
                  emptyText: 'all state',
                  emptyKey: null,
                  sourceController: {hasMoreData: () => {return true;}},
                  displayProperty: 'title',
                  keyProperty: 'id',
                  multiSelect: true}
            };
            assert.strictEqual(configs['state'].items.getCount(), 6);
            filter.View._private.loadSelectedItems(source, configs).addCallback(() => {
               assert.strictEqual(configs['state'].popupItems.getCount(), 6);
               assert.strictEqual(configs['state'].items.getCount(), 7);
               assert.deepStrictEqual(configs['state'].items.at(0).getRawData(), {id: 1, title: 'In any state'});
               assert.isTrue(isDataLoad);
               done();
            });
         });

         it('_private:setValue', function() {
            let view = getView(defaultConfig);
            view._source = [
               {
                  name: 'document',
                  value: '',
                  resetValue: false,
                  emptyText: 'Test',
                  emptyKey: null
               }
            ];
            view._configs = {
               document: {
                  items: Clone(defaultItems[0]),
                  displayProperty: 'title',
                  keyProperty: 'id',
                  emptyText: 'Test',
                  emptyKey: null,
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: defaultItems[0]
                  })
               }
            };
            filter.View._private.setValue(view, [null], 'document');
            assert.strictEqual(view._source[0].value, null);

            // emptyKey is not set
            view._source = [
               {
                  name: 'document',
                  value: '',
                  resetValue: false,
                  emptyText: 'Test'
               }
            ];
            view._configs = {
               document: {
                  items: Clone(defaultItems[0]),
                  displayProperty: 'title',
                  keyProperty: 'id',
                  emptyText: 'Test',
                  emptyKey: null,
                  source: new sourceLib.Memory({
                     idProperty: 'id',
                     data: defaultItems[0]
                  })
               }
            };
            filter.View._private.setValue(view, [null], 'document');
            assert.strictEqual(view._source[0].value, false);

            view._source[0].resetValue = [];
            filter.View._private.setValue(view, [null], 'document');
            assert.deepEqual(view._source[0].value, []);
         });

         it('_private:getPopupConfig', function() {
            let isLoading = false;
            let source = Clone(defaultSource);
            source[0].editorOptions.itemTemplate = 'new';
            let configs = {
               document: {
                  items: Clone(defaultItems[0]),
                  itemTemplate: 'old',
                  keyProperty: 'id',
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: defaultItems[0]
                  })
               },
               state: {
                  items: Clone(defaultItems[1]),
                  sourceController: {
                     load: () => {
                        isLoading = true; return Deferred.success();
                     },
                     hasMoreData: () => {return true;}},
                  displayProperty: 'title',
                  keyProperty: 'id',
                  multiSelect: true}
            };

            let self = {
               _children: {},
               _onSelectorTemplateResult: () => {}
            };

            let resultItems = filter.View._private.getPopupConfig(self, configs, source);
            assert.isTrue(isLoading);
            assert.equal(resultItems[0].displayProperty, 'title');
            assert.equal(resultItems[0].itemTemplate, 'new');
         });

         it('_beforeUpdate loadSelectedItems', function(done) {
            let filterView = getView(defaultConfig);
            let source = [...defaultSource];
            source[1].value = [1];
            let configs = {
               document: {
                  items: new collection.RecordSet({
                     rawData: Clone(defaultItems[0]),
                     keyProperty: 'id'
                  }),
                  source: source[0].editorOptions.source,
                  sourceController: {hasMoreData: () => {return false;}},
                  displayProperty: 'title',
                  keyProperty: 'id'},
               state: {
                  items: new collection.RecordSet({
                     rawData: defaultItems[1].slice(1),
                     keyProperty: 'id'
                  }),
                  source: source[1].editorOptions.source,
                  sourceController: {hasMoreData: () => {return false;}},
                  displayProperty: 'title',
                  keyProperty: 'id',
                  multiSelect: true}
            };
            filterView._configs = configs;
            filterView._displayText = {};
            filterView._beforeUpdate({source: source}).addCallback(() => {
               assert.strictEqual(configs['state'].popupItems.getCount(), 7);
               assert.strictEqual(configs['state'].items.getCount(), 7);
               assert.deepStrictEqual(configs['state'].items.at(0).getRawData(), {id: 1, title: 'In any state'});
               done();
            });
         });

         it('_beforeUnmount', function() {
            let view = getView(defaultConfig);

            view._beforeMount(defaultConfig);
            assert.isOk(view._configs);
            assert.isOk(view._loadDeferred);

            view._beforeUnmount();
            assert.isNull(view._configs);
            assert.isNull(view._loadDeferred);
         });

         describe('View::resultHandler', function() {
            let view;
            beforeEach(function() {
               view = getView(defaultConfig);
               view._displayText = {};
               view._source = Clone(defaultConfig.source);
               view._configs = {
                  document: {
                     items: getItems(Clone(defaultItems[0])),
                     displayProperty: 'title',
                     keyProperty: 'id',
                     sourceController: {hasMoreData: () => {return true;}}
                  },
                  state: {
                     items: getItems(Clone(defaultItems[1])),
                     displayProperty: 'title',
                     keyProperty: 'id',
                     multiSelect: true,
                     sourceController: {hasMoreData: () => {return true;}}
                  }
               };
               view._children = {
                  StickyOpener: { close: () => {} }
               };
            });

            it('_resultHandler itemClick', function() {
               let filterChanged;
               view._notify = (event, data) => {
                  if (event === 'filterChanged') {
                     filterChanged = data[0];
                  }
               };
               let eventResult = {
                  action: 'itemClick',
                  id: 'state',
                  selectedKeys: [2]
               };
               view._resultHandler('resultEvent', eventResult);
               assert.deepStrictEqual(view._source[1].value, [2]);
               assert.deepStrictEqual(view._displayText, {document: {}, state: {text: 'In progress', title: 'In progress', hasMoreText: ''}});
               assert.deepStrictEqual(filterChanged, {'author': 'Ivanov K.K.', state: [2]});

               eventResult.selectedKeys = [null];
               view._resultHandler('resultEvent', eventResult);
               assert.deepStrictEqual(view._source[1].value, defaultSource[1].resetValue);
               assert.deepStrictEqual(view._displayText, {document: {}, state: {}});
               assert.deepStrictEqual(filterChanged, {'author': 'Ivanov K.K.'});
            });

            it('_resultHandler applyClick', function() {
               let filterChanged;
               view._notify = (event, data) => {
                  if (event === 'filterChanged') {
                     filterChanged = data[0];
                  }
               };
               let eventResult = {
                  action: 'applyClick',
                  selectedKeys: { state: [1, 2] }
               };
               view._resultHandler('resultEvent', eventResult);
               assert.deepStrictEqual(view._source[1].value, [1, 2]);
               assert.deepStrictEqual(view._displayText, {document: {}, state: {text: 'In any state', title: 'In any state, In progress', hasMoreText: ', еще 1'}});
               assert.deepStrictEqual(filterChanged, {'author': 'Ivanov K.K.', state: [1, 2]});
            });

            it('_resultHandler selectorResult', function() {
               let filterChanged;
               view._notify = (event, data) => {
                  if (event === 'filterChanged') {
                     filterChanged = data[0];
                  }
               };
               view._configs.state.items = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: Clone(defaultItems[1])
               });
               let newItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{id: 3, title: 'Completed'}, {id: 20, title: 'new item'}, {id: 28, title: 'new item 2'}]
               });
               let eventResult = {
                  action: 'selectorResult',
                  id: 'state',
                  data: newItems
               };
               view._resultHandler('resultEvent', eventResult);
               assert.deepStrictEqual(view._source[1].value, [3, 20, 28]);
               assert.deepStrictEqual(view._displayText, {document: {}, state: {text: 'Completed', title: 'Completed, new item, new item 2', hasMoreText: ', еще 2'}});
               assert.deepStrictEqual(filterChanged, {'author': 'Ivanov K.K.', state: [3, 20, 28]});
               assert.strictEqual(view._configs.state.items.getCount(), 9);

               newItems = new collection.RecordSet({
                  keyProperty: 'key',
                  rawData: [{key: 15, text: 'Completed'}] // without id field
               });
               eventResult.data = newItems;
               view._resultHandler('resultEvent', eventResult);
               assert.strictEqual(view._configs.state.items.getCount(), 9);
            });

            it('selectorResult selectorCallback', function() {
               let filterChanged;
               view._notify = (event, data) => {
                  if (event === 'selectorCallback') {
                     data[1].at(0).set({id: 11, title: 'item 11'});
                  }
               };
               view._configs.state.items = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: Clone(defaultItems[1])
               });
               view._idOpenSelector = 'state';
               let newItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{id: 3, title: 'Completed'}, {id: 20, title: 'new item'}, {id: 28, title: 'new item 2'}]
               });
               view._onSelectorTemplateResult('event', newItems);
               assert.deepStrictEqual(view._source[1].value, [11, 20, 28]);
               assert.deepStrictEqual(view._displayText, {document: {}, state: {text: 'item 11', title: 'item 11, new item, new item 2', hasMoreText: ', еще 2'}});
            });

            it('_resultHandler filterDetailPanelResult', function() {
               let filterChanged;
               let historyEventFired;

               view._notify = (event, data) => {
                  if (event === 'filterChanged') {
                     filterChanged = data[0];
                  }
                  if (event === 'historyApply') {
                     historyEventFired = true;
                  }
               };
               view._source = [{name: 'author', value: '', textValue: 'Author: Ivanov K.K.', resetValue: '', viewMode: 'basic'},
                  {name: 'sender', value: 'Sander123', resetValue: '', viewMode: 'extended', visibility: false},
                  {name: 'responsible', value: '', resetValue: '', viewMode: 'extended', visibility: false},
                  {name: 'document', value: '11111', resetValue: '', textValue: 'new document', viewMode: 'frequent', visibility: false}];

               let eventResult = {
                  id: 'state',
                  items: [{ id: 'author', value: '', textValue: 'Author: Ivanov K.K.'},
                     { id: 'sender', value: 'Sander123', visibility: false },
                     { id: 'responsible', value: '', visibility: false },
                     { id: 'document', value: '11111', resetValue: '', textValue: 'new document', visibility: false }],
                  history: [{ test: 'test' }]
               };
               view._resultHandler('resultEvent', eventResult);
               assert.deepStrictEqual(view._source[1].value, 'Sander123');
               assert.deepStrictEqual(view._source[1].viewMode, 'extended');
               assert.deepStrictEqual(view._source[3].textValue, 'new document');
               assert.deepStrictEqual(filterChanged, {'document': '11111', 'sender': 'Sander123'});
               assert.deepStrictEqual(view._displayText, {document: { hasMoreText: '', text: 'new document', title: ''}});
               assert.isTrue(historyEventFired);
            });

            it('_onSelectorTemplateResult', function() {
               let filterChanged;
               view._notify = (event, data) => {
                  if (event === 'filterChanged') {
                     filterChanged = data[0];
                  }
               };
               view._configs.state.items = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: Clone(defaultItems[1])
               });
               let newItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{id: 3, title: 'Completed'}, {id: 20, title: 'new item'}, {id: 28, title: 'new item 2'}]
               });
               view._idOpenSelector = 'state';
               view._onSelectorTemplateResult('resultEvent', newItems);
               assert.deepStrictEqual(view._source[1].value, [3, 20, 28]);
               assert.deepStrictEqual(view._displayText, {document: {}, state: {text: 'Completed', title: 'Completed, new item, new item 2', hasMoreText: ', еще 2'}});
               assert.deepStrictEqual(filterChanged, {'author': 'Ivanov K.K.', state: [3, 20, 28]});
            });
         });

         describe('View hierarchyList', function() {
            let view;
            beforeEach(function() {
               let documentItems = [
                  {id: -1, title: 'Folder 1', node: true},
                  {id: -2, title: 'Folder 2', node: true},
                  {id: 1, title: 'In any state', parent: -1},
                  {id: 2, title: 'In progress', parent: -1},
                  {id: 3, title: 'Completed', parent: -1},
                  {id: 4, title: 'Deleted', parent: -2},
                  {id: 5, title: 'Drafts', parent: -2}
               ];
               let hierarchySource = [
                  {
                     name: 'document',
                     value: {'-1': [-1], '-2': []},
                     resetValue: [],
                     textValue: '',
                     emptyText: 'All documents',
                     editorOptions: {
                        source: new sourceLib.Memory({
                           keyProperty: 'id',
                           data: documentItems
                        }),
                        displayProperty: 'title',
                        keyProperty: 'id',
                        nodeProperty: 'node',
                        parentProperty: 'parent',
                        multiSelect: true
                     },
                     viewMode: 'frequent'
                  }
               ];
               view = getView({source: hierarchySource});
               view._displayText = {};
               view._source = Clone(hierarchySource);
               view._configs = {
                  document: {
                     items: new collection.RecordSet({
                        keyProperty: 'id',
                        rawData: documentItems
                     }),
                     displayProperty: 'title',
                     keyProperty: 'id',
                     nodeProperty: 'node',
                     parentProperty: 'parent',
                     multiSelect: true,
                     sourceController: {hasMoreData: () => {return true;}}
                  }
               };
               view._children = {
                  StickyOpener: { close: () => {} }
               };
            });

            it ('updateText', function () {
               filter.View._private.updateText(view, view._source, view._configs);
               assert.deepStrictEqual(view._displayText.document, {text: 'Folder 1', title: 'Folder 1', hasMoreText: '' });
            });

            it ('applyClick', function () {
               let filterChanged;
               view._notify = (event, data) => {
                  if (event === 'filterChanged') {
                     filterChanged = data[0];
                  }
               };
               let eventResult = {
                  action: 'applyClick',
                  selectedKeys: { document: {'-1': [1, 2], '-2': [-2, 4]} }
               };
               view._resultHandler('resultEvent', eventResult);
               assert.deepStrictEqual(view._source[0].value, {'-1': [1, 2], '-2': [-2]});
               assert.deepStrictEqual(view._displayText.document, {text: 'In any state', title: 'In any state, In progress, Folder 2', hasMoreText: ', еще 2' });
               assert.deepStrictEqual(filterChanged, {document: {'-1': [1, 2], '-2': [-2]}});

               eventResult = {
                  action: 'applyClick',
                  selectedKeys: { document: {'-1': [], '-2': []} }
               };
               view._resultHandler('resultEvent', eventResult);
               assert.deepStrictEqual(view._source[0].value, []);
               assert.deepStrictEqual(view._displayText.document, {});

               eventResult = {
                  action: 'applyClick',
                  selectedKeys: { document: {'-2': [4]} }
               };
               view._resultHandler('resultEvent', eventResult);
               assert.deepStrictEqual(view._source[0].value, {'-1': [], '-2': [4]});
               assert.deepStrictEqual(view._displayText.document, {text: 'Deleted', title: 'Deleted', hasMoreText: '' });
            });

            it ('moreButtonClick', function () {
               let filterChanged, isClosed;
               view._notify = (event, data) => {
                  if (event === 'filterChanged') {
                     filterChanged = data[0];
                  }
               };
               let eventResult = {
                  action: 'moreButtonClick',
                  id: 'document'
               };
               view._children = {
                  StickyOpener: { close: () => {isClosed = true;} }
               };
               view._resultHandler('resultEvent', eventResult);
               assert.strictEqual(view._idOpenSelector, 'document');
               assert.isTrue(isClosed);
            });
         });

         describe('View history', function() {
            let view, hSource;
            beforeEach(function() {
               view = getView(defaultConfig);
               view._source = Clone(defaultConfig.source);
               view._displayText = {};
               view._source = Clone(defaultConfig.source);
               view._configs = {
                  document: {
                     items: Clone(defaultItems[0]),
                     displayProperty: 'title',
                     keyProperty: 'id'
                  },
                  state: {}
               };
               view._children = {
                  StickyOpener: { close: () => {} }
               };
               hSource = new history.Source({
                  originSource: new sourceLib.Memory({
                     keyProperty: 'key',
                     data: []
                  }),
                  historySource: new history.Service({
                     historyId: 'TEST_HISTORY_ID'
                  })
               });

            });

            it('_private:updateHistory', function() {
               let resultHistoryItems, resultMeta;
               hSource.update = (historyItems, meta) => {
                  resultHistoryItems = historyItems;
                  resultMeta = meta;
               };
               view._source[0].editorOptions.source = hSource;
               let items = [{key: 1}];
               filter.View._private.updateHistory(view, 'document', items);
               assert.deepEqual(resultHistoryItems, items);
               assert.deepEqual(resultMeta, {$_history: true});
            });

            it('_private:reload', function(done) {
               view._source[0].editorOptions.source = hSource;
               filter.View._private.reload(view).addCallback((receivedState) => {
                  assert.isUndefined(receivedState.configs.document.source);
                  assert.isOk(receivedState.configs.state.source);

                  assert.isOk(view._configs.document.source);
                  assert.isOk(view._configs.state.source);
                  done();
               });
            });

            it('_private:getPopupConfig historySource', function() {
               hSource.prepareItems = () => {
                  return new collection.RecordSet({ rawData: Clone(defaultItems[1]) });
               };
               hSource.originSource = new sourceLib.Memory({
                  keyProperty: 'key',
                  data: defaultItems[0]
               });
               view._source[0].editorOptions.source = hSource;
               view._configs.document.sourceController = {
                  load: () => {return Deferred.success();},
                  hasMoreData: () => {return true;}
               };
               let resultItems = filter.View._private.getPopupConfig(view, view._configs, view._source);
               assert.isOk(resultItems[0].loadDeferred);

               const sandBox = sinon.createSandbox();
               sandBox.stub(filter.View._private, 'loadItemsFromSource').returns({
                  isReady: () => {return false;}
               });

               filter.View._private.getPopupConfig(view, view._configs, view._source);
               sinon.assert.calledOnce(filter.View._private.loadItemsFromSource);
               sandBox.restore();
            });
         });
      });
   }
);
