define('Controls-demo/AsyncTest/Childs/CaseSecond/Async/Background',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/Childs/CaseSecond/Async/Background',
   ], function (Base, template) {
      'use strict';

      var backgroundModule = Base.Control.extend({
         _template: template,

         _beforeMount: function (options) {
            return new Promise(function (resolve) {
               setTimeout(function () {
                  resolve();
               }, options.delay);
            });
         },

      });

      return backgroundModule;
   });
