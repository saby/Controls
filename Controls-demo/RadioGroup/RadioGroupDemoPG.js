define('Controls-demo/RadioGroup/RadioGroupDemoPG',
   [
      'Core/Control',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/PropertyGrid/pgtext',
      'Types/source',
      'wml!Controls-demo/RadioGroup/resources/itemTemplateWithContent',
      'wml!Controls-demo/RadioGroup/resources/SingleItemTemplate',

   ],

   function(Control, template, config, sourceLib) {
      'use strict';
      var SwitchDemoPG = Control.extend({
         _template: template,
         _metaData: null,
         _content: 'Controls/toggle:RadioGroup',
         _dataObject: null,
         _componentOptions: null,
         _beforeMount: function() {
            this._source2 = new sourceLib.Memory({
               title: 'source1',
               keyProperty: 'id',
               data: [
                  {
                     id: 1,
                     title: 'Header1',
                     caption: 'Caption1'
                  },
                  {
                     id: 2,
                     title: 'Header2',
                     caption: 'Caption2'
                  },
                  {
                     id: 3,
                     title: 'Header3',
                     caption: 'Caption3'
                  },
                  {
                     id: 4,
                     title: 'Header4',
                     caption: 'Caption4'
                  }
               ]
            });
            this._source = new sourceLib.Memory({
               title: 'source2',
               keyProperty: 'id',
               displayProperty: 'caption',
               data: [
                  {
                     id: 1,
                     title: 'Title1',
                     caption: 'Additional caption1'
                  },
                  {
                     id: 2,
                     title: 'Title2',
                     caption: 'Additional caption2'
                  },
                  {
                     id: 3,
                     title: 'Title3',
                     templateTwo: 'wml!Controls-demo/RadioGroup/resources/SingleItemTemplate',
                     caption: 'Additional caption3'
                  },
                  {
                     id: 4,
                     title: 'Title4',
                     caption: 'Additional caption4'
                  }
               ]
            });
            this._dataObject = {
               source: {
                  type: 'enum',
                  emptyText: false,
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 0,
                  displayType: 'source',
                  enum: {
                     source1: this._source,
                     source2: this._source2
                  }
               },
               direction: {
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 0
               },
               selectedKey: {
                  precision: 0,
                  onlyPositive: true
               },
               keyProperty: {
                  readOnly: true
               },
               itemTemplate: {
                  readOnly: false,
                  value: 'Default template',
                  items: [
                     {
                        id: '1',
                        title: 'Custom template',
                        template: 'wml!Controls-demo/RadioGroup/resources/itemTemplateWithContent'
                     },
                     {
                        id: '2',
                        title: 'Default template',
                        template: 'wml!Controls/_toggle/RadioGroup/resources/ItemTemplate'
                     }
                  ]
               },
               itemTemplateProperty: {
                  readOnly: false,
                  value: 'templateTwo'
               }
            };
            this._componentOptions = {
               selectedKey: 1,
               readOnly: false,
               direction: 'horizontal',
               source: this._source,
               keyProperty: 'id',
               placeholder: 'select',
               displayProperty: 'title',
               name: 'RadioGroup',
               itemTemplate: null,
               itemTemplateProperty: 'templateTwo'
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      SwitchDemoPG._styles = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];

      return SwitchDemoPG;
   });
