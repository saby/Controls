define(
   [
      'Controls/dropdown',
      'Types/source',
      'Core/core-clone',
      'Controls/history',
      'Core/Deferred',
      'Types/entity',
      'Types/collection',
      'Controls/popup',
      'Controls/buttons'
   ],
   (dropdown, sourceLib, Clone, history, Deferred, entity, collection, popup, buttons) => {
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
            return menu._beforeMount(config, {}, { items: itemsRecords.clone() }).then(() => {
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
            return menu._beforeMount(config, null, null).then(() => {
               assert.deepEqual(selectedItems, []);
               assert.isTrue(selectedItemsChangeCalled);
            });
         });

         it('_mouseEnterHandler', () => {
            menu._beforeMount(config);

            menu._handleMouseEnter();
            assert.isOk(menu._dependenciesTimer);

            menu._dependenciesTimer = null;
            menu._options.readOnly = true;
            menu._handleMouseEnter();
            assert.isNull(menu._dependenciesTimer);
         });

         it('_handleClick', () => {
            let eventStopped = false;
            const event = {
               stopPropagation: () => { eventStopped = true; }
            };

            menu._handleClick(event);
            assert.isTrue(eventStopped);
         });

         it('_handleKeyDown', () => {
            // Тестируем нажатие не esc список закрыт
            let menuClosed = false;
            menu._controller.closeMenu = () => {
               menuClosed = true;
            };
            const event = {
               nativeEvent: {
                  keyCode: 27
               },
               stopPropagation: () => {}
            };
            menu._handleKeyDown(event);
            assert.isFalse(menuClosed);

            // Тестируем нажатие esc, когда выпадающий список открыт
            menu._isOpened = true;

            menu._handleKeyDown(event);
            assert.isTrue(menuClosed);
         });

         it('events on open/close', async () => {
            let menuOpenNotified, menuCloseNotified;
            menu._notify = function(e) {
               if (e === 'dropDownOpen') {
                  menuOpenNotified = true;
               } else if (e === 'dropDownClose') {
                  menuCloseNotified = true;
               }
            };
            menu._onOpen();
            menu._onClose();

            assert.isTrue(menuOpenNotified);
            assert.isTrue(menuCloseNotified);
         });

         it('lazy load', () => {
            config.lazyItemsLoading = true;
            menu._beforeMount(config);
            assert.equal(menu._controller._items, undefined);
         });

         it('check pin click', () => {
            let closed = false, opened;
            let resultItem;
            config.lazyItemsLoading = true;

            menu._beforeMount(config);
            menu._controller._items = itemsRecords.clone();
            popup.Sticky.closePopup = () => {closed = true; };
            popup.Sticky.openPopup = () => {opened = true; };

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
            let historySource = new history.Source({
               historyId: 'TEST_HISTORY_ID_DDL_CONTROLLER'
            });

            menu._options.source = historySource;
            menu._options.source.update = () => {};
            menu._onResult('pinClick', item);
            assert.isFalse(closed);
         });

         it('notify footerClick', () => {
            menu._notify = function(e) {
               if (e === 'footerClick') {
                  isFooterClicked = true;
               }
            };
            let isClosed = false, isFooterClicked = false;
            popup.Sticky.closePopup = () => {isClosed = true; };
            menu._$active = true;
            menu._onResult('footerClick');
            assert.isFalse(isClosed);
            assert.isTrue(isFooterClicked);
         });

         it('check item click', () => {
            let closed = false;
            let opened = false;
            let closeByNodeClick = false;
            let resultItems;
            menu._onItemClickHandler = function(eventResult) {
               resultItems = eventResult[0];
               return closeByNodeClick;
            };
            menu._beforeMount(config);
            menu._controller._items = itemsRecords.clone();
            popup.Sticky.closePopup = () => {closed = true; };
            popup.Sticky.openPopup = () => {opened = true; };

            // returned false from handler and no hierarchy
            menu._onResult('itemClick', menu._controller._items.at(4));
            assert.isFalse(closed);

            // returned undefined from handler and there is hierarchy
            closed = false;
            closeByNodeClick = false;
            menu._onResult('itemClick', menu._controller._items.at(5));
            assert.isFalse(closed);

            // returned undefined from handler and no hierarchy
            closed = false;
            menu._isOpened = true;
            closeByNodeClick = undefined;
            menu._onResult('itemClick', menu._controller._items.at(4));
            assert.isTrue(closed);

            // returned true from handler and there is hierarchy
            closed = false;
            closeByNodeClick = undefined;
            menu._onResult('itemClick', menu._controller._items.at(5));
            assert.isTrue(closed);
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
            newOptions.fontSize = 'm';
            newOptions.inlineHeight = 'l';
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

         it('_dataLoadCallback', () => {
            let loadedItems = new collection.RecordSet({ rawData: [] });
            menu._dataLoadCallback(loadedItems);
            assert.isFalse(menu._hasItems);

            loadedItems = new collection.RecordSet({ rawData: [{ id: 1 }] });
            menu._dataLoadCallback(loadedItems);
            assert.isTrue(menu._hasItems);
         });

         it('check target', () => {
            let actualTarget;
            menu._controller = {
               openMenu: () => Promise.resolve(),
               setMenuPopupTarget: (target) => {actualTarget = target;},
               setFilter: () => {}
            };
            menu._children = {
               content: 'testTarget'
            };
            menu.openMenu();
            assert.equal(actualTarget, 'testTarget');
         });

         it('_deactivated', function() {
            let opened = true;
            menu._controller.closeMenu = () => { opened = false; };
            menu._deactivated();
            assert.isFalse(opened);
         });
      });
   }
);
