define('Controls-demo/PropertyGrid/NumberTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/PropertyGrid/NumberTemplate',
   ],
   function(Control, template) {
      'use strict';

      var numberTmpl = Control.extend({
         _template: template,
         _valueChangedHandler: function(event, tmp) {
            this._notify('valueChanged', [tmp]);
         }
      });


      numberTmpl._styles = ['Controls-demo/Input/resources/VdomInputs'];

      return numberTmpl;
   });
