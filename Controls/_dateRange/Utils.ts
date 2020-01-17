// @ts-ignore
import getFormattedDateRange = require('Core/helpers/Date/getFormattedDateRange');
// @ts-ignore
import locales = require('Core/helpers/i18n/locales');
import DateUtil = require('Controls/Utils/Date');

var locale = locales.current;
var weekdaysCaptions;

var getDayRange = function(startDate, endDate, quantum) {
   var date = new Date(startDate);
   if (startDate <= endDate) {
      date.setDate(date.getDate() + quantum - 1);
      return [startDate, date];
   } else {
      date.setDate(date.getDate() - quantum + 1);
      return [date, startDate];
   }
};

/**
 * @class Controls/_dateRange/Utils
 * @public
 */
var Utils = {

   /**
    * Возвращает список названий дней недели.
    * @returns {Array}
    */

   /*
    * Returns the list of days of the week
    * @returns {Array}
    */
   getWeekdaysCaptions: function() {
      if (!weekdaysCaptions || locale !== locales.current) {
         var days = locale.config.daysSmall.slice(1);
         days.push(locale.config.daysSmall[0]);

         weekdaysCaptions = days.map(function(value, index) {
            return {caption: value, weekend: index === 5 || index === 6};
         });
      }
      return weekdaysCaptions;
   },

   /**
    * Возвращает форматированный период дат для заголовка контрола периода дат.
    * @param startValue
    * @param endValue
    * @param emptyCaption
    * @returns {*}
    */

   /*
    * Returns formatted date range for date range controls caption.
    * @param startValue
    * @param endValue
    * @param emptyCaption
    * @returns {*}
    */
   formatDateRangeCaption: function(startValue, endValue, emptyCaption) {
      // As an empty value, use the non-breaking space @nbsp; ('\ xA0') that would not make layout
      return getFormattedDateRange(
         startValue,
         endValue,
         {
            contractToMonth: true,
            fullNameOfMonth: true,
            contractToQuarter: true,
            contractToHalfYear: true,
            emptyPeriodTitle: emptyCaption || '\xA0'
         }
      );
   },

   /**
    * Получить смещение первого дня месяца (количество дней перед первым числом).
    * @param {Number} year год
    * @param {Number} month месяц
    * @returns {Number}
    */
   getFirstDayOffset: function(year, month) {
      var
         date = new Date(year, month ? month - 1 : 0),
         day = date.getDay();

      return day ? day - 1 : 6; // Воскресенье 0-й день
   },

   /**
    * Получить количество дней в месяце.
    * @param {Number} year год
    * @param {Number} month месяц
    * @returns {Number}
    */
   getDaysInMonth: function(year, month) {
      return new Date(year, month, 0).getDate();
   },

   /**
    * Получить количство всех недель в месяце.
    * @param {Number} year
    * @param {Number} month
    * @returns {Number}
    */
   getWeeksInMonth: function(year, month) {
      var
         days = this.getDaysInMonth(year, month),
         offset = this.getFirstDayOffset(year, month);

      return Math.ceil((days + offset) / 7);
   },

   /**
    * Получить массив недель (строка) с массивом дней (ячейка) для MonthTableBody.
    * @param {Date} date месяц
    * @param {String} mode
    * @variant current Возвращает текущий месяц.
    * @variant extended Возвращает массив из 6 недель. Возвращает первую неделю текущего месяца, последнюю полную неделю, и если текущий месяц включает менее 6 недель, то недели следующего месяца.
    * @returns {Array}
    */
   getWeeksArray: function(date, mode) {
      var
         weeksArray = [],
         year = date.getFullYear(),
         month = date.getMonth() + 1,
         weeksInMonth = mode === 'extended' ? 6 : this.getWeeksInMonth(year, month),
         monthDate = this.getFirstDayOffset(year, month) * -1 + 1;


      for (var w = 0; w < weeksInMonth; w++) {
         var daysArray = [];

         for (var d = 0; d < 7; d++) {
            daysArray.push(new Date(year, month - 1, monthDate));
            monthDate++;
         }
         weeksArray.push(daysArray);
      }

      return weeksArray;
   },

   updateRangeByQuantum: function(baseDate, date, quantum) {
      var lastQuantumLength, lastQuantumType,
         days, start, end, i, date2;

      if ('days' in quantum) {
         lastQuantumType = 'days';
         for (i = 0; i < quantum.days.length; i++) {
            lastQuantumLength = quantum.days[i];
            days = DateUtil.getDaysByRange(baseDate, date) + 1;
            if (quantum.days[i] >= days) {
               return getDayRange(baseDate, date, lastQuantumLength);
            }
         }
      }
      if ('weeks' in quantum) {
         lastQuantumType = 'weeks';
         for (i = 0; i < quantum.weeks.length; i++) {
            lastQuantumLength = quantum.weeks[i];
            if (baseDate <= date) {
               start = DateUtil.getStartOfWeek(baseDate);
               end = DateUtil.getEndOfWeek(baseDate);
               end.setDate(end.getDate() + (lastQuantumLength - 1) * 7);
            } else {
               start = DateUtil.getStartOfWeek(baseDate);
               start.setDate(start.getDate() - (lastQuantumLength - 1) * 7);
               end = DateUtil.getEndOfWeek(baseDate);
            }
            if (date >= start && date <= end) {
               return [start, end];
            }
         }
      }
      if ('months' in quantum) {
         lastQuantumType = 'months';
         for (i = 0; i < quantum.months.length; i++) {
            lastQuantumLength = quantum.months[i];
            if (baseDate <= date) {
               start = DateUtil.getStartOfMonth(baseDate);
               end = DateUtil.getEndOfMonth(baseDate);
               end.setMonth(end.getMonth() + (lastQuantumLength - 1));
            } else {
               start = DateUtil.getStartOfMonth(baseDate);
               start.setMonth(start.getMonth() - (lastQuantumLength - 1));
               end = DateUtil.getEndOfMonth(baseDate);
            }
            if (date >= start && date <= end) {
               return [start, end];
            }
         }
      }

      if (lastQuantumType === 'days') {
         return getDayRange(baseDate, date, lastQuantumLength);
      } else if (lastQuantumType === 'weeks') {
         date2 = new Date(baseDate);
         date2.setDate(date2.getDate() + (lastQuantumLength - 1) * 7);
         if (baseDate <= date) {
            return [DateUtil.getStartOfWeek(baseDate), DateUtil.getEndOfWeek(date2)];
         } else {
            return [DateUtil.getStartOfWeek(date2), DateUtil.getEndOfWeek(baseDate)];
         }
      } else if (lastQuantumType === 'months') {
         date2 = new Date(baseDate);
         date2.setMonth(date2.getMonth() + lastQuantumLength - 1);
         if (baseDate <= date) {
            return [DateUtil.getStartOfMonth(baseDate), DateUtil.getEndOfMonth(date2)];
         } else {
            return [DateUtil.getStartOfMonth(date2), DateUtil.getEndOfMonth(baseDate)];
         }
      }

      if (baseDate <= date) {
         return [baseDate, date];
      } else {
         return [date, baseDate];
      }
   }
};

export default Utils;
