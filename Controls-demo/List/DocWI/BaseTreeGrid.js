define('Controls-demo/List/DocWI/BaseTreeGrid', [
   'UI/Base',
   'wml!Controls-demo/List/DocWI/resources/BaseTreeGrid',
   'Types/source'
], function (Base, template, sourceLib) {
   'use strict';

   var srcData = [
      {
         id: 1,
         title: 'Czech Republic',
         parent: null,
         type: false
      },
      {
         id: 2,
         title: 'Prague',
         parent: 1,
         type: null
      },
      {
         id: 3,
         title: 'Brno',
         parent: 1,
         type: null
      },
      {
         id: 4,
         title: 'Russia',
         parent: null,
         type: true
      },
      {
         id: 5,
         title: 'Moscow region',
         parent: 4,
         type: false
      },
      {
         id: 6,
         title: 'Moscow',
         parent: 5,
         type: null
      },
      {
         id: 7,
         title: 'Balashiha',
         parent: 5,
         type: null
      },
      {
         id: 8,
         title: 'United Kingdom',
         parent: null,
         type: false
      },
      {
         id: 9,
         title: 'London',
         parent: 8,
         type: null
      },
      {
         id: 10,
         title: 'Indonesia',
         parent: null,
         type: false
      },
      {
         id: 11,
         title: 'Jakarta',
         parent: 10,
         type: null
      }
   ];

   var Module = Base.Control.extend(
      {
         _template: template,
         _viewSource: null,
         _columns: null,

         _beforeMount: function(newOptions) {
            this._viewSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: srcData
            });

            this._columns = [
               {
                  displayProperty: 'title'
               }
            ];
         }
      });
   return Module;
});
