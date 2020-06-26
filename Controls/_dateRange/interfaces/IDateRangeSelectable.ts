import coreMerge = require('Core/core-merge');
import entity = require('Types/entity');
import IRangeSelectable from './IRangeSelectable';
'use strict';

/**
 * Интерфейс для выбора диапазона дат.
 * @interface Controls/_dateRange/interfaces/IDateRangeSelectable
 * @public
 * @author Красильников А.С.
 */
var selectionTypes = coreMerge({'quantum': 'quantum'}, IRangeSelectable.SELECTION_TYPES);
const minRange = {
   day: 'day',
   month: 'month'
};

export = {
   getDefaultOptions: function () {
      var options = IRangeSelectable.getDefaultOptions();

      /**
       * @name Controls/_dateRange/interfaces/IDateRangeSelectable#ranges
       * @cfg {Object} Кванты.
       * @remark
       * Если заданы кванты, то нельзя выделить произвольный период, а можно только выделить заданные периоды.
       * Объект принимает свойства days, weeks, months, quarters, halfyears, и years со значениями типа Array.
       * @default []
       * @example
       * В данном примере можно выбрать либо 1 день, либо диапазон в 4 дня, либо 2 целые недели, либо 1 месяц.
       * <pre class="brush: html">
       * <Controls.dateRange:RangeSelector ranges="{days: [1,4], weeks: [2], months: [1] }" />
       * </pre>
       */
      options.ranges = [];
      /**
       * @typedef {String} SelectionType
       * @variant range Выделение произвольного диапазона.
       * @variant single Выделение одного элемента.
       * @variant quantum Выделение квантами. Кванты задаются через опцию {@link https://wi.sbis.ru/docs/js/Controls/dateRange/IDateRangeSelectable/options/ranges/ range}
       * @variant disable Выбор отключен.
       */

      /**
       * @name Controls/_dateRange/interfaces/IDateRangeSelectable#selectionType
       * @cfg {SelectionType} Определяет режим выделения диапазона.
       * @demo Controls-demo/datePopup/SelectionType/Index
       * @default quantum
       */

      /**
       * @typedef {String} MinRange
       * @description Режим выбора диапазона дат.
       * @variant day Выбора периода из нескольких дней.
       * @variant month Выбора периода из нескольких месяцев.
       */

      /**
       * @name Controls/_dateRange/interfaces/IDateRangeSelectable#minRange
       * @cfg {MinRange} Задает режим выбора диапазона дат.
       * @default day
       */

      /*
       * @name Controls/_dateRange/interfaces/IDateRangeSelectable#minRange
       * @cfg {String} Specifies the range selection mode
       * @variant 'day' selection mode period multiple days
       * @variant 'month' selection mode period multiple months
       */
      options.minRange = minRange.day;

      return options;
   },

   SELECTION_TYPES: selectionTypes,

   minRange,

   getOptionTypes: function () {
      var optionsTypes = IRangeSelectable.getOptionTypes();
      optionsTypes.selectionType = entity.descriptor(String).oneOf(Object.keys(selectionTypes));
      return optionsTypes;
   }
};
