define('Controls-demo/PropertyGrid/BooleanOrNullTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/PropertyGrid/BooleanOrNullTemplate',
   ],
   function(Control, template) {
      'use strict';

      var boolNuulTmpl = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Input/resources/VdomInputs'],
         _valueChangedHandler: function(event, tmp) {
            this._notify('valueChanged', [tmp]);
         }
      });
      return boolNuulTmpl;
   });
