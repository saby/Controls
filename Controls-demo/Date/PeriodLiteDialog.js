define('Controls-demo/Date/PeriodLiteDialog', [
   'UI/Base',
   'wml!Controls-demo/Date/PeriodLiteDialog',
], function(
   Base,
   template
) {
   'use strict';

   var ModuleClass = Base.Control.extend({
      _template: template,
      _periods: [[new Date(2017, 3), new Date(2020, 5)]],
      _year: new Date(2017, 0, 1),
      _startValue: new Date(2017, 0, 1),
      _endValue: new Date(2017, 1, 0),
      _endValue2: new Date(2017, 2, 31),
      _endValue3: new Date(2017, 11, 31),
      _checkedStart: new Date(2017, 3, 1),
      _startValueOnlyYears: new Date(2010, 0, 1),
      _endValueOnlyYears: new Date(2011, 0, 0),
      _stickyPosition: {
         position: {
            top: 0,
            left: 0,
            maxWidth: 150
         },
         targetCoords: {
            top: 0
         },
         margins: {
            top: 0,
            left: 0
         },
         targetPosition: {
            top: 0,
            left: 0,
            width: 50
         },
         sizes: {
            width: 50
         }
      }
   });
   ModuleClass._styles = ['Controls-demo/Date/PeriodLiteDialog'];
   return ModuleClass;
});
