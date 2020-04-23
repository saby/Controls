define('Controls-demo/AsyncTest/ColumnAsync/ContainerAsync/WithoutAsync',
   [
      'Core/Control',
      'wml!Controls-demo/AsyncTest/ColumnAsync/ContainerAsync/WithoutAsync',
   ], function (Control, template) {
      'use strict';

      var withoutAsyncModule = Control.extend({
         _template: template,
         _styles: ['Controls-demo/AsyncTest/AsyncTestDemo'],
         _isOpen: false,

         _setOpen: function() {
            this._isOpen = !this._isOpen;
            this._forceUpdate();
         },
      });

      return withoutAsyncModule;
   });
