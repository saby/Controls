define('Controls-demo/Filter/Button/PanelVDom',
   [
      'Core/Control',
      'Types/source',
      'Types/chain',
      'wml!Controls-demo/Filter/Button/PanelVDom',
      'Controls-demo/Filter/Button/panelOptions/HistorySourceDemo',

      'wml!Controls-demo/Filter/Button/resources/withoutAdditional/filterPanelTemplateSimple',
      'tmpl!Controls-demo/Filter/Button/resources/withoutAdditional/mainBlockPanelSimple',

      'wml!Controls-demo/Filter/Button/resources/itemTemplate/filterPanelTemplateItemProperty',
      'wml!Controls-demo/Filter/Button/resources/itemTemplate/period',
      'wml!Controls-demo/Filter/Button/resources/itemTemplate/author',

      'wml!Controls-demo/Filter/Button/resources/withAdditional/filterPanelTemplateAdditional',
      'tmpl!Controls-demo/Filter/Button/resources/withAdditional/mainBlockPanel',
      'tmpl!Controls-demo/Filter/Button/resources/withAdditional/additionalBlockPanel',

      'css!Controls-demo/Filter/Button/PanelVDom'
   ],

   function(Control, sourceLib, chain, template) {

      /**
       * @class Controls/deprecatedSearch:Container
       * @extends Controls/Control
       * @control
       * @public
       */

      'use strict';
      var PanelVDom = Control.extend({
         _template: template,
         _itemsSimple: null,
         _itemsTemplate: null,
         _items: null,
         _itemsHistory: null,
         _sourcePeriod: null,
         _stateSource: null,
         _beforeMount: function() {
            this._periodSource = new sourceLib.Memory({
               data: [
                  {key: 1, title: 'All time'},
                  {key: 2, title: 'Today'},
                  {key: 3, title: 'Past month'},
                  {key: 4, title: 'Past 6 months'},
                  {key: 5, title: 'Past year'}
               ],
               keyProperty: 'key'
            });
            this._stateSource = new sourceLib.Memory({
               data: [
                  {key: 1, title: 'All states'},
                  {key: 2, title: 'In progress'},
                  {key: 3, title: 'Done'},
                  {key: 4, title: 'Not done'},
                  {key: 5, title: 'Deleted'}
               ],
               keyProperty: 'key'
            });
            this._limitSource = new sourceLib.Memory({
               keyProperty: 'key',
               data: [
                  {key: 1, title: 'Due date'},
                  {key: 2, title: 'Overdue'}
               ]
            });
            this._itemsSimple = [
               {name: 'period', value: [2], resetValue: [1], textValue: 'Today', source: this._periodSource},
               {name: 'state', value: [1], resetValue: [1], source: this._stateSource},
               {name: 'sender', value: '', resetValue: ''},
               {name: 'author', value: 'Ivanov K.K.', textValue: 'Author: Ivanov K.K.', resetValue: ''},
               {name: 'responsible', value: '', resetValue: ''}
            ];
            this._itemsTemplate = [
               {name: 'author', value: 'Author: Ivanov A.A.', resetValue: '', textValue: 'Author: Ivanov A.A.',
                  templateItem: 'wml!Controls-demo/Filter/Button/resources/itemTemplate/author'},
               { name: 'period', value: [1], textValue: 'Period', resetValue: [1],
                  source: this._periodSource,
                  templateItem: 'wml!Controls-demo/Filter/Button/resources/itemTemplate/period'}
            ];
            this._items = [
               {name: 'period', value: [1], resetValue: [1], source: this._periodSource},
               {name: 'state', value: [1], resetValue: [1], source: this._stateSource},
               {name: 'limit', value: [1], resetValue: [1], textValue: 'Due date', visibility: false, source: this._limitSource},
               {name: 'sender', value: '', resetValue: '', visibility: false},
               {name: 'author', value: 'Ivanov K.K.', textValue: 'Author: Ivanov K.K.', resetValue: ''},
               {name: 'responsible', value: '', resetValue: '', visibility: false},
               {name: 'tagging', value: false, resetValue: false, textValue: 'Marks', visibility: false},
               {name: 'income', value: [1], resetValue: [1], textValue: '', visibility: false, source: new sourceLib.Memory({
                     keyProperty: 'key',
                     data: [
                        { key: 1, title: 'In the warehouse' },
                        { key: 2, title: 'In expenses' }
                     ]
                  })},
               {name: 'group', value: [1], resetValue: '', visibility: false, source: new sourceLib.Memory({
                  keyProperty: 'key',
                  data: [
                     { key: 1, title: 'My' },
                     { key: 2, title: 'My department' }
                  ]
               })},
               {name: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false},
               {name: 'own', value: 2, resetValue: '', textValue: 'On department', visibility: false, source: new sourceLib.Memory({
                  keyProperty: 'key',
                  data: [
                     { key: 1, title: 'On me' },
                     { key: 2, title: 'On department' }
                  ]
               })},
               {name: 'our organisation', value: '', resetValue: '', visibility: false},
               {name: 'document', value: '', resetValue: '', visibility: false},
               {name: 'operation', value: '', resetValue: '', visibility: false}
            ];
            this._itemsHistory = this._items;
         },
         _filterChangedHandler: function(event, filter) {
            chain.factory(this._items).each(function(item) {
               item.textValue = filter[item.name];
            });
         }

      });
      return PanelVDom;
   });
