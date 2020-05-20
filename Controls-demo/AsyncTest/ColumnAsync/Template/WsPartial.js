define('Controls-demo/AsyncTest/ColumnAsync/Template/WsPartial',
   [
      'Core/Control',
      'wml!Controls-demo/AsyncTest/ColumnAsync/Template/WsPartial',
   ], function (Control, template) {
      'use strict';

      var wsPartialModule = Control.extend({
         _template: template,
         _isOpen: false,

         _setOpen: function() {
            this._isOpen = !this._isOpen;
            this._forceUpdate();
         },
      });

      wsPartialModule._styles = ['Controls-demo/AsyncTest/AsyncTestDemo'];

      return wsPartialModule;
   });
