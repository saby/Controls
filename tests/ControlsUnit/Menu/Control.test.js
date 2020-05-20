define(
   [
      'Controls/menu',
      'Types/source',
      'Core/core-clone',
      'Controls/display',
      'Types/collection',
      'Types/entity'
   ],
   function(menu, source, Clone, display, collection, entity) {
      describe('Menu:Control', function() {
         let defaultItems = [
            { key: 0, title: 'все страны' },
            { key: 1, title: 'Россия' },
            { key: 2, title: 'США' },
            { key: 3, title: 'Великобритания' }
         ];

         let defaultOptions = {
            displayProperty: 'title',
            keyProperty: 'key',
            selectedKeys: [],
            root: null,
            source: new source.Memory({
               keyProperty: 'key',
               data: defaultItems
            })
         };

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
            let menuControl = new menu.Control();
            menuControl.saveOptions(config || defaultOptions);
            return menuControl;
         };

         it('_loadItems', function() {
            let menuControl = getMenu();
            return new Promise((resolve) => {
               menuControl.loadItems(defaultOptions).addCallback((items) => {
                  assert.deepEqual(items.getRawData(), defaultItems);
                  resolve();
               });
            });
         });

         it('_loadItems check navigation', function() {
            let menuControl = getMenu();
            let menuOptions = Clone(defaultOptions);
            menuOptions.navigation = {
               view: 'page',
               source: 'page',
               sourceConfig: { pageSize: 2, page: 0, hasMore: false }
            };
            return new Promise((resolve) => {
               menuControl.loadItems(menuOptions).addCallback((items) => {
                  assert.equal(items.getCount(), 2);
                  resolve();
               });
            });
         });

         it('_loadItems check dataLoadCallback', function() {
            let isDataLoadCallbackCalled = false;
            let menuControl = getMenu();
            let menuOptions = Clone(defaultOptions);
            menuOptions.dataLoadCallback = () => {
               isDataLoadCallbackCalled = true;
            };
            return new Promise((resolve) => {
               menuControl.loadItems(menuOptions).addCallback(() => {
                  assert.isTrue(isDataLoadCallbackCalled);
                  resolve();
               });
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
               let listModel = menuControl.getCollection(items, {
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
               let listModel = menuControl.getCollection(doubleItems, { keyProperty: 'key' });
               assert.equal(listModel.getCount(), 1);
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
                  sinon.stub(menuControl, 'handleCurrentItem');
                  menuControl._itemClick('itemClick', item, {});
                  assert.equal(selectedItem.getKey(), 1);
               });

               it('submenu is not open, item is node', function() {
                  sinon.stub(menuControl, 'handleCurrentItem');
                  item.set('node', true);
                  menuControl._options.nodeProperty = 'node';
                  menuControl._itemClick('itemClick', item, {});
                  sinon.assert.calledOnce(menuControl.handleCurrentItem);
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

            beforeEach(() => {
               menuControl = getMenu();
               menuControl._context = {
                  isTouch: { isTouch: false }
               };
               handleStub = sandbox.stub(menuControl, 'handleCurrentItem');
            });

            it('on groupItem', function() {
               menuControl._itemMouseEnter('mouseenter', new display.GroupItem());
               assert.isTrue(handleStub.notCalled);
            });

            it('on collectionItem', function() {
               menuControl._itemMouseEnter('mouseenter', new display.CollectionItem({
                  contents: new entity.Model()
               }), { target: 'targetTest', nativeEvent: 'nativeEvent' });
               assert.isTrue(handleStub.calledOnce);
               assert.equal(menuControl._hoveredTarget, 'targetTest');
               assert.equal(menuControl._enterEvent, 'nativeEvent');
            });

            it('on touch devices', function() {
               menuControl._context.isTouch.isTouch = true;
               menuControl._itemMouseEnter('mouseenter', new display.CollectionItem({
                  contents: new entity.Model()
               }), {});
               assert.isTrue(handleStub.notCalled);
            });

            sinon.restore();
         });

         it('getTemplateOptions', function() {
            let menuControl = getMenu();
            menuControl._listModel = getListModel();

            let item = new display.TreeItem({
               contents: new entity.Model({
                  rawData: { key: 1, title: '111' },
                  keyProperty: 'key'
               }),
               hasChildren: false
            });

            const expectedOptions = Clone(defaultOptions);
            expectedOptions.root = 1;
            expectedOptions.bodyContentTemplate = 'Controls/_menu/Control';
            expectedOptions.footerContentTemplate = defaultOptions.nodeFooterTemplate;
            expectedOptions.footerItemData = {
               item,
               key: expectedOptions.root
            };
            expectedOptions.closeButtonVisibility = false;
            expectedOptions.showClose = false;
            expectedOptions.showHeader = false;
            expectedOptions.headerTemplate = null;
            expectedOptions.headerContentTemplate = null;
            expectedOptions.additionalProperty = null;
            expectedOptions.itemPadding = null;
            expectedOptions.searchParam = null;
            expectedOptions.iWantBeWS3 = false;

            let resultOptions = menuControl.getTemplateOptions(item);
            assert.deepEqual(resultOptions, expectedOptions);
         });

         it('isSelectedKeysChanged', function() {
            let menuControl = getMenu();
            let initKeys = [];
            let result = menuControl.isSelectedKeysChanged([], initKeys);
            assert.isFalse(result);

            result = menuControl.isSelectedKeysChanged([2], initKeys);
            assert.isTrue(result);

            initKeys = [2, 1];
            result = menuControl.isSelectedKeysChanged([1, 2], initKeys);
            assert.isFalse(result);
         });

         it('_footerMouseEnter', function() {
            let isClosed = false;
            let menuControl = getMenu();
            let event = {
               nativeEvent: {}
            };

            menuControl._children = {
               Sticky: { close: () => { isClosed = true; } }
            };
            menuControl.isMouseInOpenedItemArea = function() {
               return false;
            };
            menuControl.setSubMenuPosition = function() {};
            menuControl._subDropdownItem = true;
            menuControl._footerMouseEnter(event);
            assert.isTrue(isClosed);

            menuControl.isMouseInOpenedItemArea = function() {
               return true;
            };
            isClosed = false;
            menuControl._footerMouseEnter(event);
            assert.isFalse(isClosed);
         });

         it('getSelectedItemsByKeys', function() {
            let listModel = getListModel();
            let menuControl = getMenu();
            let selectedKeys = [2, 3];
            let selectedItems = menuControl.getSelectedItemsByKeys(listModel, selectedKeys);
            assert.equal(selectedItems.length, 2);

            selectedKeys = [];
            selectedItems = menuControl.getSelectedItemsByKeys(listModel, selectedKeys);
            assert.equal(selectedItems.length, 0);
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
            menuControl._options.selectorOpener = {
               open: (tplOptions) => { opened = true; actualOptions = tplOptions; },
               close: () => { closed = true; }
            };
            menuControl._options.selectorDialogResult = () => {selectCompleted = true};

            menuControl._openSelectorDialog(menuOptions);

            assert.strictEqual(actualOptions.template, menuOptions.selectorTemplate.templateName);
            assert.strictEqual(actualOptions.isCompoundTemplate, menuOptions.isCompoundTemplate);
            assert.deepStrictEqual(actualOptions.templateOptions.selectedItems.getCount(), 0);
            assert.strictEqual(actualOptions.templateOptions.option1, '1');
            assert.strictEqual(actualOptions.templateOptions.option2, '2');
            assert.isOk(actualOptions.templateOptions.handlers.onSelectComplete);
            assert.isFalse(actualOptions.hasOwnProperty('opener'));
            assert.isTrue(opened);

            actualOptions.templateOptions.handlers.onSelectComplete();
            assert.isTrue(selectCompleted);
            assert.isTrue(closed);
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
            emptyMenuControl._options.selectorOpener = {
               open: (tplOptions) => { selectorOptions = tplOptions; },
            };
            emptyMenuControl._listModel = getListModel(items);
            emptyMenuControl._openSelectorDialog({});
            assert.strictEqual(selectorOptions.templateOptions.selectedItems.getCount(), 0);
         });

         it('displayFilter', function() {
            let menuControl = getMenu();
            let hierarchyOptions = {
               root: null
            };
            let item = new entity.Model({
               rawData: {key: '1', parent: null},
               keyProperty: 'key'
            });
            let isVisible = menuControl.displayFilter(hierarchyOptions, item);
            assert.isTrue(isVisible);

            hierarchyOptions = {
               parentProperty: 'parent',
               nodeProperty: 'node',
               root: null
            };
            isVisible = menuControl.displayFilter(hierarchyOptions, item);
            assert.isTrue(isVisible);

            item.set('parent', undefined);
            isVisible = menuControl.displayFilter(hierarchyOptions, item);
            assert.isTrue(isVisible);

            item.set('parent', '1');
            isVisible = menuControl.displayFilter(hierarchyOptions, item);
            assert.isFalse(isVisible);
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
            let listModel = menuControl.getCollection(new collection.RecordSet(), {
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
               assert.deepEqual(menuControl.subMenu, data);
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

      });
   }
);
