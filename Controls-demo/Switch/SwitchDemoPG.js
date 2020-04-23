define('Controls-demo/Switch/SwitchDemoPG',
   [
      'Core/Control',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/PropertyGrid/pgtext',

   ],

   function(Control, template, config) {
      'use strict';
      var SwitchDemoPG = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'],
         _metaData: null,
         _content: 'Controls/toggle:Switch',
         _dataObject: null,
         _componentOptions: null,
         _beforeMount: function() {
            this._dataObject = {
               value: {
                  readOnly: false
               },
               captionPosition: {
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 0
               }
            };
            this._componentOptions = {
               name: 'Switch',
               readOnly: false,
               tooltip: 'myTooltip',
               caption: 'State1',
               captionPosition: 'left'

            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      return SwitchDemoPG;
   });
