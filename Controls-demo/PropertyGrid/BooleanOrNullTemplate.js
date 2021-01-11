define('Controls-demo/PropertyGrid/BooleanOrNullTemplate',
   [
      'UI/Base',
      'wml!Controls-demo/PropertyGrid/BooleanOrNullTemplate',
   ],
   function(Base, template) {
      'use strict';

      var boolNuulTmpl = Base.Control.extend({
         _template: template,
         _valueChangedHandler: function(event, tmp) {
            this._notify('valueChanged', [tmp]);
         }
      });
      boolNuulTmpl._styles = ['Controls-demo/Input/resources/VdomInputs'];

      return boolNuulTmpl;
   });
