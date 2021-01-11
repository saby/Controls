define('Controls-demo/List/DocWI/ListPadding', [
   'UI/Base',
   'wml!Controls-demo/List/DocWI/resources/ListPadding',
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
         _itemPadding: null,

         _beforeMount: function(newOptions) {
            this._viewSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: srcData
            });
            this._itemPadding = {
               left: 'xxl',
               right: 'xxl',
               top: 'm',
               bottom: 'm'
            }
         }
      });
   return Module;
});
