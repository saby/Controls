define('Controls-demo/PropertyGrid/ObjectTemplate',
   [
      'UI/Base',
      'Core/core-clone',
      'wml!Controls-demo/PropertyGrid/ObjectTemplate',
   ],
   function(Base, cClone, template) {
      'use strict';

      var arrayTmpl = Base.Control.extend({
         _template: template,
         _param: null,
         _config: {},
         _beforeMount: function(opt){
           this._config = cClone(opt.baseObject);
         },
         _valueChangedHandler: function(event, key, value) {
            this._config[key] = value;
            this._notify('objChanged', [cClone(this._config)]);
         },

      });

      arrayTmpl._styles = ['Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Input/Suggest/Suggest'];

      return arrayTmpl;
   });
