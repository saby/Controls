define('Controls-demo/List/DocWI/TreeGridAdaptiveExpander', [
   'UI/Base',
   'wml!Controls-demo/List/DocWI/resources/TreeGridAdaptiveExpander',
   'Types/source'
], function (Base, template, sourceLib) {
   'use strict';

   var srcData = [
      {
         id: 1,
         title: 'Czech Republic',
         parent: null,
         hasChild: true
      },
      {
         id: 2,
         title: 'Prague',
         parent: 1,
         hasChild: false
      },
      {
         id: 3,
         title: 'Brno',
         parent: 1,
         hasChild: false
      },
      {
         id: 4,
         title: 'Russia',
         parent: null,
         hasChild: true
      },
      {
         id: 5,
         title: 'Moscow region',
         parent: 4,
         hasChild: true
      },
      {
         id: 6,
         title: 'Moscow',
         parent: 5,
         hasChild: false
      },
      {
         id: 7,
         title: 'Balashiha',
         parent: 5,
         hasChild: false
      },
      {
         id: 8,
         title: 'United Kingdom',
         parent: null,
         hasChild: true
      },
      {
         id: 9,
         title: 'London',
         parent: 8,
         hasChild: false
      },
      {
         id: 10,
         title: 'Indonesia',
         parent: null,
         hasChild: true
      },
      {
         id: 11,
         title: 'Jakarta',
         parent: 10,
         hasChild: false
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
