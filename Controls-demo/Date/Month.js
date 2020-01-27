define('Controls-demo/Date/Month', [
   'Core/Control',
   'wml!Controls-demo/Date/Month',
   'Controls/calendar',
   'css!Controls-demo/Date/Month'
], function (
   BaseControl,
   template
) {
   'use strict';

   var ModuleClass = BaseControl.extend({
      _template: template,
      _month: new Date(2017, 0, 1),
      _startValue: new Date(2017, 0, 1),
      _endValue: new Date(2017, 0, 30),
      _startValue2: new Date(2017, 0, 1),
      _endValue2: new Date(2017, 0, 30),

      constructor: function() {
         ModuleClass.superclass.constructor.apply(this, arguments);
      },

      _clickHandler: function(event, days) {
         this._startValue = new Date(this._startValue.getFullYear(), this._startValue.getMonth(),
            this._startValue.getDate() + days);
         this._forceUpdate();
      },
      _changeMonth: function(event, dMonth) {
         this._month = new Date(this._month.getFullYear(), this._month.getMonth() + dMonth, 1);
         this._forceUpdate();
      }
   });
   return ModuleClass;
});
