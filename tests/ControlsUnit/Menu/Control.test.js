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

         let getListModel = function() {
            return new display.Collection({
               collection: new collection.RecordSet({
                  rawData: defaultItems,
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

         it('_loadItems check _expandButtonVisible', function() {
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
                  assert.isTrue(menuControl._expandButtonVisible);
                  resolve();
               });
            });
         });

         it('_itemClick', function() {
            let menuControl = getMenu();
            let selectedItem;
            menuControl._notify = (e, data) => {
               if (e === 'itemClick') {
                  selectedItem = data[0];
               }
            };
            menuControl._listModel = getListModel();
            menuControl._itemClick('itemClick', new entity.Model({
               rawData: defaultItems[1],
               keyProperty: 'key'
            }));
            assert.equal(selectedItem.getKey(), 1);
         });

         it('_itemClick multiSelect=true', function() {
            let menuControl = getMenu();
            menuControl._options.multiSelect = true;
            let selectedItem, selectedKeys;
            menuControl._notify = (e, data) => {
               if (e === 'selectedKeysChanged') {
                  selectedKeys = data[0];
               } else if (e === 'itemClick') {
                  selectedItem = data[0];
               }
            };
            menuControl._listModel = getListModel();

            menuControl._itemClick('itemClick', new entity.Model({
               rawData: defaultItems[1],
               keyProperty: 'key'
            }));
            assert.equal(selectedItem.getKey(), 1);

            menuControl._selectionChanged = true;
            menuControl._itemClick('itemClick', new entity.Model({
               rawData: defaultItems[1],
               keyProperty: 'key'
            }));
            assert.equal(selectedKeys[0], 1);
         });

         it('getTemplateOptions', function() {
            const expectedOptions = Clone(defaultOptions);
            expectedOptions.root = 1;
            expectedOptions.footerTemplate = defaultOptions.nodeFooterTemplate;
            expectedOptions.bodyContentTemplate = 'Controls/_menu/Control';
            expectedOptions.closeButtonVisibility = false;

            let menuControl = getMenu();
            let item = new display.TreeItem({
               contents: new entity.Model({
                  rawData: { key: 1, title: '111' },
                  keyProperty: 'key'
               }),
               hasChildren: false
            });
            let resultOptions = menuControl.getTemplateOptions(item);
            assert.deepEqual(resultOptions, expectedOptions);
         });

         it('needShowApplyButton', function() {
            let menuControl = getMenu();
            let initKeys = [];
            let result = menuControl.needShowApplyButton([], initKeys);
            assert.isFalse(result);

            result = menuControl.needShowApplyButton([2], initKeys);
            assert.isTrue(result);

            initKeys = [2, 1];
            result = menuControl.needShowApplyButton([1, 2], initKeys);
            assert.isFalse(result);
         });

         it('getSelectedItems', function() {
            let listModel = getListModel();
            let menuControl = getMenu();
            let selectedKeys = [2, 3];
            let selectedItems = menuControl.getSelectedItems(listModel, selectedKeys);
            assert.equal(selectedItems.length, 2);

            selectedKeys = [];
            selectedItems = menuControl.getSelectedItems(listModel, selectedKeys);
            assert.equal(selectedItems.length, 0);
         });

         it('getSelectorDialogOptions', function() {
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

            let selectCompleted = false, closed = false;
            menuControl._options.selectorOpener = {
               close: () => { closed = true; }
            };
            menuControl._options.selectorDialogResult = () => {selectCompleted = true};

            let actualOptions = menuControl.getSelectorDialogOptions(menuOptions);

            assert.strictEqual(actualOptions.template, menuOptions.selectorTemplate.templateName);
            assert.strictEqual(actualOptions.isCompoundTemplate, menuOptions.isCompoundTemplate);
            assert.deepStrictEqual(actualOptions.templateOptions.selectedItems.getCount(), 0);
            assert.strictEqual(actualOptions.templateOptions.option1, '1');
            assert.strictEqual(actualOptions.templateOptions.option2, '2');
            assert.isOk(actualOptions.templateOptions.handlers.onSelectComplete);
            assert.isFalse(actualOptions.hasOwnProperty('opener'));



            actualOptions.templateOptions.handlers.onSelectComplete();
            assert.isTrue(selectCompleted);
            assert.isTrue(closed);
         });

         describe('_subMenuResult', function() {
            let menuOptions = Clone(defaultOptions);
            let menuControl = getMenu(menuOptions);
            let menuClosed = false;
            let container = {x: 0, y: 0};
            menuControl._closeSubMenu = () => {
               menuClosed = true;
            };
            menuControl._subMenuResult(null, [])
            assert.isUndefined(menuControl.subMenu);
            assert.isTrue(menuClosed);

            menuClosed = false;
            menuControl._subMenuResult(null, container, 'menuOpened');
            assert.deepEqual(menuControl.subMenu, container);
            assert.isFalse(menuClosed);
         });

         describe('_mouseMove', function() {
            let menuOptions = Clone(defaultOptions);
            let menuControl = getMenu(menuOptions);
            let handlerStarted = false;
            menuControl.startHandleItemTimeout = () => {handlerStarted = true;}

            menuControl._isMouseInOpenedItemArea = false;
            menuControl._subDropdownItem = true;
            menuControl._mouseMove();
            assert.isFalse(handlerStarted);

            menuControl._isMouseInOpenedItemArea = true;
            menuControl._mouseMove();
            assert.isTrue(handlerStarted);
         });

         describe('handleCurrentItem', function() {
            let menuOptions = Clone(defaultOptions);
            let menuControl = getMenu(menuOptions);
            let itemHovered = false;
            let menuClosed = false;
            let item = { isNode: () => true,
               getContents: () => { return {get: () => false} }
            };
            menuControl._listModel = {
               setHoveredItem: () => {itemHovered = true;}
            };

            menuControl.setSubMenuPosition = () => {};
            menuControl._closeSubMenu = () => {menuClosed = true};

            it('need open, not in OpenedItemArea', function() {
               menuControl.handleCurrentItem(item);
               assert.deepEqual(menuControl._subDropdownItem, item);
               assert.isTrue(itemHovered);
            });

            it('need close, not in OpenedItemArea', function() {
               item = {isNode: () => false};
               itemHovered = false;
               menuControl.isMouseInOpenedItemArea = () => false;
               menuControl.handleCurrentItem(item);
               assert.isTrue(menuClosed);
               assert.isTrue(itemHovered);
            });

            it('need close, in OpenedItemArea', function() {
               menuClosed = false;
               itemHovered = false;
               item = {isNode: () => false};
               menuControl.isMouseInOpenedItemArea = () => true;
               menuControl.handleCurrentItem(item);
               assert.isFalse(menuClosed);
               assert.isFalse(itemHovered);
            });
         });

         describe('setSubMenuPosition', function() {
            let menuOptions = Clone(defaultOptions);
            let menuControl = getMenu(menuOptions);
            menuControl.subMenu = {
               getBoundingClientRect: () =>{return { x: 10, y: 20, width: 30 }}
            };
            menuControl.subMenu.getBoundingClientRect = () => {
               return { x: 10, y: 20, width: 30 }
            };

            it('submenu is on the right', function() {
               menuControl._openSubMenuEvent = {clientX: 0, clientY: 20};
               menuControl.setSubMenuPosition();
               assert.equal(menuControl._subMenuPosition.x, 10);
            });
            it('submenu is on the left', function() {
               menuControl._openSubMenuEvent = {clientX: 20, clientY: 20};
               menuControl.setSubMenuPosition();
               assert.equal(menuControl._subMenuPosition.x, 40);
            });
         });

         describe('isMouseInOpenedItemArea', function() {
            let menuOptions = Clone(defaultOptions);
            let menuControl = getMenu(menuOptions);
            menuControl._openSubMenuEvent = {
               clientX: 10,
               clientY: 5
            };
            menuControl._subMenuPosition = {
               x: 50,
               y: 0,
               height: 50
            };

            it('point in opened item area', function() {
               let curMouseEvent = {
                  clientX: 40,
                  clientY: 20
               };
               assert.isTrue(menuControl.isMouseInOpenedItemArea(curMouseEvent));
            });

            it('point out of opened item area', function() {
               curMouseEvent = {
                  clientX: 20,
                  clientY: 30
               };
               assert.isFalse(menuControl.isMouseInOpenedItemArea(curMouseEvent));
            });
         });

         describe('handleItemTimeoutCallback', function() {
            let menuOptions = Clone(defaultOptions);
            let menuControl = getMenu(menuOptions);
            let menuClosed = false;
            let itemHadled = false;
            menuControl._closeSubMenu = () => {menuClosed = true;}
            menuControl.handleCurrentItem = () => {itemHadled = true;}

            it('item hasnt opened submenu', function() {
               menuControl._isMouseInOpenedItemArea = true;
               menuControl.handleItemTimeoutCallback();
               assert.isFalse(menuControl._isMouseInOpenedItemArea);
               assert.isFalse(menuClosed);
               assert.isTrue(itemHadled);
            });

            it('item has opened submenu', function() {
               menuControl._isMouseInOpenedItemArea = true;
               itemHadled = false;
               menuControl._hoveredItem = {title: 'test'};
               menuControl._subDropdownItem = {title: 'test1'};
               menuControl.handleItemTimeoutCallback();
               assert.isFalse(menuControl._isMouseInOpenedItemArea);
               assert.isTrue(menuClosed);
               assert.isTrue(itemHadled);
            });
         });
      });
   }
);
