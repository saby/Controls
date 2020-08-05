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
         it('_setText', function() {
            let combobox = getCombobox(config);
            combobox._setText([itemsRecords.at(1)]);
            assert.equal('Запись 2', combobox._value);
            combobox._setText([]);
            assert.strictEqual('', combobox._value);
            assert.strictEqual('This is placeholder', combobox._placeholder);

            combobox._setText([new entity.Model({
               rawData: { id: '1', title: 123 }
            })]);
            assert.strictEqual('123', combobox._value);
         });

         it('_setText empty item', function() {
            let emptyConfig = Clone(config),
               emptyItems = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [{ id: null, title: 'Не выбрано' }]
               });
            emptyConfig.emptyText = 'Не выбрано';
            let combobox = getCombobox(emptyConfig);
            combobox._setText([emptyItems.at(0)]);
            assert.equal('', combobox._value);
            assert.equal('Не выбрано', combobox._placeholder);
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

         it('_beforeUpdate width change', function() {
            let combobox = getCombobox(config);
            combobox._container = {offsetWidth: 250};
            combobox._controller = {
               update: () => {}
            };
            assert.equal(combobox._width, undefined);
            combobox._beforeUpdate({});
            assert.equal(combobox._width, 250);
         });

         it('dataLoadCallback option', function() {
            let combobox = getCombobox(config);
            combobox._beforeMount(config);
            const result = combobox._getControllerOptions({ dataLoadCallback: 'testDataLoadCallback' });

            assert.equal(result.menuOptions.dataLoadCallback, 'testDataLoadCallback');
         });
      });
   }
);
