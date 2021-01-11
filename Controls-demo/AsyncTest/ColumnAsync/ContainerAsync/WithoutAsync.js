define('Controls-demo/AsyncTest/ColumnAsync/ContainerAsync/WithoutAsync',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/ColumnAsync/ContainerAsync/WithoutAsync',
   ], function (Base, template) {
      'use strict';

      var withoutAsyncModule = Base.Control.extend({
         _template: template,
         _isOpen: false,

         _setOpen: function() {
            this._isOpen = !this._isOpen;
            this._forceUpdate();
         },
      });

      withoutAsyncModule._styles = ['Controls-demo/AsyncTest/AsyncTestDemo'];

      return withoutAsyncModule;
   });
