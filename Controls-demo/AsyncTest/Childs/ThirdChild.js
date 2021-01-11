define('Controls-demo/AsyncTest/Childs/ThirdChild',
   [
      'UI/Base',
      'Env/Env',
      'wml!Controls-demo/AsyncTest/Childs/ThirdChild'
   ], function (Base, Env, template) {
      'use strict';

      var thirdChildModule = Base.Control.extend({
         _template: template,
         _multipleControls: 2,

         _beforeMount: function () {
            return new Promise(function (resolve) {
               setTimeout(function () {
                  Env.IoC.resolve('ILogger').info('Third resolve');
                  resolve();
               }, 700);
            });
         }
      });

      return thirdChildModule;
   });
