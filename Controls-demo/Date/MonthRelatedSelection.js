define('Controls-demo/Date/MonthRelatedSelection', [
   'UI/Base',
   'wml!Controls-demo/Date/MonthRelatedSelection',
   'Controls/calendar'
], function(
   Base,
   template
) {
   'use strict';

   var ModuleClass = Base.Control.extend(
      {
         _template: template,
         _month1: new Date(2017, 0, 1),
         _month2: new Date(2017, 1, 1),
         _startValue: new Date(2017, 0, 1),
         _endValue: new Date(2017, 0, 30),
         _selectionProcessing: false,
         _selectionBaseValue: null,
         _selectionHoveredValue: null,

         constructor: function() {
            ModuleClass.superclass.constructor.apply(this, arguments);
         },

         _clickHandler: function(event, days) {
            this._startValue = new Date(this._startValue.getFullYear(), this._startValue.getMonth(), this._startValue.getDate() + days);
            this._forceUpdate();
         }
      });
   return ModuleClass;
});