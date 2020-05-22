define(
   [
      'Controls/menu',
      'Types/source',
      'Core/core-clone',
      'Controls/display',
      'Types/collection',
      'Types/entity',
      'Types/di'
   ],
   function(menu, source, Clone, display, collection, entity, di) {
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

         let getListModelWithSbisAdapter = function() {
            return new display.Tree({
               collection: new collection.RecordSet({
                  rawData: {
                     _type: 'recordset',
                     d: [],
                     s: [
                        { n: 'id', t: 'Строка' },
                        { n: 'title', t: 'Строка' },
                     ]
                  },
                  keyProperty: 'id',
                  adapter: new entity.adapter.Sbis()
               })
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
            assert.deepEqual(actualData[0], { key: 1 });
            assert.deepEqual(actualData[1], 'item1');
            assert.isTrue(isStopped);
         });

         it('getLeftSpacing', function() {
            let menuRender = getRender();
            let renderOptions = {
               listModel: getListModel(),
               itemPadding: {}
            };
            let leftSpacing = menuRender.getLeftSpacing(renderOptions);
            assert.equal(leftSpacing, 'm');

            renderOptions.multiSelect = true;
            leftSpacing = menuRender.getLeftSpacing(renderOptions);
            assert.equal(leftSpacing, 'm');

            renderOptions.itemPadding.left = 'xs';
            leftSpacing = menuRender.getLeftSpacing(renderOptions);
            assert.equal(leftSpacing, 'xs');
         });

         it('getRightSpacing', function() {
            let menuRender = getRender();
            let renderOptions = {
               listModel: getListModel(),
               itemPadding: {},
               nodeProperty: 'node'
            };
            let rightSpacing = menuRender.getRightSpacing(renderOptions);
            assert.equal(rightSpacing, 'm');

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
                  listModel: getListModelWithSbisAdapter(),
                  emptyText: 'Not selected',
                  emptyKey: null,
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKeys: []
               };
            });

            it('check items count', function() {
               menuRender.addEmptyItem(renderOptions.listModel, renderOptions);
               assert.equal(renderOptions.listModel.getCount(), 1);
               assert.equal(renderOptions.listModel.getCollection().at(0).get('title'), 'Not selected');
               assert.equal(renderOptions.listModel.getCollection().at(0).get('id'), null);
            });

            it('check selected empty item', function() {
               renderOptions.selectedKeys = [];
               menuRender.addEmptyItem(renderOptions.listModel, renderOptions);
               assert.isTrue(renderOptions.listModel.getItemBySourceKey(null).isSelected());

               renderOptions.selectedKeys = [null];
               menuRender.addEmptyItem(renderOptions.listModel, renderOptions);
               assert.isTrue(renderOptions.listModel.getItemBySourceKey(null).isSelected());
            });

            it('check model', function() {
               let isCreatedModel;
               let sandbox = sinon.createSandbox();
               sandbox.replace(menuRender, '_createModel', (model, config) => {
                  isCreatedModel = true;
                  return new entity.Model(config);
               });

               renderOptions.listModel = new display.Tree({
                  collection: new collection.RecordSet({
                     rawData: Clone(defaultItems),
                     keyProperty: 'id'
                  })
               });

               menuRender.addEmptyItem(renderOptions.listModel, renderOptions);
               assert.equal(renderOptions.listModel.getCollection().at(0).get('id'), null);
               assert.isTrue(isCreatedModel);
               sandbox.restore();
            });
         });

         describe('grouping', function() {
            let getGroup = (item) => {
               if (!item.get('group')) {
                  return 'CONTROLS_HIDDEN_GROUP';
               }
               return item.get('group');
            };
            it('_isGroupVisible simple', function() {
               let groupListModel = getListModel([
                  { key: 0, title: 'все страны' },
                  { key: 1, title: 'Россия', icon: 'icon-add' },
                  { key: 2, title: 'США', group: '2' },
                  { key: 3, title: 'Великобритания', group: '2' },
                  { key: 4, title: 'Великобритания', group: '2' },
                  { key: 5, title: 'Великобритания', group: '3' }
               ]);
               groupListModel.setGroup(getGroup);

               let menuRender = getRender(
                  { listModel: groupListModel }
               );

               let result = menuRender._isGroupVisible(groupListModel.at(0));
               assert.isFalse(result);

               result = menuRender._isGroupVisible(groupListModel.at(3));
               assert.isTrue(result);
            });

            it('_isGroupVisible one group', function() {
               let groupListModel = getListModel([
                  { key: 0, title: 'все страны', group: '2' },
                  { key: 1, title: 'Россия', icon: 'icon-add', group: '2' },
                  { key: 2, title: 'США', group: '2' },
                  { key: 3, title: 'Великобритания', group: '2' },
                  { key: 4, title: 'Великобритания', group: '2' }
               ]);
               groupListModel.setGroup(getGroup);

               let menuRender = getRender(
                  { listModel: groupListModel }
               );

               let result = menuRender._isGroupVisible(groupListModel.at(0));
               assert.isFalse(result);
            });

            it('_isHistorySeparatorVisible', function() {
               let groupListModel = getListModel([
                  { key: 0, title: 'все страны' },
                  { key: 1, title: 'Россия', icon: 'icon-add' },
                  { key: 2, title: 'США', group: '2' },
                  { key: 3, title: 'Великобритания', group: '2' },
                  { key: 4, title: 'Великобритания', group: '2' },
                  { key: 5, title: 'Великобритания', group: '3' }
               ]);
               groupListModel.setGroup(getGroup);

               let menuRender = getRender(
                  { listModel: groupListModel }
               );
               let result = menuRender._isHistorySeparatorVisible(groupListModel.at(1));
               assert.isFalse(!!result);

               groupListModel.at(1).getContents().set('pinned', true);
               result = menuRender._isHistorySeparatorVisible(groupListModel.at(1));
               assert.isTrue(result);

               groupListModel.at(2).getContents().set('pinned', true);
               result = menuRender._isHistorySeparatorVisible(groupListModel.at(2));
               assert.isFalse(result);
            });

            describe('check class separator', function() {
               let groupListModel, menuRender, expectedClasses = 'controls-Menu__row-separator';
               beforeEach(function() {
                  groupListModel = getListModel([
                     { key: 0, title: 'все страны' },
                     { key: 1, title: 'Россия', icon: 'icon-add' },
                     { key: 2, title: 'США', group: '2' },
                     { key: 3, title: 'Великобритания', group: '2' },
                     { key: 4, title: 'Великобритания', group: '2' },
                     { key: 5, title: 'Великобритания', group: '3' }
                  ]);
                  groupListModel.setGroup(getGroup);

                  menuRender = getRender(
                     { listModel: groupListModel }
                  );
               });

               it('collectionItem', function() {
                  let expectedClasses = 'controls-Menu__row-separator';
                  let actualClasses = menuRender._getClassList(groupListModel.at(1));
                  assert.isTrue(actualClasses.indexOf(expectedClasses) !== -1);
               });

               it('next item is groupItem', function() {
                  // Collection: [GroupItem, CollectionItem, CollectionItem, GroupItem,...]
                  let actualClasses = menuRender._getClassList(groupListModel.at(2));
                  assert.isTrue(actualClasses.indexOf(expectedClasses) === -1);
               });

               it('history separator is visible', function() {
                  groupListModel.at(1).getContents().set('pinned', true);
                  let actualClasses = menuRender._getClassList(groupListModel.at(1));
                  assert.isTrue(actualClasses.indexOf(expectedClasses) === -1);
               });
            });
         });

         describe('_getClassList', function() {
            let menuRender, renderOptions;
            beforeEach(function() {
               menuRender = getRender();
               renderOptions = {
                  listModel: getListModel(),
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKeys: [],
                  itemPadding: {
                     top: 'null',
                     left: 'l',
                     right: 'l'
                  },
                  theme: 'theme'
               };
            });

            it('row_state default|readOnly', function() {
               let expectedClasses = 'controls-Menu__row_state_default';
               let actualClasses = menuRender._getClassList(renderOptions.listModel.at(0));
               assert.isTrue(actualClasses.indexOf(expectedClasses) !== -1);

               renderOptions.listModel.at(0).getContents().set('readOnly', true);
               expectedClasses = 'controls-Menu__row_state_readOnly';
               actualClasses = menuRender._getClassList(renderOptions.listModel.at(0));
               assert.isTrue(actualClasses.indexOf(expectedClasses) !== -1);
            });

            it('emptyItem', function() {
               let expectedClasses = 'controls-Menu__defaultItem';
               let actualClasses = menuRender._getClassList(renderOptions.listModel.at(1));
               assert.isTrue(actualClasses.indexOf(expectedClasses) !== -1);

               menuRender._options.emptyText = 'Text';
               menuRender._options.emptyKey = 0;
               expectedClasses = 'controls-Menu__emptyItem';
               actualClasses = menuRender._getClassList(renderOptions.listModel.at(0));
               assert.isTrue(actualClasses.indexOf(expectedClasses) !== -1);

               menuRender._options.multiSelect = true;
               actualClasses = menuRender._getClassList(renderOptions.listModel.at(0));
               assert.isTrue(actualClasses.indexOf(expectedClasses) === -1);
            });

            it('pinned', function() {
               let expectedClasses = 'controls-Menu__row_pinned';
               let actualClasses = menuRender._getClassList(renderOptions.listModel.at(0));
               assert.isTrue(actualClasses.indexOf(expectedClasses) === -1);

               renderOptions.listModel.at(0).getContents().set('pinned', true);
               actualClasses = menuRender._getClassList(renderOptions.listModel.at(0));
               assert.isTrue(actualClasses.indexOf(expectedClasses) !== -1);
            });

            it('lastItem', function() {
               let expectedClasses = 'controls-Menu__row-separator';
               let actualClasses = menuRender._getClassList(renderOptions.listModel.at(0));
               assert.isTrue(actualClasses.indexOf(expectedClasses) !== -1);

               actualClasses = menuRender._getClassList(menuRender._options.listModel.at(3));
               assert.isTrue(actualClasses.indexOf(expectedClasses) === -1);
            });
         });

         it('_getItemData', function() {
            let menuRender = getRender();
            let itemData = menuRender._getItemData(menuRender._options.listModel.at(0));
            assert.isOk(itemData.itemClassList);
            assert.isOk(itemData.treeItem);
            assert.isOk(itemData.multiSelectTpl);
            assert.isOk(itemData.item);
            assert.isOk(itemData.isSelected);
            assert.isOk(itemData.getPropValue);
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

            renderOptions.headingIcon = 'icon-Add';
            iconPadding = menuRender.getIconPadding(renderOptions);
            assert.equal(iconPadding, '');
         });

      });
   }
);
