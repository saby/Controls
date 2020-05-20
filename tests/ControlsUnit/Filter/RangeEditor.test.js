define(['Controls/filter'],
   function(filter) {

      describe('Controls/filter:DateRange', function() {

         it('_beforeMount', () => {
            var rangeEditor = new filter.DateRangeEditor();
            rangeEditor._beforeMount({
               editorMode: 'Lite'
            });
            assert.equal(rangeEditor._templateName, 'Controls/dateRange:RangeShortSelector');

            rangeEditor._beforeMount({
               editorMode: 'Selector'
            });
            assert.equal(rangeEditor._templateName, 'Controls/dateRange:RangeSelector');
         });

         describe('_beforeMount _emptyCaption', () => {
            let rangeEditor;
            const resetValue = [new Date('April 1, 1995'), new Date('April 30, 1995')];

            beforeEach(() => {
               rangeEditor = new filter.DateRangeEditor();
            });

            it('option emptyCaption', () => {
               rangeEditor._beforeMount({
                  emptyCaption: 'testCaption',
                  resetValue
               });
               assert.equal(rangeEditor._emptyCaption, 'testCaption');
               assert.isFalse(rangeEditor._reseted);
            });

            it('without option emptyCaption', () => {
               return rangeEditor._beforeMount({
                  resetValue
               }).then(() => {
                  assert.equal(rangeEditor._emptyCaption, "Апрель'95");
                  assert.isFalse(rangeEditor._reseted);
               });
            });

            it('value === resetValue', () => {
               return rangeEditor._beforeMount({
                  value: resetValue,
                  resetValue
               }).then(() => {
                  assert.equal(rangeEditor._emptyCaption, "Апрель'95");
                  assert.isTrue(rangeEditor._reseted);
               });
            });
         });

         it ('_beforeUpdate', () => {
            let rangeEditor = new filter.DateRangeEditor();
            const resetValue = [new Date('April 17, 1995'), new Date('May 17, 1995')];

            rangeEditor._beforeUpdate({value: resetValue, resetValue});
            assert.isTrue(rangeEditor._reseted);

            rangeEditor._beforeUpdate({value: [new Date('April 17, 1998'), new Date('May 17, 1998')], resetValue});
            assert.isFalse(rangeEditor._reseted);
         });

         it('_rangeChanged', () => {
            var rangeEditor = new filter.DateRangeEditor();
            var textValue;

            rangeEditor.saveOptions({
               emptyCaption: 'testEmptyCaption'
            });

            rangeEditor._notify = (event, eventValue) => {
               if (event === 'textValueChanged') {
                  textValue = eventValue[0];
               }
            };

            return rangeEditor._rangeChanged({}, new Date('April 17, 1995 03:24:00'), new Date('May 17, 1995 03:24:00')).then(() => {
               assert.equal(textValue, '17.04.95 - 17.05.95');
               assert.isFalse(rangeEditor._reseted);
            });
         });

         it('_rangeChanged resetValue', () => {
            let rangeEditor = new filter.DateRangeEditor();
            let date;
            const resetValue = [new Date('April 17, 1995 03:24:00'), new Date('May 17, 1995 03:24:00')];

            rangeEditor.saveOptions({
               value: resetValue,
               resetValue
            });

            rangeEditor._notify = (event, eventValue) => {
               if (event === 'rangeChanged') {
                  date = eventValue;
               }
            };

            return rangeEditor._rangeChanged({}, null, null).then(() => {
               assert.deepEqual(date, resetValue);
               assert.isTrue(rangeEditor._reseted);
            });
         });
      });
});
