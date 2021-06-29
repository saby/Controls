define('Controls-demo/List/Tree/TreeMemory', [
   'Types/source',
   'Core/Deferred',
   'Core/core-clone'
], function(source, Deferred, cClone) {

   'use strict';

   function itemIsSelected(self, itemKey, selectedKeys, excludedKeys) {
      var parentKey = self._getRecordByKey(itemKey)['Раздел'];

      itemKey = '' + itemKey;
      return selectedKeys.indexOf(itemKey) !== -1 || (parentKey === null && selectedKeys.indexOf(null) !== -1 && excludedKeys.indexOf(itemKey) === -1);
   }

   var
      TreeMemory = source.Memory.extend({
         query: function(query) {
            var
               self = this,
               filter = query.getWhere(),
               selection = filter.selection;
            query.where(function(item) {
               var itemKey = item.get('id');
               var folderId;
               var correct;

               if (filter['id']) {
                  correct = filter['id'].includes(itemKey);
               } else {
                  if (filter['Раздел'] !== undefined && !(filter['Раздел'] instanceof Array)) {
                     folderId = filter['Раздел'];
                  } else {
                     folderId = null;
                  }
                  if ((filter['Раздел'] instanceof Array) && filter['expanded'] === true) {
                     correct = filter['Раздел'].includes(item.get('Раздел'));
                  } else {
                     correct = item.get('Раздел') === folderId;
                  }
                  if (selection) {
                     correct = itemIsSelected(self, itemKey, selection.get('marked'), selection.get('excluded'));
                  }

                  if (correct && filter.onlyFolders) {
                     correct = item.get('Раздел@') === true;
                  }
               }

               return correct;
            });
            return TreeMemory.superclass.query.apply(this, arguments);
         },
         destroy: function(items) {
            var
               itemsForRemove = cClone(items),
               directorIndex = itemsForRemove.indexOf(1);

            if (directorIndex !== -1) {
               itemsForRemove.splice(directorIndex, 1);
            }

            return TreeMemory.superclass.destroy.apply(this, [itemsForRemove]).addCallback(function(result) {
               return directorIndex !== -1 ? Deferred.fail('Unable to remove head of department.') : result;
            });
         }
      });

   return TreeMemory;
});
