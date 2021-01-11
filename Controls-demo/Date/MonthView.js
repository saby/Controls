define('Controls-demo/Date/MonthView', [
   'UI/Base',
   'wml!Controls-demo/Date/MonthView',
   'Controls/calendar'
], function(
   Base,
   template
) {
   'use strict';

   var ModuleClass = Base.Control.extend(
      {
         _template: template,
         _month: new Date(2017, 0, 1),

         constructor: function() {
            ModuleClass.superclass.constructor.apply(this, arguments);
         },

         _changeMonth: function(event, dMonth) {
            this._month = new Date(this._month.getFullYear(), this._month.getMonth() + dMonth, 1);
            this._forceUpdate();
         }
      });
   return ModuleClass;
});