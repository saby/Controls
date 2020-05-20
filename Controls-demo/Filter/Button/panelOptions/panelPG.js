define('Controls-demo/Filter/Button/panelOptions/panelPG',
   [
      'Core/Control',
      'Types/source',
      'wml!Controls-demo/Filter/Button/panelOptions/panelPG',
      'json!Controls-demo/PropertyGrid/pgtext',

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
                  name: 'period',
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
                  name: 'state',
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
                  name: 'limit',
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
                  name: 'sender', value: '', resetValue: '', visibility: false, source: this._sourceLookup
               },
               {
                  name: 'author', value: 'Ivanov K.K.', textValue: 'Author: Ivanov K.K.', resetValue: ''
               },
               {
                  name: 'responsible', value: '', resetValue: '', visibility: false
               },
               {
                  name: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false
               },
               {
                  name: 'operation', value: '', resetValue: '', visibility: false
               },
               {
                  name: 'group',
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
                  name: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: false, myTemplate: 'wml!Controls-demo/Filter/Button/resources/itemTemplate/unread'
               },
               {
                  name: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false
               },
               {
                  name: 'own',
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
                  name: 'our organisation', value: '', resetValue: '', visibility: false
               },
               {
                  name: 'document', value: '', resetValue: '', visibility: false
               },
               {
                  name: 'detailingPeriod',
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
                  name: 'period',
                  value: [1],
                  resetValue: [1],
                  myItemTemplate: 'wml!Controls-demo/Filter/Button/ChooseDate'
               },
               {
                  name: 'state',
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
                  name: 'author', value: 'Ivanov K.K.', textValue: 'Author: Ivanov K.K.', resetValue: ''
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
      panelPG._styles = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];

      return panelPG;
   });
