define('Controls-demo/datePopup/datePopup', [
   'UI/Base',
   'wml!Controls-demo/datePopup/datePopup'
], function(
   Base,
   template
) {
   'use strict';

   var ModuleClass = Base.Control.extend({
      _template: template,
      _startValue: new Date(2019, 4, 3),
      _endValue: new Date(2019, 5, 0)
   });
   return ModuleClass;
});
