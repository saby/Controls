define(
   [
      'Controls/dropdownPopup',
      'Types/collection'
   ],
   function(dropdownPopup, collection) {
      describe('DropdownPopup:MoreButton', function() {

         let defaultItems = new collection.RecordSet({
            keyProperty: 'id',
            rawData: [{id: '1', title: 'Test1'},
               {id: '2', title: 'Test2'},
               {id: '3', title: 'Test3'},
               {id: '4', title: 'Test4'},
               {id: '5', title: 'Test5'},
               {id: '6', title: 'Test6'}]
         });

         let defaultConfig = {
            selectedKeys: ['1', '3'],
            items: defaultItems.clone(),
            selectorTemplate: {
               templateName: 'DialogTemplate.wml',
               templateOptions: {
                  option1: '1',
                  option2: '2'
               }
            },
            multiSelect: true
         };

         let getButton = function (config) {
            let button = new dropdownPopup.MoreButton();
            button.saveOptions(config);
            return button;
         };

         it('_openSelectorDialog', function() {
            let actualOptions, selectCompleted, closed;
            let button = getButton(defaultConfig);
            button._options.selectorOpener = {open: (popupOptions) => {actualOptions = popupOptions;},
               close: () => {closed = true}};
            button._options.selectorDialogResult = () => {selectCompleted = true};
            button._openSelectorDialog();

            assert.strictEqual(actualOptions.template, defaultConfig.selectorTemplate.templateName);
            assert.strictEqual(actualOptions.isCompoundTemplate, defaultConfig.isCompoundTemplate);
            assert.deepStrictEqual(actualOptions.templateOptions.selectedItems.getCount(), 2);
            assert.isTrue(actualOptions.templateOptions.multiSelect);
            assert.strictEqual(actualOptions.templateOptions.option1, '1');
            assert.strictEqual(actualOptions.templateOptions.option2, '2');
            assert.isOk(actualOptions.templateOptions.handlers.onSelectComplete);
            assert.isFalse(actualOptions.hasOwnProperty('opener'));

            actualOptions.templateOptions.handlers.onSelectComplete();
            assert.isTrue(selectCompleted);
            assert.isTrue(closed);

            button._options.selectedKeys = [null];
            button._openSelectorDialog();
            assert.deepStrictEqual(actualOptions.templateOptions.selectedItems.getCount(), 0);

            // nonexistent keys
            button._options.selectedKeys = ['1', '2', '1000'];
            button._openSelectorDialog();
            assert.deepStrictEqual(actualOptions.templateOptions.selectedItems.getCount(), 2);

         });
      });
   }
);
