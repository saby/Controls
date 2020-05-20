import BaseControl = require('Core/Control');
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import DateUtil = require('Controls/Utils/Date');
import monthListUtils from './MonthList/Utils';

import {IDateRangeSelectable, Utils as calendarUtils} from 'Controls/dateRange';
import MonthViewModel from './MonthView/MonthViewModel';
import dotTplFn = require('wml!Controls/_calendar/MonthView/MonthView');
import dayTemplate = require('wml!Controls/_calendar/MonthView/dayTemplate');
import dayHeaderTemplate = require('wml!Controls/_calendar/MonthView/dayHeaderTemplate');
import captionTemplate = require("wml!Controls/_calendar/MonthView/captionTemplate");

import IMonth from './interfaces/IMonth';

import {Logger} from 'UI/Utils';

var _private = {
   _updateView: function(self, options) {
      var newMonth = options.month || new options.dateConstructor();

      // localization can change in runtime, take the actual translation of the months each time the component
      // is initialized. In the array, the days of the week are in the same order as the return values
      // of the Date.prototype.getDay () method.  Moving the resurrection from the beginning of the array to the end.
      self._days = calendarUtils.getWeekdaysCaptions();

      if (!DateUtil.isDatesEqual(newMonth, self._month)) {
         self._month = newMonth;
         if (options.showCaption) {
            self._caption = formatDate(self._month, options.captionFormat);
         }
      }
      self._month = DateUtil.normalizeMonth(self._month);
      self._showWeekdays = options.showWeekdays;
   }
};


/**
 * Календарь, отображающий 1 месяц.
 * Умеет только отображать представление месяца и поддерживает события взаимодействия пользователя с днями.
 * Есть возможность переопределить конструктор модели и шаблон дня.
 * С помощью этого механизма можно кастомизировать отображение дней.
 * @class Controls/_calendar/MonthView
 * @extends Core/Control
 * @mixes Controls/_calendar/interface/IMonth
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Calendar/MonthView/LongCellName/LongCellName
 * @demo Controls-demo/Calendar/MonthView/NewMode/Index
 *
 */
/**
 * @event Происходит после клика по элементу дня в календаре.
 * @name Controls/_calendar/MonthView#itemClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Date} item Дата элемента, по которому произвели клик.
 * @param {Vdom/Vdom:SyntheticEvent} event Дескриптор события onclick, при клике по дню месяца.
 */
var MonthView = BaseControl.extend({
   _template: dotTplFn,

   _month: null,
   _showWeekdays: null,
   _monthViewModel: null,
   _caption: null,

   _themeCssClass: '',

   _beforeMount: function(options) {
      _private._updateView(this, options);
      this._monthViewModel = options.monthViewModel ? new options.monthViewModel(options) : new MonthViewModel(options);

      if (!options.newMode) {
         Logger.warn('MonthView: Используется устаревшая верстка, используйте newMode=true для перехода на новую');
      }
   },

   _beforeUpdate: function(newOptions) {
      _private._updateView(this, newOptions);

      this._monthViewModel.updateOptions(newOptions);
   },

    _dateToDataString: function(date) {
      return monthListUtils.dateToId(date);
   },

   _getDayData: function() {
      return {};
   },

   _dayClickHandler: function(event, item, isCurrentMonth) {
      if (this._options.selectionType !== IDateRangeSelectable.SELECTION_TYPES.disable &&
          !this._options.readOnly && (isCurrentMonth || this._options.mode === 'extended')) {
         this._notify('itemClick', [item, event]);
      }
   },

   _mouseEnterHandler: function(event, item, isCurrentMonth) {
      if (isCurrentMonth || this._options.mode === 'extended') {
         this._notify('itemMouseEnter', [item]);
      }
   }

   // cancelSelection: function () {
   //    var canceled = MonthView.superclass.cancelSelection.call(this);
   //    // if (canceled) {
   //    //    this._selectionType = null;
   //    // }
   //    return canceled;
   // }
});

MonthView._private = _private;

var defaultOptions = {
   ...IMonth.getDefaultOptions(),
   dayTemplate: dayTemplate,
   dayHeaderTemplate: dayHeaderTemplate,
   captionTemplate: captionTemplate,
   dateConstructor: WSDate
};

MonthView.getDefaultOptions = function() {
   return defaultOptions;
};

MonthView.getOptionTypes = function() {
   return IMonth.getOptionTypes();
};

MonthView._theme = ['Controls/calendar'];

export default MonthView;
