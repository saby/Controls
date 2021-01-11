define('Controls-demo/AsyncTest/Childs/SecondChild',
   [
      'UI/Base',
      'Env/Env',
      'wml!Controls-demo/AsyncTest/Childs/SecondChild'
   ], function (Base, Env, template) {
      'use strict';

      var secondChildModule = Base.Control.extend({
         _template: template,
         _multipleControls: 5,
         _multipleChildControls: 2,

         _beforeMount: function () {
            return new Promise(function (resolve) {
               setTimeout(function () {
                  Env.IoC.resolve('ILogger').info('Second resolve');
                  resolve();
               }, 2000);
            });
         }
      });

      return secondChildModule;
   });
