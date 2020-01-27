define('Controls-demo/Calendar/MonthSlider', [
   'Core/Control',
   'wml!Controls-demo/Calendar/MonthSlider'
], function(
   BaseControl,
   template
) {
   'use strict';

   var ModuleClass = BaseControl.extend(
      {
         _template: template,
         _month: null,
         _startValue: null,
         _endValue: null,
         _position: null,

         constructor: function() {
            ModuleClass.superclass.constructor.apply(this, arguments);
            this._month = new Date(2017, 0, 1);
            this._startValue = new Date(2017, 0, 1);
            this._endValue = new Date(2017, 0, 30);
            this._position = new Date(2019, 0, 1);
         },

         _changeStartValue: function(event, days) {
            this._startValue = new Date(this._startValue.getFullYear(), this._startValue.getMonth(), this._startValue.getDate() + days);
            this._forceUpdate();
         },
         _changeMonth: function(event, dMonth) {
            this._month = new Date(this._month.getFullYear(), this._month.getMonth() + dMonth, 1);
            this._forceUpdate();
         }
      }
   );
   return ModuleClass;
});
