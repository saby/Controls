define('Controls-demo/AsyncTest/ColumnAsync/Delay/Promise/Descend',
   [
      'Core/Control',
      'wml!Controls-demo/AsyncTest/ColumnAsync/Delay/Promise/Descend',
   ], function (Control, template) {
      'use strict';

      var delayDescendModule = Control.extend({
         _template: template,
         _isOpen: false,

         _beforeMount: function (options) {
            return new Promise(function (resolve) {
               setTimeout(function () {
                  resolve();
               }, options.delay);
            });
         },

         _setOpen: function() {
            this._isOpen = !this._isOpen;
            this._forceUpdate();
         },
      });

      delayDescendModule._styles = ['Controls-demo/AsyncTest/AsyncTestDemo'];

      return delayDescendModule;
   });
