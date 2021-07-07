define([
   'Controls/list',
   'Types/collection',
   'Types/source',
   'Core/Deferred'
], function(list, collection, source, Deferred) {

   'use strict';
   describe('Controls.Utils.getItemsBySelection', function() {
      const getItemsBySelection = list.getItemsBySelection;
      var
         data = [
            { id: 1, title: 'item 1' },
            { id: 2, title: 'item 2' },
            { id: 3, title: 'item 3' },
            { id: 4, title: 'item 4' }
         ],
         recordSet = new collection.RecordSet({
            rawData: data,
            keyProperty: 'id'
         }),
         callSource = false,
         callQuery,
         dataSource = new source.Memory({
            keyProperty: 'id',
            data: data
         });

      dataSource.query = function(query) {
         callSource = true;
         callQuery = query;
         return Deferred.success({
            getAll: function() {
               var
                  item,
                  result = [],
                  filter = query.getWhere();
               if (filter.loadData !== false) {
                  filter.selection.get('marked').forEach(function (key) {
                     item = recordSet.getRecordById(key);
                     item && result.push(item);
                  });
               }
               return result;
            }
         });
      };

      beforeEach(function() {
         callSource = false;
      });

      it('all items in RecordSet', function(done) {
         getItemsBySelection({
            selected: [1, 2],
            excluded: []
         }, dataSource, recordSet, {}).addCallback(function(items) {
            assert.isFalse(callSource);
            assert.equal(items.length, 2);
            done();
         });
      });

      it('not all items in RecordSet', function(done) {
         getItemsBySelection({
            selected: [1, 5],
            excluded: []
         }, dataSource, recordSet, {}).addCallback(function(items) {
            assert.isTrue(callSource);
            assert.equal(items.length, 1);
            assert.equal(items[0], 1);
            done();
         });
      });

      it('with filter', function(done) {
         getItemsBySelection({
            selected: [1, 5],
            excluded: []
         }, dataSource, recordSet, {
            loadData: false
         }).addCallback(function(items) {
            assert.isTrue(callSource);
            assert.equal(items.length, 0);
            done();
         });
      });

      it('recursive', function() {
         getItemsBySelection({
            selected: [1, 5],
            excluded: [],
            recursive: true
         }, dataSource, recordSet, {});
         assert.isTrue(callQuery._where.selection.get('recursive'));

         getItemsBySelection({
            selected: [1, 5],
            excluded: [],
            recursive: false
         }, dataSource, recordSet, {});
         assert.isFalse(callQuery._where.selection.get('recursive'));

         getItemsBySelection({
            selected: [1, 5],
            excluded: [],
         }, dataSource, recordSet, {});
         assert.isTrue(callQuery._where.selection.get('recursive'));
      });
   });
});
