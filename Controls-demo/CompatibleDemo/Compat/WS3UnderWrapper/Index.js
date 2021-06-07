define('Controls-demo/CompatibleDemo/Compat/WS3UnderWrapper/Index', [
   'UI/Base',
   'wml!Controls-demo/CompatibleDemo/Compat/WS3UnderWrapper/Index'
], function(Base, template) {
   'use strict';

   var ModuleClass = Base.Control.extend(
      {
         _template: template,
         _beforeMount: function() {
            try {
               /* TODO: set to presentation service */
               process.domain.req.compatible = true;
            } catch (e) {
            }
         },
      }
   );

   return ModuleClass;
});
