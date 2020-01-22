define(
   [
      'Controls/filter'
   ],
   function(filter) {
      describe('filter:resetFilterUtils', function() {

         it ('hasResetValue', function() {
            let items = [
               {
                  id: 'text',
                  value: 'value1',
                  resetValue: 'resetValue1'
               },
               {
                  id: 'boolean',
                  value: 'value2',
                  resetValue: 'resetValue2'
               }
            ];
            let result = filter.FilterUtils.hasResetValue(items);
            assert.isTrue(result);

            items = [
               {
                  id: 'text',
                  value: 'value1'
               },
               {
                  id: 'boolean',
                  value: 'value2'
               }
            ];
            result = filter.FilterUtils.hasResetValue(items);
            assert.isFalse(result);
         });

         it ('resetFilter', function() {
            let items = [
               {
                  id: 'text',
                  value: 'value1',
                  resetValue: 'resetValue1',
                  visibility: undefined
               },
               {
                  id: 'boolean',
                  value: 'value2',
                  resetValue: 'resetValue2',
                  textValue: '123',
                  visibility: undefined
               },
               {
                  id: 'Array',
                  value: 'resetValue3',
                  resetValue: 'resetValue3',
                  visibility: true
               },
               {
                  id: 'Number',
                  value: 'value4',
                  resetValue: 'resetValue4',
                  visibility: false
               },
               {
                  id: 'Object',
                  value: 'value5',
                  resetValue: 'resetValue5',
                  textValue: null,
                  visibility: false
               }
            ];

            let expectedItems = [
               {
                  id: 'text',
                  value: 'resetValue1',
                  resetValue: 'resetValue1',
                  visibility: undefined
               },
               {
                  id: 'boolean',
                  value: 'resetValue2',
                  resetValue: 'resetValue2',
                  textValue: '',
                  visibility: undefined
               },
               {
                  id: 'Array',
                  value: 'resetValue3',
                  resetValue: 'resetValue3',
                  visibility: false
               },
               {
                  id: 'Number',
                  value: 'resetValue4',
                  resetValue: 'resetValue4',
                  visibility: false
               },
               {
                  id: 'Object',
                  value: 'resetValue5',
                  resetValue: 'resetValue5',
                  textValue: null,
                  visibility: false
               }
            ];

            filter.FilterUtils.resetFilter(items);
            assert.deepEqual(items, expectedItems);
         });


      });
   }
);
