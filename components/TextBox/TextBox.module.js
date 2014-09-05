define('js!SBIS3.CONTROLS.TextBox', ['js!SBIS3.CONTROLS.TextBoxBase','html!SBIS3.CONTROLS.TextBox','css!SBIS3.CONTROLS.TextBox'], function(TextBoxBase, dotTplFn) {

   'use strict';

   /**
    * Поле ввода в одну строчку
    * @class SBIS3.CONTROLS.TextBox
    * @extends SBIS3.CONTROLS.TextBoxBase
    * @control
    */

   var TextBox = TextBoxBase.extend(/** @lends SBIS3.CONTROLS.TextBox.prototype */ {
      _dotTplFn: dotTplFn,
      $protected: {
         _inputField : null,
         _options: {
            /**
             * @typedef {Object} TextTransformEnum
             * @variant uppercase перевести в верхний регистр
             * @variant lowercase перевести в нижний регистр
             * @variant none оставить как есть
             */
            /**
             * @cfg {TextTransformEnum} Применить форматирование к тексту
             */
            textTransform: 'none',
            /**
             * @cfg {Boolean} Отображение крестика для сброса текста
             */
            resetCross: false
         }
      },

      $constructor: function() {
         this._publish('onChangeText');
         var self = this;
         this._inputField = $('.controls-TextBox__field', this.getContainer().get(0));
         this._container.bind('keydown',function(e){
            self._keyDownBind(e);
         });

         this._container.bind('keyup',function(e){
            self._keyUpBind(e);
         });
         // При потере фокуса делаем trim, если нужно
         // TODO Переделать на платформенное событие потери фокуса
         if (self._options.trim) {
            self._inputField.bind('focusout', function () {
               self.setText(self._trim(self.getText()));
            });
         }
      },

      setText: function(text){
         //перед изменением делаем trim если нужно
         text = this._trim(text);
         TextBox.superclass.setText.call(this, text);
         $('.controls-TextBox__field', this.getContainer().get(0)).attr('value', text || '');
      },

      setMaxLength: function(num) {
         TextBox.superclass.setMaxLength.call(this, num);
         $('.controls-TextBox__field', this.getContainer().get(0)).attr('maxlength',num);
      },

      setPlaceholder: function(text){
         TextBox.superclass.setPlaceholder.call(this, text);
         $('.controls-TextBox__field', this.getContainer().get(0)).attr('placeholder', text);
      },

      _keyUpBind: function() {
         this._options.text = this._inputField.val();
         this._notify('onChangeText', this._options.text);
      },

      _keyDownBind: function() {
      },

      _trim: function(text){
         if (this._options.trim){
            text = String.trim(text);
         }
        return text;
      }
   });

   return TextBox;

});