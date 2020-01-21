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
      describe('Menu:Render', function() {
         let defaultItems = [
            { key: 0, title: 'все страны' },
            { key: 1, title: 'Россия' },
            { key: 2, title: 'США' },
            { key: 3, title: 'Великобритания' }
         ];

         let getListModel = function(items) {
            return new display.Tree({
               collection: new collection.RecordSet({
                  rawData: items || defaultItems,
                  keyProperty: 'key'
               }),
               keyProperty: 'key'
            });
         };

         let defaultOptions = {
            listModel: getListModel()
         };

         let getRender = function(config) {
            let menuControl = new menu.Render();
            menuControl.saveOptions(config || defaultOptions);
            return menuControl;
         };

         it('getLeftSpacing', function() {
            let menuRender = getRender();
            let renderOptions = {
               listModel: getListModel()
            };
            let leftSpacing = menuRender.getLeftSpacing(renderOptions);
            assert.equal(leftSpacing, 'l');

            renderOptions.multiSelect = true;
            leftSpacing = menuRender.getLeftSpacing(renderOptions);
            assert.equal(leftSpacing, 'null');

            renderOptions.leftSpacing = 'xs';
            leftSpacing = menuRender.getLeftSpacing(renderOptions);
            assert.equal(leftSpacing, 'xs');
         });

         it('getRightSpacing', function() {
            let menuRender = getRender();
            let renderOptions = {
               listModel: getListModel()
            };
            let rightSpacing = menuRender.getRightSpacing(renderOptions);
            assert.equal(rightSpacing, 'l');

            renderOptions.nodeProperty = 'node';
            let items = Clone(defaultItems);
            items[0].node = true;
            renderOptions.listModel = getListModel(items);
            rightSpacing = menuRender.getRightSpacing(renderOptions);
            assert.equal(rightSpacing, 'menu-expander');

            renderOptions.rightSpacing = 'xs';
            rightSpacing = menuRender.getRightSpacing(renderOptions);
            assert.equal(rightSpacing, 'xs');
         });

         it('addEmptyItem', function() {
            let menuRender = getRender();
            let renderOptions = {
               listModel: getListModel(),
               emptyText: 'Not selected',
               emptyKey: null
            };
            menuRender.addEmptyItem(renderOptions.listModel, renderOptions);
            assert.equal(renderOptions.listModel.getCollection().getCount(), 5);
         });

         it('getIconSpacing', function() {
            let menuRender = getRender();
            let iconItems = [
               { key: 0, title: 'все страны' },
               { key: 1, title: 'Россия', icon: 'icon-add' },
               { key: 2, title: 'США' },
               { key: 3, title: 'Великобритания' }
            ];
            let renderOptions = {
               listModel: getListModel(iconItems),
               iconSize: 'm'
            };
            let iconSpacing = menuRender.getIconSpacing(renderOptions);
            assert.equal(iconSpacing, 'm');

            iconItems = [
               { key: 0, title: 'все страны', node: true },
               { key: 1, title: 'Россия', icon: 'icon-add', parent: 0 },
               { key: 2, title: 'США' },
               { key: 3, title: 'Великобритания' }
            ];
            renderOptions.listModel = getListModel(iconItems);
            renderOptions.parentProperty = 'parent';
            renderOptions.nodeProperty = 'node';
            iconSpacing = menuRender.getIconSpacing(renderOptions);
            assert.equal(iconSpacing, '');
         });

      });
   }
);
