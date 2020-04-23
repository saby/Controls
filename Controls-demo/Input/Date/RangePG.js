define('Controls-demo/Input/Date/RangePG',
   [
      'Core/Control',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/PropertyGrid/pgtext',

   ],

   function(Control, template, config) {
      'use strict';
      var Component = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'],
         _metaData: null,
         _content: 'Controls/dateRange:Input',
         _dataObject: null,
         _componentOptions: null,
         _beforeMount: function() {
            this._dataObject = {
               startValue: {
                  readOnly: true
               },
               endValue: {
                  readOnly: true
               },
               mask: {
                  emptyText: 'none',
                  placeholder: 'select',
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 0
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
               startTagStyle: {
                  emptyText: 'none',
                  placeholder: 'select',
                  keyProperty: 'id',
                  displayProperty: 'title'
               },
               endTagStyle: {
                  emptyText: 'none',
                  placeholder: 'select',
                  keyProperty: 'id',
                  displayProperty: 'title'
               },
               inlineHeight: {
                  emptyText: 'none',
                  placeholder: 'select',
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 0
               }
            };
            this._componentOptions = {
               name: 'DateRange',
               readOnly: false,
               mask: 'DD.MM.YY',
               startTagStyle: undefined,
               endTagStyle: undefined
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      return Component;
   });
