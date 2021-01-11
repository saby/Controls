define('Controls-demo/AsyncTest/ColumnAsync/Delay/Promise/Ascend',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/ColumnAsync/Delay/Promise/Ascend',
   ], function (Base, template) {
      'use strict';

      var delayAscendModule = Base.Control.extend({
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

      delayAscendModule._styles = ['Controls-demo/AsyncTest/AsyncTestDemo'];

      return delayAscendModule;
   });
