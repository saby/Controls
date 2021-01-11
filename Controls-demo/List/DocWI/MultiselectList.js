define('Controls-demo/List/DocWI/MultiselectList', [
   'UI/Base',
   'wml!Controls-demo/List/DocWI/resources/MultiselectList',
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
      },
      {
         id: 5,
         title: 'Accra'
      },
      {
         id: 6,
         title: 'Baghdad'
      },
      {
         id: 7,
         title: 'Abidjan'
      }
   ];

   var Module = Base.Control.extend(
      {
         _template: template,
         _viewSource: null,
         _selectedKeys: [],

         _beforeMount: function(newOptions) {
            this._viewSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: srcData
            });
         }
      });
   return Module;
});
