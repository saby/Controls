define('Controls-demo/dateRange/LinkSelector', [
   'UI/Base',
   'wml!Controls-demo/dateRange/LinkSelector',
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
   ModuleClass._styles = ['Controls-demo/dateRange/LinkSelector', 'Controls-demo/Controls-demo'];

   return ModuleClass;
});
