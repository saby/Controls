define('Controls-demo/List/List/MultiselectPG',
   [
      'UI/Base',
      'Types/source',
      'Controls-demo/List/List/resources/DataDemoPG',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/List/List/resources/MultiselectPG/cfg'
   ],
   function(Base, sourceLib, data, template, config) {
      'use strict';
      var Component = Base.Control.extend({
         _template: template,
         _metaData: null,
         _content: 'Controls/list:View',
         _dataObject: null,
         _componentOptions: null,

         _beforeMount: function() {
            this._dataObject = {};
            this._componentOptions = {
               keyProperty: 'id',
               name: 'MultiSelectPG',
               source: new sourceLib.Memory({
                  keyProperty: 'id',
                  data: data.gadgets
               }),
               selectedKeys: [],
               excludedKeys: [],
               multiSelectVisibility: 'visible'
            };

            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      return Component;
   });
