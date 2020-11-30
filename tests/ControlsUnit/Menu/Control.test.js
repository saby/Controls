define(
   [
      'Controls/menu',
      'Types/source',
      'Core/core-clone',
      'Controls/display',
      'Types/collection',
      'Types/entity',
      'Controls/Constants',
      'Controls/popup'
   ],
   function(menu, source, Clone, display, collection, entity, ControlsConstants, popup) {
      describe('Menu:Control', function() {
         function getDefaultItems() {
            return [
               { key: 0, title: 'все страны' },
               { key: 1, title: 'Россия' },
               { key: 2, title: 'США' },
               { key: 3, title: 'Великобритания' }
            ];
         }

         function getDefaultOptions() {
            return {
               displayProperty: 'title',
               keyProperty: 'key',
               selectedKeys: [],
               root: null,
               source: new source.Memory({
                  keyProperty: 'key',
                  data: getDefaultItems()
               })
            };
         }

         let defaultItems = getDefaultItems();
         let defaultOptions = getDefaultOptions();

         let getListModel = function(items) {
            return new display.Collection({
               collection: new collection.RecordSet({
                  rawData: items || defaultItems,
                  keyProperty: 'key'
               }),
               keyProperty: 'key'
            });
         };

         let getMenu = function(config) {
            const menuControl = new menu.Control(config);
            menuControl.saveOptions(config || defaultOptions);
            menuControl._stack = new popup.StackOpener();
            return menuControl;
         };

         describe('loadItems', () => {
            it('loadItems returns items', async() => {
               const menuControl = getMenu();
               const items = await menuControl._loadItems(defaultOptions);
               assert.deepEqual(items.getRawData().length, defaultItems.length);
            });

            it('with navigation', () => {
               const menuOptions = Clone(defaultOptions);
               menuOptions.navigation = {
                  view: 'page',
                  source: 'page',
                  sourceConfig: { pageSize: 2, page: 0, hasMore: false }
               };
               const menuControl = getMenu(menuOptions);
               return new Promise((resolve) => {
                  menuControl._loadItems(menuOptions).addCallback((items) => {
                     assert.equal(items.getCount(), 2);
                     resolve();
                  });
               });
            });

            it('with dataLoadCallback in options', () => {
               let isDataLoadCallbackCalled = false;
               let menuControl = getMenu();
               let menuOptions = Clone(defaultOptions);
               menuOptions.dataLoadCallback = () => {
                  isDataLoadCallbackCalled = true;
               };
               return new Promise((resolve) => {
                  menuControl._loadItems(menuOptions).addCallback(() => {
                     assert.isTrue(isDataLoadCallbackCalled);
                     resolve();
                  });
               });
            });

            it('query returns error', async() => {
               const options = Clone(defaultOptions);
               const menuControl = getMenu();

               options.source.query = () => Promise.reject(new Error());

               await menuControl._loadItems(options).catch(() => {
                  assert.isNotNull(menuControl._errorConfig);
               });
            });
         });

         describe('_beforeUpdate', () => {
            it('source is changed', async() => {
               let isClosed = false;
               const menuControl = getMenu();
               const newMenuOptions = { ...defaultOptions };

               menuControl._closeSubMenu = () => { isClosed = true; };
               newMenuOptions.source = new source.Memory();
               await menuControl._beforeUpdate(newMenuOptions);
               assert.isTrue(menuControl._notifyResizeAfterRender);
               assert.isTrue(isClosed);
            });

            it('searchValue is changed', async() => {
               let isClosed = false;
               let isViewModelCreated = false;
               const menuControl = getMenu();
               const newMenuOptions = { ...defaultOptions, searchParam: 'title' };

               menuControl._closeSubMenu = () => { isClosed = true; };
               menuControl._createViewModel = () => {
                  isViewModelCreated = true;
               };
               newMenuOptions.sourceController = {
                  getItems: () => 'test'
               };
               newMenuOptions.searchValue = '123';
               await menuControl._beforeUpdate(newMenuOptions);
               assert.isTrue(menuControl._notifyResizeAfterRender);
               assert.isTrue(isClosed);
               assert.isTrue(isViewModelCreated);
            });
         });

         describe('_beforeMount', () => {
            const menuControl = getMenu();
            const menuOptions = { ...defaultOptions };
            menuControl._markerController = null;

            it('_loadItems return error', async() => {
               menuControl._loadItems = () => {
                  return Promise.reject(new Error());
               };
               await menuControl._beforeMount(menuOptions);

               assert.isNull(menuControl._markerController);
            });

            it('_loadItems return items', async() => {
               menuControl._listModel = {
                  setMarkedKey: () => {}
               };
               menuControl._loadItems = () => {
                  return new Promise((resolve) => {
                     resolve(new collection.RecordSet({
                        rawData: [
                           { key: 1, title: 'Test' },
                        ],
                        keyProperty: 'key'
                     }));
                  });
               };
               await menuControl._beforeMount(menuOptions);
               assert.isNotNull(menuControl._markerController);
            });
         });

         describe('getCollection', function() {
            let menuControl = new menu.Control();
            let items = new collection.RecordSet({
               rawData: defaultItems.map((item) => {
                  item.group = item.key < 2 ? '1' : '2';
                  return item;
               }),
               keyProperty: 'key'
            });

            it ('check group', function() {
               let listModel = menuControl._getCollection(items, {
                  groupProperty: 'group'
               });
               assert.instanceOf(listModel.at(0), display.GroupItem);
            });

            it ('check uniq', function() {
               let doubleItems = new collection.RecordSet({
                  rawData: [
                     { key: 1, title: 'Россия' },
                     { key: 1, title: 'Россия' },
                     { key: 1, title: 'Россия' },
                     { key: 1, title: 'Россия' },
                     { key: 1, title: 'Россия' }
                  ],
                  keyProperty: 'key'
               });
               let listModel = menuControl._getCollection(doubleItems, { keyProperty: 'key' });
               assert.equal(listModel.getCount(), 1);
            });

            it ('check history filter', function() {
               let isFilterApply = false;
               menuControl._limitHistoryFilter = () => {
                  isFilterApply = true;
               };
               menuControl._getCollection(items, {
                  allowPin: true,
                  root: null
               });

               assert.isTrue(isFilterApply);
            });
         });

         describe('_isExpandButtonVisible', function() {
            let menuControl, items;
            beforeEach(() => {
               const records = [];
               for (let i = 0; i < 15; i++) {
                  records.push({ get: () => {} });
               }
               menuControl = getMenu();
               items = new collection.RecordSet({
                  rawData: records,
                  keyProperty: 'key'
               });
            });

            it('expandButton visible, history menu', () => {
               const newMenuOptions = { allowPin: true, root: null };

               const result = menuControl._isExpandButtonVisible(items, newMenuOptions);
               assert.isTrue(result);
               assert.equal(menuControl._visibleIds.length, 10);
            });

            it('expandButton hidden, history menu', () => {
               const newMenuOptions = { allowPin: true };

               const result = menuControl._isExpandButtonVisible(items, newMenuOptions);
               assert.isFalse(result, 'level is not first');
               assert.equal(menuControl._visibleIds.length, 0);
            });

            it('expandButton hidden, history menu, with parent', () => {
               let records = [];
               for (let i = 0; i < 20; i++) {
                  records.push({ parent: i < 15 });
               }
               items = new collection.RecordSet({
                  rawData: records,
                  keyProperty: 'key'
               });
               const newMenuOptions = { allowPin: true, root: null, parentProperty: 'parent' };

               const result = menuControl._isExpandButtonVisible(items, newMenuOptions);
               assert.isFalse(result);
               assert.equal(menuControl._visibleIds.length, 5);
            });
         });

         describe('_itemClick', function() {
            let menuControl;
            let selectedItem, selectedKeys, pinItem, item;

            beforeEach(function() {
               menuControl = getMenu();
               menuControl._listModel = getListModel();
               menuControl._context = {
                  isTouch: { isTouch: false }
               };

               menuControl._notify = (e, data) => {
                  if (e === 'selectedKeysChanged') {
                     selectedKeys = data[0];
                  } else if (e === 'itemClick') {
                     selectedItem = data[0];
                  } else if (e === 'pinClick') {
                     pinItem = data[0];
                  }
               };
               item = new entity.Model({
                  rawData: defaultItems[1],
                  keyProperty: 'key'
               });
            });
            it('check selected item', function() {
               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedItem.getKey(), 1);
            });

            it('multiSelect=true', function() {
               menuControl._options.multiSelect = true;

               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedItem.getKey(), 1);

               menuControl._selectionChanged = true;
               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedKeys[0], 1);
            });

            it('multiSelect=true, click on fixed item', function() {
               menuControl._options.multiSelect = true;
               item = item.clone();
               item.set('pinned', true);

               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedItem.getKey(), 1);

               menuControl._selectionChanged = true;
               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedItem.getKey(), 1);
            });

            it('multiSelect=true, click on history item', function() {
               menuControl._options.multiSelect = true;
               item = item.clone();
               item.set('pinned', true);
               item.set('HistoryId', null);

               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedItem.getKey(), 1);

               menuControl._selectionChanged = true;
               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedKeys[0], 1);
            });

            it('check pinClick', function() {
               let isPinClick = false;
               let nativeEvent = {
                  target: { closest: () => isPinClick }
               };
               menuControl._itemClick('itemClick', item, nativeEvent);
               assert.isUndefined(pinItem);

               isPinClick = true;
               menuControl._itemClick('itemClick', item, nativeEvent);
               assert.equal(pinItem.getId(), item.getId());
            });

            it('select empty item', function() {
               let emptyMenuControl = getMenu({...defaultOptions, emptyKey: null, emptyText: 'Not selected', multiSelect: true});
               let emptyItems = Clone(defaultItems);
               emptyItems.push({
                  key: null,
                  title: 'Not selected'
               });
               emptyMenuControl._listModel = getListModel(emptyItems);
               emptyMenuControl._notify = (e, data) => {
                  if (e === 'selectedKeysChanged') {
                     selectedKeys = data[0];
                  }
               };

               emptyMenuControl._selectionChanged = true;
               emptyMenuControl._itemClick('itemClick', item, {});
               assert.equal(selectedKeys[0], 1);

               emptyMenuControl._itemClick('itemClick', item, {});
               assert.equal(selectedKeys[0], null);

               emptyMenuControl._itemClick('itemClick', item, {});
               assert.equal(selectedKeys[0], 1);
            });

            describe('check touch devices', function() {
               beforeEach(() => {
                  menuControl._context.isTouch.isTouch = true;
                  selectedItem = null;
               });

               it('submenu is not open, item is list', function() {
                  sinon.stub(menuControl, '_handleCurrentItem');
                  menuControl._itemClick('itemClick', item, {});
                  assert.equal(selectedItem.getKey(), 1);
               });

               it('submenu is not open, item is node', function() {
                  sinon.stub(menuControl, '_handleCurrentItem');
                  item.set('node', true);
                  menuControl._options.nodeProperty = 'node';
                  menuControl._itemClick('itemClick', item, {});
                  sinon.assert.calledOnce(menuControl._handleCurrentItem);
                  assert.isNull(selectedItem);
                  sinon.restore();
               });

               it('submenu is open', function() {
                  menuControl._subDropdownItem = menuControl._listModel.at(1);
                  menuControl._itemClick('itemClick', menuControl._listModel.at(1).getContents(), {});
                  assert.equal(selectedItem.getKey(), 1);
               });
            });
         });

         describe('_itemMouseEnter', function() {
            let menuControl, handleStub;
            let sandbox = sinon.createSandbox();
            let collectionItem = new display.CollectionItem({
               contents: new entity.Model()
            });

            beforeEach(() => {
               menuControl = getMenu();
               menuControl._context = {
                  isTouch: { isTouch: false }
               };
               handleStub = sandbox.stub(menuControl, '_startOpeningTimeout');
            });

            it('on groupItem', function() {
               menuControl._itemMouseEnter('mouseenter', new display.GroupItem());
               assert.isTrue(handleStub.notCalled);
            });

            it('on collectionItem', function() {
               menuControl._itemMouseEnter('mouseenter', collectionItem, { target: 'targetTest', nativeEvent: 'nativeEvent' });
               assert.isTrue(handleStub.calledOnce);
               assert.equal(menuControl._hoveredTarget, 'targetTest');
               assert.equal(menuControl._enterEvent, 'nativeEvent');
            });

            it('on touch devices', function() {
               menuControl._context.isTouch.isTouch = true;
               menuControl._itemMouseEnter('mouseenter', collectionItem, {});
               assert.isTrue(handleStub.notCalled);
            });

            describe('close opened menu', function() {
               let isClosed = false;
               beforeEach(() => {
                  menuControl._children.Sticky = {
                     close: () => { isClosed = true; }
                  };
                  menuControl._subMenu = true;
               });

               it('subMenu is close', function() {
                  menuControl._itemMouseEnter('mouseenter', collectionItem, { target: 'targetTest', nativeEvent: 'nativeEvent' });
                  assert.isTrue(handleStub.calledOnce);
                  assert.isFalse(isClosed);
               });

               it('subMenu is open, mouse on current item = subDropdownItem', function() {
                  this._subDropdownItem = collectionItem;
                  menuControl._itemMouseEnter('mouseenter', collectionItem, { target: 'targetTest', nativeEvent: 'nativeEvent' });
                  assert.isTrue(handleStub.calledOnce);
                  assert.isFalse(isClosed);
               });
            });

            sinon.restore();
         });

         it('getTemplateOptions', function() {
            let menuControl = getMenu();
            menuControl._isLoadedChildItems = () => true;
            menuControl._listModel = getListModel();

            let item = menuControl._listModel.at(1);

            const expectedOptions = Clone(defaultOptions);
            expectedOptions.root = 1;
            expectedOptions.bodyContentTemplate = 'Controls/_menu/Control';
            expectedOptions.dataLoadCallback = null;
            expectedOptions.source = new source.PrefetchProxy({
               target: menuControl._options.source,
               data: {
                  query: menuControl._listModel.getCollection()
               }
            });
            expectedOptions.footerContentTemplate = defaultOptions.nodeFooterTemplate;
            expectedOptions.footerItemData = {
               item,
               key: expectedOptions.root
            };
            expectedOptions.emptyText = null;
            expectedOptions.closeButtonVisibility = false;
            expectedOptions.showClose = false;
            expectedOptions.showHeader = false;
            expectedOptions.headerTemplate = null;
            expectedOptions.headerContentTemplate = null;
            expectedOptions.additionalProperty = null;
            expectedOptions.itemPadding = null;
            expectedOptions.searchParam = null;
            expectedOptions.iWantBeWS3 = false;

            let resultOptions = menuControl._getTemplateOptions(item);
            assert.deepEqual(resultOptions, expectedOptions);
         });

         it('isSelectedKeysChanged', function() {
            let menuControl = getMenu();
            let initKeys = [];
            let result = menuControl._isSelectedKeysChanged([], initKeys);
            assert.isFalse(result);

            result = menuControl._isSelectedKeysChanged([2], initKeys);
            assert.isTrue(result);

            initKeys = [2, 1];
            result = menuControl._isSelectedKeysChanged([1, 2], initKeys);
            assert.isFalse(result);
         });

         it('setSubMenuPosition', function() {
            let menuControl = getMenu();
            menuControl._openSubMenuEvent = {
               clientX: 25
            };

            menuControl._subMenu = {
               getBoundingClientRect: () => ({
                  left: 10,
                  top: 10,
                  height: 200,
                  width: 100
               })
            };

            menuControl._setSubMenuPosition();
            assert.deepEqual(menuControl._subMenuPosition, {

               // т.к. left < clientX, прибавляем ширину к left
               left: 110,
               top: 10,
               height: 200
            });
         });

         describe('_updateSwipeItem', function() {
            let menuControl = getMenu();
            menuControl._listModel = getListModel();

            const item1 = menuControl._listModel.at(0);
            const item2 = menuControl._listModel.at(1);

            it('swipe to the left', () => {
               menuControl._updateSwipeItem(item1, true);
               assert.isTrue(item1.isSwiped());
            });

            it('swipe to the left another item', () => {
               menuControl._updateSwipeItem(item2, true);
               assert.isTrue(item2.isSwiped(), 'swipe to the left');
               assert.isFalse(item1.isSwiped(), 'swipe to the left');
            });

            it('swipe to the right', () => {
               menuControl._updateSwipeItem(item2, false);
               assert.isFalse(item1.isSwiped(), 'swipe to the right');
            });
         });

         describe('_separatorMouseEnter', function() {
            let isClosed, isMouseInArea = true, menuControl = getMenu();
            beforeEach(() => {
               isClosed = false;
               menuControl._children = {
                  Sticky: { close: () => { isClosed = true; } }
               };

               menuControl._subMenu = true;
               menuControl._setSubMenuPosition = function() {};
               menuControl._isMouseInOpenedItemAreaCheck = function() {
                  return isMouseInArea;
               };
            });

            it('isMouseInOpenedItemArea = true', function() {
               menuControl._subDropdownItem = true;
               menuControl._separatorMouseEnter('mouseenter', { nativeEvent: {} });
               assert.isFalse(isClosed);
            });

            it('isMouseInOpenedItemArea = true, subMenu is close', function() {
               menuControl._subDropdownItem = false;
               menuControl._separatorMouseEnter('mouseenter', { nativeEvent: {} });
               assert.isFalse(isClosed);
            });

            it('isMouseInOpenedItemArea = false', function() {
               menuControl._subDropdownItem = true;
               isMouseInArea = false;
               menuControl._separatorMouseEnter('mouseenter', { nativeEvent: {} });
               assert.isTrue(isClosed);
            });
         });

         it('_footerMouseEnter', function() {
            let isClosed = false;
            let menuControl = getMenu();
            menuControl._subMenu = true;
            let event = {
               nativeEvent: {}
            };

            menuControl._children = {
               Sticky: { close: () => { isClosed = true; } }
            };
            menuControl._isMouseInOpenedItemAreaCheck = function() {
               return false;
            };
            menuControl._setSubMenuPosition = function() {};
            menuControl._subDropdownItem = true;
            menuControl._footerMouseEnter(event);
            assert.isTrue(isClosed);

            menuControl._isMouseInOpenedItemAreaCheck = function() {
               return true;
            };
            menuControl._subDropdownItem = true;
            isClosed = false;
            menuControl._footerMouseEnter(event);
            assert.isFalse(isClosed);
         });

         it('_openSelectorDialog', function() {
            let menuOptions = Clone(defaultOptions);
            menuOptions.selectorTemplate = {
               templateName: 'DialogTemplate.wml',
               templateOptions: {
                  option1: '1',
                  option2: '2'
               },
               isCompoundTemplate: false
            };
            let menuControl = getMenu(menuOptions);
            menuControl._listModel = getListModel();

            let selectCompleted = false, closed = false, opened = false, actualOptions;

            let sandbox = sinon.createSandbox();
            sandbox.replace(popup.Stack, 'openPopup', (tplOptions) => {
               opened = true;
               actualOptions = tplOptions;
               return Promise.resolve();
            });
            sandbox.replace(popup.Stack, 'closePopup', () => { closed = true; });

            menuControl._options.selectorDialogResult = () => {selectCompleted = true};
            menuControl._options.selectorOpener = 'testSelectorOpener';

            menuControl._openSelectorDialog(menuOptions);

            assert.strictEqual(actualOptions.template, menuOptions.selectorTemplate.templateName);
            assert.strictEqual(actualOptions.isCompoundTemplate, menuOptions.isCompoundTemplate);
            assert.deepStrictEqual(actualOptions.templateOptions.selectedItems.getCount(), 0);
            assert.strictEqual(actualOptions.templateOptions.option1, '1');
            assert.strictEqual(actualOptions.templateOptions.option2, '2');
            assert.isOk(actualOptions.eventHandlers.onResult);
            assert.isTrue(actualOptions.hasOwnProperty('opener'));
            assert.equal(actualOptions.opener, 'testSelectorOpener');
            assert.isTrue(actualOptions.closeOnOutsideClick);
            assert.isTrue(opened);

            actualOptions.eventHandlers.onResult();
            assert.isTrue(closed);
            sandbox.restore();
         });

         it('_openSelectorDialog with empty item', () => {
            let emptyMenuControl = getMenu({
               ...defaultOptions,
               emptyKey: null,
               emptyText: 'Not selected',
               multiSelect: true,
               selectedKeys: ['Not selected'],
               selectorTemplate: {}
            });
            let items = Clone(defaultItems);
            let selectorOptions = {};
            const emptyItem = {
               key: null,
               title: 'Not selected'
            };
            items.push(emptyItem);
            let sandbox = sinon.createSandbox();
            sandbox.replace(popup.Stack, 'openPopup', (tplOptions) => {
               selectorOptions = tplOptions;
               return Promise.resolve();
            });
            emptyMenuControl._listModel = getListModel(items);
            emptyMenuControl._openSelectorDialog({});
            assert.strictEqual(selectorOptions.templateOptions.selectedItems.getCount(), 0);

            sandbox.restore();
         });

         describe('displayFilter', function() {
            let menuControl = getMenu();
            let hierarchyOptions = {
               root: null
            };
            let item = new entity.Model({
               rawData: {key: '1', parent: null},
               keyProperty: 'key'
            });
            let isVisible;

            hierarchyOptions = {
               parentProperty: 'parent',
               nodeProperty: 'node',
               root: null
            };
            it('item parent = null, root = null', function() {
               isVisible = menuControl.constructor._displayFilter(hierarchyOptions, item);
               assert.isTrue(isVisible);
            });

            it('item parent = undefined, root = null', function() {
               item.set('parent', undefined);
               isVisible = menuControl.constructor._displayFilter(hierarchyOptions, item);
               assert.isTrue(isVisible);
            });

            it('item parent = 1, root = null', function() {
               item.set('parent', '1');
               isVisible = menuControl.constructor._displayFilter(hierarchyOptions, item);
               assert.isFalse(isVisible);
            });
         });

         describe('historyFilter', () => {
            let menuControl = getMenu();
            menuControl._visibleIds = [2, 6, 8];
            let itemKey;
            const item = { getKey: () => itemKey };

            it('group item', function() {
               const isVisible = menuControl._limitHistoryCheck('group');
               assert.isTrue(isVisible);
            });

            it('invisible item', function() {
               itemKey = 1;
               const isVisible = menuControl._limitHistoryCheck(item);
               assert.isFalse(isVisible, "_visibleIds doesn't include it");
            });

            it('visible item', function() {
               itemKey = 6;
               const isVisible = menuControl._limitHistoryCheck(item);
               assert.isTrue(isVisible, '_visibleIds includes it');
            });
         });

         describe('groupMethod', function() {
            let menuControl = getMenu();
            let menuOptions = {groupProperty: 'group', root: null};
            let groupId;
            let item = new entity.Model({
               rawData: {key: '1'},
               keyProperty: 'key'
            });

            it('item hasn`t group', function() {
               groupId = menuControl._groupMethod(menuOptions, item);
               assert.equal(groupId, ControlsConstants.view.hiddenGroup);
            });

            it('group = 0', function() {
               item.set('group', 0);
               groupId = menuControl._groupMethod(menuOptions, item);
               assert.equal(groupId, 0);
            });

            it('item is history', function() {
               item.set('pinned', true);
               groupId = menuControl._groupMethod(menuOptions, item);
               assert.equal(groupId, ControlsConstants.view.hiddenGroup);
            });

            it('item is history, root = 2', function() {
               menuOptions.root = 2;
               groupId = menuControl._groupMethod(menuOptions, item);
               assert.equal(groupId, ControlsConstants.view.hiddenGroup);
            });
         });

         describe('itemActions', function() {
            it('_openItemActionMenu', () => {
               let isOpened = false;
               let actualConfig;
               let menuControl = getMenu();
               menuControl._itemActionsController = {
                  prepareActionsMenuConfig: () => ({ param: 'menuConfig' }),
                  setActiveItem: () => {}
               };
               menuControl._itemActionSticky = {
                  open: (menuConfig) => {
                     actualConfig = menuConfig;
                     isOpened = true;
                  }
               };
               menuControl._openItemActionMenu('item', {}, null);
               assert.isTrue(isOpened);
               assert.isOk(actualConfig.eventHandlers);
            });
         });

         it('_changeIndicatorOverlay', function() {
            let menuControl = getMenu();
            let indicatorConfig = {
               delay: 100,
               overlay: 'default'
            };
            menuControl._changeIndicatorOverlay('showIndicator', indicatorConfig);
            assert.equal(indicatorConfig.overlay, 'none');
         });

         it('getCollection', function() {
            let menuControl = getMenu();
            let listModel = menuControl._getCollection(new collection.RecordSet(), {
               searchParam: 'title',
               searchValue: 'searchText'
            });
            assert.instanceOf(listModel, display.Search);
         });
         // TODO тестируем только публичные методы
         // it('_itemActionClick', function() {
         //    let isHandlerCalled = false;
         //    let menuControl = getMenu();
         //    menuControl._listModel = getListModel();
         //    let action = {
         //       id: 1,
         //       icon: 'icon-Edit',
         //       iconStyle: 'secondary',
         //       title: 'edit',
         //       showType: 2,
         //       handler: function() {
         //          isHandlerCalled = true;
         //       }
         //    };
         //    let clickEvent = {
         //       stopPropagation: () => {}
         //    };
         //
         //    menuControl._itemActionClick('itemActionClick', menuControl._listModel.at(1), action, clickEvent);
         //    assert.isTrue(isHandlerCalled);
         // });

         describe('_subMenuResult', function() {
            let menuControl, stubClose, eventResult, nativeEvent, sandbox;
            beforeEach(() => {
               menuControl = getMenu();
               menuControl._notify = (event, data) => {
                  eventResult = data[0];
                  nativeEvent = data[1];
               };
               sandbox = sinon.createSandbox();
               stubClose = sandbox.stub(menuControl, '_closeSubMenu');
            });
            afterEach(() => {
               sandbox.restore();
            });

            it('menuOpened event', function() {
               const data = { container: 'subMenu' };
               menuControl._subMenuResult('click', 'menuOpened', data);
               assert.deepEqual(menuControl._subMenu, data);
            });
            it('pinClick event', function() {
               menuControl._subMenuResult('click', 'pinClick', { item: 'item1' });
               assert.deepEqual(eventResult, { item: 'item1' });
               assert.isTrue(stubClose.calledOnce);
            });
            it('itemClick event', function() {
               menuControl._subMenuResult('click', 'itemClick', { item: 'item2' }, 'testEventName');
               assert.equal(nativeEvent, 'testEventName');
               assert.deepEqual(eventResult, { item: 'item2' });
               assert.isTrue(stubClose.calledOnce);
            });
            it('itemClick event return false', function() {
               menuControl._notify = (event, data) => {
                  eventResult = data[0];
                  nativeEvent = data[1];
                  return false;
               };
               menuControl._subMenuResult('click', 'itemClick', { item: 'item2' }, 'testEvent');
               assert.equal(nativeEvent, 'testEvent');
               assert.deepEqual(eventResult, { item: 'item2' });
               assert.isTrue(stubClose.notCalled);
            });
         });

         describe('multiSelect: true', () => {
            it('_beforeUpdate hook', async() => {
               const options = {
                  ...getDefaultOptions(),
                  selectedKeys: [null]
               };
               const menuControl = new menu.Control(options);
               await menuControl._beforeMount(options);
               menuControl.saveOptions(options);

               menuControl._beforeUpdate(options);
               assert.equal(menuControl._markerController.getMarkedKey(), null);
            });
         });

      });
   }
);
