/**
 * @author io.frolenko
 * Created on 03.10.2014.
 * TODO этот компонент пока что тестировался только в Chrome
 */

define(
   'js!SBIS3.CONTROLS.MonthPicker',
   [
      'js!SBIS3.CORE.Control',
      'js!SBIS3.CONTROLS._PickerMixin',
      'html!SBIS3.CONTROLS.MonthPicker/resources/MonthPickerDropdown',
      'html!SBIS3.CONTROLS.MonthPicker'
   ],
   function(Control, _PickerMixin, DropdownTpl, dotTplFn){

   'use strict';

   /**
    * Контрол выбор месяца и года, или только года, с выпадающей вниз панелью.
    * Не наследуется от поля ввода, потому что там в принципе не требуется текстовый ввод
    * @class SBIS3.CONTROLS.MonthPicker
    * @extends $ws.proto.Control
    * @mixes SBIS3.CONTROLS._PickerMixin
    */

   var MonthPicker = Control.Control.extend( [_PickerMixin], /** @lends SBIS3.CONTROLS.MonthPicker.prototype */{
      _dropdownTpl: DropdownTpl,
      _dotTplFn: dotTplFn,

      $protected: {
         _options: {
            /**
             * @typedef {Object} ModeEnum
             * @variant month только месяц
             * @variant year месяц и год
             */
            /**
             * @cfg {ModeEnum} ввод только месяца или месяца и года (month/year)
             */
            mode: 'month',
            /**
             * @cfg {String|Date} Значение для установки по умолчанию (в последствии в нем хранится текущее значение)
             * Строка должна быть формата [MM.]YYYY (месяц -- одна или две цифры, год -- от 1-ой до 4-х цифр)
             * В зависимости от режима работы, установленного в mode, возьмутся месяц и год, либо только год.
             */
            date: '',
            /**
             * @cfg {String} формат визуального отображения месяца
             * TODO на данный момент нигде не используется
             */
            monthFormat: ''
         },
         /**
          * Массив месяцев
          */
         _months: [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
         ],
         /**
          * Управляющие клавиши
          */
         _KEYS: {
            ARROW_LEFT: 37,
            ARROW_RIGHT: 39
         },
         /**
          * Количество годов для выбора в выпадающем списке
          */
         _YEAR_COUNT: 7
      },

      $constructor: function() {
         var self = this;

         this._publish('onDateChange');

         // Установка первоначального значения
         if ( this._options.date ) {
            this._setDate(this._options.date);
         }
         else {
            this._setDate(new Date());
         }

         // Клик по стрелочкам
         $('.js-controls-MonthPicker__arrowRight', this.getContainer().get(0)).click(function(){
            self.setNext();
         });
         $('.js-controls-MonthPicker__arrowLeft', this.getContainer().get(0)).click(function(){
            self.setPrev();
         });

         // Клик по полю с датой
         $('.js-controls-MonthPicker__field', this.getContainer().get(0)).click(function(){
            self.togglePicker();

            if ( self._options.mode == 'month' ) {
               self._setText( self._composeText( self._options.date ) );
            }

            // обновляем выпадающий блок только если пикер данным кликом открыт
            if ( self._picker && self._picker.isVisible() ){
               self._drawElements();
            }
         });

         // Обработка нажатий клавиш
         $(this.getContainer().get(0)).keydown(function(event){
            if( event.which == self._KEYS.ARROW_RIGHT ){ self.setNext(); }
            else if( event.which == self._KEYS.ARROW_LEFT ){ self.setPrev(); }
         });


      },

      _initializePicker: function(){
         MonthPicker.superclass._initializePicker.call(this);

         var self = this;

         this._picker.subscribe('onClose', function(){
            self._onCloseHandler();
         });
      },

      /**
       * Функция-обработчик закрытия пикера внешним кликом
       * @private
       */
      _onCloseHandler: function () {
         if ( this._options.mode == 'month' ) {
            var text = this._composeText( this._options.date, true );
            this._setText(text);
         }
      },

      _setPickerContent: function() {
         var
            self = this,
            elements = this._options.mode == 'month' ? this._months : new Array(this._YEAR_COUNT);

         this._picker.getContainer().empty();
         this._picker.getContainer().append(this._dropdownTpl({mode: this._options.mode, elements: elements}));

         $('.js-controls-MonthPicker__dropdownElement', this._picker.getContainer()).click(function(e){
            self.hidePicker();

            if( self._options.mode == 'month' ){
               self.setDate(new Date(self._options.date.getFullYear(), $(this).attr('data-key'), 1, 0, 0, 0, 0));
            }
            else if( self._options.mode == 'year' ){
               self.setDate(new Date($(this).attr('data-key'), 0, 1, 0, 0, 0, 0));
            }
         });
      },

      /**
       * Установить режим ввода (месяц / месяц,год)
       * @param {String} mode
       */
      setMode: function(mode){
         if( mode == 'year' || mode == 'month' ){
            this._options.mode = mode;
            if ( this._picker ) {
               this._setPickerContent();

               if ( this._picker.isVisible() ){
                  this.hidePicker();
               }
            }
            this.setDate(this._options.date);
         }
      },

      /**
       * Установить текущий месяц/год
       */
      setToday: function() {
         this.setDate(new Date());
      },

      /**
       * Установить дату по полученному значению. Публичный метод.
       * Отличается от приватного метода _setDate тем, что генерирует событие
       * Может принимает либо строку формата 'число.число' или 'число', либо объект типа Date.
       * @param value Строка или дата
       */
      setDate: function(value) {
         value = value ? value : new Date();

         this._setDate(value);

         this._notify('onDateChange', this._options.date);
      },

      /**
       * Установить дату по полученному значению. Приватный метод. Может принимает либо строку
       * формата 'число.число' или 'число', либо объект типа Date.
       * @param value Строка или дата
       * @private
       */
      _setDate: function(value){
         if( value instanceof Date ){
            this._setDateByDateObject(value);
         }
         else if( typeof value == 'string' ){
            this._setDateByString(value);
         }
      },

      /**
       * Установить дату по переданной строке. Проверить ее на корректность [MM.]YYYY и установить, иначе породить исключение.
       * Нумерация месяцев начинается с единицы
       * @param value
       * @private
       */
      _setDateByString: function(value){
         var checkResult = /^(?:(\d{1,2})\.)?(\d{1,4})$/.exec(value);

         if ( checkResult ){
            this._setDateByDateObject(new Date(parseInt(checkResult[2], 10), parseInt(checkResult[1], 10) - 1 || 0, 1, 0, 0, 0, 0));
         }
         else {
            throw new Error('Неверный формат даты');
         }
      },

      /**
       * Установить дату по объекту типа Date.
       * @param date Дата, по которой устанавливается новое значение
       * @private
       */
      _setDateByDateObject: function(date){
         var
            month = ( this._options.mode == 'month' ) ? date.getMonth() : 0,
            year = date.getFullYear();

         this._options.date = new Date(year, month, 1, 0, 0, 0, 0);

         var text = this._composeText(this._options.date);
         this._setText(text);
      },

      /**
       * Формирует отображаемый текст по дате в зависимости от режима mode и от состояния пикера (открыт/закрыт)
       * @param date
       * @param fromOnClose необязательный параметр, показывающий, вызван ли метод из обработчика события onClose
       * @returns {string}
       * @private
       */
      _composeText: function (date, fromOnClose) {
         var text = date.getFullYear().toString();
         text = this._options.mode == 'month' ? this._months[date.getMonth()] + ', ' + text : text;

         // Если метод вызван не из обработчика onClose, тогда скорректировать текст перед возвращением
         return !fromOnClose ? this._correctText(text) : text;
      },

      /**
       * Корректирует текст (оставлаяет только год) в зависимости от трех условий:
       *    1. Если мы в режиме месяца (иначе текст и так хранит только год)
       *    2. Если пикер существует
       *    3. Если пикер открыт
       * @param text
       * @returns {string}
       * @private
       */
      _correctText: function (text) {
         return this._options.mode == 'month' && this._picker && this._picker.isVisible() ? /\d+/.exec(text)[0] : text;
      },

      /**
       * Установить значение в поле
       * @private
       */
      _setText: function(text){
         $('.js-controls-MonthPicker__field', this.getContainer().get(0)).text(text);
      },

      /**
       * Установить следующий месяц/год
       */
      setNext: function() {
         this._changeDate(1);
      },

      /**
       * Установить предыдущий месяц/год
       */
      setPrev: function() {
         this._changeDate(-1);
      },

      /**
       * Изменить дату на value единиц (единица = месяц в режиме месяца и = год в режиме года)
       * @param value
       * @private
       */
      _changeDate: function(value){
         var
            currentDate = this._options.date || new Date(),
            newDate;

         if ( this._options.mode == 'month' ){
            // Если пикер открыт, тогда в режиме месяца в текстовом поле отображается год, т.е. нужно менять год
            if (this._picker && this._picker.isVisible()){ newDate = new Date(currentDate.setYear(currentDate.getFullYear() + value)); }
            else { newDate = new Date(currentDate.setMonth(currentDate.getMonth() + value)); }
         }
         else if ( this._options.mode == 'year' ){ newDate = new Date(currentDate.setYear(currentDate.getFullYear() + value)); }

         this.setDate(newDate);
      },

      /**
       * Возвращает текущее значение даты.
       * В случае года, возвращает дату 1-ого дня 1-ого месяца данного года.
       * В случае месяца и года, возвращает дату 1-ого дня данного месяца данного года
       * @returns {Date|*} Текущая дата
       */
      getDate: function(){
         return this._options.date;
      },

      /**
       * Взовращает дату в виде строки формата 'YYYY-MM-DD'
       * @returns {string}
       */
      getTextDate: function(){
         return this._options.date.toSQL();
      },

      /**
       * Возвращает интервал даты (массив из двух дат), где, в случае 'месац, год':
       * начало интервала - первый день данного месяца данного года, конец - последний день данного месяца данного года
       * а в случае режима 'год':
       * начало интервала - первый день данного года, конец - последний день данного года
       * @returns {*[]}
       */
      getInterval: function(){
         var
            startInterval = this._options.date,
            endInterval;
         if ( this._options.mode == 'month' ){
            endInterval = new Date(startInterval.getFullYear(), startInterval.getMonth() + 1, 0, 23, 59, 59, 999);
         }
         else if ( this._options.mode == 'year' ){
            endInterval = new Date(startInterval.getFullYear(), 11, 31, 23, 59, 59, 999);
         }

         return [startInterval, endInterval];
      },

      /**
       * Обновить выпадающий список в соответствии с типом mode, а так же обновить активный элемент
       * @private
       */
      _drawElements: function(){
         var
            self = this,
            temporary,
            quantity;

         // обновляем года и атрибуты data-key в режиме года
         if( self._options.mode == 'year' ) {
            quantity = ($('.js-controls-MonthPicker__dropdownElement', self._picker.getContainer().get(0)).length / 2 | 0);
            $('.js-controls-MonthPicker__dropdownElement', this._picker.getContainer().get(0)).each(function () {
               temporary = self._options.date.getFullYear() + $(this).index() - quantity;
               $(this).text(temporary);
               $(this).attr('data-key', temporary);
            });
         }

         // Обновляем активный месяц/год
         $('.js-controls-MonthPicker__dropdownElement', this._picker.getContainer().get(0))
            .removeClass('controls-MonthPicker__dropdownElementActive');
         temporary = self._options.mode == 'month' ? self._options.date.getMonth() : self._options.date.getFullYear();
         $('.js-controls-MonthPicker__dropdownElement[data-key=' + temporary + ']', this._picker.getContainer().get(0))
            .addClass('controls-MonthPicker__dropdownElementActive');
      }
   });

   return MonthPicker;
});