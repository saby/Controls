define('Controls-demo/AsyncTest/ColumnAsync/Delay/Promise/Descend',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/ColumnAsync/Delay/Promise/Descend',
   ], function (Base, template) {
      'use strict';

      var delayDescendModule = Base.Control.extend({
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
