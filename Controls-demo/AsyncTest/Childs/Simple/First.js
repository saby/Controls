define('Controls-demo/AsyncTest/Childs/Simple/First',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/Childs/Simple/First'
   ], function (Base, template) {
      'use strict';

      var simpleFirstChildModule = Base.Control.extend({
         _template: template,

         _beforeMount: function (options) {
            return new Promise(function (resolve) {
               setTimeout(function () {
                  resolve();
               }, options.delay);
            });
         },

      });

      return simpleFirstChildModule;
   });
