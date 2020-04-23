define('Controls-demo/Input/ComboBox/ComboBoxPG',
   [
      'Core/Control',
      'wml!Controls-demo/Input/ComboBox/ComboBoxPG',
      'json!Controls-demo/PropertyGrid/pgtext',

      'Types/source',
      'Controls-demo/Combobox/historySourceCombobox',
      'wml!Controls-demo/Input/ComboBox/itemTemplateCustom',
      'wml!Controls-demo/Input/ComboBox/itemMyTemplateCustom',
   ],

   function(Control, template, config, sourceLib, historySourceCombobox) {
      'use strict';
      var ComboBoxPG = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper', 'Controls-demo/Input/ComboBox/ComboBoxPG'],
         _metaData: null,
         _content: 'Controls/dropdown:Combobox',
         _dataObject: null,
         _componentOptions: null,
         _sourceRegions: null,

         _beforeMount: function() {
            this._sourceRegions = new sourceLib.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: '1',
                     title: 'Yaroslavl',
                     text: 'YAROSLAVL',
                     comment: '76',
                     myTemplate: 'wml!Controls-demo/Input/ComboBox/itemMyTemplateCustom'
                  },
                  {
                     id: '2',
                     title: 'Moscow',
                     text: 'MOSCOW',
                     comment: '77'
                  },
                  {
                     id: '3',
                     title: 'St-Petersburg',
                     text: 'ST-PETERSBURG',
                     comment: '78',
                     myTemplate: 'wml!Controls-demo/Input/ComboBox/itemMyTemplateCustom'
                  }
               ]
            });
            this._sourceDisease = new sourceLib.Memory({
               keyProperty: 'id',
               data: [
                  { id: '1', text: '01-disease,', title: '01-disease', myTemplate: 'wml!Controls-demo/Input/ComboBox/itemMyTemplateCustom', comment: 'The first 3 days are paid by the employer, the remaining days are paid for by the FSS' },
                  { id: '2', text: '02-injury,', title: '02-injury', comment: 'The first 3 days are paid by the employer, the remaining days are paid for by the FSS' },
                  { id: '3', text: '03-quarantine,', title: '03-quarantine', comment: 'Fully paid by the FSS', myTemplate: 'wml!Controls-demo/Input/ComboBox/itemMyTemplateCustom' }
               ]
            });
            this._historySource = historySourceCombobox.createMemory();
            this._dataObject = {
               source: {
                  items: [
                     { id: '1', title: 'Regions', items: this._sourceRegions },
                     { id: '2', title: 'Diseases', items: this._sourceDisease }
                  ],
                  value: 'Regions'
               },
               itemTemplate: {
                  items: [
                     { id: '1', title: 'Default template', template: '' },
                     { id: '2', title: 'Custom template', template: 'wml!Controls-demo/Input/ComboBox/itemTemplateCustom' }
                  ],
                  value: 'Default template'
               },
               itemTemplateProperty: {
                  items: [
                     { id: '1', title: 'myTemplate', value: 'myTemplate' },
                     { id: '2', title: 'Not specified', value: '' }
                  ],
                  value: 'Not specified'
               },
               filter: {
                  items: [
                     { id: '1', title: 'Loads items with id is 1, 2', items: { id: ['1', '2'] } },
                     { id: '2', title: 'Not specified', items: {} }
                  ],
                  value: 'Not specified'
               },
               displayProperty: {
                  items: [
                     { id: '1', title: 'title', value: 'title' },
                     { id: '2', title: 'text', value: 'text' }
                  ],
                  value: 'title'
               }
            };
            this._componentOptions = {
               name: 'ComboBox',
               placeholder: 'Input text',
               source: this._sourceRegions,
               selectedKey: '1',
               historyId: '',
               itemTemplate: undefined,
               itemTemplateProperty: '',
               emptyText: '',
               filter: undefined,
               displayProperty: 'title',
               keyProperty: 'id',
               readOnly: false
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      return ComboBoxPG;
   });
