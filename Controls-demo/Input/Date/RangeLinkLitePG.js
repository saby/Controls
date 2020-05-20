define('Controls-demo/Input/Date/RangeLinkLitePG',
   [
      'Core/Control',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/PropertyGrid/pgtext',

   ],

   function(Control, template, config) {
      'use strict';
      var Component = Control.extend({
         _template: template,
         _metaData: null,
         _content: 'Controls/dateRange:RangeShortSelector',
         _dataObject: null,
         _componentOptions: null,
         _beforeMount: function() {
            this._dataObject = {
               startValue: {
                  readOnly: true
               },
               endValue: {
                  readOnly: true
               }
            };
            this._componentOptions = {
               name: 'DateRangeLinkLite',
               readOnly: false,
               tooltip: 'myTooltip',
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      Component._styles = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];

      return Component;
   });
