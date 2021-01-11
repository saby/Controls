define('Controls-demo/AsyncTest/Childs/Simple/ThirdNested',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/Childs/Simple/ThirdNested'
   ], function (Base, template) {
      'use strict';

      var simpleThirdNestedChildModule = Base.Control.extend({
         _template: template,

         _beforeMount: function (options) {
            return new Promise(function (resolve) {
               setTimeout(function () {
                  resolve();
               }, options.delay);
            });
         }
      });

      return simpleThirdNestedChildModule;
   });
