import Control = require('Core/Control');
import Env = require('Env/Env');
import coreMerge = require('Core/core-merge');
import {Date as WSDate, DateTime, Time} from 'Types/entity';
import Model = require('Controls/_input/DateTime/Model');
import {DATE_MASK_TYPE, DATE_TIME_MASK_TYPE, getMaskType, TIME_MASK_TYPE} from './DateTime/Utils';
import IDateTimeMask from 'Controls/_input/interface/IDateTimeMask';
import proxyModelEvents from 'Controls/Utils/proxyModelEvents';
import tmplNotify = require('Controls/Utils/tmplNotify');
import template = require('wml!Controls/_input/DateTime/DateTime');

/**
 * Базовое универсальное поле ввода даты и времени. Позволяет вводить дату и время одновременно или по отдельности. Данные вводятся только с помощью клавиатуры.
 * @remark
 * В зависимости от маски может использоваться для ввода:
 * <ol>
 *    <li>даты;</li>
 *    <li>времени;</li>
 *    <li>даты и времени.</li>
 * </ol>
 * <a href="/materials/demo-ws4-input-datetime">Демо-пример</a>.
 *
 * @class Controls/_input/DateTime
 * @extends Core/Control
 * @mixes Controls/interface/IInputDateTime
 * @mixes Controls/_input/interface/IDateTimeMask
 * @mixes Controls/interface/IInputTag
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/interface/IInputPlaceholder
 *
 * @control
 * @public
 * @demo Controls-demo/Input/DateTime/DateTimePG
 * @author Красильников А.С.
 * @category Input
 */

/*
 * Control for entering date and time.
 * Depending on {@link mask mask} can be used to enter:
 * <ol>
 *    <li>just date,</li>
 *    <li>just time,</li>
 *    <li>date and time.</li>
 * </ol>
 * <a href="/materials/demo-ws4-input-datetime">Demo examples.</a>.
 *
 * @class Controls/_input/DateTime
 * @extends Core/Control
 * @mixes Controls/interface/IInputDateTime
 * @mixes Controls/_input/interface/IDateTimeMask
 * @mixes Controls/interface/IInputTag
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/interface/IInputPlaceholder
 *
 * @control
 * @public
 * @demo Controls-demo/Input/DateTime/DateTimePG
 * @author Красильников А.С.
 * @category Input
 */

const _private = {
   updateDateConstructor: function(self, options, oldOptions): void {
      if (!oldOptions || options.mask !== oldOptions.mask) {
          self._dateConstructor = options.dateConstructor || _private._getDateConstructor(options.mask);
      }
   },
   _getDateConstructor: function(mask): Function {
      const dateConstructorMap = {
         [DATE_MASK_TYPE]: WSDate,
         [DATE_TIME_MASK_TYPE]: DateTime,
         [TIME_MASK_TYPE]: Time
      };
      return dateConstructorMap[getMaskType(mask)];
  }
};

var Component = Control.extend([], {
   _template: template,
   _proxyEvent: tmplNotify,
   _dateConstructor: null,

   _formatMaskChars: {
      'D': '[0-9]',
      'M': '[0-9]',
      'Y': '[0-9]',
      'H': '[0-9]',
      'm': '[0-9]',
      's': '[0-9]',
      'U': '[0-9]'
   },

   _model: null,

   _beforeMount: function(options) {
      _private.updateDateConstructor(this, options);
      this._model = new Model({
         ...options,
         dateConstructor: this._dateConstructor
      });
      proxyModelEvents(this, this._model, ['valueChanged']);
   },

   _beforeUpdate: function(options) {
      _private.updateDateConstructor(this, options, this._options);
      if (options.value !== this._options.value) {
         this._model.update({
            ...options,
            dateConstructor: this._dateConstructor
         });
      }
   },

   _inputCompletedHandler: function(event, value, textValue) {
      event.stopImmediatePropagation();
      this._model.autocomplete(textValue, this._options.autocompleteType);
      this._notify('inputCompleted', [this._model.value, textValue]);
   },

   _valueChangedHandler: function(e, value, textValue) {
      this._model.textValue = textValue;
      e.stopImmediatePropagation();
   },
   _onKeyDown: function(event) {
      var key = event.nativeEvent.keyCode;
      if (key === Env.constants.key.insert && !event.nativeEvent.shiftKey && !event.nativeEvent.ctrlKey) {
      // on Insert button press current date should be inserted in field
         this._model.setCurrentDate();
         this._notify('inputCompleted', [this._model.value, this._model.textValue]);
      }
      if (key === Env.constants.key.plus || key === Env.constants.key.minus) {
      //on +/- buttons press date should be increased or decreased in field by one day if date is not empty
         if (this._model.value) {
            var delta = key === Env.constants.key.plus ? 1 : -1;
            var localDate = new this._dateConstructor(this._model.value);
            localDate.setDate(this._model.value.getDate() + delta);
            this._model.value = localDate;
         }
      }
   },

   _beforeUnmount: function() {
      this._model.destroy();
   }
});

Component.getDefaultOptions = function() {
   return coreMerge({
      autocompleteType: 'default'
   }, IDateTimeMask.getDefaultOptions());
};

Component.getOptionTypes = function() {
   return coreMerge({}, IDateTimeMask.getOptionTypes());
};

export = Component;
