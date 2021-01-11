define('Controls-demo/PropertyGrid/BooleanTemplate',
   [
      'UI/Base',
      'wml!Controls-demo/PropertyGrid/BooleanTemplate',
   ],
   function(Base, template) {
      'use strict';

      var boolTmpl = Base.Control.extend({
         _template: template,
         _valueChangedHandler: function(event, tmp) {
            this._notify('valueChanged', [tmp]);
         },
      });
      boolTmpl._styles = ['Controls-demo/Input/resources/VdomInputs'];

      return boolTmpl;
   });
