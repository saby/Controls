define('SBIS3.CONTROLS/TextBox', [
   'Core/EventBus',
   'Core/constants',
   'SBIS3.CONTROLS/TextBox/TextBoxBase',
   'tmpl!SBIS3.CONTROLS/TextBox/TextBox',
   'tmpl!SBIS3.CONTROLS/TextBox/resources/textFieldWrapper',
   'tmpl!SBIS3.CONTROLS/TextBox/resources/compatiblePlaceholder',
   'SBIS3.CONTROLS/Utils/TemplateUtil',
   'SBIS3.CONTROLS/TextBox/resources/TextBoxUtils',
   'SBIS3.CONTROLS/Utils/GetTextWidth',
   'Core/helpers/Function/forAliveOnly',
   'SBIS3.CONTROLS/ControlHierarchyManager',
   'SBIS3.CONTROLS/Button/IconButton',
   'css!Controls/Input/resources/InputRender/InputRender',
   'css!SBIS3.CONTROLS/TextBox/TextBox'

], function(
    EventBus,
    constants,
    TextBoxBase,
    dotTplFn,
    textFieldWrapper,
    compatiblePlaceholderTemplate,
    TemplateUtil,
    TextBoxUtils,
    getTextWidth,
    forAliveOnly,
    ControlHierarchyManager) {

   'use strict';

   /**
    * Однострочное текстовое поле ввода.
    * Специальные поля:
    * <ul>
    *    <li>{@link SBIS3.CONTROLS/NumberTextBox NumberTextBox} - поле ввода числа;</li>
    *    <li>{@link SBIS3.CONTROLS/PasswordTextBox PasswordTextBox} - поле ввода пароля;</li>
    *    <li>{@link SBIS3.CONTROLS/TextArea TextArea} - многострочное поле ввода;</li>
    *    <li>{@link SBIS3.CONTROLS/FormattedTextBox FormattedTextBox} - поле ввода с маской.</li>
    * </ul>
    *
    * Для поля ввода можно задать:
    * <ol>
    *    <li>{@link maxLength} - ограничение количества вводимых символов;</li>
    *    <li>{@link inputRegExp} - фильтр вводимых символов;</li>
    *    <li>{@link trim} - обрезать ли пробелы при вставке текста;</li>
    *    <li>{@link selectOnClick} - выделять ли текст при получении контролом фокуса;</li>
    *    <li>{@link textTransform} - форматирование регистра текста.</li>
    * </ol>
    * @class SBIS3.CONTROLS/TextBox
    * @extends SBIS3.CONTROLS/TextBox/TextBoxBase
    * @author Романов Валерий Сергеевич
    * @demo SBIS3.CONTROLS.Demo.MyTextBox
    *
    * @ignoreOptions independentContext contextRestriction className horizontalAlignment
    * @ignoreOptions element linkedContext handlers parent autoHeight autoWidth
    * @ignoreOptions isContainerInsideParent owner stateKey subcontrol verticalAlignment
    *
    * @ignoreMethods applyEmptyState applyState findParent getAlignment getEventHandlers getEvents
    * @ignoreMethods getId getLinkedContext getMinHeight getMinSize getMinWidth getOwner getOwnerId getParentByClass
    * @ignoreMethods getParentByName getParentByWindow getStateKey getTopParent getUserData hasEvent hasEventHandlers
    * @ignoreMethods isDestroyed isSubControl makeOwnerName once sendCommand setOwner setStateKey setUserData setValue
    * @ignoreMethods subscribe unbind unsubscribe getClassName setClassName
    *
    * @ignoreEvents onDragIn onDragMove onDragOut onDragStart onDragStop onStateChanged onChange onReady
    *
    * @control
    * @public
    * @category Input
    */

   var TextBox = TextBoxBase.extend(/** @lends SBIS3.CONTROLS/TextBox.prototype */ {
      _dotTplFn: dotTplFn,
      /**
       * @event onInformationIconMouseEnter Происходит когда курсор мыши входит в область информационной иконки.
       * @param {Core/EventObject} eventObject Дескриптор события.
       * @see informationIconColor
       */
      /**
       * @event onInformationIconActivated Происходит при клике по информационной иконке.
       * @param {Core/EventObject} eventObject Дескриптор события.
       * @see informationIconColor
       */
      $protected: {
      	_fromTouch: false,
         _pasteProcessing : 0,
         _inputField : null,
         _compatPlaceholder: null,
         _tooltipText: null,
         _beforeFieldWrapper: null,
         _afterFieldWrapper: null,
         _textFieldWrapper: null,
         _informationIcon: null,
         _options: {
            compatiblePlaceholderTemplate: compatiblePlaceholderTemplate,
            textFieldWrapper: textFieldWrapper,
            beforeFieldWrapper: null,
            afterFieldWrapper: null,
            /**
             * @cfg {String} Устанавливает форматирование регистра текстового значения в поле ввода.
             * @variant uppercase Все символы верхним регистром.
             * @variant lowercase Все символы нижним регистром.
             * @variant none Без изменений.
             * @remark
             * Опция используется в случаях, когда все символы текста в поле ввода нужно отобразить прописными
             * (верхний регистр) или строчными (нижний регистр).
             * Заменить или установить регистр текста можно при помощи метода {@link setTextTransform}.
             * @example
             * Пример отображения в поле связи всех символов текста прописными
             * для {@link placeholder текста подсказки внутри поля ввода}:
             * ![](/TextBox02.png)
             * фрагмент верстки:
             * <pre class="brush:xml">
             *    <option name="textTransform">uppercase</option>
             * </pre>
             * @see setTextTransform
             * @see placeholder
             *
             */
            textTransform: 'none',
            /**
             * @cfg {Boolean} Определяет режим выделения текста в поле ввода при получении фокуса.
             * * true Выделять текст.
             * * false Не выделять текст.
             * @remark
             * Используется в случаях, когда поле ввода нужно использовать в качестве источника текстовой информации:
             * пользователю требуется скопировать строку в поле для каких-либо дальнейших действий.
             * @example
             * Иллюстрация выделения текста, переданного в поле связи опцией {@link SBIS3.CONTROLS/TextBox/TextBoxBase#text}:
             * ![](/TextBox03.png)
             * фрагмент верстки:
             * <pre class="brush:xml">
             *     <option name="selectOnClick">true</option>
             * </pre>
             * @see SBIS3.CONTROLS/TextBox/TextBoxBase#text
             */
            selectOnClick: false,
            /**
             * @cfg {String} Устанавливает текст подсказки внутри поля ввода.
             * @remark
             * Данный текст отображается внутри поля ввода до момента получения фокуса.
             * Заменить текст подсказки, заданный опцией, можно при помощи метода {@link setPlaceholder}.
             * @example
             * Пример 1. Текст подсказки в поле связи:
             * ![](/TextBox01.png)
             * фрагмент верстки:
             * <pre class="brush:xml">
             *     <option name="placeholder">ФИО исполнителя или название рабочей зоны</option>
             * </pre>
             * Пример 2. Текст подсказки с {@link textTransform форматированием регистра}:
             * ![](/TextBox02.png)
             * @see setPlaceholder
             * @see textTransform
             * @translatable
             */
            placeholder: '',
            /**
             * @cfg {String} Устанавливает регулярное выражение, в соответствии с которым будет осуществляться валидация вводимых символов.
             * @remark
             * Служит для фильтрации вводимых символов в поле ввода по условию, установленному регулярным выражением.
             * Каждый вводимый символ будет проверяться на соответствие указанному в этой опции регулярному выражению;
             * несоответствующие символы ввести будет невозможно.
             * @example
             * Разрешен ввод только цифр:
             * <pre class="brush:xml">
             *     <option name="inputRegExp">[0-9]</option>
             * </pre>
             * Разрешен ввод только кириллицы:
             * <pre class="brush:xml">
             *     <option name="inputRegExp">[а-яА-ЯёЁ]</option>
             * </pre>
             */
            inputRegExp : '',
            /**
             * @cfg {Boolean} Включает отображение информационной иконки в поле ввода.
             * @remark
             * Для взаимодействия с информационной иконкой используются два события (@see onInformationIconMouseEnter) и (@see onInformationIconActivated)
             * по умолчанию опция выключена
             * @example
             * Пример показа всплывающей подсказки для поля ввода по наведению курсора на информационную иконку
             * <pre>
             *    myTextBox.subscribe('onInformationIconMouseEnter', function() {
             *       CInfobox.show({
             *         control: myTextBox.getContainer(),
             *         message: "<p><span style='color: red;'>Внимание:</span> Текст всплывающей подсказки</p>",
             *         width: 400,
             *         delay: 1000,
             *         hideDelay: 2000
             *       });
             *    });
             * </pre>
             * Цвета доступные для установки:
             * <ol>
             *    <li>done</li>
             *    <li>attention</li>
             *    <li>disabled</li>
             *    <li>error</li>
             *    <li>primary</li>
             * </ol>
             * @see setInformationIconColor
             * @see informationIconColor
             */
            informationIconColor: '',
             /**
              * @cfg {String} Устанавливает размер поля ввода.
              * @remark
              * По умолчанию значение опции "m"
              * Значение "l" устaновит большой рамер поля ввода
              * @example
              * Пример 1. Большое поле ввода:
              * фрагмент верстки:
              * <pre class="brush:xml">
              *     <option name="size">l</option>
              * </pre>
              */
            size: ''
         }
      },

      $constructor: function() {
         this._publish('onPaste', 'onInformationIconMouseEnter', 'onInformationIconActivated');
         var self = this;
         this._inputField = this._getInputField();
         this._inputField
            .on('paste', function(event){
               var userPasteResult = self._notify('onPaste', TextBoxUtils.getTextFromPasteEvent(event));
      
               if(userPasteResult !== false){
                  self._pasteProcessing++;
                  /* зачем делаем setTimeout?
                     в момент события в поле ввода нет перенесенных данных,
                     поэтому вставка выполняется с задержкой, чтобы браузер самостоятельно обработал данные из буфера обмена(изображение, верстка)
                   */
                  window.setTimeout(function(){
                     self._pasteProcessing--;
                     if (!self._pasteProcessing) {
                        self._pasteHandler(event);
                     }
                  }, 100);
               }else {
                  event.preventDefault();
               }
      
            })
            .on('drop', function(event){
               window.setTimeout(function(){
                  self._pasteHandler(event);
               }, 100);
            })
            .on('change',function(){
               var newText = $(this).val(),
                  inputRegExp = self._options.inputRegExp;
         
               if (newText != self._options.text) {
                  if(inputRegExp) {
                     newText = self._checkRegExp(newText, inputRegExp);
                  }
                  self.setText(newText);
               }
            })
            .on('focusin', this._inputFocusInHandler.bind(this))
            .on('focusout', this._inputFocusOutHandler.bind(this))
            .on('click', this._inputClickHandler.bind(this));
   
         this._container
            .on('keypress keydown keyup', this._keyboardDispatcher.bind(this))
            .on('keyup mouseenter', function() { self._applyTooltip(); })
            .on('touchstart', function() { self._fromTouch = true;});
      },

      _modifyOptions: function() {
         var cfg = TextBox.superclass._modifyOptions.apply(this, arguments);
         /* Надо подготовить шаблоны beforeFieldWrapper и afterFieldWrapper,
            чтобы у них был __vStorage, для возможности обращаться к опциям по ссылке (ref) */
         cfg.beforeFieldWrapper = TemplateUtil.prepareTemplate(cfg.beforeFieldWrapper);
         cfg.afterFieldWrapper = TemplateUtil.prepareTemplate(cfg.afterFieldWrapper);
         return cfg;
      },


      _checkRegExp: function (text, regExp) {
          var newText = '',
              inputRegExp = new RegExp(regExp);
          for (var i = 0; i < text.length; i++){
              if (inputRegExp.test(text[i])){
                  newText = newText + text[i];
              }
          }
          return newText;
      },

      init: function() {
         var self = this;
         TextBox.superclass.init.apply(this, arguments);

         if (this._options.informationIconColor) {
            this._informationIcon = $('.controls-TextBox__informationIcon', this.getContainer());
         }

         this._container.on('mouseenter', function(e) {
            if ($(e.target).hasClass('controls-TextBox__informationIcon')) {
               self._notify('onInformationIconMouseEnter');
            }
         });
         this._container.on('click', function(e) {
            if ($(e.target).hasClass('controls-TextBox__informationIcon')) {
               self._notify('onInformationIconActivated');
            }
         });

         this._compatPlaceholder = this._getCompatiblePlaceholder();
         this._initPlaceholderEvents(this._compatPlaceholder);

         /* Надо проверить значение input'a, т.к. при дублировании вкладки там уже может быть что-то написано */
         this._checkInputVal(true);
      },

      /**
       * Устанавливает цвет информационной иконки.
       * Цвета доступные для установки:
       * <ol>
       *    <li>done</li>
       *    <li>attention</li>
       *    <li>disabled</li>
       *    <li>error</li>
       *    <li>primary</li>
       * </ol>
       * @see informationIcon
       * @see informationIconColor
       */
      setInformationIconColor: function (color) {
         if (!color) {
            this._destroyInformationIcon();
            return;
         }

         if (!this._informationIcon) {
            this._createInformationIcon(color);
         }

         this._informationIcon.removeClass('controls-TextBox__informationIcon-' + this._options.informationIconColor);
         this._options.informationIconColor = color;
         this._informationIcon.addClass('controls-TextBox__informationIcon-' + color);
      },

      _createInformationIcon: function(color) {
         this._informationIcon = $('<div class="controls-TextBox__informationIcon controls-TextBox__informationIcon-' + color + '"></div>');
         this.getContainer().append(this._informationIcon);
      },

      _getCompatiblePlaceholder: function() {
         if (!this._compatPlaceholder) {
            this._compatPlaceholder = this._container.find('.controls-TextBox__placeholder');
         }
         return this._compatPlaceholder;
      },

      _destroyInformationIcon: function() {
         if (this._informationIcon) {
            this._informationIcon.remove();
            this._informationIcon = undefined;
         }
      },

      _keyboardDispatcher: function(event){
         return forAliveOnly(function(event){
            var result = true;
            switch (event.type) {
               case 'keydown':
                  result = this._keyDownBind.call(this, event);
                  break;
               case 'keyup':
                  result = this._keyUpBind.call(this, event);
                  break;
               case 'keypress':
                  result = this._keyPressBind.call(this, event);
                  break;
            }
            return result;
         }).call(this, event);
      },

      _checkInputVal: function(fromInit) {
         var text = this._getInputValue();

         //При ините не должен вызываться trim, поэтому будем проверять по этому флагу попали в checkInputVal из init или нет
         if (this._options.trim && !fromInit) {
            text = text.trim();
         }
         //Установим текст только если значения различны и оба не пустые
         if (text !== this._options.text && !(this._isEmptyValue(this._options.text) && !(text || '').length)){
            this.setText(text);
         }
      },

      /**
       * Применить tooltip
       * Если текст не умещается в поле по ширине, то показываем подсказку с полным текстом
       * Если текст умещается, то показываем из опции tooltip
       */
      _applyTooltip: function() {
         if (this._tooltipText != this._options.text) {
            var scrollWidth;
            if (constants.browser.isIE) {
               scrollWidth = getTextWidth(this._options.text);
            }
            else {
               scrollWidth = this._inputField[0].scrollWidth;
            }
            // для случая, когда текст не умещается в поле ввода по ширине, показываем всплывающую подсказку с полным текстом
            if (scrollWidth > this._inputField[0].clientWidth) {
               this._container.attr('title', this._options.text);
               this._inputField.attr('title', this._options.text);
            }
            else if (this._options.tooltip) {
               this.setTooltip(this._options.tooltip);
            } else if (this._container.attr('title')) {
                this._container.attr('title', '');
               //Ставлю пробел, чтобы скрыть браузерную подсказку "Заполните это поле". Если поставить пробел, то все браузеры,
               //кроме IE, не выводят всплывающую подсказку. Для IE ставлю пустой title, чтобы он не выводил всплывашку.
               this._inputField.attr('title', constants.browser.isIE ? '' : ' ');
            }
            this._tooltipText = this._options.text;
         }
      },

      setTooltip: function(tooltip) {
         this._inputField.attr('title', tooltip);
         TextBox.superclass.setTooltip.apply(this, arguments);
      },

      _drawText: function(text) {
         if (this._getInputValue() != text) {
            this._setInputValue(text || '');
         }
      },

      setMaxLength: function(num) {
         TextBox.superclass.setMaxLength.call(this, num);
         this._inputField.attr('maxlength',num);
      },

      /**
       * Устанавливает подсказку, отображаемую внутри поля ввода.
       * @param {String} text Текст подсказки.
       * @example
       * <pre>
       *     if (control.getText() == '') {
       *        control.setPlaceholder("Введите ФИО полностью");
       *     }
       * </pre>
       * @see placeholder
       */
      setPlaceholder: function(text){
         this._options.placeholder = text;
         this._setPlaceholder(text);
      },

      _setPlaceholder: function(text){
         this._destroyCompatPlaceholder();
         this._createCompatiblePlaceholder();
      },

      /**
       * Устанавливает форматирование регистра текста в поле ввода.
       * @param {String} textTransform Необходимое форматирование регистра текста.
       * @variant uppercase Все символы текста становятся прописными (верхний регистр).
       * @variant lowercase Все символы текста становятся строчными (нижний регистр).
       * @variant none Текст не меняется.
       * @example
       * <pre>
       *    control.setTextTransform("lowercase");
       * </pre>
       * @see textTransform
       */
      setTextTransform: function(textTransform){
         switch (textTransform) {
            case 'uppercase':
               this._inputField.removeClass('controls-TextBox__field-lowercase')
                  .addClass('controls-TextBox__field-uppercase');
               break;
            case 'lowercase':
               this._inputField.removeClass('controls-TextBox__field-uppercase')
                  .addClass('controls-TextBox__field-lowercase');
               break;
            default:
               this._inputField.removeClass('controls-TextBox__field-uppercase')
                  .removeClass('controls-TextBox__field-lowercase');
         }
      },

      _keyDownBind: function(event){
         if (event.which == 13){
            this._checkInputVal();
         }
      },

      _keyUpBind: function(event) {
         var newText = this._getInputValue(),
            textsEmpty = this._isEmptyValue(this._options.text) && this._isEmptyValue(newText);
         if (this._options.text !== newText && !textsEmpty){
            this._setTextByKeyboard(newText);
         }
         var key = event.which || event.keyCode;
         if (Array.indexOf([constants.key.up, constants.key.down], key) >= 0) {
            event.stopPropagation();
         }
      },

      _setTextByKeyboard: function(newText){
         this.setText(newText);
      },

      _getInputValue: function() {
         return this._inputField && this._inputField.val();
      },
      _setInputValue: function(value) {
         this._inputField && this._inputField.val(value);
      },
      _getInputField: function() {
         return $('.js-controls-TextBox__field', this.getContainer().get(0));
      },

      _keyPressBind: function(event) {
         if (this._options.inputRegExp && !event.ctrlKey){
            return this._inputRegExp(event, new RegExp(this._options.inputRegExp));
         }
      },

      _getElementToFocus: function() {
         return this._inputField;
      },

      _setEnabled : function(enabled) {
         TextBox.superclass._setEnabled.call(this, enabled);
         /* Когда дизейблят поле ввода, ставлю placeholder в виде пробела, в старом webkit'e есть баг,
            из-за коготорого, если во flex контейнере лежит input без placeholder'a ломается базовая линия.
            placeholder с пустой строкой и так будет не виден, т.ч. проблем быть не должно */
         if (enabled) {
            this._createCompatiblePlaceholder();
         } else {
            this._destroyCompatPlaceholder();
         }
         // FIXME Шаблонизатор сейчас не позволяет навешивать одиночные атрибуты, у Зуева Димы в планах на сентябрь
         // сделать возможность вешать через префикс attr-
         this._inputField.prop('readonly', !enabled);
      },
      _inputRegExp: function (e, regexp) {
         var keyCode = e.which || e.keyCode;
         //Клавиши стрелок, delete, backspace и тд
         if (!e.charCode){
            return true;
         }
         if (keyCode < 32 || e.ctrlKey || e.altKey) {
            return false;
         }
         if (!regexp.test(String.fromCharCode(keyCode))) {
            return false;
         }
         return true;
      },

      _inputFocusOutHandler: function(e) {
         if (this._fromTouch){
            EventBus.globalChannel().notify('MobileInputFocusOut');
            this._fromTouch = false;
         }
      },

       _pasteHandler: function(event) {
           var text = this._getInputValue(),
               inputRegExp = this._options.inputRegExp;
           if (inputRegExp){
               text = this._checkRegExp(text, inputRegExp);
           }
           if (this._options.trim) {
               text = text.trim();
           }
           text = this._formatText(text);
           this._drawText(text);
          /* Событие paste может срабатывать:
           1) При нажатии горячих клавиш
           2) При вставке из котекстного меню.

           Если текст вставлют через контекстное меню, то нет никакой возможности отловить это,
           но событие paste гарантированно срабатывает после действий пользователя. Поэтому мы
           можем предполагать, что это ввод с клавиатуры, чтобы правильно работали методы,
           которые на это рассчитывают.
           */
           this._setTextByKeyboard(text);
       },

      _focusOutHandler: function(event, isDestroyed, focusedControl) {
         if(!isDestroyed  && (!focusedControl || !ControlHierarchyManager.checkInclusion(this, focusedControl.getContainer()[0])) ) {
            this._checkInputVal();
         }

         TextBox.superclass._focusOutHandler.apply(this, arguments);
      },
      
      _inputClickHandler: function (e) {
         if (this.isEnabled() && this._compatPlaceholder) {
            this._getInputField().focus();
         }
      },

      _inputFocusInHandler: function(e) {
         if (this._fromTouch){
            EventBus.globalChannel().notify('MobileInputFocus');
         }
         if (this._options.selectOnClick){
            this._inputField.select();
         }
         /* При получении фокуса полем ввода, сделаем контрол активным.
          *  Делать контрол надо активным по фокусу, т.к. при клике и уведении мыши,
          *  кусор поставится в поле ввода, но соыбтие click не произойдёт и контрол актвным не станет, а должен бы.*/
         if(!this.isActive()) {
            this.setActive(true, false, true);
            e.stopPropagation();
         }
         // убираем курсор на ipad'e при нажатии на readonly поле ввода
         if(!this.isEnabled() && constants.browser.isMobilePlatform){
            this._inputField.blur();
         }
      },

      _destroyCompatPlaceholder: function() {
         if (this._compatPlaceholder) {
            this._compatPlaceholder.off('*');
            this._compatPlaceholder.remove();
            this._compatPlaceholder = undefined;
         }
      },

      _initPlaceholderEvents: function(placeholder) {
         placeholder.on('click', this._inputClickHandler.bind(this));
      },

      _createCompatiblePlaceholder: function() {
         if (!this._compatPlaceholder) {
            this._compatPlaceholder = $(this._options.compatiblePlaceholderTemplate(this._options));
            this._inputField.after(this._compatPlaceholder);
            this.reviveComponents();
            this._initPlaceholderEvents(this._compatPlaceholder);
         }
      },

      _getAfterFieldWrapper: function() {

      },

      _getBeforeFieldWrapper: function() {

      },

      destroy: function() {
         this._afterFieldWrapper = undefined;
         this._beforeFieldWrapper = undefined;
         this._inputField.off('*');
         this._inputField = undefined;
         this._destroyCompatPlaceholder();
         this._destroyInformationIcon();
         TextBox.superclass.destroy.apply(this, arguments);
      }
   });

   return TextBox;

});