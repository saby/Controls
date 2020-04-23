define('Controls-demo/FastFilter/FastFilter',
   [
      'Core/Control',
      'wml!Controls-demo/FastFilter/FastFilter',
      'Types/source',
      'Controls/filter',
   ],

   function(Control, template, sourceLib) {
      /**
       * @class Controls/Layout/Search
       * @extends Controls/Control
       * @control
       * @public
       */

      'use strict';
      var FastData = Control.extend({

         _template: template,
         _styles: ['Controls-demo/FastFilter/FastFilter'],
         dataSourceDemoSource: null,
         dataSourceDemoItems: null,
         _beforeMount: function() {
            this.dataSourceDemoSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: 'filter1',
                     resetValue: [null],
                     value: [1],
                     properties: {
                        multiSelect: true,
                        emptyText: 'Все страны',
                        keyProperty: 'key',
                        displayProperty: 'title',
                        source: new sourceLib.Memory({
                           data: [
                              { key: 1, title: 'Россия' },
                              { key: 2, title: 'США' },
                              { key: 3, title: 'Великобритания' }
                           ]
                        })
                     }
                  },
                  {
                     id: 'filter2',
                     resetValue: 0,
                     value: 0,
                     properties: {
                        keyProperty: 'key',
                        displayProperty: 'title',
                        source: new sourceLib.Memory({
                           data: [
                              { key: 0, title: 'все жанры' },
                              { key: 1, title: 'фантастика' },
                              { key: 2, title: 'фэнтези' },
                              { key: 3, title: 'мистика' }
                           ]
                        })
                     }
                  },
                  {
                     id: 'fafaf',
                     resetValue: '3',
                     value: '0',
                     properties: {
                        keyProperty: 'lastName',
                        displayProperty: 'title',
                        source: new sourceLib.Memory({
                           data: [
                              { id: 0, lastName: '0', title: '0' },
                              { id: 1, lastName: '1', title: '333' },
                              { id: 2, lastName: '2', title: 'iwfyls' },
                              { id: 3, lastName: '3', title: 'reset to me' },
                              { id: 3, lastName: '4', title: 'Oomph!' }
                           ]
                        })
                     }
                  }
               ]
            });
            this.dataSourceDemoItems = [
               {
                  id: 'filter21',
                  resetValue: 'все страны',
                  value: 'Франция',
                  properties: {
                     keyProperty: 'title',
                     displayProperty: 'title',
                     source: new sourceLib.Memory({
                        data: [
                           { key: 0, title: 'все страны' },
                           { key: 1, title: 'Франция' },
                           { key: 2, title: 'Германия' },
                           { key: 3, title: 'Канада' }
                        ]
                     })
                  }
               },
               {

                  id: 'filter22',
                  resetValue: 0,
                  value: 2,
                  properties: {
                     keyProperty: 'key',
                     displayProperty: 'title',
                     source: new sourceLib.Memory({
                        data: [
                           { key: 0, title: 'все жанры' },
                           { key: 1, title: 'фантастика' },
                           { key: 2, title: 'фэнтези' },
                           { key: 3, title: 'мистика' }
                        ]
                     })
                  }
               },
               {
                  id: 'fafaf2',
                  resetValue: '3',
                  value: '0',
                  properties: {
                     keyProperty: 'lastName',
                     displayProperty: 'title',
                     source: new sourceLib.Memory({
                        data: [
                           { id: 0, lastName: '0', title: 'aaaa' },
                           { id: 1, lastName: '1', title: '333' },
                           { id: 2, lastName: '2', title: 'iwfyls' },
                           { id: 3, lastName: '3', title: 'reset to me' },
                           { id: 3, lastName: '4', title: 'Oomph!' }
                        ]
                     })
                  }
               }
            ];
         },
         _createMemory: function(items) {
            return new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            });
         },
         _getDefaultMemory: function() {
            return this._createMemory(this.dataSourceDemoSource);
         }
      });

      return FastData;
   });
