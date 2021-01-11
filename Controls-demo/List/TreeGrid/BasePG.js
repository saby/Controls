define('Controls-demo/List/TreeGrid/BasePG',
   [
      'UI/Base',
      'Types/source',
      'Controls-demo/List/TreeGrid/resources/DataDemoPG',

      'tmpl!Controls-demo/List/TreeGrid/resources/BasePG/DemoPG',
      'json!Controls-demo/List/TreeGrid/resources/BasePG/cfg'

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

            };
            this._componentOptions = {
               name: 'BasePG',
               source: new TSource.Memory({
                  keyProperty: 'id',
                  data: data.catalog
               }),
               markedKey: '2',
               keyProperty: 'id',
               columns: data.catalogColumns,
               displayProperty: 'title',
               parentProperty: 'parent',
               nodeProperty: 'type',
               expandedItems: [],
               collapsedItems: [],
               singleExpand: false,
               header: data.headerColumns
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });

      return Component;
   });

