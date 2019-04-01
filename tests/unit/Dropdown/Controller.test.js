define(
   [
      'Controls/Dropdown/Controller',
      'Types/source',
      'Core/core-clone',
      'Types/collection',
      'Controls/History/Source',
      'Controls/History/Service',
      'Core/Deferred'
   ],
   (Dropdown, sourceLib, Clone, collection, historySource, historyService, Deferred) => {
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
            idProperty: 'id',
            rawData: items
         });

         let selectItem = null;

         let config = {
            selectedKeys: '[2]',
            keyProperty: 'id',
            emptyText: true,
            dataLoadCallback: function(items) {
               selectItem = items[0];
            },
            source: new sourceLib.Memory({
               idProperty: 'id',
               data: items
            }),
            filter: {},
            nodeProperty: 'node'
         };

         let configLazyLoad = {
            lazyItemsLoad: true,
            selectedKeys: '[2]',
            keyProperty: 'id',
            source: new sourceLib.Memory({
               idProperty: 'id',
               data: items
            })
         };

         let getDropdownController = function(config) {
            let dropdownCntroller = new Dropdown(config);
            dropdownCntroller.saveOptions(config);
            return dropdownCntroller;
         };

         it('before mount', (done) => {
            let dropdownController = getDropdownController(config);
            dropdownController._beforeMount(config).addCallback(function(items) {
               assert.deepEqual(items.getRawData(), itemsRecords.getRawData());
               done();
            });
         });

         it('before mount navigation', (done) => {
            let navigationConfig = Clone(config);
            navigationConfig.navigation = {view: 'page', source: 'page', sourceConfig: {pageSize: 2, page: 0, hasMore: false}};
            let dropdownController = getDropdownController(navigationConfig);
            dropdownController._beforeMount(navigationConfig).addCallback(function(items) {
               assert.deepEqual(items.getCount(), 2);
               done();
            });
         });

         it('before mount filter', (done) => {
            let filterConfig = Clone(config);
            filterConfig.filter = {id: ['3', '4']};
            let dropdownController = getDropdownController(filterConfig);
            dropdownController._beforeMount(filterConfig).addCallback(function(items) {
               assert.deepEqual(items.getCount(), 2);
               done();
            });
         });

         it('check received state', () => {
            let dropdownController = getDropdownController(config);
            dropdownController._beforeMount(config, null, itemsRecords);
            assert.deepEqual(dropdownController._items.getRawData(), itemsRecords.getRawData());
         });

         it('received state, selectedItems = [null], emptyText is set', () => {
            let dataLoadCallbackCalled = false,
               selectedItems = [];
            const config = {
               selectedKeys: [null],
               keyProperty: 'id',
               emptyText: '123',
               dataLoadCallback: function(items) {
                  selectedItems = items;
                  dataLoadCallbackCalled = true;
               },
               source: new sourceLib.Memory({
                  idProperty: 'id',
                  data: items
               })
            };
            const dropdownController = getDropdownController(config);
            dropdownController._beforeMount(config, null, itemsRecords);
            assert.deepEqual(selectedItems, [null]);
            assert.isTrue(dataLoadCallbackCalled);
         });

         it('received state, selectedItems = [null], emptyText is NOT set', () => {
            let dataLoadCallbackCalled = false,
               selectedItems = [];
            const config = {
               selectedKeys: [null],
               keyProperty: 'id',
               dataLoadCallback: function(items) {
                  selectedItems = items;
                  dataLoadCallbackCalled = true;
               },
               source: new sourceLib.Memory({
                  idProperty: 'id',
                  data: items
               })
            };
            const dropdownController = getDropdownController(config);
            dropdownController._beforeMount(config, null, itemsRecords);
            assert.deepEqual(selectedItems, []);
            assert.isTrue(dataLoadCallbackCalled);
         });

         it('before update source', () => {
            let dropdownController = getDropdownController(config);
            items.push({
               id: '9',
               title: 'Запись 9'
            });
            dropdownController._selectedItems = [];
            dropdownController._items = itemsRecords;
            return new Promise((resolve) => {
               dropdownController._beforeUpdate({
                  selectedKeys: '[2]',
                  keyProperty: 'id',
                  source: new sourceLib.Memory({
                     idProperty: 'id',
                     data: items
                  })
               }).addCallback(() => {
                  assert.equal(dropdownController._items.getCount(), items.length);
                  resolve();
               });
            });
         });

         it('_beforeUpdate new historySource', function() {
            let dropdownController = getDropdownController(config);
            let historyS = new historySource({
               originSource: new sourceLib.Memory({
                  idProperty: 'id',
                  data: items
               }),
               historySource: new historyService({
                  historyId: 'TEST_HISTORY_ID_DDL_CONTROLLER'
               })
            });
            historyS.query = function() {
               var def = new Deferred();
               def.addCallback(function(set) {
                  return set;
               });
               def.callback(itemsRecords);
               return def;
            };
            dropdownController._selectedItems = [];
            dropdownController._items = itemsRecords;
            dropdownController._beforeUpdate({
               selectedKeys: '[2]',
               keyProperty: 'id',
               source: historyS,
               filter: {}
            });
            assert.deepEqual(dropdownController._filter, { $_history: true });

         });

         it('_beforeUpdate new filter', () => {
            let dropdownController = getDropdownController(config);
            dropdownController._selectedItems = items;
            dropdownController._beforeUpdate(config);
            assert.equal(dropdownController._selectedItems.length, 9);
         });

         it('_beforeUpdate without loaded items', () => {
            let dropdownController = getDropdownController(config);
            dropdownController._items = null;
            var newConfig = Clone(config);
            newConfig.selectedKeys = ['4'];
            dropdownController._beforeUpdate(newConfig).addCallback(function() {
               assert.equal(dropdownController._selectedItems.length, 1);
            });
         });

         it('notify footer click', () => {
            let dropdownController = getDropdownController(config);
            dropdownController._beforeMount(configLazyLoad);
            dropdownController._children.DropdownOpener = {
               close: setTrue.bind(this, assert),
               open: setTrue.bind(this, assert)
            };
            dropdownController._notify = (e) => {
               assert.equal(e, 'footerClick');
            };
            dropdownController._onResult({action: 'footerClick'});
         });

         it('check item click', () => {
            let dropdownController = getDropdownController(config);
            let closed = false;
            let opened = false;
            let closeByNodeClick = false;

            dropdownController._beforeMount(configLazyLoad);
            dropdownController._items = itemsRecords;
            dropdownController._children.DropdownOpener = {
               close: function() {
                  closed = true;
               },
               open: function() {
                  opened = true;
               }
            };

            dropdownController._notify = (e, eventResult) => {
               var item = eventResult[0][0];

               assert.equal(e, 'selectedItemsChanged');

               return closeByNodeClick;
            };

            // returned false from handler and no hierarchy
            dropdownController._onResult({action: 'itemClick', data: [dropdownController._items.at(4)]});
            assert.isFalse(closed);

            // returned undefined from handler and there is hierarchy
            closed = false;
            closeByNodeClick = undefined;
            dropdownController._onResult({action: 'itemClick', data: [dropdownController._items.at(5)]});
            assert.isFalse(closed);

            // returned undefined from handler and no hierarchy
            closed = false;
            closeByNodeClick = undefined;
            dropdownController._onResult({action: 'itemClick', data: [dropdownController._items.at(4)]});
            assert.isTrue(closed);

            // returned true from handler and there is hierarchy
            closeByNodeClick = true;
            dropdownController._onResult({action: 'itemClick', data: [dropdownController._items.at(5)]});
            assert.isTrue(closed);
         });

         it('lazy load', () => {
            let dropdownController = getDropdownController(configLazyLoad);
            dropdownController._beforeMount(configLazyLoad);
            assert.equal(dropdownController._items, undefined);
         });

         it('before update source lazy load', () => {
            let dropdownController = getDropdownController(configLazyLoad);
            dropdownController._beforeMount(configLazyLoad);
            items.push({
               id: '5',
               title: 'Запись 11'
            });
            dropdownController._beforeUpdate({
               lazyItemsLoad: true,
               selectedKeys: '[2]',
               keyProperty: 'id',
               source: new sourceLib.Memory({
                  idProperty: 'id',
                  data: items
               })
            });
            assert.equal(dropdownController._items, null);
         });

         it('before update new key', () => {
            let dropdownController = getDropdownController(config),
               selectedItems = [];
            let dataLoadCallback = function(items) {
               selectedItems = items;
            };
            dropdownController._selectedItems = [];
            dropdownController._items = itemsRecords;
            dropdownController._beforeUpdate({
               selectedKeys: '[6]',
               keyProperty: 'id',
               filter: config.filter,
               dataLoadCallback: dataLoadCallback
            });
            assert.deepEqual(selectedItems[0].getRawData(), items[5]);
         });

         it('check empty item update', () => {
            let dropdownController = getDropdownController(config),
               selectedItems = [];
            dropdownController._selectedItems = [];
            let dataLoadCallback = function(items) {
               selectedItems = items;
            };
            Dropdown._private.updateSelectedItems(dropdownController, '123', [null], 'id', dataLoadCallback);
            assert.deepEqual(selectedItems, [null]);

            Dropdown._private.updateSelectedItems(dropdownController, '123', [], 'id');
            assert.deepEqual(selectedItems, [null]);
         });

         it('_open dropdown', () => {
            let dropdownController = getDropdownController(config),
               opened = false;
            dropdownController._items = itemsRecords;
            dropdownController._children.DropdownOpener = {
               open: () => { opened = true;}
            };
            dropdownController._open();
            assert.isTrue(opened);
         });

         it('_open dropdown without items', () => {
            let dropdownController = getDropdownController(config),
               opened = false;
            dropdownController._items = Clone(itemsRecords);
            dropdownController._items.clear();
            dropdownController._children.DropdownOpener = {
               open: () => { opened = true;}
            };
            dropdownController._open();
            assert.isFalse(opened);
         });

         it('_open one item', () => {
            let selectedItems;
            let dropdownController = getDropdownController(config);
            let item = new collection.RecordSet({
               idProperty: 'id',
               rawData: [ {id: 1, title: 'Запись 1'} ]
            });
            dropdownController._items = item;
            dropdownController._notify = (e, data) => {
               if (e === 'selectedItemsChanged') {
                  selectedItems = data[0];
               }
            };
            dropdownController._open();
            assert.deepEqual(selectedItems, item.at(0));
         });

         it('_open lazyLoad', () => {
            let dropdownController = getDropdownController(configLazyLoad);
            dropdownController._selectedItems = [];
            dropdownController._children.DropdownOpener = {
               close: setTrue.bind(this, assert),
               open: setTrue.bind(this, assert)
            };
            dropdownController._open();
         });

         it('mousedown', () => {
            let dropdownController = getDropdownController(configLazyLoad);
            let opened = false;
            let items = new collection.RecordSet({
               idProperty: 'id',
               rawData: [ {id: 1, title: 'Запись 1'}, {id: 2, title: 'Запись 2'} ]
            });
            dropdownController._items = items;
            dropdownController._children.DropdownOpener = {
               close: function() {
                  opened = false;
               },
               open: function() {
                  opened = true;
               },
               isOpened: function() {
                  return opened;
               }
            };
            dropdownController._mousedown();
            setTimeout(function() {
               assert.isTrue(opened);
            }, 100);

            dropdownController._mousedown();
            assert.isFalse(opened);
         });

         it('_private::closeHandler', function() {
            let config2 = Clone(config), closed, closeActivated;
            config2.close = () => {closeActivated = true};
            let dropdownConroller = getDropdownController(config2);
            dropdownConroller._notify = function(event) {
               if (event === '_close') {
                  closed = true;
               }
            };
            dropdownConroller._beforeMount(config2);
            dropdownConroller._onClose();
            assert.isTrue(closeActivated);
            assert.isTrue(closed);
         });

         function setTrue(assert) {
            assert.equal(true, true);
         }
      });
   });
