import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import Deferred = require('Core/Deferred');

function getById(items, id) {
   for (let index = 0; index < items.length; index++) {
      if (items[index].id === id) {
         return {...items[index]};
      }
   }
}

function getFullPath(items, currentRoot, needRecordSet) {
   let
      path = [],
      currentNode = getById(items, currentRoot);

   path.unshift(getById(items, currentRoot));

   while (currentNode['Раздел'] !== null) {
      currentNode = getById(items, currentNode['Раздел']);
      path.unshift(currentNode);
   }

   if (needRecordSet) {
      return new RecordSet({
         rawData: path,
         keyProperty: 'id'
      });
   }

   return path;
}

export default class extends Memory {
   query(query) {
      let
         self = this,
         result = new Deferred(),
         rootData = [],
         data = [],
         items = {},
         parents,
         filter = query.getWhere(),
         parent = filter['Раздел'] instanceof Array ? filter['Раздел'][0] : filter['Раздел'] ;
      
      // if search mode
      if (filter.title) {
         this._$data.forEach(function(item) {
            if (item.title.toUpperCase().indexOf(filter.title.toUpperCase()) !== -1) {
               items[item.id] = item;
            }
         });
         
         for (let i in items) {
            if (items.hasOwnProperty(i)) {
               if (items[i]["Раздел"] !== null) {
                  parents = getFullPath(self._$data, items[i]["Раздел"]);
                  parents.forEach(function(par) {
                     data.push(par);
                  });
                  data.push(items[i]);
               } else {
                  rootData.push(items[i]);
               }
            }
         }

         data.concat(rootData);
         result.callback(new source.DataSet({
            rawData: data,
            adapter: this.getAdapter(),
            keyProperty: 'id'
         }));
      } else {
         query.where(function(item) {
            if (parent !== undefined) {
               return item.get('Раздел') === parent;
            } else {
               return item.get('Раздел') === null;
            }
         });

         super.query(...arguments).addCallback(function(data) {
            let
               originalGetAll = data.getAll;
            data.getAll = function() {
               let
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
}
