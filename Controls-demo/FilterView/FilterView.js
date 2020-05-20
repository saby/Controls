define('Controls-demo/FilterView/FilterView',
   [
      'Core/Control',
      'wml!Controls-demo/FilterView/FilterView',
      'Controls-demo/FilterView/resources/hierarchyHistoryMemory',
      'Controls-demo/FilterView/resources/hierarchyMemory',
      'Types/source',
      'Controls-demo/Utils/MemorySourceFilter',
      'Controls-demo/Selector/SelectorData',
      'Controls/history',
      'Core/core-clone',
      'Controls-demo/FilterView/resources/historySourceFast',

      'wml!Controls-demo/FilterView/resources/itemTemplatePhoto'

   ],
   function (
      Control,
      template,
      hierarchyHistoryMemory,
      hierarchyMemory,
      sourceLib,
      memorySourceFilter,
      SelectorData,
      history,
      Clone,
      historySourceFast
   ) {

   var operationData = [
      {
         id: 1,
         title: 'Task',
         '@parent': true,
         parent: null
      },
      { id: 2, title: 'Error in the development', '@parent': null, parent: null },
      { id: 3, title: 'Commission', parent: 1, '@parent': null },
      {
         id: 4,
         title: 'Coordination',
         parent: 1,
         '@parent': true
      },
      { id: 5, title: 'Application', parent: 1, '@parent': null },
      { id: 6, title: 'Development', parent: 1, '@parent': null },
      { id: 7, title: 'Exploitation', parent: 1, '@parent': null },
      { id: 8, title: 'Coordination', parent: 4, '@parent': null },
      { id: 9, title: 'Negotiate the discount', parent: 4, '@parent': null },
      { id: 10, title: 'Coordination of change prices', parent: 4, '@parent': null },
      { id: 11, title: 'Matching new dish', parent: 4, '@parent': null }
   ];

      /**
       *
       * Template for dropdown of union fast filter.
       * @control
       * @public
       * @category Popup
       */

      var FilterView = Control.extend({
         _template: template,
         _defaultSource: null,
         _hierarchyItems: null,
         _hierarchyItems2: null,
         _hierarchyDataSource: null,
         _hierarchyDataSource2: null,
         _navigation: null,
         _itemsMore: null,
         _buttonItems: null,
         _buttonItemsWithoutResetValue: null,
         _fastButtonItems: null,
         _fastButtonItems2: null,
         _fastButtonItems3: null,
         _oneFastItems: null,
         _oneFastItems2: null,
         _customTemplateItems: null,
         _scrollFastItems: null,
         _historyFastItems: null,
         _filterText: '',

         _fastItems: null,

         _beforeMount: function() {
            this._navigation = {source: 'page', view: 'page', sourceConfig: {pageSize: 4, page: 0, hasMore: false}};
            this._defaultSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: [
                  {id: null, title: 'All documents'},
                  {id: 1, title: 'My'},
                  {id: 2, title: 'My department'}
               ]
            });
            this._hierarchyDataSource = [
               {id: 'Приход', title: 'Coming', parent: null, '@parent': true},
               {id: 'Расход', title: 'Consumption', parent: null, '@parent': true},
               {id: '11', title: 'The provider returns the prepayment', parent: 'Приход', '@parent': null},
               {id: '12', title: 'Payment from the buyer', parent: 'Приход', '@parent': null},
               {id: '21', title: 'Return of prepayment to the buyer', parent: 'Расход', '@parent': null},
               {id: '22', title: 'Payment to the supplier', parent: 'Расход', '@parent': null},
               {id: '23', title: 'Payment to the supplier 3', parent: 'Расход', '@parent': null},
               {id: '24', title: '1Payment to the supplier 3', parent: 'Расход', '@parent': null},
               {id: '13', title: '2Payment to the supplier 3', parent: 'Приход', '@parent': null},
               {id: '14', title: '3Payment to the supplier 3', parent: 'Приход', '@parent': null},
               {id: '15', title: '4Payment to the supplier 3', parent: 'Приход', '@parent': null},
               {id: '16', title: '5Payment to the supplier 3', parent: 'Приход', '@parent': null},
               {id: '17', title: '6Payment to the supplier 3', parent: 'Приход', '@parent': null},
               {id: '18', title: '7Payment to the supplier 3', parent: 'Приход', '@parent': null}

            ];
            this._hierarchyDataSource2 = [
               {id: 'Список1', title: 'Список 1', parent: null, '@parent': true},
               {id: 'Список2', title: 'Список 2', parent: null, '@parent': true},
               {id: '11', title: 'Ребенок 1', parent: 'Список1', '@parent': null},
               {id: '12', title: 'Ребенок 2', parent: 'Список1', '@parent': null},
               {id: '21', title: 'Ребенок 1', parent: 'Список2', '@parent': null},
               {id: '22', title: 'Ребенок 2', parent: 'Список2', '@parent': null},
               {id: '23', title: 'Ребенок 3', parent: 'Список2', '@parent': null}
            ];
            this._hierarchyItems = [{
               name: 'hierarchyOperations',
               value: {},
               resetValue: {},
               emptyText: 'All operations',
               editorOptions: {
                  displayProperty: 'title',
                  keyProperty: 'id',
                  parentProperty: 'parent',
                  nodeProperty: '@parent',
                  source: new hierarchyHistoryMemory({
                     originSource: new sourceLib.Memory({
                        keyProperty: 'id',
                        data: this._hierarchyDataSource
                     }),
                     historySource: new history.Service({
                        historyId: 'DEMO_HISTORY_ID'
                     })
                  }),
                  filter: {$_history: true},
                  selectorTemplate: { templateName: 'Controls-demo/Dropdown/TreeStackTemplate', templateOptions: {items: this._hierarchyDataSource,
                        nodeProperty: '@parent', parentProperty: 'parent', multiSelect: true} },
                  navigation: {source: 'page', view: 'page', sourceConfig: {pageSize: 8, page: 0}},
                  selectorTemplateName: 'Controls-demo/Dropdown/TreeStackTemplate',
                  suggestTemplateName: 'Controls-demo/Input/Lookup/Suggest/SuggestTemplate',
                  className: 'controls-demo-FilterView__lookupTemplate',
                  caption: 'Our company',
                  placeholder: 'Enter company name',
                  searchParam: 'title',
                  multiSelect: true
               },
               viewMode: 'frequent'
            }, {
               name: 'lists',
               value: {Список1: ['Список1'], Список2: ['21', '22']},
               resetValue: null,
               emptyText: 'All',
               editorOptions: {
                  displayProperty: 'title',
                  keyProperty: 'id',
                  parentProperty: 'parent',
                  nodeProperty: '@parent',
                  source: new hierarchyHistoryMemory({
                     originSource: new sourceLib.Memory({
                        idProperty: 'id',
                        data: this._hierarchyDataSource2
                     }),
                     historySource: new history.Service({
                        historyId: 'DEMO_HISTORY_ID'
                     })
                  }),
                  filter: {$_history: true},
                  selectorTemplate: { templateName: 'Controls-demo/Dropdown/TreeStackTemplate', templateOptions: {items: this._hierarchyDataSource2,
                        nodeProperty: '@parent', parentProperty: 'parent', multiSelect: true} },
                  navigation: {source: 'page', view: 'page', sourceConfig: {pageSize: 8, page: 0}},
                  selectorTemplateName: 'Controls-demo/Dropdown/TreeStackTemplate',
                  suggestTemplateName: 'Controls-demo/Input/Lookup/Suggest/SuggestTemplate',
                  className: 'controls-demo-FilterView__lookupTemplate',
                  caption: 'Lists',
                  placeholder: 'Enter name',
                  searchParam: 'title',
                  multiSelect: true
               },
               viewMode: 'frequent'
            }];
            this._hierarchyItems2 = [{
               name: 'operations',
               value: [],
               resetValue: [],
               emptyText: 'All operations',
               emptyKey: '111',
               editorOptions: {
                  displayProperty: 'title',
                  keyProperty: 'id',
                  parentProperty: 'parent',
                  nodeProperty: '@parent',
                  source: new hierarchyMemory({
                     idProperty: 'id',
                     data: this._hierarchyDataSource
                  }),
                  selectorTemplate: { templateName: 'Controls-demo/Dropdown/TreeStackTemplate', templateOptions: {items: this._hierarchyDataSource,
                        nodeProperty: '@parent', parentProperty: 'parent', multiSelect: true}, popupOptions: {width: 300} },
                  navigation: {source: 'page', view: 'page', sourceConfig: {pageSize: 8, page: 0}},
                  multiSelect: true
               },
               viewMode: 'frequent'
            }, {
               name: 'lists',
               value: {'Список1': ['Список1'], 'Список2': ['21', '22']},
               resetValue: null,
               emptyText: 'All',
               editorOptions: {
                  displayProperty: 'title',
                  keyProperty: 'id',
                  parentProperty: 'parent',
                  nodeProperty: '@parent',
                  source: new hierarchyMemory({
                     idProperty: 'id',
                     data: this._hierarchyDataSource2
                  }),
                  navigation: {source: 'page', view: 'page', sourceConfig: {pageSize: 8, page: 0}},
                  multiSelect: true
               },
               viewMode: 'frequent'
            }];
            this._fastItems = [
               {
                  name: 'files',
                  value: [],
                  resetValue: [],
                  emptyText: 'All files',
                  editorOptions: {
                     source: new sourceLib.Memory({
                        idProperty: 'id',
                        data: [
                           { id: 1, title: 'Incoming' },
                           { id: 2, title: 'Outgoing' }
                        ]
                     }),
                     displayProperty: 'title',
                     keyProperty: 'id'
                  },
                  viewMode: 'frequent'
               },
               {
                  name: 'category',
                  value: 1,
                  resetValue: 10,
                  emptyText: 'All category',
                  emptyKey: 10,
                  editorOptions: {
                     source: new sourceLib.Memory({
                        idProperty: 'id',
                        data: [
                           { id: 1, title: 'Images' },
                           { id: 2, title: 'Documents' },
                           { id: 3, title: 'Audio/Video' },
                           { id: 4, title: '' }
                        ]
                     }),
                     displayProperty: 'title',
                     keyProperty: 'id'
                  },
                  viewMode: 'frequent'
               }
            ];
            this._itemsMultiSelect = [
               { id: '1', title: 'Yaroslavl' },
               { id: '2', title: 'Moscow' },
               { id: '3', title: 'St-Petersburg' },
               { id: '4', title: 'Astrahan' },
               { id: '5', title: 'Arhangelsk' },
               { id: '6', title: 'Abakan' },
               { id: '7', title: 'Barnaul' },
               { id: '8', title: 'Belgorod' },
               { id: '9', title: 'Voronezh' },
               { id: '10', title: 'Vladimir' },
               { id: '11', title: 'Bryansk' },
               { id: '12', title: 'Ekaterinburg' },
               { id: '13', title: 'Kostroma' },
               { id: '14', title: 'Vologda' },
               { id: '15', title: 'Pskov' },
               { id: '16', title: 'Kirov' }
            ];
            this._itemsCategory = [
               { id: 1, title: 'Banking and financial services, credit' },
               { id: 2, title: 'Gasoline, diesel fuel, light oil products' },
               { id: 3, title: 'Transportation, logistics, customs' },
               { id: 4, title: 'Oil and oil products' },
               { id: 5, title: 'Pipeline transportation services' },
               { id: 6, title: 'Services in tailoring and repair of clothes, textiles' },
               { id: 7, title: 'Computers and components, computing, office equipment' },
               { id: 8, title: 'Accounting, audit' },
               { id: 9, title: 'Marketing and social research' },
               { id: 10, title: 'Locking and sealing products' },
               { id: 11, title: 'Weapons, ammunition, weapons' },
               { id: 12, title: 'Security services, security' },
               { id: 13, title: 'Storages, safes' },
               { id: 14, title: 'Books, newspapers, magazines and other products of publishing houses' },
               { id: 15, title: 'Equipment and raw materials for printing. Spare parts' },
               { id: 16, title: 'Printing Services' },
               { id: 17, title: 'Advertising, media, television' },
               { id: 18, title: 'Souvenirs' },
               { id: 19, title: 'Photo, video and sound recording services' },
               { id: 20, title: 'Rental and leasing of real estate, exchange, privatization' },
               { id: 21, title: 'Purchase and sale of residential and non-residential buildings, structures and premises' },
               { id: 22, title: 'Purchase and sale of land' }
            ];
            this._itemsMore = [
               {
                  name: 'region',
                  value: [null],
                  resetValue: [null],
                  emptyText: 'all records',
                  editorOptions: {
                     source: new sourceLib.Memory({
                        idProperty: 'id',
                        data: this._itemsMultiSelect
                     }),
                     displayProperty: 'title',
                     keyProperty: 'id',
                     navigation: this._navigation,
                     selectorTemplate: { templateName: 'Controls-demo/Dropdown/StackTemplate', templateOptions: {items: this._itemsMultiSelect, multiSelect: true}, popupOptions: {width: 300} },
                     multiSelect: true
                  },
                  viewMode: 'frequent'
               }, {
                  name: 'category',
                  value: 1,
                  resetValue: null,
                  emptyText: 'all categories',
                  editorOptions: {
                     source: new sourceLib.Memory({
                        idProperty: 'id',
                        data: this._itemsCategory
                     }),
                     displayProperty: 'title',
                     keyProperty: 'id',
                     navigation: this._navigation,
                     selectorTemplate: { templateName: 'Controls-demo/Dropdown/StackTemplate', templateOptions: {items: this._itemsCategory}, popupOptions: {width: 500} }
                  },
                  viewMode: 'frequent'
               }, {
                  name: 'state',
                  value: 1,
                  resetValue: null,
                  emptyText: 'all state',
                  editorOptions: {
                     source: new sourceLib.Memory({
                        idProperty: 'id',
                        data: [
                           {id: 1, text: 'In any state'},
                           {id: 2, text: 'In progress'},
                           {id: 3, text: 'Completed'},
                           {
                              id: 4,
                              text: 'Completed positive'
                           },
                           {
                              id: 5,
                              text: 'Completed negative'
                           },
                           {id: 6, text: 'Deleted'},
                           {id: 7, text: 'Drafts'}
                        ]
                     }),
                     displayProperty: 'text',
                     keyProperty: 'id'
                  },
                  viewMode: 'frequent'
               }
            ];
            this._buttonItems = [
               {name: 'unread', value: true, resetValue: false, textValue: 'Unread', viewMode: 'extended', visibility: false},
               {name: 'limit', value: [null], resetValue: [null], textValue: 'Due date', viewMode: 'extended', visibility: false, source: new sourceLib.Memory({
                  idProperty: 'id',
                  data: [
                     {id: 1, title: 'Due date'},
                     {id: 2, title: 'Overdue'}
                  ]}
               )},
               { name: 'sender', value: null, resetValue: '', viewMode: 'extended', visibility: false, source: this._defaultSource },
               { name: 'operation', value: [], resetValue: [], textValue: '', source: this._defaultSource,
                  editorOptions: {
                     selectorTemplate:{templateName:'Controls-demo/Dropdown/TreeStackTemplate', templateOptions: {items: operationData,
                           nodeProperty: '@parent', parentProperty: 'parent', multiSelect: true}},
                     suggestTemplateName: 'Controls-demo/Input/Lookup/Suggest/SuggestTemplate',
                     className: 'controls-demo-FilterView__lookupTemplate',
                     parentProperty: 'parent',
                     nodeProperty: '@parent',
                     caption: 'Operation',
                     multiSelect: true,
                     keyProperty: 'title',
                     placeholder: 'Specify operation name',
                     source: new sourceLib.Memory({
                        data: operationData,
                        keyProperty: 'id',
                        filter: memorySourceFilter()
                     })
                  }},
               {name: 'loose', value: true, resetValue: '', textValue: 'Loose', viewMode: 'extended', visibility: false},
               {name: 'author', value: 'Ivanov K.K.', textValue: 'Author: Ivanov K.K.', resetValue: '', viewMode: 'basic'},
               {name: 'own', value: 2, resetValue: '', textValue: 'On department', viewMode: 'extended', visibility: false, source: new sourceLib.Memory({
                  idProperty: 'id',
                  data: [
                     { id: 1, title: 'On me' },
                     { id: 2, title: 'On department' }
                  ]
               })},
               {name: 'ourOrganisation', value: [], resetValue: [], textValue: '', viewMode: 'extended', visibility: false,
                  editorOptions: {
                     selectorTemplate: {
                        templateName: 'Controls-demo/Input/Lookup/FlatListSelector/FlatListSelector',
                        templateOptions: {
                           source: new sourceLib.Memory({
                              data: SelectorData.companies,
                              keyProperty: 'id'
                           })
                        }
                     },
                     suggestTemplateName: 'Controls-demo/Input/Lookup/Suggest/SuggestTemplate',
                     className: 'controls-demo-FilterView__lookupTemplate',
                     caption: 'Our company',
                     placeholder: 'Enter company name',
                     keyProperty: 'id',
                     source: new sourceLib.Memory({
                        data: SelectorData.companies,
                        keyProperty: 'id'
                     })
                  }},
               {name: 'activity', value: [1], resetValue: [1], viewMode: 'extended', visibility: false, source: new sourceLib.Memory({
                  idProperty: 'id',
                  data: [
                     { id: 1, title: 'Activity for the last month' },
                     { id: 2, title: 'Activity for the last quarter' },
                     { id: 3, title: 'Activity for the last year' }
                  ]
               })}
            ];
            this._buttonItemsWithoutResetValue = Clone(this._buttonItems);
            this._buttonItemsWithoutResetValue.forEach(function (item) {delete item.resetValue;});
            this._fastButtonItems = [
               {
                  name: 'date',
                  resetValue: [new Date(2019, 7, 1), new Date(2019, 7, 31)],
                  value: [new Date(2019, 6, 1), new Date(2019, 6, 31)],
                  type: 'dateRange',
                  editorOptions: {
                     chooseHalfyears: false,
                     chooseYears: false
                  },
                  viewMode: 'basic'
               },
               {
                  name: 'document',
                  value: null,
                  resetValue: null,
                  textValue: '',
                  emptyText: 'All documents',
                  editorOptions: {
                     source: new sourceLib.Memory({
                        idProperty: 'id',
                        data: [
                           {id: 1, title: 'My'},
                           {id: 2, title: 'My department'}
                        ]
                     }),
                     displayProperty: 'title',
                     keyProperty: 'id'
                  },
                  viewMode: 'frequent'
               },
               {
                  name: 'category',
                  value: [1],
                  resetValue: [null],
                  textValue: '',
                  emptyText: 'all categories',
                  editorOptions: {
                     source: new sourceLib.Memory({
                        idProperty: 'id',
                        data: [{ id: 1, title: 'Banking and financial services, credit' },
                           { id: 2, title: 'Gasoline, diesel fuel, light oil products' },
                           { id: 3, title: 'Transportation, logistics, customs' },
                           { id: 4, title: 'Oil and oil products' },
                           { id: 5, title: 'Pipeline transportation services' },
                           { id: 6, title: 'Services in tailoring and repair of clothes, textiles' },
                           { id: 7, title: 'Computers and components, computing, office equipment' },
                           { id: 8, title: 'Accounting, audit' },
                           { id: 9, title: 'Marketing and social research' },
                           { id: 10, title: 'Locking and sealing products' }]
                     }),
                     displayProperty: 'title',
                     keyProperty: 'id',
                     multiSelect: true
                  },
                  viewMode: 'frequent'
               },
               {
                  name: 'state',
                  value: [1],
                  resetValue: [null],
                  textValue: '',
                  emptyText: 'all state',
                  editorOptions: {
                     source: new sourceLib.Memory({
                        idProperty: 'id',
                        data: [
                           {id: 1, title: 'In any state'},
                           {id: 2, title: 'In progress'},
                           {id: 3, title: 'Completed'},
                           {
                              id: 4,
                              title: 'Completed positive'
                           },
                           {
                              id: 5,
                              title: 'Completed negative'
                           },
                           {id: 6, title: 'Deleted'},
                           {id: 7, title: 'Drafts'}
                        ]
                     }),
                     displayProperty: 'title',
                     keyProperty: 'id',
                     multiSelect: true
                  },
                  viewMode: 'frequent'
               },
               {name: 'responsible', value: '', resetValue: '', viewMode: 'extended', visibility: false},
               {name: 'tagging', value: false, resetValue: false, textValue: 'Marks', viewMode: 'extended', visibility: false}
            ].concat(this._buttonItems);

            this._fastButtonItems2 = Clone(this._fastButtonItems);
            this._fastButtonItems2[0].editorOptions.editorMode = 'Selector';
            this._fastButtonItems2.push({
               name: 'detailingPeriod',
               value: [1],
               resetValue: [1],
               textValue: '',
               viewMode: 'extended',
               visibility: false,
               source: new sourceLib.Memory({
                  keyProperty: 'key',
                  data: [
                     { key: 1, title: 'On documents', 'parent@': false, parent: null },
                     { key: 2, title: 'Summary', 'parent@': true, parent: null },
                     { key: 3, title: 'Day', text: 'Summary by day', parent: 2, 'parent@': false },
                     { key: 4, title: 'Month', text: 'Summary by monthly', parent: 2, 'parent@': false },
                     { key: 5, title: 'Year', text: 'Summary by year', parent: 2, 'parent@': false }
                  ]
               })
            });

            this._fastButtonItems3 = Clone(this._fastButtonItems);
            this._fastButtonItems3[0].editorOptions.clearButtonVisibility = true;

            this._oneFastItems = [
               { name: 'acting',
                  value: '1',
                  resetValue: '1',
                  editorOptions: {
                     source: new sourceLib.Memory({
                        idProperty: 'id',
                        data: [{ id: '1', title: 'Acting'}, {id: '2', title: 'All'}]
                     }),
                     displayProperty: 'title',
                     keyProperty: 'id'
                  },
                  viewMode: 'frequent'
               }
            ];
            this._oneFastItems2 = [
               { name: 'type',
                  value: '1',
                  editorOptions: {
                     source: new sourceLib.Memory({
                        idProperty: 'id',
                        data: [{ id: '1', title: 'EDO'}, {id: '2', title: 'EDI'}]
                     }),
                     displayProperty: 'title',
                     keyProperty: 'id'
                  },
                  viewMode: 'frequent'
               }
            ];
            this._scrollFastItems = [
               {
                  name: 'state',
                  value: [1],
                  resetValue: [null],
                  textValue: '',
                  emptyText: 'all state',
                  editorOptions: {
                     source: new sourceLib.Memory({
                        idProperty: 'id',
                        data: this._getMultiItems()
                     }),
                     displayProperty: 'title',
                     keyProperty: 'id',
                     multiSelect: true
                  },
                  viewMode: 'frequent'
               }
            ];
            this._customTemplateItems = [
               { name: 'contacts', value: null, resetValue: null, viewMode: 'frequent', emptyText: 'all contacts', editorOptions: {
                     source: new sourceLib.Memory({
                        idProperty: 'id',
                        data: [
                           { id: '1', title: 'Completed contacts' },
                           { id: '2', title: 'Unrelated' },
                           { id: '3', title: 'Communication is scheduled' }
                        ]
                     }),
                     displayProperty: 'title',
                     keyProperty: 'id'
                  }
               },
               { name: 'employees', value: null, resetValue: null, viewMode: 'frequent', emptyText: 'all employees', editorOptions: {
                     source: historySourceFast.createMemory(),
                     displayProperty: 'title',
                     keyProperty: 'id',
                     itemTemplateProperty: 'itemTpl'
                  }
               }
            ];
         },

         _beforeUnmount: function() {
            this._hierarchyItems.forEach( function(item) {
               item.editorOptions.source.destroyHistory();
            });
         },

         _getMultiItems: function() {
            var items = [];
            for (var i = 0; i < 100; i++) {
               items.push({title: 'Item ' + i, id: i});
            }
            return items;
         },

         _itemsChanged: function(event, field, items) {
            this[field] = items;
         }
      });

      FilterView._styles = ['Controls-demo/FilterView/FilterView'];

      return FilterView;
   });
