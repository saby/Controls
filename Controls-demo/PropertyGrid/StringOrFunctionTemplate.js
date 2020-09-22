define('Controls-demo/PropertyGrid/StringOrFunctionTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/PropertyGrid/StringOrFunctionTemplate'
   ],
   function(Control, template) {
      'use strict';

      var stringTmpl = Control.extend({
         _template: template,
         _value: '',
         checkBoxFlag: undefined,
         _beforeMount: function(opts) {
            this.checkBoxFlag = opts.flag;
            this._value = opts.value;
         },
         _valueChangedHandler: function(event, tmp) {
            this._value = tmp;
            this._valueChangedNotify();
         },
         _valueChangedNotify: function() {
            this._notify('valueChanged', [this._value]);
         },
         _checkBoxValueChanged: function() {
            this._valueChangedNotify();
         },
         _choseHandler: function(e, selectedItem) {
            this._notify('valueChanged', [selectedItem.get('template')]);
         }
      });


      stringTmpl._styles = ['Controls-demo/Input/resources/VdomInputs'];

      return stringTmpl;
   });
