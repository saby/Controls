define('Controls-demo/TestAppForStatic/Index', [
   'UI/Base',
   'wml!Controls-demo/TestAppForStatic/Index'
], function (Base,
             template
) {
   'use strict';

   var ModuleClass = Base.Control.extend(
      {
         _template: template
      });

   return ModuleClass;
});
