/**
 * Created by cheremushkin iv on 19.01.2015.
 */
define('js!SBIS3.CONTROLS.IconMixin', ['html!SBIS3.CONTROLS.IconMixin/IconTemplate'], function(IconTemplate) {

   /**
    * Миксин, добавляющий поведение хранения выбранного элемента. Всегда только одного
    * @mixin SBIS3.CONTROLS.IconMixin
    */

   var IconMixin = /**@lends SBIS3.CONTROLS.IconMixin.prototype  */{
      $protected: {
         _iconClass: '',
         _options: {
            iconClass: IconTemplate,
            /**
             * @cfg {String}  Путь до иконки
             * Путь задаётся относительно корня сайта либо через sprite.
             * @see setIcon
             * @see getIcon
             * @editor ImageEditor
             */
            icon: ''
         }
      },

      $constructor: function() {
      },

      /**
       * Установить изображение на кнопке.
       * Метод установки или замены изображения, заданного опцией {@link icon}.
       * @param {String} iconPath Путь к изображению.
       * @example
       * <pre>
       *     var btn = this.getChildControlByName("myButton");
       *        btn.setIcon("sprite:icon-16 icon-Successful icon-primary")
       * </pre>
       * @see icon
       * @see getIcon
       */
      setIcon: function(iconPath) {
         this._options.icon = iconPath;
         if (iconPath.indexOf('sprite:')>= 0) {
            this._iconClass = iconPath.substr(7);
         }
      },

      /**
       * Получить изображение на кнопке.
       * Метод получения изображения, заданного опцией {@link icon}, либо методом {@link setIcon}.
       * @example
       * <pre>
       *     var btn = this.getChildControlByName("myButton");
       *     if (/icon-Alert/g.test(btn.getIcon())){
       *        btn.setIcon("sprite:icon16 icon-Alert icon-done");
       *     }
       * </pre>
       * @see icon
       * @see setIcon
       */
      getIcon: function() {
         return this._options.icon;
      }
   };

   return IconMixin;

});