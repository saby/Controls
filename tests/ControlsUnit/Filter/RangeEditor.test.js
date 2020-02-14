define(['Controls/filter'],
   function(filter) {

      describe('Controls/filter:DateRange', function() {

         it('_beforeMount', () => {
            var rangeEditor = new filter.DateRangeEditor();
            rangeEditor._beforeMount({
               editorMode: 'Lite'
            });
            assert.equal(rangeEditor._templateName, 'Controls/dateRange:LiteSelector');

            rangeEditor._beforeMount({
               editorMode: 'Selector'
            });
            assert.equal(rangeEditor._templateName, 'Controls/dateRange:Selector');

         });

         it('_rangeChanged', (done) => {
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

            rangeEditor._rangeChanged({}, new Date('April 17, 1995 03:24:00'), new Date('May 17, 1995 03:24:00')).then(() => {
               assert.equal(textValue, '17.04.95 - 17.05.95');
               done();
            });
         });

      });
});
