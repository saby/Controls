define('Controls-demo/List/Grid/ItemTemplatePG',
   [
      'UI/Base',
      'Types/source',
      'Controls-demo/List/Grid/resources/DataDemoPG',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/List/Grid/resources/ItemTemplatePG/cfg',
      'wml!Controls-demo/List/Grid/resources/ItemTemplatePG/noHighlightOnHover',
      'wml!Controls-demo/List/Grid/resources/DemoMoney',
      'wml!Controls-demo/List/Grid/resources/DemoRating',
      'wml!Controls-demo/List/Grid/resources/DemoItem'
   ],

   function(Base, source, data, template, config) {
      'use strict';
      var Component = Base.Control.extend({
         _template: template,
         _metaData: null,
         _content: 'Controls/grid:View',
         _dataObject: null,
         _componentOptions: null,


         _beforeMount: function() {

            this._dataObject = {
               itemTemplate: {
                  readOnly: false,
                  value: 'default',
                  items: [
                     {
                        id: '1',
                        title: 'default',
                        value: 'Controls/grid:ItemTemplate'
                     },
                     {
                        id: '2',
                        title: 'without highlighting hovered item',
                        value: 'wml!Controls-demo/List/Grid/resources/ItemTemplatePG/noHighlightOnHover'
                     }
                  ]
               },
               itemTemplateProperty: {
                  value: 'none',
                  items: [
                     {
                        id: 1,
                        title: 'none',
                        value: ''
                     },
                     {
                        id: 2,
                        title: 'without highlighting hovered item',
                        value: 'noHighlightOnHover'
                     }
                  ]
               }
            };


            this._componentOptions = {
               name: 'ItemTemplateGridPG',
               keyProperty: 'id',
               source: new source.Memory({
                  keyProperty: 'id',
                  data: data.catalog
               }),
               columns: data.fullColumns,
               header: data.fullHeader,
               markedKey: 4,
               displayProperty: 'title',
               itemTemplate: 'Controls/grid:ItemTemplate',
               itemTemplateProperty: ''
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         },

      });
      return Component;
   });
