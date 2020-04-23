define('Controls-demo/PropertyGrid/DateTimeTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/PropertyGrid/DateTimeTemplate',
   ],
   function(Control, template) {
      'use strict';

      var numberTmpl = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Input/resources/VdomInputs'],
         _valueChangedHandler: function(event, tmp) {
            this._notify('valueChanged', [tmp]);
         }
      });


      return numberTmpl;
   });
