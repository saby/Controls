import Control = require('Core/Control');
import coreMerge = require('Core/core-merge');
import StringValueConverter = require('Controls/_input/DateTime/StringValueConverter');
import IDateTimeMask from 'Controls/_input/interface/IDateTimeMask';
import tmplNotify = require('Controls/Utils/tmplNotify');
import template = require('wml!Controls/_input/Date/Picker/Picker');
import {Popup as PopupUtil} from 'Controls/dateUtils';

   /**
    * Поле ввода даты. Поддерживает как ввод с клавиатуры, так и выбор даты из всплывающего календаря с помощью мыши. Не поддерживает ввод времени.
    * @remark
    * Полезные ссылки:
    * * <a href="/materials/Controls-demo/app/Controls-demo%2FInput%2FDate%2FPicker">демо-пример</a>
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления input</a>
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_datePicker.less">переменные тем оформления dateRange</a>
    *
    * @class Controls/_input/Date/Picker
    * @extends Core/Control
    * @mixes Controls/interface/IInputDateTime
    * @mixes Controls/interface/IDateMask
    * @mixes Controls/interface/IInputTag
    * @mixes Controls/_dateRange/interfaces/IDatePickerSelectors
    * @mixes Controls/_input/interface/IBase
    * @mixes Controls/interface/IInputPlaceholder
    * @mixes Controls/_interface/IOpenPopup
    * @control
    * @public
    * @demo Controls-demo/Input/Date/PickerPG
    * @category Input
    * @author Красильников А.С.
    */

   /*
    * Control for entering date. Also, the control allows you to select a date with the mouse using the drop-down box.
    * <a href="/materials/Controls-demo/app/Controls-demo%2FInput%2FDate%2FPicker">Demo examples.</a>.
    *
    * @class Controls/_input/Date/Picker
    * @extends Core/Control
    * @mixes Controls/interface/IInputDateTime
    * @mixes Controls/interface/IDateMask
    * @mixes Controls/interface/IInputTag
    * @mixes Controls/_input/interface/IBase
    * @mixes Controls/interface/IInputPlaceholder
    * @mixes Controls/_input/interface/IValueValidators
    * @control
    * @public
    * @demo Controls-demo/Input/Date/PickerPG
    * @category Input
    * @author Красильников А.С.
    */

   var Component = Control.extend([], {
      _template: template,
      _proxyEvent: tmplNotify,
      _shouldValidate: false,

      // _beforeMount: function(options) {
      // },
      //
      // _beforeUpdate: function(options) {
      // },
      //
      // _beforeUnmount: function() {
      // },

      openPopup: function(event) {
          var cfg = {
            ...PopupUtil.getCommonOptions(this),
            target: this._container,
            template: 'Controls/datePopup',
            className: 'controls-PeriodDialog__picker_theme-' + this._options.theme,
            templateOptions: {
               ...PopupUtil.getTemplateOptions(this),
               selectionType: 'single',
                calendarSource: this._options.calendarSource,
                dayTemplate: this._options.dayTemplate,
               headerType: 'input',
               closeButtonEnabled: true,
               range: this._options.range,
               startValueValidators: this._options.valueValidators
            }
         };
         this._children.opener.open(cfg);
      },

      _afterUpdate(): void {
          if (this._shouldValidate) {
              this._shouldValidate = false;
              this._children.input.validate();
          }
      },

      _onResultWS3: function(event, startValue) {
         this._onResult(startValue);
      },

      _onResult: function(startValue) {
         var
            stringValueConverter = new StringValueConverter({
               mask: this._options.mask,
               replacer: this._options.replacer,
               dateConstructor: this._options.dateConstructor
            }),
            textValue = stringValueConverter.getStringByValue(startValue);
         this._notify('valueChanged', [startValue, textValue]);
         this._children.opener.close();
         this._notify('inputCompleted', [startValue, textValue]);
          /**
           * Вызываем валидацию, т.к. при выборе периода из календаря не вызывается событие valueChanged
           * Валидация срабатывает раньше, чем значение меняется, поэтому откладываем ее до _afterUpdate
           */
         this._shouldValidate = true;
      }
   });

   Component.getDefaultOptions = function() {
      return {
          ...IDateTimeMask.getDefaultOptions(),
          valueValidators: []
      };
   };

   Component.getOptionTypes = function() {
      return coreMerge({}, IDateTimeMask.getOptionTypes());
   };

   Component._theme = ['Controls/Classes', 'Controls/input'];

   export = Component;


