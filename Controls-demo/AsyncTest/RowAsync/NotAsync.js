define('Controls-demo/AsyncTest/RowAsync/NotAsync',
   [
      'Core/Control',
      'wml!Controls-demo/AsyncTest/RowAsync/NotAsync',
   ],
   function(Control, template) {
      'use strict';

      var rowAsyncModule = Control.extend({
         _template: template,
         _isOpen: false,

         _setOpen: function() {
            this._isOpen = !this._isOpen;
            this._forceUpdate();
         },
      });
      rowAsyncModule._styles = ['Controls-demo/AsyncTest/AsyncTestDemo'];

      return rowAsyncModule;
   }
);
