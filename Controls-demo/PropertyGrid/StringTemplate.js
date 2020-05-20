define('Controls-demo/PropertyGrid/StringTemplate',
   [
      'Types/entity',
      'Core/Control',
      'wml!Controls-demo/PropertyGrid/StringTemplate',
   ],
   function(entity, Control, template) {
      'use strict';

      var _private = {
         notifyValueChanged: function(self, value) {
            self._notify('valueChanged', [value]);
         },

         /**
          * @param self
          * @param {String} value
          * @param {String} control
          * @variant text
          * @variant suggest
          */
         updateValue: function(self, value, control) {
            switch (control) {
               case 'text':
                  _private.notifyValueChanged(self, value);
                  break;
               case 'suggest':
                  if (self._options.items) {
                     var item = self._options.items.find(function(item) {
                        return item.title === value;
                     });
                     _private.notifyValueChanged(self, item ? item.value : value);
                  } else {
                     _private.notifyValueChanged(self, value);
                  }
                  break;
               default:
                  break;
            }
         }
      };

      /**
       * @name Controls-demo/PropertyGrid/StringTemplate#updateInitiator
       * @cfg {String}
       * @variant valueChanged
       * @variant inputCompleted
       * @default valueChanged
       */

      var stringTmpl = Control.extend({
         _template: template,

         _valueChangedHandler: function(event, control, value) {
            if (this._options.updateInitiator === 'valueChanged') {
               _private.updateValue(this, value, control);
            }
         },

         _inputCompletedHandler: function(event, control, value) {
            if (this._options.updateInitiator === 'inputCompleted') {
               _private.updateValue(this, value, control);
            }
         },

         _chooseChangedHandler: function(event, item) {
            _private.notifyValueChanged(this, item.get('value'));
         }
      });

      stringTmpl.getDefaultOptions = function() {
         return {
            updateInitiator: 'valueChanged'
         };
      };

      stringTmpl.getOptionTypes = function() {
         return {
            updateInitiator: entity.descriptor(String).oneOf([
               'valueChanged',
               'inputCompleted'
            ])
         };
      };

      stringTmpl._styles = ['Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Input/Suggest/Suggest'];

      return stringTmpl;
   });
