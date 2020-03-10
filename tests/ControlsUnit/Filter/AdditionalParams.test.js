define(
   [
      'Controls/_filterPopup/Panel/AdditionalParams'
   ],
   function(AddParams) {
      describe('FilterPanelAdditionalVDom', function() {

         let items = [
            {
               id: 'list',
               value: 1,
               resetValue: 1
            },
            {
               id: 'text',
               value: '123',
               resetValue: '',
               visibility: true
            },
            {
               id: 'bool',
               value: true,
               resetValue: false,
               visibility: false
            }
         ];

         let getAddParams = function(items) {
            let addParams = new AddParams();
            addParams.saveOptions({items: items});
            addParams._beforeMount({items: items});
            return addParams;
         };

         it('is visible', function() {
            let addParams = getAddParams(items);
            assert.equal(addParams._isItemVisible(items[0]), true);
            assert.equal(addParams._isItemVisible(items[1]), true);
            assert.equal(addParams._isItemVisible(items[2]), false);
         });

         it('_beforeUpdate', function() {
            let addParams = getAddParams(items);
            let newItems = [
               {
                  id: 'list',
                  value: 1,
                  resetValue: 1
               },
               {
                  id: 'text',
                  value: '123',
                  resetValue: '',
                  visibility: false
               },
               {
                  id: 'bool',
                  value: true,
                  resetValue: false,
                  visibility: false
               },
               {
                  id: 'bool1',
                  value: true,
                  resetValue: false,
                  visibility: false
               },
               {
                  id: 'bool2',
                  value: true,
                  resetValue: false,
                  visibility: false
               },
               {
                  id: 'bool3',
                  value: true,
                  resetValue: false,
                  visibility: false
               }
            ];
            addParams._beforeUpdate({items: newItems});
            assert.deepEqual(addParams.items, newItems);
            assert.deepEqual(addParams._columns, { leftColumn: [1, 2, 3], rightColumn: [4, 5] });
            assert.isFalse(addParams._arrowVisible);
         });

         it('_private::getColumnsByItems', function() {
            let items2 = [
               {
                  id: 'list',
                  value: 1,
                  resetValue: 1
               },
               {
                  id: 'text',
                  value: '123',
                  resetValue: '',
                  visibility: true
               },
               {
                  id: 'bool',
                  value: true,
                  resetValue: false,
                  visibility: false
               }
            ];
            assert.deepEqual(AddParams._private.getColumnsByItems(items2), {leftColumn: [1], rightColumn: [2]});
            items2[1].visibility = undefined;
            assert.deepEqual(AddParams._private.getColumnsByItems(items2), {leftColumn: [2], rightColumn: []});
         });

         it('_private::needShowArrow', function() {
            let items2 = [
               {
                  id: 'list',
                  value: 1,
                  resetValue: 1
               },
               {
                  id: 'text',
                  value: '123',
                  resetValue: '',
                  visibility: false
               },
               {
                  id: 'bool',
                  value: true,
                  resetValue: false,
                  visibility: false
               },
               {
                  id: 'bool1',
                  value: true,
                  resetValue: false,
                  visibility: false
               },
               {
                  id: 'bool2',
                  value: true,
                  resetValue: false,
                  visibility: false
               },
               {
                  id: 'bool3',
                  value: true,
                  resetValue: false,
                  visibility: false
               }
            ];
            var columns = {leftColumn: [1, 2, 3, 4, 5]};
            assert.isFalse(AddParams._private.needShowArrow(items2, columns));
            items2.push({
               id: 'bool4',
               value: true,
               resetValue: false,
               visibility: false
            });
            columns.leftColumn.push(6);
            assert.isTrue(AddParams._private.needShowArrow(items2, columns));
         });

         it('_valueChangedHandler', function() {
            let addParams = getAddParams(items);
            let itemsChangedFired = false;
            addParams._notify = () => {
               itemsChangedFired = true;
            };
            addParams._valueChangedHandler('valueChanged', 2, 'newValue');
            assert.isTrue(itemsChangedFired);
            assert.equal('newValue', addParams.items[2].value);
         });

         it('_textValueChangedHandler', function() {
            let addParams = getAddParams(items);
            let itemsChangedFired = false;
            addParams._notify = () => {
               itemsChangedFired = true;
            };
            addParams._textValueChangedHandler('textValueChanged', 2, 'newValue');
            assert.equal('newValue', addParams.items[2].textValue);
            assert.isTrue(addParams.items[2].visibility);
            assert.isTrue(itemsChangedFired);
         });

         it('_visibilityChanged', function() {
            let addParams = getAddParams(items);
            let itemsChangedFired = false;
            addParams._notify = () => {
               itemsChangedFired = true;
            };
            addParams._visibilityChangedHandler('visibilityChanged', 2);
            assert.equal(true, addParams.items[2].visibility);
            assert.isTrue(itemsChangedFired);
         });

      });
   });
