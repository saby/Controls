define(
   [
      'Controls/dropdown',
      'Core/core-clone',
      'Types/source',
      'Types/collection',
      'Controls/popup'
   ],
   (dropdown, Clone, sourceLib, collection, popup) => {
      describe('Input/Dropdown', () => {
         let items = [
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
            },
            {
               id: '4',
               title: 'Запись 4'
            },
            {
               id: '5',
               title: 'Запись 5'
            },
            {
               id: '6',
               title: 'Запись 6',
               icon: 'icon-16 icon-Admin icon-primary'
            },
            {
               id: '7',
               title: 'Запись 7'
            },
            {
               id: '8',
               title: 'Запись 8'
            }
         ];

         let itemsRecords = new collection.RecordSet({
            keyProperty: 'id',
            rawData: items
         });

         let config = {
            selectedKeys: ['2'],
            displayProperty: 'title',
            keyProperty: 'id',
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            })
         };


         let getDropdown = function(config) {
            let dropdownList = new dropdown.Input(config);
            dropdownList.saveOptions(config);
            return dropdownList;
         };
         let dropdownList = new dropdown.Input(config);

         it('data load callback', () => {
            let ddl = getDropdown(config);
            ddl._prepareDisplayState([itemsRecords.at(5)]);
            assert.equal(ddl._text, 'Запись 6');
            assert.equal(ddl._icon, 'icon-16 icon-Admin icon-primary');
            ddl._prepareDisplayState([{ id: null }]);
            assert.equal(ddl._icon, null);
         });

         it('_prepareDisplayState hasMoreText', () => {
            let ddl = getDropdown(config);
            ddl._prepareDisplayState([itemsRecords.at(1), itemsRecords.at(3), itemsRecords.at(5)]);
            assert.equal(ddl._text, 'Запись 2');
            assert.equal(ddl._tooltip, 'Запись 2, Запись 4, Запись 6');
            assert.equal(ddl._hasMoreText, ', еще 2');

            ddl._prepareDisplayState([itemsRecords.at(1)]);
            assert.equal(ddl._text, 'Запись 2');
            assert.equal(ddl._tooltip, 'Запись 2');
            assert.equal(ddl._hasMoreText, '');
         });

         it('check selectedItemsChanged event', () => {
            let ddl = getDropdown(config);
            let keys, text, isKeysChanged;
            ddl._notify = (e, data) => {
               if (e === 'selectedKeysChanged') {
                  isKeysChanged = true;
                  keys = data[0];
               }
               if (e === 'textValueChanged') {
                  text = data[0];
               }
            };
            ddl._selectedItemsChangedHandler([itemsRecords.at(5)], 'itemClick');
            assert.deepEqual(keys, ['6']);
            assert.strictEqual(text, 'Запись 6');
            assert.isTrue(isKeysChanged);

            isKeysChanged = false;
            ddl._options.selectedKeys = ['6'];
            ddl._selectedItemsChangedHandler([itemsRecords.at(5)], 'itemClick'); // key = '6'
            assert.isFalse(isKeysChanged);
         });

         it('_private::getNewItems', function() {
            let ddl = getDropdown(config);
            let curItems = new collection.RecordSet({
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  }, {
                     id: '2',
                     title: 'Запись 2'
                  }, {
                     id: '3',
                     title: 'Запись 3'
                  }]
               }),
               selectedItems = new collection.RecordSet({
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  }, {
                     id: '9',
                     title: 'Запись 9'
                  }, {
                     id: '10',
                     title: 'Запись 10'
                  }]
               });
            let newItems = [selectedItems.at(1), selectedItems.at(2)];
            let result = ddl._getNewItems(curItems, selectedItems, 'id');

            assert.deepEqual(newItems, result);
         });

         it('_handleMouseDown', () => {
            let isOpened = false;
            let ddl = getDropdown(config);
            ddl.openMenu = () => { isOpened = true; };

            const event = { nativeEvent: { button: 2 } };
            ddl._handleMouseDown(event);
            assert.isFalse(isOpened);

            event.nativeEvent.button = 0;
            ddl._handleMouseDown(event);
            assert.isTrue(isOpened);
         });

         it('openMenu', () => {
            let actualOptions = null;
            let target;
            let ddl = getDropdown(config);
            ddl._controller = {
               setMenuPopupTarget: () => { target = 'test'; },
               openMenu: (popupConfig) => { actualOptions = popupConfig; return Promise.resolve(); },
               setFilter: () => {}
            };

            ddl._historyController = {
               getPreparedFilter: ()=> {},
               getPreparedSource: ()=> {}
            };

            ddl.openMenu();
            assert.isOk(actualOptions.templateOptions);
            assert.equal(target, 'test');

            ddl.openMenu({ newOptionsPopup: 'test2', templateOptions: { customTemplateOption: 'test2' } });
            assert.isOk(actualOptions.templateOptions.selectorDialogResult);
            assert.equal(actualOptions.templateOptions.customTemplateOption, 'test2');
            assert.equal(actualOptions.newOptionsPopup, 'test2');
         });

         it('_dataLoadCallback', () => {
            let ddl = getDropdown(config);
            ddl._dataLoadCallback(new collection.RecordSet({
               rawData: [1, 2, 3]
            }));
            assert.equal(ddl._countItems, 3);

            ddl._options.emptyText = 'empty text';
            ddl._dataLoadCallback(new collection.RecordSet({
               rawData: [1, 2, 3]
            }));
            assert.equal(ddl._countItems, 4);
         });

         it('_prepareDisplayState empty items', () => {
            let ddl = getDropdown(config);
            ddl._prepareDisplayState([]);
            assert.equal(ddl._text, '');
         });

         it('_prepareDisplayState emptyText=true', () => {
            let newConfig = Clone(config);
            newConfig.emptyText = true;
            let ddl = getDropdown(newConfig);
            ddl._prepareDisplayState([null]);
            assert.equal(ddl._text, 'Не выбрано');
            assert.isNull(ddl._icon);
            ddl._prepareDisplayState([{id: null}]);
            assert.equal(ddl._text, 'Не выбрано');
            assert.isNull(ddl._icon);
         });

         it('_private::getTooltip', function() {
            let ddl = getDropdown(config);
            ddl._prepareDisplayState([null]);
            assert.equal(ddl._tooltip, '');
            ddl._prepareDisplayState(items.slice(0, 3));
            assert.equal(ddl._tooltip, 'Запись 1, Запись 2, Запись 3');
         });

         it('_selectorTemplateResult', () => {
            let opened;
            let newConfig = Clone(config);
            let ddl = getDropdown(newConfig);
            ddl._beforeMount(config);
            popup.Sticky.closePopup = () => { opened = false; };
            let curItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  }, {
                     id: '2',
                     title: 'Запись 2'
                  }, {
                     id: '3',
                     title: 'Запись 3'
                  }]
               }),
               selectedItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{
                        id: '9',
                        title: 'Запись 9'
                     },
                     {
                        id: '10',
                        title: 'Запись 10'
                     }]
               });
            ddl._controller._items = curItems;
            ddl._controller._source = config.source;
            let newItems = [{
               id: '9',
               title: 'Запись 9'
            },
            {
               id: '10',
               title: 'Запись 10'
            },
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
            }];

            ddl._selectorTemplateResult('selectorResult', selectedItems);
            assert.deepEqual(newItems, ddl._controller._items.getRawData());
         });

         it('_selectorTemplateResult selectorCallback', () => {
            let newConfig = Clone(config);
            let ddl = getDropdown(newConfig);
            let opened;
            ddl._beforeMount(config);
            ddl._notify = (event, data) => {
               if (event === 'selectorCallback') {
                  data[1].at(0).set({id: '11', title: 'Запись 11'});
               }
            };
            popup.Sticky.closePopup = () => { opened = false; };

            let curItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  }, {
                     id: '2',
                     title: 'Запись 2'
                  }, {
                     id: '3',
                     title: 'Запись 3'
                  }]
               }),
               selectedItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  },
                  {
                     id: '9',
                     title: 'Запись 9'
                  },
                  {
                     id: '10',
                     title: 'Запись 10'
                  }]
               });
            ddl._controller._items = curItems;
            ddl._controller._source = config.source;
            let newItems = [
               { id: '11', title: 'Запись 11' },
               { id: '9', title: 'Запись 9' },
               { id: '10', title: 'Запись 10' },
               { id: '1', title: 'Запись 1' },
               { id: '2', title: 'Запись 2' },
               { id: '3', title: 'Запись 3' }
            ];

            ddl._selectorTemplateResult('selectorResult', selectedItems);
            assert.deepEqual(newItems, ddl._controller._items.getRawData());
         });

         it('_selectorResult', function() {
            let newConfig = Clone(config);
            let ddl = getDropdown(newConfig);
            ddl._beforeMount(config);
            let curItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  }, {
                     id: '2',
                     title: 'Запись 2'
                  }, {
                     id: '3',
                     title: 'Запись 3'
                  }]
               }),
               selectedItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     {
                        id: '9',
                        title: 'Запись 9'
                     },
                     {
                        id: '10',
                        title: 'Запись 10'
                     }]
               });
            ddl._controller._items = curItems;
            let newItems = [{
               id: '9',
               title: 'Запись 9'
            },
            {
               id: '10',
               title: 'Запись 10'
            },
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
            ];
            ddl._controller._source = config.source;
            ddl._selectorResult(selectedItems);
            assert.deepEqual(newItems, ddl._controller._items.getRawData());
            assert.isOk(ddl._controller._menuSource);
         });

         it('controller options', function() {
            const ddl = getDropdown(config);
            ddl._beforeMount(config);
            const result = ddl._getControllerOptions({
               nodeFooterTemplate: 'testNodeFooterTemplate'
            });

            assert.equal(result.menuOptions.nodeFooterTemplate, 'testNodeFooterTemplate');
            assert.isOk(result.menuOptions.selectorOpener);
         });

         it('_deactivated', function() {
            let opened = true;
            const ddl = getDropdown(config);
            ddl._beforeMount(config);
            ddl._controller.closeMenu = () => { opened = false; };
            ddl._deactivated();
            assert.isFalse(opened);
         });
      });
   }
);
