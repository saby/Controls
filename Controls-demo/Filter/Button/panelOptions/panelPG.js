define('Controls-demo/Filter/Button/panelOptions/panelPG',
   [
      'Core/Control',
      'Types/source',
      'wml!Controls-demo/Filter/Button/panelOptions/panelPG',
      'json!Controls-demo/PropertyGrid/pgtext',

      'css!Controls-demo/Filter/Button/PanelVDom',
      'css!Controls-demo/Input/resources/VdomInputs',
      'css!Controls-demo/Wrapper/Wrapper',
      'tmpl!Controls-demo/Filter/Button/resources/withAdditional/mainBlockPanel',
      'tmpl!Controls-demo/Filter/Button/resources/withAdditional/additionalBlockPanel',
      'Controls-demo/Filter/Button/panelOptions/HistorySourceDemo',
      'wml!Controls-demo/Filter/Button/resources/itemTemplate/unread',
      'wml!Controls-demo/Filter/Button/ChooseDate'
   ],

   function(Control, sourceLib, template, config) {
      'use strict';
      var panelPG = Control.extend({
         _template: template,
         _metaData: null,
         _content: 'Controls/filterPopup:Panel',
         _dataObject: null,
         _items: null,
         _itemsSimple: null,
         _componentOptions: null,
         _beforeMount: function() {
            this._items = [
               {
                  id: 'period',
                  value: [1],
                  resetValue: [1],
                  myItemTemplate: 'wml!Controls-demo/Filter/Button/ChooseDate',
                  source: new sourceLib.Memory({
                     keyProperty: 'key',
                     data: [
                        { key: 1, title: 'All time' },
                        { key: 2, title: 'Today' },
                        { key: 3, title: 'Past month' },
                        { key: 4, title: 'Past 6 month' },
                        { key: 5, title: 'Past year' }
                     ]
                  })
               },
               {
                  id: 'state',
                  value: [1],
                  resetValue: [1],
                  source: new sourceLib.Memory({
                     keyProperty: 'key',
                     data: [
                        { key: 1, title: 'All state' },
                        { key: 2, title: 'In progress' },
                        { key: 3, title: 'Done' },
                        { key: 4, title: 'Not done' },
                        { key: 5, title: 'Deleted' }
                     ]
                  })
               },
               {
                  id: 'limit',
                  value: [1],
                  resetValue: [1],
                  textValue: 'Due date',
                  visibility: false,
                  source: new sourceLib.Memory({
                     keyProperty: 'key',
                     data: [
                        { key: 1, title: 'Due date' },
                        { key: 2, title: 'Overdue' }
                     ]
                  })
               },
               {
                  id: 'sender', value: '', resetValue: '', visibility: false, source: this._sourceLookup
               },
               {
                  id: 'author', value: 'Ivanov K.K.', textValue: 'Author: Ivanov K.K.', resetValue: ''
               },
               {
                  id: 'responsible', value: '', resetValue: '', visibility: false
               },
               {
                  id: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false
               },
               {
                  id: 'operation', value: '', resetValue: '', visibility: false
               },
               {
                  id: 'group',
                  value: [1],
                  resetValue: [1],
                  visibility: false,
                  source: new sourceLib.Memory({
                     keyProperty: 'key',
                     data: [
                        { key: 1, title: 'My' },
                        { key: 2, title: 'My department' }
                     ]
                  })
               },
               {
                  id: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: false, myTemplate: 'wml!Controls-demo/Filter/Button/resources/itemTemplate/unread'
               },
               {
                  id: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false
               },
               {
                  id: 'own',
                  value: [2],
                  resetValue: [2],
                  textValue: 'On department',
                  visibility: false,
                  source: new sourceLib.Memory({
                     keyProperty: 'key',
                     data: [
                        { key: 1, title: 'On me' },
                        { key: 2, title: 'On department' }
                     ]
                  })
               },
               {
                  id: 'our organisation', value: '', resetValue: '', visibility: false
               },
               {
                  id: 'document', value: '', resetValue: '', visibility: false
               },
               {
                  id: 'detailingPeriod',
                  value: [1],
                  resetValue: [1],
                  textValue: '',
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
               }
            ];
            this._itemsSimple = [
               {
                  id: 'period',
                  value: [1],
                  resetValue: [1],
                  myItemTemplate: 'wml!Controls-demo/Filter/Button/ChooseDate'
               },
               {
                  id: 'state',
                  value: [1],
                  resetValue: [1],
                  source: new sourceLib.Memory({
                     keyProperty: 'key',
                     data: [
                        { key: 1, title: 'All state' },
                        { key: 2, title: 'In progress' },
                        { key: 3, title: 'Done' },
                        { key: 4, title: 'Not done' },
                        { key: 5, title: 'Deleted' }
                     ]
                  })
               },
               {
                  id: 'author', value: 'Ivanov K.K.', textValue: 'Author: Ivanov K.K.', resetValue: ''
               }
            ];
            this._dataObject = {
               items: {
                  items: [
                     { id: 1, title: 'Filters with additional params', items: this._items },
                     { id: 2, title: 'Filters without additional params', items: this._itemsSimple }
                  ],
                  value: 'Filters with additional params'
               },
               historyId: {
                  items: [
                     { id: 1, title: 'DEMO_HISTORY_ID', value: 'DEMO_HISTORY_ID' },
                     { id: 2, title: 'Not specified', value: '' }
                  ],
                  value: 'Not specified'
               },
               additionalTemplate: {
                  items: [
                     {
                        id: '1',
                        title: 'Not specified',
                        template: undefined
                     },
                     {
                        id: '2',
                        title: 'custom template',
                        template: { templateName: 'tmpl!Controls-demo/Filter/Button/resources/withAdditional/additionalBlockPanel' }
                     }
                  ],
                  value: 'custom template'
               },
               additionalTemplateProperty: {
                  items: [
                     { id: 1, title: 'template Unread from additionalTemplateProperty', value: 'myTemplate' },
                     { id: 2, title: 'Not specified', value: '' }
                  ],
                  value: 'Not specified'
               },
               itemTemplateProperty: {
                  items: [
                     { id: 1, title: 'first filter from itemTemplateProperty', value: 'myItemTemplate' },
                     { id: 2, title: 'Not specified', value: '' }
                  ],
                  value: 'Not specified'
               },
               itemTemplate: {
                  items: [
                     {
                        id: 1,
                        title: 'Not specified',
                        template: undefined
                     },
                     {
                        id: 2,
                        title: 'custom template',
                        template: { templateName: 'tmpl!Controls-demo/Filter/Button/resources/withAdditional/mainBlockPanel' }
                     }
                  ],
                  value: 'custom template'
               }
            };
            this._componentOptions = {
               name: 'FilterPanel',
               items: this._items,
               additionalTemplate: {
                  templateName: 'tmpl!Controls-demo/Filter/Button/resources/withAdditional/additionalBlockPanel'
               },
               additionalTemplateProperty: '',
               itemTemplate: {
                  templateName: 'tmpl!Controls-demo/Filter/Button/resources/withAdditional/mainBlockPanel'
               },
               itemTemplateProperty: '',
               historyId: undefined,
               orientation: 'vertical',
               headerStyle: 'primary',
               headingCaption: 'Отбираются',
               readOnly: false
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      return panelPG;
   });
