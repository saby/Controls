import coreMerge = require('Core/core-merge');
import RangeSelectionController from './RangeSelectionController';
import IDateRangeSelectable = require('Controls/_dateRange/interfaces/IDateRangeSelectable');
import CalendarUtils from './../Utils';
import DateUtil = require('Controls/Utils/Date');

/**
 * Контроллер, реализующий выделение элементов от одного до другого. В качестве элементов используются даты.
 * Поддерживает выделение квантами кратными дням, неделям, месяцам.
 *
 * Компонент, которым управляет контроллер, должен поддерживать опции startValue и endValue. Это значения элементов,
 * от которого и до которого в данный момент выделен диапазон. Так же компонент должен поддерживать события
 * itemClick и itemMouseEnter. Эти события должны передавать в качестве параметра значения элементов, с которыми
 * в данный момент происходит взаимодействие.
 *
 * @class Controls/_dateRange/Controllers/DateRangeSelectionController
 * @extends Controls/_dateRange/Controllers/RangeSelectionController
 * @author Красильников А.С.
 * @public
 */
var Component = RangeSelectionController.extend({
   _beforeMount: function(options) {
      var quantum = options.quantum || [];
      this._quantum = quantum;
      this._isSingleQuant = options.selectionType === Component.SELECTION_TYPES.quantum &&
         Object.keys(quantum).length === 1 &&
         Object.keys([Object.keys(quantum)[0]]).length === 1;

      Component.superclass._beforeMount.apply(this, arguments);
   },

   // _beforeUpdate: function(options) {
   // },

   _prepareState: function(state) {
      if (state.hasOwnProperty('startValue')) {
         state.startValue = DateUtil.normalizeDate(state.startValue);
      }
      if (state.hasOwnProperty('endValue')) {
         state.endValue = DateUtil.normalizeDate(state.endValue);
      }
      if (state.hasOwnProperty('selectionBaseValue')) {
         state.selectionBaseValue = DateUtil.normalizeDate(state.selectionBaseValue);
      }
      if (state.hasOwnProperty('selectionHoveredValue')) {
         state.selectionHoveredValue = DateUtil.normalizeDate(state.selectionHoveredValue);
      }

      Component.superclass._prepareState.call(this, state);
   },

   _isExternalChanged: function(valueName, options, oldOptions) {
      return options.hasOwnProperty(valueName) &&

         // DateUtil.isDatesEqual(oldOptions[valueName], this['_' + valueName]) &&
         !DateUtil.isDatesEqual(oldOptions[valueName], options[valueName]);
   },

   _itemClickHandler: function(event, item) {
      if (this._state.selectionType === Component.SELECTION_TYPES.quantum) {
         // this._processRangeSelection(item);
         if (this._isSingleQuant) {
            this._processSingleSelection(item);
         } else {
            this._processRangeSelection(item);
         }
      } else {
         Component.superclass._itemClickHandler.apply(this, arguments);
      }
   },

   _getDisplayedRangeEdges: function(item) {
      if (this._selectionType !== Component.SELECTION_TYPES.quantum) {
         return Component.superclass._getDisplayedRangeEdges.apply(this, arguments);
      }

      return CalendarUtils.updateRangeByQuantum(this.getSelectionBaseValue() || item, item, this._quantum);
   }
});

Component.SELECTION_TYPES = IDateRangeSelectable.SELECTION_TYPES;

Component.getDefaultOptions = function() {
   return coreMerge({}, IDateRangeSelectable.getDefaultOptions());
};

Component.getOptionTypes = function() {
   return coreMerge({}, IDateRangeSelectable.getOptionTypes());
};

export default Component;
