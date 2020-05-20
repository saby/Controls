define('Controls-demo/PropertyGrid/StringOrFunctionTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/PropertyGrid/StringOrFunctionTemplate',
      'View/Builder/Tmpl',
      'View/config',
      'View/Executor/TClosure',
      'i18n!userTemplate',
   ],
   function(Control, template, tmpl, config, tClosure) {
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
            // FIXME: Выполнять компиляцию шаблона руками - запрещено.
            //  Сейчас для шаблонов выполняется предзагрузка модуля локализации,
            //  чего не предусмотрено было здесь. Необходимо избавиться от такого вида
            //  использований функций шаблонизатор.
            this._notify('valueChanged', [tmpl.getFunction(this._value, config, tClosure)]);
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
