define('Controls-demo/PropertyGrid/TimeIntervalTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/PropertyGrid/TimeIntervalTemplate',
   ],
   function(Control, template) {
      'use strict';

      var timeIntervalTmpl = Control.extend({
         _template: template,
         _valueChangedHandler: function(event, tmp) {
            this._notify('valueChanged', [tmp]);
         }
      });


      timeIntervalTmpl._styles = ['Controls-demo/Input/resources/VdomInputs'];

      return timeIntervalTmpl;
   });
