define('Controls-demo/List/DocWI/Filter', [
   'UI/Base',
   'wml!Controls-demo/List/DocWI/resources/Filter',
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
      },
      {
         id: 5,
         title: 'Yaroslavl',
         country: 'Russia'
      },
      {
         id: 6,
         title: 'St. Petersburg',
         country: 'Russia'
      },
   ];


   var Module = Base.Control.extend(
      {
         _template: template,
         _viewSource: null,
         _filter: null,

         _beforeMount: function(newOptions) {
            this._viewSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: srcData
            });
            this._filter = {
               country: ['Russia', 'United Kingdom']
            };
         }
      });
   return Module;
});
