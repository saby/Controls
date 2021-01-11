define('Controls-demo/List/DocWI/ListItemTemplate', [
   'UI/Base',
   'wml!Controls-demo/List/DocWI/resources/ListItemTemplate',
   'Types/source'
], function (Base, template, sourceLib) {
   'use strict';

   var srcData = [
      {
         id: 1,
         title: 'Prague',
         country: 'Czech Republic'
      },
      {
         id: 2,
         title: 'Moscow',
         country: 'Russia'
      },
      {
         id: 3,
         title: 'London',
         country: 'United Kingdom'
      },
      {
         id: 4,
         title: 'Jakarta',
         country: 'Indonesia'
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
