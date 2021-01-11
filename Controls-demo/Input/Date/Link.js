define('Controls-demo/Input/Date/Link', [
   'UI/Base',
   'wml!Controls-demo/Input/Date/Link',
], function(
   Base,
   template
) {
   'use strict';

   var ModuleClass = Base.Control.extend({
      _template: template,
      _value: new Date(2018, 0, 1)
   });
   ModuleClass._styles = ['Controls-demo/Input/Date/Link'];

   return ModuleClass;
});
