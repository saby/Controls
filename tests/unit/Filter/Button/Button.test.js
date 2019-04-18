define(
   [
      'Controls/Filter/Button'
   ],
   function(FilterButton) {
      describe('FilterButton', function() {

         var button = new FilterButton();

         var filterItems = [
            {id: 'FIO', value: 'Petrov K.K.', resetValue: '', textValue: 'Petrov K.K.', visibility: true},
            {id: 'firstName', value: '', resetValue: '', visibility: true},
            {id: 'Test1', value: [0], resetValue: [0], textValue: '', visibility: false},
            {id: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: true},
            {id: 'id', value: [3], resetValue: [2], isFast: true, visibility: true}
         ];

         var filterItemsReseted = [
            {id: 'FIO', value: '', resetValue: '', textValue: 'Petrov K.K.', visibility: false},
            {id: 'firstName', value: '', resetValue: '', visibility: false},
            {id: 'Test1', value: [0], resetValue: [0], textValue: '', visibility: false},
            {id: 'unread', value: false, resetValue: false, textValue: 'Unread', visibility: false},
            {id: 'id', value: [3], resetValue: [2], isFast: true, visibility: true}
         ];

         button._beforeMount({items: filterItems});

         it('_beforeMount', function() {
            button._beforeMount({items: filterItems});
            assert.deepEqual(filterItems, button._items);
         });

         it('get text', function() {
            var text = FilterButton._private.getText(filterItems);
            assert.equal(text, 'Petrov K.K., Unread');
         });

         it('reset items', function() {
            FilterButton._private.resetItems(button, filterItems);
            assert.deepEqual(filterItems, filterItemsReseted);
         });

         it('clear click', function() {
            var items = [],
               filter;
            button._notify = (e, args) => {
               if (e == 'itemsChanged') {
                  items = args[0];
               } else if (e == 'filterChanged') {
                  filter = args[0];
               }
            };
            button._beforeMount(filterItems);
            button._clearClick();
            assert.deepEqual(items, filterItemsReseted);
            assert.deepEqual(filter, {});
            assert.equal(button._text, '');
         });

         it('_private.isItemsChanged', function() {
            var itemsChanged = [{id: 0, value: 'value', resetValue: 'resetValue'}];
            var itemsNotChanged = [{id: 0, value: 'resetValue', resetValue: 'resetValue'}];
            var itemsNotChangedWithoutResetValue = [{id: 0, value: 'value'}];

            assert.isTrue(FilterButton._private.isItemsChanged(itemsChanged));

            assert.isFalse(FilterButton._private.isItemsChanged(itemsNotChanged));

            assert.isFalse(FilterButton._private.isItemsChanged(itemsNotChangedWithoutResetValue));
         });

         it('_private.isItemChanged', function() {
            assert.isTrue(FilterButton._private.isItemChanged({id: 0, value: 'value', resetValue: 'resetValue'}));
            assert.isFalse(FilterButton._private.isItemChanged({id: 0, value: 'resetValue', resetValue: 'resetValue'}));
         });

         it('_private.getPopupConfig', function() {
            let expectedConfig = {
               templateOptions: {
                  template: 'testTemplateName',
                  items: ['testItems'],
                  historyId: 'testHistoryId'
               },
               fittingMode: 'fixed',
               template: 'Controls/filterPopup:_FilterPanelWrapper',
               target: 'panelTarget'
            };
            let self = {
               _options: {
                  templateName: 'testTemplateName',
                  items: ['testItems'],
                  historyId: 'testHistoryId'
               },
               _children: {
                  panelTarget: 'panelTarget'
               }
            };
            assert.deepEqual(expectedConfig, FilterButton._private.getPopupConfig(self));
         });

      });
   });
