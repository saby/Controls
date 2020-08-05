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
            menuOptions: {
               selectedKeys: [2],
               keyProperty: 'id',
               emptyText: true,
               nodeProperty: 'node',
               itemTemplateProperty: 'itemTemplate'
            },
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            })
         };

         let configLazyLoad = {
            menuOptions: {
               lazyItemsLoading: true,
               selectedKeys: [2],
               keyProperty: 'id',
            },
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            })
         };

         let getDropdownController = function(config) {
            let dropdownCntroller = new dropdown._Controller(config);
            return dropdownCntroller;
         };

         let sandbox;

         beforeEach(function() {
            sandbox = sinon.createSandbox();
         });

         afterEach(function() {
            sandbox.restore();
         });

         it('reload', function() {
            let newOptions = clone(config);
            const newItems = [
               {
                  id: '1',
                  title: 'Тест 1'
               },
               {
                  id: '2',
                  title: 'Тест 2'
               }
            ];
            const newSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: newItems
            });

            let dropdownController = getDropdownController(newOptions);
            dropdownController._options.source = newSource;
            dropdownController.reload().then(()=> {
               assert.deepEqual(dropdownController._items.at(0).get('title'), 'Тест 1');
            });
         });

         describe('update', function() {
            let dropdownController, opened, updatedItems;
            beforeEach(function() {
               opened = false;
               dropdownController = getDropdownController(config);
               dropdownController._sticky.open = () => {opened = true;};

               updatedItems = clone(items);
               updatedItems.push({
                  id: '9',
                  title: 'Запись 9'
               });
            });

            it('new templateOptions', function() {
               dropdownController._loadItemsTempPromise = {};
               dropdownController.update({ ...config, ...{source: 'test'} });
               assert.isNull(dropdownController._loadMenuTempPromise);
               assert.isFalse(opened);

               dropdownController._open = function() {
                  opened = true;
               };

               dropdownController._isOpened = true;
               dropdownController._items = itemsRecords.clone();
               dropdownController._source = 'testSource';
               dropdownController._sourceController = {hasMoreData: ()=>{}};
               dropdownController._options = {menuOptions:{}};
               config.menuOptions.headTemplate = 'headTemplate.wml';
               dropdownController.update({ ...config, source: undefined })
               assert.isTrue(opened);
            });

            it('new source', () => {
               dropdownController._items = itemsRecords.clone();
               dropdownController._source = true;

               return new Promise((resolve) => {
                  dropdownController.update({
                     menuOptions: {
                        selectedKeys: [2],
                        keyProperty: 'id',
                     },
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
               dropdownController.update({
                  menuOptions: {
                     selectedKeys: [2],
                     keyProperty: 'id',
                     lazyItemsLoading: true,
                  },
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

               let stub = sandbox.stub(dropdownController, '_updateSelectedItems');
               return new Promise((resolve) => {
                  dropdownController.update({
                     menuOptions: {
                        selectedKeys: [3],
                        keyProperty: 'id',
                     },
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
               dropdownController.update({
                  menuOptions: {
                     selectedKeys: [2],
                     keyProperty: 'id'
                  },
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
               configFilter.menuOptions.selectedKeys = ['2'];
               configFilter.menuOptions.selectedItemsChangedCallback = function(items) {
                  selectedItems = items;
               };

               dropdownController.update({...configFilter}).addCallback(function(result) {
                  assert.deepStrictEqual(selectedItems[0].getRawData(), itemsRecords.at(1).getRawData());
                  done();
               });
            });

            it('_getloadItemsPromise', () => {
               let errorCathed = false;
               dropdownController._items = null;
               dropdownController._loadItemsPromise = null;
               dropdownController._options.source = null;
               let promise = dropdownController._getloadItemsPromise();

               try {
                  promise.then(() => {});
               } catch (error) {
                  errorCathed = true;
               }
               assert.isFalse(errorCathed);
            });

            it('without loaded items', () => {
               let configItems = clone(config),
                  selectedItems = [];
               configItems.menuOptions.selectedItemsChangedCallback = function(items) {
                  selectedItems = items;
               };
               dropdownController._items = null;
               var newConfig = clone(configItems);
               newConfig.source = new sourceLib.Memory({
                  keyProperty: 'id',
                  data: items
               });
               newConfig.menuOptions.selectedKeys = ['4'];
               return dropdownController.update(newConfig).then(function() {
                  assert.equal(selectedItems.length, 1);
               });
            });

            it('change source, lazyItemsLoading = true', (done) => {
               dropdownController.update(configLazyLoad);
               dropdownController._sourceController = { isLoading: () => false };
               items.push({
                  id: '5',
                  title: 'Запись 11'
               });

               dropdownController.update({
                  menuOptions: {
                     lazyItemsLoading: true,
                     selectedKeys: [2],
                     keyProperty: 'id'
                  },
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: items
                  })
               });
               assert.isNull(dropdownController._sourceController);
               assert.equal(dropdownController._items, null);

               dropdownController._isOpened = true;
               dropdownController.update({
                  menuOptions: {
                     lazyItemsLoading: true,
                     selectedKeys: [2],
                     keyProperty: 'id'
                  },

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
               dropdownController.update({
                  menuOptions: {
                     selectedKeys: [6],
                     keyProperty: 'id',
                     selectedItemsChangedCallback: selectedItemsChangedCallback
                  },
                  filter: config.filter
               });
               assert.deepEqual(selectedItems[0].getRawData(), items[5]);
            });

            it('change readOnly', () => {
               let readOnlyConfig = clone(config),
                  isClosed = false;

               dropdownController._sticky.close = () => {isClosed = true; };
               readOnlyConfig.readOnly = true;
               dropdownController.update(readOnlyConfig);
               assert.isTrue(isClosed);
            });
         });

         it('getItemByKey', () => {
            let dropdownController = getDropdownController(config);
            let itemsWithoutKeyProperty = new collection.RecordSet({
               rawData: items
            });

            let item = dropdownController._getItemByKey(itemsWithoutKeyProperty, '1', 'id');
            assert.equal(item.get('title'), 'Запись 1');

            item = dropdownController._getItemByKey(itemsWithoutKeyProperty, 'anyTestId', 'id');
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

         it('loadDependencies, loadItemsTemplates', async() => {
            let actualOptions;
            const controller = getDropdownController(config);

            sandbox.replace(controller, '_loadItemsTemplates', (options) => {
               actualOptions = options;
               return Promise.resolve(true);
            });

            // items not loaded, loadItemsTemplates was called
            await controller.loadDependencies();
            assert.isOk(actualOptions);

            // items already loaded, loadItemsTemplates was called
            actualOptions = null;
            await controller.loadDependencies();
            assert.isOk(actualOptions);
         });

         it('check empty item update', () => {
            let dropdownController = getDropdownController(config),
               selectedItems = [];
            let selectedItemsChangedCallback = function(items) {
               selectedItems = items;
            };

            // emptyText + selectedKeys = [null]
            dropdownController._updateSelectedItems('123', [null], 'id', selectedItemsChangedCallback);
            assert.deepEqual(selectedItems, [null]);

            // emptyText + selectedKeys = []
            dropdownController._updateSelectedItems('123', [], 'id', selectedItemsChangedCallback);
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
            dropdownController._updateSelectedItems(undefined, [], 'id', selectedItemsChangedCallback);
            assert.deepEqual(selectedItems, [newItems.at(0)]);
         });

         it('_open dropdown', () => {
            let dropdownController = getDropdownController(config),
               opened = false;
            dropdownController._items = itemsRecords.clone();
            dropdownController._source = 'testSource';

            sandbox.replace(dropdownController._sticky, 'open', () => {
               opened = true;
               return Promise.resolve(true);
            });
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
            dropdownController._loadItemsTemplates(config).addCallback(() => {
               assert.isTrue(dropdownController._loadItemsTempPromise.isReady());
               done();
            });
         });

         it('_private::loadItems', () => {
            const controllerConfig = { ...config };
            controllerConfig.menuOptions.dataLoadCallback = function(loadedItems) {
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
               dropdownController._loadItems(controllerConfig).then(() => {
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
            assert.deepEqual(dropdownController._getItemsTemplates(config), ['first', 'second', 'five']);
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
            dropdownController.update(configLazyLoad);

            dropdownController._sticky.open = setTrue.bind(this, assert);
            dropdownController._sticky.close = setTrue.bind(this, assert);
            dropdownController._open();
         });

         describe('menuPopupOptions', () => {
            let newConfig, dropdownController;
            beforeEach(() => {
               newConfig = clone(config);
               newConfig.menuOptions.menuPopupOptions = {
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

            it('only popupOptions', () => {
               const resultPopupConfig = dropdownController._getPopupOptions();
               assert.deepEqual(resultPopupConfig.fittingMode,  {
                  vertical: 'adaptive',
                  horizontal: 'overflow'
               });
               assert.equal(resultPopupConfig.direction, 'top');
               assert.equal(resultPopupConfig.target, 'testTarget');
            });

            it('templateOptions', () => {
               dropdownController._menuSource = 'testSource';
               const resultPopupConfig = dropdownController._getPopupOptions();

               assert.isTrue(resultPopupConfig.templateOptions.closeButtonVisibility);
               assert.equal(resultPopupConfig.templateOptions.source, 'testSource');
            });

            it('templateOptions', () => {
               const resultPopupConfig = dropdownController._getPopupOptions({
                  testPopupOptions: 'testValue'
               });

               assert.equal(resultPopupConfig.direction, 'top');
               assert.equal(resultPopupConfig.target, 'testTarget');
               assert.equal(resultPopupConfig.testPopupOptions, 'testValue');
            });
         });

         it('_beforeUnmount', function() {
            let isCanceled = false, opened = true;
            let dropdownController = getDropdownController(configLazyLoad);
            dropdownController._sticky.close = () => {opened = false;};
            dropdownController._sourceController = {cancelLoading: () => { isCanceled = true }};
            dropdownController._options.openerControl = {
               _notify: () => {}
            };
            dropdownController.destroy();
            assert.isFalse(!!dropdownController._sourceController);
            assert.isTrue(isCanceled);
            assert.isFalse(opened);
         });

         describe('openMenu', () => {
            let dropdownController = getDropdownController(config);
            let openConfig;

            before(() => {
               dropdownController._sourceController = { hasMoreData: () => false };
               dropdownController._source = 'testSource';
               dropdownController._items = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: items
               });
               sandbox.replace(popup.Sticky, 'openPopup', (popupConfig) => {
                  openConfig = popupConfig;
                  return Promise.resolve(true);
               });
            });

            it('simple', async() => {
               await dropdownController.openMenu({ testOption: 'testValue' });
               assert.equal(openConfig.testOption, 'testValue');
            });

            describe('one item', () => {
               beforeEach(() => {
                  dropdownController._items = new collection.RecordSet({
                     keyProperty: 'id',
                     rawData: [{
                        id: 1,
                        title: 'testTitle'
                     }]
                  });
                  dropdownController._options.menuOptions.footerTemplate = null;
                  dropdownController._options.menuOptions.emptyText = null;
                  openConfig = null;
               });

               it('with footer', async() => {
                  dropdownController._options.menuOptions.footerTemplate = {};

                  await dropdownController.openMenu({ testOption: 'testValue' });
                  assert.equal(openConfig.testOption, 'testValue');
               });

               it('with emptyText', async() => {
                  dropdownController._options.menuOptions.emptyText = '123';

                  await dropdownController.openMenu({ testOption: 'testValue' });
                  assert.equal(openConfig.testOption, 'testValue');
               });

               it('simple', async() => {
                  await dropdownController.openMenu().then((items) => {
                     assert.equal(items[0].get('id'), 1);
                  });
                  assert.equal(openConfig, null);
               });
            });
         });

         it('closeMenu', () => {
            let dropdownController = getDropdownController(config);
            let closed = false;
            dropdownController._sticky.close = () => {closed = true; };

            dropdownController.closeMenu();
            assert.isTrue(closed);
         });

         it('_private::getSourceController', function() {
            config.menuOptions.dataLoadCallback = null;
            let dropdownController = getDropdownController(config);
            dropdownController.setItems(configLazyLoad.items);
            assert.isOk(dropdownController._sourceController);

            return new Promise((resolve) => {
               dropdownController.loadItems().then(() => {
                  assert.isOk(dropdownController._sourceController);

                  let historyConfig = {...config, historyId: 'TEST_HISTORY_ID'};
                  dropdownController = getDropdownController(historyConfig);
                  return dropdownController._getSourceController(historyConfig).then((sourceController) => {
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
               let resultItems, testEvent;
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
               // historySource.getItems = () => {};

               let historyConfig = { ...config, source: historySource };
               dropdownController = getDropdownController(historyConfig);
               dropdownController._items = itemsRecords.clone();
               dropdownController._children = { DropdownOpener: { close: setTrue.bind(this, assert), isOpened: setTrue.bind(this, assert) } };
            });

            it('_private::onResult applyClick with history', function() {
               let selectedItems;
               dropdownController._options = {
                  menuOptions: {
                     selectedKeys: [2],
                     keyProperty: 'id',
                  },
                  source: historySource,
                  filter: {},
                  notifySelectedItemsChanged: (d) => {
                     selectedItems = d[0];
                  }
               };
               dropdownController._items = itemsRecords.clone();
               dropdownController.loadItems().then((result) => {
                  dropdownController.setItemsOnMount(result);
                  dropdownController._onResult('applyClick', items);
                  assert.deepEqual(selectedItems, items);
               });
            });
         });

         function setTrue(assert) {
            assert.equal(true, true);
         }
      });
   });
