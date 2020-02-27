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

         describe('_itemClick', function() {
            let menuControl;
            let selectedItem, selectedKeys, pinItem, item;

            beforeEach(function() {
               menuControl = getMenu();
               menuControl._listModel = getListModel();

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
         });

         it('getTemplateOptions', function() {
            const expectedOptions = Clone(defaultOptions);
            expectedOptions.root = 1;
            expectedOptions.footerTemplate = defaultOptions.nodeFooterTemplate;
            expectedOptions.bodyContentTemplate = 'Controls/_menu/Control';
            expectedOptions.closeButtonVisibility = false;
            expectedOptions.showHeader = false;
            expectedOptions.headerTemplate = null;
            expectedOptions.additionalProperty = null;

            let menuControl = getMenu();
            menuControl._listModel = getListModel();

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

         it('_calculateActionsConfig', function() {
            let menuControl = getMenu();
            let listModel = getListModel();

            const expectedConfig = {
               itemActionsPosition: 'inside',
               actionCaptionPosition: 'none',
               actionAlignment: 'horizontal',
               style: 'default',
               itemActionsClass: 'controls-Menu__itemActions_position_rightCenter_theme-default'
            };

            menuControl._calculateActionsConfig(listModel, {theme: 'default'});
            assert.deepEqual(listMode.getActionsTemplateConfig(), expextedConfig);
         });

      });
   }
);
