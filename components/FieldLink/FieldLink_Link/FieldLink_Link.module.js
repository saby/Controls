define('js!SBIS3.CONTROLS.FieldLink.Link', [
      'js!WSControls/Buttons/ButtonBase',
      'tmpl!SBIS3.CONTROLS.FieldLink.Link',
      'css!SBIS3.CONTROLS.FieldLink.Link'
   ],
   function(ButtonBase, dotTplFn) {
      
      'use strict';
      
      /**
       * Сслыка, которая может использоваться в качестве метки поля связи.
       * Так же можно положить её в placeholder поля связи.
       * Клик по ссылке посылает комманду showSelector. Если ссылка используется в качестве метки,
       * то нужно задать опцию {@link owner}, чтобы комманду обработало поле связи с имененем, указанном в {@link owner}.
       * @class SBIS3.CONTROLS.FieldLink.Link
       * @extends WSControls/Buttons/ButtonBase
       * @author Герасимов Александр Максимович
       *
       * @cssModifier controls-FieldLink-Link__filterButton Стилизация ссылки для кнопки фильтров.
       *
       * @control
       * @public
       */
      
      var FieldLink_Link = ButtonBase.extend({
         _dotTplFn: dotTplFn,
         $constructor: function() {
            this._options.command = 'showSelector';
            // Если ссылка находится внутри поля связи (placeholder) фокус принимать она не должна.
            this._options.activableByClick = false;
            this.setTabindex(0);
         },
         setCaption: function() {
            FieldLink_Link.superclass.setCaption.apply(this, arguments);
            this.getContainer().html(this._options.caption);
         },
         setEnabled: function(enabled) {
            FieldLink_Link.superclass.setEnabled.apply(this, arguments);
            this.getContainer()
               .toggleClass('controls-FieldLink__Link_enabled', enabled)
               .toggleClass('controls-FieldLink__Link_disabled', !enabled);
         }
      });
      
      return FieldLink_Link;
   });
