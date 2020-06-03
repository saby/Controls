define('Controls/Utils/getItemsBySelection', [
   'Types/source',
   'Types/entity',
   'Types/chain',
   'Core/core-clone',
   'Core/Deferred'
], function(source, entity, chain, cClone, Deferred) {
   'use strict';

   var
      prepareArray = function(array) {
         return array.map(function(value) {
            return value !== null ? '' + value : value;
         });
      },
      selectionToRecord = function(selection, adapter) {
         var
            result = new entity.Record({
               adapter: adapter,
               format: [
                  { name: 'marked', type: 'array', kind: 'string' },
                  { name: 'excluded', type: 'array', kind: 'string' },
                  { name: 'recursive', type: 'boolean' }
               ]
            });

         result.set('marked', prepareArray(selection.selected));
         result.set('excluded', prepareArray(selection.excluded));
         result.set('recursive', selection.recursive === undefined ? true : selection.recursive);

         return result;
      };

   return function(selection, dataSource, items, filter, limit) {
      var
         item,
         query,
         result,
         selectedItems = [];

      selection.selected.forEach(function(key) {
         item = items.getRecordById(key);
         if (item) {
            selectedItems.push(item.getKey());
         }
      });

      // Do not load the data if they are all in the current recordSet.
      if (selectedItems.length === selection.selected.length && !selection.excluded.length) {
         result = Deferred.success(selectedItems);
      } else {
         query = new source.Query();

         var filterClone = filter ? cClone(filter) : {};
         filterClone.selection = selectionToRecord(selection, 'adapter.sbis');
         if (limit) {
            query.limit(limit);
         }
         result = dataSource.query(query.where(filterClone)).addCallback(function(list) {
            return chain.factory(list.getAll()).toArray().map(function(curItem) {
               return curItem.getKey();
            });
         }).addErrback(function() {
            return [];
         });
      }

      return result;
   };
});
