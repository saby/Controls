define(
   [
      'Controls/dropdown',
      'Types/source',
      'Core/core-clone',
      'Controls/history',
      'Core/Deferred',
      'Types/entity',
      'Types/collection'
   ],
   (dropdown, sourceLib, Clone, history, Deferred, entity, collection) => {
      describe('MenuButton', () => {
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
               icon: 'icon-medium icon-Doge icon-primary'
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
               title: 'Запись 6'
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
            rawData: Clone(items)
         });

         let config = {
            icon: 'icon-medium icon-Doge icon-primary',
            viewMode: 'link',
            style: 'secondary',
            showHeader: true,
            keyProperty: 'id',
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            })
         };

         let testConfig = {
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

         let menu = new dropdown.Button(config);

         it('check item click', () => {
            let testEvent;
            menu._notify = (e, d) => {
               assert.isTrue(e === 'menuItemActivate' || e === 'onMenuItemActivate');
               testEvent = d[1];
               if (e === 'onMenuItemActivate') {
                  return false;
               }
            };
            let nativeEvent = {
               keyCode: 28
            };
            let eventResult = menu._onItemClickHandler([{
               id: '1',
               title: 'Запись 1'
            }], nativeEvent);

            assert.isFalse(eventResult);
            assert.deepEqual(testEvent, nativeEvent);
         });

         it('_beforeMount', () => {
            menu._beforeMount(config);
            assert.equal(menu._offsetClassName, 'controls-MenuButton_link_iconSize-medium_popup');
            assert.isTrue(menu._hasItems);

            let newConfig = Clone(testConfig),
               loadedItems;
            newConfig.dataLoadCallback = (items) => {loadedItems = items;};
            menu._beforeMount(newConfig).then((beforeMountResult) => {
               assert.deepEqual(beforeMountResult.items.getRawData(), itemsRecords.getRawData());
               assert.deepEqual(loadedItems.getRawData(), itemsRecords.getRawData());

               newConfig.historyId = 'TEST_HISTORY_ID';
               menu._beforeMount(newConfig).then((res) => {
                  assert.isTrue(res.hasOwnProperty('history'));

                  newConfig.selectedKeys = [];
                  let history = {
                     frequent: [],
                     pinned: [],
                     recent: []
                  };
                  menu._beforeMount(newConfig, {}, { history: history, items: itemsRecords.clone() }).then((historyRes) => {
                     assert.deepEqual(menu._source._oldItems.getRawData(), itemsRecords.getRawData());
                     assert.deepEqual(menu._source.getHistory(), history);
                     done();
                     return historyRes;
                  });

                  return res;
               });
            });
         });

         it('before mount navigation', (done) => {
            let navigationConfig = Clone(testConfig);
            navigationConfig.navigation = {view: 'page', source: 'page', sourceConfig: {pageSize: 2, page: 0, hasMore: false}};
            menu._beforeMount(navigationConfig).addCallback(function(beforeMountResult) {
               assert.deepEqual(beforeMountResult.items.getCount(), 2);
               done();
            });
         });

         it('check received state', () => {
            return menu._beforeMount(config, null, { items: itemsRecords.clone() }).then(() => {
               assert.deepEqual(menu._controller._items.getRawData(), itemsRecords.getRawData());
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
            return menu._beforeMount(config, null, itemsRecords.clone()).then(() => {
               assert.deepEqual(selectedItems, [null]);
               assert.isTrue(selectedItemsChangeCalled);
            });
         });

         it('before mount filter', (done) => {
            let filterConfig = Clone(testConfig);
            filterConfig.filter = {id: ['3', '4']};
            menu._beforeMount(filterConfig).addCallback(function(beforeMountResult) {
               assert.deepEqual(beforeMountResult.items.getCount(), 2);
               done();
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
            return menu._beforeMount(config, null, itemsRecords.clone()).then(() => {
               assert.deepEqual(selectedItems, []);
               assert.isTrue(selectedItemsChangeCalled);
            });
         });

         it('_handleClick', () => {
            let eventStopped = false;
            const event = {
               stopPropagation: () => { eventStopped = true; }
            };

            menu._handleClick(event);
            assert.isTrue(eventStopped);
         });

         it('_beforeUpdate', function() {
            let newOptions = Clone(config);
            newOptions.icon = 'icon-small icon-Doge icon-primary';
            newOptions.viewMode = 'link';
            menu._beforeUpdate(newOptions);
            assert.equal(menu._offsetClassName, 'controls-MenuButton_link_iconSize-small_popup');

            newOptions.icon = 'icon-small icon-Doge icon-primary';
            newOptions.viewMode = 'button';
            menu._beforeUpdate(newOptions);
            assert.equal(menu._offsetClassName, 'controls-MenuButton_button_iconSize-small_popup');

            newOptions.viewMode = 'functionalButton';
            newOptions.size = 'm';
            menu._beforeUpdate(newOptions);
            assert.equal(menu._offsetClassName, 'controls-MenuButton_functionalButton__l_popup');

            newOptions.icon = 'icon-Doge';
            newOptions.iconSize = null;
            newOptions.viewMode = 'button';
            menu._beforeUpdate(newOptions);
            assert.equal(menu._offsetClassName, 'controls-MenuButton_button_iconSize-medium_popup');

            newOptions.showHeader = false;
            newOptions.icon = 'icon-small icon-Doge icon-primary';
            newOptions.viewMode = 'link';
            menu._beforeUpdate(newOptions);
            assert.equal(menu._offsetClassName, 'controls-MenuButton_link_iconSize-small_duplicate_popup');

            newOptions.icon = 'icon-Doge';
            newOptions.iconSize = 's';
            newOptions.viewMode = 'button';
            menu._beforeUpdate(newOptions);
            assert.equal(menu._offsetClassName, 'controls-MenuButton_button_iconSize-small_duplicate_popup');


            newOptions.viewMode = 'link';
            newOptions.iconSize = 'l';
            menu._beforeUpdate(newOptions);
            assert.equal(menu._offsetClassName, 'controls-MenuButton_link_iconSize-large_duplicate_popup');
         });
      });
   }
);
