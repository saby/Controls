import {IDateRangeSelectable, Utils as calendarUtils} from 'Controls/dateRange';
import {VersionableMixin, Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import cExtend = require('Core/core-simpleExtend');
import coreMerge = require('Core/core-merge');
import DateUtil = require('Controls/Utils/Date');

/**
 * Модель для представления месяца.
 * @class Controls/_calendar/MonthView/MonthViewModel
 * @author Красильников А.С.
 * @public
 */

var ModuleClass = cExtend.extend([VersionableMixin], {
   _state: null,
   _modelArray: [],

   constructor: function(cfg) {
      ModuleClass.superclass.constructor.apply(this, arguments);

      this._state = this._normalizeState(cfg);
      this._validateWeeksArray();
   },

   updateOptions: function(options) {
      var state = this._normalizeState(options),
         changed = this._isStateChanged(state);
      this._state = state;
      if (changed) {
         this._validateWeeksArray();
         this._nextVersion();
      }
   },

   getMonthArray: function() {
      return this._modelArray;
   },

   _normalizeState: function(state) {
      return {
         month: DateUtil.normalizeDate(state.month),
         mode: state.mode,
         enabled: state.enabled,
         daysData: state.daysData,
         dateConstructor: state.dateConstructor || WSDate,
         readOnly: state.readOnly
      };
   },

   _isStateChanged: function(state) {
      return !DateUtil.isDatesEqual(state.month, this._state.month) || state.daysData !== this._state.daysData;
   },

   _validateWeeksArray: function(state) {
      this._modelArray = this._getDaysArray(state);
   },

   _getDayObject: function(date, state) {
      state = state || this._state;

      var obj = {},
         today = DateUtil.normalizeDate(new this._state.dateConstructor()),
         firstDateOfMonth = DateUtil.getStartOfMonth(date),
         lastDateOfMonth = DateUtil.getEndOfMonth(date);

      obj.readOnly = state.readOnly;
      obj.mode = state.mode;
      obj.date = date;
      obj.id = formatDate(date, 'YYYY-MM-DD');
      obj.day = date.getDate();
      obj.dayOfWeek = date.getDay() ? date.getDay() - 1 : 6;
      obj.isCurrentMonth = DateUtil.isMonthsEqual(date, state.month);
      obj.today = DateUtil.isDatesEqual(date, today);
      obj.month = date.getMonth();
      obj.firstDayOfMonth = DateUtil.isDatesEqual(date, firstDateOfMonth);
      obj.lastDayOfMonth = DateUtil.isDatesEqual(date, lastDateOfMonth);

      obj.selectionEnabled = this._state.selectionType !== IDateRangeSelectable.SELECTION_TYPES.disable &&
          !this._state.readOnly;

      obj.weekend = obj.dayOfWeek === 5 || obj.dayOfWeek === 6;
      obj.enabled = state.enabled;
      obj.clickable = obj.mode === 'extended' || obj.isCurrentMonth;

      if (state.dayFormatter) {
         coreMerge(obj, state.dayFormatter(date) || {});
      }

      if (state.daysData) {
         obj.extData = state.daysData.at ? state.daysData.at(obj.day - 1) : state.daysData[obj.day - 1];
      }

      return obj;
   },

   _getDaysArray: function(state) {
      state = state || this._state;
      var weeks = calendarUtils.getWeeksArray(state.month, state.mode, state.dateConstructor);

      return weeks.map(function(weekArray) {
         return weekArray.map(function(day) {
            return this._getDayObject(day, state);
         }, this);
      }, this);
   },

   _prepareClass: function(scope) {
      scope = scope.value;

      var textColorClass = 'controls-MonthViewVDOM__textColor',
         backgroundColorClass = 'controls-MonthViewVDOM__backgroundColor',
         borderClass = 'controls-MonthViewVDOM__border',
         css = [];

      if (scope.isCurrentMonth) {
         textColorClass += '-currentMonthDay';
         backgroundColorClass += '-currentMonthDay';
      } else {
         textColorClass += '-otherMonthDay';
         backgroundColorClass += '-otherMonthDay';
      }

      if (scope.weekend) {
         textColorClass += '-weekend';
      } else {
         textColorClass += '-workday';
      }

      if (scope.selected && (scope.isCurrentMonth || scope.mode === 'extended')) {
         backgroundColorClass += '-selected';
         if (scope.selectedStart || scope.selectedEnd) {
            if (scope.selectionProcessing) {
               backgroundColorClass += '-startend-unfinished';
            }
         }
      } else {
         backgroundColorClass += '-unselected';
      }

      if (scope.readOnly) {
          backgroundColorClass += '-readOnly';
          borderClass += '-readOnly';
      }

      css.push(textColorClass, backgroundColorClass, borderClass);

      // Оставляем старые классы т.к. они используются в большом выборе периода до его редизайна
      // TODO: Выпилить старые классы
      if (scope.isCurrentMonth) {
         if (scope.selectionEnabled) {
            css.push('controls-MonthViewVDOM__cursor-item');
         }
         if (!scope.selected) {
            if (scope.selectionEnabled) {
               css.push('controls-MonthViewVDOM__border-currentMonthDay-unselected');
            }
         }
         css.push('controls-MonthViewVDOM__selectableItem');
         if (scope.enabled && scope.selectionEnabled) {
            css.push('controls-MonthViewVDOM__hover-selectableItem');
         }
         if (scope.selected) {
            css.push('controls-MonthViewVDOM__item-selected');
         }

         if (scope.selectedUnfinishedStart) {
            css.push('controls-MonthViewVDOM__item-selectedStart-unfinished');
         }
         if (scope.selectedUnfinishedEnd) {
            css.push('controls-MonthViewVDOM__item-selectedEnd-unfinished');
         }
         if (scope.selected) {
            if (scope.selectedStart && scope.selectedEnd && !scope.selectionProcessing) {
               css.push('controls-MonthViewVDOM__item-selectedStartEnd');
            } else if (scope.selectedStart && !scope.selectedUnfinishedStart) {
               css.push('controls-MonthViewVDOM__item-selectedStart');
            } else if (scope.selectedEnd && (!scope.selectionProcessing ||
                (scope.selectedEnd !== scope.selectedStart && !scope.selectedUnfinishedEnd))) {
               css.push('controls-MonthViewVDOM__item-selectedEnd');
            }
         }
         if (scope.selectedInner) {
            css.push('controls-MonthViewVDOM__item-selectedInner');
         }

         if (scope.today) {
            css.push('controls-MonthViewVDOM__today');
         }
      }

      css.push(scope.isCalendar ? 'controls-MonthViewVDOM__currentMonthDay' : 'controls-MonthViewVDOM__' + scope.month);

      if (scope.weekend) {
         css.push('controls-MonthViewVDOM__weekend');
      } else {
         css.push('controls-MonthViewVDOM__workday');
      }

      return css.join(' ');
   }

});

export default ModuleClass;
