define(
   [
      'Controls/dropdown',
      'Controls/history',
      'Types/source'
   ],
   (dropdown, history, Source) => {
   describe('dropdownHistoryUtils',() => {
      it('getSource', (done) => {
         let hSource = new history.Source({});
         dropdown.dropdownHistoryUtils.getSource( hSource, {historyId: 'test'}).addCallback((source) => {
            assert.deepStrictEqual(source, hSource);

            dropdown.dropdownHistoryUtils.getSource('my source', {}).addCallback((source) => {
               assert.strictEqual(source, 'my source');
               done();
            });
         });
      });

      it('getFilter', () => {
         var filter = dropdown.dropdownHistoryUtils.getSourceFilter({id: 'test'}, new history.Source({}));
         assert.deepEqual(filter, {$_history: true, id: 'test'});
         filter = dropdown.dropdownHistoryUtils.getSourceFilter({id: 'test2'}, new Source.Memory({}));
         assert.deepEqual(filter, {id: 'test2'});
         filter = dropdown.dropdownHistoryUtils.getSourceFilter(undefined, new history.Source({}));
         assert.deepEqual(filter, {$_history: true});
      });
   });
});
