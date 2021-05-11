import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import {Base as DateUtil} from 'Controls/dateUtils';
import monthListUtils from './MonthList/Utils';

import {IDateRangeSelectable, Utils as calendarUtils, keyboardPeriodController} from 'Controls/dateRange';
import MonthViewModel from './MonthView/MonthViewModel';
import dotTplFn = require('wml!Controls/_calendar/MonthView/MonthView');
import dayTemplate = require('wml!Controls/_calendar/MonthView/dayTemplate');
import dayHeaderTemplate = require('wml!Controls/_calendar/MonthView/dayHeaderTemplate');
import captionTemplate = require("wml!Controls/_calendar/MonthView/captionTemplate");

import IMonth from './interfaces/IMonth';

import {Logger} from 'UI/Utils';
import {constants} from 'Env/Env';
import 'css!Controls/calendar';

/**
 * Календарь, отображающий 1 месяц.
 * Умеет только отображать представление месяца и поддерживает события взаимодействия пользователя с днями.
 * Есть возможность переопределить конструктор модели и шаблон дня.
 * С помощью этого механизма можно кастомизировать отображение дней.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/6156a9009ee88d96bf73c8b1200e197f9db1c3c8/Controls-default-theme/variables/_calendar.less переменные тем оформления}
 *
 * @class Controls/_calendar/MonthView
 * @extends UI/Base:Control
 * @mixes Controls/calendar:IMonth
 * @mixes Controls/dateRange:IDayTemplate
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Date/MonthView
 * @demo Controls-demo/Calendar/MonthView/NewMode/Index
 *
 */

const defaultOptions = {
   ...IMonth.getDefaultOptions(),
   dayTemplate: dayTemplate,
   dayHeaderTemplate: dayHeaderTemplate,
   captionTemplate: captionTemplate,
   dateConstructor: WSDate,
   newMode: true
};

export default class MonthView extends Control<IControlOptions> {
   _template: TemplateFunction = dotTplFn;
   _month: Date|string;
   _showWeekdays: boolean;
   _monthViewModel: MonthViewModel;
   _caption: string;

   protected _beforeMount(options): void {
      this._updateView(options);
      this._monthViewModel = options.monthViewModel ? new options.monthViewModel(options) : new MonthViewModel(options);

      if (!options.newMode) {
         Logger.warn('MonthView: Используется устаревшая верстка, используйте newMode=true для перехода на новую');
      }
   }

   protected _beforeUpdate(newOptions): void {
      this._updateView(newOptions);

      this._monthViewModel.updateOptions(newOptions);
   }

   protected _dateToDataString(date): string {
      return monthListUtils.dateToId(date);
   }

   protected _getDayData(): object {
      return {};
   }

   protected _dayClickHandler(event, item, isCurrentMonth): void {
      if (this._options.selectionType !== IDateRangeSelectable.SELECTION_TYPES.disable &&
          !this._options.readOnly && (isCurrentMonth || this._options.mode === 'extended')) {
         this._notify('itemClick', [item, event]);
      }
   }

   protected _mouseEnterHandler(event, item, isCurrentMonth): void {
      if (isCurrentMonth || this._options.mode === 'extended') {
         this._notify('itemMouseEnter', [item]);
      }
   }

   protected _mouseLeaveHandler(event, item, isCurrentMonth): void {
      if (isCurrentMonth || this._options.mode === 'extended') {
         this._notify('itemMouseLeave', [item]);
      }
   }

    protected _keyDownHandler(event: Event, item: Date): void {
      const itemClass = '.controls-MonthViewVDOM__item';
      const mode = 'days';
      this._notify('itemKeyDown', [item, event.nativeEvent.keyCode, itemClass, mode]);
    }

   private _updateView(options): void {
      var newMonth = options.month || new options.dateConstructor();

      // localization can change in runtime, take the actual translation of the months each time the component
      // is initialized. In the array, the days of the week are in the same order as the return values
      // of the Date.prototype.getDay () method.  Moving the resurrection from the beginning of the array to the end.
      this._days = calendarUtils.getWeekdaysCaptions();

      if (!DateUtil.isDatesEqual(newMonth, this._month)) {
         this._month = newMonth;
         if (options.showCaption) {
            this._caption = formatDate(this._month, options.captionFormat);
         }
      }
      this._month = DateUtil.normalizeMonth(this._month);
      this._showWeekdays = options.showWeekdays;
   }


   static getOptionTypes(): object {
      return IMonth.getOptionTypes();
   }

   static getDefaultOptions(): object {
      return defaultOptions;
   }
}

Object.defineProperty(MonthView, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return MonthView.getDefaultOptions();
   }
});

/**
 * @event Происходит после клика по элементу дня в календаре.
 * @name Controls/_calendar/MonthView#itemClick
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Date} item Дата элемента, по которому произвели клик.
 * @param {UICommon/Events:SyntheticEvent} event Дескриптор события onclick, при клике по дню месяца.
 */
