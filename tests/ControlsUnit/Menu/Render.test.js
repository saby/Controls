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

         let defaultOptions = {
            listModel: getListModel(),
            keyProperty: 'key'
         };

         let getRender = function(config) {
            const renderConfig = config || defaultOptions;
            const menuControl = new menu.Render(renderConfig);
            menuControl.saveOptions(renderConfig);
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
                  menuRender._options.allowPin = true;
                  groupListModel.at(1).getContents().set('pinned', true);
                  let actualClasses = menuRender._getClassList(groupListModel.at(1));
                  assert.isTrue(actualClasses.indexOf(expectedClasses) === -1);
               });

               it('history separator is unvisible', function() {
                  menuRender._options.allowPin = false;
                  groupListModel.at(1).getContents().set('pinned', true);
                  let actualClasses = menuRender._getClassList(groupListModel.at(1));
                  assert.isFalse(actualClasses.indexOf(expectedClasses) === -1);
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
               assert.isTrue(actualClasses.indexOf(expectedClasses) === -1);

               renderOptions.listModel.at(0).getContents().set('HistoryId', 'test');
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
            assert.isFalse(itemData.isFixedItem);
         });

         it('_getIconSize', () => {
            let menuRender = getRender();
            let item = new entity.Model({
               rawData: { iconSize: 's' }
            });
            let result = menuRender._getIconSize(item);
            assert.isUndefined(result);

            menuRender._iconPadding = 's';
            result = menuRender._getIconSize(item);
            assert.equal(result, '');

            item = new entity.Model({
               rawData: { iconSize: 's', icon: 'icon-test' }
            });
            result = menuRender._getIconSize(item);
            assert.equal(result, 's');
         });

         describe('getIconPadding', function() {
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

            it('simple', () => {
               const iconPadding = menuRender.getIconPadding(renderOptions);
               assert.equal(iconPadding, 'm');
            });

            it('iconSize set on item', () => {
               const itemsIconSize = [
                  { key: 1, title: 'Россия', icon: 'icon-add', iconSize: 'l' }
               ];
               const iconPadding = menuRender.getIconPadding({listModel: getListModel(itemsIconSize)});
               assert.equal(iconPadding, 'l');
            });

            it('with headingIcon', () => {
               delete iconItems[1].icon;
               renderOptions.listModel = getListModel(iconItems);
               renderOptions.headingIcon = 'icon-Add';
               const iconPadding = menuRender.getIconPadding(renderOptions);
               assert.equal(iconPadding, '');
            });

            it('hierarchy collection', () => {
               iconItems = [
                  { key: 0, title: 'все страны', node: true },
                  { key: 1, title: 'Россия', icon: 'icon-add', parent: 0 },
                  { key: 2, title: 'США' },
                  { key: 3, title: 'Великобритания' }
               ];
               renderOptions.listModel = getListModel(iconItems);
               renderOptions.listModel.setFilter((item) => {
                  return item.get('parent') === undefined;
               });
               let iconPadding = menuRender.getIconPadding(renderOptions);
               assert.equal(iconPadding, '');


               renderOptions.listModel.setFilter((item) => {
                  return item.get('parent') === 0;
               });
               iconPadding = menuRender.getIconPadding(renderOptions);
               assert.equal(iconPadding, 'm');
            });
         });

         describe('_beforeUnmount', () => {

            it('empty item must be removed from collection', () => {
               const listModel = getListModel();
               const menuRenderConfig = {
                  listModel: listModel,
                  emptyText: 'emptyText',
                  itemPadding: {},
                  selectedKeys: [],
                  emptyKey: 'testKey',
                  keyProperty: 'key'
               };
               const menuRender = getRender(menuRenderConfig);
               menuRender._beforeMount(menuRenderConfig);
               menuRender._beforeUnmount();
               assert.equal(listModel.getCollection().getCount(), 4, 'empty item is not removed from collection on _beforeUnmount');
            });

         });

      });
   }
);
