import Control = require('Core/Control');
import Env = require('Env/Env');
import {Date as WSDate, DateTime, Time} from 'Types/entity';
import Model = require('Controls/_input/DateTime/Model');
import {DATE_MASK_TYPE, DATE_TIME_MASK_TYPE, getMaskType, TIME_MASK_TYPE} from './DateTime/Utils';
import IDateTimeMask from 'Controls/_input/interface/IDateTimeMask';
import {
   ValueValidators,
   getDefaultOptions as getValueValidatorsDefaultOptions,
   getOptionTypes as getValueValidatorsOptionTypes
} from 'Controls/_input/interface/IValueValidators';
import proxyModelEvents from 'Controls/Utils/proxyModelEvents';
import {isValidDate, Container, InputContainer} from 'Controls/validate'
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
 * 
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FInput%2FDateTime%2FDateTime">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/input/date/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления</a>
 *
 * @class Controls/_input/DateTime
 * @extends Core/Control
 * @mixes Controls/interface/IInputDateTime
 * @mixes Controls/_input/interface/IDateTimeMask
 * @mixes Controls/interface/IInputTag
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/interface/IInputPlaceholder
 * @mixes Controls/_input/interface/IValueValidators
 *
 * @control
 * @public
 * @demo Controls-demo/Input/DateTime/DateTime
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
 * <a href="/materials/Controls-demo/app/Controls-demo%2FInput%2FDateTime%2FDateTime">Demo examples.</a>.
 *
 * @class Controls/_input/DateTime
 * @extends Core/Control
 * @mixes Controls/interface/IInputDateTime
 * @mixes Controls/_input/interface/IDateTimeMask
 * @mixes Controls/interface/IInputTag
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/interface/IInputPlaceholder
 * @mixes Controls/_input/interface/IValueValidators
 *
 * @control
 * @public
 * @demo Controls-demo/Input/DateTime/DateTime
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
   },
   _updateValidators: function(self, validators?: ValueValidators): void {
      const v: ValueValidators = validators || self._options.valueValidators;
      self._validators = [
         isValidDate.bind(null, {
            value: self._model.value
         }),
         ...v.map((validator) => {
            let
                _validator: Function,
               args: object;
            if (typeof validator === 'function') {
               _validator = validator
            } else {
               _validator = validator.validator;
               args = validator.arguments;
            }
            return _validator.bind(null, {
               ...(args || {}),
               value: self._model.value
            });
         })
      ];
   },
   _updateValidationController: function(self, options): void {
      self._validationContainer = options.validateByFocusOut ? InputContainer : Container;
   }
};

var Component = Control.extend([], {
   _template: template,
   _validationContainer: null,
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

   _validators: [],

   _beforeMount: function(options) {
      _private.updateDateConstructor(this, options);
      _private._updateValidationController(this, options);
      this._model = new Model({
         ...options,
         dateConstructor: this._dateConstructor
      });
      proxyModelEvents(this, this._model, ['valueChanged']);
      this._model.subscribe('valueChanged', () => {
         _private._updateValidators(this);
      });
      _private._updateValidators(this, options.valueValidators);
   },

   _beforeUpdate: function(options) {
      _private.updateDateConstructor(this, options, this._options);
      if (this._options.validateByFocusOut !== options.validateByFocusOut) {
         _private._updateValidationController(this, options);
      }
      if (options.value !== this._options.value) {
         this._model.update({
            ...options,
            dateConstructor: this._dateConstructor
         });
      }
      if(this._options.valuevalidators !== options.valueValidators || options.value !== this._options.value) {
         _private._updateValidators(this, options.valueValidators);
      }
   },

   _inputCompletedHandler: function(event, value, textValue) {
      event.stopImmediatePropagation();
      this._model.autocomplete(textValue, this._options.autocompleteType);
      this._notify('inputCompleted', [this._model.value, textValue]);
   },

   _valueChangedHandler: function(e, value, textValue) {
      // Контроллер валидаторов на той же ноде стреляет таким же событием но без второго аргумента.
      if (textValue !== undefined) {
         this._model.textValue = textValue;
      }
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

   getSplitValue: function() {
      return this._children.base.splitValue;
   },

   _beforeUnmount: function() {
      this._model.destroy();
   }
});

Component.getDefaultOptions = function() {
   return {
      ...IDateTimeMask.getDefaultOptions(),
      ...getValueValidatorsDefaultOptions(),
      autocompleteType: 'default'
   };
};

Component.getOptionTypes = function() {
   return {
      ...IDateTimeMask.getOptionTypes(),
      ...getValueValidatorsOptionTypes()
   };
};

export = Component;
