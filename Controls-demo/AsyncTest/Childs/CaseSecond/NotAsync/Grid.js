define('Controls-demo/AsyncTest/Childs/CaseSecond/NotAsync/Grid',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/Childs/CaseSecond/NotAsync/Grid',
   ], function (Base, template) {
      'use strict';

      var gridModule = Base.Control.extend({
         _template: template,

      });

      return gridModule;
   });
