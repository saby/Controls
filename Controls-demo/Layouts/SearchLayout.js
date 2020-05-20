/**
 * Created by am.gerasimov on 26.01.2018.
 */
/**
 * Created by kraynovdo on 01.11.2017.
 */
define('Controls-demo/Layouts/SearchLayout', [
   'Core/Control',
   'wml!Controls-demo/Layouts/SearchLayout/SearchLayout',
   'Types/source',
   'Controls-demo/Utils/MemorySourceFilter',
   'Controls/list',
   'Controls/input',
   'Controls-demo/Layouts/LayoutFilterComponent',
   'Controls/filter',
   'Controls/buttons',
   'Controls/dropdown',
   'wml!Controls-demo/Layouts/SearchLayout/FilterButtonTemplate/filterItemsTemplate',
   'wml!Controls-demo/Layouts/SearchLayout/FilterButtonTemplate/additionalItemsTemplate',
   'wml!Controls-demo/Layouts/SearchLayout/FilterButtonTemplate/vdomFilterButtonTemplate'

], function (BaseControl,
             template,
             sourceLib,
             MemorySourceFilter) {
   'use strict';
   var ModuleClass = BaseControl.extend(
      {
         _template: template,
         _dataSource: null,
         _filterSource: null,
         _switchValue: false,
         _fastFilterSource: null,
         _navigation: null,
         _fastFilterData: null,
         _beforeMount: function () {
            this.sourceDropdown = new sourceLib.Memory({
               data: [
                  {key: 1, title: 'все страны'},
                  {key: 2, title: 'Россия'},
                  {key: 3, title: 'США'},
                  {key: 4, title: 'Великобритания'}
               ],
               keyProperty: 'key'
            });
            this.sourceId = new sourceLib.Memory({
               data: [
                  {key: 0, title: 'все id'},
                  {key: 1, title: '1'},
                  {key: 2, title: '2'},
                  {key: 3, title: '3'}
               ],
               keyProperty: 'key'
            });
            this._dataSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: [
                  {id: 1, firstName: 'Sasha', lastName: 'aaaa'},
                  {id: 2, firstName: 'Dmitry', lastName: 'aaaa'},
                  {id: 3, firstName: 'Andrey', lastName: 'aaaa'},
                  {id: 4, firstName: 'Aleksey', lastName: 'aaaa'},
                  {id: 5, firstName: 'Sasha', lastName: 'aaaa'},
                  {id: 6, firstName: 'Ivan', lastName: 'Lalala'},
                  {id: 7, firstName: 'Petr', lastName: 'dfsf'},
                  {id: 8, firstName: 'Roman', lastName: 'dfsf'},
                  {id: 9, firstName: 'Maxim', lastName: 'dfsf'},
                  {id: 10, firstName: 'Andrey', lastName: 'Lalala'},
                  {id: 12, firstName: 'Sasha', lastName: 'dfsf'},
                  {id: 13, firstName: 'Sasha', lastName: 'dfsf'},
                  {id: 14, firstName: 'Sasha', lastName: 'dfsf'},
                  {id: 15, firstName: 'Sasha', lastName: 'dfsf'},
                  {id: 16, firstName: 'Sasha', lastName: 'Lalala'},
                  {id: 17, firstName: 'Sasha', lastName: 'dfsf'},
                  {id: 18, firstName: 'Dmitry', lastName: 'Lalala'},
                  {id: 19, firstName: 'Andrey', lastName: 'dfsf'},
                  {id: 20, firstName: 'Aleksey', lastName: 'dfsf'},
                  {id: 21, firstName: 'Sasha', lastName: 'dfsf'},
                  {id: 22, firstName: 'Ivan', lastName: 'dfsf'},
                  {id: 23, firstName: 'Petr', lastName: 'dfgdfg'}
               ]
            });
            this._filterSource = [
               {
                  id: 'FIO', value: '', resetValue: '', visibility: false
               },
               {
                  id: 'firstName', value: 'По имени', resetValue: 'По имени', visibility: false
               },
               {
                  id: 'Test1',
                  value: [0],
                  resetValue: [0],
                  source: this.sourceDropdown,
                  textValue: '',
                  visibility: false
               },
               {
                  id: 'checked', value: false, resetValue: false, textValue: 'checked', visibility: false
               },
               {
                  id: 'id', value: [0], resetValue: [0], source: this.sourceId, visibility: false
               },
               {
                  id: 'Test2', value: false, resetValue: false, textValue: 'Test2', visibility: false
               },
               {
                  id: 'Test3', value: false, resetValue: false, textValue: 'Test3', visibility: false
               },
               {
                  id: 'Test4', value: false, resetValue: false, textValue: 'Test4', visibility: false
               },
               {
                  id: 'Test5', value: false, resetValue: false, textValue: 'FilterText', visibility: false
               },
               {
                  id: 'Test6', value: false, resetValue: false, textValue: 'Test6', visibility: false
               },
               {
                  id: 'Test7', value: false, resetValue: false, textValue: 'Test7', visibility: false
               },
               {
                  id: 'Test8', value: false, resetValue: false, textValue: 'Test8'
               }
            ];
            this._fastFilterData = [
               {
                  id: 'firstName',
                  resetValue: 'По имени',
                  value: 'По имени',
                  textValue: '',
                  properties: {
                     keyProperty: 'title',
                     displayProperty: 'title',
                     source: new sourceLib.Memory({
                        data: [
                           {id: 0, title: 'По имени'},
                           {id: 1, title: 'Sasha'},
                           {id: 2, title: 'Petr'},
                           {id: 3, title: 'Ivan'},
                           {id: 3, title: 'Andrey'}
                        ],
                        keyProperty: 'id'
                     })
                  }
               },
               {
                  id: 'id',
                  resetValue: [0],
                  value: [0],
                  textValue: '',
                  properties: {
                     keyProperty: 'id',
                     displayProperty: 'title',
                     source: new sourceLib.Memory({
                        data: [
                           {id: 0, title: 'По id'},
                           {id: 1, title: '1'},
                           {id: 2, title: '2'},
                           {id: 3, title: '3'},
                           {id: 4, title: '4'}
                        ],
                        keyProperty: 'id'
                     })
                  }
               },
               {
                  id: 'lastName',
                  resetValue: '0',
                  value: '0',
                  textValue: '',
                  properties: {
                     keyProperty: 'lastName',
                     displayProperty: 'title',
                     source: new sourceLib.Memory({
                        data: [
                           {id: 1, title: 'aaaa', lastName: 'aaaa'},
                           {id: 2, title: 'dfsf', lastName: 'dfsf'},
                           {id: 3, title: 'Такой нет', lastName: 'aaaaa'},
                           {id: 4, title: 'Lalala', lastName: 'Lalala'},
                           {id: 0, title: 'По фамилии', lastName: '0'}
                        ],
                        keyProperty: 'id'
                     })
                  }
               }
            ];
            this._fastFilterSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: this._fastFilterData
            });
            this._navigation = {
               source: 'page',
               view: 'pages',
               sourceConfig: {
                  pageSize: 20,
                  page: 0,
                  hasMore: false
               }
            };
         },

         _afterMount: function () {
            this._dataSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: [
                  {id: 1, firstName: 'Sasha', lastName: 'aaaa'},
                  {id: 2, firstName: 'Dmitry', lastName: 'aaaa'},
                  {id: 3, firstName: 'Andrey', lastName: 'aaaa'},
                  {id: 4, firstName: 'Aleksey', lastName: 'aaaa'},
                  {id: 5, firstName: 'Sasha', lastName: 'aaaa'},
                  {id: 6, firstName: 'Ivan', lastName: 'Lalala'},
                  {id: 7, firstName: 'Petr', lastName: 'dfsf'},
                  {id: 8, firstName: 'Roman', lastName: 'dfsf'},
                  {id: 9, firstName: 'Maxim', lastName: 'dfsf'},
                  {id: 10, firstName: 'Andrey', lastName: 'Lalala'},
                  {id: 12, firstName: 'Sasha', lastName: 'dfsf'},
                  {id: 13, firstName: 'Sasha', lastName: 'dfsf'},
                  {id: 14, firstName: 'Sasha', lastName: 'dfsf'},
                  {id: 15, firstName: 'Sasha', lastName: 'dfsf'},
                  {id: 16, firstName: 'Sasha', lastName: 'Lalala'},
                  {id: 17, firstName: 'Sasha', lastName: 'dfsf'},
                  {id: 18, firstName: 'Dmitry', lastName: 'Lalala'},
                  {id: 19, firstName: 'Andrey', lastName: 'dfsf'},
                  {id: 20, firstName: 'Aleksey', lastName: 'dfsf'},
                  {id: 21, firstName: 'Sasha', lastName: 'dfsf'},
                  {id: 22, firstName: 'Ivan', lastName: 'dfsf'},
                  {id: 23, firstName: 'Petr', lastName: 'dfgdfg'}
               ],
               filter: MemorySourceFilter({
                  firstName: 'По имени',
                  id: [0],
                  lastName: '0',
                  Test2: false,
                  Test3: false,
                  Test4: false,
                  Test5: false,
                  Test6: false,
                  Test7: false,
                  Test8: false,
                  checked: false,
                  Test1: [0],
                  FIO: ''
               })
            });
            this._forceUpdate();
         }
      }
   );
   ModuleClass._styles = ['Controls-demo/Layouts/SearchLayout/SearchLayout'];

   return ModuleClass;
});
