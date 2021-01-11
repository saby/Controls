define('Controls-demo/List/DocWI/EmptyList', [
   'UI/Base',
   'wml!Controls-demo/List/DocWI/resources/EmptyList',
   'Types/source'
], function (Base, template, sourceLib) {
   'use strict';

   var Module = Base.Control.extend(
      {
         _template: template,
         _viewSource: null,

         _beforeMount: function(newOptions) {
            this._viewSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: []
            });
         }
      });
   return Module;
});
