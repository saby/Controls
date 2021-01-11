define('Controls-demo/List/ItemActionsCustomWI', [
   'UI/Base',
   'wml!Controls-demo/List/ItemActions/ItemActionsCustomWI'
], function(Base, template) {
   'use strict';

   var ModuleClass = Base.Control.extend(
      {
         _template: template
      });
   return ModuleClass;
});
