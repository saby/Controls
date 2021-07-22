define(
   [
      'Controls/dropdown',
      'Core/core-clone',
      'Types/source',
      'Types/collection',
      'Types/entity'
   ],
   (dropdown, Clone, sourceLib, collection, entity) => {
      describe('Input.Combobox', () => {
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
            }
         ];

         let itemsRecords = new collection.RecordSet({
            keyProperty: 'id',
            rawData: items
         });

         let config = {
            selectedKey: '2',
            displayProperty: 'title',
            keyProperty: 'id',
            value: 'New text',
            placeholder: 'This is placeholder',
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            })
         };


         let getCombobox = function(config) {
            let combobox = new dropdown.Combobox(config);
            combobox.saveOptions(config);
            combobox._simpleViewModel = { updateOptions: function() {} };
            return combobox;
         };

         describe('_setText', () => {
            let combobox;
            beforeEach(() => {
               const newConfig = {...config, emptyKey: null};
               combobox = getCombobox(newConfig);
            });

            it('_setText', function() {
               combobox._setText(combobox._options, [itemsRecords.at(1)]);
               assert.equal('Запись 2', combobox._value);
               combobox._setText(combobox._options, []);
               assert.strictEqual('', combobox._value);
               assert.strictEqual('This is placeholder', combobox._placeholder);

               combobox._setText(combobox._options, [new entity.Model({
                  rawData: { id: '1', title: 123 }
               })]);
               assert.strictEqual('123', combobox._value);
            });

            it('_setText set 0', function() {
               let selectedItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{ id: '1', title: 0 }]
               });
               combobox._setText(combobox._options, [selectedItems.at(0)]);
               assert.equal('0', combobox._value);
            });

            it('_setText empty item', function() {
               let emptyItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{ id: null, title: 'Не выбрано' }]
               });
               combobox._options.emptyText = 'Не выбрано';
               combobox._options.emptyKey = null;
               combobox._setText(combobox._options, [emptyItems.at(0)]);
               assert.equal('', combobox._value);
               assert.equal('Не выбрано', combobox._placeholder);
            });

            it('_setText key = emptyKey', function() {
               let emptyItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{ id: null, title: 'Не выбрано' }]
               });
               combobox._options.emptyText = null;
               combobox._options.emptyKey = null;
               combobox._setText(combobox._options, [emptyItems.at(0)]);
               assert.equal('Не выбрано', combobox._value);
               assert.equal('This is placeholder', combobox._placeholder);
            });
         });

         it('_selectedItemsChangedHandler', function() {
            let combobox = getCombobox(config);
            combobox._notify = function(event, data) {
               if (event === 'valueChanged') {
                  assert.equal(data[0], 'Запись 2');
               } else if (event === 'selectedKeyChanged') {
                  assert.equal(data[0], '2');
               }
            };
         });

         describe('_beforeMount', function() {
            it('beforeMount with selectedKeys', () => {
               let combobox = getCombobox(config);
               combobox._beforeMount(config);
               assert.equal(combobox._value, 'New text');
               assert.equal(combobox._placeholder, 'This is placeholder');
            });

            it('beforeMount without source', () => {
               const comboboxOptions = {...config};
               delete comboboxOptions.source;
               const combobox = getCombobox(comboboxOptions);
               assert.ok(combobox._beforeMount(comboboxOptions) === undefined);
            });
         });

         it('_beforeUpdate', function() {
            let combobox = getCombobox(config);
            let isUpdated = false;
            combobox._controller = {
               update: () => {isUpdated = true}
            };
            combobox._beforeUpdate({});
            assert.isTrue(isUpdated);
         });

         it('_beforeUpdate readOnly changes', function() {
            let combobox = getCombobox(config);
            let isUpdated = false;
            combobox._controller = {
               update: () => {isUpdated = true}
            };
            combobox._beforeUpdate({
               readOnly: true
            });
            assert.isTrue(combobox._readOnly);
         });


         it('dataLoadCallback option', function() {
            let isCalled = false;
            let combobox = getCombobox(config);
            combobox._options.dataLoadCallback = () => {
               isCalled = true;
            };
            combobox._dataLoadCallback(combobox._options, itemsRecords);

            assert.isTrue(isCalled);
         });

         it('_getMenuPopupConfig', () => {
            let combobox = getCombobox(config);
            combobox._container = {offsetWidth: 250};

            let result = combobox._getMenuPopupConfig();
            assert.equal(result.templateOptions.width, 250);

            combobox._container.offsetWidth = null;
            result = combobox._getMenuPopupConfig();
            assert.equal(result.templateOptions.width, null);
         });

         it('_afterMount', () => {
            let combobox = getCombobox(config);
            let selectedItemIsChanged = false;
            combobox._selectedItemsChangedHandler = () => {
               selectedItemIsChanged = true;
            };
            combobox._selectedItem = new entity.Model({
               rawData: {
                  key: 1
               }
            });
            combobox._countItems = 1;
            combobox._afterMount({
               keyProperty: 'key',
               selectedKey: 1
            });
            assert.isFalse(selectedItemIsChanged);

            combobox._afterMount({
               keyProperty: 'key',
               selectedKey: 5
            });
            assert.isTrue(selectedItemIsChanged);
         });

         describe('check readOnly state', () => {
            let combobox;
            let itemsCallback = new collection.RecordSet({
               keyProperty: 'key',
               rawData: []
            });
            beforeEach(() => {
               combobox = getCombobox(config);
               combobox._controller = {
                  update: () => {}
               };
            });

            it('count of items = 0', () => {
               combobox._dataLoadCallback(combobox._options, itemsCallback);
               assert.isTrue(combobox._readOnly);
               assert.isUndefined(combobox._selectedItem);
               assert.equal(combobox._countItems, 0);
            });

            it('count of items = 1', () => {
               itemsCallback.add(new entity.Model({
                  rawData: { key: '1' }
               }));
               combobox._dataLoadCallback(combobox._options, itemsCallback);
               assert.isTrue(combobox._readOnly);
               assert.deepEqual(combobox._selectedItem, itemsCallback.at(0));
            });

            it('count of items = 1, with emptyText', () => {
               combobox._options.emptyText = 'test';
               combobox._options.readOnly = false;
               combobox._dataLoadCallback(combobox._options, itemsCallback);
               assert.isFalse(combobox._readOnly);
            });

            it('count of items = 2', () => {
               itemsCallback.add(new entity.Model({
                  rawData: { key: '2' }
               }));
               combobox._dataLoadCallback(combobox._options, itemsCallback);
               assert.isFalse(combobox._readOnly);
               assert.isUndefined(combobox._selectedItem);
            });

            it('count of items = 2, with options.readOnly', () => {
               combobox._options.readOnly = true;
               combobox._dataLoadCallback(combobox._options, itemsCallback);
               assert.isTrue(combobox._readOnly);
            });
         });
      });
   }
);
