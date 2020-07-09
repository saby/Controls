import DateUtil = require('Controls/Utils/Date');

const DEFAULT_CSS_CLASS_BASE = 'controls-RangeSelection';
const PERIOD_TYPE = {
   day: 'day',
   month: 'month',
   year: 'year'
};

type PeriodType = 'day' | 'month' | 'year';

const isPeriodsEqual = (date1: Date, date2: Date, cfg: object): boolean => {
   const periodType: PeriodType = cfg ? cfg.periodQuantum : 'day';
   let isEqual;
   if (periodType === PERIOD_TYPE.year) {
      isEqual = DateUtil.isYearsEqual;
   } else if (periodType === PERIOD_TYPE.month) {
      isEqual = DateUtil.isMonthsEqual;
   } else {
      isEqual = DateUtil.isDatesEqual;
   }
   return isEqual(date1, date2);
};

var Utils = {
   PERIOD_TYPE: PERIOD_TYPE,

   /**
    * Returns a string containing css selection classes
    * @returns {String}
    */
   prepareSelectionClass: function(itemValue, startValue, endValue, selectionProcessing, baseSelectionValue,
                                   hoveredSelectionValue, hoveredStartValue, hoveredEndValue, cfg?: object) {
      var css = [],
         start,
         end,
         selected,
         isStart,
         isEnd,
         range;

      if (!(startValue || endValue) && !selectionProcessing && !(hoveredStartValue || hoveredEndValue)) {
         return '';
      }

      range = this.getRange(startValue, endValue, selectionProcessing, baseSelectionValue, hoveredSelectionValue);
      start = range[0];
      end = range[1];

      selected = Utils.isSelected(itemValue, startValue, endValue, selectionProcessing, baseSelectionValue,
         hoveredSelectionValue);

      if (selected) {
         css.push(selectionProcessing ? 'selection' : 'selected');
      }

      isStart = isPeriodsEqual(itemValue, start, cfg);
      isEnd = isPeriodsEqual(itemValue, end, cfg);

      if (isStart) {
         css.push('start');
      }
      if (isEnd && ((selectionProcessing && !isStart) || !selectionProcessing)) {
         css.push('end');
      }
      if (!isStart && !isEnd && selected) {
         css.push('inner');
      }

      if (selectionProcessing) {
         if (isPeriodsEqual(itemValue, baseSelectionValue, cfg)) {
            css.push('base');
         }
      }

      if (Utils.isHovered(itemValue, hoveredSelectionValue, hoveredStartValue, hoveredEndValue)) {
         css.push('hovered');
      }

      return Utils.buildCssClass(cfg, css);
   },

   isHovered: function(itemValue, hoveredSelectionValue, hoveredStartValue, hoveredEndValue, cfg) {
      return isPeriodsEqual(itemValue, hoveredSelectionValue, cfg) ||
          (hoveredStartValue && hoveredEndValue && itemValue >= hoveredStartValue && itemValue <= hoveredEndValue);
   },

   prepareHoveredClass: function(itemValue, hoveredStartValue, hoveredEndValue, cfg) {
      if (this.isHovered(itemValue, hoveredStartValue, hoveredEndValue, cfg)) {
         return Utils.buildCssClass(cfg, ['hovered']);
      }
      return '';
   },

   buildCssClass: function(cfg: object, parts: string[]): string {
      if (!parts.length) {
         return DEFAULT_CSS_CLASS_BASE;
      }
      let cssClass = ((cfg && cfg.cssPrefix) || (DEFAULT_CSS_CLASS_BASE + '__')) + parts.join('-');
      if (cfg.theme) {
         cssClass += ` ${cssClass}_theme-${cfg.theme}`;
      }
      return cssClass;
   },

   isSelected: function(itemValue, startValue, endValue, selectionProcessing, baseSelectionValue,
                        hoveredSelectionValue) {
      var range = this.getRange(startValue, endValue, selectionProcessing, baseSelectionValue,
         hoveredSelectionValue),
         start = range[0],
         end = range[1];
      return start && end && itemValue >= start && itemValue <= end;
   },

   getRange: function(startValue, endValue, selectionProcessing, baseSelectionValue, hoveredSelectionValue) {
      var range, start, end;

      if (selectionProcessing) {
         range = (baseSelectionValue > hoveredSelectionValue)
            ? [hoveredSelectionValue, baseSelectionValue] : [baseSelectionValue, hoveredSelectionValue];
         start = range[0];
         end = range[1];
      } else {
         start = startValue;
         end = endValue || start;
      }
      return [start, end];
   }
};

export default Utils;
