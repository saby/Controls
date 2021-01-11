define('Controls-demo/AsyncTest/ColumnAsync/Delay/Nested/DescendManual',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/ColumnAsync/Delay/Nested/DescendManual',
   ], function (Base, template) {
      'use strict';

      var delayDescendManualModule = Base.Control.extend({
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

      delayDescendManualModule._styles = ['Controls-demo/AsyncTest/AsyncTestDemo'];

      return delayDescendManualModule;
   });
