define(
   [
      'Controls/filterPopup',
      'Core/core-clone'
   ],
   function(filterPopup, Clone) {
      describe('FilterHistory:EditDialog', function() {
         let items = [
            {name: 'period', value: [2], textValue: 'Today'},
            {name: 'warehouse', value: [], textValue: ''},
            {name: 'sender', value: '', textValue: ''},
            {name: 'author', value: 'Ivanov K.K.', textValue: 'Ivanov K.K.', visibility: true},
            {name: 'responsible', value: 'Petrov T.T.',  textValue: 'Petrov T.T.', visibility: false}
         ];

         let defaultConfig = {
            items: items,
            isClient: 0,
            isFavorite: false,
            editedTextValue: 'Today, Ivanov K.K.'
         };

         it('prepareConfig', function() {
            let dialog = new filterPopup._EditDialog();
            dialog.prepareConfig(dialog, defaultConfig);
            assert.equal(dialog._placeholder, defaultConfig.editedTextValue);
            assert.equal(dialog._textValue, '');
            assert.equal(dialog._isClient, 0);
            assert.deepEqual(dialog._selectedFilters, ['period', 'author']);
            assert.isOk(dialog._source);
         });

         it('_beforeUpdate', function() {
            let dialog = new filterPopup._EditDialog();
            dialog.saveOptions(defaultConfig);

            let newConfig = {...defaultConfig};
            newConfig.editedTextValue = 'new text';
            newConfig.isFavorite = true;
            newConfig.isClient = 1;
            dialog._beforeUpdate(newConfig);
            assert.equal(dialog._textValue, newConfig.editedTextValue);
            assert.equal(dialog._isClient, newConfig.isClient);
            assert.deepEqual(dialog._selectedFilters, ['period', 'author']);
         });

         it('_delete', function() {
            let dialog = new filterPopup._EditDialog();

            let expectedResult, isClosed = false;
            dialog._notify = (event, data) => {
               if (event === 'sendResult') {
                  expectedResult = data[0];
               } else if (event === 'close') {
                  isClosed = true;
               }
            };

            dialog._delete();
            assert.equal(expectedResult.action, 'delete');
            assert.isTrue(isClosed);
         });

         it('_apply', function() {
            let dialog = new filterPopup._EditDialog();
            let isShowedConfirm = false;
            dialog.saveOptions(defaultConfig);
            dialog.prepareConfig(dialog, defaultConfig);
            dialog._selectedFilters = [];
            let expectedResult = {}, isClosed = false;
            dialog._notify = (event, data) => {
               if (event === 'sendResult') {
                  expectedResult = data[0];
               } else if (event === 'close') {
                  isClosed = true;
               }
            };

            dialog.showConfirmation = () => {isShowedConfirm = true};

            dialog._apply();
            assert.deepEqual(expectedResult, {});
            assert.isFalse(isClosed);
            assert.isTrue(isShowedConfirm);

            dialog._selectedFilters = ['author'];
            dialog._apply();
            assert.equal(expectedResult.action, 'save');
            assert.equal(expectedResult.record.get('linkText'), dialog._placeholder);
            assert.equal(expectedResult.record.get('isClient'), 0);
            assert.isTrue(isClosed);
         });

         it ('getItemsToSave', function() {
            let dialog = new filterPopup._EditDialog();
            dialog.prepareConfig(dialog, defaultConfig);

            let itemsToSave = Clone(items);
            itemsToSave[4].visibility = true;

            let expectedItems = Clone(itemsToSave);
            expectedItems[4].value = null;
            expectedItems[4].textValue = '';
            expectedItems[4].visibility = false;
            let resultItems = dialog.getItemsToSave(itemsToSave, dialog._selectedFilters);
            assert.deepEqual(expectedItems, resultItems);
         });
      });
   });
