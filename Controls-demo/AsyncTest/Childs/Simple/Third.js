define('Controls-demo/AsyncTest/Childs/Simple/Third',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/Childs/Simple/Third'
   ], function (Base, template) {
      'use strict';

      var simpleThirdChildModule = Base.Control.extend({
         _template: template,

         _beforeMount: function (options) {
            return new Promise(function (resolve) {
               setTimeout(function () {
                  resolve();
               }, options.delay);
            });
         }
      });

      return simpleThirdChildModule;
   });
