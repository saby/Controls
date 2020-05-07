define(
   [
      'Controls/_filterPopup/SimplePanel/DropdownViewModel',
      'Types/collection',
      'Controls/Constants',
      'Types/entity',
      'Controls/list',
      'Core/core-clone'
   ],
   (DropdownViewModel, collectionLib, ControlsConstants, entity, list, clone) => {
      describe('DropdownViewModel', () => {
         let rs = new collectionLib.RecordSet({
            keyProperty: 'id',
            rawData: [
               {
                  id: '1',
                  title: 'Запись 1',
                  parent: null, '@parent': true
               },
               {
                  id: '2',
                  title: 'Запись 2',
                  parent: null, '@parent': false
               },
               {
                  id: '3',
                  title: 'Запись 3',
                  parent: null, '@parent': true
               },
               {
                  id: '4',
                  title: 'Запись 4',
                  parent: '1', '@parent': true,
                  additional: true
               },
               {
                  id: '5',
                  title: 'Запись 5',
                  parent: '4', '@parent': false
               },
               {
                  id: '6',
                  title: 'Запись 6',
                  parent: '4', '@parent': false,
                  additional: true
               },
               {
                  id: '7',
                  title: 'Запись 7',
                  parent: '3', '@parent': true,
                  additional: true
               },
               {
                  id: '8',
                  title: 'Запись 8',
                  parent: '7', '@parent': false,
                  additional: true
               }
            ]
         });
         const rs2 = new collectionLib.RecordSet({
            keyProperty: 'id',
            rawData: [
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
                  title: 'Запись 3'
               }
            ]
         });

         let config = {
            items: rs,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: '@parent',
            selectedKeys: ['3'],
            itemPadding: {},
            rootKey: null
         };
         const config2 = {
            items: rs2,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: '@parent',
            selectedKeys: '3',
            rootKey: null
         };

         let viewModel = new DropdownViewModel(config);
         let viewModel2 = new DropdownViewModel(config2);

         function setViewModelItems(viewModel, items) {
            viewModel.setItems({items: items});
         }

         it('should pass correct displayProperty to ItemsViewModel', () => {
            const config = {
               items: rs,
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: '@parent',
               selectedKeys: '3',
               displayProperty: 'test',
               rootKey: null
            };
            const viewModel = new DropdownViewModel(config);

            assert.equal(viewModel._itemsModel._options.displayProperty, 'test');
         });

         it('check hier items collection', () => {
            assert.equal(viewModel._itemsModel._display.getCount(), 3);
         });

         it('check empty hierarchy', () => {
            var version = viewModel.getVersion();
            viewModel._options.nodeProperty = null;
            viewModel.setFilter(viewModel.getDisplayFilter());
            assert.isTrue(viewModel.getVersion() > version);
            assert.equal(viewModel._itemsModel._display.getCount(), 8);
         });

         it('parentProperty is set but items don\'t have it', () => {
            viewModel2.setFilter(viewModel2.getDisplayFilter());
            assert.equal(viewModel2._itemsModel._display.getCount(), 3);
         });

         it('check additional', () => {
            viewModel._options.nodeProperty = null;
            viewModel._options.additionalProperty = 'additional';
            viewModel.setFilter(viewModel.getDisplayFilter());
            assert.equal(viewModel._itemsModel._display.getCount(), 4);
         });

         it('check additional and hierarchy', () => {
            viewModel._options.additionalProperty = 'additional';
            viewModel._options.nodeProperty = '@parent';
            viewModel.setFilter(viewModel.getDisplayFilter());
            assert.equal(viewModel._itemsModel._display.getCount(), 3);
         });

         it('items count', () => {
            assert.equal(viewModel._itemsModel._display.getCount(), 3);
            assert.equal(viewModel._options.items.getCount(), 8);
         });

         it('check current item data', () => {
            viewModel.reset();
            viewModel.goToNext();
            viewModel.goToNext();
            let current = viewModel.getCurrent();
            let checkData = current.isSelected && current.hasChildren && current.item.get(config.keyProperty) === '3' && viewModel.isEnd();
            assert.isTrue(checkData);
         });

         it('_private::updateSelection', function() {
            let configSelection = clone(config);
            configSelection.selectedKeys = ['1', '3', '5'];
            let expectedKeys = [ '1', '3', '5', '6' ];
            let viewModelSelection = new DropdownViewModel(configSelection);
            viewModelSelection.updateSelection(rs.at(5));
            assert.deepEqual(viewModelSelection.getSelectedKeys(), expectedKeys);

            expectedKeys = [ '1', '3', '5', '6', '2' ];
            viewModelSelection.updateSelection(rs.at(1));
            assert.deepEqual(viewModelSelection.getSelectedKeys(), expectedKeys);

            expectedKeys = ['1', '3', '5', '6'];
            viewModelSelection.updateSelection(rs.at(1));
            assert.deepEqual(viewModelSelection.getSelectedKeys(), expectedKeys);

            expectedKeys = ['1'];
            viewModelSelection._options.selectedKeys = [null];
            viewModelSelection.updateSelection(rs.at(0));
            assert.deepEqual(viewModelSelection.getSelectedKeys(), expectedKeys);

            expectedKeys = [null];
            viewModelSelection._options.selectedKeys = ['1'];
            viewModelSelection.updateSelection(rs.at(0));
            assert.deepEqual(viewModelSelection.getSelectedKeys(), expectedKeys);
         });

         it('_isItemSelected', function() {
            let configSelection = clone(config);
            configSelection.selectedKeys = [ [1] ];
            let viewModelSelection = new DropdownViewModel(configSelection);
            let item = new entity.Model({
               rawData: {id: [1], title: 'Id is array'}
            });
            let isSelected = viewModelSelection._isItemSelected(item);
            assert.isTrue(isSelected);

            item.set('id', [2]);
            isSelected = viewModelSelection._isItemSelected(item);
            assert.isFalse(isSelected);

            viewModelSelection._options.selectedKeys = [1, 2];
            item.set('id', 1);
            isSelected = viewModelSelection._isItemSelected(item);
            assert.isTrue(isSelected);

            item.set('id', 12);
            isSelected = viewModelSelection._isItemSelected(item);
            assert.isFalse(isSelected);
         });

         describe('Groups and separator', function() {
            let newConfig = {
               keyProperty: 'id',
            };
            newConfig.groupingKeyCallback = function (item) {
               if (item.get('group') === 'hidden' || !item.get('group')) {
                  return ControlsConstants.view.hiddenGroup;
               }
               return item.get('group');
            };
            newConfig.items = new collectionLib.RecordSet({
               keyProperty: 'id',
               rawData: [
                  {id: '1', title: 'Запись 1', parent: null, '@parent': false, recent: true},
                  {id: '2', title: 'Запись 2', parent: null, '@parent': false, pinned: true},
                  {id: '3', title: 'Запись 3', parent: null, '@parent': false},
                  {id: '4', title: 'Запись 4', parent: null, '@parent': false, group: 'group_2'},
                  {id: '5', title: 'Запись 5', parent: null, '@parent': false, group: 'group_1'},
                  {id: '6', title: 'Запись 6', parent: null, '@parent': false, group: 'group_1'},
                  {id: '7', title: 'Запись 7', parent: null, '@parent': false, group: 'group_2'},
                  {id: '8', title: 'Запись 8', parent: null, '@parent': false, group: 'group_2'}
               ]
            });

            let viewModel3 = new DropdownViewModel(newConfig);
            viewModel3._options.additionalProperty = null;
            viewModel3._options.nodeProperty = '@parent';
            it('groupItems', function() {
               assert.isTrue(viewModel3.getCurrent().isHiddenGroup);
               assert.equal(viewModel3._itemsModel._display.getCount(), 11);
               assert.equal(viewModel3._itemsModel._display.at(9).getContents().get('group'), 'group_1');
               assert.equal(viewModel3._itemsModel._display.at(10).getContents().get('group'), 'group_1');
            });
            it('historySeparator', function() {
               viewModel3.goToNext();
               assert.isFalse(DropdownViewModel._private.needToDrawSeparator(viewModel3._itemsModel.getCurrent().item, viewModel3._itemsModel.getNext().item));
               viewModel3.goToNext();
               assert.isTrue(DropdownViewModel._private.needToDrawSeparator(viewModel3._itemsModel.getCurrent().item, viewModel3._itemsModel.getNext().item));
               let hasParent = true;
               assert.isFalse(DropdownViewModel._private.needToDrawSeparator(viewModel3._itemsModel.getCurrent().item, viewModel3._itemsModel.getNext().item, hasParent));
            });
            it('needHideGroup', function() {
               let groupItems = {
                  empty: [],
                  notEmpty: ['test']
               };
               let self = {
                  _options: {
                    parentProperty: 'parent',
                    nodeProperty: 'node',
                    rootKey: '1'
                  },
                  _itemsModel: {
                     _display: {
                        getGroupItems: function(key) {
                           return groupItems[key];
                        }
                     }
                  },
                  getItems: () => {
                     return new collectionLib.RecordSet({
                        keyProperty: 'id',
                        rawData: [{id: '1'}, {id: '2'}]
                     });
                  }
               };

               assert.isTrue(DropdownViewModel._private.needHideGroup(self, 'empty'));
               assert.isFalse(DropdownViewModel._private.needHideGroup(self, 'notEmpty'));

               self.getItems = () => {
                  return new collectionLib.RecordSet({
                     keyProperty: 'id',
                     rawData: [{id: '1', parent: '1'}]
                  });
               };
               assert.isTrue(DropdownViewModel._private.needHideGroup(self, 'notEmpty'));
            });
         });

         it('isGroupNext', function() {
            let newConfig = {
               keyProperty: 'id',
               items: new collectionLib.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     { id: 'first', title: 'Запись 1', group: '1' },
                     { id: 'second', title: 'Запись 2', group: '1' },
                     { id: 'third', title: 'Запись 3', group: '2' },
                     { id: 'fourth', title: 'Запись 4', group: '2' }
                  ]
               })
            };
            newConfig.groupingKeyCallback = (item) => {
               return item.get('group');
            };
            let viewModel = new DropdownViewModel(newConfig);
            assert.isFalse(viewModel.isGroupNext());
            viewModel.goToNext();
            assert.isFalse(viewModel.isGroupNext());
            viewModel.goToNext();
            assert.isTrue(viewModel.isGroupNext());
            viewModel.goToNext();
            assert.isFalse(viewModel.isGroupNext());
         });

         it('getCurrent', function() {
            let curConfig = clone(config);
            curConfig.hasIconPin = true;

            const getItem = () => {
               let ddlViewModel = new DropdownViewModel(curConfig);
               return ddlViewModel.getCurrent();
            };
            let item = getItem();
            assert.isFalse(item.hasPinned);

            curConfig.items.at(0).set('pinned', false);
            item = getItem();
            assert.isTrue(item.hasPinned);
         });

         it('_private.getSpacingClassList', () => {
            let itemPadding = {}, multiSelect = true, itemData = { emptyText: 'test', item: { get: () => false } }, hasHierarchy = false;
            let expectedClassList = 'controls-SimplePanel-List__row_state_default ' +
               'controls-SimplePanel-List__emptyItem-leftPadding_multiSelect controls-SimplePanel-List__item-rightPadding_default';
            let classList = DropdownViewModel._private.getClassList(itemPadding, multiSelect, itemData, hasHierarchy);
            assert.equal(classList, expectedClassList);

            multiSelect = false;
            expectedClassList = 'controls-SimplePanel-List__row_state_default ' +
               'controls-SimplePanel-List__item-leftPadding_default controls-SimplePanel-List__item-rightPadding_default';
            classList = DropdownViewModel._private.getClassList(itemPadding, multiSelect, itemData, hasHierarchy);
            assert.equal(classList, expectedClassList);

            multiSelect = false;
            itemPadding.left = 's';
            expectedClassList = 'controls-SimplePanel-List__row_state_default ' +
               'controls-SimplePanel-List__item-leftPadding_s controls-SimplePanel-List__item-rightPadding_default';
            classList = DropdownViewModel._private.getClassList(itemPadding, multiSelect, itemData, hasHierarchy);
            assert.equal(classList, expectedClassList);

            hasHierarchy = true;
            expectedClassList = 'controls-SimplePanel-List__row_state_default ' +
               'controls-SimplePanel-List__item-leftPadding_s controls-SimplePanel-List__item-rightPadding_hierarchy';
            classList = DropdownViewModel._private.getClassList(itemPadding, multiSelect, itemData, hasHierarchy);
            assert.equal(classList, expectedClassList);

            itemData.hasClose = true;
            expectedClassList = 'controls-SimplePanel-List__row_state_default ' +
               'controls-SimplePanel-List__item-leftPadding_s controls-SimplePanel-List__item-rightPadding_close';
            classList = DropdownViewModel._private.getClassList(itemPadding, multiSelect, itemData, hasHierarchy);
            assert.equal(classList, expectedClassList);

            itemData.hasPinned = true;
            expectedClassList = 'controls-SimplePanel-List__row_state_default ' +
               'controls-SimplePanel-List__item-leftPadding_s controls-SimplePanel-List__item-rightPadding_history';
            classList = DropdownViewModel._private.getClassList(itemPadding, multiSelect, itemData, hasHierarchy);
            assert.equal(classList, expectedClassList);

            expectedClassList = 'controls-SimplePanel-List__row_state_default ' +
               'controls-SimplePanel-List__item-leftPadding_s controls-SimplePanel-List__item-rightPadding_multiSelect';
            classList = DropdownViewModel._private.getClassList(itemPadding, multiSelect, itemData, hasHierarchy, true); // hasApplyButton = true
            assert.equal(classList, expectedClassList);

            itemData = { item: { get: () => false } };
            hasHierarchy = false;
            expectedClassList = 'controls-SimplePanel-List__row_state_default ' +
               'controls-SimplePanel-List__item-leftPadding_s controls-SimplePanel-List__item-rightPadding_default';
            classList = DropdownViewModel._private.getClassList(itemPadding, multiSelect, itemData, hasHierarchy);
            assert.equal(classList, expectedClassList);

            itemData = { item: { get: () => false } };
            itemPadding.right = 'm';
            expectedClassList = 'controls-SimplePanel-List__row_state_default ' +
               'controls-SimplePanel-List__item-leftPadding_s controls-SimplePanel-List__item-rightPadding_m';
            classList = DropdownViewModel._private.getClassList(itemPadding, multiSelect, itemData);
            assert.equal(classList, expectedClassList);
         });

         it('_private.isHistoryItem', () => {
            var historyItem = new entity.Model({rawData: {
               pinned: true
            }});
            var simpleItem = new entity.Model({rawData: {
               any: 'any'
            }});

            assert.isTrue(!!DropdownViewModel._private.isHistoryItem(historyItem));
            assert.isFalse(!!DropdownViewModel._private.isHistoryItem(simpleItem));
         });

         it('_private.filterAdditional', () => {
            var selfWithAdditionalProperty = {
               _options: {
                  additionalProperty: 'additionalProperty'
               }
            };
            var simpleSelf = {
               _options: {}
            };

            var itemWithAdditionalProperty = new entity.Model({rawData: {
               additionalProperty: true
            }});
            var historyItem = new entity.Model({rawData: {
               pinned: true,
               additionalProperty: false
            }});
            var simpleItem = new entity.Model({rawData: {
               any: 'any'
            }});

            assert.isFalse(!!DropdownViewModel._private.filterAdditional.call(selfWithAdditionalProperty, itemWithAdditionalProperty));
            assert.isTrue(!!DropdownViewModel._private.filterAdditional.call(selfWithAdditionalProperty, historyItem));
            assert.isTrue(!!DropdownViewModel._private.filterAdditional.call(selfWithAdditionalProperty, simpleItem));

            assert.isTrue(!!DropdownViewModel._private.filterAdditional.call(simpleSelf, itemWithAdditionalProperty));
            assert.isTrue(!!DropdownViewModel._private.filterAdditional.call(simpleSelf, historyItem));
            assert.isTrue(!!DropdownViewModel._private.filterAdditional.call(simpleSelf, simpleItem));

         });

         it('destroy', () => {
            viewModel.destroy();
            assert.equal(null, viewModel._itemsModel._options);
         });

         it('hasAdditional', () => {
            var viewModel = new DropdownViewModel(config);
            var version = viewModel.getVersion();
            viewModel._options.additionalProperty = 'additional';
            setViewModelItems(viewModel, rs);
            assert.isTrue(viewModel.getVersion() === version);
            assert.isTrue(!!viewModel.hasAdditional());
            version = viewModel.getVersion();
            setViewModelItems(viewModel, rs2);
            assert.isTrue(viewModel.getVersion() > version);
            assert.isFalse(!!viewModel.hasAdditional());

            version = viewModel.getVersion();
            viewModel.setRootKey('test');
            assert.isTrue(viewModel.getVersion() > version);
            setViewModelItems(viewModel, rs);
            assert.isFalse(!!viewModel.hasAdditional());
            setViewModelItems(viewModel, rs2);
            assert.isFalse(!!viewModel.hasAdditional());

            viewModel.setRootKey(null);
            assert.isTrue(viewModel.getVersion() > version);
            viewModel._options.additionalProperty = '';
            setViewModelItems(viewModel, rs);
            assert.isFalse(!!viewModel.hasAdditional(rs));
            setViewModelItems(viewModel, rs2);
            assert.isFalse(!!viewModel.hasAdditional(rs2));
         });

         it('getEmptyItem', function() {
            const getEmpty = (empConfig) => {
               viewModel = new DropdownViewModel(empConfig);
               return viewModel.getEmptyItem();
            };

            let emptyConfig = clone(config);
            emptyConfig.emptyText = 'Не выбрано';
            emptyConfig.displayProperty = 'title';
            let emptyItem = getEmpty(emptyConfig);
            assert.isFalse(emptyItem.isSelected);
            assert.equal(emptyItem.emptyText, emptyConfig.emptyText);

            emptyConfig.selectedKeys = [];
            emptyItem = getEmpty(emptyConfig);
            assert.isTrue(emptyItem.isSelected);
            assert.equal(emptyItem.emptyText, emptyConfig.emptyText);

            emptyConfig.selectedKeys = ['100'];
            emptyConfig.emptyKey = '100';
            emptyItem = getEmpty(emptyConfig);
            assert.isTrue(emptyItem.isSelected);
            assert.equal(emptyItem.emptyText, emptyConfig.emptyText);

            emptyConfig.emptyKey = 0;
            emptyItem = getEmpty(emptyConfig);
            assert.equal(emptyItem.item.get('id'), 0);

            // spacingClassList
            let expectedClassList = 'controls-SimplePanel-List__row_state_default ' +
               'controls-SimplePanel-List__item-leftPadding_default ' +
               'controls-SimplePanel-List__item-rightPadding_default';
            assert.equal(emptyItem.itemClassList, expectedClassList);

            emptyConfig.multiSelect = true;
            expectedClassList = 'controls-SimplePanel-List__row_state_default ' +
               'controls-SimplePanel-List__emptyItem-leftPadding_multiSelect controls-SimplePanel-List__item-rightPadding_default';
            emptyItem = getEmpty(emptyConfig);
            assert.equal(emptyItem.itemClassList, expectedClassList);

            emptyConfig.hasClose = true;
            expectedClassList = 'controls-SimplePanel-List__row_state_default ' +
               'controls-SimplePanel-List__emptyItem-leftPadding_multiSelect controls-SimplePanel-List__item-rightPadding_close';
            emptyItem = getEmpty(emptyConfig);
            assert.equal(emptyItem.itemClassList, expectedClassList);
         });
      })
   });
