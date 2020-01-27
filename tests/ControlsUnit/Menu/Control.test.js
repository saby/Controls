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

      });
   }
);
