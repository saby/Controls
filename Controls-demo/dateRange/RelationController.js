define('Controls-demo/dateRange/RelationController', [
   'Core/Control',
   'wml!Controls-demo/dateRange/RelationController',
], function(
   BaseControl,
   template
) {
   'use strict';

   var ModuleClass = BaseControl.extend({
      _template: template,

      _startValue0: new Date(2017, 0, 1),
      _endValue0: new Date(2017, 1, 0),
      _startValue1: new Date(2017, 1, 1),
      _endValue1: new Date(2017, 2, 0),
      _startValue2: new Date(2017, 2, 1),
      _endValue2: new Date(2017, 3, 0),

      _bindType: 'normal',

      _startValue2_0: new Date(2017, 0, 1),
      _endValue2_0: new Date(2017, 1, 0),
      _startValue2_1: new Date(2017, 1, 1),
      _endValue2_1: new Date(2017, 2, 0),
      _startValue2_2: new Date(2017, 2, 1),
      _endValue2_2: new Date(2017, 3, 0),

      _bindType2: 'normal',

      _startValue3_0: new Date(2017, 0, 1),
      _endValue3_0: new Date(2017, 1, 0),
      _startValue3_1: new Date(2017, 1, 1),
      _endValue3_1: new Date(2017, 2, 0),
      _startValue3_2: new Date(2017, 2, 1),
      _endValue3_2: new Date(2017, 3, 0),

      _beforeMount: function() {
      }
   });
   ModuleClass._styles = ['Controls-demo/dateRange/RelationController'];

   return ModuleClass;
});
