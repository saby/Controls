define('Controls-demo/List/DocWI/BaseList', [
   'UI/Base',
   'wml!Controls-demo/List/DocWI/resources/BaseList',
   'Types/source'
], function (Base, template, sourceLib) {
   'use strict';

   var srcData = [
      {
         id: 1,
         title: 'Prague'
      },
      {
         id: 2,
         title: 'Moscow'
      },
      {
         id: 3,
         title: 'London'
      },
      {
         id: 4,
         title: 'Jakarta'
      }
   ];

   var Module = Base.Control.extend(
      {
         _template: template,
         _viewSource: null,

         _beforeMount: function(newOptions) {
            this._viewSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: srcData
            });
         }
      });
   return Module;
});
