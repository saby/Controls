define('Controls-demo/PropertyGrid/BooleanTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/PropertyGrid/BooleanTemplate',
   ],
   function(Control, template) {
      'use strict';

      var boolTmpl = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Input/resources/VdomInputs'],
         _valueChangedHandler: function(event, tmp) {
            this._notify('valueChanged', [tmp]);
         },
      });
      return boolTmpl;
   });
