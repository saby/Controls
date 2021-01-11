define('Controls-demo/List/List/LoadMore', [
   'UI/Base',
   'wml!Controls-demo/List/List/resources/LoadMore/LoadMore',
   'Types/source',
   'Controls-demo/List/List/resources/Data',
   'Controls/list',
], function (Base, template, sourceLib, ListData) {
   'use strict';

   var
      ModuleClass = Base.Control.extend({
         _template: template,
         _viewSource: null,
         _gridViewSource: null,
         _listNavigation: {
            source: 'page',
            view: 'demand',
            sourceConfig: {
               pageSize: 5,
               page: 0,
               hasMore: false
            },
            viewConfig: {
               pagingMode: 'basic'
            }
         },

         _beforeMount: function() {
            this._viewSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: ListData.generate(50)
            });
            this._gridViewSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: ListData.generate(50)
            });
         }
      });
   ModuleClass._styles = ['Controls-demo/List/List/resources/LoadMore/LoadMore'];

   return ModuleClass;
});
