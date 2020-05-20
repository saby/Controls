define('Controls-demo/Input/Date/Link', [
   'Core/Control',
   'wml!Controls-demo/Input/Date/Link',
], function(
   BaseControl,
   template
) {
   'use strict';

   var ModuleClass = BaseControl.extend({
      _template: template,
      _value: new Date(2018, 0, 1)
   });
   ModuleClass._styles = ['Controls-demo/Input/Date/Link'];

   return ModuleClass;
});
