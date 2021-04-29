import cExtend = require('Core/core-simpleExtend');
import entity = require('Types/entity');
import {INPUT_MODE} from 'Controls/_input/interface/IInputDisplayValue';
import StringValueConverter from 'Controls/_input/DateTime/StringValueConverter';
import {Base as dateUtils} from 'Controls/dateUtils';

const ALL_SPACES_REGEXP = /[ ]/g;
const VALID_PARTIAL_DATE_REGEXP = /^[0  ]{2}\.[0  ]{2}\.\d{2,4}$/;
const MONTH_DAY_PART_REGEXP = /^(.*)\.\d{2,4}$/;

   var _private = {
      updateLastValue: function(self) {
         if (dateUtils.isValidDate(self._value)) {
            self._lastValue = self._value;
         }
      },
      updateValue: function(self, value) {
         const oldValue = self._value,
            oldTextValue = self._textValue;
         self._value = value;

         _private.updateLastValue(self);
         self._textValue = self._stringValueConverter.getStringByValue(value);

         // если ничего не поменялось - не надо изменять версию
         if (oldValue !== value || oldTextValue !== self._textValue) {
            self._nextVersion();
         }
      },
      updateDisplayValue: function(self, displayValue) {
         const normalizedDisplayValue = displayValue.replace(ALL_SPACES_REGEXP, self._replacer);
         const oldTextValue = self._textValue;
         self._value = self._stringValueConverter.getValueByString(normalizedDisplayValue);
         self._textValue = normalizedDisplayValue;
         _private.updateLastValue(self);
         if (oldTextValue !== self._textValue) {
            self._nextVersion();
         }
      }
   };
   /**
    * Модель для контрола {@link Controls/input:Date}.
    *
    * @class Controls/_input/DateTime/Model
    *
    * @author Красильников А.С.
    * @public
    */

   /*
    * Model for 'Controls/input:Date' control.
    *
    * @class Controls/_input/DateTime/Model
    *
    * @author Красильников А.С.
    * @public
    */
   var ModuleClass = cExtend.extend([entity.ObservableMixin.prototype, entity.VersionableMixin], {
      _textValue: null,
      _value: null,
      _lastValue: null,
      _stringValueConverter: null,
      _mask: null,
      _inputMode: null,
      _replacer: ' ',

      constructor: function(options) {
         ModuleClass.superclass.constructor.apply(this, arguments);
         this._stringValueConverter = new StringValueConverter();
         this._stringValueConverter.update({
            replacer: this._replacer,
            mask: options.mask,
            dateConstructor: options.dateConstructor
         });
         this._mask = options.mask;
         this._inputMode = options.inputMode;
         if (options.displayValue) {
            this._textValue = options.displayValue.replace(ALL_SPACES_REGEXP, this._replacer);
            this._value = this._stringValueConverter.getValueByString(this._textValue);
         } else {
            this._value = options.value;
            this._textValue = this._stringValueConverter.getStringByValue(options.value);
         }
         this._lastValue = this._value;

      },

      /**
       * Updates model fields.
       * @param options
       */
      update: function(options) {
         this._stringValueConverter.update({
            replacer: this._replacer,
            mask: options.mask,
            dateConstructor: options.dateConstructor,
            yearSeparatesCenturies: options._yearSeparatesCenturies
         });
         if (this._mask !== options.mask || !dateUtils.isDatesEqual(this._value, options.value) || this._displayValue !== options.displayValue) {
            this._mask = options.mask;
            if (options.displayValue) {
               _private.updateDisplayValue(this, options.displayValue)
            } else {
               _private.updateValue(this, options.value);
            }
         }
      },

      /**
       * Value as a Date object
       * @returns {Date}
       */
      get value() {
         return this._value;
      },

      set value(value) {
         if (dateUtils.isDatesEqual(this._value, value)) {
            return;
         }
         _private.updateValue(this, value);
         this._notify('valueChanged', [value, this.displayValue]);
      },

      /**
       * Value as a string.
       * @returns {String}
       */
      get textValue() {
         return this._textValue;
      },

      set textValue(value) {
         let newValue;
         if (this._textValue === value) {
            return;
         }
         this._nextVersion();
         this._textValue = value;
         newValue = this._stringValueConverter.getValueByString(value, this._lastValue);

         const valueChanged = !dateUtils.isDatesEqual(this._value, newValue);

         if (valueChanged) {
            this._value = newValue;
            this._nextVersion();

            _private.updateLastValue(this);
            this._notify('valueChanged', [this._value, this.displayValue]);
         }

         if (valueChanged || this._inputMode === INPUT_MODE.partial) {
            this._notify('valueChanged', [this._value, this.displayValue]);
         }

      },

      get displayValue(): string {
         return this._textValue.replace(RegExp(this._replacer, 'g'), ' ');
      },

      /**
       * Value as a string without delimiters.
       * @returns {String}
       */
      get clearTextValue() {
         return this._textValue.replace(/[ -.:]/g, '');
      },

      /**
       * Autocomplete not full text value.
       * @param textValue
       */
      autocomplete: function(textValue, autocompleteType) {
         this._nextVersion();
         this._textValue = textValue;
         this.value = this._stringValueConverter.getValueByString(textValue, this._lastValue, autocompleteType, this._inputMode);
         if (dateUtils.isValidDate(this.value)) {
            this._textValue = this._stringValueConverter.getStringByValue(this.value);
         } else if (this._inputMode === INPUT_MODE.partial && !!this._textValue.match(VALID_PARTIAL_DATE_REGEXP)) {
            const monthDayPart = this._textValue.match(MONTH_DAY_PART_REGEXP);
            if (monthDayPart && monthDayPart[1].includes('0')) {
               this._textValue = this._textValue.replace(RegExp(this._replacer, 'g'), '0');
               this._notify('valueChanged', [this._value, this.displayValue]);
            }
         }
      },
      setCurrentDate: function() {
         this.value = this._stringValueConverter.getCurrentDate(this._lastValue, this._mask);
      }

   });

   export = ModuleClass;

