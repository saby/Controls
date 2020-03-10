import Control = require('Core/Control');
import template = require('wml!Controls/_filterPopup/Panel/Text/Text');
import 'css!theme?Controls/filterPopup';

/**
    * Контрол, отображающий текст с кнопкой сброса в виде крестика.
    * Используется для демонстрации пользователю выбранного фильтра, клик по крестику сбрасывает фильтр.
    * @class Controls/_filterPopup/Panel/Text
    * @extends Core/Control
    * @mixes Controls/_interface/ITextValue
    * @control
    * @public
    * @author Герасимов А.М.
    */

   /*
    * Control with caption and reset button.
    * Is used for demonstration of selected filter, click on cross will reset filter
    * @class Controls/_filterPopup/Panel/Text
    * @extends Core/Control
    * @control
    * @public
    * @author Герасимов А.М.
    */

   /**
    * @name Controls/_filterPopup/Panel/Text#caption
    * @cfg {String} Caption Текст, который будет отображаться рядом с кнопкой сброса.
    * @example
    * <pre>
    *    <Controls.filterPopup:Text>
    *        <ws:caption>По удалённым</ws:caption>
    *    </Controls.filterPopup:Text>
    * </pre>
    */

   /*
    * @name Controls/_filterPopup/Panel/Text#caption
    * @cfg {String} Caption Control caption text.
    * @example
    * <pre>
    *    <Controls.filterPopup:Text>
    *        <ws:caption>По удалённым</ws:caption>
    *    </Controls.filterPopup:Text>
    * </pre>
    */
   /**
    * @name Controls/_filterPopup/Panel/Text#value
    * @cfg {*} [value=true] Значение, которое будет установлено в конфигурацию фильтра после построения контрола.
    * @example
    * <pre>
    *    <Controls.filterPopup:Text>
    *        <ws:value>-2</ws:value>
    *    </Controls.filterPopup:Text>
    * </pre>
    */

   var Text = Control.extend({
      _template: template,

      _afterMount: function() {
         this._notify('valueChanged', [this._options.value]);
         this._notify('textValueChanged', [this._options.caption]);
      },

      _resetHandler: function() {
         this._notify('visibilityChanged', [false]);
      }

   });

   Text.getDefaultOptions = function() {
      return {
         value: true
      };
   };

   export = Text;


