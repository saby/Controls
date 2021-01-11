define('Controls-demo/AsyncTest/AsyncTestDemo',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/AsyncTestDemo',
   ],
   function(Base, template) {
      'use strict';

      var AsyncTestDemo = Base.Control.extend({
         _template: template,
      });
      AsyncTestDemo._styles = ['Controls-demo/AsyncTest/AsyncTestDemo'];

      return AsyncTestDemo;
   }
);
