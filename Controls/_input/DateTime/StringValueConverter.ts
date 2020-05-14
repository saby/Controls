import cExtend = require('Core/core-simpleExtend');
import formatter = require('Types/formatter');
import {dateMaskConstants} from 'Controls/interface';
import dateUtils = require('Controls/Utils/Date');
import {DateTime} from 'Types/entity';
import {getMaskType, DATE_MASK_TYPE, DATE_TIME_MASK_TYPE, TIME_MASK_TYPE, DEFAULT_YEAR_NUM} from './Utils';

var _private = {
   maskMap: {
      YY: 'year', YYYY: 'year', MM: 'month', DD: 'date', HH: 'hours', mm: 'minutes', ss: 'seconds'
   },

   reAllMaskChars: /[YMDHms]+|[. :-]/g,
   reDateTimeMaskChars: /[YMDHms]+/,
   reNumbers: /\d/,
   maskRegExp: /^(?:(\d{1,2})(?:\.(\d{1,2})(?:\.((?:\d{2})|(?:\d{4})))?)?)?(?: ?(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?)?$/,

   isFilled: function(self, value) {
      return value && value.indexOf(self._replacer) === -1;
   },

   isEmpty: function(value) {
      return !_private.reNumbers.test(value);
   },

   isPartlyFilled: function(self, value) {
      return value && _private.reNumbers.test(value) && value.indexOf(self._replacer) > -1;
   },

   isValueModelFilled: function(valueModel) {
      for (var value in valueModel) {
         if (valueModel.hasOwnProperty(value) && valueModel[value].valid === false) {
            return false;
         }
      }
      return true;
   },

   getFullYearBy2DigitsYear: function(valueYear) {
      var
          curYear = (new Date()).getFullYear(),
          shortCurYear = curYear % 100,
          curCentury = (curYear - shortCurYear);

      // Если год задаётся двумя числами, то считаем что это текущий век
      // если год меньше или равен текущему году + 10, иначе это прошлый век.
      return valueYear <= shortCurYear + 10 ? curCentury + valueYear : (curCentury - 100) + valueYear;
   },

   parseString: function(self, str) {
      var valueModel = {
            year: { str: null, value: DEFAULT_YEAR_NUM, valid: false },
            month: { str: null, value: 0, valid: false },
            date: { str: null, value: 1, valid: false },
            hours: { str: null, value: 0, valid: false },
            minutes: { str: null, value: 0, valid: false },
            seconds: { str: null, value: 0, valid: false }
         };
      if (self._mask) {
         valueModel = _private.updateModelByMask(self, valueModel, str);
      } else {
         valueModel = _private.updateModel(self, valueModel, str);
      }
      return valueModel;
   },

   updateModelByMask: function(self, valueModel, str) {
      var maskItems = self._mask.split(/[.: /]/g),
          strItems = str.split(/[.: /]/g),
          i, valueObject;

      for (i = 0; i < maskItems.length; i++) {
         valueObject = valueModel[_private.maskMap[maskItems[i]]];
         valueObject.str = strItems[i];
         if (_private.isFilled(self, strItems[i])) {
            valueObject.valid = true;
            valueObject.value = parseInt(strItems[i], 10);
            if (maskItems[i] === 'YY') {
               valueObject.value = _private.getFullYearBy2DigitsYear(valueObject.value);
            } else if (maskItems[i] === 'MM') {
               valueObject.value -= 1;
            }
         }
      }
      return valueModel;
   },

   updateModel: function(self, valueModel, str) {
      var map = {
         date: 1,
         month: 2,
         year: 3,
         hours: 4,
         minutes: 5,
         seconds: 6
      },
      strItems,i, valueObject;

      strItems = _private.maskRegExp.exec(str);
      if (!strItems) {
         return
      }
      for (i in map) {
         valueObject = valueModel[i];
         valueObject.str = strItems[map[i]] || null;
         if (this.isFilled(self, valueObject.str)) {
            valueObject.valid = true;
            valueObject.value = parseInt(valueObject.str, 10);
            if (i=== 'year' && valueObject.value < 100) {
               valueObject.value = _private.getFullYearBy2DigitsYear(valueObject.value);
            } else if (i === 'month') {
               valueObject.value -= 1;
            }
         }
      }
      return valueModel;
   },

   fillFromBaseValue: function(self, valueModel, baseValue) {
      baseValue = dateUtils.isValidDate(baseValue) ? baseValue : new Date(DEFAULT_YEAR_NUM, 0, 1);

      if (valueModel.year.str === null) {
         valueModel.year.value = baseValue.getFullYear();
      }
      if (valueModel.month.str === null) {
         valueModel.month.value = baseValue.getMonth();
      }
      if (valueModel.date.str === null && self._mask !== dateMaskConstants.MM_YYYY) {
         // Для контрола с маской MM/YYYY не имеет смысла сохранять дату между вводом дат т.к. это приводит
         // к неожиданным результатам. Например, была программно установлена дата 31.12.2018.
         // меняем месяц на 11. 31.11 несуществует. Можно скорректировать на 30.11.2018. Теперь пользователь
         // вводит 12 в качесте месяца и мы получаем 30.12.2018...
         valueModel.date.value = baseValue.getDate();
      }
      if (valueModel.hours.str === null) {
         valueModel.hours.value = baseValue.getHours();
      }
      if (valueModel.minutes.str === null) {
         valueModel.minutes.value = baseValue.getMinutes();
      }
      if (valueModel.seconds.str === null) {
         valueModel.seconds.value = baseValue.getSeconds();
      }
      for (var value in valueModel) {
         if (valueModel.hasOwnProperty(value) && valueModel[value].str === null) {
            valueModel[value].valid = true;
         }
      }
   },

   autocomplete: function(self, valueModel, autocompleteType, required) {
      var now = new Date(),
         maskType = getMaskType(self._mask),
         item, itemValue, isZeroAtBeginning;

      var getDate = function(autocompliteDefaultDate) {
         autocompliteDefaultDate = autocompliteDefaultDate || now.getDate();
         if (autocompleteType === 'start') {
            return 1;
         } else if (autocompleteType === 'end') {
            return dateUtils.getEndOfMonth(new Date(valueModel.year.value, valueModel.month.value)).getDate();
         } else {
            return autocompliteDefaultDate;
         }
      };

      var setValue = function(obj, value) {
         if (!obj.valid) {
            obj.value = value;
            obj.valid = true;
         }
      };

      // Autocomplete the year with the mask YYYY, if the year is entered, but not completely
      // https://online.sbis.ru/opendoc.html?guid=6384f217-208a-4ca6-a175-b2c8d0ee2f0e
      if (self._mask.indexOf('YYYY') !== -1 && !valueModel.year.valid && !_private.isEmpty(valueModel.year.str)) {

         // If there is a Replacer between the numbers, then the year is incorrect
         if (self._replacerBetweenCharsRegExp.test(valueModel.year.str)) {
            return;
         }

         // Two-digit years auto-complete if there are no zeros at the beginning
         itemValue = parseInt(valueModel.year.str.replace(self._replacerRegExp, ' '), 10);
         isZeroAtBeginning = valueModel.year.str.split(itemValue)[0].indexOf('0') === -1;
         if (!isNaN(itemValue) && itemValue < 100 && isZeroAtBeginning) {
            setValue(valueModel.year, _private.getFullYearBy2DigitsYear(itemValue));
         } else {
            return;
         }
      }

      for (item in valueModel) {
         if (valueModel.hasOwnProperty(item)) {
            if (!valueModel[item].valid) {
               itemValue = valueModel[item].str;
               if (getMaskType(item) === TIME_MASK_TYPE && _private.isPartlyFilled(self, itemValue)) {
                  itemValue = itemValue.replace(self._replacerRegExp, '0');
               }
               itemValue = parseInt(itemValue, 10);
               if (!isNaN(itemValue)) {
                  setValue(valueModel[item], itemValue);
                  if (item === 'month') {
                     valueModel[item].value -= 1;
                  }
               }
            }
         }
      }

      // Автокомплитим только если пользователь частично заполнил поле, либо не заполнил, но поле обязательно
      // для заполнения. Не автокомплитим поля в периодах
      // if (isEmpty && (!required || autocompleteType === 'start' || autocompleteType === 'end')) {
      //    return null;
      // }

      if (maskType === DATE_MASK_TYPE || maskType === DATE_TIME_MASK_TYPE) {
         if (required && !valueModel.year.valid && valueModel.month.valid && valueModel.date.valid) {
            setValue(valueModel.year, now.getFullYear());
            setValue(valueModel.month, now.getMonth());
            setValue(valueModel.date, now.getDate());
         } else if (valueModel.year.valid) {
            if (valueModel.year.value === now.getFullYear()) {
               if (valueModel.month.valid) {
                  if (valueModel.month.value === now.getMonth()) {
                     // Заполнен текущий год и месяц
                     setValue(valueModel.date, getDate());
                  } else {
                     setValue(valueModel.date, getDate(1));
                  }
               } else {
                  // Current year is filled
                  setValue(valueModel.month, now.getMonth());
                  setValue(valueModel.date, getDate());
               }
            } else {
               // A year is different from the current one
               if (autocompleteType === 'end') {
                  setValue(valueModel.month, 11);
               } else {
                  setValue(valueModel.month, 0);
               }
               if (autocompleteType === 'end') {
                  setValue(valueModel.date, 31);
               } else {
                  setValue(valueModel.date, 1);
               }
            }
         } else if (valueModel.date.valid) {
            setValue(valueModel.month, now.getMonth());
            setValue(valueModel.year, now.getFullYear());
         }
      } else if (maskType === TIME_MASK_TYPE) {
         if (valueModel.hours.valid) {
            setValue(valueModel.minutes, 0);
            setValue(valueModel.seconds, 0);
         }
         if (valueModel.minutes.valid) {
            setValue(valueModel.seconds, 0);
         }
      }
   },

   /**
    * Creates a date. Unlike the Date constructor, if the year is <100, it does not convert it to 19xx.
    * @param year
    * @param month
    * @param date
    * @param hours
    * @param minutes
    * @param seconds
    * @param autoCorrect If true, then corrects the date if the wrong values of its elements are passed,
    * otherwise it returns null. If a date greater than the maximum date in the current month is transmitted,
    * the maximum date will be set.
    * @returns {Date}
    * @private
    */
   createDate: function(year, month, date, hours, minutes, seconds, autoCorrect, dateConstructor) {
      var endDateOfMonth;

      if (autoCorrect) {
         endDateOfMonth = dateUtils.getEndOfMonth(new dateConstructor(year, month, 1)).getDate();
         if (date > endDateOfMonth) {
            date = endDateOfMonth;
         }
         if (hours >= 24) {
            hours = 23;
         }
         if (minutes >= 60) {
            minutes = 59;
         }
         if (seconds >= 60) {
            seconds = 59;
         }
      }

      if (!_private.isValidDate(year, month, date, hours, minutes, seconds)) {
         return new dateConstructor('Invalid');
      }

      return new dateConstructor(year, month, date, hours, minutes, seconds);
   },

   isValidDate: function(year, month, date, hours, minutes, seconds) {
      var lastMonthDay = dateUtils.getEndOfMonth(new Date(year, month)).getDate();
      return seconds < 60 && minutes < 60 && hours < 24 && month < 12 && month >= 0 &&
         date <= lastMonthDay && date > 0;
   }
};

var ModuleClass = cExtend.extend({
   _mask: null,
   _replacer: null,
   _replacerRegExp: null,
   _replacerBetweenCharsRegExp: null,
   _dateConstructor: null,

   constructor: function(options) {
      this.update(options || {});
   },

   /**
    * Updates converter settings.
    * @param options
    */
   update: function(options) {
      this._mask = options.mask;
      this._dateConstructor = options.dateConstructor || Date;
      if (this._replacer !== options.replacer) {
         this._replacer = options.replacer;
         this._replacerBetweenCharsRegExp = new RegExp('[^' + this._replacer + ']+' + this._replacer + '[^' + this._replacer + ']+');
         this._replacerRegExp = new RegExp(this._replacer, 'g');
      }
   },

   /**
    * Returns the text displayed value
    * @param value
    * @param mask
    */
   getStringByValue(value: Date, mask: string): string {
      if (dateUtils.isValidDate(value)) {
         const tzOffset: number = DateTime.getClientTimezoneOffset();
         const actualMask: string = this._mask || mask;
         return formatter.date(value, actualMask, tzOffset);
      }
      return '';
   },

   /**
    * Get the Date object by the String and the mask.
    * @param str Date in accordance with the mask.
    * @param baseValue The base date. Used to fill parts of the date that are not in the mask.
    * @param autoCompleteType Autocomplete mode.
    * @returns {Date} Date object
    */
   getValueByString: function(str, baseValue, autoCompleteType, required) {
      var valueModel;

      if (_private.isEmpty(str)) {
         return null;
      }

      valueModel = _private.parseString(this, str);
      if (!valueModel) {
         return new this._dateConstructor('Invalid');
      }
      _private.fillFromBaseValue(this, valueModel, baseValue);

      if (_private.isFilled(this, str) &&
          (this._mask && this._mask.indexOf('YYYY') !== -1 && parseInt(valueModel.year.str, 10) < 1000)) {
         // Zero year and year < 1000 does not exist
         return new this._dateConstructor('Invalid');
      }
      if (autoCompleteType && !_private.isValueModelFilled(valueModel) && !(_private.isEmpty(str))) {
         _private.autocomplete(this, valueModel, autoCompleteType, required);
      }

      if (_private.isValueModelFilled(valueModel)) {
         return _private.createDate(valueModel.year.value, valueModel.month.value, valueModel.date.value,
            valueModel.hours.value, valueModel.minutes.value, valueModel.seconds.value, autoCompleteType, this._dateConstructor);
      }

      return new this._dateConstructor('Invalid');
   },
   getCurrentDate: function(baseValue, mask) {
      baseValue = dateUtils.isValidDate(baseValue) ? baseValue : new Date(DEFAULT_YEAR_NUM, 0, 1);
      let
          year = baseValue.getFullYear(),
          month = baseValue.getMonth(),
          date = baseValue.getDate(),
          hours = baseValue.getHours(),
          minutes = baseValue.getMinutes(),
          seconds = baseValue.getSeconds(),
          now = new Date();
      if (mask.indexOf('YYYY') > -1) {
         year = now.getFullYear();
      } else if (mask.indexOf('YY') > -1) {
         year = now.getFullYear();
      }
      if (mask.indexOf('MM') > -1) {
         month = now.getMonth();
      }
      if (mask.indexOf('DD') > -1 || date > dateUtils.getEndOfMonth(now).getDate()) {
         date = now.getDate();
      }
      if (mask.indexOf('HH') > -1) {
         hours = now.getHours();
      }
      if (mask.indexOf('mm') > -1) {
         minutes = now.getMinutes();
      }
      if (mask.indexOf('ss') > -1) {
         seconds = now.getSeconds();
      }
      return new this._dateConstructor(year, month, date, hours, minutes, seconds);
   }
});

export = ModuleClass;
