define('Controls-demo/AsyncTest/Childs/CaseThird/Third',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/Childs/CaseThird/Third'
   ], function (Base, template) {
      'use strict';

      var caseThirdThirdModule = Base.Control.extend({
         _template: template,

         _beforeMount: function (options) {
            return new Promise(function (resolve) {
               setTimeout(function () {
                  resolve();
               }, options.delay);
            });
         },

      });

      return caseThirdThirdModule;
   });
