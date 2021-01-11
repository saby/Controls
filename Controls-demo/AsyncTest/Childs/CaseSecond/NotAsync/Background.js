define('Controls-demo/AsyncTest/Childs/CaseSecond/NotAsync/Background',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/Childs/CaseSecond/NotAsync/Background',
   ], function (Base, template) {
      'use strict';

      var backgroundModule = Base.Control.extend({
         _template: template,

      });

      return backgroundModule;
   });
