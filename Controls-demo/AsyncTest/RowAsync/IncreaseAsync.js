define('Controls-demo/AsyncTest/RowAsync/IncreaseAsync',
   [
      'Core/Control',
      'wml!Controls-demo/AsyncTest/RowAsync/IncreaseAsync',
   ],
   function(Control, template) {
      'use strict';

      var rowAsyncModule = Control.extend({
         _template: template,
         _styles: ['Controls-demo/AsyncTest/AsyncTestDemo'],
         _isOpen: false,

         _setOpen: function() {
            this._isOpen = !this._isOpen;
            this._forceUpdate();
         },
      });
      return rowAsyncModule;
   }
);
