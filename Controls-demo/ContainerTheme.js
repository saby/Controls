define('Controls-demo/ContainerTheme', [
   'UI/Base',
   'wml!Controls-demo/ContainerTheme'
], function(Base,
            template
) {
   'use strict';

   /**
    * This control trying to get theme option from url and pass it to demo
    */
   var ModuleClass = Base.Control.extend(
      {
         _template: template
      });

   return ModuleClass;
});