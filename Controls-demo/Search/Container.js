/**
 * Created by am.gerasimov on 17.07.2018.
 */
define('Controls-demo/Search/Container', [
   'Core/Control',
   'wml!Controls-demo/Search/Container',
   'Types/source',
   'Controls-demo/Utils/MemorySourceData',
   'Controls-demo/Utils/MemorySourceFilter',
], function(Control, template, sourceLib, memorySourceData, memorySourceFilter) {

   'use strict';

   var SearchContainer = Control.extend({
      _template: template,
      _styles: ['Controls-demo/Search/Container'],
      _navigation: null,
      _filter: null,
      _searchValue: '',
      _searchDelay: 500,
      _beforeMount: function() {
         this._filter = {};
         this._navigation = {
            source: 'page',
            view: 'page',
            sourceConfig: {
               pageSize: 20,
               page: 0,
               hasMore: false
            }
         };
         this._source = new sourceLib.Memory({
            data: memorySourceData.departments,
            filter: this._filterFunc,
            keyProperty: 'id'
         });
      },
      _filterFunc: function(item, query) {
         var filter = memorySourceFilter('department');
         return filter(item, query);
      }
   });
   return SearchContainer;
});
