define('Controls-demo/AsyncTest/ColumnAsync/Template/WsPartial',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/ColumnAsync/Template/WsPartial',
   ], function (Base, template) {
      'use strict';

      var wsPartialModule = Base.Control.extend({
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
