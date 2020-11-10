define(
   [
      'Controls/filter',
      'Core/core-clone'
   ],
   function(filterMod, Clone) {
      describe('FilterButton', function() {

         var button = new filterMod.Selector();

         var filterItems = [
            {id: 'FIO', value: 'Petrov K.K.', resetValue: '', textValue: 'Petrov K.K.', visibility: true},
            {id: 'firstName', value: '', resetValue: '', visibility: true},
            {id: 'Test1', value: [0], resetValue: [0], textValue: '', visibility: false},
            {id: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: true},
            {id: 'id', value: [3], resetValue: [2], isFast: true, visibility: true}
         ];

         var filterItemsReseted = [
            {id: 'FIO', value: '', resetValue: '', textValue: '', visibility: false},
            {id: 'firstName', value: '', resetValue: '', visibility: false},
            {id: 'Test1', value: [0], resetValue: [0], textValue: '', visibility: false},
            {id: 'unread', value: false, resetValue: false, textValue: '', visibility: false},
            {id: 'id', value: [3], resetValue: [2], isFast: true, visibility: true}
         ];

         button._beforeMount({items: filterItems});

         it('_beforeMount', function() {
            button._beforeMount({items: filterItems});
            assert.deepEqual(filterItems, button._items);
         });

         it('get text', function() {
            var text = filterMod.Selector._private.getText(filterItems);
            assert.equal(text, 'Petrov K.K., Unread');
         });

         it('get text resetTextValue', function() {
            let items = [
               {id: 'FIO', value: 'Petrov K.K.', textValue: 'Petrov K.K.', resetTextValue: 'Petrov K.K.', visibility: true},
               {id: 'firstName', value: '', visibility: true},
               {id: 'Test1', value: [0], textValue: '', visibility: false},
               {id: 'unread', value: true, textValue: 'Unread', resetTextValue: '', visibility: true},
               {id: 'id', value: [3], isFast: true, visibility: true}
            ];
            let text = filterMod.Selector._private.getText(items);
            assert.equal(text, 'Unread');
         });

         it('getText fast item', function() {
            let items = [
               {id: 'FIO', value: 'Petrov K.K.', textValue: 'Petrov K.K.', resetTextValue: 'Petrov K.K.', visibility: true},
               {id: 'firstName', value: '', visibility: true},
               {id: 'Test1', value: [0], textValue: '', visibility: false},
               {id: 'unread', value: true, textValue: 'Unread', resetTextValue: '', visibility: true},
               {id: 'id', value: [3], textValue: '896567', visibility: true}
            ];
            let text = filterMod.Selector._private.getText(items);
            assert.equal(text, 'Unread, 896567');

            items[4].isFast = true;
            text = filterMod.Selector._private.getText(items);
            assert.equal(text, 'Unread');
         });

         it('reset items', function() {
            let filterItems2 = [
               {id: 'FIO', value: 'Petrov K.K.', resetValue: '', textValue: 'Petrov K.K.', visibility: true},
               {id: 'firstName', value: '', resetValue: '', visibility: true},
               {id: 'Test1', value: [0], resetValue: [0], textValue: '', visibility: false},
               {id: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: true},
               {id: 'id', value: [3], resetValue: [2], isFast: true, visibility: true},
               {id: 'WithoutReset', value: [3], textValue: 'reseted', visibility: true}
            ], filterItemsReseted2 = [
               {id: 'FIO', value: '', resetValue: '', textValue: '', visibility: false},
               {id: 'firstName', value: '', resetValue: '', visibility: false},
               {id: 'Test1', value: [0], resetValue: [0], textValue: '', visibility: false},
               {id: 'unread', value: false, resetValue: false, textValue: '', visibility: false},
               {id: 'id', value: [3], resetValue: [2], isFast: true, visibility: true},
               {id: 'WithoutReset', value: [3], textValue: '', visibility: false}
            ];
            filterMod.Selector._private.resetItems(button, filterItems2);
            assert.deepStrictEqual(filterItems2, filterItemsReseted2);

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

            assert.isTrue(filterMod.Selector._private.isItemsChanged(itemsChanged));

            assert.isFalse(filterMod.Selector._private.isItemsChanged(itemsNotChanged));

            assert.isFalse(filterMod.Selector._private.isItemsChanged(itemsNotChangedWithoutResetValue));
         });

         it('_private.isItemChanged', function() {
            assert.isTrue(filterMod.Selector._private.isItemChanged({id: 0, value: 'value', resetValue: 'resetValue'}));
            assert.isFalse(filterMod.Selector._private.isItemChanged({id: 0, value: 'resetValue', resetValue: 'resetValue'}));
         });

         it('_private.getPopupConfig', function() {
            const expectedConfig = {
               templateOptions: {
                  template: 'testTemplateName',
                  items: ['testItems'],
                  historyId: 'testHistoryId'
               },
               autofocus: true,
               eventHandlers: {
                  onResult: () => {}
               },
               fittingMode: {
                  horizontal: 'overflow',
                  vertical: 'adaptive'
               },
               template: 'Controls/filterPopup:_FilterPanelWrapper',
               target: 'panelTarget'
            };
            const self = {
               _options: {
                  templateName: 'testTemplateName',
                  items: ['testItems'],
                  historyId: 'testHistoryId'
               },
               _children: {
                  panelTarget: 'panelTarget'
               },
               _onFilterChanged: () => {}
            };
            const resultOptions = filterMod.Selector._private.getPopupConfig(self);
            assert.deepEqual(expectedConfig.templateOptions, resultOptions.templateOptions);
            assert.deepEqual(expectedConfig.fittingMode, resultOptions.fittingMode);
            assert.equal(expectedConfig.template, resultOptions.template);
            assert.equal(expectedConfig.target, resultOptions.target);
         });

         it('_private.setPopupOptions', function() {
            let expectedResult = {
               closeOnOutsideClick: true,
               className: 'controls-FilterButton-popup-orientation-left',
               targetPoint: {
                  vertical: 'top',
                  horizontal: 'right'
               },
               direction: {
                  horizontal: 'left'
               }
            };
            let filterSelector = {},
               alignment = 'right';
            filterMod.Selector._private.setPopupOptions(filterSelector, alignment);
            assert.deepStrictEqual(filterSelector._popupOptions, expectedResult);

            expectedResult = {
               closeOnOutsideClick: true,
               className: 'controls-FilterButton-popup-orientation-right'
            };
            alignment = 'left';
            filterMod.Selector._private.setPopupOptions(filterSelector, alignment);
            assert.deepStrictEqual(filterSelector._popupOptions, expectedResult);
         });

         it('_private.requireDeps', function() {
            let self = {
               _options: {}
            };

            return new Promise(function(resolve) {
               self._options.templateName = 'Controls/filter:Selector';
               filterMod.Selector._private.requireDeps(self).addCallback(function(mod) {
                  assert.isTrue(!!mod);
                  resolve();
               });
            });
         });

      });
   });
