define('Controls-demo/AsyncTest/Childs/CaseSecond/Async/Grid',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/Childs/CaseSecond/Async/Grid',
   ], function (Base, template) {
      'use strict';

      var gridModule = Base.Control.extend({
         _template: template,

         _beforeMount: function (options) {
            return new Promise(function (resolve) {
               setTimeout(function () {
                  resolve();
               }, options.delay);
            });
         },

      });

      return gridModule;
   });
