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

         let getListModel = function(items, nodeProperty) {
            return new display.Tree({
               collection: new collection.RecordSet({
                  rawData: Clone(items || defaultItems),
                  keyProperty: 'key'
               }),
               keyProperty: 'key',
               nodeProperty
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

         it('_proxyEvent', function() {
            let menuRender = getRender();
            let actualData;
            let isStopped = false;
            menuRender._notify = (e, d) => {
               if (e === 'itemClick') {
                  actualData = d;
               }
            };
            const event = {
               type: 'click',
               stopPropagation: () => {isStopped = true;}
            };
            menuRender._proxyEvent(event, 'itemClick', { key: 1 }, 'item1');
            assert.deepEqual(actualData, [{ key: 1 }, 'item1']);
            assert.isTrue(isStopped);
         });

         it('getLeftSpacing', function() {
            let menuRender = getRender();
            let renderOptions = {
               listModel: getListModel(),
               itemPadding: {}
            };
            let leftSpacing = menuRender.getLeftSpacing(renderOptions);
            assert.equal(leftSpacing, 'l');

            renderOptions.multiSelect = true;
            leftSpacing = menuRender.getLeftSpacing(renderOptions);
            assert.equal(leftSpacing, 'null');

            renderOptions.itemPadding.left = 'xs';
            leftSpacing = menuRender.getLeftSpacing(renderOptions);
            assert.equal(leftSpacing, 'xs');
         });

         it('getRightSpacing', function() {
            let menuRender = getRender();
            let renderOptions = {
               listModel: getListModel(),
               itemPadding: {}
            };
            let rightSpacing = menuRender.getRightSpacing(renderOptions);
            assert.equal(rightSpacing, 'l');

            let items = Clone(defaultItems);
            items[0].node = true;
            renderOptions.listModel = getListModel(items, 'node');
            rightSpacing = menuRender.getRightSpacing(renderOptions);
            assert.equal(rightSpacing, 'menu-expander');

            renderOptions.itemPadding.right = 'xs';
            rightSpacing = menuRender.getRightSpacing(renderOptions);
            assert.equal(rightSpacing, 'xs');
         });

         describe('addEmptyItem', function() {
            let menuRender, renderOptions;
            beforeEach(function() {
               menuRender = getRender();
               renderOptions = {
                  listModel: getListModel(),
                  emptyText: 'Not selected',
                  emptyKey: null,
                  keyProperty: 'key',
                  selectedKeys: []
               };
            });

            it('check items count', function() {
               menuRender.addEmptyItem(renderOptions.listModel, renderOptions);
               assert.equal(renderOptions.listModel.getCount(), 5);
            });
            it('check selected empty item', function() {
               renderOptions.selectedKeys = [null];
               menuRender.addEmptyItem(renderOptions.listModel, renderOptions);
               assert.isTrue(renderOptions.listModel.getItemBySourceKey(null).isSelected());
            });
         });


         it('getIconPadding', function() {
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
            let iconPadding = menuRender.getIconPadding(renderOptions);
            assert.equal(iconPadding, 'm');

            iconItems = [
               { key: 0, title: 'все страны', node: true },
               { key: 1, title: 'Россия', icon: 'icon-add', parent: 0 },
               { key: 2, title: 'США' },
               { key: 3, title: 'Великобритания' }
            ];
            renderOptions.listModel = getListModel(iconItems);
            renderOptions.parentProperty = 'parent';
            renderOptions.nodeProperty = 'node';
            iconPadding = menuRender.getIconPadding(renderOptions);
            assert.equal(iconPadding, '');
         });

      });
   }
);
