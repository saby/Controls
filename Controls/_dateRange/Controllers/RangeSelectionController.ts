import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as coreMerge from 'Core/core-merge';
import * as coreClone from 'Core/core-clone';
import RangeSelectrionControllerTmpl = require('wml!Controls/_dateRange/Controllers/RangeSelectionController');
import IRangeSelectable from './../interfaces/IRangeSelectable';

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
 * @extends UI/Base:Control
 * @mixes Controls/dateRange:IRangeSelectable
 * @author Красильников А.С.
 * @public
 */

export default class RangeSelectionController extends Control<IControlOptions> {
   _template: TemplateFunction = RangeSelectrionControllerTmpl;

   _state: IControlOptions;
   _selectionType: string;

   _selectionProcessing: boolean;
   _displayedStartValue: Date;
   _displayedEndValue: Date;
   _selectionBaseValue: Date;
   _selectionHoveredValue: Date;
   _hoveredStartValue: Date;
   _hoveredEndValue: Date;

   _startValue: Date;
   _endValue: Date;

   _rangeSelectedCallback: Function;

   protected _beforeMount(options): void {
      // Приводим копию опций к нормальному виду что бы однотипно работать с ними.
      // Сохраняем старые нормализованные опции в поле _state.
      options = coreMerge({}, options);
      this._prepareState(options);
      this._state = options;
      this._selectionType = options.selectionType;
      this._startValue = options.startValue;
      this._endValue = options.endValue;
      this._rangeSelectedCallback = options.rangeSelectedCallback;
      this._selectionProcessing = options.selectionProcessing;
      this._displayedStartValue = options.displayedStartValue || this._startValue;
      this._displayedEndValue = options.displayedEndValue || this._endValue;
      this._selectionBaseValue = options.selectionBaseValue;
      this._selectionHoveredValue = options.selectionHoveredValue;
      this._hoveredStartValue = options.hoveredStartValue;
      this._hoveredEndValue = options.hoveredEndValue;
   }

   protected _beforeUpdate(options): void {
      let isSelectionProcessingExtChanged,
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
         this._updateDisplayedRange();
      }
   }

   /**
    * Обработчик клика на элементы которые могут быть выделены. Это событие должно генерировать представление
    * переданное через опцию view.
    * @param event {*}
    * @param item {*} Объект соответствующий элементу.
    */
   protected _itemClickHandler(event, item): void {
      if (this._options.readOnly) {
         return;
      }
      if (this._state.selectionType === RangeSelectionController.SELECTION_TYPES.range) {
         this._processRangeSelection(item);
      } else if (this._state.selectionType === RangeSelectionController.SELECTION_TYPES.single) {
         this._processSingleSelection(item);
      }
   }

   /**
    * Обработчик mouseEnter на элементы которые могут быть выделены. Это событие должно генерировать представление
    * переданное через опцию view.
    * @param event {*}
    * @param item {*} Объект соответствующий элементу.
    * @private
    */
   protected _itemMouseEnterHandler(event, item): void {
      let range;
      if (this._options.readOnly) {
         return;
      }
      if (this._selectionProcessing) {
         this._selectionHoveredValue = item;
         if (this._updateDisplayedRange()) {
            // Если выбор периода происходит через кванты, то мы должны выделить весь период целиком,
            // а не только до того элемента, на который мы наводим в данный момент.
            if (this._options.selectionType === 'quantum') {
                if (item.getTime() < this._selectionBaseValue.getTime()) {
                    this._selectionHoveredValue = this._displayedStartValue;
                } else {
                    this._selectionHoveredValue = this._displayedEndValue;
                }
            }
            this._notify('selectionHoveredValueChanged', [this._selectionHoveredValue]);
            this._notify('selectionChanged', [this._displayedStartValue, this._displayedEndValue]);
            this._startValue = this._displayedStartValue;
            this._endValue = this._displayedEndValue;
            this._notify('rangeChanged', [this._startValue, this._endValue]);
         }
      } else {
         range = this._getDisplayedRangeEdges(item);
         this._hoveredStartValue = range[0];
         this._hoveredEndValue = range[1];
         this._notify('hoveredStartValueChanged', [this._hoveredStartValue]);
         this._notify('hoveredEndValueChanged', [this._hoveredEndValue]);
      }
   }

   protected _itemMouseLeaveHandler(event, item): void {
      if (this._options.readOnly) {
         return;
      }
      this._hoveredStartValue = null;
      this._hoveredEndValue = null;
   }

   protected _mouseleaveHandler(): void {
      if (this._selectionProcessing) {
         this._selectionHoveredValue = this._clone(this._selectionBaseValue);
         if (this._updateDisplayedRange()) {
            this._notify('selectionHoveredValueChanged', [this._selectionHoveredValue]);
            this._notify('selectionChanged', [this._displayedStartValue, this._displayedEndValue]);
            this._startValue = this._displayedStartValue;
            this._endValue = this._displayedEndValue;
            this._notify('rangeChanged', [this._startValue, this._endValue]);
         }
      }
   }

   /**
    * Подготавливает объект с оициями перед тем как обновлять состояние контроллера.
    * @param state
    * @private
    */
   protected _prepareState(state): void {
   }

   /**
    * Проверяет изменилась ли опция извне.
    * @param valueName название опции
    * @param options новые опции
    * @param oldOptions старые опции
    * @returns {boolean} Если опция пришла извне, т.е. если это не одно и то же значение при одностороннем бинде
    * или это не новое значение которое пришло при двустороннем банде.
    * @private
    */
   protected _isExternalChanged(valueName, options, oldOptions): boolean {
      return options.hasOwnProperty(valueName) &&
          oldOptions[valueName] === this['_' + valueName] && oldOptions[valueName] !== options[valueName];
   }

   protected _processRangeSelection(item): boolean {
      if (this._selectionProcessing) {
         this._stopRangeSelection(item);
      } else {
         this._startRangeSelection(item);
      }
   }

   protected _processSingleSelection(item): void {
      let range = this._getDisplayedRangeEdges(item);
      this._selectionBaseValue = null;
      this._selectionHoveredValue = null;
      this._startValue = this._displayedStartValue = range[0];
      this._endValue = this._displayedEndValue = range[1];
      this._notify('selectionChanged', [this._displayedStartValue, this._displayedEndValue]);
      this._notify('rangeChanged', [this._startValue, this._endValue]);
      this._notify('selectionEnded', [this._displayedStartValue, this._displayedEndValue]);
   }

   /**
    * Возвращает отображаемый диапазон по элементу.
    * @param item
    * @returns {*[]}
    * @private
    */
   protected _getDisplayedRangeEdges(item): [] {
      if (this._selectionType === RangeSelectionController.SELECTION_TYPES.single) {
         return [item, this._clone(item)];
      }
      if (!this._selectionBaseValue) {
         return [item, this._clone(item)];
      } else if (item > this._selectionBaseValue) {
         return [this._selectionBaseValue, item];
      } else {
         return [item, this._selectionBaseValue];
      }
   }

   private _onSelectionProcessingChanged(e, value): void {
      if (!value) {
         this._selectionBaseValue = null;
         this._selectionHoveredValue = null;
         this._notify('selectionBaseValueChanged', [null]);
         this._notify('selectionHoveredValueChanged', [null]);
      }
   }

   isSelectionProcessing(): boolean {
      return this._selectionProcessing;
   }
   getDisplayedStartValue(): Date {
      return this._displayedStartValue;
   }
   getDisplayedEndValue(): Date {
      return this._displayedEndValue;
   }
   getSelectionBaseValue(): Date {
      return this._selectionBaseValue;
   }
   getSelectionHoveredValue(): Date {
      return this._selectionHoveredValue;
   }

   getStartValue(): Date {
      return this._startValue;
   }
   getEndValue(): Date {
      return this._endValue;
   }

   /**
    * Начинает выделение диапазона
    * @param item элемент с которого начали выделение
    * @protected
    */
   private _startRangeSelection(item): void {
      let range = this._getDisplayedRangeEdges(item),
          start = range[0],
          end = range[1];

      this._notify('onBeforeSelectionStarted', [start, end]);
      this._selectionProcessing = true;
      this._selectionBaseValue = item;
      this._selectionHoveredValue = item;
      this._startValue = this._displayedStartValue = start;
      this._endValue = this._displayedEndValue = end;

      this._notifyAllDataChanged();
   }

   /**
    * Завершает выделение диапазона
    * @param item элемент на котором заканчивают выделение
    * @protected
    */
   private _stopRangeSelection(item): void {
      let range = this._getDisplayedRangeEdges(item);
      this._notify('beforeSelectionEnded', [range[0], range[1]]);
      this._selectionProcessing = false;
      this._selectionBaseValue = null;
      this._selectionHoveredValue = null;
      this._startValue = this._displayedStartValue = range[0];
      this._endValue = this._displayedEndValue = range[1];

      this._notifyAllDataChanged();
      this._notify('selectionEnded', [range[0], range[1]]);
   }

   private _notifyAllDataChanged(): void {
      this._notify('selectionChanged', [this._displayedStartValue, this._displayedEndValue]);
      this._notify('rangeChanged', [this._startValue, this._endValue]);
      this._notify('startValueChanged', [this._startValue]);
      this._notify('endValueChanged', [this._endValue]);
      this._notify('selectionProcessingChanged', [this._selectionProcessing]);
      this._notify('selectionBaseValueChanged', [this._selectionBaseValue]);
      this._notify('selectionHoveredValueChanged', [this._selectionHoveredValue]);
   }

   /**
    * Синхронизирует отображаемый диапазон(displayedStartValue, displayedEndValue) по состоянию контроллера.
    * @returns {boolean}
    * @private
    */
   private _updateDisplayedRange(): boolean {
      let range;
      if (this._selectionProcessing) {
         range = this._getDisplayedRangeIfChanged(this._selectionHoveredValue);
      } else {
         range = [this._startValue, this._endValue];
      }
      if (!range) {
         return false;
      }
      this._displayedStartValue = range[0];
      this._displayedEndValue = range[1];
      return true;
   }

   /**
    * Возвращает отображаемый диапазон если он изменился иначе возвращает undefined
    * @param item
    * @returns {*|*[]}
    * @private
    */
   private _getDisplayedRangeIfChanged(item): [] {
      let range = this._getDisplayedRangeEdges(item);
      if (this._displayedStartValue !== range[0] || this._displayedEndValue !== range[1]) {
         return range;
      }
   }
   private _clone(obj: Date): Date {
      if (obj instanceof Date) {
         return new obj.constructor(obj);
      }
      return coreClone(obj);
   }

   static SELECTION_TYPES: string = IRangeSelectable.SELECTION_TYPES;

   static getOptionTypes(): object {
      return coreMerge({}, IRangeSelectable.getOptionTypes());
   }

   static getDefaultOptions(): object {
      return coreMerge({

         /**
          * @name Controls/_dateRange/Controllers/RangeSelectionController#content
          * @cfg {String} представление которым управлят контроллер
          */
         content: undefined
      }, IRangeSelectable.getDefaultOptions());
   }
}

Object.defineProperty(RangeSelectionController, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return RangeSelectionController.getDefaultOptions();
   }
});
