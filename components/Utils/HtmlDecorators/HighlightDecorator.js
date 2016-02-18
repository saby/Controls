define(['js!SBIS3.CONTROLS.Utils.HtmlDecorators/AbstractDecorator'], function (AbstractDecorator) {
   'use strict';

   /**
    * Декоратор текста, обеспечивающий подсветку фразы
    * @class SBIS3.CONTROLS.Utils.HtmlDecorators/HighlightDecorator
    * @public
    * @author Мальцев Алексей Александрович
    */
   var HighlightDecorator = AbstractDecorator.extend(/** @lends SBIS3.CONTROLS.Utils.HtmlDecorators/HighlightDecorator.prototype */{
      $protected: {
         _name: 'highlight',
         _options: {
            /**
             * @cfg {String} CSS класс для подсветки
             */
            cssClass: 'controls-HtmlDecorators-highlight',

            /**
             * @cfg {String} Метод контрола, позволяющий получить текст для подсветки
             */
            textGetter: ''
         },
         /**
          * @var {String} Подсвечиваемая фраза
          */
         _text: ''
      },

      $constructor: function () {
      },

      /**
       * Обновляет настройки декоратора
       * @param {Object} control Экземпляр контрола
       */
      update: function (control) {
         HighlightDecorator.superclass.update.apply(this, arguments);

         if (this._options.textGetter) {
            this._text = control[this._options.textGetter]();
         }
      },

      checkCondition: function(obj) {
         this._options.enabled = obj ? !!obj['highlight'] : false;
         return this._options.enabled;
      },

      /**
       * Применяет декоратор
       * @param {*} value Текст для декорирования
       * @returns {*}
       */
      apply: function (value) {
         if (!this._options.enabled) {
            return value;
         }

         return this.getHighlighted(
            value,
            this._text,
            this._options.cssClass
         );
      },

      /**
       * Вставляет в текст разметку, отображающую фразу подсвеченной
       * @param {*} text Текст
       * @param {String} highlight Фраза для подсветки
       * @param {String} cssClass CSS класс, обеспечивающий подсветку
       * @returns {String}
       */
      getHighlighted: function (text, highlight, cssClass) {
         if (!text || !highlight) {
            return text;
         }
         text = '' + text;
         highlight = $ws.helpers.escapeHtml('' + highlight)
            .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

         return text.replace(
            new RegExp(highlight, 'gi'),
            '<span class="' + cssClass + '">$&</span>'
         );
      }
   });

   return HighlightDecorator;
});
