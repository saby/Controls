define(
   [
      'Controls/_filterPopup/converterFilterStructure',
      'Types/entity',
      'Types/collection'
   ],
   function (converterFilterStructure, entity, collection) {
      describe('converterFilter', function () {
         var initRecordItem = new collection.RecordSet({
            rawData: [
               {
                  id: '1',
                  caption: 'filter',
                  value: 'value',
                  resetValue: 'resetValue',
                  textValue: 'text'
               },
               {
                  id: '2',
                  caption: 'filter2',
                  value: 'value',
                  resetValue: 'resetValue',
                  textValue: undefined
               }
            ]
         });
         var initFilterStruct = [
            {
               internalValueField: '1',
               internalCaptionField: 'filter',
               value: 'value',
               resetValue: 'resetValue',
               caption: 'text'
            },
            {
               internalValueField: '2',
               internalCaptionField: 'filter2',
               value: 'value',
               resetValue: 'resetValue'
            }
         ];
         it('Перевод в filterStructure', function () {
            var filterStruct = converterFilterStructure.convertToFilterStructure(initRecordItem);
            assert.deepEqual(filterStruct, initFilterStruct);
         });

         it('Перевод в RecordSet', function () {
            var sourceData = converterFilterStructure.convertToSourceData(initFilterStruct);
            assert.deepEqual(sourceData.getRawData(), initRecordItem.getRawData());
         });
      });
   });
