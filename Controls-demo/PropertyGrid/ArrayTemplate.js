define('Controls-demo/PropertyGrid/ArrayTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/PropertyGrid/ArrayTemplate',
   ],
   function(Control, template) {
      'use strict';

      var arrayTmpl = Control.extend({
         _template: template,
         _param: null,

         _valueChangedHandler: function(event, tmp) {
            // this._notify('valueChanged', [tmp]);
            this._param = tmp.split('\n'); // массив исключений
            this._notify('valueChanged', [tmp]);
         },

         _valueChangedHandlerObj: function(event, tmp) {
            this._notify('valueChanged', [tmp]);
         },

         _chooseSuggestHandler: function(event, item) {
            this._notify('valueChanged', [item.get('items')]);
         }
      });

      arrayTmpl._styles = ['Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Input/Suggest/Suggest'];

      return arrayTmpl;
   });
