import BaseControl = require('Core/Control');
import coreMerge = require('Core/core-merge');
import coreClone = require('Core/core-clone');
import RangeSelectrionControllerTmpl = require('wml!Controls/_dateRange/Controllers/RangeSelectionController');
import IRangeSelectable from "./../interfaces/IRangeSelectable";

var _private = {

   /**
    * Начинает выделение диапазона
    * @param item элемент с которого начали выделение
    * @protected
    */
   startRangeSelection: function(self, item) {
      var range = self._getDisplayedRangeEdges(item),
         start = range[0],
         end = range[1];

      self._notify('onBeforeSelectionStarted', [start, end]);
      self._selectionProcessing = true;
      self._selectionBaseValue = item;
      self._selectionHoveredValue = item;
      self._startValue = self._displayedStartValue = start;
      self._endValue = self._displayedEndValue = end;

      _private.notifyAllDataChanged(self);
   },

   /**
    * Завершает выделение диапазона
    * @param item элемент на котором заканчивают выделение
    * @protected
    */
   stopRangeSelection: function(self, item) {
      var range = self._getDisplayedRangeEdges(item);
      if (self._startValue === range[0] && self._endValue === range[1]) {
         return;
      }
      self._notify('beforeSelectionEnded', [range[0], range[1]]);
      self._selectionProcessing = false;
      self._selectionBaseValue = null;
      self._selectionHoveredValue = null;
      self._startValue = self._displayedStartValue = range[0];
      self._endValue = self._displayedEndValue = range[1];

      self._notify('selectionEnded', [range[0], range[1]]);
      _private.notifyAllDataChanged(self);
   },

   notifyAllDataChanged: function(self) {
      self._notify('selectionChanged', [self._displayedStartValue, self._displayedEndValue]);
      self._notify('rangeChanged', [self._startValue, self._endValue]);
      self._notify('startValueChanged', [self._startValue]);
      self._notify('endValueChanged', [self._endValue]);
      self._notify('selectionProcessingChanged', [self._selectionProcessing]);
      self._notify('selectionBaseValueChanged', [self._selectionBaseValue]);
      self._notify('selectionHoveredValueChanged', [self._selectionHoveredValue]);
   },

   /**
    * Синхронизирует отображаемый диапазон(displayedStartValue, displayedEndValue) по состоянию контроллера.
    * @returns {boolean}
    * @private
    */
   updateDisplayedRange: function(self) {
      var range;
      if (self._selectionProcessing) {
         range = _private.getDisplayedRangeIfChanged(self, self._selectionHoveredValue);
      } else {
         range = [self._startValue, self._endValue];
      }
      if (!range) {
         return false;
      }
      self._displayedStartValue = range[0];
      self._displayedEndValue = range[1];
      return true;
   },

   /**
    * Возвращает отображаемый диапазон если он изменился иначе возвращает undefined
    * @param item
    * @returns {*|*[]}
    * @private
    */
   getDisplayedRangeIfChanged: function(self, item) {
      var range = self._getDisplayedRangeEdges(item);
      if (self._displayedStartValue !== range[0] || self._displayedEndValue !== range[1]) {
         return range;
      }
   },
   clone: function(obj) {
      if (obj instanceof Date) {
         return new obj.constructor(obj);
      }
      return coreClone(obj);
   }
};

/**
 * Контроллер, реализующий выделение элементов от одного до другого.
 * В качестве элементов могут использоваться любые значения, поддерживающие операции < и >, например числа.
 *
 * Компонент, которым управляет контроллер, должен поддерживать опции startValue и endValue.
 * Это значения элементов, от которого и до которого в данный момент выделен диапазон.
 * Так же компонент должен поддерживать события itemClick и itemMouseEnter.
 * Эти события должны передавать в качестве параметра значения элементов, с которыми в данный момент происходит взаимодействие.
 *
 * @class Controls/_dateRange/Controllers/RangeSelectionController
 * @extends Core/Control
 * @mixes Controls/_dateRange/interfaces/IRangeSelectable
 * @author Красильников А.С.
 */
var Component = BaseControl.extend({
   _template: RangeSelectrionControllerTmpl,

   _state: null,
   _selectionType: null,

   _selectionProcessing: false,
   _displayedStartValue: null,
   _displayedEndValue: null,
   _selectionBaseValue: null,
   _selectionHoveredValue: null,
   _hoveredStartValue: null,
   _hoveredEndValue: null,

   _startValue: null,
   _endValue: null,

   _beforeMount: function(options) {
      // Приводим копию опций к нормальному виду что бы однотипно работать с ними.
      // Сохраняем старые нормализованные опции в поле _state.
      options = coreMerge({}, options);
      this._prepareState(options);
      this._state = options;
      this._selectionType = options.selectionType;
      this._startValue = options.startValue;
      this._endValue = options.endValue;

      this._selectionProcessing = options.selectionProcessing;
      this._displayedStartValue = options.displayedStartValue || this._startValue;
      this._displayedEndValue = options.displayedEndValue || this._endValue;
      this._selectionBaseValue = options.selectionBaseValue;
      this._selectionHoveredValue = options.selectionHoveredValue;
      this._hoveredStartValue = options.hoveredStartValue;
      this._hoveredEndValue = options.hoveredEndValue;
   },

   _beforeUpdate: function(options) {
      var isSelectionProcessingExtChanged,
         changed;

      options = coreMerge({}, options);

      // options = {
      //    startValue: options.startValue,
      //    endValue: options.endValue,
      //    displayedStartValue: options.startValue,
      //    displayedEndValue: options.displayedEndValue,
      //    selectionType: options.selectionType
      // };

      this._prepareState(options);

      isSelectionProcessingExtChanged = this._isExternalChanged('selectionProcessing', options, this._state);

      // Обновляем состояние только если значение опции поменяли извне. Например при одностороннем
      // бинденге значение опции всегда приходит одно и то же, несмотря на то, что состояние компоннета изменилось
      // из-за действий пользователя. При двустороннем биндинге значение опций меняется, но состояние менять не надо.
      if (this._isExternalChanged('startValue', options, this._state)) {
         this._startValue = options.startValue;
         changed = true;
      }
      if (this._isExternalChanged('endValue', options, this._state)) {
         this._endValue = options.endValue;
         changed = true;
      }

      if (this._isExternalChanged('selectionBaseValue', options, this._state)) {
         this._selectionBaseValue = options.selectionBaseValue;
         changed = true;
      }

      if (this._isExternalChanged('selectionHoveredValue', options, this._state)) {
         this._selectionHoveredValue = options.selectionHoveredValue;
         changed = true;
      }

      if (isSelectionProcessingExtChanged) {
         this._selectionProcessing = options.selectionProcessing;
         if (!this._selectionProcessing) {
            this._selectionBaseValue = null;
            this._selectionHoveredValue = null;
            this._displayedStartValue = this._startValue;
            this._displayedEndValue = this._endValue;
         }
      }

      this._state = options;

      if (changed) {
         _private.updateDisplayedRange(this);
      }
   },

   /**
    * Обработчик клика на элементы которые могут быть выделены. Это событие должно генерировать представление
    * переданное через опцию view.
    * @param event {*}
    * @param item {*} Объект соответствующий элементу.
    */
   _itemClickHandler: function(event, item) {
      if (this._options.readOnly) {
         return;
      }
      if (this._state.selectionType === Component.SELECTION_TYPES.range) {
         this._processRangeSelection(item);
      } else if (this._state.selectionType === Component.SELECTION_TYPES.single) {
         this._processSingleSelection(item);
      }
   },

   /**
    * Обработчик mouseEnter на элементы которые могут быть выделены. Это событие должно генерировать представление
    * переданное через опцию view.
    * @param event {*}
    * @param item {*} Объект соответствующий элементу.
    * @private
    */
   _itemMouseEnterHandler: function(event, item) {
      var range;
      if (this._options.readOnly) {
         return;
      }
      if (this._selectionProcessing) {
         this._selectionHoveredValue = item;
         if (_private.updateDisplayedRange(this, item)) {
            this._notify('selectionHoveredValueChanged', [this._selectionHoveredValue]);
            this._notify('selectionChanged', [this._displayedStartValue, this._displayedEndValue]);
         }
      } else {
         range = this._getDisplayedRangeEdges(item);
         this._hoveredStartValue = range[0];
         this._hoveredEndValue = range[1];
         this._notify('hoveredStartValueChanged', [this._hoveredStartValue]);
         this._notify('hoveredEndValueChanged', [this._hoveredEndValue]);
      }
   },

   _itemMouseLeaveHandler: function(event, item) {
      if (this._options.readOnly) {
         return;
      }
      this._hoveredStartValue = null;
      this._hoveredEndValue = null;
   },

   _mouseleaveHandler: function(): void {
      if (this._selectionProcessing) {
         this._selectionHoveredValue = _private.clone(this._selectionBaseValue);
         if (_private.updateDisplayedRange(this)) {
            this._notify('selectionHoveredValueChanged', [this._selectionHoveredValue]);
            this._notify('selectionChanged', [this._displayedStartValue, this._displayedEndValue]);
         }
      }
   },

   /**
    * Подготавливает объект с оициями перед тем как обновлять состояние контроллера.
    * @param state
    * @private
    */
   _prepareState: function(state) {
   },

   /**
    * Проверяет изменилась ли опция извне.
    * @param valueName название опции
    * @param options новые опции
    * @param oldOptions старые опции
    * @returns {boolean} Если опция пришла извне, т.е. если это не одно и то же значение при одностороннем бинде
    * или это не новое значение которое пришло при двустороннем банде.
    * @private
    */
   _isExternalChanged: function(valueName, options, oldOptions) {
      return options.hasOwnProperty(valueName) &&
         oldOptions[valueName] === this['_' + valueName] && oldOptions[valueName] !== options[valueName];
   },

   _processRangeSelection: function(item) {
      if (this._selectionProcessing) {
         _private.stopRangeSelection(this, item);
      } else {
         _private.startRangeSelection(this, item);
      }
   },

   _processSingleSelection: function(item) {
      var range = this._getDisplayedRangeEdges(item);
      this._selectionBaseValue = null;
      this._selectionHoveredValue = null;
      this._startValue = this._displayedStartValue = range[0];
      this._endValue = this._displayedEndValue = range[1];
      this._notify('selectionChanged', [this._displayedStartValue, this._displayedEndValue]);
      this._notify('rangeChanged', [this._startValue, this._endValue]);
      this._notify('selectionEnded', [this._displayedStartValue, this._displayedEndValue]);
   },

   /**
    * Возвращает отображаемый диапазон по элементу.
    * @param item
    * @returns {*[]}
    * @private
    */
   _getDisplayedRangeEdges: function(item) {
      if (this._selectionType === Component.SELECTION_TYPES.single) {
         return [item, _private.clone(item)];
      }
      if (!this._selectionBaseValue) {
         return [item, _private.clone(item)];
      } else if (item > this._selectionBaseValue) {
         return [this._selectionBaseValue, item];
      } else {
         return [item, this._selectionBaseValue];
      }
   },

   _onSelectionProcessingChanged: function(e, value) {
      if (!value) {
         this._selectionBaseValue = null;
         this._selectionHoveredValue = null;
         this._notify('selectionBaseValueChanged', [null]);
         this._notify('selectionHoveredValueChanged', [null]);
      }
   },

   isSelectionProcessing: function() {
      return this._selectionProcessing;
   },
   getDisplayedStartValue: function() {
      return this._displayedStartValue;
   },
   getDisplayedEndValue: function() {
      return this._displayedEndValue;
   },
   getSelectionBaseValue: function() {
      return this._selectionBaseValue;
   },
   getSelectionHoveredValue: function() {
      return this._selectionHoveredValue;
   },

   getStartValue: function() {
      return this._startValue;
   },
   getEndValue: function() {
      return this._endValue;
   }
});

Component.SELECTION_TYPES = IRangeSelectable.SELECTION_TYPES;

Component.getDefaultOptions = function() {
   return coreMerge({

      /**
       * @name Controls/_dateRange/Controllers/RangeSelectionController#content
       * @cfg {String} представление которым управлят контроллер
       */
      content: undefined
   }, IRangeSelectable.getDefaultOptions());
};

Component.getOptionTypes = function() {
   return coreMerge({}, IRangeSelectable.getOptionTypes());
};

export default Component;
