define('Controls-demo/Explorer/ExplorerMemory', [
   'Types/source',
   'Types/collection',
   'Core/Deferred',
   'Core/core-clone'
], function(source, collection, Deferred, cClone) {

   'use strict';

   function getById(items, id) {
      for (var i = 0; i < items.length; i++) {
         if (items[i].id === id) {
            return cClone(items[i]);
         }
      }
   }

   function getFullPath(items, currentRoot, needRecordSet) {
      var
         path = [],
         currentNode = getById(items, currentRoot);
      path.unshift(getById(items, currentRoot));
      while (currentNode.parent !== null) {
         currentNode = getById(items, currentNode.parent);
         path.unshift(currentNode);
      }
      if (needRecordSet) {
         return new collection.RecordSet({
            rawData: path,
            keyProperty: 'id'
         });
      }
      return path;
   }

   var
      TreeMemory = source.Memory.extend({
         query: function(query) {
            var
               self = this,
               result = new Deferred(),
               rootData = [],
               data = [],
               items = {},
               parents,
               filter = query.getWhere(),
               parent = filter.parent instanceof Array ? filter.parent[0] : filter.parent;

            // if search mode
            if (filter.title) {
               this._$data.forEach(function(item) {
                  if (item.title.toUpperCase().indexOf(filter.title.toUpperCase()) !== -1) {
                     items[item.id] = item;
                  }
               });
               for (var i in items) {
                  if (items.hasOwnProperty(i)) {
                     if (items[i].parent !== null) {
                        parents = getFullPath(self._$data, items[i].parent);
                        parents.forEach(function(par) {
                           data.push(par);
                        });
                        data.push(items[i]);
                     } else {
                        rootData.push(items[i]);
                     }
                  }
               }
               result.callback(new source.DataSet({
                  rawData: data.concat(rootData),
                  adapter: this.getAdapter(),
                  keyProperty: 'id'
               }));
            } else {
               query.where(function(item) {
                  if (filter.parent && filter.parent.forEach) {
                     for (var i = 0; i < filter.parent.length; i++) {
                        if (item.get('parent') === filter.parent[i]) {
                           return true;
                        }
                     }
                     return false;
                  } else {
                     if (parent !== undefined) {
                        return item.get('parent') === parent;
                     }
                     return true;
                  }
               });
               TreeMemory.superclass.query.apply(this, arguments).addCallback(function(data) {
                  var
                     originalGetAll = data.getAll;
                  data.getAll = function() {
                     var
                        result = originalGetAll.apply(this, arguments),
                        meta = result.getMetaData();
                     if (parent !== undefined && parent !== null) {
                        meta.path = getFullPath(self._$data, parent, true);
                     }
                     result.setMetaData(meta);
                     return result;
                  };
                  result.callback(data);
               });
            }
            return result;
         }
      });

   return TreeMemory;
});
