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

         it('_deactivated', () => {
            let ddl = getDropdown(config);
            let closed = false;

            ddl.closeMenu = () => {
               closed = true;
            };

            ddl._deactivated();
            assert.isTrue(closed);
         });

         it('_private::getTooltip', function() {
            let ddl = getDropdown(config);
            ddl._prepareDisplayState([null]);
            assert.equal(ddl._tooltip, '');
            ddl._prepareDisplayState(items.slice(0, 3));
            assert.equal(ddl._tooltip, 'Запись 1, Запись 2, Запись 3');
         });
      });
   }
);
