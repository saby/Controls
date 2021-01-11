define('Controls-demo/PropertyGrid/DateTimeTemplate',
   [
      'UI/Base',
      'wml!Controls-demo/PropertyGrid/DateTimeTemplate',
   ],
   function(Base, template) {
      'use strict';

      var numberTmpl = Base.Control.extend({
         _template: template,
         _valueChangedHandler: function(event, tmp) {
            this._notify('valueChanged', [tmp]);
         }
      });


      numberTmpl._styles = ['Controls-demo/Input/resources/VdomInputs'];

      return numberTmpl;
   });
