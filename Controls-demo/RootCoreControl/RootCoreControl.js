define('Controls-demo/RootCoreControl/RootCoreControl', [
   'UI/Base',
   'wml!Controls-demo/RootCoreControl/RootCoreControl'
], function(Base, template) {
   'use strict';

   var module = Base.Control.extend({
      _template: template
   });

   return module;
});
