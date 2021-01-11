define('Controls-demo/AsyncTest/ColumnAsync/ContainerAsync/WithAsync',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/ColumnAsync/ContainerAsync/WithAsync',
   ], function (Base, template) {
      'use strict';

      var withAsyncModule = Base.Control.extend({
         _template: template,
         _isOpen: false,

         _setOpen: function() {
            this._isOpen = !this._isOpen;
            this._forceUpdate();
         },
      });

      withAsyncModule._styles = ['Controls-demo/AsyncTest/AsyncTestDemo'];

      return withAsyncModule;
   });
