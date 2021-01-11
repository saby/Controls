define('Controls-demo/PropertyGrid/TimeIntervalTemplate',
   [
      'UI/Base',
      'wml!Controls-demo/PropertyGrid/TimeIntervalTemplate',
   ],
   function(Base, template) {
      'use strict';

      var timeIntervalTmpl = Base.Control.extend({
         _template: template,
         _valueChangedHandler: function(event, tmp) {
            this._notify('valueChanged', [tmp]);
         }
      });


      timeIntervalTmpl._styles = ['Controls-demo/Input/resources/VdomInputs'];

      return timeIntervalTmpl;
   });
