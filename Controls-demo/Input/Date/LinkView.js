define('Controls-demo/Input/Date/LinkView', [
   'UI/Base',
   'wml!Controls-demo/Input/Date/LinkView',
], function(
   Base,
   template
) {
   'use strict';

   var ModuleClass = Base.Control.extend({
      _template: template,
      _startValue: new Date(2017, 0, 1),
      _endValue: new Date(2017, 0, 31)
   });
   ModuleClass._styles = ['Controls-demo/Input/Date/LinkView'];

   return ModuleClass;
});
