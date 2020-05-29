import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_filterPopup/Panel/Text/Text');

   /**
    * Контрол, отображающий текст с кнопкой сброса в виде крестика.
    * Используется для демонстрации пользователю выбранного фильтра, клик по крестику сбрасывает фильтр.
    * 
    * @remark
    * Полезные ссылки:
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filterPopup.less">переменные тем оформления</a>
    * 
    * @class Controls/_filterPopup/Panel/Text
    * @extends Core/Control
    * @mixes Controls/_interface/ITextValue
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
class Text extends Control<IControlOptions> {
      protected _template: TemplateFunction = template;
      protected  _afterMount(): void {
         this._notify('valueChanged', [this._options.value]);
         this._notify('textValueChanged', [this._options.caption]);
      }

      protected _resetHandler(): void {
         this._notify('visibilityChanged', [false]);
      }

      static _theme: string[] = ['Controls/filterPopup'];

      static getDefaultOptions(): object {
         return {
            value: true
         };
      }
   }

export default Text;
