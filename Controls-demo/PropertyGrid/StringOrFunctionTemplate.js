define('Controls-demo/PropertyGrid/StringOrFunctionTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/PropertyGrid/StringOrFunctionTemplate',
      'UI/Builder',
      'UI/Executor',
      'i18n!userTemplate'
   ],
   function(Control, template, Builder, Executor) {
      'use strict';

      var tClosure = Executor.TClosure;
      var tmpl = Builder.Tmpl;
      var config = Builder.Config;

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
