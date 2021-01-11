define('Controls-demo/List/TreeGrid/ExtendedPG',
   [
      'UI/Base',
      'Types/source',
      'Controls-demo/List/TreeGrid/resources/DataDemoPG',

      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/List/TreeGrid/resources/ExtendedPG/cfg',
      'wml!Controls-demo/List/TreeGrid/resources/ExtendedPG/footerTemplate'

   ],
   function(Base, TSource, data, template, config) {
      'use strict';
      var Component = Base.Control.extend({
         _template: template,
         _metaData: null,
         _content: 'Controls/_treeGrid/View',
         _dataObject: null,
         _componentOptions: null,

         _beforeMount: function() {

            this._dataObject = {
               nodeFooterTemplate: {
                  readOnly: false,
                  value: 'none',
                  items: [
                     {
                        id: '1',
                        title: 'none',
                        value: null
                     },
                     {
                        id: '2',
                        title: 'with add button',
                        value: 'wml!Controls-demo/List/TreeGrid/resources/ExtendedPG/footerTemplate'
                     }
                  ]
               }
            };
            this._componentOptions = {
               name: 'BasePG',
               source: new TSource.Memory({
                  keyProperty: 'id',
                  data: data.smallCatalog
               }),
               markedKey: '2',
               keyProperty: 'id',
               columns: data.catalogColumns,
               displayProperty: 'title',
               parentProperty: 'parent',
               nodeProperty: 'type',
               expandedItems: ['1'],
               nodeFooterTemplate: undefined,
               expanderVisibility: 'visible',
               hasChildrenProperty: 'hasChildren'
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });

      return Component;
   });

