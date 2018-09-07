define('Controls-demo/Input/Number/NumberPG',
   [
      'Core/Control',
      'tmpl!Controls-demo/Input/Text/TextPG',
      'tmpl!Controls-demo/PropertyGrid/PropertyGridTemplate',
      'json!Controls-demo/PropertyGrid/pgtext',

      'css!Controls-demo/Filter/Button/PanelVDom',
      'css!Controls-demo/Input/resources/VdomInputs',
      'css!Controls-demo/Wrapper/Wrapper'
   ],

   function(Control, template, myTmpl, config) {
      'use strict';
      var NumberPG = Control.extend({
         _template: template,
         _metaData: null,
         _content: 'Controls/Input/Number',
         _my: myTmpl,
         _dataObject: null,
         _textOptions: null,
         _beforeMount: function() {
            this._dataObject = {
               value: {
                  readOnly: true
               },
               tagStyle: {
                  emptyText: 'none',
                  keyProperty: 'id',
                  displayProperty: 'title',
                  placeholder: 'select',
                  selectedKey: 0
               },
               textAlign: {
                  keyProperty: 'id',
                  displayProperty: 'title',
                  placeholder: 'select',
                  selectedKey: 0
               }
            };
            this._textOptions = {
               name: 'Number',
               placeholder: 'Input text',
               tagStyle: 'primary',
               presition: 2,
               onlyPositive: true,
               integersLength: 5,
               showEmptyDecimals: true,
               textAlign: 'left',
               readOnly: false,
               tooltip: 'myTooltip',
               validationErrors: ''
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      return NumberPG;
   });
