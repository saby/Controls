define('Controls-demo/AsyncTest/Childs/CaseThird/First',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/Childs/CaseThird/First'
   ], function (Base, template) {
      'use strict';

      var caseThirdFirstModule = Base.Control.extend({
         _template: template,

         _beforeMount: function (options) {
            return new Promise(function (resolve) {
               setTimeout(function () {
                  resolve();
               }, options.delay);
            });
         },

      });

      return caseThirdFirstModule;
   });
