define('Controls/Calendar/MonthSlider', [
   'Core/Control',
   'Core/core-merge',
   'WS.Data/Type/descriptor',
   'SBIS3.CONTROLS/Utils/DateUtil',
   'Controls/Calendar/MonthSlider/Slider',
   'Controls/Calendar/Utils',
   'tmpl!Controls/Calendar/MonthSlider/MonthSlider',
   'Controls/Calendar/interface/IMonth',
   'css!Controls/Calendar/MonthSlider/MonthSlider'
], function(
   BaseControl,
   coreMerge,
   types,
   DateUtil,
   Slider,
   calendarUtils,
   monthTmpl,
   IMonth
) {

   'use strict';

   /**
    * A calendar that displays 1 month and allows you to switch to the next and previous months using the buttons.
    * Designed to select a date or period within a few months or years.
    *
    * @class Controls/Calendar/MonthSlider
    * @extends Core/Control
    * @mixes Controls/Calendar/interface/IMonth
    * @mixes Controls/Calendar/interface/IRangeSelectable
    * @mixes Controls/Calendar/interface/IDateRangeSelectable
    * @control
    * @public
    * @author Миронов А.Ю.
    * @demo Controls-demo/Calendar/Month
    *
    */

   var _private = {
      _setMonth: function(self, month, silent) {
         if (DateUtil.isDatesEqual(month, self._month)) {
            return;
         }
         self._animation = month < self._month ? Slider.ANIMATIONS.slideRight : Slider.ANIMATIONS.slideLeft;
         self._month = month;
         self._isHomeVisible = !DateUtil.isMonthsEqual(month, new Date());
         if (!silent) {
            self._notify('monthChanged', [month]);
         }
      }
   };

   var Component = BaseControl.extend({
      _template: monthTmpl,
      _month: null,
      _animation: Slider.ANIMATIONS.slideLeft,
      _isHomeVisible: true,
      _days: [],


      _beforeMount: function(options) {
         this._days = calendarUtils.getWeekdaysCaptions();
         _private._setMonth(this, options.month, true);
      },

      _beforeUpdate: function(options) {
         this._days = calendarUtils.getWeekdaysCaptions();
         _private._setMonth(this, options.month, true);
      },

      _slideMonth: function(event, delta) {
         _private._setMonth(this, new Date(this._month.getFullYear(), this._month.getMonth() + delta, 1));
      },

      _setCurrentMonth: function() {
         _private._setMonth(this, DateUtil.normalizeDate(new Date()));
      },

      _itemClickHandler: function(event, item) {
         this._notify('itemClick', [item]);
      },

      _onStartValueChanged: function(event, value) {
         this._notify('startValueChanged', [value]);
      },

      _onEndValueChanged: function(event, value) {
         this._notify('endValueChanged', [value]);
      }
   });

   Component.getDefaultOptions = function() {
      return coreMerge({}, IMonth.getDefaultOptions());
   };

   Component.getOptionTypes = function() {
      return coreMerge({}, IMonth.getOptionTypes());
   };

   return Component;
});
