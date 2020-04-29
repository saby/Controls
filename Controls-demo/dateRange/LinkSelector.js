define('Controls-demo/dateRange/LinkSelector', [
   'Core/Control',
   'wml!Controls-demo/dateRange/LinkSelector',
], function(
   BaseControl,
   template
) {
   'use strict';

   var ModuleClass = BaseControl.extend({
      _template: template,
      _startValue: new Date(2017, 0, 1),
      _endValue: new Date(2017, 0, 31)
   });
   ModuleClass._styles = ['Controls-demo/dateRange/LinkSelector'];

   return ModuleClass;
});
