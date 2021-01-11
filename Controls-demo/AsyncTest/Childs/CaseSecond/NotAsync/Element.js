define('Controls-demo/AsyncTest/Childs/CaseSecond/NotAsync/Element',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/Childs/CaseSecond/NotAsync/Element',
   ], function (Base, template) {
      'use strict';

      var elementModule = Base.Control.extend({
         _template: template,

      });

      return elementModule;
   });
