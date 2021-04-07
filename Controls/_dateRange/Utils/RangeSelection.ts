import {Base as DateUtil} from 'Controls/dateUtils';

const DEFAULT_CSS_CLASS_BASE = 'controls-RangeSelection';
const PERIOD_TYPE = {
   day: 'day',
   month: 'month',
   year: 'year'
};

type PeriodType = 'day' | 'month' | 'year';

interface IPeriodConfig {
   cssPrefix: string;
   periodQuantum: PeriodType;
}

const isPeriodsEqual = (date1: Date, date2: Date, cfg: IPeriodConfig): boolean => {
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

const Utils = {
   PERIOD_TYPE,

   /**
    * Returns a string containing css selection classes
    * @returns {String}
    */
   prepareSelectionClass: (itemValue: Date, startValue: Date, endValue: Date, selectionProcessing: boolean,
                           baseSelectionValue: Date, hoveredSelectionValue: Date, hoveredStartValue: Date,
                           hoveredEndValue: Date, cfg?: IPeriodConfig): string => {
      const css = [];
      let start;
      let end;
      let selected;
      let isStart;
      let isEnd;
      let range;

      if (!(startValue || startValue === null || endValue || endValue === null)
          && !selectionProcessing && !(hoveredStartValue || hoveredEndValue)) {
         return '';
      }

      range = Utils.getRange(startValue, endValue, selectionProcessing, baseSelectionValue, hoveredSelectionValue);
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

   isHovered: (itemValue: Date, hoveredSelectionValue: Date, hoveredStartValue: Date,
               hoveredEndValue: Date, cfg?: IPeriodConfig): boolean => {
      return isPeriodsEqual(itemValue, hoveredSelectionValue, cfg) ||
          (hoveredStartValue && hoveredEndValue && itemValue >= hoveredStartValue && itemValue <= hoveredEndValue);
   },

   prepareHoveredClass: (itemValue: Date, hoveredStartValue: Date, hoveredEndValue: Date,
                         cfg: IPeriodConfig): string => {
      if (Utils.isHovered(itemValue, hoveredStartValue, hoveredEndValue, cfg)) {
         return Utils.buildCssClass(cfg, ['hovered']);
      }
      return '';
   },

   buildCssClass: (cfg: IPeriodConfig, parts: string[]): string => {
      if (!parts.length) {
         return DEFAULT_CSS_CLASS_BASE;
      }
      return ((cfg && cfg.cssPrefix) || (DEFAULT_CSS_CLASS_BASE + '__')) + parts.join('-');
   },

   isSelected: (itemValue: Date, startValue: Date, endValue: Date, selectionProcessing: boolean,
                baseSelectionValue: Date, hoveredSelectionValue: Date): boolean => {
      const range = Utils.getRange(startValue, endValue, selectionProcessing,
          baseSelectionValue, hoveredSelectionValue);
      const start = range[0];
      const end = range[1];
      return start && end && itemValue >= start && itemValue <= end;
   },

   getRange: (startValue: Date, endValue: Date, selectionProcessing: boolean,
              baseSelectionValue: Date, hoveredSelectionValue: Date): Date[] => {
      let range;
      let start;
      let end;

      if (selectionProcessing) {
         range = (baseSelectionValue > hoveredSelectionValue && hoveredSelectionValue !== null)
            ? [hoveredSelectionValue, baseSelectionValue] : [baseSelectionValue, hoveredSelectionValue];
         start = range[0];
         end = range[1];
      } else {
         start = startValue;
         end = endValue;
      }
      return [start, end];
   }
};

export default Utils;
