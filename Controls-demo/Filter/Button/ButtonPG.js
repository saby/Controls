define('Controls-demo/Filter/Button/ButtonPG',
   [
      'Core/Control',
      'wml!Controls-demo/Filter/Button/ButtonPG',
      'Types/source',
      'json!Controls-demo/PropertyGrid/pgtext',

      'Controls/dropdown',
      'wml!Controls-demo/Filter/Button/buttonPGTemplate',
      'wml!Controls-demo/Filter/Button/mainBlockPG',
      'wml!Controls-demo/Filter/Button/ChooseDate',
      'wml!Controls-demo/Filter/Button/TextLine',
      'Controls-demo/Filter/Button/panelOptions/HistorySourceDemo'
   ],

   function(Control, template, sourceLib, config) {
      'use strict';

      var FilterButtonPG = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'],
         _metaData: null,
         _content: 'Controls/filter:Selector',
         _dataObject: null,
         _componentOptions: null,
         _items: null,
         _itemsKaizen: null,
         _eventType: 'itemsChanged',
         _nameOption: 'items',
         _currentItems: 'Filters in contacts',

         _beforeMount: function() {
            this._items = [
               {
                  name: 'kind',
                  value: ['0'],
                  resetValue: ['0'],
                  textValue: 'All',
                  source: new sourceLib.Memory({
                     keyProperty: 'key',
                     data: [
                        { key: '0', title: 'All topics' },
                        { key: '1', title: 'Unread' },
                        { key: '2', title: 'My topics' },
                        { key: '3', title: 'Favourites' },
                        { key: '4', title: 'Without comments' }
                     ]
                  })
               },
               {
                  name: 'type',
                  value: ['0'],
                  resetValue: ['0'],
                  textValue: '',
                  source: new sourceLib.Memory({
                     keyProperty: 'key',
                     data: [
                        { key: '0', title: 'All types' },
                        { key: '1', title: 'Discussions' },
                        { key: '2', title: 'Suggestions' }
                     ]
                  })
               }
            ];
            this._itemsKaizen = [
               {
                  name: 'own',
                  value: ['0'],
                  resetValue: ['0'],
                  textValue: 'All',
                  source: new sourceLib.Memory({
                     keyProperty: 'key',
                     data: [
                        { key: '0', title: 'All' },
                        { key: '1', title: 'My' }
                     ]
                  })
               },
               {
                  name: 'used',
                  value: ['0'],
                  resetValue: ['0'],
                  textValue: '',
                  source: new sourceLib.Memory({
                     keyProperty: 'key',
                     data: [
                        { key: '0', title: 'All states' },
                        { key: '1', title: 'In archive' },
                        { key: '2', title: 'Used' }
                     ]
                  })
               },
               {
                  name: 'deleted', value: false, resetValue: false, textValue: 'Show deleted'
               }
            ];
            this._dataObject = {
               alignment: {
                  selectedKey: 1,
                  displayProperty: 'title',
                  keyProperty: 'id'
               },
               items: {
                  items: [
                     { id: '1', title: 'Filters in discussions', items: this._items },
                     { id: '2', title: 'Filters in kaizen', items: this._itemsKaizen }
                  ],
                  value: 'Filters in discussions'
               },
               templateName: {
                  readOnly: true
               },
               lineSpaceTemplate: {
                  items: [
                     { id: '1', title: 'Selection a period', template: 'wml!Controls-demo/Filter/Button/ChooseDate' },
                     { id: '2', title: 'Text', template: 'wml!Controls-demo/Filter/Button/TextLine' }
                  ],
                  value: 'Selection a period'
               },
               historyId: {
                  items: [
                     { id: '1', title: 'DEMO_HISTORY_ID', value: 'DEMO_HISTORY_ID' },
                     { id: '2', title: 'Not specified', value: '' }
                  ],
                  value: 'Not specified'
               }
            };
            this._componentOptions = {
               name: 'filterButton',
               readOnly: false,
               alignment: 'left',
               lineSpaceTemplate: 'wml!Controls-demo/Filter/Button/ChooseDate',
               templateName: 'wml!Controls-demo/Filter/Button/buttonPGTemplate',
               items: this._items
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      return FilterButtonPG;
   });
