define('Controls-demo/Date/MonthList', [
   'Core/Control',
   'Types/formatter',
   'Controls-demo/Date/MonthListSource',
   'wml!Controls-demo/Date/MonthList',
   'wml!Controls-demo/Date/MonthListDay',
], function(
   BaseControl,
   formatter,
   MonthListSource,
   template,
   dayTemplate
) {
   'use strict';

   var ModuleClass = BaseControl.extend({
      _template: template,
      _dayTemplate: dayTemplate,
      _startValue: new Date(1900, 0, 1),
      _endValue: new Date(1900, 0, 31),
      _year: new Date(2018, 0, 1),
      _month: new Date(2018, 0, 1),
      _selectionProcessing: false,
      _selectionHoveredValue: null,
      _selectionBaseValue: null,
      _source: null,
      _displayedRanges: [
         [null, new Date(2018, 8)],
         [new Date(2019, 3), new Date(2020, 8)],
         [new Date(2022, 0), null]
      ],
      _displayedRanges2: [
         [new Date(2017, 0), new Date(2021, 0)]
      ],

      _yearHeader: null,
      _monthHeader: null,

      _formatter: formatter,

      _beforeMount: function() {
         this._source = new MonthListSource();
         this._updateYearHeader(this._year);
         this._updateMonthHeader(this._month);
      },

      _yearPositionChangedHandler: function(event, date) {
         this._updateYearHeader(date);
      },

      _updateYearHeader: function(date) {
         this._yearHeader = formatter.date(date, 'YYYY');
      },

      _monthPositionChangedHandler: function(event, date) {
         this._updateMonthHeader(date);
      },

      _updateMonthHeader: function(date) {
         this._monthHeader = this._formatMonth(date);
      },

      _updateYear: function() {
         this._source.changeData();
         this._children.yearsMonthList.invalidatePeriod(new Date(2019, 0, 1), new Date(2019, 11, 1));
         this._children.monthsMonthList.invalidatePeriod(new Date(2019, 0, 1), new Date(2019, 11, 1));
      },

      _scrollToDate: function() {
         this._month = new Date(2019, 5, 3);
      },

      _formatMonth: function(date) {
         return date ? formatter.date(date, formatter.date.FULL_MONTH) : '';
      }
   });
   ModuleClass._styles = ['Controls-demo/Date/MonthList'];

   return ModuleClass;
});
