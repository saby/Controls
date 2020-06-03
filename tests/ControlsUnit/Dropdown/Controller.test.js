define(
   [
      'Controls/dropdown',
      'Types/source',
      'Core/core-clone',
      'Types/collection',
      'Controls/history',
      'Core/Deferred',
      'Types/entity',
      'Core/core-instance',
      'Controls/popup'
   ],
   (dropdown, sourceLib, clone, collection, history, Deferred, entity, cInstance, popup) => {
      describe('Dropdown/Controller', () => {
         let items = [
            {
               id: '1',
               title: 'Запись 1'
            },
            {
               id: '2',
               title: 'Запись 2'
            },
            {
               id: '3',
               title: 'Запись 3',
               icon: 'icon-16 icon-Admin icon-primary'
            },
            {
               id: '4',
               title: 'Запись 4'
            },
            {
               id: '5',
               title: 'Запись 5'
            },
            {
               id: '6',
               title: 'Запись 6',
               node: true
            },
            {
               id: '7',
               title: 'Запись 7'
            },
            {
               id: '8',
               title: 'Запись 8'
            }
         ];

         let itemsRecords = new collection.RecordSet({
            keyProperty: 'id',
            rawData: clone(items)
         });

         let config = {
            selectedKeys: [2],
            keyProperty: 'id',
            emptyText: true,
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            }),
            nodeProperty: 'node',
            itemTemplateProperty: 'itemTemplate'

         };

         let configLazyLoad = {
            lazyItemsLoading: true,
            selectedKeys: [2],
            keyProperty: 'id',
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            })
         };

         let getDropdownController = function(config) {
            let dropdownCntroller = new dropdown._Controller(config);
            dropdownCntroller.saveOptions(config);
            return dropdownCntroller;
         };

         let sandbox;

         beforeEach(function() {
            sandbox = sinon.createSandbox();
         });

         afterEach(function() {
            sandbox.restore();
         });

         it('before mount', (done) => {
            let newConfig = clone(config),
               loadedItems;
            newConfig.dataLoadCallback = (items) => {loadedItems = items;};
            let dropdownController = getDropdownController(newConfig);
            dropdownController._beforeMount(newConfig).then((beforeMountResult) => {
               assert.deepEqual(beforeMountResult.items.getRawData(), itemsRecords.getRawData());
               assert.deepEqual(loadedItems.getRawData(), itemsRecords.getRawData());

               newConfig.historyId = 'TEST_HISTORY_ID';
               dropdownController._beforeMount(newConfig).then((res) => {
                  assert.isTrue(res.hasOwnProperty('history'));

                  newConfig.selectedKeys = [];
                  let history = {
                     frequent: [],
                     pinned: [],
                     recent: []
                  };
                  dropdownController._beforeMount(newConfig, {}, { history: history, items: itemsRecords.clone() }).then((historyRes) => {
                     assert.deepEqual(dropdownController._source._oldItems.getRawData(), itemsRecords.getRawData());
                     assert.deepEqual(dropdownController._source.getHistory(), history);
                     done();
                     return historyRes;
                  });

                  return res;
               });
            });
         });

         it('dataLoadCallback', (done) => {
            let newConfig = clone(config),
               selectedItems;
            newConfig.dataLoadCallback = (items) => {items.assign(itemsRecords.clone());};
            newConfig.selectedItemsChangedCallback = (items) => {selectedItems = items;};
            newConfig.selectedKeys = ['2'];
            newConfig.navigation = {view: 'page', source: 'page', sourceConfig: {pageSize: 1, page: 0, hasMore: false}};
            let dropdownController = getDropdownController(newConfig);
            dropdownController._beforeMount(newConfig).addCallback(function(beforeMountResult) {
               assert.deepEqual(beforeMountResult.items.getRawData(), itemsRecords.getRawData());
               assert.deepEqual(selectedItems[0].getRawData(), itemsRecords.at(1).getRawData());
               done();
            });
         });

         it('before mount navigation', (done) => {
            let navigationConfig = clone(config);
            navigationConfig.navigation = {view: 'page', source: 'page', sourceConfig: {pageSize: 2, page: 0, hasMore: false}};
            let dropdownController = getDropdownController(navigationConfig);
            dropdownController._beforeMount(navigationConfig).addCallback(function(beforeMountResult) {
               assert.deepEqual(beforeMountResult.items.getCount(), 2);
               done();
            });
         });

         it('_keyDown', function() {
            let dropdownController = getDropdownController(config),
               closed = false, isStopped = false;
            popup.Sticky.closePopup = () => {closed = true; };
            let event = {
               nativeEvent: {
                  keyCode: 28
               },
               stopPropagation: () => {isStopped = true;}
            };

            // Тестируем нажатие не esc
            dropdownController._keyDown(event);
            assert.isFalse(closed);
            assert.isFalse(isStopped);

            // Тестируем нажатие esc, когда выпадающий список открыт
            isStopped = false;
            dropdownController._popupId = 'test';
            event.nativeEvent.keyCode = 27;
            dropdownController._keyDown(event);
            assert.isTrue(closed);
            assert.isTrue(isStopped);

            // Тестируем нажатие esc, когда выпадающий список закрыт
            dropdownController._popupId = null;
            isOpened = false;

            isStopped = false;
            closed = false;
            event.nativeEvent.keyCode = 27;
            dropdownController._keyDown(event);
            assert.isFalse(closed);
            assert.isFalse(isStopped);
         });

         it('before mount filter', (done) => {
            let filterConfig = clone(config);
            filterConfig.filter = {id: ['3', '4']};
            let dropdownController = getDropdownController(filterConfig);
            dropdownController._beforeMount(filterConfig).addCallback(function(beforeMountResult) {
               assert.deepEqual(beforeMountResult.items.getCount(), 2);
               done();
            });
         });

         it('check received state', () => {
            let dropdownController = getDropdownController(config);
            return dropdownController._beforeMount(config, null, { items: itemsRecords.clone() }).then(() => {
               assert.deepEqual(dropdownController._items.getRawData(), itemsRecords.getRawData());
            });
         });

         it('received state, selectedItems = [null], emptyText is set', () => {
            let selectedItemsChangeCalled = false,
               selectedItems = [];
            const config = {
               selectedKeys: [null],
               keyProperty: 'id',
               emptyText: '123',
               selectedItemsChangedCallback: function(items) {
                  selectedItems = items;
                  selectedItemsChangeCalled = true;
               },
               source: new sourceLib.Memory({
                  keyProperty: 'id',
                  data: items
               })
            };
            const dropdownController = getDropdownController(config);
            return dropdownController._beforeMount(config, null, itemsRecords.clone()).then(() => {
               assert.deepEqual(selectedItems, [null]);
               assert.isTrue(selectedItemsChangeCalled);
            });
         });

         it('received state, selectedItems = [null], emptyText is NOT set', () => {
            let selectedItemsChangeCalled = false,
               selectedItems = [];
            const config = {
               selectedKeys: [null],
               keyProperty: 'id',
               selectedItemsChangedCallback: function(items) {
                  selectedItems = items;
                  selectedItemsChangeCalled = true;
               },
               source: new sourceLib.Memory({
                  keyProperty: 'id',
                  data: items
               })
            };
            const dropdownController = getDropdownController(config);
            return dropdownController._beforeMount(config, null, itemsRecords.clone()).then(() => {
               assert.deepEqual(selectedItems, []);
               assert.isTrue(selectedItemsChangeCalled);
            });
         });

         describe('_beforeUpdate', function() {
            let dropdownController, opened, updatedItems;
            beforeEach(function() {
               opened = false;
               dropdownController = getDropdownController(config);
               popup.Sticky.openPopup = () => {opened = true;};

               updatedItems = clone(items);
               updatedItems.push({
                  id: '9',
                  title: 'Запись 9'
               });
            });

            it('new templateOptions', function() {
               dropdownController._loadItemsTempPromise = {};
               dropdownController._beforeUpdate({ ...config, headTemplate: 'headTemplate.wml', source: undefined });
               assert.isNull(dropdownController._loadMenuTempPromise);
               assert.isFalse(opened);

               dropdownController._open = function() {
                  opened = true;
               };

               dropdownController._isOpened = true;
               dropdownController._items = itemsRecords.clone();
               dropdownController._source = 'testSource';
               dropdownController._sourceController = {hasMoreData: ()=>{}};
               dropdownController._beforeUpdate({ ...config, headTemplate: 'headTemplate.wml', source: undefined })
               assert.isTrue(opened);
            });

            it('new source', () => {
               dropdownController._items = itemsRecords.clone();
               dropdownController._source = true;

               return new Promise((resolve) => {
                  dropdownController._beforeUpdate({
                     selectedKeys: [2],
                     keyProperty: 'id',
                     source: new sourceLib.Memory({
                        keyProperty: 'id',
                        data: updatedItems
                     })
                  }).addCallback(() => {
                     assert.equal(dropdownController._items.getCount(), updatedItems.length);
                     assert.isTrue(cInstance.instanceOfModule(dropdownController._source, 'Types/source:Base'));
                     assert.isFalse(opened);
                     resolve();
                  });
               });
            });

            it('new source when items is loading', () => {
               dropdownController._items = itemsRecords.clone();
               dropdownController._source = true;
               dropdownController._sourceController = { isLoading: () => true };
               dropdownController._beforeUpdate({
                  selectedKeys: [2],
                  keyProperty: 'id',
                  lazyItemsLoading: true,
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: updatedItems
                  })
               });
               assert.isTrue(dropdownController._source);
               assert.isNull(dropdownController._items);
            });

            it('new source and selectedKeys', () => {
               dropdownController._items = itemsRecords.clone();
               dropdownController._source = true;

               let stub = sandbox.stub(dropdown._Controller._private, 'updateSelectedItems');
               return new Promise((resolve) => {
                  dropdownController._beforeUpdate({
                     selectedKeys: [3],
                     keyProperty: 'id',
                     source: new sourceLib.Memory({
                        keyProperty: 'id',
                        data: updatedItems
                     })
                  }).addCallback(() => {
                     assert.equal(dropdownController._items.getCount(), updatedItems.length);
                     sinon.assert.calledOnce(stub);
                     resolve();
                  });
               });
            });
            it('new source and dropdown is open', () => {
               dropdownController._items = itemsRecords.clone();
               dropdownController._isOpened = true;
               dropdownController._sourceController = { hasMoreData: () => {}, isLoading: () => {} };
               dropdownController._open = function() {
                  opened = true;
               };
               dropdownController._beforeUpdate({
                  selectedKeys: [2],
                  keyProperty: 'id',
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: updatedItems
                  })
               }).addCallback(() => {
                  assert.isTrue(opened);
               });
            });

            it('change filter', (done) => {
               let configFilter = clone(config),
                  selectedItems = [];
               configFilter.selectedKeys = ['2'];
               configFilter.selectedItemsChangedCallback = function(items) {
                  selectedItems = items;
               };

               dropdownController._beforeUpdate({...configFilter}).addCallback(function(result) {
                  assert.deepStrictEqual(selectedItems[0].getRawData(), itemsRecords.at(1).getRawData());
                  done();
               });
            });

            it('without loaded items', () => {
               let configItems = clone(config),
                  selectedItems = [];
               configItems.selectedItemsChangedCallback = function(items) {
                  selectedItems = items;
               };
               dropdownController._items = null;
               var newConfig = clone(configItems);
               newConfig.source = new sourceLib.Memory({
                  keyProperty: 'id',
                  data: items
               });
               newConfig.selectedKeys = ['4'];
               return dropdownController._beforeUpdate(newConfig).then(function() {
                  assert.equal(selectedItems.length, 1);
               });
            });

            it('change source, lazyItemsLoading = true', (done) => {
               dropdownController._beforeMount(configLazyLoad);
               dropdownController._sourceController = { isLoading: () => false };
               items.push({
                  id: '5',
                  title: 'Запись 11'
               });

               dropdownController._beforeUpdate({
                  lazyItemsLoading: true,
                  selectedKeys: [2],
                  keyProperty: 'id',
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: items
                  })
               });
               assert.isNull(dropdownController._sourceController);
               assert.equal(dropdownController._items, null);

               dropdownController._isOpened = true;
               dropdownController._beforeUpdate({
                  lazyItemsLoading: true,
                  selectedKeys: [2],
                  keyProperty: 'id',
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: items
                  })
               }).addCallback(function() {
                  assert.isOk(dropdownController._sourceController);
                  done();
               });
            });

            it('change selectedKeys', () => {
               let selectedItems = [];
               let selectedItemsChangedCallback = function(items) {
                  selectedItems = items;
               };
               dropdownController._items = itemsRecords.clone();
               dropdownController._beforeUpdate({
                  selectedKeys: [6],
                  keyProperty: 'id',
                  filter: config.filter,
                  selectedItemsChangedCallback: selectedItemsChangedCallback
               });
               assert.deepEqual(selectedItems[0].getRawData(), items[5]);
            });

            it('change readOnly', () => {
               let readOnlyConfig = clone(config),
                  isClosed = false;

               popup.Sticky.closePopup = () => {isClosed = true; };
               readOnlyConfig.readOnly = true;
               dropdownController._beforeUpdate(readOnlyConfig);
               assert.isTrue(isClosed);
            });
         });

         it('notify footerClick', () => {
            let dropdownController = getDropdownController(config);
            let isClosed = false, isFooterClicked = false;
            dropdownController._beforeMount(configLazyLoad);
            dropdownController._children.DropdownOpener = {
               close: () => {isClosed = true}
            };
            dropdownController._notify = (e) => {
               if (e === 'footerClick') {
                  isFooterClicked = true;
               }
            };
            dropdownController._onResult('footerClick');
            assert.isFalse(isClosed);
            assert.isTrue(isFooterClicked);
         });

         it('check item click', () => {
            let dropdownController = getDropdownController(config);
            let closed = false;
            let opened = false;
            let closeByNodeClick = false;
            let resultItems;

            dropdownController._beforeMount(configLazyLoad);
            dropdownController._items = itemsRecords.clone();
            popup.Sticky.closePopup = () => {closed = true; };
            popup.Sticky.openPopup = () => {opened = true; };

            dropdownController._notify = (e, eventResult) => {
               assert.equal(e, 'selectedItemsChanged');

               if (e === 'selectedItemsChanged') {
                  resultItems = eventResult[0];
               }

               return closeByNodeClick;
            };

            // returned false from handler and no hierarchy
            dropdownController._onResult('itemClick', dropdownController._items.at(4));
            assert.isFalse(closed);

            // returned undefined from handler and there is hierarchy
            closed = false;
            closeByNodeClick = false;
            dropdownController._onResult('itemClick', dropdownController._items.at(5));
            assert.isFalse(closed);

            // returned undefined from handler and no hierarchy
            closed = false;
            dropdownController._popupId = 'test';
            closeByNodeClick = undefined;
            dropdownController._onResult('itemClick', dropdownController._items.at(4));
            assert.isTrue(closed);

            // returned true from handler and there is hierarchy
            closed = false;
            closeByNodeClick = undefined;
            dropdownController._onResult('itemClick', dropdownController._items.at(5));
            assert.isTrue(closed);
         });

         it('lazy load', () => {
            let dropdownController = getDropdownController(configLazyLoad);
            dropdownController._beforeMount(configLazyLoad);
            assert.equal(dropdownController._items, undefined);
         });

         it('getItemByKey', () => {
            let itemsWithoutKeyProperty = new collection.RecordSet({
               rawData: items
            });

            let item = dropdown._Controller._private.getItemByKey(itemsWithoutKeyProperty, '1', 'id');
            assert.equal(item.get('title'), 'Запись 1');

            item = dropdown._Controller._private.getItemByKey(itemsWithoutKeyProperty, 'anyTestId', 'id');
            assert.isUndefined(item);
         });

         it('loadDependencies', async() => {
            const controller = getDropdownController(config);
            let items;
            let menuSource;

            await controller.loadDependencies();
            items = controller._items;
            menuSource = controller._menuSource;

            await controller.loadDependencies();
            assert.isTrue(items === controller._items, 'items changed on second loadDependencies with same options');
            assert.isTrue(menuSource === controller._menuSource, 'source changed on second loadDependencies with same options');
         });

         it('check empty item update', () => {
            let dropdownController = getDropdownController(config),
               selectedItems = [];
            let selectedItemsChangedCallback = function(items) {
               selectedItems = items;
            };

            // emptyText + selectedKeys = [null]
            dropdown._Controller._private.updateSelectedItems(dropdownController, '123', [null], 'id', selectedItemsChangedCallback);
            assert.deepEqual(selectedItems, [null]);

            // emptyText + selectedKeys = []
            dropdown._Controller._private.updateSelectedItems(dropdownController, '123', [], 'id', selectedItemsChangedCallback);
            assert.deepEqual(selectedItems, [null]);

            // selectedKeys = []
            let newItems = new collection.RecordSet({
               keyProperty: 'id',
               rawData: [
                  {id: null, title: 'All'},
                  {id: '1', title: 'first'}
               ]
            });
            dropdownController._items = newItems;
            dropdown._Controller._private.updateSelectedItems(dropdownController, undefined, [], 'id', selectedItemsChangedCallback);
            assert.deepEqual(selectedItems, [newItems.at(0)]);
         });

         it('_open dropdown', () => {
            let dropdownController = getDropdownController(config),
               opened = false;
            dropdownController._items = itemsRecords.clone();
            dropdownController._source = 'testSource';
            dropdownController._children.DropdownOpener = {
               open: () => { opened = true;}
            };
            dropdownController._sourceController = { hasMoreData: () => false, load: () => Deferred.success(itemsRecords.clone()) };
            dropdownController._open().then(function() {
               assert.isTrue(!!dropdownController._menuSource);
               assert.isTrue(opened);
            });

            // items is empty recordSet
            opened = false;
            dropdownController._items.clear();
            dropdownController._open().then(function() {
               assert.isFalse(opened);
            });

            // items = null
            opened = false;
            dropdownController._items = null;
            dropdownController._open().then(function() {
               assert.isFalse(opened);
            });

            // items's count = 1 + emptyText
            opened = false;
            dropdownController._items = new collection.RecordSet({keyProperty: 'id', rawData: [{id: '1', title: 'first'}]});
            dropdownController._options.emptyText = 'Not selected';
            dropdownController._open().then(function() {
               assert.isTrue(opened);
            });

            // update items in _menuSource
            const newItems = new collection.RecordSet({keyProperty: 'id', rawData: [{id: '1', title: 'first'}]});
            dropdownController._menuSource = null;
            dropdownController._items = newItems;
            dropdownController._open().then(function() {
               assert.deepEqual(dropdownController._menuSource.getData().query.getRawData(), newItems.getRawData());
            });

            //new source and dropdown is open
            updatedItems = clone(items);
            dropdownController._items = itemsRecords.clone();
            dropdownController._isOpened = true;
            dropdownController.source = new sourceLib.Memory({
               keyProperty: 'id',
               data: updatedItems
            });
            dropdownController._sourceController = { hasMoreData: () => {}, isLoading: () => {} };
            dropdownController._open().then(function() {
               assert.equal(dropdownController._items.getCount(), updatedItems.length);
               assert.isTrue(opened);
            });
         });

         it('_private::loadItemsTemplates', (done) => {
            let dropdownController = getDropdownController(config);
            dropdownController._items = new collection.RecordSet({
               keyProperty: 'id',
               rawData: []
            });
            dropdown._Controller._private.loadItemsTemplates(dropdownController, config).addCallback(() => {
               assert.isTrue(dropdownController._loadItemsTempPromise.isReady());
               done();
            });
         });

         it('_private::loadItems', () => {
            const controllerConfig = { ...config };
            controllerConfig.dataLoadCallback = function(loadedItems) {
               const item = new entity.Record({
                  rawData: {
                     id: '9',
                     title: 'Запись 9'
                  }
               });
               loadedItems.add(item);
            };
            let dropdownController = getDropdownController(controllerConfig);
            return new Promise((resolve) => {
               dropdown._Controller._private.loadItems(dropdownController, controllerConfig).then(() => {
                  dropdownController._menuSource.query().then((menuItems) => {
                     assert.isTrue(!!menuItems.getRecordById('9'));
                     resolve();
                  });
               });
            });
         });

         it('_private::getItemsTemplates', () => {
            let dropdownController = getDropdownController(config);

            dropdownController._items = new collection.RecordSet({
               keyProperty: 'id',
               rawData: [
                  {
                     id: 1,
                     itemTemplate: 'first'
                  }, {
                     id: 2,
                     itemTemplate: 'second'
                  }, {
                     id: 3
                  }, {
                     id: 4,
                     itemTemplate: 'second'
                  }, {
                     id: 5,
                     itemTemplate: 'five'
                  }
               ]
            });
            assert.deepEqual(dropdown._Controller._private.getItemsTemplates(dropdownController, config), ['first', 'second', 'five']);
         });

         it('_open one item', () => {
            let selectedItems;
            let oneItemConfig = clone(config);
            oneItemConfig.emptyText = undefined;
            let dropdownController = getDropdownController(oneItemConfig);
            let item = new collection.RecordSet({
               keyProperty: 'id',
               rawData: [ {id: 1, title: 'Запись 1'} ]
            });
            dropdownController._items = item;
            dropdownController._source = 'testSource';
            dropdownController._notify = (e, data) => {
               if (e === 'selectedItemsChanged') {
                  selectedItems = data[0];
               }
            };
            dropdownController._open().then(function() {
               assert.deepEqual(selectedItems, [item.at(0)]);
            });
         });

         it('_open lazyLoad', () => {
            let dropdownController = getDropdownController(configLazyLoad);
            dropdownController._beforeMount(configLazyLoad);
            dropdownController._children.DropdownOpener = {
               close: setTrue.bind(this, assert),
               open: setTrue.bind(this, assert)
            };
            dropdownController._open();
         });

         describe ('menuPopupOptions', () => {
            let newConfig, dropdownController;
            beforeEach(() => {
               newConfig = clone(config);
               newConfig.menuPopupOptions = {
                  fittingMode: {
                     vertical: 'adaptive',
                     horizontal: 'overflow'
                  },
                  direction: 'top',
                  target: 'testTarget',
                  templateOptions: {
                     closeButtonVisibility: true
                  }
               };
               dropdownController = getDropdownController(newConfig);
               dropdownController._sourceController = {
                  hasMoreData: () => {}
               };
            });
            it ('only popupOptions', () => {
               const resultPopupConfig = dropdown._Controller._private.getPopupOptions(dropdownController);
               assert.deepEqual(resultPopupConfig.fittingMode,  {
                  vertical: 'adaptive',
                  horizontal: 'overflow'
               });
               assert.equal(resultPopupConfig.direction, 'top');
               assert.equal(resultPopupConfig.target, 'testTarget');
            });

            it('templateOptions', () => {
               dropdownController._menuSource = 'testSource';
               const resultPopupConfig = dropdown._Controller._private.getPopupOptions(dropdownController);

               assert.isTrue(resultPopupConfig.templateOptions.closeButtonVisibility);
               assert.equal(resultPopupConfig.templateOptions.source, 'testSource');
            });
         });

         it('events on open/close', async () => {
            let dropdownController = getDropdownController(config);
            let stubNotify = sandbox.stub(dropdownController, '_notify');

            await dropdownController._beforeMount(configLazyLoad);

            dropdownController._onOpen();
            dropdownController._onClose();

            assert.isTrue(stubNotify.withArgs('dropDownOpen').calledOnce);
            assert.isTrue(stubNotify.withArgs('dropDownClose').calledOnce);
         });

         it('_onSelectorTemplateResult', () => {
            let dropdownController = getDropdownController(config),
               opened;
            dropdownController._onResult = dropdown._Controller._private.onResult.bind(dropdownController);
            dropdownController._children.DropdownOpener = {
               close: function() {
                  opened = false;
               }
            };
            let curItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  }, {
                     id: '2',
                     title: 'Запись 2'
                  }, {
                     id: '3',
                     title: 'Запись 3'
                  }]
               }),
               selectedItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  },
                  {
                     id: '9',
                     title: 'Запись 9'
                  },
                  {
                     id: '10',
                     title: 'Запись 10'
                  }]
               });
            dropdownController._items = curItems;
            dropdownController._source = config.source;
            let newItems = [ {
               id: '9',
               title: 'Запись 9'
            },
            {
               id: '10',
               title: 'Запись 10'
            },
            {
               id: '1',
               title: 'Запись 1'
            },
            {
               id: '2',
               title: 'Запись 2'
            },
            {
               id: '3',
               title: 'Запись 3'
            }
            ];

            dropdownController._onSelectorTemplateResult('selectorResult', selectedItems);
            assert.deepEqual(newItems, dropdownController._items.getRawData());
         });

         it('_onSelectorTemplateResult selectorCallback', () => {
            let dropdownController = getDropdownController(config),
               opened;
            dropdownController._onResult = dropdown._Controller._private.onResult.bind(dropdownController);
            dropdownController._children.DropdownOpener = {
               close: function() {
                  opened = false;
               }
            };

            dropdownController._notify = (event, data) => {
               if (event === 'selectorCallback') {
                  data[1].at(0).set({id: '11', title: 'Запись 11'});
               }
            };

            let curItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  }, {
                     id: '2',
                     title: 'Запись 2'
                  }, {
                     id: '3',
                     title: 'Запись 3'
                  }]
               }),
               selectedItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  },
                     {
                        id: '9',
                        title: 'Запись 9'
                     },
                     {
                        id: '10',
                        title: 'Запись 10'
                     }]
               });
            dropdownController._items = curItems;
            dropdownController._source = config.source;
            let newItems = [
               { id: '11', title: 'Запись 11' },
               { id: '9', title: 'Запись 9' },
               { id: '10', title: 'Запись 10' },
               { id: '1', title: 'Запись 1' },
               { id: '2', title: 'Запись 2' },
               { id: '3', title: 'Запись 3' }
            ];

            dropdownController._onSelectorTemplateResult('selectorResult', selectedItems);
            assert.deepEqual(newItems, dropdownController._items.getRawData());
         });

         it('_mouseDownHandler', () => {
            let dropdownController = getDropdownController(configLazyLoad);
            dropdownController._beforeMount(configLazyLoad);
            let opened = false;
            let items2 = new collection.RecordSet({
               keyProperty: 'id',
               rawData: [ {id: 1, title: 'Запись 1'}, {id: 2, title: 'Запись 2'} ]
            });
            dropdownController._items = items2;
            dropdownController._source = 'testSource';
            dropdownController._sourceController = { hasMoreData: () => false };
            popup.Sticky.closePopup = () => {opened = false; };
            popup.Sticky.openPopup = () => {opened = true; };

            dropdownController._open = function() {
               opened = true;
            };
            dropdownController._mouseDownHandler();
            assert.isTrue(opened);

            dropdownController._popupId = 'test';
            dropdownController._mouseDownHandler();
            assert.isFalse(opened);
         });

         it('_clickHandler', () => {
            const dropdownController = getDropdownController();
            let eventStopped = false;
            const event = {
               stopPropagation: () => { eventStopped = true; }
            };

            dropdownController._clickHandler(event);
            assert.isTrue(eventStopped);
         });

         it('_beforeUnmount', function() {
            let isCanceled = false, opened = true;
            let dropdownController = getDropdownController(configLazyLoad);
            popup.Sticky.closePopup = () => {opened = false;};
            dropdownController._sourceController = {cancelLoading: () => { isCanceled = true }};
            dropdownController._beforeUnmount();
            assert.isFalse(!!dropdownController._sourceController);
            assert.isTrue(isCanceled);
            assert.isFalse(opened);
         });

         it('openMenu', () => {
            let dropdownController = getDropdownController(config);
            let openConfig;

            dropdownController._sourceController = { hasMoreData: () => false };
            dropdownController._source = 'testSource';
            dropdownController._items = new collection.RecordSet({
               keyProperty: 'id',
               rawData: items
            });
            popup.Sticky.closePopup = () => {closed = true; };

            dropdownController.openMenu({ testOption: 'testValue' }).then(function() {
               assert.equal(openConfig.testOption, 'testValue');
            });

            dropdownController._items = new collection.RecordSet({
               keyProperty: 'id',
               rawData: [{
                  id: 1,
                  title: 'testTitle'
               }]
            });
            openConfig = null;
            dropdownController._options.footerTemplate = {};

            dropdownController.openMenu({ testOption: 'testValue' }).then(function() {
               assert.equal(openConfig.testOption, 'testValue');
            });
         });

         it('closeMenu', () => {
            let dropdownController = getDropdownController(config);
            let closed = false;
            popup.Sticky.closePopup = () => {closed = true; };

            dropdownController.closeMenu();
            assert.isTrue(closed);
         });

         it('_private::getNewItems', function() {
            let curItems = new collection.RecordSet({
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  }, {
                     id: '2',
                     title: 'Запись 2'
                  }, {
                     id: '3',
                     title: 'Запись 3'
                  }]
               }),
               selectedItems = new collection.RecordSet({
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  }, {
                     id: '9',
                     title: 'Запись 9'
                  }, {
                     id: '10',
                     title: 'Запись 10'
                  }]
               });
            let newItems = [selectedItems.at(1), selectedItems.at(2)];
            let result = dropdown._Controller._private.getNewItems(curItems, selectedItems, 'id');

            assert.deepEqual(newItems, result);
         });

         it('_private::onSelectorResult', function() {
            let dropdownController = getDropdownController(config);
            let curItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  }, {
                     id: '2',
                     title: 'Запись 2'
                  }, {
                     id: '3',
                     title: 'Запись 3'
                  }]
               }),
               selectedItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  },
                  {
                     id: '9',
                     title: 'Запись 9'
                  },
                  {
                     id: '10',
                     title: 'Запись 10'
                  }]
               });
            dropdownController._items = curItems;
            let newItems = [ {
               id: '9',
               title: 'Запись 9'
            },
            {
               id: '10',
               title: 'Запись 10'
            },
            {
               id: '1',
               title: 'Запись 1'
            },
            {
               id: '2',
               title: 'Запись 2'
            },
            {
               id: '3',
               title: 'Запись 3'
            }
            ];
            dropdownController._source = config.source;
            dropdown._Controller._private.onSelectorResult(dropdownController, selectedItems);
            assert.deepEqual(newItems, dropdownController._items.getRawData());
            assert.isOk(dropdownController._menuSource);
         });

         it('_private::getSourceController', function() {
            let dropdownController = getDropdownController(config);
            dropdownController._beforeMount(configLazyLoad);
            assert.isNotOk(dropdownController._sourceController);

            return new Promise((resolve) => {
               dropdownController._beforeMount(config).then(() => {
                  assert.isOk(dropdownController._sourceController);

                  let historyConfig = {...config, historyId: 'TEST_HISTORY_ID'};
                  dropdownController = getDropdownController(historyConfig);
                  return dropdown._Controller._private.getSourceController(dropdownController, historyConfig).then((sourceController) => {
                     assert.isTrue(cInstance.instanceOfModule(sourceController._source, 'Controls/history:Source'));
                     assert.isOk(dropdownController._sourceController);
                     resolve();
                  });
               });
            });
         });

         let historySource,
            dropdownController;
         describe('history', ()=> {
            beforeEach(function() {
               historySource = new history.Source({
                  originSource: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: items
                  }),
                  historySource: new history.Service({
                     historyId: 'TEST_HISTORY_ID_DDL_CONTROLLER'
                  })
               });
               historySource.query = function() {
                  var def = new Deferred();
                  def.addCallback(function(set) {
                     return set;
                  });
                  def.callback(itemsRecords.clone());
                  return def;
               };
               historySource.getItems = () => {};

               let historyConfig = { ...config, source: historySource };
               dropdownController = getDropdownController(historyConfig);
               dropdownController._items = itemsRecords.clone();
               dropdownController._children = { DropdownOpener: { close: setTrue.bind(this, assert), isOpened: setTrue.bind(this, assert) } };
            });

            it('_beforeUpdate new historySource', function() {
               return dropdownController._beforeUpdate({
                  selectedKeys: [2],
                  keyProperty: 'id',
                  source: historySource,
                  filter: {}
               }).then(() => {
                  assert.deepEqual(dropdownController._filter, { $_history: true });
               });
            });

            it('_private::onResult applyClick with history', function() {
               let selectedItems, updated;
               dropdownController._notify = function(e, d) {
                  if (e === 'selectedItemsChanged') {
                     selectedItems = d[0];
                  }
               };

               dropdownController._items = itemsRecords.clone();
               dropdownController._beforeMount({
                  selectedKeys: [2],
                  keyProperty: 'id',
                  source: historySource,
                  filter: {}
               });

               dropdownController._onResult('applyClick', items);
               assert.deepEqual(selectedItems, items);
            });

            it('_private::onResult itemClick on history item', function() {
               let resultItems, updated, closeByNodeClick = true;
               dropdownController._notify = function (e, d) {
                  if (e === 'selectedItemsChanged') {
                     resultItems = d[0];
                     return closeByNodeClick;
                  }
               };

               historySource.update = function () {
                  updated = true;
               };
               dropdownController._items = itemsRecords.clone();
               dropdownController._beforeMount({
                  selectedKeys: [2],
                  keyProperty: 'id',
                  source: historySource,
                  filter: {}
               });
               dropdownController._source = historySource;

               // return the original Id value
               let item = new entity.Model({
                  rawData: {
                     id: '6', title: 'title 6'
                  },
                  keyProperty: 'id'
               });
               item.set('originalId', item.getId());
               item.set('id', item.getId() + '_history');
               assert.equal(item.getId(), '6_history');
               dropdownController._onResult('itemClick', item);
               assert.equal(resultItems[0].getId(), '6');
               assert.isTrue(updated);

               updated = false;
               closeByNodeClick = false;
               item = new entity.Model({
                  rawData: {
                     id: '5', title: 'title 5'
                  },
                  keyProperty: 'id'
               });
               dropdownController._onResult('itemClick', item);
               assert.equal(resultItems[0].getId(), '5');
               assert.isFalse(updated);
            });

            it('check pin click', () => {
               let closed = false, opened;
               let resultItem;

               dropdownController._beforeMount(configLazyLoad);
               dropdownController._items = itemsRecords.clone();
               dropdownController._children.DropdownOpener = {
                  close: function() {
                     closed = true;
                  },
                  open: function() {
                     opened = true;
                  }
               };

               dropdownController._notify = (e, eventResult) => {
                  if (e === 'pinClick') {
                     resultItem = eventResult[0];
                  }
               };

               // return the original Id value
               let item = new entity.Model({
                  rawData: {
                     id: '6', title: 'title 6'
                  },
                  keyProperty: 'id'
               });
               item.set('originalId', item.getId());
               item.set('id', item.getId() + '_history');
               closed = false;
               assert.equal(item.getId(), '6_history');
               dropdownController._source = historySource;
               dropdownController._onResult('pinClick', item);
               assert.isFalse(closed);
               assert.equal(resultItem.getId(), '6');
            });

         });

         function setTrue(assert) {
            assert.equal(true, true);
         }
      });
   });
