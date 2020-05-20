define('Controls-demo/AsyncTest/ColumnAsync/ContainerAsync/WithAsync',
   [
      'Core/Control',
      'wml!Controls-demo/AsyncTest/ColumnAsync/ContainerAsync/WithAsync',
   ], function (Control, template) {
      'use strict';

      var withAsyncModule = Control.extend({
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
