define('Controls-demo/Input/Base/Base',
   [
      'Core/Control',
      'json!Controls-demo/Input/Base/Base',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',

   ],

   function(Control, config, template) {
      'use strict';

      var _private = {
         CONTENT: 'Controls/input:Base'
      };

      var Base = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Input/Base/Base'],

         _metaData: null,

         _dataObject: null,

         _componentOptions: null,

         _content: _private.CONTENT,

         _beforeMount: function() {
            this._dataObject = {
               size: {
                  emptyText: 'none',
                  placeholder: 'select',
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 3
               },
               style: {
                  emptyText: 'none',
                  placeholder: 'select',
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 0
               },
               fontStyle: {
                  emptyText: 'none',
                  placeholder: 'select',
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 0
               },
               tagStyle: {
                  emptyText: 'none',
                  placeholder: 'select',
                  keyProperty: 'id',
                  displayProperty: 'title'
               },
               textAlign: {
                  emptyText: 'none',
                  placeholder: 'select',
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 0
               },
               autoComplete: {
                  emptyText: 'none',
                  placeholder: 'select',
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 1
               }
            };
            this._componentOptions = {
               value: '',
               name: 'InputBase',
               style: 'info',
               size: 'default',
               textAlign: 'left',
               autoComplete: 'off',
               fontStyle: 'default',
               placeholder: 'Text...',
               readOnly: false,
               selectOnClick: true
            };
            this._metaData = config[_private.CONTENT].properties['ws-config'].options;
         }
      });

      return Base;
   });
