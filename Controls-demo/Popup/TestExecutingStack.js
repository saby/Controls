define('Controls-demo/Popup/TestExecutingStack',
   [
      'UI/Base',
      'wml!Controls-demo/Popup/TestExecutingStack',
      'Core/Deferred'
   ],
   function (Base, template, Deferred) {
      'use strict';

      var TestDialog = Base.Control.extend({
         _template: template,
         _text: 'not updated',

         _beforeMount: function(options) {
            var def = new Deferred();
            this._text = options.text;
            this._textFotTest = 'not updated';
            setTimeout(def.callback.bind(def), options.delay || 500);
            return def;
         },

         _beforeUpdate: function(newOptions) {
            if (newOptions.text !== this._options.text) {
               this._textFotTest = 'updated after hook';
            }
         }
      });

      return TestDialog;
   }
);