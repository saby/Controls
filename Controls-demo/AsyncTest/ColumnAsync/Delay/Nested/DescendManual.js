define('Controls-demo/AsyncTest/ColumnAsync/Delay/Nested/DescendManual',
   [
      'Core/Control',
      'wml!Controls-demo/AsyncTest/ColumnAsync/Delay/Nested/DescendManual',
   ], function (Control, template) {
      'use strict';

      var delayDescendManualModule = Control.extend({
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
