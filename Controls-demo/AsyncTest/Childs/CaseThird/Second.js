define('Controls-demo/AsyncTest/Childs/CaseThird/Second',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/Childs/CaseThird/Second'
   ], function (Base, template) {
      'use strict';

      var caseThirdSecondModule = Base.Control.extend({
         _template: template,

         _beforeMount: function (options) {
            return new Promise(function (resolve) {
               setTimeout(function () {
                  resolve();
               }, options.delay);
            });
         },

      });

      return caseThirdSecondModule;
   });
